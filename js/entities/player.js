// =========================================
// PLAYER
// =========================================

class Player {

    constructor() {

        // Position (adjust if needed)
        this.x = 250;
        this.y = 470;

        // Character Size
        this.width = 260;
        this.height = 260;

        // Movement
        this.speed = 4;

        this.left = false;
        this.right = false;

        this.direction = 1;

        this.control = true;

        // Idle Animation
        this.idle = new SpriteAnimator(
            "assets/sprites/sid/idle/idle",
            8
        );

    }

    update() {

        // Animate Idle
        this.idle.update();

        // Movement
        if (this.left) {

            this.x -= this.speed;
            this.direction = -1;

        }

        if (this.right) {

            this.x += this.speed;
            this.direction = 1;

        }

        // Room Boundaries
        if (this.x < 100)
            this.x = 100;

        if (this.x > canvas.width - this.width - 50)
            this.x = canvas.width - this.width - 50;

    }

    draw() {

        ctx.save();

        if (this.direction === -1) {

            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);

            this.idle.draw(
                0,
                0,
                this.width,
                this.height
            );

        }

        else {

            this.idle.draw(
                this.x,
                this.y,
                this.width,
                this.height
            );

        }

        ctx.restore();

    }

}

const player = new Player();