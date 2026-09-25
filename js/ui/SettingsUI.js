class SettingsUI {
    constructor() {
        this.element = document.getElementById("settings-menu");
        this.masterVolSlider = document.getElementById("master-vol");
        this.mouseSensSlider = document.getElementById("mouse-sens");
        
        this.masterVolSlider.addEventListener("input", (e) => {
            audioManager.setMasterVolume(parseFloat(e.target.value));
        });

        // The game controller needs access to this, handled implicitly or by reading the slider
        
        const backBtn = this.element.querySelector('[data-action="back"]');
        backBtn.addEventListener("click", () => {
            this.hide();
            if (pauseUI.isPaused) {
                pauseUI.element.classList.remove("hidden");
            } else {
                mainMenuUI.element.classList.remove("hidden");
            }
        });
    }

    show() {
        this.element.classList.remove("hidden");
    }

    hide() {
        this.element.classList.add("hidden");
    }
}
const settingsUI = new SettingsUI();
