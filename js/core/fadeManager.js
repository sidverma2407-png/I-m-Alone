// =========================================
// Fade Manager
// =========================================

class FadeManager {

    constructor() {

        this.alpha = 0;

        this.speed = 0.02;

        this.active = false;

        this.direction = 1;

        this.callback = null;

    }

    fadeOut(callback) {

        this.active = true;

        this.direction = 1;

        this.callback = callback;

    }

    fadeIn() {

        this.active = true;

        this.direction = -1;

    }

    update() {

        if (!this.active) return;

        this.alpha += this.speed * this.direction;

        if (this.alpha >= 1) {

            this.alpha = 1;

            if (this.callback) {

                this.callback();

                this.callback = null;

            }

            this.direction = -1;

        }

        if (this.alpha <= 0) {

            this.alpha = 0;

            this.active = false;

        }

    }

    draw() {

        if (this.alpha <= 0) return;

        ctx.fillStyle = `rgba(0,0,0,${this.alpha})`;

        ctx.fillRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

    }

}

const fadeManager = new FadeManager();