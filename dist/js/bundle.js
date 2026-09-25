/* I'M ALONE - BUNDLED JS */

/* --- js/systems/AudioManager.js --- */
class AudioManager {
    constructor() {
        this.tracks = {};
        this.masterVolume = 1.0;
    }

    // Load an audio file and create an HTML5 Audio element
    load(name, src, loop = false, defaultVolume = 1.0) {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = defaultVolume * this.masterVolume;
        this.tracks[name] = {
            element: audio,
            baseVolume: defaultVolume
        };
        return audio;
    }

    play(name) {
        if (this.tracks[name]) {
            this.tracks[name].element.play().catch(e => console.log("Audio play prevented:", e));
        }
    }

    stop(name) {
        if (this.tracks[name]) {
            this.tracks[name].element.pause();
            this.tracks[name].element.currentTime = 0;
        }
    }

    setMasterVolume(vol) {
        this.masterVolume = vol;
        for (let key in this.tracks) {
            this.tracks[key].element.volume = this.tracks[key].baseVolume * this.masterVolume;
        }
    }

    setTrackVolume(name, volRatio) {
        if (this.tracks[name]) {
            // volRatio is 0.0 to 1.0 multiplier on baseVolume
            this.tracks[name].element.volume = (this.tracks[name].baseVolume * volRatio) * this.masterVolume;
        }
    }

