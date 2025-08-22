// Main game logic and state management
class Game {
    constructor() {
        this.state = 'idle'; // idle, running, paused, won, lost
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timer = null;
        this.currentLayout = 'turtle';
        this.currentTheme = 'green';
        this.soundEnabled = true;
        this.settings = this.loadSettings();
        
        this.applySettings();
        this.setupKeyboardControls();
    }
    
    newGame() {
        this.state = 'running';
        this.startTime = Date.now();
        this.elapsedTime = 0;
        this.startTimer();
        
        board.initialize(this.currentLayout);
        this.updateUI();
        this.hideMessage();
    }
    
    togglePause() {
        if (this.state === 'running') {
            this.pause();
        } else if (this.state === 'paused') {
            this.resume();
        }
    }
    
    pause() {
        if (this.state !== 'running') return;
        
        this.state = 'paused';
        this.stopTimer();
        document.body.classList.add('game-paused');
        this.showMessage('Game Paused', 'Click to continue...');
    }
    
    resume() {
        if (this.state !== 'paused') return;
        
        this.state = 'running';
        this.startTime = Date.now() - this.elapsedTime;
        this.startTimer();
        document.body.classList.remove('game-paused');
        this.hideMessage();
    }
    
    gameWon() {
        this.state = 'won';
        this.stopTimer();
        document.body.classList.add('game-over');
        
        const timeStr = this.formatTime(this.elapsedTime);
        this.showMessage('Congratulations!', `You won in ${timeStr}`);
        this.playSound('win');
        
        // Save best time
        this.saveBestTime();
    }
    
    gameLost() {
        this.state = 'lost';
        this.stopTimer();
        document.body.classList.add('game-over');
        this.showMessage('Game Over', 'No more moves available');
        this.playSound('lose');
    }
    
    undo() {
        if (this.state !== 'running') return;
        
        if (board.undo()) {
            this.updateUI();
        }
    }
    
    shuffle() {
        if (this.state !== 'running') return;
        
        board.shuffle();
        this.updateUI();
    }
    
    hint() {
        if (this.state !== 'running') return;
        
        if (!board.hint()) {
            this.showMessage('No Hints', 'No valid moves available');
        }
    }
    
    // Timer management
    startTimer() {
        this.timer = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateTimeDisplay();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateTimeDisplay() {
        const timeElement = document.getElementById('gameTime');
        timeElement.textContent = this.formatTime(this.elapsedTime);
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateUI() {
        const remaining = board.getRemainingTiles().length;
        const free = board.getFreeTiles().length;
        
        document.getElementById('tileCount').textContent = remaining;
        document.getElementById('freeCount').textContent = free;
        
        // Update undo button state
        const undoBtn = document.getElementById('undoBtn');
        undoBtn.disabled = board.undoStack.length === 0;
    }
    
    // Dialog management
    toggleHelp() {
        this.toggleDialog('helpDialog');
    }
    
    toggleSettings() {
        this.toggleDialog('settingsDialog');
    }
    
    toggleInfo() {
        // Could implement tile information dialog
        this.showMessage('Tile Info', 'Click matching tiles to remove them');
    }
    
    toggleDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        const wasVisible = !dialog.classList.contains('hidden');
        
        // Hide all dialogs first
        document.querySelectorAll('.overlay').forEach(overlay => {
            overlay.classList.add('hidden');
        });
        
        if (!wasVisible) {
            dialog.classList.remove('hidden');
            if (this.state === 'running') {
                this.pause();
            }
        } else if (this.state === 'paused') {
            this.resume();
        }
    }
    
    showMessage(title, subtitle = '') {
        const messageDialog = document.getElementById('gameMessage');
        const messageText = document.getElementById('messageText');
        const messageTime = document.getElementById('messageTime');
        
        messageText.textContent = title;
        messageTime.textContent = subtitle;
        messageDialog.classList.remove('hidden');
    }
    
    hideMessage() {
        const messageDialog = document.getElementById('gameMessage');
        messageDialog.classList.add('hidden');
        
        if (this.state === 'paused') {
            this.resume();
        } else if (this.state === 'won' || this.state === 'lost') {
            this.newGame();
        }
    }
    
    // Settings management
    changeTheme(theme) {
        this.currentTheme = theme;
        document.body.className = `theme-${theme}`;
        this.saveSettings();
    }
    
    changeLayout(layout) {
        this.currentLayout = layout;
        this.saveSettings();
        if (this.state !== 'idle') {
            this.newGame();
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateSoundButton();
        this.saveSettings();
    }
    
    toggleSoundSetting(enabled) {
        this.soundEnabled = enabled;
        this.updateSoundButton();
        this.saveSettings();
    }
    
    updateSoundButton() {
        const soundBtn = document.getElementById('soundBtn');
        const soundCheckbox = document.getElementById('soundEnabled');
        
        soundBtn.innerHTML = this.soundEnabled ? 
            '<i class="icon">🔊</i>' : 
            '<i class="icon">🔇</i>';
        
        if (soundCheckbox) {
            soundCheckbox.checked = this.soundEnabled;
        }
    }
    
    // Sound effects
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different frequencies for different sounds
            const frequencies = {
                select: 800,
                match: 1200,
                invalid: 300,
                win: 1500,
                lose: 200
            };
            
            oscillator.frequency.setValueAtTime(frequencies[type] || 600, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // Fallback for browsers without Web Audio API
            console.log(`Sound: ${type}`);
        }
    }
    
    // Keyboard controls
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }
            
