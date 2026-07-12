// =========================================
// Bed
// =========================================

class Bed extends GameObject {

    constructor(x,y){

        super(x,y,320,180);

        this.sprite=new Image();

        this.sprite.src="assets/bedroom/bed.png";

    }

    interact(){

        console.log(

            "I don't want to sleep again."

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