    fadeIn(name, durationMs = 1000) {
        if (!this.tracks[name]) return;
        const audio = this.tracks[name].element;
        const targetVol = this.tracks[name].baseVolume * this.masterVolume;
        
        audio.volume = 0;
        this.play(name);
        
        const steps = 20;
        const stepTime = durationMs / steps;
        const volStep = targetVol / steps;

        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            if (audio.volume + volStep < targetVol) {
                audio.volume += volStep;
            } else {
                audio.volume = targetVol;
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }
    
    fadeOut(name, durationMs = 1000) {
        if (!this.tracks[name]) return;
        const audio = this.tracks[name].element;
        const startVol = audio.volume;
        const steps = 20;
        const stepTime = durationMs / steps;
        const volStep = startVol / steps;

        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            if (audio.volume - volStep > 0) {
                audio.volume -= volStep;
            } else {
                audio.volume = 0;
                audio.pause();
                audio.currentTime = 0;
                audio.volume = this.tracks[name].baseVolume * this.masterVolume; // Reset for next play
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }
}

const audioManager = new AudioManager();

// Pre-load audio as per prompt
audioManager.load("menu-music", "assets/audio/menu-music.mp3", true, 0.75);
audioManager.load("menu-tension", "assets/audio/Bee's Photo - Annabelle Creation Soundtrack.mp3", true, 0.25); 
audioManager.load("rain", "assets/audio/rain.mp3", true, 0.3);
audioManager.load("clock", "assets/audio/clock-ticking.mp3.mp3", true, 0.2);
audioManager.load("wind", "assets/audio/soundreality-wind-blowing-457954.mp3", true, 0.4);
audioManager.load("thunder", "assets/audio/dragon-studio-dry-thunder-364468.mp3", false, 0.9);


/* --- js/systems/InteractionSystem.js --- */
class InteractionSystem {
    constructor() {
        this.interactables = [];
        this.raycaster = new THREE.Raycaster();
        this.center = new THREE.Vector2(0, 0); // Center of screen
        this.currentInteractable = null;
    }

    add(mesh, onInteract, promptText = "Interact") {
        mesh.userData.interactable = true;
        mesh.userData.onInteract = onInteract;
        mesh.userData.promptText = promptText;
        this.interactables.push(mesh);
    }

    update(camera) {
        if (!camera) return;
        
        this.raycaster.setFromCamera(this.center, camera);
        const intersects = this.raycaster.intersectObjects(this.interactables, false);

        if (intersects.length > 0 && intersects[0].distance < 3) { // 3 units interaction range
            const obj = intersects[0].object;
            if (this.currentInteractable !== obj) {
                this.currentInteractable = obj;
                interactionPromptUI.show(obj.userData.promptText);
            }
        } else {
            if (this.currentInteractable) {
                this.currentInteractable = null;
                interactionPromptUI.hide();
            }
        }
    }

    interact() {
        if (this.currentInteractable) {
            this.currentInteractable.userData.onInteract();
        }
    }
}
const interactionSystem = new InteractionSystem();


/* --- js/systems/HorrorEventManager.js --- */
class HorrorEventManager {
    constructor() {
        this.nextThunderTime = this.getRandomThunderTime();
        this.lightningFlashRemaining = 0;
    }

    getRandomThunderTime(sceneName) {
        let baseDelay = 15000;
        let randomAdd = 30000;
        
        if (sceneName === "mainmenu") {
            baseDelay = 8000;
            randomAdd = 17000; // 8-25 seconds
        } else if (sceneName === "bedroom") {
            baseDelay = 10000;
            randomAdd = 25000; // 10-35 seconds
            // Occasionally much longer
            if (Math.random() > 0.7) {
                randomAdd += 20000;
            }
        }
        
        return performance.now() + (baseDelay + Math.random() * randomAdd);
    }

    trigger(eventName) {
        if (eventName === "door_locked") {
            // Can trigger a specific sound or objective update here
            // e.g. audioManager.play("rattle");
        }
    }

    update(delta) {
        if (sceneManager.currentSceneName !== "bedroom" && sceneManager.currentSceneName !== "mainmenu") return;

        const now = performance.now();

        // Random Thunder Event
        if (now > this.nextThunderTime) {
            audioManager.play("thunder");
            this.lightningFlashRemaining = 0.2; // Flash for 200ms
            this.nextThunderTime = this.getRandomThunderTime(sceneManager.currentSceneName);
        }

        // Handle Lightning flash effect on Bedroom lighting
        if (this.lightningFlashRemaining > 0) {
            this.lightningFlashRemaining -= delta;
            
            // Briefly illuminate room
            if (sceneManager.currentSceneName === "bedroom" && lightingSystem.moonLight) {
                lightingSystem.moonLight.intensity = 5.0 + Math.random() * 2.0; // Bright flash
            } else if (sceneManager.currentSceneName === "mainmenu" && mainMenuScene.plane) {
                // Flash image white
                mainMenuScene.plane.material.color.setHex(0xffffff);
            }
        } else {
            // Restore normal moonlight
            if (lightingSystem.moonLight) {
                lightingSystem.moonLight.intensity = 0.5;
            }
            if (mainMenuScene.plane) {
                // Restore dark gray
                mainMenuScene.plane.material.color.setHex(0x888888);
            }
        }
    }
}
const horrorEventManager = new HorrorEventManager();


/* --- js/systems/ObjectiveSystem.js --- */
class ObjectiveSystem {
    constructor() {
        this.currentObjective = "";
    }
    setObjective(text) {
        this.currentObjective = text;
        // Update UI
    }
}
const objectiveSystem = new ObjectiveSystem();


/* --- js/systems/InventorySystem.js --- */
class InventorySystem {
    constructor() {
        this.items = [];
    }
    add(item) {
        this.items.push(item);
        console.log("Added to inventory:", item);
    }
    has(item) {
        return this.items.includes(item);
    }
}
const inventorySystem = new InventorySystem();


/* --- js/systems/SaveSystem.js --- */
class SaveSystem {
    save() { console.log("Game Saved."); }
    load() { console.log("Game Loaded."); }
}
const saveSystem = new SaveSystem();


/* --- js/systems/LightingSystem.js --- */
class LightingSystem {
    setupBedroomLighting(scene) {
        // Minimal ambient
        const ambientLight = new THREE.AmbientLight(0x101520, 0.1); 
        scene.add(ambientLight);

        // Window moonlight
        this.moonLight = new THREE.DirectionalLight(0x6080aa, 0.5);
        this.moonLight.position.set(-5, 5, -5);
        scene.add(this.moonLight);
        
        return { ambientLight, moonLight: this.moonLight };
    }
}
const lightingSystem = new LightingSystem();


/* --- js/ui/MainMenuUI.js --- */
class MainMenuUI {
    constructor() {
        this.element = document.getElementById("main-menu");
        this.options = document.querySelectorAll(".menu-option:not(.disabled)");
        this.setupListeners();
    }
    
    setupListeners() {
        this.options.forEach(opt => {
            opt.addEventListener("click", (e) => {
                if (this.isTransitioning) return;
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
            
            opt.addEventListener("mouseenter", (e) => {
                if (this.isTransitioning) return;
                this.updateSelection(e.target);
            });
        });

        document.addEventListener("keydown", (e) => {
            if (this.element.classList.contains("hidden") || this.isTransitioning) return;
            
            const activeIndex = Array.from(this.options).findIndex(opt => opt.classList.contains("active"));
            
            if (e.key === "ArrowDown" || e.key === "s") {
                let next = activeIndex + 1;
                if (next >= this.options.length) next = 0;
                this.updateSelection(this.options[next]);
            } else if (e.key === "ArrowUp" || e.key === "w") {
                let prev = activeIndex - 1;
                if (prev < 0) prev = this.options.length - 1;
                this.updateSelection(this.options[prev]);
            } else if (e.key === "Enter") {
                if (activeIndex !== -1) {
                    this.handleAction(this.options[activeIndex].dataset.action);
                }
            }
        });
    }
    
    updateSelection(selectedElement) {
        this.options.forEach(opt => opt.classList.remove("active"));
        selectedElement.classList.add("active");
    }
    
    handleAction(action) {
        if (action === "newgame") {
            this.startGame();
        } else if (action === "settings") {
            // Show settings UI
        }
    }

    show() {
        this.element.classList.remove("hidden");
        
        const tryPlayAudio = () => {
            // Only try if audio context allows it
            audioManager.play("rain");
            audioManager.tracks["rain"].element.volume = 0; // prepare for fade
            
            if (audioManager.tracks["rain"] && !audioManager.tracks["rain"].element.paused) {
                document.removeEventListener("click", tryPlayAudio);
                document.removeEventListener("keydown", tryPlayAudio);
                
                audioManager.fadeIn("rain", 700);
                setTimeout(() => audioManager.fadeIn("menu-music", 1000), 200);
                setTimeout(() => audioManager.fadeIn("menu-tension", 1000), 700);
            }
        };
        
        document.addEventListener("click", tryPlayAudio);
        document.addEventListener("keydown", tryPlayAudio);
        
        tryPlayAudio();
    }

    hide() {
        this.element.classList.add("hidden");
        audioManager.fadeOut("menu-music", 2000);
        audioManager.fadeOut("menu-tension", 2000);
    }

    startGame() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Darken screen and fade UI
        this.element.style.transition = "background-color 3s ease";
        this.element.style.backgroundColor = "#000";
        
        // Hide all text except selected
        const children = this.element.children;
        for(let i=0; i<children.length; i++) {
            if (children[i].classList && children[i].classList.contains('menu-options')) {
                // Fade unselected options
                const opts = children[i].children;
                for(let j=0; j<opts.length; j++) {
                    if (!opts[j].classList.contains('active')) {
                        opts[j].style.transition = "opacity 2s ease";
                        opts[j].style.opacity = "0";
                    }
                }
            } else {
                children[i].style.transition = "opacity 2s ease";
                children[i].style.opacity = "0";
            }
        }

        audioManager.fadeOut("menu-music", 3000);
        audioManager.fadeOut("menu-tension", 3000);
        
        // Wait for fade to complete before transitioning scene
        setTimeout(() => {
            this.element.classList.add("hidden");
            this.element.style.backgroundColor = ""; // reset
            
            // reset styles for future
            for(let i=0; i<children.length; i++) {
                if (children[i].classList && children[i].classList.contains('menu-options')) {
                    const opts = children[i].children;
                    for(let j=0; j<opts.length; j++) {
                        opts[j].style.opacity = "";
                    }
                } else {
                    children[i].style.opacity = "";
                }
            }
            
            sceneManager.changeScene("intro");
            this.isTransitioning = false;
        }, 3000);
    }
}
const mainMenuUI = new MainMenuUI();


/* --- js/ui/InteractionPrompt.js --- */
class InteractionPromptUI {
    constructor() {
        this.element = document.getElementById("interaction-prompt");
    }
    show(text) {
        this.element.innerText = `[E] ${text}`;
        this.element.classList.remove("hidden");
    }
    hide() {
        this.element.classList.add("hidden");
    }
}
const interactionPromptUI = new InteractionPromptUI();


/* --- js/ui/PauseUI.js --- */
class PauseUI {
    constructor() {
        this.element = document.getElementById("pause-menu");
        this.options = this.element.querySelectorAll(".menu-option");
        this.isPaused = false;
        
        document.addEventListener('keydown', (e) => {
            // Only allow pause if we are in a playable scene and pointer is locked
            if (e.code === 'Escape' && sceneManager.currentSceneName === "bedroom") {
                this.togglePause();
            }
        });

        this.options.forEach(opt => {
            opt.addEventListener("click", (e) => {
                const action = e.target.dataset.action;
                if (action === "resume") {
                    this.togglePause();
                    document.body.requestPointerLock();
                } else if (action === "settings") {
                    this.element.classList.add("hidden");
                    settingsUI.show();
                } else if (action === "save") {
                    saveSystem.save();
                } else if (action === "quit") {
                    this.isPaused = false;
                    this.element.classList.add("hidden");
                    sceneManager.changeScene("mainmenu");
                }
            });
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.element.classList.remove("hidden");
            document.exitPointerLock();
        } else {
            this.element.classList.add("hidden");
        }
    }
}
const pauseUI = new PauseUI();


/* --- js/ui/SettingsUI.js --- */
class SettingsUI {
    constructor() {
        this.element = document.getElementById("settings-menu");
        this.masterVolSlider = document.getElementById("master-vol");
        this.mouseSensSlider = document.getElementById("mouse-sens");
        
        this.masterVolSlider.addEventListener("input", (e) => {
            audioManager.setMasterVolume(parseFloat(e.target.value));
        });

        // The game controller needs access to this, handled implicitly or by reading the slider
        
        const backBtn = this.element.querySelector('[data-action="back"]');
        backBtn.addEventListener("click", () => {
            this.hide();
            if (pauseUI.isPaused) {
                pauseUI.element.classList.remove("hidden");
            } else {
                mainMenuUI.element.classList.remove("hidden");
            }
        });
    }

    show() {
        this.element.classList.remove("hidden");
    }

    hide() {
        this.element.classList.add("hidden");
    }
}
const settingsUI = new SettingsUI();


/* --- js/player/FirstPersonCamera.js --- */
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


/* --- js/player/PlayerController.js --- */
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

        this.yawObject.translateX(-this.velocity.x);
        this.yawObject.translateZ(this.velocity.z);
        
        // Head bobbing logic could be added here
        
        interactionSystem.update(this.cameraSys.camera);
    }
}


/* --- js/scenes/MainMenu.js --- */
class MainMenu {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        // Exact frustum fit at z=0 (camera at z=5)
        const distance = 5;
        const vFov = this.camera.fov * Math.PI / 180;
        const planeHeight = 2 * Math.tan(vFov / 2) * distance;
        const planeWidth = planeHeight * this.camera.aspect;
        
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight); 
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('assets/images/menu-background-new.jpg');
        
        // Use basic material for reliable rendering. We will simulate lightning by changing its color!
        const material = new THREE.MeshBasicMaterial({ map: texture, color: 0x888888 });

        this.plane = new THREE.Mesh(geometry, material);
        this.plane.position.z = 0;
        this.scene.add(this.plane);
    }
    init() {
        console.log("Main Menu Init");
        mainMenuUI.show();
    }
    update(delta) {
        // Slow zoom effect
        if (this.camera.position.z > 3.5) {
            this.camera.position.z -= delta * 0.05;
        }
    }
    dispose() {
        mainMenuUI.hide();
    }
}
const mainMenuScene = new MainMenu();


