export class Vector2 {

    constructor(x, y, width, height) {
        this.setPosition(x, y);
        this.setSize(width, height);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    initialise(position, size) {
        this.setSize(size[0], size[1]);
        this.setPosition(position[0], position[1]);
    }
    
    intersects(obj) {
        return obj.x <= this.x + this.width && obj.y <= this.y + this.height && obj.x + obj.width > this.x && obj.y + obj.height >= this.y
    }

    intersectsLeft(obj, velocity) {
        // the only way this is true is if there is an interaction between the side of the platform and the player
        return obj.x + 1.5 * velocity > this.x + this.width && this.y + this.height > obj.y + 1.5 * this.velocityY
    }

    outOfBounds(canvas) {
        return this.x + this.width < 0 || this.y > canvas.height;
    }
}
