// =========================================
// Base Game Object
// =========================================

class GameObject {

    constructor(x, y, width, height) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.visible = true;
        this.active = true;

    }

    update() {

    }

    draw() {

    }

    interact() {

    }

}