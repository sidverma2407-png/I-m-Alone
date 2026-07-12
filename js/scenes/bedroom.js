class BedroomScene {

    constructor() {

        this.background = new Image();
        this.background.src = "assets/images/bedroom.png";

    }

    start() {

        console.log("Bedroom Loaded");

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