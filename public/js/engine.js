import {Player} from "./player.js";
import {PlatformManager} from "./platform_manager.js";
import {Particle} from "./particle.js";
import {random, randomChoice} from "./util.js";

class GameEngine {

    constructor(ctx, fpsInterval) {
        if (!GameEngine.instance) {
            this.ctx = ctx;
            this.velocityX = 200/fpsInterval;
            this.adjust_for_fps(fpsInterval);

            this.score = 0;
            this.jumpCount = 0;
            this.player = new Player({
                x: ctx.canvas.offsetWidth / 5,
                y: ctx.canvas.offsetHeight / 3,
                width: Math.min(32, ctx.canvas.offsetWidth / 25),
                height: Math.min(32, ctx.canvas.offsetWidth / 25),
                jumpSize: - Math.min(32, ctx.canvas.offsetWidth / 25)
            });
            let jump_distance = this.player.calculate_jump_distance(this.velocityX, Math.abs(this.player.jumpSize), fpsInterval);
            let jump_height = this.player.calculate_jump_height(this.velocityX, Math.abs(this.player.jumpSize), fpsInterval);
            this.platformManager = new PlatformManager(ctx, jump_distance, jump_height);
            this.particles = [];
            this.particlesIndex = -1;
            this.particlesMax = 10;
            this.collidedPlatform = null;
            this.scoreColor = '#fff';
            this.jumpCountRecord = 0;
            this.maxSpikes = 0;
            this.updated = false;
            GameEngine.instance = this;
        } else {
            this.restart();
        }
    }

    step() {
        this.update();
        this.draw();
    }

    update() {
        // always update the player & particles, so death animation can trigger.
        this.player.update();
        for (let particle of this.particles) particle.update();
        // game still playing.
        if (this.velocityX > 0) {

            this.score += Math.floor((1000/40) * (1 + (this.jumpCount > 0 ? this.jumpCount / 100 : 0)));

            if (this.updated === false && this.jumpCount % 10 === 0 && this.jumpCount > 0) {
                this.updated = true;
                this.accelerationTweening *= 1.05;
                this.platformManager.minDistanceBetween *= 1.1;
                if (this.jumpCount % 10 === 0) this.maxSpikes++;
                this.particlesMax = Math.min(25, this.particlesMax + 5);
            } else if (this.jumpCount % 10 !== 0) {
                this.updated = false;
            }

            // update all the platforms (and spikes)
            this.update_platforms();
            // accelerate
            this.velocityX += this.accelerationTweening / 2500;
        }
    }

    update_platforms() {
        let intersectionCount = 0;
        for (let platform of this.platformManager.platforms) {
            if (this.player.intersects(platform)) {

                intersectionCount++;
                this.player.jumpsLeft = 2;
                this.collidedPlatform = platform;
                // game still playing
                if (this.velocityX > 0) this.spawn_particles(this.player.x * 1.1, this.player.y + this.player.height * 0.975, 0, this.collidedPlatform);

                if (this.player.intersectsLeft(platform, this.velocityX)) {
                    this.handle_collision(platform);
                } else {
                    this.player.x = this.player.previousX;
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onPlatform = true;
                }
            } 

            for (let spike of platform.spikes) {
                if (this.player.intersects(spike)) {
                    this.handle_collision(spike);
                }
            }

            if (this.player.y >= this.ctx.canvas.height) {
                this.handle_collision(platform); 
            }
        }
        // not on a platform.
        if (intersectionCount === 0) this.player.onPlatform = false;
        // update each platform i.e. move them
        this.platformManager.update(this.ctx.canvas, this.velocityX, this.maxSpikes);
    }

    handle_collision(obj) {
        // stop the screen moving, trigger restart screen
        this.velocityX = 0;
        this.accelerationTweening = 0;
        // reset the player variables.
        this.player.x = obj.x - 48;
        this.player.onPlatform = false;
        this.player.velocityY = this.player.jumpSize/2;
        this.spawn_particles(this.player.x, this.player.y, this.player.height, obj);
        // make the restart screen visible.
        document.querySelector("#runner_after").style.display = "block";
    }

