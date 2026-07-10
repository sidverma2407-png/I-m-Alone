// =========================================
// I'M ALONE
// Scene Manager
// =========================================

class SceneManager {

    constructor() {

        this.currentScene = null;

    }

    change(scene) {

        if (this.currentScene && this.currentScene.end) {
            this.currentScene.end();
        }

        this.currentScene = scene;

        if (this.currentScene && this.currentScene.start) {
            this.currentScene.start();
        }

    }

    update() {

        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update();
        }

    }

    draw() {

        if (this.currentScene && this.currentScene.draw) {
            this.currentScene.draw();
        }

    }

    keyDown(event) {

        if (this.currentScene && this.currentScene.keyDown) {
            this.currentScene.keyDown(event);
        }

    }

    keyUp(event) {

        if (this.currentScene && this.currentScene.keyUp) {
            this.currentScene.keyUp(event);
        }

    }

}

const sceneManager = new SceneManager();