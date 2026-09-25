class ObjectiveSystem {
    constructor() {
        this.currentObjective = "";
    }
    setObjective(text) {
        this.currentObjective = text;
        // Update UI
    }
}
const objectiveSystem = new ObjectiveSystem();
