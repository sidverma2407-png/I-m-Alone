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
        objectiveSystem.setObjective("WAKE UP");
    }
    
    dispose() {
        this.uiElement.classList.add("hidden");
    }
}

const introScene = new Intro();
