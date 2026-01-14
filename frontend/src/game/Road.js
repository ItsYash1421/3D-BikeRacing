import * as THREE from 'three';

class Road {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.segmentLength = 50;
        this.numSegments = 6;
        this.roadWidth = 8;
        this.laneCount = 3;

        console.log('Creating road...');
        this.createGround();
        this.createInitialRoad();
        console.log('Road created with', this.segments.length, 'segments');
    }

    createGround() {
        const groundGeo = new THREE.PlaneGeometry(100, 300);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x4a5a3a,
            roughness: 0.95
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.01;
        this.scene.add(ground);
    }

    createInitialRoad() {
        for (let i = 0; i < this.numSegments; i++) {
            this.createSegment(-100 + i * this.segmentLength);
        }
    }

    createSegment(zPosition) {
        const segmentGroup = new THREE.Group();

        const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
        const roadMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.9
        });
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.position.set(0, 0, zPosition);
        segmentGroup.add(road);

        const laneWidth = this.roadWidth / this.laneCount;
        const markingMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        for (let lane = 1; lane < this.laneCount; lane++) {
            const xPos = -this.roadWidth / 2 + lane * laneWidth;

            for (let z = -this.segmentLength / 2; z < this.segmentLength / 2; z += 10) {
                const marking = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.15, 4),
                    markingMat
                );
                marking.rotation.x = -Math.PI / 2;
                marking.position.set(xPos, 0.02, zPosition + z);
                segmentGroup.add(marking);
            }
        }

        const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        [-this.roadWidth / 2, this.roadWidth / 2].forEach(xPos => {
            const edgeLine = new THREE.Mesh(
                new THREE.PlaneGeometry(0.2, this.segmentLength),
                edgeMat
            );
            edgeLine.rotation.x = -Math.PI / 2;
            edgeLine.position.set(xPos, 0.02, zPosition);
            segmentGroup.add(edgeLine);
        });

        const barrierMat = new THREE.MeshStandardMaterial({
            color: 0xcc0000,
            emissive: 0x330000,
            emissiveIntensity: 0.4
        });
        [-this.roadWidth / 2 - 0.6, this.roadWidth / 2 + 0.6].forEach(xPos => {
            const barrier = new THREE.Mesh(
                new THREE.BoxGeometry(0.3, 1, this.segmentLength),
                barrierMat
            );
            barrier.position.set(xPos, 0.5, zPosition);
            segmentGroup.add(barrier);
        });

        segmentGroup.userData.initialZ = zPosition;
        this.segments.push(segmentGroup);
        this.scene.add(segmentGroup);
    }

    update(bikeSpeed) {
        const moveDistance = (bikeSpeed / 3.6) * (1 / 60);

        this.segments.forEach(segment => {
            segment.position.z += moveDistance;

            if (segment.position.z > 50) {
                segment.position.z -= this.numSegments * this.segmentLength;
            }
        });
    }

    getLanes() {
        const laneWidth = this.roadWidth / this.laneCount;
        return [
            -laneWidth,
            0,
            laneWidth
        ];
    }

    reset() {
        this.segments.forEach((segment, index) => {
            segment.position.z = -100 + index * this.segmentLength;
        });
    }
}

export default Road;
