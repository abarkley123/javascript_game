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
        this.y += (this.velocityY / 4);
        this.size *= 0.9;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.floor(this.x * 0.875), Math.floor(this.y), Math.floor(this.size), Math.floor(this.size));
    }

    set(x, y, color, velocityX = -random(this.originalSize/2, this.originalSize * 4), velocityY =  random(-30, 0)) {
        this.x = x;
        this.y = y - this.originalSize/2;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.size = this.originalSize;
    }
}