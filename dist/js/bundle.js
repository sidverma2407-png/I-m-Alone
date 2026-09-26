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
        const intersects = this.raycaster.intersectObjects(this.interactables, true); // Must be true for Groups

        if (intersects.length > 0 && intersects[0].distance < 3) { // 3 units interaction range
            // Walk up parents if we hit a child mesh of a Group
            let obj = intersects[0].object;
            while (obj && !obj.userData.interactable && obj.parent) {
                obj = obj.parent;
            }
            
            if (obj && obj.userData.interactable) {
                if (this.currentInteractable !== obj) {
                    this.currentInteractable = obj;
                    interactionPromptUI.show(obj.userData.promptText);
                }
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
        this.speed = 1.3; // Walk speed (realistic slow pace)
        this.sprintSpeed = 2.4; // Sprint speed (realistic jog)
        this.crouchSpeed = 0.8;
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
        
        // Head bobbing logic
        const movementSpeed = Math.sqrt(deltaXLocal * deltaXLocal + deltaZLocal * deltaZLocal);
        if (movementSpeed > 0.001) {
            this.bobTimer = (this.bobTimer || 0) + delta * currentSpeed * 2.5;
            this.cameraSys.camera.position.y = Math.sin(this.bobTimer) * 0.05;
        } else {
            // reset camera Y smoothly
            this.cameraSys.camera.position.y += (0 - this.cameraSys.camera.position.y) * 10 * delta;
        }
        
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
        
        // Fast, punchy timeline
        if (t >= 1.5 && this.phase === 0) {
            this.showText("YOU ARE SID.");
            this.phase++;
        }
        else if (t >= 3.5 && this.phase === 1) { // 2s hold
            this.hideText();
            this.phase++;
        }
        else if (t >= 4.5 && this.phase === 2) { // 1s gap
            this.showText("AND THEN...");
            this.phase++;
        }
        else if (t >= 6.5 && this.phase === 3) { // 2s hold
            this.hideText();
            this.phase++;
        }
        else if (t >= 7.5 && this.phase === 4) { // 1s gap
            this.showText("YOU WAKE UP.", "intro-text-large");
            this.phase++;
        }
        else if (t >= 9.5 && this.phase === 5) {
            this.hideText();
            this.phase++;
        }
        else if (t >= 10.5 && this.phase === 6) { // 3:14 AM appears exactly at 10.5s to sync with bell!
            this.showText("3:14 AM", "intro-text-largest");
            this.phase++;
        }
        else if (t >= 13.0 && this.phase === 7) { // 2.5s hold for emphasis
            this.hideText();
            this.phase++;
        }
        else if (t >= 14.0 && this.phase === 8) {
            this.showText("SOMEONE IS WAITING.", "intro-text-creepy");
            this.phase++;
        }
        else if (t >= 17.0 && this.phase === 9) {
            this.hideText();
            this.phase++;
        }
        else if (t >= 19.0 && this.phase === 10) {
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
            this.textElement.style.transition = "opacity 1s ease"; // Fast 1s fade in!
        }
        
        this.textElement.style.opacity = 1;
    }
    
    hideText() {
        this.textElement.style.transition = "opacity 1s ease"; // Fast 1s fade out!
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
        audioManager.fadeOut("clock", 3000); 
        sceneManager.changeScene("bedroom");
        objectiveSystem.setObjective("DRINK SOME WATER (Click to play, WASD to move)");
    }
    
    dispose() {
        this.uiElement.classList.add("hidden");
    }
}

const introScene = new Intro();


/* --- js/scenes/DetailedFurniture.js --- */
// DetailedFurniture.js

