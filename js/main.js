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


var canvas, ctx, engine, fpsInterval, now, then, elapsed;

function startRunner() {
    canvas = document.getElementById('runner_container');
    ctx = canvas.getContext("2d");
    setSize();
    engine = new GameEngine();
    fpsInterval = 25; // 40 fps
    then = Date.now();
    run();
}

function run() {
    runnerAnimation = window.requestAnimationFrame(run);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        engine.step();
    }
}

// add event handlers
window.onload = function() {
    document.querySelector("#start_runner_btn").addEventListener("click", start_handler);
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
    hasStarted = true;
    engineRunning = true;
}

// make sure the player can jump, then adjust velocity.
function do_jump() {
    try {
        let vel = engine.player.velocityY;
        if (engine.player.jumpsLeft > 0) {
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