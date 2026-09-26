class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Cap pixel ratio to 2 to prevent extreme performance drops on 4K/retina displays
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Better looking, optimized shadows
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.clock = new THREE.Clock();
        
        // Initialize Player for the game (global)
        this.cameraSys = new FirstPersonCamera(bedroomScene.scene); // Pass bedroom scene for now
        this.player = new PlayerController(bedroomScene.scene, this.cameraSys);
        
        window.addEventListener('resize', () => this.onWindowResize(), false);


        // Start game at Main Menu
        sceneManager.changeScene("mainmenu");
        
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        
        // Update first person camera
        this.cameraSys.camera.aspect = aspect;
        this.cameraSys.camera.updateProjectionMatrix();
        
        // Update main menu camera
        mainMenuScene.camera.aspect = aspect;
        mainMenuScene.camera.updateProjectionMatrix();
        
        // Adjust plane size in main menu to fit new aspect
        if (mainMenuScene.plane) {
            const distance = 5;
            const vFov = mainMenuScene.camera.fov * Math.PI / 180;
            const planeHeight = 2 * Math.tan(vFov / 2) * distance;
            const planeWidth = planeHeight * aspect;
            mainMenuScene.plane.geometry.dispose();
            mainMenuScene.plane.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        }

        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    loop() {
        requestAnimationFrame(this.loop);
        
        const delta = this.clock.getDelta();
        
        sceneManager.update(delta);
        this.player.update(delta);
        horrorEventManager.update(delta);
        
        if (sceneManager.currentSceneName) {
            let camToRender = this.cameraSys.camera;
            let sceneToRender = sceneManager.currentScene.scene;
            
            if (sceneManager.currentSceneName === "mainmenu") {
                camToRender = mainMenuScene.camera;
                sceneToRender = mainMenuScene.scene; // Render the image plane
            } else if (sceneManager.currentSceneName === "intro") {
                camToRender = introScene.camera;
            }
            
            if (sceneToRender) {
                this.renderer.render(sceneToRender, camToRender);
            }
        }
    }
}

window.onload = () => {
    console.log("3D Game Started");
    window.game = new Game();
};