// Helper to create a mesh
function createMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createDetailedBed(woodMat, mattressMat, blanketMat, pillowMat) {
    const group = new THREE.Group();

    // Bed Frame
    const frameGeo = new THREE.BoxGeometry(1.6, 0.2, 2.1);
    const frame = createMesh(frameGeo, woodMat);
    frame.position.y = 0.3;
    group.add(frame);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
    const legPositions = [
        [-0.75, 0.2, -1.0], [0.75, 0.2, -1.0],
        [-0.75, 0.2, 1.0], [0.75, 0.2, 1.0]
    ];
    legPositions.forEach(pos => {
        const leg = createMesh(legGeo, woodMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });

    // Headboard
    const headboardGeo = new THREE.BoxGeometry(1.7, 1.0, 0.1);
    const headboard = createMesh(headboardGeo, woodMat);
    headboard.position.set(0, 0.7, -1.0);
    group.add(headboard);

    // Mattress
    const mattressGeo = new THREE.BoxGeometry(1.5, 0.25, 2.0);
    const mattress = createMesh(mattressGeo, mattressMat);
    mattress.position.set(0, 0.525, 0);
    group.add(mattress);

    // Blanket
    const blanketGeo = new THREE.BoxGeometry(1.55, 0.26, 1.4);
    const blanket = createMesh(blanketGeo, blanketMat);
    blanket.position.set(0, 0.53, 0.3);
    group.add(blanket);

    // Pillows
    const pillowGeo = new THREE.BoxGeometry(0.6, 0.1, 0.4);
    const pillow1 = createMesh(pillowGeo, pillowMat);
    pillow1.position.set(-0.35, 0.7, -0.7);
    // Add slight rotation for realism
    pillow1.rotation.x = 0.1;
    group.add(pillow1);

    const pillow2 = createMesh(pillowGeo, pillowMat);
    pillow2.position.set(0.35, 0.7, -0.7);
    pillow2.rotation.x = 0.1;
    group.add(pillow2);

    return group;
}

function createDetailedDesk(woodMat, metalMat) {
    const group = new THREE.Group();

    // Top
    const topGeo = new THREE.BoxGeometry(1.5, 0.05, 0.7);
    const top = createMesh(topGeo, woodMat);
    top.position.y = 0.75;
    group.add(top);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
    const legPositions = [
        [-0.7, 0.375, -0.3], [0.7, 0.375, -0.3],
        [-0.7, 0.375, 0.3], [0.7, 0.375, 0.3]
    ];
    legPositions.forEach(pos => {
        const leg = createMesh(legGeo, metalMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });

    // Drawers box
    const drawersGeo = new THREE.BoxGeometry(0.4, 0.4, 0.65);
    const drawers = createMesh(drawersGeo, woodMat);
    drawers.position.set(0.5, 0.5, 0);
    group.add(drawers);

    // Drawer fronts and handles
    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.1, 8);
    handleGeo.rotateZ(Math.PI / 2);
    
    for (let i = 0; i < 2; i++) {
        const dFrontGeo = new THREE.BoxGeometry(0.38, 0.18, 0.02);
        const dFront = createMesh(dFrontGeo, woodMat);
        dFront.position.set(0.5, 0.6 - i*0.2, 0.33);
        group.add(dFront);

        const handle = createMesh(handleGeo, metalMat);
        handle.position.set(0.5, 0.6 - i*0.2, 0.35);
        group.add(handle);
    }

    return group;
}

function createDetailedChair(frameMat, seatMat) {
    const group = new THREE.Group();

    // Base Center
    const baseCenterGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 16);
    const baseCenter = createMesh(baseCenterGeo, frameMat);
    baseCenter.position.y = 0.2;
    group.add(baseCenter);

    // Legs (star base)
    const legGeo = new THREE.BoxGeometry(0.04, 0.04, 0.3);
    for(let i=0; i<5; i++) {
        const leg = createMesh(legGeo, frameMat);
        leg.position.y = 0.05;
        leg.rotation.y = (Math.PI * 2 / 5) * i;
        leg.translateZ(0.15);
        group.add(leg);
        
        // Caster wheels
        const wheelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
        wheelGeo.rotateZ(Math.PI / 2);
        const wheel = createMesh(wheelGeo, frameMat);
        wheel.position.copy(leg.position);
        wheel.translateZ(0.12);
        wheel.position.y = 0.03;
        group.add(wheel);
    }

    // Seat
    const seatGeo = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    const seat = createMesh(seatGeo, seatMat);
    seat.position.y = 0.45;
    group.add(seat);

    // Backrest support
    const supportGeo = new THREE.BoxGeometry(0.05, 0.4, 0.05);
    const support = createMesh(supportGeo, frameMat);
    support.position.set(0, 0.7, -0.2);
    // Slight angle
    support.rotation.x = -0.1;
    group.add(support);

    // Backrest
    const backrestGeo = new THREE.BoxGeometry(0.45, 0.4, 0.08);
    const backrest = createMesh(backrestGeo, seatMat);
    backrest.position.set(0, 0.9, -0.22);
    backrest.rotation.x = -0.1;
    group.add(backrest);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.05, 0.2, 0.3);
    const armL = createMesh(armGeo, seatMat);
    armL.position.set(-0.25, 0.6, 0);
    group.add(armL);
    
    const armR = createMesh(armGeo, seatMat);
    armR.position.set(0.25, 0.6, 0);
    group.add(armR);

    return group;
}

