var assert = require('assert');
import {PlatformManager} from "../public/js/platform_manager.js";
var TestContext = require("./context.js");

describe('PlatformManager', function() {
    describe('constructor()', function() {
      it('should successfully initialise the platform manager.', function() {
          let ctx = new TestContext(1000, 1000), jumpSizes = [10, 10];
          let platformManager = new PlatformManager(ctx, jumpSizes);
          assert.strictEqual(Math.min(32, ctx.canvas.width / 25) + jumpSizes[0] * 0.8, Math.floor(platformManager.maxDistanceX));
          assert.strictEqual(0, platformManager.minDistanceX);
          assert.strictEqual(Math.floor(jumpSizes[1] * 0.8), Math.floor(platformManager.maxDistanceY));
          assert.strictEqual(4, platformManager.platforms.length);
          // test the platforms were initialised
          for (let i = 0; i < platformManager.platforms.length; i++) {
              let p = platformManager.platforms[i], height = ctx.canvas.height, width = ctx.canvas.width;
              assert.ok(p.x >= platformManager.minDistanceX);
              assert.ok(p.y >= Math.floor((height/1.1 - platformManager.maxDistanceY)) && Math.floor(p.y <= (height/1.1)));
              assert.ok(p.width >= width / 2 && p.width <= width * 2);
              assert.ok(p.colorGradient !== null);
              assert.ok(p.color !== null);
              assert.strictEqual(0, p.spikes.length);
              assert.strictEqual(height - p.y, p.height);
          }
      });
    });
    describe('update()', function() {
        it('should update platform position.', function() {
            let ctx = new TestContext(1000, 1000), jumpSizes = [10, 10];
            let platformManager = new PlatformManager(ctx, jumpSizes);
            let p = platformManager.platforms[0];
            p.createSpikes(1);
            let originalX = p.x, originalY = p.y, spikeX = p.spikes[0].x, spikeY = p.spikes[0].y;
            platformManager.update(ctx.canvas, 10, 2);
            assert.strictEqual(originalX - 10, p.x);
            assert.strictEqual(originalY, p.y);
            assert.strictEqual(spikeX - 10, p.spikes[0].x);
            assert.strictEqual(spikeY, p.spikes[0].y);
        });
        it('should update platform position when offscreen.', function() {
            let ctx = new TestContext(1000, 1000), jumpSizes = [10, 10];
            let platformManager = new PlatformManager(ctx, jumpSizes);

            // test both to check that the platforms position regardless of position in array
            let p = [platformManager.platforms[0], platformManager.platforms[1]];
            p[0].x = -(p[0].width + 1); //offscreen

            let height = ctx.canvas.height, width = ctx.canvas.width, len = platformManager.platforms.length;
            let startX = platformManager.platforms[len - 1].x + platformManager.platforms[len - 1].width;

            // now update     
            platformManager.update(ctx.canvas, 10, 0);
                
            assert.ok(p[0].x >= startX + platformManager.minDistanceX && p[0].x <= startX + platformManager.maxDistanceX);
            assert.ok(p[0].y >= Math.floor(height/1.1 - platformManager.maxDistanceY) && p[0].y <= Math.floor((height/1.1)));
            assert.ok(p[0].width >= width / 2 && p[0].width <= width * 2);
            assert.strictEqual(height - p[0].y, p[0].height);
            // force this platform offscreen.
            p[1].x = -(p[1].width + 1); //offscreen
            // update again
            platformManager.update(ctx.canvas, 10, 0);
            startX = platformManager.platforms[0].x + platformManager.platforms[0].width;
            assert.ok(p[1].x >= startX + platformManager.minDistanceX && p[1].x <= startX + platformManager.maxDistanceX);
            assert.ok(p[1].y >= Math.floor(height/1.1 - platformManager.maxDistanceY) && p[1].y <= Math.floor((height/1.1)));
            assert.ok(p[1].width >= width / 2 && p[1].width <= width * 2);
            assert.strictEqual(height - p[1].y, p[1].height);
        });
      });
    describe('updatePlatformGaps()', function() {
        it('should update platform gaps', function() {
            let ctx = new TestContext(1000, 1000), jumpSizes = [10, 10];
            let platformManager = new PlatformManager(ctx, jumpSizes);
            ctx.canvas.setSize(2000, 2000);
            platformManager.updatePlatformGaps(ctx.canvas, [20, 20]);

            assert.strictEqual(Math.min(32, ctx.canvas.width / 25) + 20 * 0.8, Math.floor(platformManager.maxDistanceX));
            assert.strictEqual(0, platformManager.minDistanceX);
            assert.strictEqual(Math.floor(20 * 0.8), Math.floor(platformManager.maxDistanceY));
        });
    });
    describe('resize()', function() {
        it('should resize platforms', function() {
            let ctx = new TestContext(1000, 1000), jumpSizes = [10, 10];
            let platformManager = new PlatformManager(ctx, jumpSizes);
            // also test that spikes are updated
            platformManager.platforms[0].createSpikes(1);
            let originalValues = [], spikeX =  platformManager.platforms[0].spikes[0].x, spikeY = platformManager.platforms[0].spikes[0].y;
            for (let i = 0; i < platformManager.platforms.length; i++) {
                let p = platformManager.platforms[i];
                originalValues[i] = {};
                originalValues[i].x = p.x;
                originalValues[i].y = p.y;
                originalValues[i].width = p.width;
                originalValues[i].height = p.height;
            }

            ctx.canvas.setSize(2000, 2000);
            platformManager.resize(ctx, [1000, 1000]);

            assert.strictEqual(spikeX * 2, platformManager.platforms[0].spikes[0].x);
            assert.strictEqual(platformManager.platforms[0].y - 48, platformManager.platforms[0].spikes[0].y);

            for (let i = 0; i < platformManager.platforms.length; i++) {
                let p = platformManager.platforms[i];
                assert.strictEqual(originalValues[i].x * 2, p.x);
                assert.strictEqual(originalValues[i].y * 2, p.y);
                assert.strictEqual(originalValues[i].width * 2, p.width);
                assert.strictEqual(originalValues[i].height * 2, p.height);
            }
        });
    });
});