            switch (e.key.toLowerCase()) {
                case 'h':
                    this.toggleHelp();
                    break;
                case 'p':
                case ' ':
                    this.togglePause();
                    break;
                case 'u':
                    this.undo();
                    break;
                case 't':
                    this.hint();
                    break;
                case 'n':
                    this.newGame();
                    break;
                case 'm':
                    this.shuffle();
                    break;
                case 's':
                    this.toggleSettings();
                    break;
                case 'escape':
                    // Close any open dialog
                    document.querySelectorAll('.overlay').forEach(overlay => {
                        overlay.classList.add('hidden');
                    });
                    if (this.state === 'paused') {
                        this.resume();
                    }
                    break;
            }
        });
    }
    
    // Settings persistence
    loadSettings() {
        try {
            const saved = localStorage.getItem('mahjong-settings');
            return saved ? JSON.parse(saved) : {
                theme: 'green',
                layout: 'turtle',
                soundEnabled: true,
                bestTimes: {}
            };
        } catch (e) {
            return {
                theme: 'green',
                layout: 'turtle',
                soundEnabled: true,
                bestTimes: {}
            };
        }
    }
    
    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            layout: this.currentLayout,
            soundEnabled: this.soundEnabled,
            bestTimes: this.settings.bestTimes || {}
        };
        
        try {
            localStorage.setItem('mahjong-settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Could not save settings');
        }
        
        this.settings = settings;
    }
    
    applySettings() {
        this.currentTheme = this.settings.theme || 'green';
        this.currentLayout = this.settings.layout || 'turtle';
        this.soundEnabled = this.settings.soundEnabled !== false;
        
        document.body.className = `theme-${this.currentTheme}`;
        
        // Update UI elements
        const themeSelect = document.getElementById('themeSelect');
        const layoutSelect = document.getElementById('layoutSelect');
        
        if (themeSelect) themeSelect.value = this.currentTheme;
        if (layoutSelect) layoutSelect.value = this.currentLayout;
        
        this.updateSoundButton();
    }
    
    saveBestTime() {
        const key = this.currentLayout;
        const currentTime = this.elapsedTime;
        
        if (!this.settings.bestTimes[key] || this.settings.bestTimes[key] > currentTime) {
            this.settings.bestTimes[key] = currentTime;
            this.saveSettings();
        }
    }
    
    getBestTime(layout) {
        return this.settings.bestTimes[layout] || null;
    }
}

// Create global game instance
window.game = new Game();