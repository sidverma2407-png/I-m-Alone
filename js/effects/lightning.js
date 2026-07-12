// =========================================
// Lightning Effect
// =========================================

class Lightning {

    constructor() {

        this.alpha = 0;
        this.active = false;
        this.timer = 0;

        // First strike after 8–15 seconds
        this.nextStrike = Date.now() + 8000 + Math.random() * 7000;

    }

    update() {

        // Time for a new lightning strike?
        if (!this.active && Date.now() > this.nextStrike) {

            this.active = true;
            this.alpha = 1;
            this.timer = 0;

            // Camera shake
            cameraShake.start(18, 5);

            // Thunder after a realistic delay
            setTimeout(() => {

                thunderSound.currentTime = 0;
                thunderSound.play();

            }, 500 + Math.random() * 500);

        }

        if (this.active) {

            this.timer++;

            // Quick flash fade
            this.alpha -= 0.07;

            if (this.alpha <= 0) {

                this.alpha = 0;
                this.active = false;

                // Next strike between 12–25 sec
                this.nextStrike =
                    Date.now() +
                    12000 +
                    Math.random() * 13000;

            }

        }

    }

    draw() {

        if (!this.active) return;

        ctx.save();

        ctx.fillStyle = `rgba(220,235,255,${this.alpha})`;
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

    }

}

const lightning = new Lightning();