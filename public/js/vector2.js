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
        return obj.x <= this.x + this.width 
            && obj.y <= this.y + this.height
            && obj.x + obj.width > this.x;
    }

    intersectsLeft(obj, velocity) {   
        // the only way this is true is if there is an interaction between the side of the platform and the player
        return this.boundedByX(obj, velocity) && (this.y > obj.y + 2 * this.velocityY);
    }

    boundedByX(obj, velocity) {
        // return obj.x <= this.x + this.width && obj.x + velocity + this.width > this.x + this.width; 
        return this.x + this.width >= obj.x && this.x < obj.x + velocity;
    }

    outOfBounds(canvas) {
        return this.x + this.width < 0 || this.y > canvas.height;
    }
}
