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
        
        this.script = [
            { text: "YOU ARE SID.", class: "" },
            { text: "YOU RECENTLY GOT AN INTERNSHIP.", class: "" },
            { text: "FAR FROM HOME.", class: "" },
            { text: "THIS PLACE WAS SUPPOSED TO BE TEMPORARY.", class: "" },
            { text: "YOUR FIRST NIGHT.", class: "" },
            { text: "3:14 AM", class: "intro-text-largest" },
            { text: "YOU WAKE UP.", class: "intro-text-large" },
            { text: "The rain is still falling.", class: "" },
            { text: "And something feels wrong.", class: "" }
        ];
        
        // Timings
        this.fadeInTime = 2.0;
        this.holdTime = 2.5;
        this.fadeOutTime = 2.0;
        this.gapTime = 1.0;
        this.phaseDuration = this.fadeInTime + this.holdTime + this.fadeOutTime + this.gapTime;
    }
    
    init() {
        console.log("Intro Init");
        this.uiElement.classList.remove("hidden");
        this.textElement.style.opacity = 0;
        this.textElement.className = "intro-text-cinematic";
        this.totalTime = 0; 
        this.phase = 0;
        this.skipped = false;
        this.state = "gap"; // 'gap', 'in', 'hold', 'out'
        
        if (horrorEventManager.nextThunderTime) {
            horrorEventManager.nextThunderTime = performance.now() + 9999999;
        }
    }
    
    update(delta) {
        if (this.skipped) return;
        this.totalTime += delta;
        
        // Delay start by 1.5s as per original menu fade timeline
        if (this.totalTime < 1.5) return;
        
        const t = this.totalTime - 1.5;
        
        if (this.phase >= this.script.length) {
            if (this.state !== "done") {
                this.state = "done";
                this.finish();
            }
            return;
        }
        
        const phaseTime = t - (this.phase * this.phaseDuration);
        
        if (phaseTime < 0) {
            // Gap before first phase (shouldn't happen with logic, but safety)
        } else if (phaseTime < this.fadeInTime) {
            if (this.state !== "in") {
                this.state = "in";
                this.showText(this.script[this.phase].text, this.script[this.phase].class);
            }
        } else if (phaseTime < this.fadeInTime + this.holdTime) {
            this.state = "hold";
        } else if (phaseTime < this.fadeInTime + this.holdTime + this.fadeOutTime) {
            if (this.state !== "out") {
                this.state = "out";
                this.hideText();
            }
        } else {
            this.state = "gap";
            this.phase++;
        }
    }
    
    showText(text, extraClass = "") {
        this.textElement.style.transition = "none";
        this.textElement.style.opacity = 0;
        this.textElement.innerText = text;
        this.textElement.className = "intro-text-cinematic " + extraClass;
        
        void this.textElement.offsetWidth;
        
        this.textElement.style.transition = `opacity ${this.fadeInTime}s ease`;
        this.textElement.style.opacity = 1;
    }
    
    hideText() {
        this.textElement.style.transition = `opacity ${this.fadeOutTime}s ease`;
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
        sceneManager.changeScene("bedroom");
        objectiveSystem.setObjective("WAKE UP");
    }
    
    dispose() {
        this.uiElement.classList.add("hidden");
    }
}

const introScene = new Intro();