function createDetailedWardrobe(woodMat, metalMat) {
    const group = new THREE.Group();

    // Main body
    const bodyGeo = new THREE.BoxGeometry(1.2, 2.0, 0.6);
    const body = createMesh(bodyGeo, woodMat);
    body.position.y = 1.0;
    group.add(body);

    // Baseboard
    const baseGeo = new THREE.BoxGeometry(1.22, 0.1, 0.62);
    const base = createMesh(baseGeo, woodMat);
    base.position.y = 0.05;
    group.add(base);

    // Top trim
    const topGeo = new THREE.BoxGeometry(1.25, 0.05, 0.65);
    const top = createMesh(topGeo, woodMat);
    top.position.y = 2.025;
    group.add(top);

    // Doors
    const doorGeo = new THREE.BoxGeometry(0.58, 1.8, 0.04);
    const doorL = createMesh(doorGeo, woodMat);
    doorL.position.set(-0.3, 1.05, 0.3);
    group.add(doorL);

    const doorR = createMesh(doorGeo, woodMat);
    doorR.position.set(0.3, 1.05, 0.3);
    group.add(doorR);

    // Handles
    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8);
    const handleL = createMesh(handleGeo, metalMat);
    handleL.position.set(-0.05, 1.0, 0.33);
    group.add(handleL);

    const handleR = createMesh(handleGeo, metalMat);
    handleR.position.set(0.05, 1.0, 0.33);
    group.add(handleR);

    return group;
}

function createDetailedNightstand(woodMat, metalMat) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.4);
    const body = createMesh(bodyGeo, woodMat);
    body.position.y = 0.25;
    group.add(body);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.01, 0.1, 8);
    const legPositions = [
        [-0.2, 0.05, -0.15], [0.2, 0.05, -0.15],
        [-0.2, 0.05, 0.15], [0.2, 0.05, 0.15]
    ];
    legPositions.forEach(pos => {
        const leg = createMesh(legGeo, metalMat);
        leg.position.set(pos[0], pos[1], pos[2]);
        group.add(leg);
    });
    // Adjust body up due to legs
    body.position.y = 0.35;

    // Top
    const topGeo = new THREE.BoxGeometry(0.52, 0.02, 0.42);
    const top = createMesh(topGeo, woodMat);
    top.position.y = 0.61;
    group.add(top);

    // Drawers
    const drawerGeo = new THREE.BoxGeometry(0.46, 0.2, 0.02);
    const handleGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
    handleGeo.rotateZ(Math.PI/2);

    for(let i=0; i<2; i++) {
        const drawer = createMesh(drawerGeo, woodMat);
        drawer.position.set(0, 0.22 + i*0.22, 0.21);
        group.add(drawer);

        const handle = createMesh(handleGeo, metalMat);
        handle.position.set(0, 0.22 + i*0.22, 0.23);
        group.add(handle);
    }

    return group;
}

function createDetailedWindowFrame(woodMat, glassMat) {
    const group = new THREE.Group();
    // Assuming size 1.5w x 2.0h, centering at origin

    // Outer Frame
    const frameVertGeo = new THREE.BoxGeometry(0.1, 2.0, 0.1);
    const frameLeft = createMesh(frameVertGeo, woodMat);
    frameLeft.position.set(-0.7, 0, 0);
    group.add(frameLeft);

    const frameRight = createMesh(frameVertGeo, woodMat);
    frameRight.position.set(0.7, 0, 0);
    group.add(frameRight);

    const frameHorzGeo = new THREE.BoxGeometry(1.5, 0.1, 0.1);
    const frameTop = createMesh(frameHorzGeo, woodMat);
    frameTop.position.set(0, 0.95, 0);
    group.add(frameTop);

    const frameBottom = createMesh(frameHorzGeo, woodMat);
    frameBottom.position.set(0, -0.95, 0);
    group.add(frameBottom);

    // Sill (bottom wider part)
    const sillGeo = new THREE.BoxGeometry(1.6, 0.05, 0.15);
    const sill = createMesh(sillGeo, woodMat);
    sill.position.set(0, -1.025, 0.025);
    group.add(sill);

    // Middle Divider
    const dividerGeo = new THREE.BoxGeometry(0.05, 2.0, 0.05);
    const divider = createMesh(dividerGeo, woodMat);
    group.add(divider);

    const dividerHGeo = new THREE.BoxGeometry(1.5, 0.05, 0.05);
    const dividerH = createMesh(dividerHGeo, woodMat);
    group.add(dividerH);

    // Glass Panes
    const glassGeo = new THREE.PlaneGeometry(0.65, 0.9);
    const positions = [
        [-0.35, 0.45, 0], [0.35, 0.45, 0],
        [-0.35, -0.45, 0], [0.35, -0.45, 0]
    ];
    positions.forEach(pos => {
        const pane = createMesh(glassGeo, glassMat);
        pane.position.set(pos[0], pos[1], pos[2]);
        group.add(pane);
        
        // Add back face for glass if needed
        const paneBack = createMesh(glassGeo, glassMat);
        paneBack.position.set(pos[0], pos[1], pos[2]);
        paneBack.rotation.y = Math.PI;
        group.add(paneBack);
    });

    return group;
}

