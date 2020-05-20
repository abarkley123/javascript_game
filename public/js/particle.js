import {random} from "./util.js";

export class Particle {

    constructor(options) {
        this.size = options.size;
        // for reusing the particle
        this.originalSize = this.size; 
        this.set(options.x, options.y, options.color);
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY / 4;
        this.size *= 0.9;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * 0.9, this.y, this.size, this.size);
    }

    set(x, y, color, velocityX = -random(this.originalSize/2, this.originalSize * 4), velocityY =  -random(this.originalSize/2, this.originalSize * 4)) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.size = this.originalSize;
    }
}