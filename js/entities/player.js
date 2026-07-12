// =========================================
// Player
// =========================================

class Player {

    constructor() {

        this.width = 60;
        this.height = 110;

        this.x = canvas.width / 2;
        this.y = canvas.height - 180;

        this.speed = 5;

        this.left = false;
        this.right = false;

        this.direction = 1;

    }

    update() {

        if (this.left) {

            this.x -= this.speed;
            this.direction = -1;

        }

        if (this.right) {

            this.x += this.speed;
            this.direction = 1;

        }

        // Room boundaries
        if (this.x < 80)
            this.x = 80;

        if (this.x > canvas.width - 80)
            this.x = canvas.width - 80;

    }

    draw() {

        ctx.save();

        ctx.translate(this.x, this.y);

        if (this.direction == -1) {

            ctx.scale(-1,1);

        }

        // Head
        ctx.fillStyle = "#ffe0bd";

        ctx.beginPath();
        ctx.arc(0,-70,15,0,Math.PI*2);
        ctx.fill();

        // Body
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(-12,-55,24,40);

        // Legs
        ctx.fillStyle = "#111";

        ctx.fillRect(-10,-15,8,35);
        ctx.fillRect(2,-15,8,35);

        ctx.restore();

    }

}

const player = new Player();