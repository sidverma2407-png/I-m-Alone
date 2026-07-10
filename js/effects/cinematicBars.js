// =========================================
// Cinematic Bars
// =========================================

class CinematicBars {

    constructor() {

        this.height = 0;
        this.target = 0;
        this.speed = 2;

    }

    show() {

        this.target = 80;

    }

    hide() {

        this.target = 0;

    }

    update() {

        if (this.height < this.target) {

            this.height += this.speed;

            if (this.height > this.target)
                this.height = this.target;

        }

        else if (this.height > this.target) {

            this.height -= this.speed;

            if (this.height < this.target)
                this.height = this.target;

        }

    }

    draw() {

        ctx.fillStyle = "black";

        // Top Bar
        ctx.fillRect(
            0,
            0,
            canvas.width,
            this.height
        );

        // Bottom Bar
        ctx.fillRect(
            0,
            canvas.height - this.height,
            canvas.width,
            this.height
        );

    }

}

const cinematicBars = new CinematicBars();