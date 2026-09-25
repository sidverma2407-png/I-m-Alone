class SceneManager {
    constructor() {
        this.scenes = {
            "mainmenu": mainMenuScene,
            "intro": introScene,
            "bedroom": bedroomScene
        };
        this.currentSceneName = null;
        this.currentScene = null;
    }

    changeScene(name) {
        if (this.currentScene) {
            this.currentScene.dispose();
        }
        
        this.currentSceneName = name;
        this.currentScene = this.scenes[name];
        
        if (this.currentScene) {
            this.currentScene.init();
        }
    }

    update(delta) {
        if (this.currentScene) {
            this.currentScene.update(delta);
        }
    }
}
const sceneManager = new SceneManager();
