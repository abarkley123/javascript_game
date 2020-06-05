import {Player} from "./player.js";
import {PlatformManager} from "./platform_manager.js";
import {ParticleManager} from "./particle_manager.js";
import log from "./logger.mjs";

class GameEngine {

    constructor(ctx, fpsInterval, audioManager) {
        this.audioManager = audioManager;
        this.setup(ctx, fpsInterval);
    }

    setup(ctx, fpsInterval) {
        this.ctx = ctx;
        this.velocityX = 200/fpsInterval;
        this.adjustForFps(fpsInterval);

        this.score = 0;
        this.jumpCount = 0;
        this.jumpCountRecord = 0;

        this.player = new Player({
            x: ctx.canvas.offsetWidth / 5, y: ctx.canvas.offsetHeight / 3,
            width: Math.min(32, ctx.canvas.offsetWidth / 25), height: Math.min(32, ctx.canvas.offsetWidth / 25),
            jumpVelocity: - Math.min(32, ctx.canvas.offsetWidth / 25)
        });
        this.particleManager = new ParticleManager({particlesMax: 10, particleSize: 3 + this.ctx.canvas.offsetWidth / 200, engineSpeed: this.velocityX});
        this.platformManager = new PlatformManager(ctx, this.player.getProjectileProperties(this.velocityX, this.player.jumpVelocity));
        
        this.difficultyLevel = 1;
        // make sure the background music plays
        this.audioManager.playAudio("backgroundMain");
    }

    step() {
        // don't waste cpu resources if the game isn't running. Allow particles to finish drawing if a collision occurs.
        if (this.stillPlaying() === true || this.player.outOfBounds(this.ctx.canvas) === false) {
            this.update();
            this.draw();
        }
    }

    stillPlaying() {
        return this.velocityX && this.velocityX > 0;
    }

    update() {
        // always update the player & particles, so death animation can trigger.
        this.player.update();        
        this.particleManager.update();
        // game still playing.
        if (this.stillPlaying() === true) {
            if (this.player.outOfBounds(this.ctx.canvas) === true) this.handleCollision(this.player); 
            this.score += Math.floor((1000/40) * (1 + (this.jumpCount > 0 ? this.jumpCount / 100 : 0)));

            if (this.jumpCount % 10 === 0 && this.jumpCount > 0 && this.jumpCount <= 60 && Math.floor(this.jumpCount/10) === this.difficultyLevel) {
                this.difficultyLevel = 1 + Math.floor(this.jumpCount/10);
                this.accelerationTweening *= 1.05;
                this.particleManager.increaseParticleCountTo(Math.min(25, this.particleManager.particlesMax + 5));
                // update platform spacing to accomodate for increased speed.
                this.platformManager.minDistanceX += Math.ceil(this.platformManager.maxDistanceX/16);
                this.platformManager.updatePlatformGaps(this.ctx.canvas, this.player.getProjectileProperties(this.velocityX, this.player.jumpVelocity));
            } 

            // check for any collisions between player and environment, then update all the platforms (and spikes)
            this.checkForCollisions();
            this.platformManager.update(this.ctx.canvas, this.velocityX, this.difficultyLevel);
            // accelerate, but only up to a point
            if (this.jumpCount < 60) this.velocityX += this.accelerationTweening / 2500;
        }
    }

    checkForCollisions() {
        for (let platform of this.platformManager.platforms) {
            let collider = platform.spikes.filter(spike => this.player.intersects(spike))[0];
            if (collider || this.player.intersectsLeft(platform, this.velocityX)) {
                this.handleCollision(collider || platform);
            } else if (this.player.intersects(platform)) {
                this.player.jumpsLeft = 2;
                this.player.onPlatform = true;  
                this.player.y = platform.y - this.player.height;
                this.particleManager.spawnParticles(this.player.x * 1.1, this.player.y + this.player.height * 0.9, 0, platform);
                break; // found the collider, so no point continuing (two platforms never occupy same space).           
            } 

            this.player.onPlatform = false;
            // if the player slides off a platform, don't allow two jumps.
            if ( this.player.onPlatform === false && this.player.jumpsLeft === 2) this.player.jumpsLeft--;
        }
    }

    handleCollision(obj) {
        this.audioManager.playAudio("collision", 0.3);
        // stop the screen moving, trigger restart screen
        this.velocityX = 0;
        this.accelerationTweening = 0;
        // reset the player variables.
        this.player.x = obj.x - 48;
        this.player.velocityY = this.player.jumpVelocity/2;
        this.particleManager.spawnParticles(this.player.x + this.player.width, this.player.y + this.player.height * 0.9, this.player.height, obj);
        // make the restart screen visible.
        document.querySelector("#runner_after").style.display = "block";
        document.querySelector("#idle_background").style.display = 'block';
        document.querySelector("#playing_background").style.display = 'none';
    }

    draw() {
        // prevent ghosting
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        // draw entities
        this.player.draw(this.ctx);
        this.particleManager.particles.forEach((particle) => particle.draw(this.ctx));
        this.platformManager.platforms.forEach((platform) => platform.draw(this.ctx));
    }

    restart() {
        this.setup(this.ctx, this.fpsInterval);
    }

    resizeEntities(ctx, originalSizes) {
        this.ctx = ctx;
        // check to see if the canvas was actually resized.
        if (ctx.canvas.width !== originalSizes[0] || ctx.canvas.height !== originalSizes[1]) {
            log("Resizing canvas from " + originalSizes + " to " + [ctx.canvas.width, ctx.canvas.height], "debug");
            // resize player, particles and platforms (incl spikes).
            this.player.resize(ctx, originalSizes);
            this.platformManager.resize(ctx, originalSizes);
            this.particleManager.resize(ctx, this.velocityX);
            // now update the gaps (vertically and horizontally) between platforms.
            this.platformManager.updatePlatformGaps(this.ctx.canvas, this.player.getProjectileProperties(this.velocityX, this.player.jumpVelocity));
        } else {
            log("Canvas size unchanged. Not resizing..", "debug");
        }
    }

    processJump() {
        // if the game is running and the player is elligible to jump, process it.
        if (this.stillPlaying() === true && this.player.canJump() === true) {
            this.audioManager.playAudio((this.player.jumpsLeft === 2 ? "first" : "second") + "Jump", 0.15);
            this.player.doJump();
            // now update the score
            if (++this.jumpCount > this.jumpCountRecord) {
                this.jumpCountRecord = this.jumpCount;
                document.querySelector("#runner_multiplier").innerHTML = ((this.jumpCount + 100) / 100).toFixed(2);
            }
        }
    }

    // Adjust the velocities based on the fps
    adjustForFps(newFps) {
        if (this.stillPlaying() === true) {
            // get the current velocity, expressed as pixels per second.
            const pixelsPerSecond = this.fpsInterval ? this.velocityX * this.fpsInterval : 200;
            // update the velocity to move the same number of pixels for new fps
            this.velocityX = pixelsPerSecond / (this.fpsInterval = newFps);
            // Hardcoded acceleration means that the increase is logarithmic.
            // i.e. doubles in the first 30 seconds and increases by 50% in next 30.
            this.accelerationTweening = (2500 * (200 / newFps))/(20 * newFps);
            // Adjust player jump height and gravity to maintain proportions.
            if (this.player) this.player.adjustForFps(this.ctx, newFps);
        }
    }
}

export default GameEngine
