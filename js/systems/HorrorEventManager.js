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
            if (typeof mainMenuScene !== "undefined" && mainMenuScene.plane) {
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
