import {Player} from "./player.js";
import {PlatformManager} from "./platform_manager.js";
import {Particle} from "./particle.js";
import {random, randomChoice} from "./util.js";

class GameEngine {

    constructor(ctx, fpsInterval) {
        this.setup(ctx, fpsInterval);
    }

    setup(ctx, fpsInterval) {
        this.ctx = ctx;
        this.velocityX = 200/fpsInterval;
        this.adjustForFps(fpsInterval);

        this.score = 0;
        this.jumpCount = 0;
        this.player = new Player({
            x: ctx.canvas.offsetWidth / 5,
            y: ctx.canvas.offsetHeight / 3,
            width: Math.min(32, ctx.canvas.offsetWidth / 25),
            height: Math.min(32, ctx.canvas.offsetWidth / 25),
            jumpVelocity: - Math.min(32, ctx.canvas.offsetWidth / 25)
        });
        this.platformManager = new PlatformManager(ctx, this.player.getProjectileProperties(this.velocityX, Math.abs(this.player.jumpVelocity)));
        this.particles = [];
        this.particlesIndex = -1;
        this.particlesMax = 10;
        this.collidedPlatform = null;
        this.scoreColor = '#fff';
        this.jumpCountRecord = 0;
        this.maxSpikes = 0;
        this.updated = false;
    }

    step() {
        // don't waste cpu resources if the game isn't running.
        if (this.velocityX > 0 || this.player.velocityY < 117) {
            this.update();
            this.draw();
        }
    }

    update() {
        // always update the player & particles, so death animation can trigger.
        this.player.update();        
        this.particles.forEach(particle => particle.update());
        // game still playing.
        if (this.velocityX > 0) {
            if (this.player.outOfBounds(this.ctx.canvas)) this.handleCollision(this.player); 
            this.score += Math.floor((1000/40) * (1 + (this.jumpCount > 0 ? this.jumpCount / 100 : 0)));

            if (this.updated === false && this.jumpCount % 10 === 0 && this.jumpCount > 0 && this.jumpCount <= 60) {
                this.updated = true;
                this.accelerationTweening *= 1.05;
                this.platformManager.minDistanceBetween += this.platformManager.maxDistanceBetween/16;
                if (this.jumpCount % 20 === 0) this.maxSpikes++;
                this.particlesMax = Math.min(25, this.particlesMax + 5);
                // update platform spacing to accomodate for increased speed.
                this.platformManager.updatePlatformGaps(this.player.getProjectileProperties(this.velocityX, this.player.jumpVelocity));
            } else if (this.jumpCount % 10 !== 0) {
                this.updated = false;
            }

            // update all the platforms (and spikes)
            this.updatePlatforms();
            // accelerate, but only up to a point
            if (this.jumpCount < 40) this.velocityX += this.accelerationTweening / 2500;
        }
    }

    updatePlatforms() {
        let collider, intersectionCount = 0;
        this.platformManager.platforms.forEach(platform => {
            if ((collider = platform.spikes.find(spike => this.player.intersects(spike)))) {
                this.handleCollision(collider);
            } else if (this.player.intersects(platform)) {
                intersectionCount++;
                this.player.jumpsLeft = 2;
                this.collidedPlatform = platform;
                this.spawnParticles(this.player.x * 1.1, this.player.y + this.player.height * 0.975, 0, this.collidedPlatform);

                if (this.player.intersectsLeft(platform, this.velocityX)) {
                    this.handleCollision(platform);
                } else {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.onPlatform = true;                
                }
            } 
        });
        // not on a platform.
        if (intersectionCount === 0) {
            this.player.onPlatform = false;
            // if the player slides off a platform, don't allow two jumps.
            if (this.player.velocityY >= 0 && this.player.jumpsLeft === 2) this.player.jumpsLeft--;
        }

        // update each platform i.e. reposition if offscreen, apply x velocity.
        this.platformManager.update(this.ctx.canvas, this.velocityX, this.maxSpikes);
    }

