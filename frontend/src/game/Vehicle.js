import * as THREE from 'three';

class Vehicle {
    constructor(scene, type, lane, zPosition) {
        this.scene = scene;
        this.type = type;
        this.lane = lane;
        this.speed = 70 + Math.random() * 40;
        this.active = true;

        this.createVehicle(zPosition);
    }

    createVehicle(zPosition) {
        this.group = new THREE.Group();

        let width, height, length, color;

        switch (this.type) {
            case 'car':
                width = 1.8;
                height = 1.3;
                length = 4.2;
                color = this.randomColor();
                break;
            case 'suv':
                width = 2.0;
                height = 1.7;
                length = 4.8;
                color = this.randomColor();
                break;
            case 'truck':
                width = 2.5;
                height = 2.8;
                length = 9;
                color = 0x555555;
                break;
        }

        const bodyMat = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.6,
            roughness: 0.4
        });
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, length),
            bodyMat
        );
        body.position.y = height / 2;
        this.group.add(body);

        if (this.type !== 'truck') {
            const windowMat = new THREE.MeshStandardMaterial({
                color: 0x222222,
                transparent: true,
                opacity: 0.5
            });
            const window = new THREE.Mesh(
                new THREE.BoxGeometry(width * 0.9, height * 0.4, length * 0.3),
                windowMat
            );
            window.position.set(0, height * 0.7, -length * 0.15);
            this.group.add(window);
        }

        const lightMat = new THREE.MeshBasicMaterial({
            color: 0xff0000
        });
        [-width / 3, width / 3].forEach(xPos => {
            const light = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 8, 8),
                lightMat
            );
            light.position.set(xPos, height * 0.4, length / 2);
            this.group.add(light);
        });

        this.group.position.set(this.lane, 0, zPosition);
        this.scene.add(this.group);

        this.boundingBox = {
            width: width,
            length: length,
            height: height
        };
    }

    randomColor() {
        const colors = [0xff3366, 0x00f3ff, 0xffaa00, 0x0088ff, 0xffffff, 0x222222, 0x00ff00];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(delta, bikeSpeed) {
        const relativeSpeed = this.speed;
        const moveDistance = (relativeSpeed / 3.6) * delta;

        this.group.position.z += moveDistance;

        if (this.group.position.z > 30) {
            this.active = false;
        }
    }

    getBoundingBox() {
        return {
            minX: this.group.position.x - this.boundingBox.width / 2,
            maxX: this.group.position.x + this.boundingBox.width / 2,
            minZ: this.group.position.z - this.boundingBox.length / 2,
            maxZ: this.group.position.z + this.boundingBox.length / 2,
            minY: 0,
            maxY: this.boundingBox.height
        };
    }

    destroy() {
        this.scene.remove(this.group);
    }
}

export default Vehicle;
