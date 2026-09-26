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

        // Start player lying in bed
        if (typeof game !== "undefined" && game.cameraSys) {
            game.cameraSys.yawObject.position.set(-3.5, 0.7, 3.0); // On the bed
            game.cameraSys.pitchObject.rotation.x = -Math.PI / 2; // Looking at ceiling
            game.cameraSys.yawObject.rotation.y = Math.PI / 2; // Facing side

            // Subtle wake-up animation
            const targetY = 1.75; // Standing height
            const targetPitch = 0; // Looking straight
            
            let progress = 0;
            this.wakeUpInterval = setInterval(() => {
                progress += 0.02;
                if (progress >= 1) {
                    game.cameraSys.yawObject.position.y = targetY;
                    game.cameraSys.pitchObject.rotation.x = targetPitch;
                    clearInterval(this.wakeUpInterval);
                    return;
                }
                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                game.cameraSys.yawObject.position.y = 0.7 + (targetY - 0.7) * ease;
                game.cameraSys.pitchObject.rotation.x = -Math.PI/2 + (targetPitch - (-Math.PI/2)) * ease;
            }, 30); // ~50 ticks for 1.5s
        }
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
        
        // Room Dimensions: 10m x 10m, 3.5m high
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
        floor.rotation.x = -Math.PI / 2;
        this.scene.add(floor);
        
        // Ceiling
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), wallMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 3.5;
        this.scene.add(ceiling);
        
        // North Wall (With Large Window Hole)
        const wallN_L = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 0.2), wallMat);
        wallN_L.position.set(-3.25, 1.75, -5.1);
        this.scene.add(wallN_L);
        
        const wallN_R = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 0.2), wallMat);
        wallN_R.position.set(3.25, 1.75, -5.1);
        this.scene.add(wallN_R);
        
        const wallN_B = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.2), wallMat);
        wallN_B.position.set(0, 0.5, -5.1);
        this.scene.add(wallN_B);
        
        const wallN_T = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, 0.2), wallMat);
        wallN_T.position.set(0, 3.25, -5.1);
        this.scene.add(wallN_T);
        
        const wallS = new THREE.Mesh(new THREE.BoxGeometry(10, 3.5, 0.2), wallMat);
        wallS.position.set(0, 1.75, 5.1);
        this.scene.add(wallS);
        
        const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 10.4), wallMat);
        wallE.position.set(5.1, 1.75, 0);
        this.scene.add(wallE);
        
        const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 10.4), wallMat);
        wallW.position.set(-5.1, 1.75, 0);
        this.scene.add(wallW);

        this.colliders = [wallN_L, wallN_R, wallN_B, wallN_T, wallS, wallE, wallW];

        // Rain Outside Window
        const rainTex = this.generateProceduralTexture('noise', '#000000', 512, 512);
        // Make noise look like rain streaks
        rainTex.repeat.set(2, 4);
        const rainMat = new THREE.MeshBasicMaterial({ map: rainTex, transparent: true, opacity: 0.6, color: 0x5588aa });
        this.rainPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), rainMat);
        this.rainPlane.position.set(0, 1.75, -6.0); // Outside the window hole
        this.scene.add(this.rainPlane);

        // Ambient Moonlight
        const moonlight = new THREE.DirectionalLight(0x77aaff, 1.5);
        moonlight.position.set(0, 3, -10); // Coming from outside
        moonlight.target.position.set(0, 0, 0);
        moonlight.castShadow = true;
        this.scene.add(moonlight);
        this.scene.add(moonlight.target);
        
        const ambient = new THREE.AmbientLight(0x223344, 0.5); // Soft blue ambient
        this.scene.add(ambient);
        
        // 1. Bed (South-West corner)
        const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.8), woodMat);
        bedFrame.position.set(-3.5, 0.2, 3.0);
        this.scene.add(bedFrame);
        this.colliders.push(bedFrame);
        
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.2, 2.7), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
        mattress.position.set(-3.5, 0.5, 3.0);
        this.scene.add(mattress);
        
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.6), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
        pillow.position.set(-3.5, 0.65, 4.0);
        this.scene.add(pillow);
        
        const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.25, 2.0), blanketMat);
        blanket.position.set(-3.5, 0.55, 2.3);
        this.scene.add(blanket);
        
        interactionSystem.add(bedFrame, () => {
            objectiveSystem.advanceTo(1);
        }, "Bed");
        
        // 2. Cupboard / Wardrobe (North-West corner)
        const cupboard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 1.2), woodMat);
        cupboard.position.set(-4.0, 1.4, -4.0);
        this.scene.add(cupboard);
        this.colliders.push(cupboard);
        interactionSystem.add(cupboard, () => {
            showSubtitle("Empty mostly.");
            objectiveSystem.advanceTo(6);
        }, "Cupboard");
        
        // 3. Desk (East wall)
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 2.5), woodMat);
        desk.position.set(4.2, 0.4, -2.0);
        this.scene.add(desk);
        this.colliders.push(desk);
        
        // 4. Chair
        const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), whiteWoodMat);
        chair.position.set(3.2, 0.25, -2.0);
        this.scene.add(chair);
        this.colliders.push(chair);
        interactionSystem.add(chair, () => {
            showSubtitle("Hard wooden chair.");
        }, "Chair");
        
        // 5. Table Lamp
        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.05, 16), blackMat);
        lampBase.position.set(4.3, 0.825, -2.8);
        this.scene.add(lampBase);
        const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8), blackMat);
        lampStem.position.set(4.3, 1.05, -2.8);
        this.scene.add(lampStem);
        const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0x555555 }));
        lampHead.position.set(4.3, 1.25, -2.8);
        this.scene.add(lampHead);
        
        const lampLight = new THREE.PointLight(0xffddaa, 0, 8); // Initially off
        lampLight.position.set(4.3, 1.15, -2.8);
        this.scene.add(lampLight);
        
        lampBase.userData.light = lampLight;
        interactionSystem.add(lampBase, () => {
            if (lampLight.intensity === 0) {
                lampLight.intensity = 1.0;
                audioManager.play("rattle"); // click sound substitute
                objectiveSystem.advanceTo(4);
            } else {
                lampLight.intensity = 0;
                audioManager.play("rattle"); 
            }
        }, "Table Lamp");

        // 6. Clock (on desk)
        const clockGeo = new THREE.BoxGeometry(0.2, 0.1, 0.1);
        const clockMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xff0000, emissiveIntensity: 0.2 });
        const clock = new THREE.Mesh(clockGeo, clockMat);
        clock.position.set(4.4, 0.85, -1.2);
        clock.rotation.y = -Math.PI / 4;
        this.scene.add(clock);
        this.clockMesh = clock; // Store for HorrorEventManager
        interactionSystem.add(clock, () => {
            showSubtitle("3:14 AM");
            objectiveSystem.advanceTo(5);
        }, "Digital Clock");

        // 7. Window & Curtains (North wall center)
        const windowPane = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.0), new THREE.MeshStandardMaterial({ color: 0x112233, transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.8 }));
        windowPane.position.set(0, 1.5, -4.99);
        this.scene.add(windowPane);
        
        const curtainL = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.2), fabricMat);
        curtainL.position.set(-1.1, 1.5, -4.95);
        this.scene.add(curtainL);
        const curtainR = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.2), fabricMat);
        curtainR.position.set(1.1, 1.5, -4.95);
        this.scene.add(curtainR);
        interactionSystem.add(windowPane, () => {
            showSubtitle("Raining heavily outside.");
        }, "Window");

        // 8. Creepy Painting (East wall)
        const painting = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        painting.position.set(4.99, 2.0, 1.0);
        painting.rotation.y = -Math.PI / 2;
        this.scene.add(painting);
        interactionSystem.add(painting, () => {
            showSubtitle("An old house surrounded by trees.");
        }, "Painting");

        // 9. Phone (Nightstand)
        const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, 0.6), woodMat);
        nightstand.position.set(-2.0, 0.3, 4.0);
        this.scene.add(nightstand);
        this.colliders.push(nightstand);
        
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.15), blackMat);
        phone.position.set(-2.0, 0.605, 4.0);
        this.scene.add(phone);
        interactionSystem.add(phone, () => {
            showSubtitle("3:14 AM. NO SIGNAL. BATTERY LOW.");
            objectiveSystem.advanceTo(3);
        }, "Phone");

        // 10. Laptop & Diary
        const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        laptop.position.set(4.2, 0.81, -2.0);
        this.scene.add(laptop);
        interactionSystem.add(laptop, () => {
            showSubtitle("Dead battery.");
        }, "Laptop");
        
        const diary = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.15), new THREE.MeshStandardMaterial({ color: 0x5a2a2a }));
        diary.position.set(4.4, 0.815, -2.3);
        this.scene.add(diary);
        interactionSystem.add(diary, () => {
            showSubtitle("My internship notes.");
        }, "Notebook");

        // 11. Backpack & Suitcase
        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.4), new THREE.MeshStandardMaterial({ color: 0x113355 }));
        backpack.position.set(3.0, 0.3, 2.0);
        backpack.rotation.y = Math.PI / 4;
        this.scene.add(backpack);
        this.colliders.push(backpack);
        interactionSystem.add(backpack, () => {
            showSubtitle("My stuff.");
        }, "Backpack");
        
        const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        suitcase.position.set(3.8, 0.15, 2.5);
        this.scene.add(suitcase);
        this.colliders.push(suitcase);

        // 12. Clothes
        const clothes = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.4), new THREE.MeshStandardMaterial({ color: 0x552222 }));
        clothes.position.set(3.2, 0.55, -2.0); // on chair
        this.scene.add(clothes);

        // 13. Shoes
        const shoe1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.25), blackMat);
        shoe1.position.set(-2.0, 0.05, 2.5);
        this.scene.add(shoe1);
        const shoe2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.25), blackMat);
        shoe2.position.set(-1.8, 0.05, 2.6);
        shoe2.rotation.y = 0.2;
        this.scene.add(shoe2);

        // 14. Bedroom Door (South wall)
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.1), woodMat);
        door.position.set(2.0, 1.2, 4.99);
        this.scene.add(door);
        interactionSystem.add(door, () => {
            showSubtitle("Locked.");
            audioManager.play("rattle"); 
        }, "Bedroom Door");

        // 15. Water Bottle (Nightstand)
        const bottleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16);
        const bottleMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6, roughness: 0.1 });
        const waterBottle = new THREE.Mesh(bottleGeo, bottleMat);
        waterBottle.position.set(-2.2, 0.7, 4.1);
        this.scene.add(waterBottle);
        interactionSystem.add(waterBottle, () => {
            showSubtitle("* Drinking water *");
            audioManager.play("rattle"); // placeholder drinking sound
            waterBottle.visible = false; // "drinks" it
            setTimeout(() => { waterBottle.visible = true; }, 3000); // refill for testing
        }, "Water Bottle");

        // 16. Internship Documents
        const docs = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), paperMat);
        docs.position.set(4.0, 0.81, -1.8);
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
