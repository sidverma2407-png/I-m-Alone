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
