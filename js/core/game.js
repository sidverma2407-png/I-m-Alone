// =========================================
// I'M ALONE
// Game Engine
// =========================================

// Canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =========================================
// Audio
// =========================================

const menuMusic = document.getElementById("menuMusic");
const clockSound = document.getElementById("clockSound");
const rainSound = document.getElementById("rainSound");
const windSound = document.getElementById("windSound");
const ambientSound = document.getElementById("ambientSound");
// Effects


// Default Volumes
menuMusic.volume = 0.25;
clockSound.volume = 0.18;
rainSound.volume = 0.35;
windSound.volume = 0.25;
ambientSound.volume = 0.20;

// Unlock audio after first user interaction
let audioUnlocked = false;

window.addEventListener("click", unlockAudio, { once: true });
window.addEventListener("keydown", unlockAudio, { once: true });

async function unlockAudio() {

    if (audioUnlocked) return;

    audioUnlocked = true;

    try {

        // Play silently once to unlock browser audio
        menuMusic.volume = 0;
        await menuMusic.play();
        menuMusic.pause();
        menuMusic.currentTime = 0;
        menuMusic.volume = 0.25;

    }

    catch (err) {

        console.log("Audio unlocked.");

    }

}

// =========================================
// Resize Canvas
// =========================================

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lightning.update();

    sceneManager.update();
    fadeManager.update();

    cameraShake.begin();

sceneManager.draw();
lightning.draw();

cameraShake.end();
    fadeManager.draw();

    cinematicBars.update();
    cinematicBars.draw();

    requestAnimationFrame(gameLoop);

}

// =========================================
// Keyboard
// =========================================

window.addEventListener("keydown",(e)=>{

    if(e.key==="a" || e.key==="ArrowLeft")
        player.left=true;

    if(e.key==="d" || e.key==="ArrowRight")
        player.right=true;

    sceneManager.keyDown(e);

});

   



window.addEventListener("keyup",(e)=>{

    if(e.key==="a" || e.key==="ArrowLeft")
        player.left=false;

    if(e.key==="d" || e.key==="ArrowRight")
        player.right=false;

    sceneManager.keyUp(e);

});

// =========================================
// Start Game
// =========================================

sceneManager.change(menuScene);

gameLoop();