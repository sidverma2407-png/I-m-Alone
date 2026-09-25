class MainMenuUI {
    constructor() {
        this.element = document.getElementById("main-menu");
        this.options = document.querySelectorAll(".menu-option:not(.disabled)");
        this.setupListeners();
    }
    
    setupListeners() {
        this.options.forEach(opt => {
            opt.addEventListener("click", (e) => {
                if (this.isTransitioning) return;
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
            
            opt.addEventListener("mouseenter", (e) => {
                if (this.isTransitioning) return;
                this.updateSelection(e.target);
            });
        });

        document.addEventListener("keydown", (e) => {
            if (this.element.classList.contains("hidden") || this.isTransitioning) return;
            
            const activeIndex = Array.from(this.options).findIndex(opt => opt.classList.contains("active"));
            
            if (e.key === "ArrowDown" || e.key === "s") {
                let next = activeIndex + 1;
                if (next >= this.options.length) next = 0;
                this.updateSelection(this.options[next]);
            } else if (e.key === "ArrowUp" || e.key === "w") {
                let prev = activeIndex - 1;
                if (prev < 0) prev = this.options.length - 1;
                this.updateSelection(this.options[prev]);
            } else if (e.key === "Enter") {
                if (activeIndex !== -1) {
                    this.handleAction(this.options[activeIndex].dataset.action);
                }
            }
        });
    }
    
    updateSelection(selectedElement) {
        this.options.forEach(opt => opt.classList.remove("active"));
        selectedElement.classList.add("active");
    }
    
    handleAction(action) {
        if (action === "newgame") {
            this.startGame();
        } else if (action === "settings") {
            // Show settings UI
        }
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
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Darken screen and fade UI
        this.element.style.transition = "background-color 3s ease";
        this.element.style.backgroundColor = "#000";
        
        // Hide all text except selected
        const children = this.element.children;
        for(let i=0; i<children.length; i++) {
            if (children[i].classList && children[i].classList.contains('menu-options')) {
                // Fade unselected options
                const opts = children[i].children;
                for(let j=0; j<opts.length; j++) {
                    if (!opts[j].classList.contains('active')) {
                        opts[j].style.transition = "opacity 2s ease";
                        opts[j].style.opacity = "0";
                    }
                }
            } else {
                children[i].style.transition = "opacity 2s ease";
                children[i].style.opacity = "0";
            }
        }

        audioManager.fadeOut("menu-music", 3000);
        audioManager.fadeOut("menu-tension", 3000);
        
        // Wait for fade to complete before transitioning scene
        setTimeout(() => {
            this.element.classList.add("hidden");
            this.element.style.backgroundColor = ""; // reset
            
            // reset styles for future
            for(let i=0; i<children.length; i++) {
                if (children[i].classList && children[i].classList.contains('menu-options')) {
                    const opts = children[i].children;
                    for(let j=0; j<opts.length; j++) {
                        opts[j].style.opacity = "";
                    }
                } else {
                    children[i].style.opacity = "";
                }
            }
            
            sceneManager.changeScene("intro");
            this.isTransitioning = false;
        }, 3000);
    }
}
const mainMenuUI = new MainMenuUI();
