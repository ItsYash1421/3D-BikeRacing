import Vehicle from './Vehicle.js';

class TrafficManager {
    constructor(scene, road) {
        this.scene = scene;
        this.road = road;
        this.vehicles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 3;
        this.maxVehicles = 8;

        this.vehicleTypes = ['car', 'suv', 'truck'];
    }

    update(delta, bikeSpeed, bikeDistance) {
        this.spawnTimer += delta;

        const currentInterval = Math.max(1.5, 3 - (bikeDistance / 2000));
        if (this.spawnTimer >= currentInterval && this.vehicles.length < this.maxVehicles) {
            this.spawnVehicle();
            this.spawnTimer = 0;
        }


        this.vehicles.forEach(vehicle => {

            const relativeSpeedCapped = Math.max(bikeSpeed, 0) - vehicle.speed;

            const moveDistance = (relativeSpeedCapped / 3.6) * delta;
            vehicle.group.position.z += moveDistance;

            if (vehicle.group.position.z > 20) {
                vehicle.active = false;
            } else if (vehicle.group.position.z < -200) {
                vehicle.active = false;
            }
        });

        this.vehicles = this.vehicles.filter(vehicle => {
            if (!vehicle.active) {
                vehicle.destroy();
                return false;
            }
            return true;
        });

    }

    spawnVehicle() {
        const lanes = this.road.getLanes();
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const type = this.vehicleTypes[Math.floor(Math.random() * this.vehicleTypes.length)];

        const zPosition = -150 - Math.random() * 50;

        const vehicle = new Vehicle(this.scene, type, lane, zPosition);
        vehicle.speed = 60 + Math.random() * 40;

        this.vehicles.push(vehicle);
    }

    checkCollision(bikeBox) {
        for (let vehicle of this.vehicles) {
            const vBox = vehicle.getBoundingBox();
            if (bikeBox.maxX > vBox.minX && bikeBox.minX < vBox.maxX &&
                bikeBox.maxZ > vBox.minZ && bikeBox.minZ < vBox.maxZ) {
                return true;
            }
        }
        return false;
    }

    reset() {
        this.vehicles.forEach(vehicle => vehicle.destroy());
        this.vehicles = [];
        this.spawnTimer = 0;
    }
}

export default TrafficManager;
