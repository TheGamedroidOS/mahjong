// Board management and tile logic
class Board {
    constructor() {
        this.tiles = [];
        this.selectedTile = null;
        this.hintedTiles = [];
        this.undoStack = [];
        this.removedTiles = 0;
        this.svg = document.getElementById('gameBoard');
    }
    
    initialize(layout) {
        this.clear();
        const positions = layoutManager.getLayout(layout);
        const tileSet = tileManager.generateTileSet();
        
        // Shuffle tiles
        this.shuffleArray(tileSet);
        
        // Create tiles with positions
        positions.forEach((pos, index) => {
            if (index < tileSet.length) {
                const tile = {
                    ...tileSet[index],
                    x: pos.x,
                    y: pos.y,
                    z: pos.z,
                    picked: false,
                    selected: false,
                    hinted: false,
                    element: null
                };
                this.tiles.push(tile);
            }
        });
        
        this.render();
        this.updateFreeTiles();
    }
    
    clear() {
        this.tiles = [];
        this.selectedTile = null;
        this.hintedTiles = [];
        this.undoStack = [];
        this.removedTiles = 0;
        this.svg.innerHTML = '<defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="3" dy="3" stdDeviation="2" flood-opacity="0.3"/></filter></defs>';
    }
    
    render() {
        // Sort tiles by z-index for proper layering
        const sortedTiles = [...this.tiles].sort((a, b) => {
            if (a.z !== b.z) return a.z - b.z;
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });
        
        sortedTiles.forEach(tile => {
            if (!tile.picked) {
                this.renderTile(tile);
            }
        });
    }
    
