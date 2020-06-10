var assert = require('assert');
import {ParticleManager} from "../public/js/particle_manager.js";
var TestContext = require("./context.js");

describe('ParticleManager', function() {
    describe('constructor()', function() {
      it('should successfully initialise the particle manager.', function() {
        let options = {engineSpeed:5, particlesMax: 10, particleSize: 10};
        let particle_manager = new ParticleManager(options);
        assert.strictEqual(10, particle_manager.particles.length);
        assert.strictEqual(10, particle_manager.particleSize);
        assert.strictEqual(10, particle_manager.particlesMax);
        assert.strictEqual(5, particle_manager.engineSpeed);
        assert.strictEqual(0, particle_manager.particlesIndex);
      });
    });

    describe('increaseParticleCountTo()', function() {
        it('should create particles if required.', function() {
          let options = {engineSpeed:5, particlesMax: 0, particleSize: 10};
          let particle_manager = new ParticleManager(options);
          assert.strictEqual(0, particle_manager.particles.length);
          particle_manager.increaseParticleCountTo(10);
          assert.strictEqual(10, particle_manager.particles.length);
          assert.strictEqual(10, particle_manager.particleSize);
          assert.strictEqual(10, particle_manager.particlesMax);
          assert.strictEqual(5, particle_manager.engineSpeed);
          assert.strictEqual(0, particle_manager.particlesIndex);
        });
        it('should not create particles if required.', function() {
            let options = {engineSpeed:5, particlesMax: 10, particleSize: 10};
            let particle_manager = new ParticleManager(options);
            assert.strictEqual(10, particle_manager.particles.length);
            particle_manager.increaseParticleCountTo(10);
            assert.strictEqual(10, particle_manager.particles.length);
            assert.strictEqual(10, particle_manager.particleSize);
            assert.strictEqual(10, particle_manager.particlesMax);
            assert.strictEqual(5, particle_manager.engineSpeed);
            assert.strictEqual(0, particle_manager.particlesIndex);
        });
        it('should use default argument if none supplied.', function() {
            let options = {engineSpeed:5, particlesMax: 0, particleSize: 10};
            let particle_manager = new ParticleManager(options);
            assert.strictEqual(0, particle_manager.particles.length);
            particle_manager.increaseParticleCountTo();
            assert.strictEqual(0, particle_manager.particles.length);
            assert.strictEqual(10, particle_manager.particleSize);
            assert.strictEqual(0, particle_manager.particlesMax);
            assert.strictEqual(5, particle_manager.engineSpeed);
            assert.strictEqual(0, particle_manager.particlesIndex);
        });
    });
    describe('update()', function() {
        it('should update all particles.', function() {
            let options = {engineSpeed:5, particlesMax: 2, particleSize: 10};
            let particle_manager = new ParticleManager(options);
            particle_manager.particles[0].set(10, 10, "#fff", 5, 4);
            particle_manager.particles[1].set(20, 20, "#fff", 10, 20);
            particle_manager.update();
            assert.strictEqual(9, particle_manager.particles[0].width);
            assert.strictEqual(9, particle_manager.particles[0].height);
            assert.strictEqual(9, particle_manager.particles[1].width);
            assert.strictEqual(9, particle_manager.particles[1].height);
            assert.strictEqual(15, particle_manager.particles[0].x);
            assert.strictEqual(11, particle_manager.particles[0].y);
            assert.strictEqual(30, particle_manager.particles[1].x);
            assert.strictEqual(25, particle_manager.particles[1].y);
        });
    });
    describe('resize()', function() {
        it('should resize.', function() {
            let options = {engineSpeed:5, particlesMax: 0, particleSize: 10};
            let particle_manager = new ParticleManager(options);
            let ctx = new TestContext(200, 200);
            particle_manager.resize(ctx, 10);
            assert.strictEqual(10, particle_manager.engineSpeed);
            assert.strictEqual(3 + ctx.canvas.offsetWidth / 200, particle_manager.particleSize);
        });
    });
    describe('spawnParticles()', function() {
        it('should spawn all particles at an x,y.', function() {
            let options = {engineSpeed:5, particlesMax: 2, particleSize: 10};
            let particle_manager = new ParticleManager(options);
            particle_manager.particles[0].setSize(0, 0);
            particle_manager.particles[1].setSize(0, 0);
            particle_manager.spawnParticles(10, 10, 0, {color:"#000"});
            // check the particles were restored to full size
            assert.strictEqual(10, particle_manager.particles[0].width);
            assert.strictEqual(10, particle_manager.particles[0].height);
            assert.strictEqual(10, particle_manager.particles[1].width);
            assert.strictEqual(10, particle_manager.particles[1].height);
            assert.strictEqual(4, particle_manager.particles[0].x);
            assert.strictEqual(10, particle_manager.particles[0].y);
            assert.strictEqual(4, particle_manager.particles[1].x);
            assert.strictEqual(10, particle_manager.particles[1].y);
            assert.strictEqual(0, particle_manager.particlesIndex);
            assert.ok(particle_manager.particles[0].velocityX <= -particle_manager.particles[0].originalSize/2);
            assert.ok(particle_manager.particles[1].velocityX <= -particle_manager.particles[1].originalSize/2);
            assert.ok(particle_manager.particles[0].velocityY >= -30 && particle_manager.particles[0].velocityY <= 0);
            assert.ok(particle_manager.particles[1].velocityY >= -30 && particle_manager.particles[1].velocityY <= 0);
        });
        it('should spawn all particles at an x,y within y tolerance.', function() {
            let options = {engineSpeed:5, particlesMax: 2, particleSize: 10};
            let particle_manager = new ParticleManager(options);
            particle_manager.particles[0].setSize(0, 0);
            particle_manager.particles[1].setSize(0, 0);
            particle_manager.spawnParticles(10, 10, 5, {color:"#000"});
            // check the particles were restored to full size
            assert.strictEqual(10, particle_manager.particles[0].width);
            assert.strictEqual(10, particle_manager.particles[0].height);
            assert.strictEqual(10, particle_manager.particles[1].width);
            assert.strictEqual(10, particle_manager.particles[1].height);
            assert.strictEqual(4, particle_manager.particles[0].x);
            assert.ok(particle_manager.particles[0].y >= 10);
            assert.strictEqual(4, particle_manager.particles[1].x);
            assert.ok(particle_manager.particles[1].y >= 10);
            assert.strictEqual(0, particle_manager.particlesIndex);
            assert.ok(particle_manager.particles[0].velocityX <= -particle_manager.particles[0].originalSize/2);
            assert.ok(particle_manager.particles[1].velocityX <= -particle_manager.particles[1].originalSize/2);
            assert.ok(particle_manager.particles[0].velocityY >= -30 && particle_manager.particles[0].velocityY <= 0);
            assert.ok(particle_manager.particles[1].velocityY >= -30 && particle_manager.particles[1].velocityY <= 0);
        });
    });
});