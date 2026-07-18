// =========================================
// BEDROOM SCENE
// =========================================

class BedroomScene {

    constructor() {

        this.background = new Image();
        this.background.src = "assets/images/bedroom.png";

        this.sequence = 0;
        this.timer = 0;

    }

    start() {

        console.log("Bedroom Loaded");

        this.sequence = 0;
        this.timer = 0;

        introSound.pause();
    introSound.currentTime = 0;
    introSound.play().catch(err => console.log(err));


        

        player.state = "sleep";
        player.control = false;

        // Fade clock sound

        const fadeClock = setInterval(() => {

            if (clockSound.volume > 0.01) {

                clockSound.volume -= 0.01;

            }

            else {

                clearInterval(fadeClock);

                clockSound.pause();
                clockSound.currentTime = 0;
                clockSound.volume = 0.18;

            }

        }, 80);

        interactionManager.objects = [];

    }

    update() {

        this.timer++;

        switch (this.sequence) {

            //---------------------------------
            // Sleep for 3 seconds
            //---------------------------------

            case 0:

                if (this.timer >= 180) {

                    this.timer = 0;
                    this.sequence = 1;

                }

            break;

            //---------------------------------
            // Thunder + Lightning
            //---------------------------------

            case 1:

                lightning.flash();

                thunderSound.currentTime = 0;
                thunderSound.play();

                // Change to wake when ready
                player.state = "wake";

                this.timer = 0;
                this.sequence = 2;

            break;

            //---------------------------------
            // Wake for 2 seconds
            //---------------------------------

            case 2:

                if (this.timer >= 120) {

                    player.state = "idle";
                    player.control = true;

                    this.sequence = 3;

                }

            break;

            //---------------------------------
            // Gameplay
            //---------------------------------

            case 3:

            break;

        }

        player.update();
        interactionManager.update();

    }

    draw() {

        ctx.drawImage(
            this.background,
            0,
            0,
            canvas.width,
            canvas.height
        );

        player.draw();

        interactionManager.draw();

        dialogueBox.draw();

    }

}

const bedroomScene = new BedroomScene();