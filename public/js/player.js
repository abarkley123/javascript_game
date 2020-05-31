import {Vector2} from "./vector2.js";

export class Player extends Vector2 {

    constructor(options) {
        super(options.x, options.y, options.width, options.height);
            this.velocityY = 0;
            this.color = "#ff4655";
            this.jumpVelocity = options.jumpVelocity;
            // player starts mid-air, so only 1 extra jump should be permitted.
            this.jumpsLeft = 1;
            this.onPlatform = false;
            this.fallSpeed = this.jumpVelocity / -20; // placeholder
    }

    update() {
        this.y += this.velocityY;
        this.velocityY = this.onPlatform === true ? 0 : this.velocityY + this.fallSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // avoid sub pixel rendering, so use integers instead of floats
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.width), Math.floor(this.height));
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#9E111C";
        ctx.strokeRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.width), Math.floor(this.height));
    }

    // adjust the x and y positions to maintain the player's position & adjust y velocity to maintain jump size.
    resize(ctx, originalSizes) {
        let heightRatio = ctx.canvas.height / originalSizes[1];
        this.setPosition(ctx.canvas.width / 5, this.y * heightRatio);
        // set new velocity
        this.velocityY = this.onPlatform === true ? 0 : this.velocityY * heightRatio;
    }

    // adjust the jump height and fallSpeed so that the player moves consistently.
    adjustForFps(ctx, newFps) {
        const jumpHeight = ctx.canvas.height / 2;
        // the constants here adjust for large width - height ratios.
        this.jumpVelocity = -(5 + jumpHeight/ (newFps/2));
        this.fallSpeed = 0.25 + this.jumpVelocity / - (newFps/2);
    }

    // Functions to consider jumps - may extend to multiple jumps/flight in future //
    canJump() {
        return this.jumpsLeft > 0;
    }

    doJump() {
        this.jumpsLeft--;
        this.onPlatform = false;
        this.velocityY = this.jumpsLeft === 0 ? this.jumpVelocity * 0.667 : this.jumpVelocity;   
    }

    // get junp distance and heights by simulating the next N frames
    getProjectileProperties(velocityX, velocityY) {
        let tmpX = this.x, tmpY = this.y - 1, tmpVelY = velocityY, peakY = this.y;

        while (tmpY < this.y) {
            tmpX += velocityX;
            peakY = Math.min(peakY, tmpY += tmpVelY);
            tmpVelY += this.fallSpeed;
        }

        return [tmpX - this.x, this.y - peakY]
    }
}


