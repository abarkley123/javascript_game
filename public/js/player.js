import {Vector2} from "./vector2.js";

export class Player extends Vector2 {

    constructor(options) {
        super(options.x, options.y, options.width, options.height);
        if (!Player.instance) {
            this.setPosition(options.x, options.y);
            this.velocityX = 0;
            this.velocityY = 0;
            this.jumpSize = options.jumpSize;
            this.color = "#fff";
            this.jumpsLeft = 2;
            this.onPlatform = false;
            Player.instance = this;
            this.gravity = this.jumpSize / -20; // 40 frames per second target
        }
    }

    update() {
        if (this.onPlatform === false) this.velocityY += this.gravity; // falling - terminal velocity
        this.setPosition(this.x + this.velocityX, this.y + this.velocityY);
    }

    draw(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    restart(ctx) {
        this.x = ctx.canvas.offsetWidth / 5;
        this.y = ctx.canvas.offsetHeight / 4;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onPlatform = false;
    }

    calculate_jump_distance(vel_x, vel_y) {
        const adjusted_vel_x = 40 * vel_x
        const angle = Math.atan(vel_y / adjusted_vel_x)
        const actual_velocity = Math.sqrt((adjusted_vel_x * adjusted_vel_x) + ((vel_y) * (vel_y)));

        return ((actual_velocity * actual_velocity) * Math.sin(2 * angle))/(this.gravity * 40);
    }

    resize(ctx, original_sizes, new_velocity) {
        this.width = Math.min(32, ctx.canvas.offsetWidth / 25);
        this.height = Math.min(32, ctx.canvas.offsetWidth / 25);

        // fix x and y 
        let heightRatio = ctx.canvas.height / original_sizes[0];

        this.x = ctx.canvas.offsetWidth / 5;
        this.y = ctx.canvas.offsetHeight / 4;
        // set velocity
        if (this.onPlatform === true) {
            this.velocityY *= heightRatio;
        } else {
            this.velocityY = 0;
        }

        // fix jump and gravity
        this.jumpSize = -2 * new_velocity;
        this.gravity = this.jumpSize / -20;
    }
}