var assert = require('assert');
var GameEngine = require("../app/engine.js"); 
var TestContext = require("./context.js");

describe('Engine', function() {
  describe('#constructor()', function() {
    it('should successfully initialise the game engine.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        assert.equal(engine.score, 0);
        assert.equal(engine.jumpCount, 0);
        assert.equal(engine.velocityX, 1);
        assert.equal(engine.accelerationTweening, 1);
        assert.equal(engine.player.x, 20);
        assert.equal(engine.player.y, 33);
        assert.equal(engine.player.width, 4);
        assert.equal(engine.player.height, 4);
        assert.equal(engine.player.jumpSize, -2);
        assert.equal(Math.floor(engine.platformManager.maxDistanceBetween), 36);
        assert.equal(Math.floor(engine.platformManager.minDistanceBetween), 5);
        assert.equal(engine.platformManager.platforms.length, 3);
        assert.equal(engine.platformManager.colliding, false);
        assert.equal(engine.particles.length, 0);
        assert.equal(engine.particlesIndex, 0);
        assert.equal(engine.particlesMax, 15);
        assert.equal(engine.collidedPlatform, null);
        assert.equal(engine.scoreColor, "#fff");
        assert.equal(engine.jumpCountRecord, 0);
        assert.equal(engine.maxSpikes, 0);
        assert.equal(engine.updated, false);
        assert.equal(GameEngine.instance, engine); // singleton
    });
  });
});
