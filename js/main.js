// Main application initialization and utilities
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the game
    console.log('Mahjong Solitaire - Initializing...');
    
    // Apply saved settings
    game.applySettings();
    
    // Show welcome message
    game.showMessage('Welcome to Mahjong Solitaire', 'Click to start a new game');
    
    // Add click handler to start game when message is clicked
    document.getElementById('gameMessage').addEventListener('click', () => {
        if (game.state === 'idle') {
            game.newGame();
        } else {
            game.hideMessage();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        // Recalculate board dimensions if needed
        board.updateFreeTiles();
    }, 250));
    
    // Prevent context menu on game board
    document.getElementById('gameBoard').addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Handle visibility change (pause when tab is hidden)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.state === 'running') {
            game.pause();
        }
    });
    
    console.log('Mahjong Solitaire - Ready!');
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle clicks outside dialogs to close them
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('overlay')) {
        // Clicked on overlay background
        const overlay = e.target;
        overlay.classList.add('hidden');
        
        if (game.state === 'paused') {
            game.resume();
        }
    }
});

// Prevent clicks on overlay popups from closing the dialog
document.addEventListener('click', (e) => {
    if (e.target.closest('.overlay-popup')) {
        e.stopPropagation();
    }
});

// Add some visual feedback for interactions
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.link')) {
        e.target.closest('.link').style.transform = 'scale(0.95)';
    }
});

document.addEventListener('mouseup', (e) => {
    if (e.target.closest('.link')) {
        e.target.closest('.link').style.transform = '';
    }
});

// Performance monitoring
let frameCount = 0;
let lastTime = performance.now();

function updatePerformance() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
        // Update FPS counter if needed
        frameCount = 0;
        lastTime = currentTime;
    }
    
    requestAnimationFrame(updatePerformance);
}

// Start performance monitoring
requestAnimationFrame(updatePerformance);