// =========================================
// I'M ALONE
// Menu Scene
// =========================================

class MenuScene {

    constructor() {

        // Press Enter animation
        this.alpha = 1;
        this.fade = -0.015;

        // Slow camera zoom
        this.zoom = 1;

        // Flicker
        this.flicker = 1;

        // Background
        this.background = new Image();
        this.background.src = "assets/images/menu-background.jpeg";

    }

    start() {

        console.log("Menu Loaded");

    }

    update() {

        // Blink Press Enter
        this.alpha += this.fade;

        if (this.alpha <= 0.25 || this.alpha >= 1) {

            this.fade *= -1;

        }

        // Slow Zoom
        this.zoom += 0.00002;

        if (this.zoom > 1.05) {

            this.zoom = 1;

        }

        // Random light flicker
        this.flicker = Math.random() < 0.01 ? 0.75 : 1;

    }

    draw() {

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //-----------------------------------
        // Background
        //-----------------------------------

        if (this.background.complete) {

            const w = canvas.width * this.zoom;
            const h = canvas.height * this.zoom;

            ctx.drawImage(

                this.background,

                -(w - canvas.width) / 2,
                -(h - canvas.height) / 2,

                w,
                h

            );

        } else {

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

        }

        //-----------------------------------
        // Dark Overlay
        //-----------------------------------

        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //-----------------------------------
        // Vignette
        //-----------------------------------

        const gradient = ctx.createRadialGradient(

            canvas.width / 2,
            canvas.height / 2,
            250,

            canvas.width / 2,
            canvas.height / 2,
            canvas.width

        );

        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.90)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //-----------------------------------
        // Text
        //-----------------------------------

        ctx.textAlign = "center";

        //-----------------------------------
        // Studio
        //-----------------------------------

        ctx.fillStyle = "#dddddd";
        ctx.font = "24px monospace";

        ctx.fillText(

            "SID STUDIOS",

            canvas.width / 2,

            110

        );

        ctx.fillStyle = "#888";

        ctx.font = "18px monospace";

        ctx.fillText(

            "presents",

            canvas.width / 2,

            155

        );

        //-----------------------------------
        // Title
        //-----------------------------------

        ctx.globalAlpha = this.flicker;

        ctx.shadowColor = "white";
        ctx.shadowBlur = 30;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 82px monospace";

        ctx.fillText(

            "I'M ALONE",

            canvas.width / 2,

            330

        );

        ctx.globalAlpha = 1;

        ctx.shadowBlur = 0;

        //-----------------------------------
        // Subtitle
        //-----------------------------------

        ctx.fillStyle = "#a0a0a0";
        ctx.font = "26px monospace";

        ctx.fillText(

            "Psychological Horror Experience",

            canvas.width / 2,

            390

        );

        //-----------------------------------
        // Press ENTER
        //-----------------------------------

        ctx.globalAlpha = this.alpha;

        ctx.fillStyle = "#ffffff";

        const size = 30 + Math.sin(Date.now() * 0.004) * 2;

        ctx.font = `bold ${size}px monospace`;

        ctx.fillText(

            "► PRESS ENTER",

            canvas.width / 2,

            canvas.height - 120

        );

        ctx.globalAlpha = 1;

        //-----------------------------------
        // Footer Left
        //-----------------------------------

        ctx.textAlign = "left";

        ctx.fillStyle = "#777";

        ctx.font = "16px monospace";

        ctx.fillText(

            "HEADPHONES RECOMMENDED",

            30,

            canvas.height - 30

        );

        //-----------------------------------
        // Footer Right
        //-----------------------------------

        ctx.textAlign = "right";

        ctx.fillText(

            "v0.1 Alpha",

            canvas.width - 30,

            canvas.height - 30

        );

    }

    keyDown(e) {

        if (e.key !== "Enter")
            return;

        sceneManager.change(introScene);

        // Later:
        // sceneManager.change(introScene);

    }

}

const menuScene = new MenuScene();