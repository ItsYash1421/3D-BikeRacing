import GameEngine from './core/GameEngine.js';
import HandTracker from './tracking/HandTracker.js';
import GameUI from './ui/GameUI.js';

class BikeRacingGame {
    constructor() {
        this.ui = new GameUI();
        this.gameEngine = null;
        this.handTracker = null;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        try {
            this.ui.updateLoadingText('Initializing game engine...');
            const canvas = document.getElementById('game-canvas');
            this.gameEngine = new GameEngine(canvas);

            this.ui.updateLoadingText('Initializing hand tracking...');
            const video = document.getElementById('video');
            const handCanvas = document.getElementById('hand-canvas');
            this.handTracker = new HandTracker(video, handCanvas);

            await this.handTracker.init();

            this.ui.updateLoadingText('Ready!');

            this.setupEventListeners();
            this.setupHandTracking();
            this.setupGameCallbacks();
            this.setupKeyboardControls();

            this.isInitialized = true;

            setTimeout(() => {
                this.ui.showScreen('start');
            }, 500);

        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.updateLoadingText('Error: ' + error.message);

            setTimeout(() => {
                this.ui.showScreen('start');
            }, 2000);
        }
    }

    setupEventListeners() {
        this.ui.onStartButton(() => {
            this.ui.showScreen('bikeSelection');
        });

        this.ui.onBikeSelect((bikeType) => {
            console.log('Bike selected:', bikeType);
        });

        this.ui.onBikeBack(() => {
            this.ui.showScreen('start');
        });

        this.ui.onModeSelect((mode) => this.startGame(mode));

        this.ui.onModeBack(() => {
            this.ui.showScreen('bikeSelection');
        });

        this.ui.elements.bikeCards.forEach(card => {
            card.addEventListener('click', () => {
                setTimeout(() => {
                    this.ui.showScreen('modeSelection');
                }, 300);
            });
        });

        this.ui.onRetry(() => this.startGame(this.ui.currentMode));
        this.ui.onMainMenu(() => this.ui.showScreen('start'));
    }

    setupHandTracking() {
        if (!this.handTracker) return;

        this.handTracker.onHandUpdate = (handStatus) => {
            if (this.gameEngine) {
                this.gameEngine.updateHandStatus(handStatus);
                this.ui.updateHandStatus(handStatus);
            }
        };

        this.handTracker.onLaneSwitch = (direction) => {
            if (this.gameEngine) {
                this.gameEngine.switchLane(direction);
            }
        };
    }

    setupKeyboardControls() {

        document.addEventListener('keydown', (e) => {
            if (this.gameEngine && this.gameEngine.gameState === 'playing') {
                if (e.key === 'ArrowLeft') {
                    this.gameEngine.switchLane(-1);
                } else if (e.key === 'ArrowRight') {
                    this.gameEngine.switchLane(1);
                }
            }
        });
    }

    setupGameCallbacks() {
        if (!this.gameEngine) return;

        this.gameEngine.onScoreUpdate = (speed, distance) => {
            this.ui.updateSpeed(speed);
            this.ui.updateDistance(distance);
        };

        this.gameEngine.onTimeUpdate = (timeRemaining) => {
            this.ui.updateTimer(timeRemaining);
        };

        this.gameEngine.onGameOver = async (stats) => {
            await this.ui.showGameOver(stats);
        };
    }

    startGame(mode) {
        const playerName = this.ui.getPlayerName();
        const bikeType = this.ui.selectedBike;

        this.ui.updateSpeed(0);
        this.ui.updateDistance(0);
        this.ui.updateTimer(120);

        this.ui.showScreen('game');

        if (this.gameEngine) {
            this.gameEngine.start(playerName, mode, bikeType);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BikeRacingGame();
});
