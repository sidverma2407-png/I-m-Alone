// =========================================
// Clock
// =========================================

class Clock extends GameObject {

    constructor(x,y){

        super(x,y,90,90);

        this.sprite=new Image();

        this.sprite.src="assets/bedroom/clock.png";

    }

    interact(){

        console.log(

            "It's stuck at 3:00 AM..."

        );

    }

    draw(){

        if(this.sprite.complete){

            ctx.drawImage(

                this.sprite,

                this.x,

                this.y,

                this.width,

                this.height

            );

        }

    }

}