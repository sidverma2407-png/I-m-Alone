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
        // High-Quality Procedural Textures (Optimized)
        const woodTex = this.generateProceduralTexture('wood', '#3a2415', 256, 256);
        const wallTex = this.generateProceduralTexture('wall', '#7a7d80', 256, 256); // Gray/Off-white walls
        const fabricTex = this.generateProceduralTexture('fabric', '#2d3238', 128, 128);
        const blanketTex = this.generateProceduralTexture('fabric', '#424855', 128, 128);
        const floorTex = this.generateProceduralTexture('wood', '#1e1611', 512, 512); // Reduced from 1024
        floorTex.repeat.set(8, 8); // Better scaling for 10x10 floor
        const paperTex = this.generateProceduralTexture('noise', '#eeeeee', 64, 64);
        const paintingCanvasTex = this.generateProceduralTexture('noise', '#111111', 128, 128);
        const glassTex = this.generateProceduralTexture('noise', '#aaaacc', 64, 64);

        // Advanced Materials
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.6, bumpMap: floorTex, bumpScale: 0.015, metalness: 0.1 });
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95, bumpMap: wallTex, bumpScale: 0.005 });
        const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.7, bumpMap: woodTex, bumpScale: 0.02, metalness: 0.05 });
        const whiteWoodMat = new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.8 });
        const fabricMat = new THREE.MeshStandardMaterial({ map: fabricTex, roughness: 1.0, bumpMap: fabricTex, bumpScale: 0.05 });
        const blanketMat = new THREE.MeshStandardMaterial({ map: blanketTex, roughness: 1.0, bumpMap: blanketTex, bumpScale: 0.05 });
        const pillowMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.9 });
        const paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.8 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.8 });
        const glassMat = new THREE.MeshStandardMaterial({ color: 0x112233, transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.9, envMapIntensity: 1.0 });
        const emissiveMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 2.0 });
        const paintingMat = new THREE.MeshStandardMaterial({ map: paintingCanvasTex, roughness: 0.5 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.4 });
        
        // Baseboards (Skirting) around the room
        const baseboardGeoN = new THREE.BoxGeometry(10, 0.15, 0.05);
        const baseboardS = new THREE.Mesh(new THREE.BoxGeometry(10, 0.15, 0.05), whiteWoodMat);
        baseboardS.position.set(0, 0.075, 4.975);
        this.scene.add(baseboardS);

        const baseboardN_L = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 0.05), whiteWoodMat);
        baseboardN_L.position.set(-3.25, 0.075, -4.975);
        this.scene.add(baseboardN_L);
        const baseboardN_R = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.15, 0.05), whiteWoodMat);
        baseboardN_R.position.set(3.25, 0.075, -4.975);
        this.scene.add(baseboardN_R);

        const baseboardE = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 10), whiteWoodMat);
        baseboardE.position.set(4.975, 0.075, 0);
        this.scene.add(baseboardE);
        const baseboardW = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 10), whiteWoodMat);
        baseboardW.position.set(-4.975, 0.075, 0);
        this.scene.add(baseboardW);

        // Room Dimensions: 10m x 10m, 3.5m high
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Ceiling
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), wallMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 3.5;
        this.scene.add(ceiling);
        
        // Walls (Adding receiveShadow to all)
        const wallN_L = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 0.2), wallMat);
        wallN_L.position.set(-3.25, 1.75, -5.1); wallN_L.receiveShadow = true; this.scene.add(wallN_L);
        const wallN_R = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 0.2), wallMat);
        wallN_R.position.set(3.25, 1.75, -5.1); wallN_R.receiveShadow = true; this.scene.add(wallN_R);
        const wallN_B = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.0, 0.2), wallMat);
        wallN_B.position.set(0, 0.5, -5.1); wallN_B.receiveShadow = true; this.scene.add(wallN_B);
        const wallN_T = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, 0.2), wallMat);
        wallN_T.position.set(0, 3.25, -5.1); wallN_T.receiveShadow = true; this.scene.add(wallN_T);
        
        const wallS = new THREE.Mesh(new THREE.BoxGeometry(10, 3.5, 0.2), wallMat);
        wallS.position.set(0, 1.75, 5.1); wallS.receiveShadow = true; this.scene.add(wallS);
        const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 10.4), wallMat);
        wallE.position.set(5.1, 1.75, 0); wallE.receiveShadow = true; this.scene.add(wallE);
        const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 10.4), wallMat);
        wallW.position.set(-5.1, 1.75, 0); wallW.receiveShadow = true; this.scene.add(wallW);

        this.colliders = [wallN_L, wallN_R, wallN_B, wallN_T, wallS, wallE, wallW];

        // Rain Outside Window
        const rainTex = this.generateProceduralTexture('noise', '#000000', 256, 256);
        rainTex.repeat.set(2, 4);
        const rainMat = new THREE.MeshBasicMaterial({ map: rainTex, transparent: true, opacity: 0.6, color: 0x5588aa });
        this.rainPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), rainMat);
        this.rainPlane.position.set(0, 1.75, -6.0);
        this.scene.add(this.rainPlane);

        // Ambient Moonlight (Cinematic)
        const moonlight = new THREE.DirectionalLight(0xaaccff, 1.8);
        moonlight.position.set(0, 4, -10); // High up outside window
        moonlight.target.position.set(0, 0, 0);
        moonlight.castShadow = true;
        // Optimized Shadow Map Size
        moonlight.shadow.mapSize.width = 1024;
        moonlight.shadow.mapSize.height = 1024;
        moonlight.shadow.camera.near = 0.5;
        moonlight.shadow.camera.far = 25;
        moonlight.shadow.camera.left = -5;
        moonlight.shadow.camera.right = 5;
        moonlight.shadow.camera.top = 5;
        moonlight.shadow.camera.bottom = -5;
        moonlight.shadow.bias = -0.001; // fix acne
        this.scene.add(moonlight);
        this.scene.add(moonlight.target);
        
        // Very soft fill light to keep things barely readable
        const ambient = new THREE.AmbientLight(0x1a2230, 0.4);
        this.scene.add(ambient);
        
        // 1. Bed (South-West corner)
        const bed = createDetailedBed(woodMat, fabricMat, blanketMat, pillowMat);
        bed.position.set(-3.5, 0, 3.0);
        this.scene.add(bed);
        this.colliders.push(bed);
        
        interactionSystem.add(bed, () => {
            objectiveSystem.advanceTo(1);
        }, "Bed");
        
        // 2. Cupboard / Wardrobe (North-West corner)
        const cupboard = createDetailedWardrobe(woodMat, metalMat);
        cupboard.position.set(-4.0, 0, -4.0);
        // Slightly rotate for organic placement
        cupboard.rotation.y = 0.05;
        this.scene.add(cupboard);
        this.colliders.push(cupboard);
        interactionSystem.add(cupboard, () => {
            showSubtitle("Empty mostly.");
            objectiveSystem.advanceTo(6);
        }, "Wardrobe");
        
        // 3. Desk (East wall)
        const desk = createDetailedDesk(woodMat, metalMat);
        desk.position.set(4.0, 0, -2.0);
        this.scene.add(desk);
        this.colliders.push(desk);
        
        // 4. Chair
        const chair = createDetailedChair(metalMat, fabricMat);
        chair.position.set(3.0, 0, -2.0);
        chair.rotation.y = -Math.PI / 2 + 0.2; // organic turn
        this.scene.add(chair);
        this.colliders.push(chair);
        interactionSystem.add(chair, () => {
            showSubtitle("Hard office chair.");
        }, "Chair");
        
        // 5. Table Lamp
        const lampGroup = new THREE.Group();
        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.05, 16), metalMat);
        lampBase.position.y = 0.025;
        lampBase.castShadow = true;
        lampGroup.add(lampBase);
        const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), metalMat);
        lampStem.position.y = 0.25;
        lampStem.castShadow = true;
        lampGroup.add(lampStem);
        const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.25, 16), new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.2, roughness: 0.8 }));
        lampHead.position.y = 0.45;
        lampHead.castShadow = true;
        lampGroup.add(lampHead);
        
        const lampLight = new THREE.PointLight(0xffddaa, 0, 8); // warm yellow
        lampLight.position.y = 0.35;
        lampLight.castShadow = true;
        lampGroup.add(lampLight);
        
        lampGroup.position.set(4.1, 0.8, -2.8);
        this.scene.add(lampGroup);
        
        lampBase.userData.light = lampLight;
        interactionSystem.add(lampBase, () => {
            if (lampLight.intensity === 0) {
                lampLight.intensity = 1.2;
                audioManager.play("rattle");
                objectiveSystem.advanceTo(4);
            } else {
                lampLight.intensity = 0;
                audioManager.play("rattle"); 
            }
        }, "Table Lamp");

        // 6. Clock (on desk)
        const clock = createDetailedClock(blackMat, glassMat, emissiveMat);
        clock.position.set(4.2, 0.85, -1.2);
        clock.rotation.y = -Math.PI / 4;
        this.scene.add(clock);
        this.clockMesh = clock; // Store for HorrorEventManager
        interactionSystem.add(clock, () => {
            showSubtitle("3:14 AM");
            objectiveSystem.advanceTo(5);
        }, "Digital Clock");

        // 7. Window & Curtains (North wall center)
        const windowFrame = createDetailedWindowFrame(woodMat, glassMat);
        windowFrame.position.set(0, 1.5, -4.95);
        this.scene.add(windowFrame);
        
        // Adding curtains with folds (using multiple thin boxes)
        const createCurtain = (x) => {
            const curtainGroup = new THREE.Group();
            for(let i=0; i<5; i++) {
                const fold = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.2, 0.05), fabricMat);
                fold.position.set((i * 0.15) - 0.3, 0, Math.sin(i)*0.05);
                fold.castShadow = true;
                curtainGroup.add(fold);
            }
            curtainGroup.position.set(x, 1.5, -4.8);
            return curtainGroup;
        };
        this.scene.add(createCurtain(-1.2));
        this.scene.add(createCurtain(1.2));

        interactionSystem.add(windowFrame, () => {
            showSubtitle("Raining heavily outside.");
        }, "Window");

        // 8. Creepy Painting (East wall)
        const painting = createDetailedPainting(woodMat, paintingMat);
        painting.position.set(4.95, 2.0, 1.0);
        painting.rotation.y = -Math.PI / 2;
        this.scene.add(painting);
        interactionSystem.add(painting, () => {
            showSubtitle("An old house surrounded by trees.");
        }, "Painting");

        // 9. Phone (Nightstand)
        const nightstand = createDetailedNightstand(woodMat, metalMat);
        nightstand.position.set(-2.0, 0, 4.0);
        nightstand.rotation.y = -0.1;
        this.scene.add(nightstand);
        this.colliders.push(nightstand);
        
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.01, 0.15), blackMat);
        phone.position.set(-1.9, 0.615, 3.9);
        phone.rotation.y = 0.3;
        // Optimized: Removed minor castShadow
        this.scene.add(phone);
        interactionSystem.add(phone, () => {
            showSubtitle("3:14 AM. NO SIGNAL. BATTERY LOW.");
            objectiveSystem.advanceTo(3);
        }, "Phone");

        // 10. Laptop & Diary
        const laptopGeo = new THREE.BoxGeometry(0.35, 0.02, 0.25);
        const laptop = new THREE.Mesh(laptopGeo, metalMat);
        laptop.position.set(3.9, 0.81, -2.0);
        laptop.rotation.y = 0.1;
        this.scene.add(laptop);
        interactionSystem.add(laptop, () => {
            showSubtitle("Dead battery.");
        }, "Laptop");
        
        const diary = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.15), new THREE.MeshStandardMaterial({ color: 0x5a2a2a, roughness: 0.9 }));
        diary.position.set(4.2, 0.815, -2.3);
        diary.rotation.y = -0.15;
        this.scene.add(diary);
        interactionSystem.add(diary, () => {
            showSubtitle("My internship notes.");
        }, "Notebook");

        // 11. Backpack & Suitcase
        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.4), new THREE.MeshStandardMaterial({ color: 0x113355, roughness: 1.0 }));
        backpack.position.set(2.5, 0.3, 2.0);
        backpack.rotation.y = Math.PI / 4;
        backpack.castShadow = true;
        this.scene.add(backpack);
        this.colliders.push(backpack);
        interactionSystem.add(backpack, () => {
            showSubtitle("My stuff.");
        }, "Backpack");
        
        const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 }));
        suitcase.position.set(3.5, 0.15, 2.5);
        suitcase.rotation.y = 0.1;
        suitcase.castShadow = true;
        this.scene.add(suitcase);
        this.colliders.push(suitcase);

        // 12. Clothes
        const clothes = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: 0x552222, roughness: 1.0 }));
        clothes.position.set(3.0, 0.55, -2.0); // on chair seat
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
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.08), woodMat);
        door.position.set(2.0, 1.2, 4.96);
        this.scene.add(door);
        
        const doorFrame1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.12), whiteWoodMat);
        doorFrame1.position.set(1.35, 1.2, 4.96);
        this.scene.add(doorFrame1);
        const doorFrame2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.12), whiteWoodMat);
        doorFrame2.position.set(2.65, 1.2, 4.96);
        this.scene.add(doorFrame2);
        
        interactionSystem.add(door, () => {
            showSubtitle("Locked.");
            audioManager.play("rattle"); 
        }, "Bedroom Door");

        // 15. Water Bottle (Nightstand)
        const bottleGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.2, 16);
        const bottleMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.4, roughness: 0.1, metalness: 0.8 });
        const waterBottle = new THREE.Mesh(bottleGeo, bottleMat);
        waterBottle.position.set(-2.1, 0.72, 4.1);
        waterBottle.castShadow = true;
        this.scene.add(waterBottle);
        interactionSystem.add(waterBottle, () => {
            showSubtitle("* Drinking water *");
            audioManager.play("rattle");
            waterBottle.visible = false;
            setTimeout(() => { waterBottle.visible = true; }, 3000); 
        }, "Water Bottle");

        // 16. Internship Documents
        const docs = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), paperMat);
        docs.position.set(3.8, 0.811, -1.7);
        docs.rotation.x = -Math.PI / 2;
        docs.rotation.z = 0.4;
        docs.receiveShadow = true;
        this.scene.add(docs);
        interactionSystem.add(docs, () => {
            showSubtitle("INTERNSHIP JOINING DOCUMENTS. LOCATION: REMOTE.");
            objectiveSystem.advanceTo(8);
        }, "Documents");

        // Dust Particles in moonlight
        const dustGeo = new THREE.BufferGeometry();
        const dustCount = 300;
        const dustPositions = new Float32Array(dustCount * 3);
        for(let i=0; i<dustCount; i++) {
            // scatter in front of window
            dustPositions[i*3] = (Math.random() - 0.5) * 4;
            dustPositions[i*3+1] = Math.random() * 3.5;
            dustPositions[i*3+2] = (Math.random() - 0.5) * 4 - 3;
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        const dustMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.02, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
        this.dustParticles = new THREE.Points(dustGeo, dustMat);
        this.scene.add(this.dustParticles);
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

        if (this.dustParticles) {
            const positions = this.dustParticles.geometry.attributes.position.array;
            const time = performance.now() * 0.001; // calculate once
            for(let i = 0; i < positions.length; i+=3) {
                positions[i+1] -= delta * 0.1; // Fall slowly
                positions[i] += Math.sin(time + i) * delta * 0.1; // Drift sideways
                if (positions[i+1] < 0) {
                    positions[i+1] = 3.5;
                }
            }
            this.dustParticles.geometry.attributes.position.needsUpdate = true;
        }
    }

    dispose() {
        // audioManager.stop("clock"); // User requested no duplication but clock should keep playing
    }
}
const bedroomScene = new Bedroom();
