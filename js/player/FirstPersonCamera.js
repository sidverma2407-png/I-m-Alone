class FirstPersonCamera {
    constructor(scene) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 0); // Average eye height
        scene.add(this.camera);

        this.pitchObject = new THREE.Object3D();
        this.pitchObject.add(this.camera);
        
        this.yawObject = new THREE.Object3D();
        this.yawObject.position.y = 1.6;
        this.yawObject.add(this.pitchObject);
        scene.add(this.yawObject);

        this.sensitivity = 0.002;
        this.PI_2 = Math.PI / 2;
    }

    onMouseMove(event) {
        if (document.pointerLockElement === document.body) {
            const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            this.yawObject.rotation.y -= movementX * this.sensitivity;
            this.pitchObject.rotation.x -= movementY * this.sensitivity;

            this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
        }
    }
}