function createDetailedClock(bodyMat, glassMat, emissiveMat) {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.3, 0.15, 0.1);
    const body = createMesh(bodyGeo, bodyMat);
    group.add(body);

    // Screen border/chamfer
    const screenBorderGeo = new THREE.BoxGeometry(0.25, 0.1, 0.11);
    const screenBorder = createMesh(screenBorderGeo, bodyMat);
    // Move it slightly forward to overlay
    screenBorder.position.z = 0.01;
    group.add(screenBorder);

    // Glass/Screen
    const screenGeo = new THREE.BoxGeometry(0.23, 0.08, 0.12);
    const screen = createMesh(screenGeo, glassMat);
    group.add(screen);

    // Glowy text area (simulate with a small plane)
    const textGeo = new THREE.PlaneGeometry(0.18, 0.06);
    const text = createMesh(textGeo, emissiveMat);
    text.position.set(0, 0, 0.061);
    group.add(text);

    return group;
}

function createDetailedPainting(frameMat, canvasMat) {
    const group = new THREE.Group();

    // Canvas
    const canvasGeo = new THREE.BoxGeometry(1.0, 1.5, 0.02);
    const canvas = createMesh(canvasGeo, canvasMat);
    group.add(canvas);

    // Frame
    const frameVertGeo = new THREE.BoxGeometry(0.05, 1.6, 0.04);
    const frameL = createMesh(frameVertGeo, frameMat);
    frameL.position.set(-0.525, 0, 0.01);
    group.add(frameL);

    const frameR = createMesh(frameVertGeo, frameMat);
    frameR.position.set(0.525, 0, 0.01);
    group.add(frameR);

    const frameHorzGeo = new THREE.BoxGeometry(1.1, 0.05, 0.04);
    const frameT = createMesh(frameHorzGeo, frameMat);
    frameT.position.set(0, 0.775, 0.01);
    group.add(frameT);

    const frameB = createMesh(frameHorzGeo, frameMat);
    frameB.position.set(0, -0.775, 0.01);
    group.add(frameB);

    return group;
}


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
        audioManager.setTrackVolume("rain", 0.6); 
        audioManager.play("menu-tension"); // Play Annabelle Bee music
        audioManager.setTrackVolume("menu-tension", 2.0); // Play it much louder (2x of base 0.25 = 0.5)

        // Start player lying in bed
        if (typeof game !== "undefined" && game.cameraSys) {
            game.cameraSys.yawObject.position.set(-3.5, 0.7, 3.0); // On the bed
            game.cameraSys.pitchObject.rotation.x = -Math.PI / 2; // Looking at ceiling
            game.cameraSys.yawObject.rotation.y = Math.PI / 2; // Facing side

            // Subtle wake-up animation
            const targetX = -2.0; // Stand next to the bed (fixes getting stuck in collider)
            const targetY = 1.75; // Standing height
            const targetPitch = 0; // Looking straight
            
            let progress = 0;
            this.wakeUpInterval = setInterval(() => {
                progress += 0.02;
                if (progress >= 1) {
                    game.cameraSys.yawObject.position.set(targetX, targetY, 3.0);
                    game.cameraSys.pitchObject.rotation.x = targetPitch;
                    clearInterval(this.wakeUpInterval);
                    return;
                }
                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);
                game.cameraSys.yawObject.position.x = -3.5 + (targetX - (-3.5)) * ease; // slide off bed
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
            } else if (type === 'wood_vertical') { 
                const x = (i / 4) % width;
                if (x % 32 < 2) {
                    noise = -50; 
                } else {
                    noise = (Math.random() - 0.5) * 10 + Math.sin(x * 0.5) * 5; 
                }
            } else if (type === 'wood_floor') { 
                const y = Math.floor((i / 4) / width);
                if (y % 64 < 2) {
                    noise = -30;
                } else {
                    noise = (Math.random() - 0.5) * 10; 
                }
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
        // High-Quality Procedural Textures (Themed)
        const woodTex = this.generateProceduralTexture('wood', '#2b1b11', 256, 256);
        const wallTex = this.generateProceduralTexture('wood_vertical', '#332014', 512, 512); 
        const fabricTex = this.generateProceduralTexture('fabric', '#2d3238', 128, 128);
        const blanketTex = this.generateProceduralTexture('fabric', '#424855', 128, 128);
        const floorTex = this.generateProceduralTexture('wood_floor', '#443224', 512, 512); 
        const rugTex = this.generateProceduralTexture('fabric', '#55585b', 256, 256);
        
        wallTex.repeat.set(10, 3);
        floorTex.repeat.set(5, 5);
        rugTex.repeat.set(3, 3);

        const paperTex = this.generateProceduralTexture('noise', '#eeeeee', 64, 64);
        const paintingCanvasTex = this.generateProceduralTexture('noise', '#111111', 128, 128);
        const glassTex = this.generateProceduralTexture('noise', '#aaaacc', 64, 64);
        const ceilingTex = this.generateProceduralTexture('noise', '#a49f99', 256, 256);

        // Advanced Materials
        const floorMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85, bumpMap: floorTex, bumpScale: 0.005 });
        const rugMat = new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1.0, bumpMap: rugTex, bumpScale: 0.02 });
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.8, bumpMap: wallTex, bumpScale: 0.01 });
        const ceilingMat = new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 1.0 });
        const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.7, bumpMap: woodTex, bumpScale: 0.02, metalness: 0.05 });
        const whiteWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a3a30, roughness: 0.8 }); // matched to dark wood for trim
        const fabricMat = new THREE.MeshStandardMaterial({ map: fabricTex, roughness: 1.0, bumpMap: fabricTex, bumpScale: 0.05 });
        const blanketMat = new THREE.MeshStandardMaterial({ map: blanketTex, roughness: 1.0, bumpMap: blanketTex, bumpScale: 0.05 });
        const pillowMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.9 });
        const paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.8 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.8 });
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
        
        // Large Grey Rug
        const rug = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = 0.01;
        rug.receiveShadow = true;
        this.scene.add(rug);

        // Ceiling
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), ceilingMat);
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

        // Ambient Moonlight (Cinematic - Extremely Dark)
        const moonlight = new THREE.DirectionalLight(0x7799bb, 0.35); // Dimmer, almost dark
        moonlight.position.set(0, 3, -8); 
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
        
        // Very soft fill light to keep pitch black corners barely visible
        const ambient = new THREE.AmbientLight(0x1a2230, 0.05); // near pitch black
        this.scene.add(ambient);
        
        // 1. Bed (South-West corner)
        const bed = createDetailedBed(woodMat, fabricMat, blanketMat, pillowMat);
        bed.position.set(-3.5, 0, 3.0);
        bed.rotation.y = Math.PI / 2; // Rotate 90 degrees to face headboard against the West wall
        this.scene.add(bed);
        this.colliders.push(bed);
        
        interactionSystem.add(bed, () => {
            showSubtitle("I should probably get up.");
        }, "Bed");
        
        // 1.5 Bookshelf (West wall)
        const bookshelfGroup = new THREE.Group();
        const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.4), woodMat);
        shelfFrame.position.y = 1.0;
        bookshelfGroup.add(shelfFrame);
        // Cutout for shelves
        const shelfInner = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 0.38), blackMat);
        shelfInner.position.set(0, 1.0, 0.02);
        bookshelfGroup.add(shelfInner);
        for(let i=0; i<4; i++) {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.38), woodMat);
            shelf.position.set(0, 0.4 + i * 0.4, 0.02);
            bookshelfGroup.add(shelf);
        }
        bookshelfGroup.position.set(-4.5, 0, 0); // Against West wall
        bookshelfGroup.rotation.y = Math.PI / 2; // Face East
        this.scene.add(bookshelfGroup);
        this.colliders.push(bookshelfGroup);
        interactionSystem.add(bookshelfGroup, () => {
            showSubtitle("Some dusty old books.");
        }, "Bookshelf");
        
        // 2. Cupboard / Wardrobe (North-West corner)
        const cupboard = createDetailedWardrobe(woodMat, metalMat);
        cupboard.position.set(-4.0, 0, -4.0);
        // Slightly rotate for organic placement
        cupboard.rotation.y = 0.05;
        this.scene.add(cupboard);
        this.colliders.push(cupboard);
        interactionSystem.add(cupboard, () => {
            showSubtitle("Empty mostly.");
            if (objectiveSystem.step === 5) objectiveSystem.advanceTo(6);
        }, "Wardrobe");
        
        // 3. Desk (East wall)
        const desk = createDetailedDesk(woodMat, metalMat);
        desk.position.set(3.5, 0, -2.0); // Moved slightly inwards onto the rug
        this.scene.add(desk);
        this.colliders.push(desk);
        
        // 4. Chair
        const chair = createDetailedChair(metalMat, fabricMat);
        chair.position.set(2.5, 0, -2.0); // Adjusted for new desk position
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
        
        lampGroup.position.set(3.6, 0.8, -2.8);
        this.scene.add(lampGroup);
        
        lampBase.userData.light = lampLight;
        interactionSystem.add(lampBase, () => {
            if (lampLight.intensity === 0) {
                lampLight.intensity = 1.0;
                audioManager.play("rattle");
                objectiveSystem.advanceTo(4);
            } else {
                lampLight.intensity = 0;
                audioManager.play("rattle"); 
            }
        }, "Table Lamp");

        // 6. Clock (on desk)
        const clock = createDetailedClock(blackMat, glassMat, emissiveMat);
        clock.position.set(3.7, 0.85, -1.2);
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

        // 8.5 Poster (North wall)
        const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), paperMat);
        poster.position.set(-2.0, 1.8, -4.95);
        this.scene.add(poster);
        interactionSystem.add(poster, () => {
            showSubtitle("A torn band poster.");
        }, "Poster");

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
        laptop.position.set(3.4, 0.81, -2.0); // Adjusted for new desk position
        laptop.rotation.y = 0.1;
        this.scene.add(laptop);
        interactionSystem.add(laptop, () => {
            showSubtitle("Dead battery.");
        }, "Laptop");
        
        const diary = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.15), new THREE.MeshStandardMaterial({ color: 0x5a2a2a, roughness: 0.9 }));
        diary.position.set(3.7, 0.815, -2.3);
        diary.rotation.y = -0.15;
        this.scene.add(diary);
        interactionSystem.add(diary, () => {
            showSubtitle("My internship notes.");
        }, "Notebook");

        // 11. Backpack & Suitcase
        const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.4), new THREE.MeshStandardMaterial({ color: 0x113355, roughness: 1.0 }));
        backpack.position.set(2.0, 0.3, 2.0); // Adjusted closer to center
        backpack.rotation.y = Math.PI / 4;
        backpack.castShadow = true;
        this.scene.add(backpack);
        this.colliders.push(backpack);
        interactionSystem.add(backpack, () => {
            showSubtitle("My stuff.");
        }, "Backpack");
        
        const suitcase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.5), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 }));
        suitcase.position.set(3.0, 0.15, 2.5);
        suitcase.rotation.y = 0.1;
        suitcase.castShadow = true;
        this.scene.add(suitcase);
        this.colliders.push(suitcase);

        // 12. Clothes
        const clothes = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: 0x552222, roughness: 1.0 }));
        clothes.position.set(2.5, 0.55, -2.0); // on chair seat
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
            if (objectiveSystem.step === 0) objectiveSystem.advanceTo(1);
            setTimeout(() => { waterBottle.visible = true; }, 3000); 
        }, "Water Bottle");

        // 16. Internship Documents
        const docs = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.25), paperMat);
        docs.position.set(3.3, 0.811, -1.7);
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
        // Cap pixel ratio to 1.5 to prevent extreme performance drops on 4K/retina displays
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better looking, optimized shadows
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
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

