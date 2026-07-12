// =========================================
// Interaction Manager
// =========================================

class InteractionManager {

    constructor() {

        this.objects = [];

        this.current = null;

    }

    add(obj) {

        this.objects.push(obj);

    }

    update() {

        this.current = null;

        for (const obj of this.objects) {

            const dx = Math.abs(player.x - obj.x);

            if (dx < obj.range) {

                this.current = obj;
                break;

            }

        }

    }

    interact() {

        if (!this.current) return;

        dialogueBox.show(this.current.text);

    }

    draw() {

        if (!this.current) return;

        ctx.textAlign = "center";

        ctx.fillStyle = "white";
        ctx.font = "24px Cinzel";

        ctx.fillText(

            "[ E ]",

            this.current.x,

            this.current.y - 40

        );

    }

}

const interactionManager = new InteractionManager();