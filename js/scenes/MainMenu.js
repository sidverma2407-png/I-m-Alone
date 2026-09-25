class MainMenu {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
    }
    init() {
        console.log("Main Menu Init");
        mainMenuUI.show();
    }
    update(delta) {
        // Slow zoom effect
        this.camera.position.z -= delta * 0.1;
    }
    dispose() {
        mainMenuUI.hide();
    }
}
const mainMenuScene = new MainMenu();
