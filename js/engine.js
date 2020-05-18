class GameEngine {

    constructor() {
        if (!GameEngine.instance) {
            this.jumpCount = 0;
            this.velocityX = ctx.canvas.width / 100;
            this.accelerationTweening = ctx.canvas.width / 100;
            this.player = new Player({
                x: ctx.canvas.offsetWidth / 5,
                y: ctx.canvas.offsetHeight / 3,
                width: Math.min(32, ctx.canvas.offsetWidth / 25),
                height: Math.min(32, ctx.canvas.offsetWidth / 25),
                jumpSize: this.velocityX * -2
            });
            this.platformManager = new PlatformManager(this.player.calculate_jump_distance(this.velocityX, Math.abs(this.velocityX * -2)));
            this.particles = [];
            this.particlesIndex = 0;
            this.particlesMax = 15;
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
        this.player.update();
        if (this.updated === false && this.jumpCount % 10 === 0 && this.jumpCount > 0) {
            this.updated = true;
            this.velocityX *= 1.2;
            this.accelerationTweening *= 1.2;
            this.platformManager.minDistanceBetween *= 1.25;
            this.platformManager.maxDistanceBetween = this.player.calculate_jump_distance(this.velocityX, Math.abs(this.player.jumpSize));
            if (this.jumpCount % 20 === 0) this.maxSpikes++;
        } else if (this.jumpCount % 10 !== 0) {
            this.updated = false;
        }

        for (let platform of this.platformManager.platforms) {
            if (this.player.intersects(platform)) {

                this.collidedPlatform = platform;
                this.player.jumpsLeft = 2;
                this.spawn_particles(this.player.x * 1.1, this.player.y + this.player.height * 0.975, 0, this.collidedPlatform);

                if (this.player.intersectsLeft(platform)) {
                    this.player.x = this.collidedPlatform.x - 64;
                    this.spawn_particles(this.player.x, this.player.y, this.player.height, this.collidedPlatform);
                    this.player.velocityY = -10 + -(this.velocityX * 4);
                    this.player.velocityX = -20 + -(this.velocityX * 4);
                } else {
                    this.player.x = this.player.previousX;
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                }
            }

            for (let spike of platform.spikes) {
                if (this.player.intersects(spike)) {
                    this.player.x = spike.x - 64;
                    this.spawn_particles(this.player.x, this.player.y, this.player.height, spike);
                    this.player.velocityY = -10 + -(this.velocityX* 4);
                    this.player.velocityX = -20 + -(this.velocityX* 4);
                }
            }

        }

        this.platformManager.update();

        for (let particle of this.particles) {
            particle.update();
        }
    }

    draw() {
        this.player.draw();

        for (let platform of this.platformManager.platforms) {
            platform.draw();
            for (let spike of platform.spikes) {
                spike.draw();
            }
        }

        for (let particle of this.particles) {
            particle.draw();
        }
    }

    restart() {
        this.jumpCount = 0;
        this.velocityX = ctx.canvas.width / 100;
        this.accelerationTweening = ctx.canvas.width / 100;
        this.player.restart();
        this.platformManager.updateOnDeath();
        this.particles = [];
        this.particlesIndex = 0;
        this.particlesMax = 15;
        this.collidedPlatform = null;
        this.scoreColor = '#fff';
        this.maxSpikes = 0;
    }

    spawn_particles(position_x, position_y, tolerance, collider) {
        for (let i = 0; i < 10; i++) {
            this.particles[(this.particlesIndex++) % this.particlesMax] = new Particle({
                x: position_x,
                y: tolerance == 0 ? position_y : random(position_y, position_y + tolerance),
                velocityY: random(-30, 30),
                color: collider.color
            });
        }
    }
}
