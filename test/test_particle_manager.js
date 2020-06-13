var assert = require('assert');
import {ParticleManager} from "../public/js/particle_manager.js";
var TestContext = require("./context.js");

describe('ParticleManager', function() {
    describe('constructor()', function() {
      it('should successfully initialise the particle manager.', function() {
        let options = {engineSpeed:5, particlesMax: 10, particleSize: 10};
        let particleManager = new ParticleManager(options);
        assert.strictEqual(10, particleManager.particles.length);
        assert.strictEqual(10, particleManager.particleSize);
        assert.strictEqual(10, particleManager.particlesMax);
        assert.strictEqual(5, particleManager.engineSpeed);
        assert.strictEqual(0, particleManager.particlesIndex);
      });
    });

    describe('increaseParticleCountTo()', function() {
        it('should create particles if required.', function() {
          let options = {engineSpeed:5, particlesMax: 0, particleSize: 10};
          let particleManager = new ParticleManager(options);
          assert.strictEqual(0, particleManager.particles.length);
          particleManager.increaseParticleCountTo(10);
          assert.strictEqual(10, particleManager.particles.length);
          assert.strictEqual(10, particleManager.particleSize);
          assert.strictEqual(10, particleManager.particlesMax);
          assert.strictEqual(5, particleManager.engineSpeed);
          assert.strictEqual(0, particleManager.particlesIndex);
        });
        it('should not create particles if required.', function() {
            let options = {engineSpeed:5, particlesMax: 10, particleSize: 10};
            let particleManager = new ParticleManager(options);
            assert.strictEqual(10, particleManager.particles.length);
            particleManager.increaseParticleCountTo(10);
            assert.strictEqual(10, particleManager.particles.length);
            assert.strictEqual(10, particleManager.particleSize);
            assert.strictEqual(10, particleManager.particlesMax);
            assert.strictEqual(5, particleManager.engineSpeed);
            assert.strictEqual(0, particleManager.particlesIndex);
        });
        it('should use default argument if none supplied.', function() {
            let options = {engineSpeed:5, particlesMax: 0, particleSize: 10};
            let particleManager = new ParticleManager(options);
            assert.strictEqual(0, particleManager.particles.length);
            particleManager.increaseParticleCountTo();
            assert.strictEqual(0, particleManager.particles.length);
            assert.strictEqual(10, particleManager.particleSize);
            assert.strictEqual(0, particleManager.particlesMax);
            assert.strictEqual(5, particleManager.engineSpeed);
            assert.strictEqual(0, particleManager.particlesIndex);
        });
    });
    describe('update()', function() {
        it('should update all particles.', function() {
            let options = {engineSpeed:5, particlesMax: 2, particleSize: 10};
            let particleManager = new ParticleManager(options);
            particleManager.particles[0].set(10, 10, "#fff", 5, 4);
            particleManager.particles[1].set(20, 20, "#fff", 10, 20);
            particleManager.update();
            assert.strictEqual(9, particleManager.particles[0].width);
            assert.strictEqual(9, particleManager.particles[0].height);
            assert.strictEqual(9, particleManager.particles[1].width);
            assert.strictEqual(9, particleManager.particles[1].height);
            assert.strictEqual(15, particleManager.particles[0].x);
            assert.strictEqual(11, particleManager.particles[0].y);
            assert.strictEqual(30, particleManager.particles[1].x);
            assert.strictEqual(25, particleManager.particles[1].y);
        });
    });
    describe('resize()', function() {
        it('should resize.', function() {
            let options = {engineSpeed:5, particlesMax: 0, particleSize: 10};
            let particleManager = new ParticleManager(options);
            let ctx = new TestContext(200, 200);
            particleManager.resize(ctx, 10);
            assert.strictEqual(10, particleManager.engineSpeed);
            assert.strictEqual(3 + ctx.canvas.offsetWidth / 200, particleManager.particleSize);
        });
    });
    describe('spawnParticles()', function() {
        it('should spawn all particles at an x,y.', function() {
            let options = {engineSpeed:5, particlesMax: 2, particleSize: 10};
            let particleManager = new ParticleManager(options);
            particleManager.particles[0].setSize(0, 0);
            particleManager.particles[1].setSize(0, 0);
            particleManager.spawnParticles(10, 10, 0, {color:"#000"});
            // check the particles were restored to full size
            assert.strictEqual(10, particleManager.particles[0].width);
            assert.strictEqual(10, particleManager.particles[0].height);
            assert.strictEqual(10, particleManager.particles[1].width);
            assert.strictEqual(10, particleManager.particles[1].height);
            assert.strictEqual(4, particleManager.particles[0].x);
            assert.strictEqual(10, particleManager.particles[0].y);
            assert.strictEqual(4, particleManager.particles[1].x);
            assert.strictEqual(10, particleManager.particles[1].y);
            assert.strictEqual(0, particleManager.particlesIndex);
            assert.ok(particleManager.particles[0].velocityX <= -particleManager.particles[0].originalSize/2);
            assert.ok(particleManager.particles[1].velocityX <= -particleManager.particles[1].originalSize/2);
            assert.ok(particleManager.particles[0].velocityY >= -30 && particleManager.particles[0].velocityY <= 0);
            assert.ok(particleManager.particles[1].velocityY >= -30 && particleManager.particles[1].velocityY <= 0);
        });
        it('should spawn all particles at an x,y within y tolerance.', function() {
            let options = {engineSpeed:5, particlesMax: 2, particleSize: 10};
            let particleManager = new ParticleManager(options);
            particleManager.particles[0].setSize(0, 0);
            particleManager.particles[1].setSize(0, 0);
            particleManager.spawnParticles(10, 10, 5, {color:"#000"});
            // check the particles were restored to full size
            assert.strictEqual(10, particleManager.particles[0].width);
            assert.strictEqual(10, particleManager.particles[0].height);
            assert.strictEqual(10, particleManager.particles[1].width);
            assert.strictEqual(10, particleManager.particles[1].height);
            assert.strictEqual(4, particleManager.particles[0].x);
            assert.ok(particleManager.particles[0].y >= 10);
            assert.strictEqual(4, particleManager.particles[1].x);
            assert.ok(particleManager.particles[1].y >= 10);
            assert.strictEqual(0, particleManager.particlesIndex);
            assert.ok(particleManager.particles[0].velocityX <= -particleManager.particles[0].originalSize/2);
            assert.ok(particleManager.particles[1].velocityX <= -particleManager.particles[1].originalSize/2);
            assert.ok(particleManager.particles[0].velocityY >= -30 && particleManager.particles[0].velocityY <= 0);
            assert.ok(particleManager.particles[1].velocityY >= -30 && particleManager.particles[1].velocityY <= 0);
        });
    });
});