    renderTile(tile) {
        if (tile.element) {
            tile.element.remove();
        }
        
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('tile');
        group.setAttribute('transform', `translate(${tile.x * 8 + 50}, ${tile.y * 6 + 50})`);
        
        if (tile.selected) group.classList.add('selected');
        if (tile.hinted) group.classList.add('hinted');
        if (!this.isTileFree(tile)) group.classList.add('blocked');
        if (tile.picked) group.classList.add('picked');
        
        // Shadow
        const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shadow.setAttribute('x', '3');
        shadow.setAttribute('y', '3');
        shadow.setAttribute('width', '60');
        shadow.setAttribute('height', '80');
        shadow.setAttribute('rx', '8');
        shadow.setAttribute('ry', '8');
        shadow.setAttribute('fill', '#000');
        shadow.setAttribute('opacity', '0.3');
        
        // Tile body
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', '0');
        rect.setAttribute('width', '60');
        rect.setAttribute('height', '80');
        rect.setAttribute('rx', '8');
        rect.setAttribute('ry', '8');
        
        // Tile symbol
        const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        symbol.setAttribute('x', '30');
        symbol.setAttribute('y', '40');
        symbol.classList.add('tile-symbol');
        symbol.textContent = tileManager.getSymbol(tile.type);
        
        group.appendChild(shadow);
        group.appendChild(rect);
        group.appendChild(symbol);
        
        // Add click handler
        group.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleTileClick(tile);
        });
        
        tile.element = group;
        this.svg.appendChild(group);
    }
    
    handleTileClick(tile) {
        if (tile.picked || !this.isTileFree(tile)) {
            game.playSound('invalid');
            return;
        }
        
        if (this.selectedTile === tile) {
            // Deselect
            this.clearSelection();
            game.playSound('select');
            return;
        }
        
        if (this.selectedTile && tileManager.canMatch(this.selectedTile, tile)) {
            // Match found
            this.removeTiles(this.selectedTile, tile);
            game.playSound('match');
            this.clearSelection();
            this.clearHints();
            this.updateFreeTiles();
            
            // Check win condition
            if (this.getRemainingTiles().length === 0) {
                game.gameWon();
            } else if (this.getFreeTiles().length === 0) {
                game.gameLost();
            }
        } else {
            // Select new tile
            this.clearSelection();
            this.selectTile(tile);
            game.playSound('select');
        }
    }
    
    selectTile(tile) {
        this.selectedTile = tile;
        tile.selected = true;
        tile.element.classList.add('selected');
    }
    
    clearSelection() {
        if (this.selectedTile) {
            this.selectedTile.selected = false;
            this.selectedTile.element.classList.remove('selected');
            this.selectedTile = null;
        }
    }
    
    removeTiles(tile1, tile2) {
        // Store for undo
        this.undoStack.push([tile1, tile2]);
        
        // Remove tiles
        tile1.picked = true;
        tile2.picked = true;
        tile1.element.classList.add('picked');
        tile2.element.classList.add('picked');
        
        // Animate removal
        setTimeout(() => {
            if (tile1.element) tile1.element.remove();
            if (tile2.element) tile2.element.remove();
        }, 300);
        
        this.removedTiles += 2;
    }
    
    undo() {
        if (this.undoStack.length === 0) return false;
        
        const [tile1, tile2] = this.undoStack.pop();
        
        tile1.picked = false;
        tile2.picked = false;
        tile1.element.classList.remove('picked');
        tile2.element.classList.remove('picked');
        
        this.renderTile(tile1);
        this.renderTile(tile2);
        
        this.removedTiles -= 2;
        this.updateFreeTiles();
        
        return true;
    }
    
    shuffle() {
        const remainingTiles = this.getRemainingTiles();
        const tileTypes = remainingTiles.map(t => ({ type: t.type, id: t.id }));
        this.shuffleArray(tileTypes);
        
        remainingTiles.forEach((tile, index) => {
            tile.type = tileTypes[index].type;
            tile.id = tileTypes[index].id;
            this.renderTile(tile);
        });
        
        this.clearSelection();
        this.clearHints();
        this.updateFreeTiles();
    }
    
    hint() {
        this.clearHints();
        const freeTiles = this.getFreeTiles();
        
        // Find matching pairs
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (tileManager.canMatch(freeTiles[i], freeTiles[j])) {
                    this.hintedTiles = [freeTiles[i], freeTiles[j]];
                    freeTiles[i].hinted = true;
                    freeTiles[j].hinted = true;
                    freeTiles[i].element.classList.add('hinted');
                    freeTiles[j].element.classList.add('hinted');
                    return true;
                }
            }
        }
        
        return false; // No hints available
    }
    
    clearHints() {
        this.hintedTiles.forEach(tile => {
            tile.hinted = false;
            if (tile.element) {
                tile.element.classList.remove('hinted');
            }
        });
        this.hintedTiles = [];
    }
    
    isTileFree(tile) {
        if (tile.picked) return false;
        
        // Check if tile has tiles above it
        const tilesAbove = this.tiles.filter(t => 
            !t.picked && 
            t.z === tile.z + 1 && 
            Math.abs(t.x - tile.x) <= 1 && 
            Math.abs(t.y - tile.y) <= 1
        );
        
        if (tilesAbove.length > 0) return false;
        
        // Check if tile has free sides
        const leftBlocked = this.tiles.some(t => 
            !t.picked && 
            t.z === tile.z && 
            t.x === tile.x - 2 && 
            Math.abs(t.y - tile.y) <= 1
        );
        
        const rightBlocked = this.tiles.some(t => 
            !t.picked && 
            t.z === tile.z && 
            t.x === tile.x + 2 && 
            Math.abs(t.y - tile.y) <= 1
        );
        
        return !leftBlocked || !rightBlocked;
    }
    
    getFreeTiles() {
        return this.tiles.filter(tile => !tile.picked && this.isTileFree(tile));
    }
    
    getRemainingTiles() {
        return this.tiles.filter(tile => !tile.picked);
    }
    
    updateFreeTiles() {
        this.tiles.forEach(tile => {
            if (tile.element) {
                if (this.isTileFree(tile) && !tile.picked) {
                    tile.element.classList.remove('blocked');
                } else if (!tile.picked) {
                    tile.element.classList.add('blocked');
                }
            }
        });
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    hasValidMoves() {
        const freeTiles = this.getFreeTiles();
        
        for (let i = 0; i < freeTiles.length; i++) {
            for (let j = i + 1; j < freeTiles.length; j++) {
                if (tileManager.canMatch(freeTiles[i], freeTiles[j])) {
                    return true;
                }
            }
        }
        
        return false;
    }
}

// Create global board instance
window.board = new Board();