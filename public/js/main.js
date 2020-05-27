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

var ctx, engine, runnerAnimation, then, now, fpsInterval, frameCount = 0, transform = 0;

(() => {
    // expose the canvas for a short time so that the game engine can resolve the offsetWidth.
    document.querySelector("#runner_container").style.display = "block";
    document.querySelector("#runner_before").style.display = "none";

    // ctx = document.getElementById('runner_container').getContext('2d', { alpha: false });
    ctx = document.getElementById('runner_container').getContext('2d');
    setSize(); // pre-set the size of the canvas.
    engine = new GameEngine(ctx, 1000/fpsInterval); // create the game engine object, using the resized canvas.
    // hide the canvas to present the title screen.
    document.querySelector("#runner_container").style.display = "none";
    document.querySelector("#runner_before").style.display = "block";

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
})();

// add event handlers
window.onload = function() {
    setupAudio();
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

    // if the user has a mobile device, allow fullscreen. Otherwise it will impact the user experience, so disable it.
    if (window.matchMedia("only screen and (max-width: 768px)").matches === true || window.matchMedia("only screen and (max-height: 768px)").matches === true) {
        //Conditional script here
        document.addEventListener('fullscreenchange', toggleFullScreen, false);
        document.addEventListener('mozfullscreenchange', toggleFullScreen, false);
        document.addEventListener('MSFullscreenChange', toggleFullScreen, false);
        document.addEventListener('webkitfullscreenchange', toggleFullScreen, false);
    }
}

function start_handler() {
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

function setSize() {
    let original_size = [ctx.canvas.width, ctx.canvas.height];
    ctx.canvas.width = window.innerWidth;
    fpsInterval = Math.floor(30 - (ctx.canvas.width / 250)); 

    ctx.canvas.height = window.innerHeight;
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
        // twice a second, translate the background to give the impression of motion.
        if (frameCount++ % Math.floor(50/fpsInterval) === 0) {
            // give the effect of parallax for background - back elements move more slowly than forward ones.
            document.querySelector(".parallax__layer--base").style.transform = "translateZ(0) translateX(-" + Math.floor(transform++) + "px)";
            document.querySelector(".parallax__layer--back").style.transform = "translateZ(0) translateX(-" + Math.floor(transform/3) + "px)";
        }
    }
}

function restart_handler() {
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
function toggleFullScreen(restart = false) {
    var doc = window.document;
    var docEl = doc.documentElement;
  
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (restart === true && !doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl)
    } else if (restart === false) {
      cancelFullScreen.call(doc);
    }
}

/** Define functions to play an audio file (located under public/audio/) 
 * Background music supplied by Eva – 失望した: https://youtu.be/jVTsD4UPT-k, 
 * License: Creative Commons Attribution 3.0 - http://bit.ly/RFP_CClicense. **/

// This function should load all audio files.
function setupAudio() {
    let bgm = new Audio('public/audio/background_music.mp3');
    bgm.volume = 0.4;
    bgm.addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
    
    playAudio(bgm);
    // pause the music when the user changes tabs.
    document.addEventListener("visibilitychange", () => {
            try {
              if (document.hidden){
                  bgm.pause();
              } else {
                  bgm.play();
              }
            } catch (NoSuchAudioException) {
              console.log("Unable to change state of audio.");
            }
    }, false);
  }
  
function playAudio(bgm) {
    const play = bgm.play();
  
    if (play) {
      play.then(() => {
        return;
      }).catch(function(AudioException) {
        console.log('Audio Failed to play due to cause: \n' + AudioException);
        handleAudioFailure(bgm);
      });
    }
  }
  
// retry
function handleAudioFailure(bgm) {
    setTimeout(() => {
        playAudio(bgm);
    }, 1500);  
}
  