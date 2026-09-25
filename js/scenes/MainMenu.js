class MainMenu {
    constructor() {
        // We will just use a camera. The scene rendered will be bedroomScene!
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Position camera to look like the reference image (looking over bed towards window)
        this.camera.position.set(4, 1.2, 0); 
        this.camera.lookAt(-2, 1.0, -3); // Look towards bed and window
    }
    init() {
        console.log("Main Menu Init");
        mainMenuUI.show();
        // Also play background audio
        audioManager.play("clock");
        audioManager.play("wind");
    }
    update(delta) {
        // Slow cinematic camera push forward
        this.camera.translateZ(-delta * 0.05);
    }
    dispose() {
        mainMenuUI.hide();
    }
}
const mainMenuScene = new MainMenu();
