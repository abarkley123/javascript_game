require('jsdom-global')()
var assert = require('assert');
import app from "../server.mjs";
import GameEngine from "../public/js/engine.js"; 
import {TestAudioManager} from "./stub_audio_manager.js";

let server;
var TestContext = require("./context.js");
let runnerContainer, runnerBefore, runnerAfter, idleBackground, playingBackground, startRunnerButton, restartRunnerButton, runnerMultiplier;

before(done => {
    server = app.listen(3001, done);
    runnerContainer = document.createElement('div');
    runnerContainer.setAttribute('id', 'runner_container');
    
    runnerBefore = document.createElement('div');
    runnerBefore.setAttribute('id', 'runner_before');

    runnerAfter = document.createElement('div');
    runnerAfter.setAttribute('id', 'runner_after');
    
    idleBackground = document.createElement('div');
    idleBackground.setAttribute('id', 'idle_background');

    playingBackground = document.createElement('div');
    playingBackground.setAttribute('id', 'playing_background');

    startRunnerButton = document.createElement('div');
    startRunnerButton.setAttribute('id', 'start_runner_btn');

    restartRunnerButton = document.createElement('div');
    restartRunnerButton.setAttribute('id', 'restart_runner_btn');

    document.body.appendChild(runnerContainer);
    document.body.appendChild(runnerBefore);
    document.body.appendChild(runnerAfter);
    document.body.appendChild(idleBackground);
    document.body.appendChild(playingBackground);
    document.body.appendChild(startRunnerButton);
    document.body.appendChild(restartRunnerButton);
});

import * as main from "../public/js/main.js";
import { triggerAsyncId } from "async_hooks";


