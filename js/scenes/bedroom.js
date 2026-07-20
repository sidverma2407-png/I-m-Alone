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

        // Intro Sound
        introSound.pause();
        introSound.currentTime = 0;
        introSound.play().catch(err => console.log(err));

        // Reset Player
        player.x = 120;
        player.y = 285;

        player.width = 520;
        player.height = 260;

        player.state = "sleep";
        player.control = false;

        player.wakeFrame = 0;
        player.wakeTimer = 0;

        // Fade Clock Sound
        const fadeClock = setInterval(() => {

            if (clockSound.volume > 0.01) {

                clockSound.volume -= 0.01;

            } else {

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
            // Sleep (5 seconds)
            //---------------------------------

            case 0:

                if (this.timer >= 300) {

                    lightning.flash();

                    thunderSound.currentTime = 0;
                    thunderSound.play();

                    player.state = "wake";
                    player.wakeFrame = 0;
                    player.wakeTimer = 0;

                    this.sequence = 1;

                }

            break;

            //---------------------------------
            // Wait until wake animation finishes
            //---------------------------------

            case 1:

                if (player.wakeFrame >= 2) {

                    fadeManager.fadeOut(() => {

                          // Move Sid beside the bed

    player.width = 240;
    player.height = 400;

    player.x = 560;
    player.y = canvas.height - player.height - 40;

    player.state = "stand";

    this.timer = 0;

    this.sequence = 2;

});

                    this.sequence = 99;

                }

            break;

            //---------------------------------
            // Waiting while fading out
            //---------------------------------

            case 99:

            break;

            //---------------------------------
            // Stand for 1 second
            //---------------------------------

            case 2:

                if (this.timer >= 60) {

                    player.state = "idle";

                    player.control = true;

                    fadeManager.fadeIn();

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

        fadeManager.update();

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

        fadeManager.draw();

    }

}

const bedroomScene = new BedroomScene();