/* --- js/scenes/Intro.js --- */
class Intro {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.texts = [
            "You wake up.",
            "The house is silent.",
            "No electricity.",
            "No phone signal.",
            "No one is home.",
            "But you live alone.",
            "You hear footsteps upstairs."
        ];
        this.currentTextIndex = 0;
        this.timer = 0;
        this.state = 0; // 0: Wait, 1: Fade In, 2: Show, 3: Fade Out
        
        this.uiElement = document.getElementById("intro-screen");
        this.textElement = document.getElementById("intro-text-container");
    }
    init() {
        console.log("Intro Init");
        this.uiElement.classList.remove("hidden");
        this.textElement.innerText = this.texts[this.currentTextIndex];
        this.textElement.style.opacity = 0;
        this.state = 1;
        this.timer = 0;
    }
    update(delta) {
        this.timer += delta;
        if (this.state === 1 && this.timer > 1.0) { // Fade in done
            this.textElement.style.opacity = 1;
            this.state = 2;
            this.timer = 0;
        } else if (this.state === 2 && this.timer > 3.0) { // Wait done
            this.textElement.style.opacity = 0;
            this.state = 3;
            this.timer = 0;
        } else if (this.state === 3 && this.timer > 1.5) { // Fade out done
            this.currentTextIndex++;
            if (this.currentTextIndex < this.texts.length) {
                this.textElement.innerText = this.texts[this.currentTextIndex];
                this.state = 1;
            } else {
                // Done intro
                this.uiElement.classList.add("hidden");
                sceneManager.changeScene("bedroom");
                // Inform user to click
                objectiveSystem.setObjective("Click to explore the room.");
            }
            this.timer = 0;
        }
    }
    dispose() {
        this.uiElement.classList.add("hidden");
    }
}
const introScene = new Intro();


