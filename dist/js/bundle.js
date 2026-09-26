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

function showSubtitle(text, duration = 3000) {
    const container = document.getElementById("subtitle-container");
    const textEl = document.getElementById("subtitle-text");
    textEl.innerText = text;
    container.classList.remove("hidden");
    container.style.opacity = 1;
    
    if (window.subtitleTimeout) clearTimeout(window.subtitleTimeout);
    window.subtitleTimeout = setTimeout(() => {
        container.style.opacity = 0;
        setTimeout(() => container.classList.add("hidden"), 500);
    }, duration);
}


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

        // Handle Lightning flash effect
        if (this.lightningFlashRemaining > 0) {
            this.lightningFlashRemaining -= delta;
            
            if (sceneManager.currentSceneName === "bedroom" && lightingSystem.moonLight) {
                lightingSystem.moonLight.intensity = 5.0 + Math.random() * 2.0; 
            } else if (sceneManager.currentSceneName === "mainmenu" && mainMenuScene.plane) {
                mainMenuScene.plane.material.color.setHex(0xffffff);
            }
        } else {
            if (lightingSystem.moonLight) {
                lightingSystem.moonLight.intensity = 0.5;
            }
            if (mainMenuScene.plane) {
                mainMenuScene.plane.material.color.setHex(0x888888);
            }
        }

        // Clock Stops Event Logic
        if (this.clockEventActive) {
            // Wait for player to look at the clock
            if (this.clockEventPhase === 0) {
                if (typeof game !== "undefined" && game.cameraSys) {
                    const camera = game.cameraSys.camera;
                    const raycaster = new THREE.Raycaster();
                    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
                    
                    if (sceneManager.currentScene && sceneManager.currentScene.clockMesh) {
                        const intersects = raycaster.intersectObject(sceneManager.currentScene.clockMesh);
                        if (intersects.length > 0) {
                            this.clockEventPhase = 1;
                            this.clockLookTime = now;
                        }
                    }
                }
            } 
            // Player looked at clock -> wait 2 seconds, play 1 tick
            else if (this.clockEventPhase === 1) {
                if (now - this.clockLookTime > 2000) {
                    // We don't have a dedicated single tick sound, so we'll just quickly play/pause the clock audio
                    audioManager.play("clock");
                    setTimeout(() => { audioManager.stop("clock"); }, 500); // Stop after half a sec
                    this.clockEventPhase = 2;
                }
            }
            // Wait for player to look away
            else if (this.clockEventPhase === 2) {
                if (typeof game !== "undefined" && game.cameraSys) {
                    const camera = game.cameraSys.camera;
                    const raycaster = new THREE.Raycaster();
                    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
                    
                    if (sceneManager.currentScene && sceneManager.currentScene.clockMesh) {
                        const intersects = raycaster.intersectObject(sceneManager.currentScene.clockMesh);
                        if (intersects.length === 0) {
                            // Player looked away!
                            this.clockEventPhase = 3;
                            
                            // Play three rapid ticks, then resume
                            let ticks = 0;
                            const rapidTick = setInterval(() => {
                                audioManager.play("clock");
                                setTimeout(() => { audioManager.stop("clock"); }, 200);
                                ticks++;
                                if (ticks >= 3) {
                                    clearInterval(rapidTick);
                                    // Resume normal ticking
                                    setTimeout(() => {
                                        audioManager.play("clock");
                                        this.clockEventActive = false;
                                    }, 500);
                                }
                            }, 300);
                        }
                    }
                }
            }
        }
    }
}
const horrorEventManager = new HorrorEventManager();


/* --- js/systems/ObjectiveSystem.js --- */
class ObjectiveSystem {
    constructor() {
        this.currentObjective = "";
        this.step = 0;
        this.container = document.getElementById("objective-container");
        this.textElement = document.getElementById("objective-text");
    }

    setObjective(text) {
        this.currentObjective = text;
        this.textElement.innerText = text;
        this.container.classList.remove("hidden");
        
        // Add a slight highlight animation
        this.container.style.animation = "none";
        void this.container.offsetWidth; // Reflow
        this.container.style.animation = "objectiveUpdate 2s ease";
    }

    advanceTo(step) {
        if (this.step >= step) return;
        this.step = step;
        
        switch(step) {
            case 1:
                this.setObjective("LOOK AROUND");
                break;
            case 2:
                this.setObjective("CHECK YOUR PHONE");
                break;
            case 3:
                this.setObjective("TURN ON THE LIGHT");
                break;
            case 4:
                this.setObjective("CHECK THE TIME");
                // Trigger the first subtle horror event shortly after turning on the light!
                setTimeout(() => {
                    horrorEventManager.clockEventActive = true;
                    horrorEventManager.clockEventPhase = 0;
                    audioManager.stop("clock"); // Abruptly stop the clock
                }, 5000); // 5 seconds after light goes on
                break;
            case 5:
                this.setObjective("INVESTIGATE THE ROOM");
                break;
            case 6:
                this.setObjective("FIND YOUR INTERNSHIP DOCUMENTS");
                break;
            case 7:
                this.setObjective("LEAVE THE BEDROOM");
                break;
        }
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
        this.element.style.transition = "background-color 1.5s ease";
        this.element.style.backgroundColor = "#000";
        
        // Hide all text except selected
        const children = this.element.children;
        for(let i=0; i<children.length; i++) {
            if (children[i].classList && children[i].classList.contains('menu-options')) {
                // Fade unselected options
                const opts = children[i].children;
                for(let j=0; j<opts.length; j++) {
                    if (!opts[j].classList.contains('active')) {
                        opts[j].style.transition = "opacity 1.5s ease";
                        opts[j].style.opacity = "0";
                    }
                }
            } else {
                children[i].style.transition = "opacity 1.5s ease";
                children[i].style.opacity = "0";
            }
        }

        audioManager.fadeOut("menu-music", 3000);
        audioManager.fadeOut("menu-tension", 3000);
        
        // Stop the menu thunder scheduler
        if (typeof horrorEventManager !== 'undefined') {
            horrorEventManager.nextThunderTime = performance.now() + 999999;
        }
        
        // Clock starts 0.5s after clicking NEW GAME
        setTimeout(() => {
            audioManager.fadeIn("clock", 2000);
        }, 500);
        
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
        }, 1500);
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


