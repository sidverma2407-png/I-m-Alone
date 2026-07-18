// =========================================
// Camera Shake
// =========================================

class CameraShake {

    constructor() {

        this.duration = 0;
        this.strength = 0;

    }

    start(duration = 15, strength = 5) {

        this.duration = duration;
        this.strength = strength;

    }

    begin() {

        if (this.duration <= 0) return;

        ctx.save();

        ctx.translate(

            (Math.random() - 0.5) * this.strength,

            (Math.random() - 0.5) * this.strength

        );

        this.duration--;

    }

    end() {

        if (this.duration >= 0) {

            try{

                ctx.restore();

            }

            catch(e){}

        }

    }

}

const cameraShake = new CameraShake();