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
