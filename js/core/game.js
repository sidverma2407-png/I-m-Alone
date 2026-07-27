// =========================================
// CANVAS
// =========================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1280;
canvas.height = 720;

// =========================================
// GAME
// =========================================

class Game {

    constructor() {

        this.lastTime = 0;

        // Start from Menu
        sceneManager.change(menuScene);

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);

    }

    update() {

        sceneManager.update();

        if (typeof fadeManager !== "undefined" && fadeManager)
            fadeManager.update();

        if (typeof lightning !== "undefined" && lightning)
            lightning.update();

    }

    draw() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        sceneManager.draw();

        if (typeof lightning !== "undefined" && lightning)
            lightning.draw();

        if (typeof fadeManager !== "undefined" && fadeManager)
            fadeManager.draw();

    }

    loop() {

        this.update();
        this.draw();

        requestAnimationFrame(this.loop);

    }

}

// =========================================
// KEYBOARD
// =========================================

window.addEventListener("keydown", (e) => {

    // Forward key press to current scene
    sceneManager.keyDown(e);

    switch (e.key.toLowerCase()) {

        case "a":
        case "arrowleft":

            if (typeof player !== "undefined")
                player.left = true;

        break;

        case "d":
        case "arrowright":

            if (typeof player !== "undefined")
                player.right = true;

        break;

    }

});

window.addEventListener("keyup", (e) => {

    // Forward key release to current scene
    sceneManager.keyUp(e);

    switch (e.key.toLowerCase()) {

        case "a":
        case "arrowleft":

            if (typeof player !== "undefined")
                player.left = false;

        break;

        case "d":
        case "arrowright":

            if (typeof player !== "undefined")
                player.right = false;

        break;

    }

});

// =========================================
// START GAME
// =========================================

window.onload = () => {

    console.log("Game Started");

    new Game();

};