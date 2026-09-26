class InteractionSystem {
    constructor() {
        this.interactables = [];
        this.raycaster = new THREE.Raycaster();
        this.center = new THREE.Vector2(0, 0); // Center of screen
        this.currentInteractable = null;
    }

    add(mesh, onInteract, promptText = "Interact") {
        mesh.userData.interactable = true;
        mesh.userData.onInteract = onInteract;
        mesh.userData.promptText = promptText;
        this.interactables.push(mesh);
    }

    update(camera) {
        if (!camera) return;
        
        this.raycaster.setFromCamera(this.center, camera);
        const intersects = this.raycaster.intersectObjects(this.interactables, true); // Must be true for Groups

        if (intersects.length > 0 && intersects[0].distance < 3) { // 3 units interaction range
            // Walk up parents if we hit a child mesh of a Group
            let obj = intersects[0].object;
            while (obj && !obj.userData.interactable && obj.parent) {
                obj = obj.parent;
            }
            
            if (obj && obj.userData.interactable) {
                if (this.currentInteractable !== obj) {
                    this.currentInteractable = obj;
                    interactionPromptUI.show(obj.userData.promptText);
                }
            }
        } else {
            if (this.currentInteractable) {
                this.currentInteractable = null;
                interactionPromptUI.hide();
            }
        }
    }

    interact() {
        if (this.currentInteractable) {
            this.currentInteractable.userData.onInteract();
        }
    }
}
const interactionSystem = new InteractionSystem();

function showSubtitle(text, duration = 3000) {
    const container = document.getElementById("subtitle-container");
    const textEl = document.getElementById("subtitle-text");
    textEl.innerText = text;
    container.classList.remove("hidden");
    container.style.opacity = 1;
    
    if (window.subtitleTimeout) clearTimeout(window.subtitleTimeout);
    window.subtitleTimeout = setTimeout(() => {
        container.style.opacity = 0;
        setTimeout(() => container.classList.add("hidden"), 500);
    }, duration);
}