    draw() {
        // prevent ghosting
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // draw the player
        this.player.draw(this.ctx);

        for (let platform of this.platformManager.platforms) {
            platform.draw(this.ctx);
            for (let spike of platform.spikes) {
                console.log("op");
                spike.draw(this.ctx);
            }
        }

        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }
    }

    restart() {
        this.score = 0;
        this.jumpCount = 0;
        this.maxSpikes = 0;
        // reset x velocity.
        this.velocityX = 200/this.fpsInterval;
        this.particlesIndex = -1;
        this.particlesMax = 10;
        this.collidedPlatform = null;
        this.scoreColor = '#fff';
        // Set the velocity and acceleration for this FPS.
        this.adjust_for_fps(this.fpsInterval);
        // Reset the player's x, y and velocities.
        this.player.restart(this.ctx);
        // Reset all the platforms, to account for reset player jump size & gravity.
        let jump_distance = this.player.calculate_jump_distance(this.velocityX, Math.abs(this.player.jumpSize), this.fpsInterval);
        let jump_height = this.player.calculate_jump_height(this.velocityX, Math.abs(this.player.jumpSize), this.fpsInterval);
        this.platformManager.updateOnDeath(this.ctx.canvas, jump_distance, jump_height);
    }

    spawn_particles(position_x, position_y, tolerance, collider) {
        let particle_size = 3 + this.ctx.canvas.offsetWidth / 200;
        for (let i = 0; i < 10; i++) {
            this.particlesIndex = this.particlesIndex === this.particlesMax ? 0 : this.particlesIndex + 1;
            let x_velocity = -(random(particle_size/2, particle_size * 2) + random(this.velocityX, 4 * this.velocityX)/5);
            // create new particle object if it hasn't been created before
            if (this.particles.length <= this.particlesMax) {
                this.particles[this.particlesIndex] = new Particle({
                    x: position_x,
                    y: tolerance == 0 ? position_y : random(position_y, position_y + tolerance),
                    color: collider.color,
                    size: particle_size,
                    vel_x: x_velocity
                });
            } else {
                // if we have already created a particle object, just change its position and velocities (don't create unnecessary objects).
                this.particles[this.particlesIndex].set(position_x, tolerance == 0 ? position_y : random(position_y, position_y + tolerance), collider.color, x_velocity);
            }
        }
    }

    resize_entities(ctx, original_size) {
        this.ctx = ctx;
        // check to see if the canvas was actually resized.
        if (ctx.width !== original_size[0] || ctx.height != original_size[1]) {
            console.log("Resizing canvas from " + original_size + " to " + [ctx.canvas.width, ctx.canvas.height]);
            // prevent NPE
            this.particlesIndex = -1;
            // resize player and platforms (incl spikes).
            this.player.resize(ctx, original_size);
            this.platformManager.resize(ctx, original_size, this.player.calculate_jump_distance(this.velocityX, Math.abs(this.player.jumpSize), this.fpsInterval));
        } else {
            console.log("Canvas size unchanged. Not resizing..");
        }
    }

    do_jump() {
        try {
            // if the game is running and the player is elligible to jump, process it.
            if (this.velocityX > 0 && this.player.canJump()) {
                this.player.doJump();
                // now update the score
                if (++this.jumpCount > this.jumpCountRecord) {
                    this.jumpCountRecord = this.jumpCount;
                    let multiplerText = Math.floor((this.jumpCountRecord + 100) / 100) + '.';
                    document.querySelector("#runner_multiplier").innerHTML = (this.jumpCountRecord < 10 ? multiplerText + "0" :  multiplerText) + this.jumpCountRecord;
                }
            }
        } catch (UninitialisedException) {
            console.log("Exception encountered when attempting to process a jump: \n" + UninitialisedException);
        }
    }

    // Adjust the velocities based on the fps
    adjust_for_fps(new_fps) {
        if (this.velocityX && this.velocityX > 0) {
            // get the current velocity, expressed as pixels per second.
            const pixels_per_second = this.fpsInterval ? this.velocityX * this.fpsInterval : 200;
            this.fpsInterval = new_fps;
            // update the velocity to move the same number of pixels for new fps
            this.velocityX = pixels_per_second /  this.fpsInterval;
            // Hardcoded acceleration means that the increase is logarithmic.
            // i.e. doubles in the first 30 seconds and increases by 50% in next 30.
            this.accelerationTweening = (2500 * (200 / new_fps))/(30 * new_fps);
            // Adjust player jump height and gravity to maintain proportions.
            if (this.player) this.player.adjust_for_fps(this.ctx, new_fps);
        }
    }
}

export default GameEngine