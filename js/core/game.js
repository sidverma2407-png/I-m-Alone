const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let alpha = 1;
let fade = -0.02;

function drawMenu(){

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.textAlign = "center";

    // Studio
    ctx.fillStyle = "white";
    ctx.font = "24px monospace";
    ctx.fillText(
        "SID STUDIOS",
        canvas.width/2,
        120
    );

    // Presents
    ctx.font = "18px monospace";
    ctx.fillStyle = "#bbbbbb";

    ctx.fillText(
        "presents",
        canvas.width/2,
        170
    );

    // Game Title
    ctx.font = "bold 64px monospace";
    ctx.fillStyle = "white";

    ctx.fillText(
        "I'M ALONE",
        canvas.width/2,
        320
    );

    // Subtitle
    ctx.font = "24px monospace";
    ctx.fillStyle = "#888";

    ctx.fillText(
        "A Psychological Horror Experience",
        canvas.width/2,
        370
    );

    // Press Enter Animation
    alpha += fade;

    if(alpha <= 0.2 || alpha >= 1){
        fade *= -1;
    }

    ctx.globalAlpha = alpha;

    ctx.font = "28px monospace";
    ctx.fillStyle = "white";

    ctx.fillText(
        "Press ENTER",
        canvas.width/2,
        canvas.height - 120
    );

    ctx.globalAlpha = 1;
}

function gameLoop(){

    drawMenu();

    requestAnimationFrame(gameLoop);
}

gameLoop();