import {random} from "./util.js";
import {Vector2} from "./vector2.js";

export class Particle extends Vector2 {

    constructor(options) {
        super(0, 0, options.size, options.size);
        // for reusing the particle
        this.originalSize = this.width; 
    }

    update() {
        this.setSize(this.width * 0.9, this.height * 0.9);
        this.setPosition(this.x + this.velocityX, this.y + (this.velocityY / 4));
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.floor(this.x * 0.875), Math.floor(this.y), Math.floor(this.width), Math.floor(this.height));
    }

    set(x, y, color, velocityX = -random(this.originalSize/2, this.originalSize * 4), velocityY =  random(-30, 0)) {
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.initialise([x, y - this.originalSize/2], [this.originalSize, this.originalSize])
    }
}