describe('Main', function() {
    describe('setup()', function() {
        it('should set visibility of DOM elements', function() {
            let ctx = new TestContext(100, 100);
            window.matchMedia = window.matchMedia || function() {
                return {
                    matches : false,
                    addListener : function() {},
                    removeListener: function() {}
                };
            };
            window.attachEvent = window.attachEvent || function(event, fn) {
                return true;
            };
            main.setup(new TestAudioManager(), ctx);
            
            assert.strictEqual(document.querySelector("#runner_container").style.display, "none");
            assert.strictEqual(document.querySelector("#runner_before").style.display, "block");
            assert.strictEqual(ctx.canvas.width, window.innerWidth);
            assert.strictEqual(ctx.canvas.height, window.innerHeight);
        });
        it('should attempt to set fullscreen', function() {
            let ctx = new TestContext(100, 100);
            window.matchMedia = function() {
                return {
                    matches : true,
                    addListener : function() {},
                    removeListener: function() {}
                };
            };
            window.attachEvent = undefined;
            main.setup(new TestAudioManager(), ctx);
            
            assert.strictEqual(document.querySelector("#runner_container").style.display, "none");
            assert.strictEqual(document.querySelector("#runner_before").style.display, "block");
            assert.strictEqual(ctx.canvas.width, window.innerWidth);
            assert.strictEqual(ctx.canvas.height, window.innerHeight);
        });
    });
    describe('restartHandler()', function() {
        it('should restart engine', function() {
            let fps = 40;
            let engine = new GameEngine(new TestContext(100, 100), fps, new TestAudioManager());
            engine.score = 1;
            engine.jumpCount = 1;
            engine.velocityX = 1;
            engine.player.x = 1;
            engine.player.y = 1;
            engine.player.onPlatform = true;
            engine.player.width = 100;
            engine.player.height = 100;

            window.matchMedia = window.matchMedia || function() {
                return {
                    matches : true,
                    addListener : function() {},
                    removeListener: function() {}
                };
            };
            
            main.setup(engine.audioManager, engine.ctx);
            main.restartHandler(engine);

            assert.strictEqual(engine.score, 0);
            assert.strictEqual(engine.jumpCount, 0);
            assert.strictEqual(engine.velocityX, 5);
            assert.strictEqual(engine.accelerationTweening, (2500 * (200 / fps))/(20 * fps));
            assert.strictEqual(engine.player.x, 20);
            assert.strictEqual(Math.floor(engine.player.y), 33);
            assert.strictEqual(engine.player.width, 4);
            assert.strictEqual(engine.player.height, 4);
            assert.strictEqual(engine.player.jumpVelocity, - Math.min(32, engine.ctx.canvas.offsetWidth / 25));
            assert.strictEqual(engine.player.onPlatform, false);
            
            assert.strictEqual(document.querySelector("#runner_after").style.display, "none");
            assert.strictEqual(document.querySelector("#idle_background").style.display, "none");
            assert.strictEqual(document.querySelector("#playing_background").style.display, "block");
        });
    });
    describe('startHandler()', function() {
        it('should start game', function() {
            let fps = 40;
            let engine = new GameEngine(new TestContext(100, 100), fps, new TestAudioManager());

            window.requestAnimationFrame = window.requestAnimationFrame || function () {return true;}

            main.setup(engine.audioManager, engine.ctx);
            main.startHandler();

            assert.strictEqual(engine.score, 0);
            assert.strictEqual(engine.jumpCount, 0);
            assert.strictEqual(engine.velocityX, 5);
            assert.strictEqual(engine.accelerationTweening, (2500 * (200 / fps))/(20 * fps));
            assert.strictEqual(engine.player.x, 20);
            assert.strictEqual(Math.floor(engine.player.y), 33);
            assert.strictEqual(engine.player.width, 4);
            assert.strictEqual(engine.player.height, 4);
            assert.strictEqual(engine.player.jumpVelocity, - Math.min(32, engine.ctx.canvas.offsetWidth / 25));
            assert.strictEqual(engine.player.onPlatform, false);
            
            assert.strictEqual(document.querySelector("#idle_background").style.display, 'none');
            assert.strictEqual(document.querySelector("#playing_background").style.display, 'block');
            assert.strictEqual(document.querySelector("#runner_container").style.display, "block");
            assert.strictEqual( document.querySelector("#runner_before").style.display, "none");
        });
    });
    describe('setupEventListeners()', function() {
        it('should set up event listeners', function() {
            let div = document.createElement('div');
            div.setAttribute('id', 'runner_multiplier');
            document.body.appendChild(div);
            main.setup(new TestAudioManager(), new TestContext(100, 100));
            main.setupEventListeners();
            
            document.querySelector("#runner_container").click();
            // check that event listener was successfully attached
            assert.strictEqual(document.querySelector("#runner_multiplier").innerHTML, "1.01");
            document.body.removeChild(div);
        });
    });
    describe('removeImage()', function() {
        it('should remove element from array', function() {
            var images = ["public/images/forefront_background_ambient.svg", "public/images/forefront_background.svg"];
            let img = new Image();
            img.src = images[0];
            main.removeImage(images, 0);
            assert.strictEqual(1, images.length);
            main.removeImage(images, 1);
            assert.strictEqual(1, images.length);
        });
    });
    describe('loop()', function() {
        it('should perform engine step', function() {
            let div  = document.createElement('div');
            div.setAttribute('id', 'score');
            let base  = document.createElement('div');
            let back  = document.createElement('div');
            base.classList.add("parallax__layer--base");
            back.classList.add("parallax__layer--back");
            document.body.appendChild(div);
            document.body.appendChild(base);
            document.body.appendChild(back);
            let ctx = new TestContext(100, 100);
            window.matchMedia = function() {
                return {
                    matches : true,
                    addListener : function() {},
                    removeListener: function() {}
                };
            };
            
            main.setup(new TestAudioManager(), ctx);
            main.loop();
            assert.ok(document.querySelector(".parallax__layer--base").style.transform.length > 0);
            assert.ok(document.querySelector(".parallax__layer--back").style.transform.length > 0);

            document.body.removeChild(div);
            document.body.removeChild(base);
            document.body.removeChild(back);
        });
    });
    describe('keyboardEvent()', function() {
        it('should accept keyboard input without error', function() {
            let div = document.createElement('div');
            div.setAttribute('id', 'runner_multiplier');
            div.innerHTML = "1.00";
            document.body.appendChild(div);

            main.keyboardEvent({which:"32"});
            main.keyboardEvent({which:"64"});
            main.keyboardEvent({which:32});
            main.keyboardEvent({which:undefined});
            // "32" triggers a jump
            assert.strictEqual(document.querySelector("#runner_multiplier").innerHTML, "1.01");
            document.body.removeChild(div);
        });
    });
});
after(done => {
    server.close(done);
    document.body.removeChild(runnerContainer);
    document.body.removeChild(runnerBefore);
    document.body.removeChild(runnerAfter);
    document.body.removeChild(idleBackground);
    document.body.removeChild(playingBackground);
    document.body.removeChild(startRunnerButton);
    document.body.removeChild(restartRunnerButton);
  });