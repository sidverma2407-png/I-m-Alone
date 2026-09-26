class Bedroom {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020202); // very dark
        
        // Add minimal lighting
        lightingSystem.setupBedroomLighting(this.scene);
        
        // Create basic room
        this.createRoom();
    }

    init() {
        console.log("Bedroom Init");
        
        // Ensure rain is softer in bedroom
        audioManager.setTrackVolume("rain", 0.6); // 60% of base volume
    }

    createRoom() {
        // Floor
        const floorGeo = new THREE.PlaneGeometry(10, 10);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        
        // North Wall
        const wallN = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 0.5), wallMat);
        wallN.position.set(0, 1.5, -5);
        this.scene.add(wallN);

        // Bed
        const bedGeo = new THREE.BoxGeometry(2, 0.5, 4);
        const bedMat = new THREE.MeshStandardMaterial({ color: 0x551111 });
        const bed = new THREE.Mesh(bedGeo, bedMat);
        bed.position.set(-3, 0.25, -2);
        this.scene.add(bed);
        interactionSystem.add(bed, () => {
            console.log("This is where I woke up.");
        }, "Examine Bed");

        // Desk
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1), new THREE.MeshStandardMaterial({ color: 0x442211 }));
        desk.position.set(3, 0.5, -4.5);
        this.scene.add(desk);

        // Computer on Desk
        const computer = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.2), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        computer.position.set(3, 1.3, -4.5);
        this.scene.add(computer);
        interactionSystem.add(computer, () => {
            console.log("Computer is off. No electricity.");
        }, "Check Computer");

        // Phone on Desk
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.2), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        phone.position.set(2.5, 1.01, -4.2);
        this.scene.add(phone);
        interactionSystem.add(phone, () => {
            console.log("NO SIGNAL");
        }, "Check Phone");

        // Diary on Desk
        const diary = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.3), new THREE.MeshStandardMaterial({ color: 0x775533 }));
        diary.position.set(3.5, 1.02, -4.3);
        this.scene.add(diary);
        interactionSystem.add(diary, () => {
            console.log("A diary... best not to read it all now.");
        }, "Read Diary");

        // Window (North Wall)
        const windowGeo = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), new THREE.MeshBasicMaterial({ color: 0x112233, transparent: true, opacity: 0.8 }));
        windowGeo.position.set(0, 1.5, -4.74);
        this.scene.add(windowGeo);
        interactionSystem.add(windowGeo, () => {
            console.log("Raining outside... so dark.");
        }, "Look out Window");

        // Clock on wall
        const clock = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
        clock.position.set(0, 2.2, -4.74);
        this.scene.add(clock);
        
        // Door (East wall, using a box for now)
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2, 1), new THREE.MeshStandardMaterial({ color: 0x332211 }));
        door.position.set(4.9, 1, 0);
        this.scene.add(door);
        interactionSystem.add(door, () => {
            console.log("The handle feels cold. Locked.");
            horrorEventManager.trigger("door_locked");
        }, "Open Door");

        // Light Switch
        const switchObj = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
        switchObj.position.set(4.9, 1.2, 1);
        this.scene.add(switchObj);
        interactionSystem.add(switchObj, () => {
            console.log("Click. Nothing.");
            audioManager.play("switch_click"); // Ensure this is loaded in AudioManager if used
        }, "Toggle Switch");

        // Wardrobe
        const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1), new THREE.MeshStandardMaterial({ color: 0x442211 }));
        wardrobe.position.set(-4.2, 1.25, 3);
        this.scene.add(wardrobe);
        interactionSystem.add(wardrobe, () => {
            console.log("Just clothes... wait, did something move?");
        }, "Open Wardrobe");

        // Mirror
        const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.5), new THREE.MeshStandardMaterial({ color: 0x8899aa, metalness: 0.9, roughness: 0.1 }));
        mirror.position.set(-4.74, 1.5, 0);
        mirror.rotation.y = Math.PI / 2;
        this.scene.add(mirror);
        interactionSystem.add(mirror, () => {
            console.log("Just me.");
        }, "Look in Mirror");
    }

    update(delta) {
        // We need player position. If game object is globally available:
        if (typeof game !== "undefined" && game.cameraSys) {
            // Future spatialization logic can go here
        }
    }

    dispose() {
        audioManager.stop("clock");
    }
}
const bedroomScene = new Bedroom();
