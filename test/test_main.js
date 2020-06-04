require('jsdom-global')()
var assert = require('assert');
import app from "../server.mjs";
import GameEngine from "../public/js/engine.js"; 
import {Player} from "../public/js/player.js";
import {Platform} from "../public/js/platform.js";
import {AudioManager} from "../public/js/audio_manager.js";
import { throws } from "assert";

let server;
var TestContext = require("./context.js");

(() => {
    let runnerContainer = document.createElement('div');
    runnerContainer.setAttribute('id', 'runner_container');

    let runnerBefore = document.createElement('div');
    runnerBefore.setAttribute('id', 'runner_before');

    let startRunnerButton = document.createElement('div');
    startRunnerButton.setAttribute('id', 'start_runner_btn');

    let restartRunnerButton = document.createElement('div');
    restartRunnerButton.setAttribute('id', 'restart_runner_btn');

    document.body.appendChild(runnerContainer);
    document.body.appendChild(runnerBefore);
    document.body.appendChild(startRunnerButton);
    document.body.appendChild(restartRunnerButton);
})();

before(done => {
    server = app.listen(3001, done);
    Object.defineProperty(window, "matchMedia", {
        get: () => { 
          return { 
            matches: true
          }
        }
    });
});

import * as main from "../public/js/main.js";


describe('Main', function() {
    describe('animationFrame()', function() {
        it('should bind window animation frame to a frame.', function() {
            let clientWindow = new Window();
            Object.defineProperty(clientWindow, 'requestAnimationFrame', { get: clientWindow.requestAnimationFrame });
            main.requestAnimationFrame(clientWindow);
            assert.strictEqual(true, clientWindow.requestedFrame);
        });

        it('should cancel window animation frame.', function() {
            let clientWindow = new Window();
            Object.defineProperty(clientWindow, 'cancelAnimationFrame', { get: clientWindow.cancelAnimationFrame });
            main.cancelAnimationFrame(clientWindow);
            assert.strictEqual(true, clientWindow.cancelledFrame);
        });
    });
    describe('setup()', function() {
        it('should set visibility of DOM elements', function() {
            let runner_container = document.createElement('div');
            runner_container.setAttribute('id', 'runner_container');
      
            let runner_before = document.createElement('div');
            runner_before.setAttribute('id', 'runner_before');
      
            document.body.appendChild(runner_container);
            document.body.appendChild(runner_before);
            let ctx = new TestContext(100, 100);
            main.setup(ctx, new AudioManager());
            
            assert.strictEqual(document.querySelector("#runner_container").style.display, "none");
            assert.strictEqual(document.querySelector("#runner_before").style.display, "block");
            assert.strictEqual(ctx.canvas.width, window.innerWidth);
            assert.strictEqual(ctx.canvas.height, window.innerHeight);

            document.body.removeChild(runner_container);
            document.body.removeChild(runner_before);
        });
    });
});

class Window {
    
    constructor() {
        this.requestedFrame = false;
        this.cancelledFrame = false;
        this.innerHeight = 200;
        this.innerWidth = 200;
        this.matches = false;
    }

    requestAnimationFrame() {
        this.requestedFrame = true; 
    };

    cancelAnimationFrame() {
        this.cancelledFrame = true;
    }
}


after(done => {
    server.close(done);
    server.close();
  });