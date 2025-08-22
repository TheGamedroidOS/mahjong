// Tile definitions and management
class TileManager {
    constructor() {
        this.tileTypes = {
            // Circles (Dots)
            'do1': '🀙', 'do2': '🀚', 'do3': '🀛', 'do4': '🀜', 'do5': '🀝',
            'do6': '🀞', 'do7': '🀟', 'do8': '🀠', 'do9': '🀡',
            
            // Bamboo
            'ba1': '🀐', 'ba2': '🀑', 'ba3': '🀒', 'ba4': '🀓', 'ba5': '🀔',
            'ba6': '🀕', 'ba7': '🀖', 'ba8': '🀗', 'ba9': '🀘',
            
            // Characters
            'ch1': '🀇', 'ch2': '🀈', 'ch3': '🀉', 'ch4': '🀊', 'ch5': '🀋',
            'ch6': '🀌', 'ch7': '🀍', 'ch8': '🀎', 'ch9': '🀏',
            
            // Winds
            'wi_east': '🀀', 'wi_south': '🀁', 'wi_west': '🀂', 'wi_north': '🀃',
            
            // Dragons
            'dr_red': '🀄', 'dr_green': '🀅', 'dr_white': '🀆',
            
            // Seasons (can match within group)
            'se_spring': '🀦', 'se_summer': '🀧', 'se_fall': '🀨', 'se_winter': '🀩',
            
            // Flowers (can match within group)
            'fl_plum': '🀢', 'fl_orchid': '🀣', 'fl_chrysanthemum': '🀤', 'fl_bamboo': '🀥'
        };
        
        this.groups = {
            seasons: ['se_spring', 'se_summer', 'se_fall', 'se_winter'],
            flowers: ['fl_plum', 'fl_orchid', 'fl_chrysanthemum', 'fl_bamboo']
        };
    }
    
    getSymbol(tileType) {
        return this.tileTypes[tileType] || '🀫';
    }
    
    canMatch(tile1, tile2) {
        if (tile1.type === tile2.type) {
            return true;
        }
        
        // Check if both tiles are in the same special group (seasons or flowers)
        for (const group of Object.values(this.groups)) {
            if (group.includes(tile1.type) && group.includes(tile2.type)) {
                return true;
            }
        }
        
        return false;
    }
    
    generateTileSet() {
        const tiles = [];
        
        // Standard tiles (4 of each)
        const standardTiles = [
            'do1', 'do2', 'do3', 'do4', 'do5', 'do6', 'do7', 'do8', 'do9',
            'ba1', 'ba2', 'ba3', 'ba4', 'ba5', 'ba6', 'ba7', 'ba8', 'ba9',
            'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9',
            'wi_east', 'wi_south', 'wi_west', 'wi_north',
            'dr_red', 'dr_green', 'dr_white'
        ];
        
        standardTiles.forEach(type => {
            for (let i = 0; i < 4; i++) {
                tiles.push({ type, id: `${type}_${i}` });
            }
        });
        
        // Special tiles (1 of each)
        const specialTiles = ['se_spring', 'se_summer', 'se_fall', 'se_winter',
                             'fl_plum', 'fl_orchid', 'fl_chrysanthemum', 'fl_bamboo'];
        
        specialTiles.forEach(type => {
            tiles.push({ type, id: type });
        });
        
        return tiles;
    }
}

// Create global tile manager instance
window.tileManager = new TileManager();