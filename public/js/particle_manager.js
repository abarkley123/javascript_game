import {Particle} from "./particle.js";
import {random, randomChoice} from "./util.js";

export class ParticleManager {

    constructor(options) {
        this.particles = [];
        this.particlesIndex = 0;
        this.particlesMax = options.particlesMax;
        this.particleSize = options.particleSize;
        //preload all the particle objects, so they can be reused.
        this.increaseParticleCountTo(this.particlesMax);
    }

    increaseParticleCountTo(number = 0) {
        for (let i = this.particles.length; i < number; i++) {
            this.particles[i] = new Particle({size: this.particleSize});
        }

        this.particlesMax = Math.max(number, this.particlesMax);
    }

    update() {
        this.particles.forEach(particle => particle.update());
    }

    resize(ctx) {
        this.particleSize = 3 + ctx.canvas.offsetWidth / 200;
    }

    spawnParticles(positionX, positionY, tolerance, collider) {
        for (let i = 0; i < 5; i++) {
            positionY = tolerance === 0 ? positionY : random(positionY, positionY + tolerance);
            const velocityX = -(random(this.particleSize/2, this.particleSize * 2) + random(this.velocityX, 4 * this.velocityX)/5);
            // set x, y and velocity (reusing a particle object).
            this.particles[this.particlesIndex].set(positionX - 6, positionY, randomChoice([collider.color, "#ff4655"]), velocityX)
            this.particlesIndex = this.particlesIndex === this.particlesMax - 1 ? 0 : this.particlesIndex + 1;
        }
    }
}