    handleCollision(obj) {
        // stop the screen moving, trigger restart screen
        this.velocityX = 0;
        this.accelerationTweening = 0;
        // reset the player variables.
        this.player.x = obj.x - 48;
        this.player.onPlatform = false;
        this.player.velocityY = this.player.jumpVelocity/2;
        this.spawnParticles(this.player.x, this.player.y, this.player.height, obj);
        // make the restart screen visible.
        document.querySelector("#runner_after").style.display = "block";
        document.querySelector("#idle_background").style.display = 'block';
        document.querySelector("#playing_background").style.display = 'none';
    }

    draw() {
        // prevent ghosting
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.player.draw(this.ctx);
        this.particles.forEach((particle) => particle.draw(this.ctx));
        this.platformManager.platforms.forEach((platform) => platform.draw(this.ctx));
    }

    restart() {
        this.setup(this.ctx, this.fpsInterval);
    }

    spawnParticles(positionX, positionY, tolerance, collider) {
        let particleSize = 3 + this.ctx.canvas.offsetWidth / 200;
        for (let i = 0; i < 5; i++) {
            positionY = tolerance === 0 ? positionY : random(positionY, positionY + tolerance);
            this.particlesIndex = this.particlesIndex === this.particlesMax ? 0 : this.particlesIndex + 1;
            const velocityX = -(random(particleSize/2, particleSize * 2) + random(this.velocityX, 4 * this.velocityX)/5);
            // create new particle object if it hasn't been created before
            if (this.particles.length <= this.particlesMax) 
                this.particles[this.particlesIndex] = new Particle({size: particleSize});
            // then set x, y and velocity (this will also reuse a particle if it exists).
            this.particles[this.particlesIndex].set(positionX - 6, positionY, randomChoice([collider.color, "#ff4655"]), velocityX)
        }
    }

    resizeEntities(ctx, originalSizes) {
        this.ctx = ctx;
        // check to see if the canvas was actually resized.
        if (ctx.width !== originalSizes[0] || ctx.height != originalSizes[1]) {
            console.log("Resizing canvas from " + originalSizes + " to " + [ctx.canvas.width, ctx.canvas.height]);
            // prevent NPE
            this.particlesIndex = -1;
            // resize player and platforms (incl spikes).
            this.player.resize(ctx, originalSizes);
            this.platformManager.resize(ctx, originalSizes);
            // now update the gaps (vertically and horizontally) between platforms.
            this.platformManager.updatePlatformGaps(this.player.getProjectileProperties(this.velocityX, this.player.jumpVelocity));
        } else {
            console.log("Canvas size unchanged. Not resizing..");
        }
    }

    processJump() {
        // if the game is running and the player is elligible to jump, process it.
        if (this.velocityX > 0 && this.player.canJump()) {
            this.player.doJump();
            // now update the score
            if (++this.jumpCount > this.jumpCountRecord) {
                this.jumpCountRecord = this.jumpCount;
                document.querySelector("#runner_multiplier").innerHTML = ((this.jumpCountRecord + 100) / 100).toFixed(2);
            }
        }
    }

    // Adjust the velocities based on the fps
    adjustForFps(newFps) {
        if (this.velocityX && this.velocityX > 0) {
            // get the current velocity, expressed as pixels per second.
            const pixelsPerSecond = this.fpsInterval ? this.velocityX * this.fpsInterval : 200;
            this.fpsInterval = newFps;
            // update the velocity to move the same number of pixels for new fps
            this.velocityX = pixelsPerSecond /  this.fpsInterval;
            // Hardcoded acceleration means that the increase is logarithmic.
            // i.e. doubles in the first 30 seconds and increases by 50% in next 30.
            this.accelerationTweening = (2500 * (200 / newFps))/(20 * newFps);
            // Adjust player jump height and gravity to maintain proportions.
            if (this.player) this.player.adjustForFps(this.ctx, newFps);
        }
    }
}

export default GameEngine
