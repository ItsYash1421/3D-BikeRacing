import * as THREE from 'three';

class Bike {
    constructor(scene, camera, bikeType = 'ninja-h2') {
        this.scene = scene;
        this.camera = camera;
        this.bikeType = bikeType;

        const specs = this.getBikeSpecs(bikeType);
        this.name = specs.name;
        this.maxSpeed = specs.maxSpeed;
        this.acceleration = specs.acceleration;
        this.colors = specs.colors;
        this.style = specs.style;

        this.speed = 0;
        this.rpm = 1000;
        this.brakeForce = 6;
        this.naturalDeceleration = 1.0;

        this.position = new THREE.Vector3(0, 0, 0);
        this.distanceTraveled = 0;

        this.currentLane = 1;
        this.targetLaneX = 0;
        this.laneWidth = 2.67;
        this.lanePositions = [-this.laneWidth, 0, this.laneWidth];
        this.laneSwitchSpeed = 0.15;

        this.materials = this.createMaterials();
        this.createCockpit();
    }

    getBikeSpecs(type) {
        const commonColors = {
            black: 0x111111,
            silver: 0xcccccc,
            gold: 0xffd700,
            red: 0xcc0000,
            blue: 0x0044cc,
            green: 0x00cc00
        };

        const specs = {
            'ninja-h2': {
                name: 'Kawasaki Ninja H2',
                maxSpeed: 300,
                acceleration: 300 / 8,
                colors: { main: commonColors.black, accent: commonColors.green, tank: 0x0a0a0a, frame: commonColors.green },
                style: 'hyper'
            },
            'classic-650': {
                name: 'RE Classic 650',
                maxSpeed: 160,
                acceleration: 160 / 12,
                colors: { main: 0x5c3a21, accent: commonColors.gold, tank: 0x3a2010, frame: commonColors.black },
                style: 'retro'
            },
            'gt-650': {
                name: 'RE GT 650',
                maxSpeed: 175,
                acceleration: 175 / 10,
                colors: { main: commonColors.silver, accent: commonColors.red, tank: 0xeeeeee, frame: commonColors.black },
                style: 'cafe'
            },
            'apache-rr310': {
                name: 'TVS Apache RR 310',
                maxSpeed: 165,
                acceleration: 165 / 10,
                colors: { main: commonColors.red, accent: 0xffffff, tank: 0xdd0000, frame: 0xdd0000 },
                style: 'sport'
            },
            'bmw-s1000rr': {
                name: 'BMW S1000 RR',
                maxSpeed: 299,
                acceleration: 299 / 7.5,
                colors: { main: 0xffffff, accent: commonColors.blue, tank: 0xffffff, frame: commonColors.silver },
                style: 'super'
            }
        };
        return specs[type] || specs['ninja-h2'];
    }

