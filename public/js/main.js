import GameEngine from "./engine.js";
import {AudioManager} from "./audio_manager.js";
import log from "./logger.mjs";

// rendering tools for cross browser support. exposed for testing.
window.requestAnimationFrame = requestAnimationFrame();

export function requestAnimationFrame(clientWindow = window) {
    clientWindow.requestAnimationFrame ||
    clientWindow.mozRequestAnimationFrame ||
    clientWindow.webkitRequestAnimationFrame ||
    clientWindow.msRequestAnimationFrame ||
    function(f) {
        return setTimeout(f, 1000 / 60)
    } // simulate calling code 60 
}

window.cancelAnimationFrame = cancelAnimationFrame();

export function cancelAnimationFrame(clientWindow = window) {
    clientWindow.cancelAnimationFrame ||
    clientWindow.mozCancelAnimationFrame ||
    function(requestID) {
        clearTimeout(requestID)
    } //fall back
}
var ctx, engine, runnerAnimation, then, now, fpsInterval, frameCount = 0, transform = 0, audioManager = new AudioManager;

(() => setup(audioManager))();

export function setup(audioManager, context) {
    // expose the canvas for a short time so that the game engine can resolve the offsetWidth.
    let runnerContainer = document.querySelector("#runner_container");
    let runnerBefore = document.querySelector("#runner_before");
    // null checking for testing purposes (where DOM not defined).
    if (runnerContainer && runnerBefore) {
        document.querySelector("#runner_container").style.display = "block";
        document.querySelector("#runner_before").style.display = "none";
        ctx = context || document.querySelector('#runner_container').getContext('2d');
        setSize(ctx); // pre-set the size of the canvas.
        engine = new GameEngine(ctx, 1000/fpsInterval, audioManager); // create the game engine object, using the resized canvas.
        // hide the canvas to present the title screen.
        document.querySelector("#runner_container").style.display = "none";
        document.querySelector("#runner_before").style.display = "block";
    } else {
        log("Could not complete setup as DOM not loaded", "error");
    }

    (async () => {
            // preload images
        var images = ["public/images/forefront_background_ambient.svg", "public/images/forefront_background.svg"];
        for (var i = 0; i < images.length; i++) {
            var img = new Image();
            img.onload = function() {
                var index = images.indexOf(this);
                if (index !== -1) {
                    // remove image from the array once it's loaded due to memory consumption
                    images.splice(index, 1);
                }
            }
            img.src = images[i];
        }
    })();
    // start the background music.
    audioManager.playAudio("backgroundMain");
}

// add event handlers
window.onload = setupEventListeners();

export function setupEventListeners() {
    let runnerContainer = document.querySelector("#runner_container");
    let startRunnerButton = document.querySelector("#start_runner_btn");
    let restartRunnerButton = document.querySelector("#restart_runner_btn");
    // null checking for testing purposes (where DOM not defined).
    if (runnerContainer && startRunnerButton && restartRunnerButton) {
        document.querySelector("#start_runner_btn").addEventListener("click", startHandler);
        document.querySelector("#restart_runner_btn").addEventListener("click", restartHandler);
        // process a jump
        document.querySelector("#runner_container").addEventListener("click", () => engine.processJump()); // click

        // resize the window
        if (window.attachEvent) {
            window.attachEvent('onresize', setSize);
        } else if (window.addEventListener) {
            window.addEventListener('resize', setSize);
        } else {
            window.onresize = setSize();
        }

        // if the user has a mobile device, allow fullscreen. Otherwise it will impact the user experience, so disable it.
        if (window && window.matchMedia("only screen and (max-width: 768px)").matches === true || window.matchMedia("only screen and (max-height: 768px)").matches === true) {
            //Conditional script here
            document.addEventListener('fullscreenchange', toggleFullScreen, false);
            document.addEventListener('mozfullscreenchange', toggleFullScreen, false);
            document.addEventListener('MSFullscreenChange', toggleFullScreen, false);
            document.addEventListener('webkitfullscreenchange', toggleFullScreen, false);
        }
    } else {
        log("Could not complete setup as DOM not loaded", "error");
    }

    document.onkeypress = function(event) {  // spacebar
        if (event.which == "32") engine.processJump();
    };
}

export function startHandler() {
    // if the user has a mobile device, allow fullscreen. Otherwise it will impact the user experience, so disable it.
    if (window.matchMedia("only screen and (max-width: 768px)").matches === true || window.matchMedia("only screen and (max-height: 768px)").matches === true) { 
        toggleFullScreen(true);
    }

    document.querySelector("#idle_background").style.display = 'none';
    document.querySelector("#playing_background").style.display = 'block';
    document.querySelector("#runner_container").style.display = "block";
    document.querySelector("#runner_before").style.display = "none";
    setSize(); //make sure canvas is sized properly.
    then = Date.now();
    run(); //start the animation loop.
}

export function setSize(context = ctx) {
    let original_size = [context.canvas.width, context.canvas.height];
    context.canvas.width = window.innerWidth;
    fpsInterval = Math.floor(30 - (context.canvas.width / 250)); 

    context.canvas.height = window.innerHeight;
    if (engine) {
        // Increase the fps for higher pixel counts to prevent ghosting.
        // Higher pixel counts also necessitate faster CPUs and GPUs, so a higher framerate is more tolerable.
        engine.adjustForFps(1000/fpsInterval);
        // Resize each of the entities to maintain the same scale
        engine.resizeEntities(context, original_size);
    }
}

export function run() {
    runnerAnimation = window.requestAnimationFrame(run);
    now = Date.now();
    let elapsed = Date.now() - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        engine.step();
        document.querySelector("#score").innerHTML = engine.score;
        // twice a second, translate the background to give the impression of motion.
        if (engine.velocityX !== 0 && frameCount++ % Math.floor(50/fpsInterval) === 0) {
            // give the effect of parallax for background - back elements move more slowly than forward ones.
            document.querySelector(".parallax__layer--base").style.transform = "translateZ(0) translateX(-" + Math.floor(transform++) + "px)";
            document.querySelector(".parallax__layer--back").style.transform = "translateZ(0) translateX(-" + Math.floor(transform/3) + "px)";
        }
    }
}

export function restartHandler(engine = engine) {
    document.querySelector("#runner_after").style.display = "none";
    document.querySelector("#idle_background").style.display = 'none';
    document.querySelector("#playing_background").style.display = 'block';
    // if the user has a mobile device, allow fullscreen. Otherwise it will impact the user experience, so disable it.
    if (window.matchMedia("only screen and (max-width: 768px)").matches === true || window.matchMedia("only screen and (max-height: 768px)").matches === true) { 
        toggleFullScreen(true);
    }
    engine.restart();
    setSize();
}

// fullscreen
export function toggleFullScreen(restart = false) {
    const doc = window.document;
    const docEl = doc.documentElement;
  
    let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    let cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    let isNotFullscreen = !doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement;
    if (restart === true && requestFullScreen && isNotFullscreen === true) {
      requestFullScreen.call(docEl)
    } else if (restart === false && cancelFullScreen) {
      cancelFullScreen.call(doc);
    }
}