/* --- js/scenes/intro.js --- */
class Intro {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.uiElement = document.getElementById("intro-screen");
        this.textElement = document.getElementById("intro-text-container");
        
        this.uiElement.style.backgroundColor = "#000";
        this.uiElement.style.display = "flex";
        this.uiElement.style.justifyContent = "center";
        this.uiElement.style.alignItems = "center";
        this.uiElement.style.width = "100%";
        this.uiElement.style.height = "100%";
        this.uiElement.style.position = "absolute";
        this.uiElement.style.top = "0";
        this.uiElement.style.left = "0";
        this.uiElement.style.zIndex = "100";
        
        this.skipListener = (e) => {
            if (sceneManager.currentSceneName === "intro" && (e.code === "Space" || e.code === "Enter")) {
                this.skip();
            }
        };
        document.addEventListener("keydown", this.skipListener);
    }
    
    init() {
        console.log("Intro Init");
        this.uiElement.classList.remove("hidden");
        this.textElement.style.opacity = 0;
        this.textElement.className = "intro-text-cinematic";
        this.totalTime = 0; 
        this.phase = 0;
        this.skipped = false;
        
        if (horrorEventManager.nextThunderTime) {
            horrorEventManager.nextThunderTime = performance.now() + 9999999;
        }
    }
    
    update(delta) {
        if (this.skipped) return;
        this.totalTime += delta;
        
        const t = this.totalTime + 1.5; 
        
        // Exact timeline from prompt
        if (t >= 1.5 && this.phase === 0) {
            this.showText("YOU ARE SID.");
            this.phase++;
        }
        else if (t >= 3.0 && this.phase === 1) { 
            this.hideText();
            this.phase++;
        }
        else if (t >= 3.5 && this.phase === 2) { 
            this.showText("AND THEN...");
            this.phase++;
        }
        else if (t >= 4.0 && this.phase === 3) { 
            this.hideText();
            this.phase++;
        }
        else if (t >= 4.5 && this.phase === 4) { 
            this.showText("YOU WAKE UP.", "intro-text-large");
            this.phase++;
        }
        else if (t >= 6.0 && this.phase === 5) { 
            this.hideText();
            this.phase++;
        }
        else if (t >= 6.5 && this.phase === 6) { 
            this.showText("3:14 AM", "intro-text-largest");
            this.phase++;
        }
        else if (t >= 8.0 && this.phase === 7) { 
            this.hideText();
            this.phase++;
        }
        else if (t >= 8.5 && this.phase === 8) { 
            this.showText("THE HOUSE IS SILENT.");
            this.phase++;
        }
        else if (t >= 9.5 && this.phase === 9) { 
            this.hideText();
            this.phase++;
        }
        else if (t >= 10.0 && this.phase === 10) { 
            this.showText("NO ONE IS HOME.");
            this.phase++;
        }
        else if (t >= 11.0 && this.phase === 11) { 
            this.hideText();
            this.phase++;
        }
        else if (t >= 11.5 && this.phase === 12) { 
            this.showText("SOMEONE IS WAITING.", "intro-text-creepy");
            this.phase++;
        }
        else if (t >= 13.5 && this.phase === 13) { 
            this.hideText();
            this.phase++;
        }
        else if (t >= 14.5 && this.phase === 14) { 
            this.finish();
        }
    }
    
    showText(text, extraClass = "") {
        this.textElement.style.transition = "none";
        this.textElement.style.opacity = 0;
        this.textElement.innerText = text;
        this.textElement.className = "intro-text-cinematic " + extraClass;
        
        void this.textElement.offsetWidth;
        
        if (extraClass === "intro-text-creepy") {
            this.textElement.style.transition = "opacity 2s ease";
        } else {
            this.textElement.style.transition = "opacity 0.5s ease";
        }
        
        this.textElement.style.opacity = 1;
    }
    
    hideText() {
        this.textElement.style.transition = "opacity 0.5s ease";
        this.textElement.style.opacity = 0;
    }
    
    skip() {
        this.skipped = true;
        this.hideText();
        this.finish();
    }
    
    finish() {
        this.uiElement.classList.add("hidden");
        horrorEventManager.nextThunderTime = performance.now() + 10000;
        
        // Clock is NO LONGER faded out here, as requested in prompt:
        // "Clock continues into bedroom without duplication"
        
        sceneManager.changeScene("bedroom");
        objectiveSystem.setObjective("WAKE UP");
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
        
        // Walls
        const wallN = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.2), wallMat);
        wallN.position.set(0, 1.5, -2.1);
        this.scene.add(wallN);
        
        const wallS = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 0.2), wallMat);
        wallS.position.set(0, 1.5, 2.1);
        this.scene.add(wallS);
        
        const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4.4), wallMat);
        wallE.position.set(2.6, 1.5, 0);
        this.scene.add(wallE);
        
        const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4.4), wallMat);
        wallW.position.set(-2.6, 1.5, 0);
        this.scene.add(wallW);
        
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
    }

    dispose() {
        // audioManager.stop("clock"); // User requested no duplication but clock should keep playing
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

