class BedroomScene {

    constructor() {

        this.background = new Image();
        this.background.src = "assets/images/bedroom.png";

        this.introTimer = 0;
        this.thunderPlayed = false;

    }

    start() {

        console.log("Bedroom Loaded");

        // Fade out clock ticking
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

        // ----------------------------
        // Interaction Objects
        // ----------------------------

        interactionManager.objects = [];

        // Bed
        interactionManager.add({

            x: 260,
            y: 520,
            range: 120,

            text: "It's still warm..."

        });

        // Window
        interactionManager.add({

            x: canvas.width / 2,
            y: 320,
            range: 140,

            text: "It's raining outside..."

        });

        // Clock
        interactionManager.add({

            x: 180,
            y: 180,
            range: 120,

            text: "3:15 AM"

        });

        // Desk
        interactionManager.add({

            x: canvas.width - 260,
            y: 430,
            range: 140,

            text: "My notebook..."

        });

        // Door
        interactionManager.add({

            x: canvas.width - 80,
            y: 420,
            range: 120,

            text: "It's locked."

        });

    }

    update() {

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