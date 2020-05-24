import GameEngine from "./engine.js";

// rendering tools for cross browser support
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(f) {
        return setTimeout(f, 1000 / 60)
    } // simulate calling code 60 

window.cancelAnimationFrame = window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    function(requestID) {
        clearTimeout(requestID)
    } //fall back

var ctx, engine, runnerAnimation, then, now, fpsInterval;

(() => {
    // expose the canvas for a short time so that the game engine can resolve the offsetWidth.
    document.querySelector("#runner_container").style.display = "block";
    document.querySelector("#runner_before").style.display = "none";

    ctx = document.getElementById('runner_container').getContext("2d");
    setSize(); // pre-set the size of the canvas.
    engine = new GameEngine(ctx, 1000/fpsInterval); // create the game engine object, using the resized canvas.
    // hide the canvas to present the title screen.
    document.querySelector("#runner_container").style.display = "none";
    document.querySelector("#runner_before").style.display = "block";
})();

// add event handlers
window.onload = function() {
    document.querySelector("#start_runner_btn").addEventListener("click", start_handler);
    document.querySelector("#restart_runner_btn").addEventListener("click", restart_handler);
    // process a jump
    document.querySelector("#runner_container").addEventListener("click", () => engine.do_jump()); // click
    document.onkeypress = function(event) {  // spacebar
        if (event.which == "32") engine.do_jump();
    };

    // resize the window
    if (window.attachEvent) {
        window.attachEvent('onresize', setSize);
    } else if (window.addEventListener) {
        window.addEventListener('resize', setSize);
    } else {
        window.onresize = setSize();
    }
}

function start_handler() {
    document.querySelector("#runner_container").style.display = "block";
    document.querySelector("#runner_before").style.display = "none";
    toggleFullScreen();
    setSize(); //make sure canvas is sized properly.
    then = Date.now();
    run(); //start the animation loop.
}

function setSize() {
    let original_size = [ctx.canvas.width, ctx.canvas.height];
    ctx.canvas.width = window.innerWidth;
    fpsInterval = 30 - (ctx.canvas.width / 250); 

    const last_element = document.querySelectorAll("#Runner h3")[1];
    ctx.canvas.height = window.innerHeight - (last_element.offsetHeight + last_element.getBoundingClientRect().bottom);
    if (engine) {
        // Increase the fps for higher pixel counts to prevent ghosting.
        // Higher pixel counts also necessitate faster CPUs and GPUs, so a higher framerate is more tolerable.
        engine.adjust_for_fps(1000/fpsInterval);
        // Resize each of the entities to maintain the same scale
        engine.resize_entities(ctx, original_size);
    }
}

function run() {
    runnerAnimation = window.requestAnimationFrame(run);
    now = Date.now();
    let elapsed = Date.now() - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        engine.step();
        document.querySelector("#score").innerHTML = engine.score;
    }
}

function restart_handler() {
    document.querySelector("#runner_after").style.display = "none";
    engine.restart();
}

// fullscreen
function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
  
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  
    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    }
    else {
      cancelFullScreen.call(doc);
    }
}