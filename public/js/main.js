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

var engine, ctx, runnerAnimation, then, now;

function startRunner() {
    ctx = document.getElementById('runner_container').getContext("2d");
    engine = new GameEngine(ctx);
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
    document.querySelector("#runner_container").addEventListener("click", do_jump); // click
    document.onkeypress = function(event) {  // spacebar
        if (event.which == "32") do_jump();
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

// make sure the player can jump, then adjust velocity.
function do_jump() {
    try {
        if (engine.velocityX > 0 && engine.player.jumpsLeft > 0) {
            engine.player.velocityY = engine.player.jumpSize;
            // now update the score
            engine.jumpCount++;
            if (engine.jumpCount > engine.jumpCountRecord) {
                engine.jumpCountRecord = engine.jumpCount;
                let multiplerText = Math.floor((engine.jumpCountRecord + 100) / 100) + '.';
                document.querySelector("#runner_multiplier").innerHTML = (engine.jumpCountRecord < 10 ? multiplerText + "0" :  multiplerText) + engine.jumpCountRecord;
            }

            engine.player.jumpsLeft--;
        }
    } catch (UninitialisedException) {
        console.log(UninitialisedException);
    }
}

function setSize() {
    const size = Math.min(document.querySelector("#Runner").offsetWidth, document.querySelector("#Runner").offsetHeight);
    ctx.canvas.width = size;
    ctx.canvas.height = size;
}