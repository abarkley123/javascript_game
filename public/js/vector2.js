export class Vector2 {

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.previousX = 0;
        this.previousY = 0;
    }

    setPosition(x, y) {
        this.previousX = this.x;
        this.previousY = this.y;
        this.x = x;
        this.y = y;
    }

    setX(x) {
        this.previousX = this.x;
        this.x = x;
    }

    setY(y) {
        this.previousY = this.y;
        this.y = y;
    }

    intersects(obj) {
        return obj.x <= this.x + this.width && obj.y <= this.y + this.height && obj.x + obj.width > this.x && obj.y + obj.height >= this.y
    }

    intersectsLeft(obj, velocity) {
        // the only way this is true is if there is an interaction between the side of the platform and the player
        return obj.x + 1.5 * velocity > this.x + this.width && this.y + this.height > obj.y + 1.5 * this.velocityY
    }
}
