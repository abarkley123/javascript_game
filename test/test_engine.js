require('jsdom-global')()
var assert = require('assert');
import app from "../server.mjs";
import GameEngine from "../public/js/engine.js"; 
import {Player} from "../public/js/player.js";
import {Platform} from "../public/js/platform.js";
import {AudioManager} from "../public/js/audio_manager.js";

let server;
var TestContext = require("./context.js");

before(done => {
  server = app.listen(3000, done);
});

describe('Engine', function() {
  describe('constructor()', function() {
    afterEach(() => reset_instances());
    it('should successfully initialise the game engine.', function() {
        let fps = 40;
        let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
        assert.strictEqual(engine.score, 0);
        assert.strictEqual(engine.jumpCount, 0);
        assert.strictEqual(engine.velocityX, 5);
        assert.strictEqual(engine.accelerationTweening, (2500 * (200 / fps))/(20 * fps));
        assert.strictEqual(engine.player.x, 20);
        assert.strictEqual(engine.player.y, 33);
        assert.strictEqual(engine.player.width, 4);
        assert.strictEqual(engine.player.height, 4);
        assert.strictEqual(engine.player.jumpVelocity, - Math.min(32, engine.ctx.canvas.offsetWidth / 25));
        assert.strictEqual(engine.player.onPlatform, false);
        let jumpSizes = engine.player.getProjectileProperties(engine.velocityX, engine.player.jumpVelocity);
        assert.strictEqual(Math.floor(engine.platformManager.maxDistanceX), Math.min(32, engine.ctx.canvas.width / 25) + jumpSizes[0] * 0.8);
        assert.strictEqual(Math.floor(engine.platformManager.minDistanceX), 0);
        assert.strictEqual(Math.floor(engine.platformManager.maxDistanceY), Math.floor(jumpSizes[1] * 0.8));
        assert.strictEqual(engine.platformManager.platforms.length, 3);
        assert.strictEqual(engine.particleManager.particles.length, 10);
        assert.strictEqual(engine.particleManager.particlesIndex, 0);
        assert.strictEqual(engine.particleManager.particlesMax, 10);
        assert.strictEqual(engine.jumpCountRecord, 0);
        assert.strictEqual(engine.difficultyLevel, 1);
    });
  });

  describe('restart()', function() {
    after(() => reset_instances());
    it('should successfully restart the game engine.', function() {
        let fps = 40;
        let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
        engine.score = 1;
        engine.jumpCount = 1;
        engine.velocityX = 1;
        engine.player.x = 1;
        engine.player.y = 1;
        engine.restart();
        assert.strictEqual(engine.score, 0);
        assert.strictEqual(engine.jumpCount, 0);
        assert.strictEqual(engine.velocityX, 5);
        assert.strictEqual(engine.accelerationTweening, (2500 * (200 / fps))/(20 * fps));
        assert.strictEqual(engine.player.x, 20);
        assert.strictEqual(engine.player.y, 33);
        assert.strictEqual(engine.player.width, 4);
        assert.strictEqual(engine.player.height, 4);
        assert.strictEqual(engine.player.jumpVelocity, - Math.min(32, engine.ctx.canvas.offsetWidth / 25));
        assert.strictEqual(engine.player.onPlatform, false);
        let jumpSizes = engine.player.getProjectileProperties(engine.velocityX, engine.player.jumpVelocity);
        assert.strictEqual(Math.floor(engine.platformManager.maxDistanceX), Math.min(32, engine.ctx.canvas.width / 25) + jumpSizes[0] * 0.8);
        assert.strictEqual(Math.floor(engine.platformManager.minDistanceX), 0);
        assert.strictEqual(Math.floor(engine.platformManager.maxDistanceY), Math.floor(jumpSizes[1] * 0.8));
        assert.strictEqual(engine.platformManager.platforms.length, 3);
        assert.strictEqual(engine.particleManager.particles.length, 10);
        assert.strictEqual(engine.particleManager.particlesIndex, 0);
        assert.strictEqual(engine.particleManager.particlesMax, 10);
        assert.strictEqual(engine.jumpCountRecord, 0);
        assert.strictEqual(engine.difficultyLevel, 1);
    });
  });

  describe('update()', function() {
    afterEach(() => reset_instances());
    it('should successfully update player, platforms and particles.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
        engine.jumpCount = 1;
        engine.velocityX = 1;
        engine.player.velocityY = 1;
        // create one platform for testing
        engine.platformManager.platforms[0] = new Platform({
          x: 50,
          y: 50,
          width: 10,
          height: 10,
          color: "#fff",
          ctx: engine.ctx
        });
        // create a particle so it can be updated.
        engine.particleManager.particles[0].set(10, 10, "#fff", -1, -4);
        engine.update();
        // check the acceleration wasn't updated.
        assert.strictEqual(engine.difficultyLevel, 1);
        // check the player moved
        assert.strictEqual(engine.player.x, 20); //x doesn't change, the platforms move instead
        assert.strictEqual(Math.floor(engine.player.y), 34);
        // check the particle moved
        assert.strictEqual(engine.particleManager.particles[0].x, 9);
        assert.strictEqual(engine.particleManager.particles[0].y, 9); // update uses velocityY/4
        assert.strictEqual(Math.floor(engine.particleManager.particles[0].width), Math.floor(0.9 * (3 + (engine.ctx.canvas.offsetWidth / 200))));
        // check the platforms moved
        assert.strictEqual(engine.platformManager.platforms[0].x, 49);
        assert.strictEqual(engine.platformManager.platforms[0].y, 50);
        assert.strictEqual(engine.platformManager.platforms[0].width, 10);
        assert.strictEqual(engine.platformManager.platforms[0].height, 10);
    });

    it('should create new platform and spikes when out of bounds.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
      engine.difficultyLevel = 100; // make sure a spike is created (random between 0-MAX).
      // create one platform for testing
      engine.platformManager.platforms = [];
      engine.platformManager.platforms.push(new Platform({
        x: -11, //out of bounds
        y: 100,
        width: 10,
        height: 10,
        color: "#fff",
        ctx: engine.ctx
      }));
      
      engine.update();
      
      // check the platforms moved
      assert.notStrictEqual(engine.platformManager.platforms[0].x, -11);
      assert.notStrictEqual(engine.platformManager.platforms[0].y, 100);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].color, "#9E111C");
      assert.ok(engine.platformManager.platforms[0].spikes[0].x >= 48);
      assert.ok(engine.platformManager.platforms[0].spikes[0].x <= engine.platformManager.platforms[0].x + engine.platformManager.platforms[0].width - 48);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].y, engine.platformManager.platforms[0].y - 48);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].width, 48);
      assert.strictEqual(engine.platformManager.platforms[0].spikes[0].height, 48);

      let original_spike_x = engine.platformManager.platforms[0].spikes[0].x;
      // check that the spike moves
      engine.update();
      assert.strictEqual(Math.floor(engine.platformManager.platforms[0].spikes[0].x), Math.floor(original_spike_x - engine.velocityX));
  });

    it('should increase difficulty based on jump count.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
        engine.jumpCount = 20;
        engine.difficultyLevel = 2;
        engine.update();
        // check that acceleration was updated when jump count % 10 === 0
        assert.strictEqual(engine.difficultyLevel, 3);
        assert.ok(engine.accelerationTweening > (2500 * (200 / fps))/(20 * fps));
        assert.ok(engine.platformManager.minDistanceX > 0);
        assert.strictEqual(engine.particleManager.particlesMax, 15);
    });

    it('should increase velocity using acceleration tweening.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
      // increments by tween/2500 per frame.
        engine.accelerationTweening = 2500;

        engine.update();
        // check that acceleration tweening was used to update velocityX
        assert.ok(engine.velocityX, 6);
    });

    it('should not update when game stopped.', function() {
        let fps = 40;
        let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
        engine.velocityX = 0;
        engine.player.velocityY = 1;
        // create one platform for testing
        engine.platformManager.platforms = [];
        engine.platformManager.platforms[0] = new Platform({
          x: 100,
          y: 100,
          width: 10,
          height: 10,
          color: "#fff",
          ctx: engine.ctx
        });
        // create a particle so it can be updated.
        engine.particleManager.particles[0].set(10, 10, "#fff", -1, -4);
        engine.update();
        // check the player still moves
        assert.strictEqual(engine.player.x, 20); 
        assert.strictEqual(Math.floor(engine.player.y), 34);
        // check the particle still moves
        assert.strictEqual(engine.particleManager.particles[0].x, 9);
        assert.strictEqual(engine.particleManager.particles[0].y, 9); 
        assert.strictEqual(Math.floor(engine.particleManager.particles[0].width), Math.floor(0.9 * (3 + (engine.ctx.canvas.offsetWidth / 200))));
        // check the platforms didn't move
        assert.strictEqual(engine.platformManager.platforms[0].x, 100);
        assert.strictEqual(engine.platformManager.platforms[0].y, 100);
        assert.strictEqual(engine.platformManager.platforms[0].width, 10);
        assert.strictEqual(engine.platformManager.platforms[0].height, 10);
    });

    it('should end game when player goes out of bounds.', function() {
        let fps = 40;
        let engine = new GameEngine(new TestContext(100, 99), fps, new AudioManager());
        engine.player.y = 100;
        // create mock divs
        let div = document.createElement('div');
        div.setAttribute('id', 'runner_after');
        div.style.display = "none";

        let idle_background = document.createElement('div');
        idle_background.setAttribute('id', 'idle_background');
        idle_background.style.display = "none";

        let playing_background = document.createElement('div');
        playing_background.setAttribute('id', 'playing_background');
        playing_background.style.display = "block";

        document.body.appendChild(div);
        document.body.appendChild(idle_background);
        document.body.appendChild(playing_background);

        engine.update();
        // check the player moved
        assert.strictEqual(engine.velocityX, 0); 
        assert.strictEqual(engine.player.velocityY, engine.player.jumpVelocity/2); 
        assert.strictEqual(engine.accelerationTweening, 0);
        assert.strictEqual(document.querySelector("#runner_after").style.display, "block");
        assert.strictEqual(document.querySelector("#idle_background").style.display, "block");
        assert.strictEqual(document.querySelector("#playing_background").style.display, "none");
        document.body.removeChild(div);
        document.body.removeChild(idle_background);
        document.body.removeChild(playing_background);
    });
  });

  describe('resize()', function() {
    afterEach(() => reset_instances());
    it('should resize entities when canvas size changes.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.ctx.canvas.setSize(200, 200);
      engine.resizeEntities(engine.ctx, [100, 100]);
      assert.strictEqual(engine.player.x, 40);
      assert.strictEqual(Math.floor(engine.player.y), 66);
      assert.strictEqual(engine.player.width, 4); //size doesn't change
      assert.strictEqual(engine.player.height, 4);
      assert.strictEqual(engine.player.jumpVelocity, - Math.min(32, 100 / 25));
      assert.strictEqual(engine.player.onPlatform, false);
      let jumpSizes = engine.player.getProjectileProperties(engine.velocityX, engine.player.jumpVelocity);
      assert.strictEqual(Math.floor(engine.platformManager.maxDistanceX), 8 + jumpSizes[0] * 0.8);
      assert.strictEqual(Math.floor(engine.platformManager.minDistanceX), 0);
      assert.strictEqual(Math.floor(engine.platformManager.maxDistanceY), Math.floor(jumpSizes[1] * 0.8));
    });

    it('should not resize entities when canvas size doesnt change.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.resizeEntities(engine.ctx, [100, 100]);
      assert.strictEqual(engine.player.x, 20);
      assert.strictEqual(Math.floor(engine.player.y), 33);
      assert.strictEqual(engine.player.width, 4);
      assert.strictEqual(engine.player.height, 4);
      assert.strictEqual(engine.player.jumpVelocity, - Math.min(32, engine.ctx.canvas.offsetWidth / 25));
      assert.strictEqual(engine.player.onPlatform, false);
      let jumpSizes = engine.player.getProjectileProperties(engine.velocityX, engine.player.jumpVelocity);
      assert.strictEqual(Math.floor(engine.platformManager.maxDistanceX), Math.min(32, 100 / 25) + jumpSizes[0] * 0.8);
      assert.strictEqual(Math.floor(engine.platformManager.minDistanceX), 0);
      assert.strictEqual(Math.floor(engine.platformManager.maxDistanceY), Math.floor(jumpSizes[1] * 0.8));
    });
  });

  describe('step()', function() {
    afterEach(() => reset_instances());
    it('should call update and draw when game playing.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.jumpCount = 1;
      engine.velocityX = 1;
      engine.player.velocityY = 1;
      // create one platform for testing
      engine.platformManager.platforms[0] = new Platform({
        x: 50,
        y: 50,
        width: 10,
        height: 10,
        color: "#fff",
        ctx: engine.ctx
      });
      // create a particle so it can be updated.
      engine.particleManager.particles[0].set(10, 10, "#fff", -1, -4);
      engine.step();
      // check the acceleration wasn't updated.
      assert.strictEqual(engine.difficultyLevel, 1);
      // check the player moved
      assert.strictEqual(engine.player.x, 20); //x doesn't change, the platforms move instead
      assert.strictEqual(Math.floor(engine.player.y), 34);
      // check the particle moved
      assert.strictEqual(engine.particleManager.particles[0].x, 9);
      assert.strictEqual(engine.particleManager.particles[0].y, 9); // update uses velocityY/4
      assert.strictEqual(Math.floor(engine.particleManager.particles[0].width), Math.floor(0.9 * (3 + (engine.ctx.canvas.offsetWidth / 200))));
      // check the platforms moved
      assert.strictEqual(engine.platformManager.platforms[0].x, 49);
      assert.strictEqual(engine.platformManager.platforms[0].y, 50);
      assert.strictEqual(engine.platformManager.platforms[0].width, 10);
      assert.strictEqual(engine.platformManager.platforms[0].height, 10);

    });

    it('should not call update and draw when not game playing.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.velocityX = 0;
      engine.step();
      assert.strictEqual(engine.score, 0);
      assert.strictEqual(engine.jumpCount, 0);
      assert.strictEqual(engine.velocityX, 0);
      assert.strictEqual(engine.accelerationTweening, (2500 * (200 / fps))/(20 * fps));
      assert.strictEqual(engine.player.x, 20);
      assert.strictEqual(Math.floor(engine.player.y), 33);
      assert.strictEqual(engine.player.width, 4);
      assert.strictEqual(engine.player.height, 4);
      assert.strictEqual(engine.player.jumpVelocity, - Math.min(32, engine.ctx.canvas.offsetWidth / 25));
      assert.strictEqual(engine.player.onPlatform, false);
      let jumpSizes = engine.player.getProjectileProperties(5, engine.player.jumpVelocity);
      assert.strictEqual(Math.floor(engine.platformManager.maxDistanceX), Math.min(32, engine.ctx.canvas.width / 25) + jumpSizes[0] * 0.8);
      assert.strictEqual(Math.floor(engine.platformManager.minDistanceX), 0);
      assert.strictEqual(Math.floor(engine.platformManager.maxDistanceY), Math.floor(jumpSizes[1] * 0.8));
      assert.strictEqual(engine.platformManager.platforms.length, 3);
      assert.strictEqual(engine.particleManager.particles.length, 10);
      assert.strictEqual(engine.particleManager.particlesIndex, 0);
      assert.strictEqual(engine.particleManager.particlesMax, 10);
      assert.strictEqual(engine.jumpCountRecord, 0);
      assert.strictEqual(engine.difficultyLevel, 1);

    });
  });

  describe('processJump()', function() {
    afterEach(() => reset_instances());
    it('should process jump when game playing and player can jump.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.player.jumpsLeft = 2;
      let div = document.createElement('div');
      div.setAttribute('id', 'runner_multiplier');
      div.innerHTML = "1.00";
      document.body.appendChild(div);
      engine.processJump();
      assert.strictEqual(engine.jumpCount, 1);
      assert.strictEqual(engine.player.velocityY, engine.player.jumpVelocity);
      assert.strictEqual(engine.jumpCountRecord, 1);
      assert.strictEqual(document.querySelector("#runner_multiplier").innerHTML, "1.01");
      document.body.removeChild(div);
    });
    it('should not process jump when game playing and player cant jump.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.velocityX = 0;
      engine.player.jumpsLeft = 2;
      let div = document.createElement('div');
      div.setAttribute('id', 'runner_multiplier');
      div.innerHTML = "1.00";
      document.body.appendChild(div);
      engine.processJump();
      assert.strictEqual(engine.player.jumpsLeft, 2);
      assert.strictEqual(engine.jumpCount, 0);
      assert.strictEqual(engine.player.velocityY, 0);
      assert.strictEqual(engine.jumpCountRecord, 0);
      assert.strictEqual(document.querySelector("#runner_multiplier").innerHTML, "1.00");
      document.body.removeChild(div);
    });
    it('should not process jump when not game playing and player can jump.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.player.jumpsLeft = 0;
      let div = document.createElement('div');
      div.setAttribute('id', 'runner_multiplier');
      div.innerHTML = "1.00";
      document.body.appendChild(div);
      engine.processJump();
      assert.strictEqual(engine.jumpCount, 0);
      assert.strictEqual(engine.player.jumpsLeft, 0);
      assert.strictEqual(engine.player.velocityY, 0);
      assert.strictEqual(engine.jumpCountRecord, 0);
      assert.strictEqual(document.querySelector("#runner_multiplier").innerHTML, "1.00");
      document.body.removeChild(div);
    });
  });

  describe('checkForCollisions()', function() {
    afterEach(() => reset_instances());
    it('should end game when player intersects left with platform.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.platformManager.platforms[0].x = engine.player.x;
      engine.platformManager.platforms[0].y = engine.player.y;
      let div = document.createElement('div');
      div.setAttribute('id', 'runner_after');
      div.style.display = "none";

      let idle_background = document.createElement('div');
      idle_background.setAttribute('id', 'idle_background');
      idle_background.style.display = "none";

      let playing_background = document.createElement('div');
      playing_background.setAttribute('id', 'playing_background');
      playing_background.style.display = "block";

      document.body.appendChild(div);
      document.body.appendChild(idle_background);
      document.body.appendChild(playing_background);
      engine.checkForCollisions();
      // check the player moved
      assert.strictEqual(engine.velocityX, 0); 
      assert.strictEqual(engine.player.velocityY, engine.player.jumpVelocity/2); 
      assert.strictEqual(engine.accelerationTweening, 0);
      assert.strictEqual(document.querySelector("#runner_after").style.display, "block");
      assert.strictEqual(document.querySelector("#idle_background").style.display, "block");
      assert.strictEqual(document.querySelector("#playing_background").style.display, "none");
      document.body.removeChild(div);
      document.body.removeChild(idle_background);
      document.body.removeChild(playing_background);
    });
    it('should update position when player intersects with top with platform.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.platformManager.platforms[0].x = engine.player.x - 2 * engine.velocityX;
      engine.platformManager.platforms[0].y = engine.player.y;
      engine.checkForCollisions();
      // check the player moved
      assert.strictEqual(engine.velocityX, 5); 
      assert.strictEqual(engine.player.velocityY, 0); 
      assert.strictEqual(engine.player.jumpsLeft, 2);
      assert.strictEqual(engine.player.onPlatform, true);
      assert.strictEqual(engine.player.y, engine.platformManager.platforms[0].y - engine.player.height);
    });
    it('should only allow one jump when player slides off platform.', function() {
      let fps = 40;
      let engine = new GameEngine(new TestContext(100, 100), fps, new AudioManager());
      engine.player.onPlatform = false;
      engine.player.jumpsLeft = 2;
      engine.checkForCollisions();
      // check the player moved
      assert.strictEqual(engine.player.jumpsLeft, 1);
    });
  });
});

function reset_instances() {
  Player.instance = null;
  GameEngine.instance = null; 
}

after(done => {
  server.close(done);
  server.close();
});