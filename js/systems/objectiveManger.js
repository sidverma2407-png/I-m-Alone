// =========================================
// OBJECTIVE MANAGER
// =========================================

class ObjectiveManager {

    constructor() {

        this.current = "";
        this.completed = false;

    }

    set(text) {

        this.current = text;
        this.completed = false;

    }

    complete() {

        this.completed = true;

    }

    draw() {

        if (!this.current) return;

        ctx.save();

        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(25,25,380,95);

        ctx.strokeStyle="#666";
        ctx.strokeRect(25,25,380,95);

        ctx.font="24px Cinzel";
        ctx.fillStyle="#ffffff";
        ctx.fillText("OBJECTIVE",45,60);

        ctx.font="20px Cinzel";

        if(this.completed){

            ctx.fillStyle="#59ff73";
            ctx.fillText("✓ "+this.current,45,100);

        }

        else{

            ctx.fillStyle="#ffffff";
            ctx.fillText("☐ "+this.current,45,100);

        }

        ctx.restore();

    }

}

const objectiveManager=new ObjectiveManager();