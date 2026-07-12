// =========================================
// Door
// =========================================

class Door extends GameObject {

    constructor(x, y) {

        super(x, y, 80, 180);

        this.open = false;

        this.sprite = new Image();
        this.sprite.src = "assets/bedroom/door.png";

    }

    interact() {

        this.open = !this.open;

        console.log(

            this.open ? "Door Opened" : "Door Closed"

        );

    }

    draw() {

        if(!this.visible)
            return;

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