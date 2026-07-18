// =========================================
// Lightning Effect
// =========================================

class Lightning {

    constructor() {

        this.alpha = 0;
        this.active = false;
        this.timer = 0;

        // Automatic strike every 8–15 seconds
        this.nextStrike = Date.now() + 8000 + Math.random() * 7000;

    }

    // -------------------------------------
    // Force Lightning (Intro)
    // -------------------------------------

    flash() {

        this.active = true;
        this.alpha = 1;
        this.timer = 0;

        cameraShake.start(18, 5);

        setTimeout(() => {

            thunderSound.currentTime = 0;
            thunderSound.play();

        }, 500);

    }

    update() {

        // Automatic lightning
        if (!this.active && Date.now() > this.nextStrike) {

            this.flash();

            this.nextStrike =
                Date.now() +
                12000 +
                Math.random() * 13000;

        }

        if (this.active) {

            this.timer++;

            this.alpha -= 0.07;

            if (this.alpha <= 0) {

                this.alpha = 0;
                this.active = false;

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