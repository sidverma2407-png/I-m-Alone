// =========================================
// I'M ALONE
// Intro Scene
// =========================================

class IntroScene {

    constructor() {

        this.messages = [

            "GAME STARTING...",
            "You were never alone.",
            "You are Sid.",
            "You wake up.",
            "3:00 AM"

        ];

        this.index = 0;

        this.timer = 0;

        this.fade = 0;

        this.fadeIn = true;

    }

    start() {

        this.index = 0;
        this.timer = 0;
        this.fade = 0;
        this.fadeIn = true;

        console.log("Intro Started");

    }

    update() {

        if(this.fadeIn){

            this.fade += 0.02;

            if(this.fade >= 1){

                this.fade = 1;

                this.fadeIn = false;

            }

        }

        this.timer++;

        if(this.timer > 180){

            this.timer = 0;

            this.fade = 0;

            this.fadeIn = true;

            this.index++;

            if(this.index >= this.messages.length){

                sceneManager.change(bedroomScene);

            }

        }

    }

    draw(){

        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.globalAlpha = this.fade;

        ctx.fillStyle = "white";

        ctx.textAlign = "center";

        ctx.font = "bold 54px monospace";

        ctx.fillText(

            this.messages[this.index],

            canvas.width/2,

            canvas.height/2

        );

        ctx.globalAlpha = 1;

    }

}
const introScene = new IntroScene();