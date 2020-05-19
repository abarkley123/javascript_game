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

var ctx = document.getElementById('runner_container').getContext("2d"), engine = new GameEngine(ctx), runnerAnimation, then, now;

function startRunner() {
    setSize();
    then = Date.now();
    run();
}

function run() {
    runnerAnimation = window.requestAnimationFrame(run);
    now = Date.now();
    let elapsed = Date.now() - then;
    if (elapsed > 25) {
        then = now - (elapsed % 25);
        engine.step();
        document.querySelector("#score").innerHTML = engine.score;
    }
}

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
    startRunner();
}

function restart_handler() {
    document.querySelector("#runner_after").style.display = "none";
    engine.restart();
}

function setSize() {
    const size = Math.min(document.querySelector("#Runner").offsetWidth, document.querySelector("#Runner").offsetHeight);
    let original_size = [ctx.canvas.width, ctx.canvas.height];
    console.log("Resizing canvas from " + original_size + " to " + [size, size]);
    ctx.canvas.width = size;
    ctx.canvas.height = size;
    if (engine) engine.resize_entities(ctx, original_size);
}