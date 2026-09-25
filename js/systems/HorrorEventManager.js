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
