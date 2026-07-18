// =========================================
// PLAYER
// =========================================

class Player {

    constructor() {

        // Position
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

        // -------------------------
        // Player State
        // -------------------------

        this.state = "sleep";

        // -------------------------
        // Sleep Sprite
        // -------------------------

        this.sleep = new Image();
        this.sleep.src =
            "assets/sprites/sid/sleep/sleep1.png";

        // -------------------------
        // Wake Animation
        // -------------------------

        this.wake = [];

        for(let i = 1; i <= 3; i++){

            const img = new Image();

            img.src =
                `assets/sprites/sid/wake/wake${i}.png`;

            this.wake.push(img);

        }

        this.wakeFrame = 0;
        this.wakeTimer = 0;

    }

    update() {

        //------------------------------------------------
        // Wake Animation
        //------------------------------------------------

        if(this.state === "wake"){

            this.wakeTimer++;

            if(this.wakeTimer >= 35){

                this.wakeTimer = 0;

                this.wakeFrame++;

                if(this.wakeFrame >= this.wake.length){

                    // Stay on last wake frame until idle sprites are ready
                    this.wakeFrame = this.wake.length - 1;

                    this.state = "idle";

                    this.control = true;

                }

            }

        }

        //------------------------------------------------
        // Movement
        //------------------------------------------------

        if(this.control){

            if(this.left){

                this.x -= this.speed;
                this.direction = -1;

            }

            if(this.right){

                this.x += this.speed;
                this.direction = 1;

            }

        }

        //------------------------------------------------
        // Room Limits
        //------------------------------------------------

        if(this.x < 80)
            this.x = 80;

        if(this.x > canvas.width - this.width - 80)
            this.x = canvas.width - this.width - 80;

    }

    draw() {

        ctx.save();

        if(this.direction == -1){

            ctx.translate(
                this.x + this.width,
                this.y
            );

            ctx.scale(-1,1);

            this.drawState(
                0,
                0
            );

        }

        else{

            this.drawState(
                this.x,
                this.y
            );

        }

        ctx.restore();

    }

    drawState(x,y){

        switch(this.state){

            //-------------------------------------
            // Sleeping
            //-------------------------------------

            case "sleep":

                ctx.drawImage(

                    this.sleep,

                    x,
                    y,

                    this.width,
                    this.height

                );

            break;

            //-------------------------------------
            // Wake Animation
            //-------------------------------------

            case "wake":

                ctx.drawImage(

                    this.wake[
                        this.wakeFrame
                    ],

                    x,
                    y,

                    this.width,
                    this.height

                );

            break;

            //-------------------------------------
            // Idle
            //-------------------------------------

            case "idle":

                // Temporary:
                // Show last wake frame until idle sprites are created

                ctx.drawImage(

                    this.wake[2],

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