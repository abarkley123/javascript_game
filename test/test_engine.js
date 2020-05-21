require('jsdom-global')()
var assert = require('assert');
import GameEngine from "../public/js/engine.js"; 
import {Particle} from "../public/js/particle.js";
import {Player} from "../public/js/player.js";
import {Platform} from "../public/js/platform.js";
import { DEFAULT_MAX_VERSION } from "tls";

var TestContext = require("./context.js");

describe('Engine', function() {
  describe('constructor()', function() {
    afterEach(() => reset_instances());
    it('should successfully initialise the game engine.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        assert.strictEqual(engine.score, 0);
        assert.strictEqual(engine.jumpCount, 0);
        assert.strictEqual(engine.velocityX, 1);
        assert.strictEqual(engine.accelerationTweening, 1);
        assert.strictEqual(engine.player.x, 20);
        assert.strictEqual(engine.player.y, 33);
        assert.strictEqual(engine.player.width, 4);
        assert.strictEqual(engine.player.height, 4);
        assert.strictEqual(engine.player.jumpSize, -2);
        assert.strictEqual(engine.player.onPlatform, false);
        assert.strictEqual(Math.floor(engine.platformManager.maxDistanceBetween), 36);
        assert.strictEqual(Math.floor(engine.platformManager.minDistanceBetween), 5);
        assert.strictEqual(engine.platformManager.platforms.length, 3);
        assert.strictEqual(engine.platformManager.colliding, false);
        assert.strictEqual(engine.particles.length, 0);
        assert.strictEqual(engine.particlesIndex, -1);
        assert.strictEqual(engine.particlesMax, 40);
        assert.strictEqual(engine.collidedPlatform, null);
        assert.strictEqual(engine.scoreColor, "#fff");
        assert.strictEqual(engine.jumpCountRecord, 0);
        assert.strictEqual(engine.maxSpikes, 0);
        assert.strictEqual(engine.updated, false);
        assert.strictEqual(GameEngine.instance, engine); // singleton
    });
    it('should not duplicate instances of singleton object.', function() {
      let engine = new GameEngine(new TestContext(100, 99));
      try {
        let engine2 = new GameEngine(new TestContext(100, 99));
        assert.fail(); //should fail
      } catch (Exception) {
        assert.ok(GameEngine.instance, engine);
      }
    });
  });

  describe('restart()', function() {
    after(() => reset_instances());
    it('should successfully restart the game engine.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        engine.score = 10;
        engine.jumpCount = 10;
        engine.maxSpikes = 10;
        engine.velocityX = 10;
        engine.accelerationTweening = 10;
        engine.particles = [];
        engine.particlesIndex = 1;
        engine.particlesMax = 15;

        engine.restart();
        // assert everything is the same as initial state.
        assert.strictEqual(engine.score, 0);
        assert.strictEqual(engine.jumpCount, 0);
        assert.strictEqual(engine.velocityX, 1);
        assert.strictEqual(engine.accelerationTweening, 1);
        assert.strictEqual(engine.player.x, 20);
        assert.strictEqual(engine.player.y, 33);
        assert.strictEqual(engine.player.width, 4);
        assert.strictEqual(engine.player.height, 4);
        assert.strictEqual(engine.player.jumpSize, -2);
        assert.strictEqual(Math.floor(engine.platformManager.maxDistanceBetween), 36);
        assert.strictEqual(Math.floor(engine.platformManager.minDistanceBetween), 5);
        assert.strictEqual(engine.platformManager.platforms.length, 3);
        assert.strictEqual(engine.platformManager.colliding, false);
        assert.strictEqual(engine.particles.length, 0);
        assert.strictEqual(engine.particlesIndex, -1);
        assert.strictEqual(engine.particlesMax, 40);
        assert.strictEqual(engine.collidedPlatform, null);
        assert.strictEqual(engine.scoreColor, "#fff");
        assert.strictEqual(engine.jumpCountRecord, 0);
        assert.strictEqual(engine.maxSpikes, 0);
        assert.strictEqual(engine.updated, false);
        assert.strictEqual(GameEngine.instance, engine); // singleton
    });
  });

  describe('update()', function() {
    afterEach(() => reset_instances());
    it('should successfully update player, platforms and particles.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        engine.jumpCount = 1;
        engine.player.velocityY = 1;
        // create one platform for testing
        engine.platformManager.platforms = [];
        engine.platformManager.platforms.push(new Platform({
          x: 100,
          y: 100,
          width: 10,
          height: 10,
          color: "#fff"
        }));
        // create a particle so it can be updated.
        engine.particles.push(new Particle({
          x: 10,
          y: 10,
          color: "#fff",
          size: 10
        }));
        engine.particles[0].set(10, 10, "#fff", -1, -4);
        engine.update();
        // check the acceleration wasn't updated.
        assert.strictEqual(engine.updated, false);
        // check the player moved
        assert.strictEqual(engine.player.x, 20); //x doesn't change, the platforms move instead
        assert.strictEqual(Math.floor(engine.player.y), 34);
        // check the particle moved
        assert.strictEqual(engine.particles[0].x, 9);
        assert.strictEqual(engine.particles[0].y, 9); // update uses velocityY/4
        assert.strictEqual(Math.floor(engine.particles[0].size), 9);
        // check the platforms moved
        assert.strictEqual(engine.platformManager.platforms[0].x, 99);
        assert.strictEqual(engine.platformManager.platforms[0].y, 100);
        assert.strictEqual(engine.platformManager.platforms[0].width, 10);
        assert.strictEqual(engine.platformManager.platforms[0].height, 10);
    });

    it('should create new platform and spikes when out of bounds.', function() {
      let engine = new GameEngine(new TestContext(100, 99));
      engine.maxSpikes = 100; // make sure a spike is created (random between 0-MAX).
      // create one platform for testing
      engine.platformManager.platforms = [];
      engine.platformManager.platforms.push(new Platform({
        x: -11, //out of bounds
        y: 100,
        width: 10,
        height: 10,
        color: "#fff"
      }));
      
      engine.update();
      
      // check the platforms moved
      assert.notStrictEqual(engine.platformManager.platforms[0].x, -11);
      assert.notStrictEqual(engine.platformManager.platforms[0].y, 100);
      assert.notStrictEqual(engine.platformManager.platforms[0].width, 10);
      assert.notStrictEqual(engine.platformManager.platforms[0].height, 10);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].color, "#880E4F");
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].color, "#880E4F");
      assert.ok(engine.platformManager.platforms[0].spikes[0].x > 0);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].y, engine.platformManager.platforms[0].y - 27);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].width, 27);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].height, 27);

      let original_spike_x = engine.platformManager.platforms[0].spikes[0].x;
      // check that the spike moves
      engine.update();
      assert.strictEqual(Math.floor(engine.platformManager.platforms[0].spikes[0].x), Math.floor(original_spike_x - engine.velocityX));
  });

    it('should increase difficulty based on jump count.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        engine.jumpCount = 20;
        engine.update();
        // check that acceleration was updated when jump count % 10 === 0
        assert.strictEqual(engine.updated, true);
        assert.strictEqual(engine.accelerationTweening, 1.1);
        let max_dist = Math.floor(engine.player.calculate_jump_distance(engine.velocityX, Math.abs(engine.player.jumpSize)));
        assert.strictEqual(Math.floor(engine.platformManager.maxDistanceBetween), max_dist);
        assert.strictEqual(engine.platformManager.minDistanceBetween, 5 * 1.25);
        assert.strictEqual(engine.maxSpikes, 1);
    });

    it('should increase velocity using acceleration tweening.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        engine.accelerationTweening = 2500;

        engine.update();
        // check that acceleration tweening was used to update velocityX
        assert.strictEqual(engine.velocityX, 2);
    });

    it('should not update when game stopped.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        engine.velocityX = 0;
        engine.player.velocityY = 1;
        // create one platform for testing
        engine.platformManager.platforms = [];
        engine.platformManager.platforms.push(new Platform({
          x: 100,
          y: 100,
          width: 10,
          height: 10,
          color: "#fff"
        }));
        // create a particle so it can be updated.
        engine.particles.push(new Particle({
          x: 10,
          y: 10,
          color: "#fff",
          size: 10
        }));
        engine.particles[0].set(10, 10, "#fff", -1, -4);
        engine.update();
        // check the player still moves
        assert.strictEqual(engine.player.x, 20); 
        assert.strictEqual(Math.floor(engine.player.y), 34);
        // check the particle still moves
        assert.strictEqual(engine.particles[0].x, 9);
        assert.strictEqual(engine.particles[0].y, 9); 
        assert.strictEqual(Math.floor(engine.particles[0].size), 9);
        // check the platforms didn't move
        assert.strictEqual(engine.platformManager.platforms[0].x, 100);
        assert.strictEqual(engine.platformManager.platforms[0].y, 100);
        assert.strictEqual(engine.platformManager.platforms[0].width, 10);
        assert.strictEqual(engine.platformManager.platforms[0].height, 10);
    });

    it('should end game when player goes out of bounds.', function() {
        let engine = new GameEngine(new TestContext(100, 99));
        engine.player.y = 100;
        // create mock div
        var div = document.createElement('div');
        div.setAttribute('id', 'runner_after');
        div.style.display = "none";
        document.body.appendChild(div);
        engine.update();
        // check the player moved
        assert.strictEqual(engine.velocityX, 0); 
        assert.strictEqual(engine.player.velocityX, 0); 
        assert.strictEqual(engine.player.velocityY, engine.player.jumpSize/2); 
        assert.strictEqual(engine.accelerationTweening, 0);
        assert.strictEqual(document.querySelector("#runner_after").style.display, "block");
    });
  });
});

function reset_instances() {
  Player.instance = null;
  GameEngine.instance = null; 
}