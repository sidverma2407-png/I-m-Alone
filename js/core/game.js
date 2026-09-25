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
        this.cameraSys.camera.aspect = window.innerWidth / window.innerHeight;
        this.cameraSys.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    loop() {
        requestAnimationFrame(this.loop);
        
        const delta = this.clock.getDelta();
        
        sceneManager.update(delta);
        this.player.update(delta);
        
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
    new Game();
};
