class BedroomScene{

    start(){

        console.log("Bedroom Loaded");

    }

    update(){}

    draw(){

        ctx.fillStyle="black";

        ctx.fillRect(

            0,
            0,
            canvas.width,
            canvas.height

        );

        ctx.fillStyle="white";

        ctx.font="40px monospace";

        ctx.textAlign="center";

        ctx.fillText(

            "Bedroom Coming Soon...",

            canvas.width/2,

            canvas.height/2

        );

    }

}

const bedroomScene=new BedroomScene();