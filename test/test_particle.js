var assert = require('assert');
import {Particle} from "../public/js/particle.js";
var TestContext = require("./context.js");

describe('Particle', function() {
    describe('constructor()', function() {
      it('should successfully initialise a particle.', function() {
        let p = new Particle({size:10});
        assert.strictEqual(10, p.width);
        assert.strictEqual(10, p.height);
        assert.strictEqual(0, p.x);
        assert.strictEqual(0, p.y);
        
      });
    });
    describe('update()', function() {
        it('should successfully update a particle.', function() {
          let p = new Particle({size:10});
          p.velocityX = 1;
          p.velocityY = 4;
          p.update();
          assert.strictEqual(9, p.width);
          assert.strictEqual(9, p.height);
          assert.strictEqual(1, p.x);
          assert.strictEqual(1, p.y);
        });
      });
    describe('draw()', function() {
        it('should successfully draw a particle.', function() {
          let p = new Particle({size:10});
          let ctx = new TestContext(100, 100);
          p.draw(ctx);
          assert.strictEqual(true, ctx.drawn);
        });
      });
    describe('set()', function() {
        it('should successfully set a particles position and velocities.', function() {
          let p = new Particle({size:10});
          p.size = 0;
          p.set(10, 10, "#fff", 5, 5);
          assert.strictEqual(10, p.width);
          assert.strictEqual(10, p.height);
          assert.strictEqual(10, p.x);
          assert.strictEqual(10, p.y);
          assert.strictEqual(5, p.velocityX);
          assert.strictEqual(5, p.velocityY);
          assert.strictEqual("#fff", p.color);
        });
        it('should successfully set a particles position with default velocities.', function() {
            let p = new Particle({size:10});
            p.size = 0;
            p.set(10, 10, "#fff");
            assert.strictEqual(10, p.width);
            assert.strictEqual(10, p.height);
            assert.strictEqual(10, p.x);
            assert.strictEqual(10, p.y);
            assert.ok(p.velocityX <= -p.originalSize/2 && p.velocityX >= -p.originalSize * 4);
            assert.ok(p.velocityY >= -30 && p.velocityY <= 0);
            assert.strictEqual("#fff", p.color);
          });
      });
});