class HorrorEventManager {
    constructor() {
        this.nextThunderTime = this.getRandomThunderTime();
        this.lightningFlashRemaining = 0;
    }

    getRandomThunderTime() {
        // Next thunder between 15 and 45 seconds from now
        return performance.now() + (15000 + Math.random() * 30000);
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
            this.nextThunderTime = this.getRandomThunderTime();
        }

        // Handle Lightning flash effect on Bedroom lighting
        if (this.lightningFlashRemaining > 0) {
            this.lightningFlashRemaining -= delta;
            
            // Briefly illuminate room
            if (sceneManager.currentSceneName === "bedroom" && lightingSystem.moonLight) {
                lightingSystem.moonLight.intensity = 5.0 + Math.random() * 2.0; // Bright flash
            } else if (sceneManager.currentSceneName === "mainmenu" && mainMenuScene.lightning) {
                mainMenuScene.lightning.intensity = 3.0 + Math.random() * 2.0; // Flash image
            }
        } else {
            // Restore normal moonlight
            if (lightingSystem.moonLight) {
                lightingSystem.moonLight.intensity = 0.5;
            }
            if (mainMenuScene.lightning) {
                mainMenuScene.lightning.intensity = 0;
            }
        }
    }
}
const horrorEventManager = new HorrorEventManager();
