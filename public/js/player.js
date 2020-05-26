import {Vector2} from "./vector2.js";

export class Player extends Vector2 {

    constructor(options) {
        super(options.x, options.y, options.width, options.height);
            this.setPosition(options.x, options.y);
            this.velocityX = 0;
            this.velocityY = 0;
            this.jumpSize = options.jumpSize;
            this.color = "#fff";
            // player starts mid-air, so only 1 extra jump should be permitted.
            this.jumpsLeft = 1;
            this.onPlatform = false;
            Player.instance = this;
            this.gravity = this.jumpSize / -20; // placeholder
    }

    update() {
        // Applying 'gravity' up to a maximum i.e. terminal velocity
        if (this.onPlatform === false && this.velocityY < 117) this.velocityY += this.gravity;
        this.setPosition(this.x + this.velocityX, this.y + this.velocityY);
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.stroke();
    }

    // adjust the x and y positions to maintain the player's position on screen. 
    // adjust y velocity to maintain jump size.
    resize(ctx, original_sizes) {
        this.width = 32;
        this.height = 32;

        // fix x and y 
        let heightRatio = ctx.canvas.height / original_sizes[1];
        this.x = ctx.canvas.width / 5;
        this.y *= heightRatio;
        // set velocity
        if (this.onPlatform === false) {
            this.velocityY *= heightRatio;
        } else {
            this.velocityY = 0;
        }
    }

    // adjust the jump height and gravity so that the player moves consistently.
    adjust_for_fps(ctx, new_fps) {
        const jump_height = ctx.canvas.height / 2;
        // the constants here adjust for large width - height ratios.
        this.jumpSize = -(5 + jump_height/ (new_fps/2));
        this.gravity = 0.25 + this.jumpSize / - (new_fps/2);

    }

    // Functions to consider jumps - may extend to multiple jumps/flight in future //
    canJump() {
        return this.jumpsLeft > 0;
    }

    doJump() {
        this.jumpsLeft--;
        this.onPlatform = false;
        this.velocityY = this.jumpsLeft === 0 ? this.jumpSize * 0.667 : this.jumpSize;            
    }

    // This function models the players jump using projectile motion, where the range is given by: (velocity^2 * sin (2*angle)) / gravity
    calculate_jump_distance(vel_x, vel_y, fps) {
        vel_y = Math.abs(vel_y);
        // The x velocity used by the engine is processed each frame, however the equation 
        // requires a per-second estimate. The frame target is 40 fps, so this should be reasonable.
        const adjusted_vel_x = fps * vel_x
        // Using Pythagoras' theorem, the jump angle can be determined. tan(angle) = opposite / adjacent. 
        // So, plugging in the values for the y component of velocity and x component of velocity.
        // Therefore, the actual angle (in radians) is the arctan (or inverse tan) of this value.
        const angle = Math.atan(vel_y / adjusted_vel_x)
        // Again, using Pythagoras' theorem the composite velocity can be determined. This uses the
        // Equations for a right-angled triangle i.e. c^2 = a^2 + b^2 (where a = x velocity and b = y velocity).
        const actual_velocity = Math.sqrt((adjusted_vel_x * adjusted_vel_x) + ((vel_y) * (vel_y)));
        // Substituting the values above into the equation for range, the jump distance can be determined.
        // As with x velocity, gravity is processed by the engine per-frame, so it must be adjusted to a per-second value.
        return ((actual_velocity * actual_velocity) * Math.sin(2 * angle))/(this.gravity * 40);
    }

    // This function models the players jump using projectile motion, where the height is given by: h2 = (u^2 * sin^2(angle))/2*gravity
    calculate_jump_height(vel_x, vel_y, fps) {
        vel_y = Math.abs(vel_y);
        // The x velocity used by the engine is processed each frame, however the equation requires a per-second estimate.
        const adjusted_vel_x = fps * vel_x;
        const adjusted_vel_y = fps * vel_y;
        // Using Pythagoras' theorem, the jump angle can be determined. tan(angle) = opposite / adjacent. 
        // So, plugging in the values for the y component of velocity and x component of velocity.
        // Therefore, the actual angle (in radians) is the arctan (or inverse tan) of this value.
        const angle = Math.atan(vel_y / adjusted_vel_x)
        // Again, using Pythagoras' theorem the composite velocity can be determined. This uses the
        // Equations for a right-angled triangle i.e. c^2 = a^2 + b^2 (where a = x velocity and b = y velocity).
        const actual_velocity = Math.sqrt((adjusted_vel_x * adjusted_vel_x) + ((adjusted_vel_y) * (adjusted_vel_y)));
        // Substituting the values above into the equation for range, the maximum height can be determined.
        // As with x velocity, gravity is processed by the engine per-frame, so it must be adjusted to a per-second value.
        return Math.pow(actual_velocity, 2) * Math.pow(Math.sin(angle), 2) / (80 * this.gravity);
    }
}