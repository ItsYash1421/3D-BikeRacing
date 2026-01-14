import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

class HandTracker {
    constructor(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');

        this.leftHand = null;
        this.rightHand = null;
        this.leftFistClosed = false;
        this.rightFistClosed = false;

        this.smoothedLeftLandmarks = null;
        this.smoothedRightLandmarks = null;
        this.smoothingFactor = 0.7;

        this.lastDrawTime = 0;
        this.DRAW_INTERVAL = 1000 / 30;

        this.onHandUpdate = null;
        this.onLaneSwitch = null;

        this.lastLaneSwitchTime = 0;
        this.laneSwitchCooldown = 500; 
    }

    async init() {
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.7
            });

            this.hands.onResults(this.onResults.bind(this));
            this.camera = new Camera(this.video, {
                onFrame: async () => {
                    await this.hands.send({ image: this.video });
                },
                width: 640,
                height: 480
            });

            await this.camera.start();

            this.canvas.width = 500;
            this.canvas.height = 280;

            return true;
        } catch (error) {
            console.error('HandTracker initialization error:', error);
            return false;
        }
    }

    onResults(results) {
        const now = performance.now();

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.processHands(results.multiHandLandmarks, results.multiHandedness);
        } else {
            this.resetHandData();
        }

        if (now - this.lastDrawTime < this.DRAW_INTERVAL) {
            return;
        }
        this.lastDrawTime = now;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.translate(-this.canvas.width, 0);
        this.ctx.drawImage(results.image, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        if (results.multiHandLandmarks) {
            results.multiHandLandmarks.forEach((landmarks, index) => {
                this.drawHand(landmarks, results.multiHandedness[index].label);
            });
        }
    }

    processHands(multiHandLandmarks, multiHandedness) {
        this.leftHand = null;
        this.rightHand = null;
        this.leftFistClosed = false;
        this.rightFistClosed = false;

        multiHandLandmarks.forEach((rawLandmarks, index) => {
            const handLabel = multiHandedness[index].label;

            const smoothedLandmarks = this.smoothLandmarks(rawLandmarks, handLabel);
            const isFistClosed = !this.detectFistOpen(smoothedLandmarks);

            if (handLabel === 'Left') {
                this.leftHand = smoothedLandmarks;
                this.leftFistClosed = isFistClosed;
                this.smoothedLeftLandmarks = smoothedLandmarks;
            } else {
                this.rightHand = smoothedLandmarks;
                this.rightFistClosed = isFistClosed;
                this.smoothedRightLandmarks = smoothedLandmarks;
            }
        });

        // Lane switching logic with cooldown
        const now = Date.now();
        if (now - this.lastLaneSwitchTime > this.laneSwitchCooldown) {
            if (this.leftFistClosed && !this.rightFistClosed && this.onLaneSwitch) {
                // Left fist closed = move left
                this.onLaneSwitch(-1);
                this.lastLaneSwitchTime = now;
            } else if (this.rightFistClosed && !this.leftFistClosed && this.onLaneSwitch) {
                // Right fist closed = move right
                this.onLaneSwitch(1);
                this.lastLaneSwitchTime = now;
            }
        }

        if (this.onHandUpdate) {
            this.onHandUpdate({
                leftDetected: this.leftHand !== null,
                rightDetected: this.rightHand !== null,
                leftFistClosed: this.leftFistClosed,
                rightFistClosed: this.rightFistClosed,
                bothDetected: this.leftHand !== null && this.rightHand !== null
            });
        }
    }

    smoothLandmarks(rawLandmarks, handLabel) {
        const prevSmoothed = handLabel === 'Left' ?
            this.smoothedLeftLandmarks :
            this.smoothedRightLandmarks;

        if (!prevSmoothed) {
            return rawLandmarks.map(l => ({ ...l }));
        }

        return rawLandmarks.map((l, i) => ({
            x: this.smoothingFactor * prevSmoothed[i].x + (1 - this.smoothingFactor) * l.x,
            y: this.smoothingFactor * prevSmoothed[i].y + (1 - this.smoothingFactor) * l.y,
            z: this.smoothingFactor * prevSmoothed[i].z + (1 - this.smoothingFactor) * l.z
        }));
    }

    detectFistOpen(landmarks) {
        const fingerTips = [8, 12, 16, 20];
        const fingerBases = [5, 9, 13, 17];

        let extendedCount = 0;

        fingerTips.forEach((tipIndex, i) => {
            const tip = landmarks[tipIndex];
            const base = landmarks[fingerBases[i]];

            if (tip.y < base.y - 0.03) {
                extendedCount++;
            }
        });

        return extendedCount >= 3;
    }

    resetHandData() {
        this.leftHand = null;
        this.rightHand = null;
        this.leftFistClosed = false;
        this.rightFistClosed = false;

        if (this.onHandUpdate) {
            this.onHandUpdate({
                leftDetected: false,
                rightDetected: false,
                leftFistClosed: false,
                rightFistClosed: false,
                bothDetected: false
            });
        }
    }

    drawHand(landmarks, label) {
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],
            [0, 5], [5, 6], [6, 7], [7, 8],
            [0, 9], [9, 10], [10, 11], [11, 12],
            [0, 13], [13, 14], [14, 15], [15, 16],
            [0, 17], [17, 18], [18, 19], [19, 20],
            [5, 9], [9, 13], [13, 17]
        ];

        const isFistOpen = this.detectFistOpen(landmarks);
        this.ctx.strokeStyle = isFistOpen ? '#00ff00' : '#ff3366';
        this.ctx.lineWidth = 2;

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];

            this.ctx.beginPath();
            this.ctx.moveTo(
                (1 - startPoint.x) * this.canvas.width,
                startPoint.y * this.canvas.height
            );
            this.ctx.lineTo(
                (1 - endPoint.x) * this.canvas.width,
                endPoint.y * this.canvas.height
            );
            this.ctx.stroke();
        });

        this.ctx.fillStyle = isFistOpen ? '#00ff00' : '#ff3366';
        landmarks.forEach((landmark) => {
            this.ctx.beginPath();
            this.ctx.arc(
                (1 - landmark.x) * this.canvas.width,
                landmark.y * this.canvas.height,
                3,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Orbitron';
        this.ctx.fillText(
            `${label}: ${isFistOpen ? 'OPEN' : 'CLOSED'}`,
            10,
            label === 'Left' ? 20 : 40
        );
    }

    destroy() {
        if (this.camera) {
            this.camera.stop();
        }
    }
}

export default HandTracker;