/* --- js/scenes/Bedroom.js --- */
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
        
        // Start bedroom audio
        audioManager.play("clock");
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
            const playerPos = game.cameraSys.camera.position;
            
            // Clock spatialization
            const clockPos = new THREE.Vector3(0, 2.2, -4.74);
            const distToClock = playerPos.distanceTo(clockPos);
            // Full volume at 1m, 0 at 8m
            let clockVol = 1.0 - ((distToClock - 1) / 7);
            if(clockVol < 0) clockVol = 0;
            if(clockVol > 1) clockVol = 1;
            audioManager.setTrackVolume("clock", clockVol);
        }
    }

    dispose() {
        audioManager.stop("clock");
    }
}
const bedroomScene = new Bedroom();


/* --- js/core/SceneManager.js --- */
class SceneManager {
    constructor() {
        this.scenes = {
            "mainmenu": mainMenuScene,
            "intro": introScene,
            "bedroom": bedroomScene
        };
        this.currentSceneName = null;
        this.currentScene = null;
    }

    changeScene(name) {
        if (this.currentScene) {
            this.currentScene.dispose();
        }
        
        this.currentSceneName = name;
        this.currentScene = this.scenes[name];
        
        if (this.currentScene) {
            this.currentScene.init();
        }
    }

    update(delta) {
        if (this.currentScene) {
            this.currentScene.update(delta);
        }
    }
}
const sceneManager = new SceneManager();


