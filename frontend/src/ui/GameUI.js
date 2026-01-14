class GameUI {
    constructor() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            startScreen: document.getElementById('start-screen'),
            bikeSelectionScreen: document.getElementById('bike-selection-screen'),
            modeSelectionScreen: document.getElementById('mode-selection-screen'),
            gameScreen: document.getElementById('game-screen'),
            gameoverScreen: document.getElementById('gameover-screen'),

            loadingText: document.getElementById('loading-text'),
            playerNameInput: document.getElementById('player-name'),
            startButton: document.getElementById('start-button'),

            bikeCards: document.querySelectorAll('.bike-card'),
            bikeBackButton: document.getElementById('bike-back-button'),

            modeEndlessBtn: document.getElementById('mode-endless'),
            modeTimedBtn: document.getElementById('mode-timed'),
            modeBackButton: document.getElementById('mode-back-button'),

            speedValue: document.getElementById('speed-value'),
            distanceValue: document.getElementById('distance-value'),
            timerValue: document.getElementById('timer-value'),
            timerDisplay: document.getElementById('timer-display'),
            handStatus: document.getElementById('hand-status'),

            finalDistance: document.getElementById('final-distance'),
            finalMaxSpeed: document.getElementById('final-max-speed'),
            finalTime: document.getElementById('final-time'),
            leaderboardList: document.getElementById('leaderboard-list'),

            retryButton: document.getElementById('retry-button'),
            menuButton: document.getElementById('menu-button')
        };

        this.currentMode = null;
        this.selectedBike = 'ninja-h2';
    }

    updateLoadingText(text) {
        this.elements.loadingText.textContent = text;
    }

    showScreen(screenName) {
        Object.values(this.elements).forEach(el => {
            if (el && el.classList && el.classList.contains('screen')) {
                el.classList.add('hidden');
            }
        });

        const screen = this.elements[`${screenName}Screen`];
        if (screen) {
            screen.classList.remove('hidden');
        }
    }

    getPlayerName() {
        return this.elements.playerNameInput.value.trim() || 'RIDER';
    }

    onStartButton(callback) {
        this.elements.startButton.addEventListener('click', callback);
    }

    onBikeSelect(callback) {
        this.elements.bikeCards.forEach(card => {
            card.addEventListener('click', () => {
                this.elements.bikeCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.selectedBike = card.dataset.bike;
                callback(this.selectedBike);
            });
        });
    }

    onBikeBack(callback) {
        this.elements.bikeBackButton.addEventListener('click', callback);
    }

    onModeSelect(callback) {
        this.elements.modeEndlessBtn.addEventListener('click', () => {
            this.currentMode = 'endless';
            callback('endless');
        });

        this.elements.modeTimedBtn.addEventListener('click', () => {
            this.currentMode = 'timed';
            callback('timed');
        });
    }

    onModeBack(callback) {
        this.elements.modeBackButton.addEventListener('click', callback);
    }

    onRetry(callback) {
        this.elements.retryButton.addEventListener('click', callback);
    }

    onMainMenu(callback) {
        this.elements.menuButton.addEventListener('click', callback);
    }

    updateSpeed(speed) {
        this.elements.speedValue.textContent = speed;
    }

    updateDistance(distance) {
        this.elements.distanceValue.textContent = distance;
    }

    updateTimer(timeRemaining) {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);
        this.elements.timerValue.textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this.currentMode === 'timed') {
            this.elements.timerDisplay.classList.remove('hidden');
        } else {
            this.elements.timerDisplay.classList.add('hidden');
        }
    }

    updateHandStatus(handStatus) {
        let statusText = '';
        let statusColor = '#ff3366';

        if (!handStatus.bothDetected) {
            statusText = 'DETECTING HANDS...';
            statusColor = '#ff3366';
        } else {
            const bothOpen = !handStatus.leftFistClosed && !handStatus.rightFistClosed;
            const bothClosed = handStatus.leftFistClosed && handStatus.rightFistClosed;
            const leftOnly = handStatus.leftFistClosed && !handStatus.rightFistClosed;
            const rightOnly = !handStatus.leftFistClosed && handStatus.rightFistClosed;

            if (bothOpen) {
                statusText = 'THROTTLE ⚡ (Both Open)';
                statusColor = '#00ff00';
            } else if (bothClosed) {
                statusText = 'BRAKING 🛑 (Both Closed)';
                statusColor = '#ff9500';
            } else if (leftOnly) {
                statusText = '← LEFT LANE (Left Closed)';
                statusColor = '#00f3ff';
            } else if (rightOnly) {
                statusText = 'RIGHT LANE → (Right Closed)';
                statusColor = '#00f3ff';
            }
        }

        this.elements.handStatus.textContent = statusText;
        this.elements.handStatus.style.color = statusColor;
    }

    async showGameOver(stats) {
        this.showScreen('gameover');

        this.elements.finalDistance.textContent = `${stats.distance} M`;
        this.elements.finalMaxSpeed.textContent = `${stats.maxSpeed} KM/H`;

        const minutes = Math.floor(stats.time / 60);
        const seconds = stats.time % 60;
        this.elements.finalTime.textContent =
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        this.elements.leaderboardList.innerHTML =
            '<div style="text-align: center; padding: 1rem; color: #8b9dc3;">Loading leaderboard...</div>';
    }
}

export default GameUI;
