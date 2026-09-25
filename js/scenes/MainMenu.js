class MainMenu {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Background Image Plane
        const geometry = new THREE.PlaneGeometry(16, 9); // Assuming 16:9 aspect ratio roughly
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('assets/images/menu-background-new.jpg');
        const material = new THREE.MeshBasicMaterial({ map: texture, color: 0x555555 }); // Darkened a bit
        const plane = new THREE.Mesh(geometry, material);
        plane.position.z = 0;
        this.scene.add(plane);
    }
    init() {
        console.log("Main Menu Init");
        mainMenuUI.show();
    }
    update(delta) {
        // Slow zoom effect
        if (this.camera.position.z > 3) {
            this.camera.position.z -= delta * 0.05;
        }
    }
    dispose() {
        mainMenuUI.hide();
    }
}
const mainMenuScene = new MainMenu();
