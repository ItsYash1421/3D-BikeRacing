import * as THREE from 'three';

export const BikeModels = {
    'ninja-h2': {
        name: 'Kawasaki Ninja H2',
        color: 0x00ff00, // Kawasaki green
        handlebarColor: 0x000000,
        dashColor: 0x00ff00,
        maxSpeed: 150,
        acceleration: 2.5,
        handlebarWidth: 0.7,
        handlebarStyle: 'sport', // Low, aggressive
        dashStyle: 'digital'
    },
    'classic-650': {
        name: 'Royal Enfield Classic 650',
        color: 0x8b4513, // Brown
        handlebarColor: 0x2f2f2f,
        dashColor: 0xffffff,
        maxSpeed: 135,
        acceleration: 1.8,
        handlebarWidth: 0.8,
        handlebarStyle: 'cruiser', // High, relaxed
        dashStyle: 'analog'
    },
    'gt-650': {
        name: 'Royal Enfield GT 650',
        color: 0x1a1a1a, // Black
        handlebarColor: 0x2f2f2f,
        dashColor: 0xffa500,
        maxSpeed: 140,
        acceleration: 2.0,
        handlebarWidth: 0.75,
        handlebarStyle: 'cafe', // Medium, slightly forward
        dashStyle: 'analog'
    },
    'apache-rr310': {
        name: 'TVS Apache RR 310',
        color: 0xff0000, // Red
        handlebarColor: 0x000000,
        dashColor: 0xff0000,
        maxSpeed: 145,
        acceleration: 2.2,
        handlebarWidth: 0.65,
        handlebarStyle: 'sport',
        dashStyle: 'digital'
    },
    'bmw-s1000rr': {
        name: 'BMW S1000 RR',
        color: 0x0066cc, // BMW Blue
        handlebarColor: 0x000000,
        dashColor: 0x00f3ff,
        maxSpeed: 150,
        acceleration: 2.8,
        handlebarWidth: 0.6,
        handlebarStyle: 'sport',
        dashStyle: 'digital'
    }
};

export function createBikeModel(scene, camera, bikeType) {
    const config = BikeModels[bikeType];
    const group = new THREE.Group();

    const handlebarHeight = config.handlebarStyle === 'cruiser' ? 0.3 :
        config.handlebarStyle === 'cafe' ? 0.1 : -0.1;

    const leftHandlebar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
        new THREE.MeshStandardMaterial({
            color: config.handlebarColor,
            metalness: 0.9,
            roughness: 0.2
        })
    );
    leftHandlebar.position.set(-config.handlebarWidth / 2, handlebarHeight, -0.5);
    leftHandlebar.rotation.z = Math.PI / 4;
    group.add(leftHandlebar);

    const rightHandlebar = leftHandlebar.clone();
    rightHandlebar.position.set(config.handlebarWidth / 2, handlebarHeight, -0.5);
    rightHandlebar.rotation.z = -Math.PI / 4;
    group.add(rightHandlebar);

    const centerBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, config.handlebarWidth, 8),
        new THREE.MeshStandardMaterial({ color: config.handlebarColor, metalness: 0.9 })
    );
    centerBar.rotation.z = Math.PI / 2;
    centerBar.position.set(0, handlebarHeight, -0.5);
    group.add(centerBar);

    [leftHandlebar, rightHandlebar].forEach(handlebar => {
        const grip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8),
            new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 })
        );
        grip.rotation.x = Math.PI / 2;
        grip.position.set(0, 0.15, 0);
        handlebar.add(grip);
    });

    const dashboardGroup = new THREE.Group();

    if (config.dashStyle === 'digital') {
        const dashScreen = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.12, 0.02),
            new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: config.dashColor,
                emissiveIntensity: 0.3
            })
        );
        dashScreen.position.set(0, handlebarHeight + 0.15, -0.45);
        dashboardGroup.add(dashScreen);

        const speedDisplay = new THREE.Mesh(
            new THREE.PlaneGeometry(0.2, 0.08),
            new THREE.MeshBasicMaterial({
                color: config.dashColor,
                transparent: true,
                opacity: 0.9
            })
        );
        speedDisplay.position.set(0, handlebarHeight + 0.15, -0.44);
        dashboardGroup.add(speedDisplay);
    } else {
        const speedoOuterRing = new THREE.Mesh(
            new THREE.RingGeometry(0.08, 0.09, 32),
            new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 })
        );
        speedoOuterRing.position.set(0, handlebarHeight + 0.15, -0.44);
        dashboardGroup.add(speedoOuterRing);

        const speedoFace = new THREE.Mesh(
            new THREE.CircleGeometry(0.08, 32),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        speedoFace.position.set(0, handlebarHeight + 0.15, -0.45);
        dashboardGroup.add(speedoFace);

        const needle = new THREE.Mesh(
            new THREE.BoxGeometry(0.002, 0.06, 0.002),
            new THREE.MeshBasicMaterial({ color: config.dashColor })
        );
        needle.position.set(0, handlebarHeight + 0.15, -0.43);
        dashboardGroup.add(needle);
        dashboardGroup.userData.needle = needle;
    }

    group.add(dashboardGroup);
    group.userData.dashboard = dashboardGroup;
    group.userData.config = config;

    scene.add(group);
    camera.position.set(0, 1.2 + handlebarHeight, 0);
    camera.rotation.x = -0.1;

    return group;
}

export function createHands(scene, bikeMesh) {
    const config = bikeMesh.userData.config;
    const handsGroup = new THREE.Group();

    const leftHand = createHand('left', config.handlebarWidth);
    handsGroup.add(leftHand);

    const rightHand = createHand('right', config.handlebarWidth);
    handsGroup.add(rightHand);

    scene.add(handsGroup);
    return handsGroup;
}

function createHand(side, handlebarWidth) {
    const handGroup = new THREE.Group();

    const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.12, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 })
    );
    handGroup.add(palm);

    for (let i = 0; i < 4; i++) {
        const finger = new THREE.Mesh(
            new THREE.BoxGeometry(0.015, 0.06, 0.015),
            new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 })
        );
        finger.position.set(-0.03 + i * 0.02, 0.08, 0);
        handGroup.add(finger);
    }

    const thumb = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.05, 0.015),
        new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.7 })
    );
    thumb.position.set(-0.05, 0.02, 0.01);
    thumb.rotation.z = Math.PI / 4;
    handGroup.add(thumb);

    const xPos = side === 'left' ? -handlebarWidth / 2 : handlebarWidth / 2;
    handGroup.position.set(xPos, 0.15, -0.4);
    handGroup.rotation.x = Math.PI / 6;

    return handGroup;
}

export function updateSpeedometer(bikeMesh, speed) {
    const dashboard = bikeMesh.userData.dashboard;
    const config = bikeMesh.userData.config;

    if (config.dashStyle === 'analog' && dashboard.userData.needle) {
        const angle = ((speed / 150) * Math.PI) - (Math.PI / 2);
        dashboard.userData.needle.rotation.z = angle;
    }
}
