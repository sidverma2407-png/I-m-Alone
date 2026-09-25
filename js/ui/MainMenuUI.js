class MainMenuUI {
    constructor() {
        this.element = document.getElementById("main-menu");
        this.options = document.querySelectorAll(".menu-option:not(.disabled)");
        this.setupListeners();
    }
    
    setupListeners() {
        this.options.forEach(opt => {
            opt.addEventListener("click", (e) => {
                const action = e.target.dataset.action;
                if (action === "newgame") {
                    this.startGame();
                } else if (action === "settings") {
                    // Show settings UI
                }
            });
        });
    }

    show() {
        this.element.classList.remove("hidden");
        
        const tryPlayAudio = () => {
            audioManager.play("menu-music");
            audioManager.play("menu-tension");
            
            // Only remove if it actually started playing
            if (audioManager.tracks["menu-music"] && !audioManager.tracks["menu-music"].element.paused) {
                document.removeEventListener("click", tryPlayAudio);
                document.removeEventListener("keydown", tryPlayAudio);
            }
        };
        
        document.addEventListener("click", tryPlayAudio);
        document.addEventListener("keydown", tryPlayAudio);
        
        tryPlayAudio();
    }

    hide() {
        this.element.classList.add("hidden");
        audioManager.fadeOut("menu-music", 2000);
        audioManager.fadeOut("menu-tension", 2000);
    }

    startGame() {
        this.hide();
        sceneManager.changeScene("intro");
    }
}
const mainMenuUI = new MainMenuUI();
