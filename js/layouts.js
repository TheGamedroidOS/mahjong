// Layout definitions and management
class LayoutManager {
    constructor() {
        this.layouts = {
            turtle: this.createTurtleLayout(),
            dragon: this.createDragonLayout(),
            castle: this.createCastleLayout(),
            pyramid: this.createPyramidLayout()
        };
    }
    
    getLayout(name) {
        return this.layouts[name] || this.layouts.turtle;
    }
    
    createTurtleLayout() {
        const positions = [];
        
        // Layer 0 (bottom)
        // Body
        for (let x = 2; x <= 12; x += 2) {
            for (let y = 2; y <= 12; y += 2) {
                positions.push({ x, y, z: 0 });
            }
        }
        
        // Layer 1
        for (let x = 4; x <= 10; x += 2) {
            for (let y = 4; y <= 10; y += 2) {
                positions.push({ x, y, z: 1 });
            }
        }
        
        // Layer 2
        for (let x = 6; x <= 8; x += 2) {
            for (let y = 6; y <= 8; y += 2) {
                positions.push({ x, y, z: 2 });
            }
        }
        
        // Head and tail
        positions.push({ x: 0, y: 6, z: 0 });
        positions.push({ x: 0, y: 8, z: 0 });
        positions.push({ x: 14, y: 6, z: 0 });
        positions.push({ x: 14, y: 8, z: 0 });
        
        return positions;
    }
    
    createDragonLayout() {
        const positions = [];
        
        // Create a dragon-like shape
        const dragonPattern = [
            // Layer 0
            [
                [0,0,0,1,1,1,1,0,0,0],
                [0,0,1,1,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,1,1,0],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,1,1],
                [0,1,1,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,1,1,0,0],
                [0,0,0,1,1,1,1,0,0,0]
            ],
            // Layer 1
            [
                [0,0,0,0,1,1,0,0,0,0],
                [0,0,0,1,1,1,1,0,0,0],
                [0,0,1,1,1,1,1,1,0,0],
                [0,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,0],
                [0,1,1,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,1,1,0,0],
                [0,0,0,1,1,1,1,0,0,0],
                [0,0,0,0,1,1,0,0,0,0]
            ],
            // Layer 2
            [
                [0,0,0,0,0,1,0,0,0,0],
                [0,0,0,0,1,1,1,0,0,0],
                [0,0,0,1,1,1,1,1,0,0],
                [0,0,1,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,1,1,1,0],
                [0,0,1,1,1,1,1,1,1,0],
                [0,0,0,1,1,1,1,1,0,0],
                [0,0,0,0,1,1,1,0,0,0],
                [0,0,0,0,0,1,0,0,0,0]
            ]
        ];
        
        dragonPattern.forEach((layer, z) => {
            layer.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if (cell === 1) {
                        positions.push({ x: x * 2, y: y * 2, z });
                    }
                });
            });
        });
        
        return positions;
    }
    
    createCastleLayout() {
        const positions = [];
        
        // Create a castle-like structure
        // Walls
        for (let x = 0; x <= 16; x += 2) {
            positions.push({ x, y: 0, z: 0 });
            positions.push({ x, y: 14, z: 0 });
        }
        
        for (let y = 2; y <= 12; y += 2) {
            positions.push({ x: 0, y, z: 0 });
            positions.push({ x: 16, y, z: 0 });
        }
        
        // Inner structure
        for (let x = 4; x <= 12; x += 2) {
            for (let y = 4; y <= 10; y += 2) {
                positions.push({ x, y, z: 0 });
            }
        }
        
        // Towers
        for (let z = 1; z <= 3; z++) {
            positions.push({ x: 2, y: 2, z });
            positions.push({ x: 14, y: 2, z });
            positions.push({ x: 2, y: 12, z });
            positions.push({ x: 14, y: 12, z });
        }
        
        // Central keep
        for (let z = 1; z <= 2; z++) {
            for (let x = 6; x <= 10; x += 2) {
                for (let y = 6; y <= 8; y += 2) {
                    positions.push({ x, y, z });
                }
            }
        }
        
        return positions;
    }
    
    createPyramidLayout() {
        const positions = [];
        
        // Create a pyramid structure
        const layers = [
            { size: 7, offset: 0 },
            { size: 5, offset: 2 },
            { size: 3, offset: 4 },
            { size: 1, offset: 6 }
        ];
        
        layers.forEach((layer, z) => {
            for (let x = layer.offset; x < layer.offset + layer.size * 2; x += 2) {
                for (let y = layer.offset; y < layer.offset + layer.size * 2; y += 2) {
                    positions.push({ x, y, z });
                }
            }
        });
        
        return positions;
    }
}

// Create global layout manager instance
window.layoutManager = new LayoutManager();