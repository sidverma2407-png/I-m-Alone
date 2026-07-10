// =========================================
// I'M ALONE
// Game Engine
// =========================================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Audio
const clockSound = document.getElementById("clockSound");
clockSound.volume = 0.18;

// Resize Canvas
function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

// =========================================
// Main Game Loop
// =========================================

function gameLoop() {

    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update Current Scene
    sceneManager.update();

    // Draw Current Scene
    sceneManager.draw();

    requestAnimationFrame(gameLoop);

}

// =========================================
// Keyboard
// =========================================

window.addEventListener("keydown", (e) => {

    sceneManager.keyDown(e);

});

window.addEventListener("keyup", (e) => {

    sceneManager.keyUp(e);

});

// =========================================
// Mouse (used later)
// =========================================

window.addEventListener("click", async () => {

    if (clockSound.paused) {

        try {

            clockSound.volume = 0.25;
            await clockSound.play();

        }

        catch (err) {

            console.log(err);

        }

    }

}, { once: true });

// =========================================
// Start Game
// =========================================

sceneManager.change(menuScene);

gameLoop();

window.addEventListener("click", async () => {

    try {

        if (clockSound.paused) {

            await clockSound.play();

        }

    }

    catch(err){

        console.log(err);

    }

}, { once:true });