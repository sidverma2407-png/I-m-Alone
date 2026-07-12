class BedroomScene {

    constructor() {

        this.background = new Image();
        this.background.src = "assets/images/bedroom.png";

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

            // Reset for future use
            clockSound.volume = 0.18;

        }

    }, 80);

}

    // 👇 REPLACE THIS
    update() {

        player.update();

    }

    // 👇 REPLACE THIS
draw() {

    ctx.drawImage(
        this.background,
        0,
        0,
        canvas.width,
        canvas.height
    );

    player.draw();

}
}

const bedroomScene = new BedroomScene();