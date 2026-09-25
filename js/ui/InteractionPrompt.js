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
