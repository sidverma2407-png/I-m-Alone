class MainMenu {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        // Exact frustum fit at z=0 (camera at z=5)
        const distance = 5;
        const vFov = this.camera.fov * Math.PI / 180;
        const planeHeight = 2 * Math.tan(vFov / 2) * distance;
        const planeWidth = planeHeight * this.camera.aspect;
        
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight); 
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('assets/images/menu-background-new.jpg');
        
        // Use basic material with white color so image looks normal
        const material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff }); 

        this.plane = new THREE.Mesh(geometry, material);
        this.plane.position.z = 0;
        this.scene.add(this.plane);
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
