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
        
        // Use standard material so we can flash it with lightning
        const material = new THREE.MeshStandardMaterial({ map: texture, color: 0x888888, roughness: 1 });

        this.plane = new THREE.Mesh(geometry, material);
        this.plane.position.z = 0;
        this.scene.add(this.plane);
        
        // Ambient light for normal visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        
        // Lightning flash light
        this.lightning = new THREE.DirectionalLight(0xaaccff, 0);
        this.lightning.position.set(-5, 5, 5);
        this.scene.add(this.lightning);
    }
    init() {
        console.log("Main Menu Init");
        mainMenuUI.show();
        // Also play background audio
        audioManager.play("clock");
        audioManager.play("wind");
    }
    update(delta) {
        // Slow zoom effect
        if (this.camera.position.z > 3.5) {
            this.camera.position.z -= delta * 0.05;
        }
    }
    dispose() {
        mainMenuUI.hide();
    }
}
const mainMenuScene = new MainMenu();
