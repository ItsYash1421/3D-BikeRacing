import * as THREE from 'three';
import Bike from '../game/Bike.js';
import Road from '../game/Road.js';
import TrafficManager from '../game/TrafficManager.js';
import AudioManager from '../game/AudioManager.js';

// Main Engine with Audio & Controls Debounce
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.gameState = 'stopped';
        this.gameMode = null;
        this.playerName = '';
        this.selectedBike = 'ninja-h2';
        this.clock = new THREE.Clock();
        this.elapsedTime = 0;
        this.gameTime = 120;
        this.maxSpeed = 0;

        this.shouldAccelerate = false;
        this.shouldBrake = false;

        // Control Debouncing
        this.lastBrakeTime = 0; // Timestamp when braking stopped

        this.audioManager = new AudioManager();

        this.onScoreUpdate = null;
        this.onTimeUpdate = null;
        this.onGameOver = null;

        this.initThreeJS();
    }

    initThreeJS() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27); // Dark theme to match app UI
        this.scene.fog = new THREE.Fog(0x0a0e27, 20, 150);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 15, 10);
        this.scene.add(dirLight);

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupGame(bikeType) {
        if (this.bike) this.bike.destroy();
        if (this.road) {
            this.road.segments.forEach(seg => { this.scene.remove(seg); }); // Simplified cleanup
            this.road = null;
        }
        if (this.trafficManager) {
            this.trafficManager.reset();
            this.trafficManager = null;
        }

        this.scene.add(this.camera);
        this.bike = new Bike(this.scene, this.camera, bikeType);
        this.road = new Road(this.scene);
        this.trafficManager = new TrafficManager(this.scene, this.road);

        // Start Audio
        this.audioManager.init();
    }

    start(playerName, mode, bikeType) {
        this.playerName = playerName;
        this.gameMode = mode;
        this.selectedBike = bikeType;
        this.gameState = 'playing';
        this.elapsedTime = 0;
        this.maxSpeed = 0;
        this.setupGame(bikeType);
        this.bike.reset();
        this.road.reset();
        this.clock.start();
        this.animate();
    }

    animate() {
        if (this.gameState !== 'playing') return;
        requestAnimationFrame(() => this.animate());
        const delta = Math.min(this.clock.getDelta(), 0.05);
        this.elapsedTime += delta;
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
    }

    update(delta) {
        this.bike.update(delta, this.shouldAccelerate, this.shouldBrake);
        if (this.bike.getSpeed() > this.maxSpeed) this.maxSpeed = this.bike.getSpeed();

        this.road.update(this.bike.getSpeed());
        this.trafficManager.update(delta, this.bike.getSpeed(), this.bike.getDistance());

        // Audio Update
        this.audioManager.updateEngine(this.bike.getRPM(), this.bike.getSpeed());

        if (this.trafficManager.checkCollision(this.bike.getBoundingBox())) {
            this.gameOver('collision');
            return;
        }
        if (this.onScoreUpdate) this.onScoreUpdate(this.bike.getSpeed(), this.bike.getDistance());

        if (this.gameMode === 'timed') {
            const remaining = this.gameTime - this.elapsedTime;
            if (this.onTimeUpdate) this.onTimeUpdate(Math.max(0, remaining));
            if (remaining <= 0) this.gameOver('time');
        }
    }

    updateHandStatus(handStatus) {
        // Debounce Logic for Braking to Steering Transition
        // When releasing both fists (braking), there's a split second where one might trigger 'closed' before the other opens.

        const bothOpen = handStatus.bothDetected && !handStatus.leftFistClosed && !handStatus.rightFistClosed;
        const bothClosed = handStatus.bothDetected && handStatus.leftFistClosed && handStatus.rightFistClosed;

        if (bothClosed) {
            this.lastBrakeTime = performance.now();
        }

        this.shouldAccelerate = bothOpen;
        this.shouldBrake = bothClosed;

    }

    canSwitchLane() {
       
        const timeSinceBrake = performance.now() - this.lastBrakeTime;
        return timeSinceBrake > 500;
    }

    switchLane(direction) {
        if (this.bike && this.gameState === 'playing') {
          
            if (this.canSwitchLane()) {
                this.bike.switchLane(direction);
            } else {
                console.log('Lane switch ignored (Debounce)');
            }
        }
    }

    // ... (rest same)
    gameOver(reason) {
        this.gameState = 'gameover';
        this.audioManager.stop();
        // ... (rest same)
        const stats = {
            playerName: this.playerName,
            mode: this.gameMode,
            distance: this.bike.getDistance(),
            maxSpeed: this.maxSpeed,
            time: Math.round(this.elapsedTime),
            reason: reason
        };
        if (this.onGameOver) this.onGameOver(stats);
    }
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default GameEngine;
