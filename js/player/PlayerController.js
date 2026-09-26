class PlayerController {
    constructor(scene, cameraSys) {
        this.cameraSys = cameraSys;
        this.yawObject = cameraSys.yawObject;
        
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.isSprinting = false;
        this.isCrouching = false;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.speed = 3.0; // Walk speed
        this.sprintSpeed = 5.0; // Sprint speed
        this.crouchSpeed = 1.5;
        this.crouchHeight = 1.0;
        this.normalHeight = 1.6;

        // Flashlight
        this.flashlight = new THREE.SpotLight(0xffffff, 0); // Off by default
        this.flashlight.angle = Math.PI / 6;
        this.flashlight.penumbra = 0.2;
        this.flashlight.distance = 20;
        this.flashlight.castShadow = true;
        this.cameraSys.camera.add(this.flashlight);

        this.setupInput();
    }

    setupInput() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
        document.addEventListener('mousemove', (e) => this.cameraSys.onMouseMove(e), false);
        
        // Pointer lock click
        document.addEventListener('click', () => {
            if (sceneManager.currentSceneName === "bedroom") { // Only lock in playable scenes
                document.body.requestPointerLock();
                // If it was the initial hint, clear it
                if (document.getElementById("objective-text") && document.getElementById("objective-text").innerText === "Click to explore the room.") {
                    objectiveSystem.clearObjective();
                }
            }
        });
    }

    onKeyDown(event) {
        if (sceneManager.currentSceneName !== "bedroom") return;

        switch (event.code) {
            case 'KeyW': this.moveForward = true; break;
            case 'KeyA': this.moveLeft = true; break;
            case 'KeyS': this.moveBackward = true; break;
            case 'KeyD': this.moveRight = true; break;
            case 'ShiftLeft': this.isSprinting = true; break;
            case 'ControlLeft': 
                this.isCrouching = true; 
                this.yawObject.position.y = this.crouchHeight;
                break;
            case 'KeyF': 
                this.flashlight.intensity = this.flashlight.intensity === 0 ? 1 : 0; 
                break;
            case 'KeyE':
                interactionSystem.interact();
                break;
        }
    }

    onKeyUp(event) {
        if (sceneManager.currentSceneName !== "bedroom") return;

        switch (event.code) {
            case 'KeyW': this.moveForward = false; break;
            case 'KeyA': this.moveLeft = false; break;
            case 'KeyS': this.moveBackward = false; break;
            case 'KeyD': this.moveRight = false; break;
            case 'ShiftLeft': this.isSprinting = false; break;
            case 'ControlLeft': 
                this.isCrouching = false; 
                this.yawObject.position.y = this.normalHeight;
                break;
        }
    }

    update(delta) {
        if (sceneManager.currentSceneName !== "bedroom") return;
        if (document.pointerLockElement !== document.body) return; // Only move when locked

        this.velocity.x -= this.velocity.x * 10.0 * delta;
        this.velocity.z -= this.velocity.z * 10.0 * delta;

        this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
        this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
        this.direction.normalize();

        let currentSpeed = this.isCrouching ? this.crouchSpeed : (this.isSprinting ? this.sprintSpeed : this.speed);

        if (this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * currentSpeed * delta;
        if (this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * currentSpeed * delta;

        const deltaXLocal = -this.velocity.x;
        const deltaZLocal = this.velocity.z;

        // Apply movement with simple collision check
        if (sceneManager.currentScene.colliders) {
            // Compute desired global delta
            const currentPos = this.yawObject.position.clone();
            
            this.yawObject.translateX(deltaXLocal);
            this.yawObject.translateZ(deltaZLocal);
            
            const desiredPos = this.yawObject.position.clone();
            const globalDeltaX = desiredPos.x - currentPos.x;
            const globalDeltaZ = desiredPos.z - currentPos.z;
            
            // Revert back to test individual axes
            this.yawObject.position.copy(currentPos);

            const playerBox = new THREE.Box3();
            const setPlayerBoxAt = (x, z) => {
                playerBox.min.set(x - 0.3, this.yawObject.position.y - 1.75, z - 0.3);
                playerBox.max.set(x + 0.3, this.yawObject.position.y, z + 0.3);
            };

            // Test X
            let canMoveX = true;
            setPlayerBoxAt(currentPos.x + globalDeltaX, currentPos.z);
            for (let collider of sceneManager.currentScene.colliders) {
                if (playerBox.intersectsBox(new THREE.Box3().setFromObject(collider))) {
                    canMoveX = false;
                    break;
                }
            }

            // Test Z
            let canMoveZ = true;
            setPlayerBoxAt(currentPos.x, currentPos.z + globalDeltaZ);
            for (let collider of sceneManager.currentScene.colliders) {
                if (playerBox.intersectsBox(new THREE.Box3().setFromObject(collider))) {
                    canMoveZ = false;
                    break;
                }
            }

            // Apply allowed movement globally
            if (canMoveX) this.yawObject.position.x += globalDeltaX;
            if (canMoveZ) this.yawObject.position.z += globalDeltaZ;

        } else {
            this.yawObject.translateX(deltaXLocal);
            this.yawObject.translateZ(deltaZLocal);
        }
        
        // Head bobbing logic could be added here
        
        interactionSystem.update(this.cameraSys.camera);
    }
}
