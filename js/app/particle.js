
class Particle {

    constructor(options) {
        this.x = options.x;
        this.y = options.y;
        this.size = 10;
        this.velocityX = options.velocityX || 2 * random(-(engine.velocityX * 3) + -8, -(engine.velocityX * 3));
        this.velocityY = options.velocityY || random(-(engine.velocityX * 3) + -8, -(engine.velocityX * 3));
        this.color = options.color;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY / 4;
        this.size *= 0.89;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * 0.9, this.y, this.size, this.size);
    }
}