    createMaterials() {
        return {
            paint: new THREE.MeshPhysicalMaterial({ color: this.colors.tank, metalness: 0.6, roughness: 0.2, clearcoat: 1.0 }),
            frame: new THREE.MeshStandardMaterial({ color: this.colors.frame || 0x111111, metalness: 0.7, roughness: 0.5 }),
            chrome: new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1.0, roughness: 0.05 }),
            rubber: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0.1 }),
            plastic: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.1 }),
            glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.0, transmission: 0.95, transparent: true, opacity: 0.3 }),
            screen: new THREE.MeshBasicMaterial({ color: 0x000000 }),
            glow: new THREE.MeshBasicMaterial({ color: this.colors.accent }),
            glove: new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 })
        };
    }

    createCockpit() {
        this.bikeGroup = new THREE.Group();
        this.createTripleClamp();
        if (this.style === 'retro') this.createRetroBars(); else this.createClipOns();
        this.createFuelTank();
        this.createDashboard();
        if (this.style !== 'retro') this.createFairing();
        this.createMirrors();
        this.createHands();

        this.scene.add(this.bikeGroup);
        this.bikeGroup.add(this.camera);
        this.camera.position.set(0, 1.35, 0.4);
        this.camera.rotation.set(-0.15, 0, 0);
    }

    createTripleClamp() {
        const clampGroup = new THREE.Group();
        const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.08), this.materials.frame);
        yoke.position.set(0, 1.0, -0.35); clampGroup.add(yoke);
        const forkCapGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.02, 32);
        const leftFork = new THREE.Mesh(forkCapGeo, this.materials.chrome); leftFork.position.set(-0.15, 1.01, -0.35); clampGroup.add(leftFork);
        const rightFork = new THREE.Mesh(forkCapGeo, this.materials.chrome); rightFork.position.set(0.15, 1.01, -0.35); clampGroup.add(rightFork);
        this.bikeGroup.add(clampGroup);
    }

    createFuelTank() {
        const tankGroup = new THREE.Group();
        const tank = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.8), this.materials.paint);
        tank.position.set(0, 0.8, 0.3); tank.scale.set(1, 1, 1.2); tankGroup.add(tank);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 32), this.materials.chrome);
        cap.position.set(0, 0.98, 0.1); tankGroup.add(cap);
        this.bikeGroup.add(tankGroup);
    }
    createClipOns() { this.createBarHalf(-1); this.createBarHalf(1); }
    createRetroBars() { this.createBarHalf(-1, true); this.createBarHalf(1, true); }
    createBarHalf(side, isRetro = false) {
        const group = new THREE.Group();
        const tubeMat = isRetro ? this.materials.chrome : this.materials.plastic;
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45), tubeMat);
        if (isRetro) { tube.position.set(side * 0.25, 1.15, -0.35); tube.rotation.z = side * 1.3; tube.rotation.y = side * -0.2; }
        else { tube.position.set(side * 0.28, 1.05, -0.4); tube.rotation.z = side * 1.3; tube.rotation.y = side * -0.4; }
        group.add(tube);
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12), this.materials.rubber);
        grip.rotation.copy(tube.rotation); grip.position.copy(tube.position);
        const gripOff = new THREE.Vector3(0, -0.12, 0).applyEuler(tube.rotation); grip.position.add(gripOff); group.add(grip);
        const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), this.materials.plastic);
        switchBox.rotation.copy(tube.rotation); switchBox.position.copy(grip.position).sub(gripOff.clone().multiplyScalar(0.8)); group.add(switchBox);
        this.bikeGroup.add(group);
    }
    createDashboard() {
        this.dashCanvas = document.createElement('canvas');
        this.dashCanvas.width = 512; this.dashCanvas.height = 256;
        this.dashCtx = this.dashCanvas.getContext('2d');
        this.dashTexture = new THREE.CanvasTexture(this.dashCanvas);
        const dashGroup = new THREE.Group();
        dashGroup.position.set(0, 1.2, -0.55); dashGroup.rotation.x = -0.4;
        const housing = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.05), this.materials.plastic);
        dashGroup.add(housing);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ map: this.dashTexture }));
        screen.position.z = 0.026; dashGroup.add(screen);
        this.bikeGroup.add(dashGroup);
    }
    updateDashboard(speed, rpm) {
        if (!this.dashCtx) return;
        const ctx = this.dashCtx;
        const w = this.dashCanvas.width; const h = this.dashCanvas.height;
        ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, w, h);
        if (this.style !== 'retro') {
            const barW = w * 0.8; const filled = (rpm / 12000) * barW;
            ctx.fillStyle = '#222'; ctx.fillRect(w * 0.1, 20, barW, 40);
            const grad = ctx.createLinearGradient(0, 0, w, 0); grad.addColorStop(0, '#0f0'); grad.addColorStop(1, '#f00');
            ctx.fillStyle = grad; ctx.fillRect(w * 0.1, 20, filled, 40);
            ctx.font = 'bold 100px Arial'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(Math.floor(speed), w / 2, h / 2 + 30);
        } else {
            this.drawDial(ctx, w * 0.3, h / 2, 100, speed, 200, 'KM/H');
            this.drawDial(ctx, w * 0.7, h / 2, 100, rpm, 12000, 'RPM');
        }
        this.dashTexture.needsUpdate = true;
    }
    drawDial(ctx, x, y, r, val, max, txt) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.stroke(); ctx.fillStyle = '#000'; ctx.fillText(txt, x, y + 20);
        const ang = (val / max) * 1.5 * Math.PI + 0.75 * Math.PI;
        ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = 'red'; ctx.fillRect(-2, -10, 4, r - 10); ctx.restore();
    }
    createFairing() {
        const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 0.3, 32, 1, true, 0, Math.PI), this.materials.glass);
        shield.position.set(0, 1.3, -0.6); shield.rotation.x = 0.6; shield.rotation.y = Math.PI; this.bikeGroup.add(shield);
    }
    createMirrors() {
        [-1, 1].forEach(s => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.02), this.materials.plastic);
            m.position.set(s * 0.25, 1.25, -0.55); m.rotation.z = s * -0.5; this.bikeGroup.add(m);
        });
    }
    createHands() {
        [-1, 1].forEach(s => {
            const g = new THREE.Group();
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0x222 }));
            arm.rotation.x = Math.PI / 2; arm.position.set(0, 0, 0.2); g.add(arm);
            const hand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.08), this.materials.glove);
            g.add(hand);
            const xPos = this.style === 'retro' ? 0.35 : 0.38; const yPos = this.style === 'retro' ? 1.15 : 1.05;
            g.position.set(s * xPos, yPos, -0.4); g.rotation.y = s * 0.2; g.rotation.x = 0.3;
            this.bikeGroup.add(g);
        });
    }

    accelerate(delta) {
        const torque = 1 - Math.pow(this.speed / this.maxSpeed, 2);
        const realAccel = this.acceleration * Math.max(0.2, torque);

        this.speed += realAccel * delta * 5;
        this.speed = Math.min(this.speed, this.maxSpeed);

        this.rpm += (12000 - this.rpm) * 5 * delta;
    }

    brake(delta) {
        this.speed = Math.max(this.speed - this.brakeForce * delta * 10, 0);
        this.rpm -= (this.rpm - 1000) * 8 * delta;
    }

    coast(delta) {
        this.speed = Math.max(this.speed - this.naturalDeceleration * delta * 2, 0);
        this.rpm -= (this.rpm - 1000) * 2 * delta;
    }

    switchLane(direction) {
        const newLane = Math.max(0, Math.min(2, this.currentLane + direction));
        if (newLane !== this.currentLane) {
            this.currentLane = newLane;
            this.targetLaneX = this.lanePositions[this.currentLane];
        }
    }

    update(deltaTime, shouldAccelerate, shouldBrake) {
        if (shouldAccelerate && !shouldBrake) this.accelerate(deltaTime);
        else if (shouldBrake) this.brake(deltaTime);
        else this.coast(deltaTime);

        const metersPerSecond = this.speed / 3.6;
        this.distanceTraveled += metersPerSecond * deltaTime;

        this.position.x += (this.targetLaneX - this.position.x) * this.laneSwitchSpeed;
        this.bikeGroup.position.x = this.position.x;

        const tilt = (this.targetLaneX - this.position.x) * 0.3;
        this.bikeGroup.rotation.z = tilt;

        if (this.speed > 5) this.bikeGroup.position.y = (Math.random() - 0.5) * (this.speed / 50000);

        this.updateDashboard(this.speed, this.rpm);
    }

    getSpeed() { return Math.round(this.speed); }
    getDistance() { return Math.round(this.distanceTraveled); }
    getRPM() { return Math.round(this.rpm); }
    getBoundingBox() {
        return {
            minX: this.position.x - 0.5, maxX: this.position.x + 0.5,
            minZ: this.position.z, maxZ: this.position.z + 1.5
        };
    }
    reset() {
        this.speed = 0; this.rpm = 1000; this.distanceTraveled = 0;
        this.currentLane = 1; this.targetLaneX = 0;
        this.position.set(0, 0, 0); this.bikeGroup.position.set(0, 0, 0); this.bikeGroup.rotation.set(0, 0, 0);
    }

    destroy() {
        this.scene.remove(this.bikeGroup);
        this.bikeGroup.traverse(o => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
                if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
                else o.material.dispose();
            }
        });
        if (this.dashTexture) this.dashTexture.dispose();
        this.bikeGroup.remove(this.camera);
    }
}

export default Bike;
