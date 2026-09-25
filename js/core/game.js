class Game {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
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
        
        if (sceneManager.currentScene) {
            let camToRender = this.cameraSys.camera;
            if (sceneManager.currentSceneName === "mainmenu") {
                camToRender = mainMenuScene.camera;
            } else if (sceneManager.currentSceneName === "intro") {
                camToRender = introScene.camera;
            }
            this.renderer.render(sceneManager.currentScene.scene, camToRender);
        }
    }
}

window.onload = () => {
    console.log("3D Game Started");
    window.game = new Game();
};
