// =========================================
// PLAYER
// =========================================

class Player {

    constructor() {

        // Position (Sleeping)
        this.x = 120;
        this.y = 285;

        // Size
        this.width = 520;
        this.height = 260;

        // Movement
        this.speed = 4;

        this.left = false;
        this.right = false;

        this.direction = 1;
        this.control = false;

        // Current State
        this.state = "sleep";

        // -------------------------
        // Sleep Sprite
        // -------------------------

        this.sleep = new Image();
        this.sleep.src = "assets/sprites/sid/sleep/sleep1.png";

        // -------------------------
        // Wake Animation
        // -------------------------

        this.wake = [];

        for (let i = 1; i <= 4; i++) {

            const img = new Image();
            img.src = `assets/sprites/sid/wake/wake${i}.png`;
            this.wake.push(img);

        }

        this.wakeFrame = 0;
        this.wakeTimer = 0;

        // -------------------------
        // Stand Sprite
        // -------------------------

        this.stand = new Image();
        this.stand.src = "assets/sprites/sid/stand/stand1.png";

        // -------------------------
        // Walk Animation
        // -------------------------

        this.walk = [];

        for (let i = 1; i <= 4; i++) {

            const img = new Image();
            img.src = `assets/sprites/sid/walk/walk${i}.png`;
            this.walk.push(img);

        }

        this.walkFrame = 0;
        this.walkTimer = 0;

    }

    update() {

        //---------------------------------
        // Wake Animation
        //---------------------------------

        if (this.state === "wake") {

            this.wakeTimer++;

            if (this.wakeTimer >= 20) {

                this.wakeTimer = 0;

                if (this.wakeFrame < this.wake.length - 1) {

                    this.wakeFrame++;

                }

            }

        }

        //---------------------------------
        // Walking
        //---------------------------------

        if (this.control) {

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

                this.state = "walk";

                this.walkTimer++;

                if (this.walkTimer >= 8) {

                    this.walkTimer = 0;

                    this.walkFrame++;

                    if (this.walkFrame >= this.walk.length) {

                        this.walkFrame = 0;

                    }

                }

            } else {

                this.state = "stand";

                this.walkFrame = 0;

            }

        }

        //---------------------------------
        // Room Limits
        //---------------------------------

        if (this.x < 80)
            this.x = 80;

        if (this.x > canvas.width - this.width - 80)
            this.x = canvas.width - this.width - 80;

    }

    draw() {

        ctx.save();

        if (this.direction == -1) {

            ctx.translate(this.x + this.width, this.y);
            ctx.scale(-1, 1);

            this.drawState(0, 0);

        } else {

            this.drawState(this.x, this.y);

        }

        ctx.restore();

    }

    drawState(x, y) {

        switch (this.state) {

            //---------------------------------
            // Sleep
            //---------------------------------

            case "sleep":

                ctx.drawImage(
                    this.sleep,
                    x,
                    y,
                    this.width,
                    this.height
                );

            break;

            //---------------------------------
            // Wake
            //---------------------------------

            case "wake":

                ctx.drawImage(
                    this.wake[this.wakeFrame],
                    x,
                    y,
                    this.width,
                    this.height
                );

            break;

            //---------------------------------
            // Stand
            //---------------------------------

            case "stand":

                ctx.drawImage(
                    this.stand,
                    x,
                    y,
                    this.width,
                    this.height
                );

            break;

            //---------------------------------
            // Walk
            //---------------------------------

            case "walk":

                ctx.drawImage(
                    this.walk[this.walkFrame],
                    x,
                    y,
                    this.width,
                    this.height
                );

            break;

            //---------------------------------
            // Idle (same as stand for now)
            //---------------------------------

            case "idle":

                ctx.drawImage(
                    this.stand,
                    x,
                    y,
                    this.width,
                    this.height
                );

            break;

        }

    }

}

const player = new Player();