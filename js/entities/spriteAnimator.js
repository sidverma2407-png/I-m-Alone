class SpriteAnimator {

    constructor(path, count) {

        this.frames = [];
        this.frame = 0;
        this.timer = 0;
        this.speed = 8;

        for (let i = 1; i <= count; i++) {

            const img = new Image();
            img.src = path + i + ".png";

            this.frames.push(img);

        }

    }

    update() {

        this.timer++;

        if (this.timer >= this.speed) {

            this.timer = 0;

            this.frame++;

            if (this.frame >= this.frames.length)
                this.frame = 0;

        }

    }

    draw(x, y, w, h) {

        const img = this.frames[this.frame];

        if (img.complete) {

            ctx.drawImage(img, x, y, w, h);

        }

    }

}