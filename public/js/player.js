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
            Player.instance = this;
            this.gravity = this.jumpSize / -20; // 40 frames per second target
        }
    }

    update() {
        this.velocityY += this.gravity; // falling - terminal velocity
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
    }

    calculate_jump_distance(vel_x, vel_y) {
        const adjusted_vel_x = 40 * vel_x
        const angle = Math.atan(vel_y / adjusted_vel_x)
        const actual_velocity = Math.sqrt((adjusted_vel_x * adjusted_vel_x) + ((vel_y) * (vel_y)));

        return ((actual_velocity * actual_velocity) * Math.sin(2 * angle))/(this.gravity * 40);
    }
}