/* --- js/core/Game.js --- */
class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Cap pixel ratio to 2 to prevent extreme performance drops on 4K/retina displays
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better looking, optimized shadows
        
        this.clock = new THREE.Clock();
        
        // Initialize Player for the game (global)
        this.cameraSys = new FirstPersonCamera(bedroomScene.scene); // Pass bedroom scene for now
        this.player = new PlayerController(bedroomScene.scene, this.cameraSys);
        
        window.addEventListener('resize', () => this.onWindowResize(), false);


        // Start game at Main Menu
        sceneManager.changeScene("mainmenu");
        
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // Update first person camera
        this.cameraSys.camera.aspect = aspect;
        this.cameraSys.camera.updateProjectionMatrix();
        
        // Update main menu camera
        mainMenuScene.camera.aspect = aspect;
        mainMenuScene.camera.updateProjectionMatrix();
        
        // Adjust plane size in main menu to fit new aspect
        if (mainMenuScene.plane) {
            const distance = 5;
            const vFov = mainMenuScene.camera.fov * Math.PI / 180;
            const planeHeight = 2 * Math.tan(vFov / 2) * distance;
            const planeWidth = planeHeight * aspect;
            mainMenuScene.plane.geometry.dispose();
            mainMenuScene.plane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    loop() {
        requestAnimationFrame(this.loop);
        
        const delta = this.clock.getDelta();
        
        sceneManager.update(delta);
        this.player.update(delta);
        horrorEventManager.update(delta);
        
        if (sceneManager.currentSceneName) {
            let camToRender = this.cameraSys.camera;
            let sceneToRender = sceneManager.currentScene.scene;
            
            if (sceneManager.currentSceneName === "mainmenu") {
                camToRender = mainMenuScene.camera;
                sceneToRender = mainMenuScene.scene; // Render the image plane
            } else if (sceneManager.currentSceneName === "intro") {
                camToRender = introScene.camera;
            }
            
            if (sceneToRender) {
                this.renderer.render(sceneToRender, camToRender);
            }
        }
    }
}

window.onload = () => {
    console.log("3D Game Started");
    window.game = new Game();
};

