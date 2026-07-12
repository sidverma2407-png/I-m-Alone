// =========================================
// I'M ALONE
// Intro Scene
// =========================================

class IntroScene {

    constructor() {

        this.messages = [

            "GAME STARTING...",
            "You are Sid.",
            "You wake up.",
            "3:14 AM",
            "You were never alone."

        ];

        this.current = 0;

        this.state = "fadeIn";

        this.alpha = 0;

        this.timer = 0;

    }

    start() {

        this.current = 0;
        this.state = "fadeIn";
        this.alpha = 0;
        this.timer = 0;

        cinematicBars.show();

        console.log("Intro Started");

    }

    update() {

        switch(this.state){

            // --------------------
            // Fade In
            // --------------------

            case "fadeIn":

                this.alpha += 0.01;

                if(this.alpha >= 1){

                    this.alpha = 1;

                    this.state = "hold";

                    this.timer = 0;

                }

            break;

            // --------------------
            // Hold
            // --------------------

            case "hold":

                this.timer++;

                if(this.timer > 173){

                    this.state = "fadeOut";

                }

            break;

            // --------------------
            // Fade Out
            // --------------------

            case "fadeOut":

                this.alpha -= 0.01;

                if(this.alpha <= 0){

                    this.alpha = 0;

                    this.current++;

                    if(this.current >= this.messages.length){

                        fadeManager.fadeOut(() => {

                            cinematicBars.hide();

                            sceneManager.change(bedroomScene);

});

                    }else{

                        this.state = "fadeIn";

                    }

                }

            break;

        }

    }

    draw(){

        // Background

        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        // Opacity

        ctx.globalAlpha = this.alpha;

        // Alignment

        ctx.textAlign = "center";

        // Blood red colours

        switch(this.current){

            case 0:

                ctx.fillStyle="#ffffff";

            break;

            case 1:

                ctx.fillStyle="#6b0000";

            break;

            case 2:

                ctx.fillStyle="#850000";

            break;

            case 3:

                ctx.fillStyle="#990000";

            break;

            case 4:

                ctx.fillStyle = "#7A0000";
                ctx.shadowColor = "#AA0000";
                ctx.shadowBlur = 40;

            break;

        }

        // Glow

        ctx.shadowColor="#8b0000";
        ctx.shadowBlur = 25 + Math.sin(Date.now()*0.004)*10;

        // Breathing Effect

        const scale=1+Math.sin(Date.now()*0.0015)*0.02;

        ctx.save();

        ctx.translate(canvas.width/2,canvas.height/2);

        ctx.scale(scale,scale);

        ctx.translate(-canvas.width/2,-canvas.height/2);

        // Font

        const fontSize = 64 + Math.sin(Date.now()*0.002)*2;

        ctx.font = `700 ${fontSize}px Cinzel`;

        // Draw

        ctx.fillText(

            this.messages[this.current],

            canvas.width/2,

            canvas.height/2

        );

        ctx.restore();

        // Reset

        ctx.shadowBlur=0;

        ctx.globalAlpha=1;

    }

}

const introScene = new IntroScene();