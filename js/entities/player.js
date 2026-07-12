// =========================================
// Player
// =========================================

class Player {

    constructor() {

        this.width = 60;
        this.height = 110;

        // Spawn beside the bed
        this.x = 900;
        this.y = 720;

        this.speed = 4;

        this.left = false;
        this.right = false;

        this.direction = 1;

        // Animation
        this.walkFrame = 0;

    }

    update() {

        let moving = false;

        if (this.left) {

            this.x -= this.speed;
            this.direction = -1;
            moving = true;

        }

        if (this.right) {

            this.x += this.speed;
            this.direction = 1;
            moving = true;

        }

        if (moving) {

            this.walkFrame += 0.22;

        }

        // Room boundaries
        if (this.x < 120)
            this.x = 120;

        if (this.x > canvas.width - 120)
            this.x = canvas.width - 120;

    }

    draw() {

    ctx.save();

    // Draw at player's position
    ctx.translate(this.x, this.y);

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 25, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (bright blue so it's impossible to miss)
    ctx.fillStyle = "#00BFFF";
    ctx.fillRect(-15, -55, 30, 45);

    // Head
    ctx.fillStyle = "#FFD7B5";
    ctx.beginPath();
    ctx.arc(0, -70, 15, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = "#FFD7B5";
    ctx.fillRect(-22, -52, 7, 32);
    ctx.fillRect(15, -52, 7, 32);

    // Legs
    ctx.fillStyle = "#222";
    ctx.fillRect(-11, -10, 8, 35);
    ctx.fillRect(3, -10, 8, 35);

    // Shoes
    ctx.fillStyle = "#FFF";
    ctx.fillRect(-12, 25, 10, 4);
    ctx.fillRect(2, 25, 10, 4);

    // Debug circle
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

}
}

const player = new Player();