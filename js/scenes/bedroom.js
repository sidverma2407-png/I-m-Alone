class Bedroom {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020202); 
        this.clockMesh = null;
        
        // Add minimal lighting
        lightingSystem.setupBedroomLighting(this.scene);
        
        // Create basic room
        this.createRoom();
    }

    init() {
        console.log("Bedroom Init");
        audioManager.play("clock");
        audioManager.setTrackVolume("rain", 0.6); 
    }

    generateProceduralTexture(type, color, width=256, height=256) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            let noise = 0;
            if (type === 'wood') {
                const x = (i / 4) % width;
                const y = Math.floor((i / 4) / width);
                noise = Math.sin(x * 0.1 + Math.sin(y * 0.05) * 10) * 15;
                noise += (Math.random() - 0.5) * 10;
            } else if (type === 'fabric') {
                noise = (Math.random() - 0.5) * 20;
            } else if (type === 'wall') {
                noise = (Math.random() - 0.5) * 8;
            } else if (type === 'noise') {
                noise = (Math.random() - 0.5) * 30;
            }

            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
            data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
        }

        ctx.putImageData(imgData, 0, 0);
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    createRoom() {
        // Procedural Textures
        const woodTex = this.generateProceduralTexture('wood', '#4a2e1b');
        const wallTex = this.generateProceduralTexture('wall', '#4a4a4a');
        const fabricTex = this.generateProceduralTexture('fabric', '#2d3238');
        const blanketTex = this.generateProceduralTexture('fabric', '#3d4450');
        const floorTex = this.generateProceduralTexture('wood', '#2e2621');
        floorTex.repeat.set(4, 4);
        const paperTex = this.generateProceduralTexture('noise', '#eeeeee');

        // Materials
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9, bumpMap: floorTex, bumpScale: 0.02 });
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 1.0, bumpMap: wallTex, bumpScale: 0.01 });
        const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8, bumpMap: woodTex, bumpScale: 0.03 });
        const whiteWoodMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8 });
        const fabricMat = new THREE.MeshStandardMaterial({ map: fabricTex, roughness: 1.0, bumpMap: fabricTex, bumpScale: 0.05 });
        const blanketMat = new THREE.MeshStandardMaterial({ map: blanketTex, roughness: 1.0, bumpMap: blanketTex, bumpScale: 0.05 });
        const paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.6 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
        
        // Room Dimensions: 5m x 4m, 3m high
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), floorMat);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);
        
        // Ceiling
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), wallMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 3;
        this.scene.add(ceiling);
        
        // North Wall (With Window Hole)
        const wallN_L = new THREE.Mesh(new THREE.BoxGeometry(1.75, 3, 0.2), wallMat);
        wallN_L.position.set(-1.625, 1.5, -2.1);
        this.scene.add(wallN_L);
        
        const wallN_R = new THREE.Mesh(new THREE.BoxGeometry(1.75, 3, 0.2), wallMat);
        wallN_R.position.set(1.625, 1.5, -2.1);
        this.scene.add(wallN_R);
        
        const wallN_B = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.2), wallMat);
        wallN_B.position.set(0, 0.45, -2.1);
        this.scene.add(wallN_B);
        
        const wallN_T = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.2), wallMat);
        wallN_T.position.set(0, 2.55, -2.1);
        this.scene.add(wallN_T);
        
        const wallS = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.2), wallMat);
        wallS.position.set(0, 1.5, 2.1);
        this.scene.add(wallS);
        
        const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4.4), wallMat);
        wallE.position.set(2.6, 1.5, 0);
        this.scene.add(wallE);
        
        const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4.4), wallMat);
        wallW.position.set(-2.6, 1.5, 0);
        this.scene.add(wallW);

        // Rain Outside Window
        const rainTex = this.generateProceduralTexture('noise', '#000000', 512, 512);
        // Make noise look like rain streaks
        rainTex.repeat.set(1, 3);
        const rainMat = new THREE.MeshBasicMaterial({ map: rainTex, transparent: true, opacity: 0.6, color: 0x5588aa });
        this.rainPlane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), rainMat);
        this.rainPlane.position.set(0, 1.5, -2.5); // Outside the window hole
        this.scene.add(this.rainPlane);
        
        // 1. Bed (South-West corner)
        const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 2.1), woodMat);
        bedFrame.position.set(-1.8, 0.15, 0.9);
        this.scene.add(bedFrame);
        
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.2, 2.0), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
        mattress.position.set(-1.8, 0.4, 0.9);
        this.scene.add(mattress);
        
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
        pillow.position.set(-1.8, 0.55, 1.6);
        this.scene.add(pillow);
        
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.25, 1.4), blanketMat);
        blanket.position.set(-1.8, 0.45, 0.4);
        this.scene.add(blanket);
        
        interactionSystem.add(bedFrame, () => {
            objectiveSystem.advanceTo(1);
        }, "Bed");
        
        // 2. Cupboard / Wardrobe (North-West corner)
        const cupboard = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.8), woodMat);
        cupboard.position.set(-1.9, 1.1, -1.6);
        this.scene.add(cupboard);
        interactionSystem.add(cupboard, () => {
            showSubtitle("Empty mostly.");
            objectiveSystem.advanceTo(6);
        }, "Cupboard");
        
        // 3. Desk (East wall)
        const desk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 1.6), woodMat);
        desk.position.set(2.1, 0.375, -1.0);
        this.scene.add(desk);
        
        // 4. Chair
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), whiteWoodMat);
        chair.position.set(1.4, 0.25, -1.0);
        this.scene.add(chair);
        interactionSystem.add(chair, () => {
            showSubtitle("Hard wooden chair.");
        }, "Chair");
        
        // 5. Table Lamp
        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.05, 16), blackMat);
        lampBase.position.set(2.2, 0.775, -1.5);
        this.scene.add(lampBase);
        const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), blackMat);
        lampStem.position.set(2.2, 1.0, -1.5);
        this.scene.add(lampStem);
        const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0x555555 }));
        lampHead.position.set(2.2, 1.2, -1.5);
        this.scene.add(lampHead);
        
        const lampLight = new THREE.PointLight(0xffaa55, 0, 5); // Initially off
        lampLight.position.set(2.2, 1.1, -1.5);
        this.scene.add(lampLight);
        
        lampBase.userData.light = lampLight;
        interactionSystem.add(lampBase, () => {
            if (lampLight.intensity === 0) {
                lampLight.intensity = 1.0;
                objectiveSystem.advanceTo(4);
            } else {
                lampLight.intensity = 0;
            }
        }, "Table Lamp");

        // 6. Clock (on desk)
        const clockGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const clockMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xff0000, emissiveIntensity: 0.2 });
        const clock = new THREE.Mesh(clockGeo, clockMat);
        clock.position.set(2.2, 0.8, -0.6);
        clock.rotation.y = -Math.PI / 4;
        this.scene.add(clock);
        this.clockMesh = clock; // Store for HorrorEventManager
        interactionSystem.add(clock, () => {
            showSubtitle("3:14 AM");
            objectiveSystem.advanceTo(5);
        }, "Digital Clock");

        // 7. Window & Curtains (North wall center)
        const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), new THREE.MeshStandardMaterial({ color: 0x112233, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.8 }));
        windowPane.position.set(0, 1.5, -1.99);
        this.scene.add(windowPane);
        
        const curtainL = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.4), fabricMat);
        curtainL.position.set(-0.6, 1.5, -1.95);
        this.scene.add(curtainL);
        const curtainR = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 1.4), fabricMat);
        curtainR.position.set(0.6, 1.5, -1.95);
        this.scene.add(curtainR);
        interactionSystem.add(windowPane, () => {
            showSubtitle("Raining heavily outside.");
        }, "Window");

        // 8. Creepy Painting (East wall)
        const painting = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        painting.position.set(2.49, 1.6, 1.0);
        painting.rotation.y = -Math.PI / 2;
        this.scene.add(painting);
        interactionSystem.add(painting, () => {
            showSubtitle("An old house surrounded by trees.");
        }, "Painting");

        // 9. Phone (Nightstand)
        const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.4), woodMat);
        nightstand.position.set(-0.8, 0.25, 1.7);
        this.scene.add(nightstand);
        
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.15), blackMat);
        phone.position.set(-0.8, 0.505, 1.7);
        this.scene.add(phone);
        interactionSystem.add(phone, () => {
            showSubtitle("3:14 AM. NO SIGNAL. BATTERY LOW.");
            objectiveSystem.advanceTo(3);
        }, "Phone");

        // 10. Laptop & Diary
        const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        laptop.position.set(2.0, 0.76, -1.0);
        this.scene.add(laptop);
        interactionSystem.add(laptop, () => {
            showSubtitle("Dead battery.");
        }, "Laptop");
        
        const diary = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.15), new THREE.MeshStandardMaterial({ color: 0x5a2a2a }));
        diary.position.set(2.2, 0.765, -1.2);
        this.scene.add(diary);
        interactionSystem.add(diary, () => {
            showSubtitle("My internship notes.");
        }, "Notebook");

        // 11. Backpack
        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.3), new THREE.MeshStandardMaterial({ color: 0x113355 }));
        backpack.position.set(1.5, 0.25, 1.5);
        backpack.rotation.y = Math.PI / 4;
        this.scene.add(backpack);
        interactionSystem.add(backpack, () => {
            showSubtitle("My stuff.");
        }, "Backpack");

        // 12. Clothes
        const clothes = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x552222 }));
        clothes.position.set(1.4, 0.55, -1.0); // on chair
        this.scene.add(clothes);

        // 13. Shoes
        const shoe1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.25), blackMat);
        shoe1.position.set(-0.8, 0.05, 0.8);
        this.scene.add(shoe1);
        const shoe2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.25), blackMat);
        shoe2.position.set(-0.6, 0.05, 0.9);
        shoe2.rotation.y = 0.2;
        this.scene.add(shoe2);

        // 14. Bedroom Door (South wall)
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.1), woodMat);
        door.position.set(1.5, 1.05, 1.99);
        this.scene.add(door);
        interactionSystem.add(door, () => {
            showSubtitle("Locked.");
            audioManager.play("rattle"); 
        }, "Bedroom Door");

        // 16. Internship Documents
        const docs = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), paperMat);
        docs.position.set(1.9, 0.76, -0.8);
        docs.rotation.x = -Math.PI / 2;
        docs.rotation.z = 0.2;
        this.scene.add(docs);
        interactionSystem.add(docs, () => {
            showSubtitle("INTERNSHIP JOINING DOCUMENTS. LOCATION: REMOTE.");
            objectiveSystem.advanceTo(8);
        }, "Documents");
    }

    update(delta) {
        if (typeof game !== "undefined" && game.cameraSys) {
            const playerPos = game.cameraSys.camera.position;
            
            // Clock spatialization
            const clockPos = new THREE.Vector3(2.2, 0.8, -0.6); // updated clock pos
            const distToClock = playerPos.distanceTo(clockPos);
            let clockVol = 1.0 - ((distToClock - 1) / 7);
            if(clockVol < 0) clockVol = 0;
            if(clockVol > 1) clockVol = 1;
            audioManager.setTrackVolume("clock", clockVol);
        }

        // Scroll rain texture
        if (this.rainPlane) {
            this.rainPlane.material.map.offset.y -= delta * 2.0;
        }
    }

    dispose() {
        // audioManager.stop("clock"); // User requested no duplication but clock should keep playing
    }
}
const bedroomScene = new Bedroom();
