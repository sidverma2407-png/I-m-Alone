// =========================================
// I'M ALONE
// Menu Scene
// =========================================

class MenuScene {

    constructor() {

        // Press ENTER animation
        this.alpha = 1;
        this.fade = -0.015;

        // Camera Zoom
        this.zoom = 1;

        // Title Flicker
        this.flicker = 1;
        this.nextFlicker = 0;

        // Background
        this.background = new Image();
        this.background.src = "assets/images/menu-background.jpeg";

    }

    async start() {

        console.log("Menu Loaded");

        try {

            if (menuMusic.paused) {

                menuMusic.currentTime = 0;
                menuMusic.volume = 0.75;

                await menuMusic.play();

            }

        }

        catch (err) {

            console.log(err);

        }

    }

    update() {

        // PRESS ENTER Animation
        this.alpha += this.fade;

        if (this.alpha <= 0.25 || this.alpha >= 1) {

            this.fade *= -1;

        }

        // Slow Camera Zoom
        this.zoom += 0.00002;

        if (this.zoom > 1.05) {

            this.zoom = 1;

        }

        // Horror Flicker
        if (Date.now() > this.nextFlicker) {

            this.flicker = Math.random() < 0.25 ? 0.45 : 1;

            this.nextFlicker = Date.now() + 2500 + Math.random() * 3500;

        }

    }

    draw() {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
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

        }

        // Dark Overlay
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
     
        // Vignette
        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            250,
            canvas.width / 2,
            canvas.height / 2,
            canvas.width
        );

        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, "rgba(0,0,0,0.92)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Studio
        ctx.textAlign = "center";

        ctx.fillStyle = "#d0d0d0";
        ctx.font = "24px Cinzel";
        ctx.fillText("SID STUDIOS", canvas.width / 2, 110);

        ctx.fillStyle = "#888";
        ctx.font = "18px Cinzel";
        ctx.fillText("presents", canvas.width / 2, 155);

        // Title
        ctx.globalAlpha = this.flicker;

        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 20 + Math.random() * 15;

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 84px Cinzel";

        ctx.fillText(
            "I'M ALONE",
            canvas.width / 2,
            330
        );

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Subtitle
        ctx.fillStyle = "#999";
        ctx.font = "24px Cinzel";

        ctx.fillText(
            "Psychological Horror Experience",
            canvas.width / 2,
            390
        );

        // PRESS ENTER
        ctx.globalAlpha = this.alpha;

        const size = 30 + Math.sin(Date.now() * 0.004) * 2;

        ctx.fillStyle = "#ffffff";
        ctx.font = `700 ${size}px Cinzel`;

        ctx.fillText(
            "► PRESS ENTER",
            canvas.width / 2,
            canvas.height - 120
        );

        ctx.globalAlpha = 1;

        // Footer
        ctx.textAlign = "left";

        ctx.fillStyle = "#777";
        ctx.font = "15px Cinzel";

        ctx.fillText(
            "HEADPHONES RECOMMENDED",
            30,
            canvas.height - 30
        );

        ctx.textAlign = "right";

        ctx.fillText(
            "v0.1 Alpha",
            canvas.width - 30,
            canvas.height - 30
        );

    }

    async keyDown(e) {

        if (e.key !== "Enter")
            return;

        try {

            // Fade out menu music
            const fadeMusic = setInterval(() => {

                if (menuMusic.volume > 0.02) {

                    menuMusic.volume -= 0.01;

                }

                else {

                    clearInterval(fadeMusic);

                    menuMusic.pause();
                    menuMusic.currentTime = 0;
                    menuMusic.volume = 0.25;

                }

            }, 80);

            // Start clock ticking
            if (clockSound.paused) {

                clockSound.currentTime = 0;
                clockSound.volume = 0.18;

                await clockSound.play();

            }

        }

        catch (err) {

            console.log(err);

        }

        fadeManager.fadeOut(() => {

            sceneManager.change(introScene);

        });

    }

}

const menuScene = new MenuScene();