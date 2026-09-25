class PauseUI {
    constructor() {
        this.element = document.getElementById("pause-menu");
        this.options = this.element.querySelectorAll(".menu-option");
        this.isPaused = false;
        
        document.addEventListener('keydown', (e) => {
            // Only allow pause if we are in a playable scene and pointer is locked
            if (e.code === 'Escape' && sceneManager.currentSceneName === "bedroom") {
                this.togglePause();
            }
        });

        this.options.forEach(opt => {
            opt.addEventListener("click", (e) => {
                const action = e.target.dataset.action;
                if (action === "resume") {
                    this.togglePause();
                    document.body.requestPointerLock();
                } else if (action === "settings") {
                    this.element.classList.add("hidden");
                    settingsUI.show();
                } else if (action === "save") {
                    saveSystem.save();
                } else if (action === "quit") {
                    this.isPaused = false;
                    this.element.classList.add("hidden");
                    sceneManager.changeScene("mainmenu");
                }
            });
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.element.classList.remove("hidden");
            document.exitPointerLock();
        } else {
            this.element.classList.add("hidden");
        }
    }
}
const pauseUI = new PauseUI();
