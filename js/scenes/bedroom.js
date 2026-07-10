// =========================================
// Bedroom Scene
// =========================================

class BedroomScene {

    constructor() {

        this.brightness = 0;

    }

    start() {

        this.brightness = 0;

        console.log("Bedroom Loaded");

    }

    update() {

        if (this.brightness < 1) {

            this.brightness += 0.005;

        }

    }

    draw() {

        // Room

        ctx.fillStyle = "#242424";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // Temporary Text

        ctx.globalAlpha = this.brightness;

        ctx.fillStyle = "white";

        ctx.font = "42px Cinzel";

        ctx.textAlign = "center";

        ctx.fillText(

            "Bedroom Coming Soon...",

            canvas.width/2,

            canvas.height/2

        );

        ctx.globalAlpha = 1;

    }

}

const bedroomScene = new BedroomScene();