var assert = require('assert');
import {Player} from "../public/js/player.js";
var TestContext = require("./context.js");

describe('Player', function() {
    describe('constructor()', function() {
      it('should successfully initialise the player.', function() {
          let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
          assert.strictEqual(5, p.x);
          assert.strictEqual(10, p.y);
          assert.strictEqual(15, p.width);
          assert.strictEqual(20, p.height);
          assert.strictEqual(20, p.jumpVelocity);
          assert.strictEqual(-1, p.fallSpeed);
          assert.strictEqual(0, p.velocityY);
          assert.strictEqual("#ff4655", p.color);
          assert.strictEqual(1, p.jumpsLeft);
          assert.strictEqual(false, p.onPlatform);
      });
    });
    describe('update()', function() {
        it('should successfully update the player.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            // player won't move in first update, so process two
            p.update();
            p.update();
            assert.strictEqual(5, p.x);
            assert.strictEqual(9, p.y);
            assert.strictEqual(-2, p.velocityY);
        });
        it('should successfully update the player when on platform.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            p.onPlatform = true;
            p.update();
            assert.strictEqual(5, p.x);
            assert.strictEqual(10, p.y);
            assert.strictEqual(0, p.velocityY);
        });
    });
    describe('draw()', function() {
        it('should successfully draw the player.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            let ctx = new TestContext(100, 100);
            p.draw(ctx);
            assert.strictEqual(true, ctx.drawn);
        });
    });
    describe('resize()', function() {
        it('should successfully resize the player.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            p.velocityY = 5;
            let ctx = new TestContext(100, 100);
            p.resize(ctx, [50, 50]);
            assert.strictEqual(20, p.y);
            assert.strictEqual(20, p.x);
            assert.strictEqual(10, p.velocityY);
        });
        it('should successfully resize the player when on platform.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            p.velocityY = 5;
            p.onPlatform = true;
            let ctx = new TestContext(100, 100);
            p.resize(ctx, [50, 50]);
            assert.strictEqual(20, p.y);
            assert.strictEqual(20, p.x);
            assert.strictEqual(0, p.velocityY);
        });
    });
    describe('adjustForFps()', function() {
        it('should successfully adjust player velocities for fps.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            let ctx = new TestContext(100, 100);
            let fps = 40, jumpHeight = ctx.canvas.height/2;
            p.adjustForFps(ctx, fps);
            assert.strictEqual(-(5 + jumpHeight/ (fps/2)), p.jumpVelocity);
            assert.strictEqual(0.25 + p.jumpVelocity / - (fps/2), p.fallSpeed);
        });
    });
    describe('canJump()', function() {
        it('should determine if player can jump.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            assert.strictEqual(true, p.canJump());
            p.jumpsLeft = 0;
            assert.strictEqual(false, p.canJump());
        });
    });
    describe('doJump()', function() {
        it('should process second player jump.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            p.doJump();
            assert.strictEqual(0, p.jumpsLeft);
            assert.strictEqual(false, p.onPlatform);
            assert.strictEqual(p.jumpVelocity * 0.667, p.velocityY);
        });
        it('should process first player jump.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            p.jumpsLeft = 2;
            p.doJump();
            assert.strictEqual(1, p.jumpsLeft);
            assert.strictEqual(false, p.onPlatform);
            assert.strictEqual(p.jumpVelocity, p.velocityY);
        });
    });
    describe('getProjectileProperties()', function() {
        it('should calculate player jump properties.', function() {
            let p = new Player({x:5,y:10,width:15,height:20,jumpVelocity:20});
            p.velocityY = 10;
            let velocityX = 10;
            let tmpX = p.x, tmpY = p.y - 1, tmpVelY = p.velocityY, peakY = p.y;

            while (tmpY < p.y) {
                tmpX += velocityX;
                peakY = Math.min(peakY, tmpY += tmpVelY);
                tmpVelY += p.fallSpeed;
            }

            let jumpProperties = p.getProjectileProperties(velocityX, p.velocityY);
            assert.strictEqual(tmpX - p.x, jumpProperties[0]);
            assert.strictEqual(p.y - peakY, jumpProperties[1]);
        });
    });
});
