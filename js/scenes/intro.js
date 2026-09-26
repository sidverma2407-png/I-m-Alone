class Intro {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        this.uiElement = document.getElementById("intro-screen");
        this.textElement = document.getElementById("intro-text-container");
        
        // Ensure black background
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
        this.totalTime = 0; // Relative to intro start (which is 1.5s after click)
        this.phase = 0;
        this.skipped = false;
        
        // Stop menu thunder just in case
        if (horrorEventManager.nextThunderTime) {
            horrorEventManager.nextThunderTime = performance.now() + 9999999;
        }
    }
    
    update(delta) {
        if (this.skipped) return;
        this.totalTime += delta;
        
        const t = this.totalTime + 1.5; 
        
        // 1.5 YOU ARE SID.
        if (t >= 1.5 && this.phase === 0) {
            this.showText("YOU ARE SID.");
            this.phase++;
        }
        else if (t >= 4.0 && this.phase === 1) { // 2.5s hold (including 1.5s fade in)
            this.hideText();
            this.phase++;
        }
        // 6.5 AND THEN... (1.5s fade out + 1s wait = 2.5s later)
        else if (t >= 6.5 && this.phase === 2) { 
            this.showText("AND THEN...");
            this.phase++;
        }
        else if (t >= 9.0 && this.phase === 3) { 
            this.hideText();
            this.phase++;
        }
        // 11.5 YOU WAKE UP.
        else if (t >= 11.5 && this.phase === 4) { 
            this.showText("YOU WAKE UP.", "intro-text-large");
            this.phase++;
        }
        else if (t >= 14.0 && this.phase === 5) {
            this.hideText();
            this.phase++;
        }
        // 16.5 3:14 AM
        else if (t >= 16.5 && this.phase === 6) {
            this.showText("3:14 AM", "intro-text-largest");
            this.phase++;
        }
        else if (t >= 19.0 && this.phase === 7) {
            this.hideText();
            this.phase++;
        }
        // 21.5 THE HOUSE IS SILENT.
        else if (t >= 21.5 && this.phase === 8) {
            this.showText("THE HOUSE IS SILENT.");
            this.phase++;
        }
        else if (t >= 24.0 && this.phase === 9) {
            this.hideText();
            this.phase++;
        }
        // 26.5 NO ONE IS HOME.
        else if (t >= 26.5 && this.phase === 10) {
            this.showText("NO ONE IS HOME.");
            this.phase++;
        }
        else if (t >= 29.0 && this.phase === 11) {
            this.hideText();
            this.phase++;
        }
        // 31.5 SOMEONE IS WAITING.
        else if (t >= 31.5 && this.phase === 12) {
            this.showText("SOMEONE IS WAITING.", "intro-text-creepy");
            this.phase++;
        }
        else if (t >= 34.5 && this.phase === 13) { // Slightly longer hold for the last one
            this.hideText();
            this.phase++;
        }
        // 36.5 Transition to bedroom (1.5s fade + 0.5s black screen)
        else if (t >= 36.5 && this.phase === 14) {
            this.finish();
        }
    }
    
    showText(text, extraClass = "") {
        this.textElement.style.transition = "none";
        this.textElement.style.opacity = 0;
        this.textElement.innerText = text;
        this.textElement.className = "intro-text-cinematic " + extraClass;
        
        // Force reflow
        void this.textElement.offsetWidth;
        
        // We use slow opacity transition for creepy, and 1.5s for all others
        if (extraClass === "intro-text-creepy") {
            this.textElement.style.transition = "opacity 2.5s ease";
        } else {
            this.textElement.style.transition = "opacity 1.5s ease";
        }
        
        this.textElement.style.opacity = 1;
    }
    
    hideText() {
        this.textElement.style.transition = "opacity 1.5s ease";
        this.textElement.style.opacity = 0;
    }
    
    skip() {
        this.skipped = true;
        this.hideText();
        this.finish();
    }
    
    finish() {
        this.uiElement.classList.add("hidden");
        // Update thunder timer so it doesn't fire immediately
        horrorEventManager.nextThunderTime = performance.now() + 10000;
        
        // User requested clock to stop after loading script ends
        audioManager.fadeOut("clock", 3000); // fade out over 3 seconds as we wake up
        
        sceneManager.changeScene("bedroom");
        objectiveSystem.setObjective("Click to explore the room.");
    }
    
    dispose() {
        this.uiElement.classList.add("hidden");
    }
}

const introScene = new Intro();
