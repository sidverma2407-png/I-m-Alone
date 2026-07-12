// =========================================
// Dialogue Box
// =========================================

class DialogueBox {

    constructor() {

        this.visible = false;
        this.text = "";

    }

    show(text) {

        this.text = text;
        this.visible = true;

    }

    hide() {

        this.visible = false;

    }

    draw() {

        if (!this.visible) return;

        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.fillRect(80, canvas.height - 180, canvas.width - 160, 110);

        ctx.strokeStyle = "#666";
        ctx.strokeRect(80, canvas.height - 180, canvas.width - 160, 110);

        ctx.fillStyle = "white";
        ctx.font = "26px Cinzel";

        ctx.fillText(

            this.text,

            canvas.width / 2,

            canvas.height - 120

        );

    }

}

const dialogueBox = new DialogueBox();