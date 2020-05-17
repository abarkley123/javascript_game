window.requestAnimationFrame = window.requestAnimationFrame
|| window.mozRequestAnimationFrame
|| window.webkitRequestAnimationFrame
|| window.msRequestAnimationFrame
|| function(f){return setTimeout(f, 1000/60)} // simulate calling code 60 

window.cancelAnimationFrame = window.cancelAnimationFrame
|| window.mozCancelAnimationFrame
|| function(requestID){clearTimeout(requestID)} //fall back

   var i = 0;

    function random(min, max) {
    return Math.round(min + (Math.random() * (max - min)));
    }

    function randomChoice(array){
    return array[Math.round(random(0, array.length - 1))];
    }

var canvas, ctx, engine, fpsInterval, now, then, elapsed;

    function startRunner() {
        canvas = document.getElementById('runner_container');
        ctx = canvas.getContext("2d");
        setSize();
        engine = new GameEngine();
        fpsInterval = 25; // 25 fps
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

    class GameEngine {

        constructor() {
            if (!GameEngine.instance) {
                this.jumpCount = 0;
                this.acceleration = ctx.canvas.width / 400;
                this.accelerationTweening = ctx.canvas.width / 400;
                this.player = new Player({x: ctx.canvas.offsetWidth / 5, y : ctx.canvas.offsetHeight/4, width: ctx.canvas.offsetWidth / 25, height: ctx.canvas.offsetWidth / 25});
                this.platformManager = new PlatformManager();
                this.particles = [];
                this.particlesIndex = 0;
                this.particlesMax = 15;
                this.collidedPlatform = null;
                this.scoreColor = '#fff';
                this.jumpCountRecord = 0;
                this.maxSpikes = 0;
                GameEngine.instance = this;
            } else {
                this.restart();
            }
        }

        step() {
            this.update();
            this.draw();
        }
          
        update() {
            this.player.update();

            switch (this.jumpCount){
                case 10:
                    this.acceleration = ctx.canvas.width / 300;
                    this.accelerationTweening = ctx.canvas.width / 350;
                    this.platformManager.maxDistanceBetween = ctx.canvas.width / 2.6;
                    this.scoreColor = '#076C00';
                    this.maxSpikes = 1;
                break;
                case 25:
                    this.acceleration = ctx.canvas.width / 250;
                    this.accelerationTweening = ctx.canvas.width / 300;
                    this.platformManager.maxDistanceBetween = ctx.canvas.width / 2.4;
                    this.scoreColor = '#0300A9';
                    this.maxSpikes = 2;
                break;
                case 40:
                    this.acceleration = ctx.canvas.width / 150;
                    this.accelerationTweening = ctx.canvas.width / 200;
                    this.platformManager.maxDistanceBetween = ctx.canvas.width / 2;
                    this.scoreColor = '#9F8F00';
                    this.maxSpikes = 3;
                break;
            }

            this.acceleration += (this.accelerationTweening - this.acceleration) * 0.01;
            for (let platform of this.platformManager.platforms) {


                if (this.player.intersects(platform)) {
                    
                    this.collidedPlatform = platform;
                    this.player.jumpsLeft = 2;
                    this.spawn_particles(this.player.x * 1.1, this.player.y + this.player.height * 0.975, 0, this.collidedPlatform);

                    if (this.player.intersectsLeft(platform)) {
                        this.player.x = this.collidedPlatform.x - 64;
                        this.spawn_particles(this.player.x, this.player.y, this.player.height, this.collidedPlatform);
                        this.player.velocityY = -10 + -(this.acceleration * 4);
                        this.player.velocityX = -20 + -(this.acceleration * 4);
                    } else {
                        this.player.x = this.player.previousX;
                        this.player.y = platform.y - this.player.height;
                        this.player.velocityY = 0;
                    }

                } 
                
            }

            for (i = 0; i < this.platformManager.platforms.length; i++) {
                this.platformManager.update();
            }

            for (let platform of this.platformManager.platforms) {
                for (let spike of platform.spikes) {
                    if (this.player.intersects(spike)) {
                        this.player.x = spike.x - 64;
                        this.spawn_particles(this.player.x, this.player.y, this.player.height, spike);
                        this.player.velocityY = -10 + -(this.acceleration * 4);
                        this.player.velocityX = -20 + -(this.acceleration * 4);
                    }
                }    
            }
            for (let particle of this.particles) {
                particle.update();
            }
        }

        draw() {
            this.player.draw();

            for (let platform of this.platformManager.platforms) {
                platform.draw();
                for (let spike of platform.spikes) {
                    spike.draw();
                }
            }
            
            for (let particle of this.particles) {
                particle.draw();
            }
        }

        restart() {
            this.jumpCount = 0;
            this.acceleration = 1 + ctx.canvas.width / 800;
            this.accelerationTweening = ctx.canvas.width / 800;
            this.player.restart();
            this.platformManager.updateOnDeath();
            this.particles = [];
            this.particlesIndex = 0;
            this.particlesMax = 15;
            this.collidedPlatform = null;
            this.scoreColor = '#fff';
            this.maxSpikes = 0;
        }

        spawn_particles(position_x, position_y, tolerance, collider) {
            for (i = 0; i < 10; i++) {
                this.particles[(this.particlesIndex++)%this.particlesMax] = new Particle({
                    x: position_x,
                    y: tolerance == 0 ? position_y : random(position_y, position_y + tolerance),
                    velocityY: random(-30,30),
                    color: collider.color
                });
            }    
        }
    }

    class Vector2 {
        
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.previousX = 0;
            this.previousY = 0;
        }

        setPosition(x, y) {
            this.previousX = this.x;
            this.previousY = this.y;
            this.x = x;
            this.y = y;
        }

        setX(x) {
            this.previousX = this.x;
            this.x = x;
        }

        setY(y) {
            this.previousY = this.y;
            this.y = y;
        }

        intersects(obj) {
            if (obj.x <= this.x + this.width && obj.y <= this.y + this.height &&
                obj.x + obj.width > this.x && obj.y + obj.height >= this.y ){
                return true;
            }

            return false;
        }

        intersectsLeft(obj) {
            // console.log(this);
            if (obj.x <= this.x + this.width && obj.y + this.height * 0.5 < this.y + this.height) {
                return true;
            }

            return false;
        }
    }

    class Player extends Vector2 {

        constructor(options) {
            super(options.x, options.y, options.width, options.height);
            if (!Player.instance) {
                this.setPosition(options.x, options.y);
                this.velocityX = 0;
                this.velocityY = 0;
                this.jumpSize = -(10 + window.innerWidth/200);
                this.color = "#fff";
                this.jumpsLeft = 2;
                Player.instance = this;
            }
        }
    
        update() {
            this.velocityY += 0.5 + ctx.canvas.width / 2000;
            this.setPosition(this.x + this.velocityX, this.y + this.velocityY);
            //beyond screen bounds 
            if (this.y > ctx.canvas.height * 1.2 || this.x + this.width < 0) {
                engine.restart();
            }
        }

        draw() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }

        restart() {
            this.x = ctx.canvas.offsetWidth/5;
            this.y = ctx.canvas.offsetHeight/4;
            this.velocityX = 0;
            this.velocityY = 0;        
        }
    }

    class Platform extends Vector2 {
       
        constructor(options) {
            super(options.x, options.y, options.width, options.height);
            this.previousX = 0;
            this.previousY = 0;
            this.color = options.color;
            this.spikes = [];
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        createSpikes(number) {
            this.spikes = [];
            try {
                if (engine.jumpCount > 1) {
                    for (let i = 0; i < number; i++) {
                        const spike = new Spike({x: this.x + random(this.width/10, this.width/1.25), y: this.y - (25 + ctx.canvas.width / 50), 
                            width: 25 + ctx.canvas.width / 50, height: 25 + ctx.canvas.width / 50});
                        this.spikes.push(spike);
                    }
                }
            } catch (UninitialisedException) {
                console.log("Not spawning spikes: " + UninitialisedException);
            }
        }
    }

    class Spike extends Vector2 {

        constructor(options) {
            super(options.x, options.y, options.width, options.height);
            this.previousX = 0;
            this.previousY = 0;
            this.color = "#880E4F";
        }

        draw() {
            if (engine.maxSpikes >= 1) {
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.width / 2, this.y + this.height);
                ctx.lineTo(this.x - this.width / 2, this.y + this.height);
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                ctx.fill();
            }
        }

        update() {
            this.x -= 3 + engine.acceleration;
        }
    }

    class PlatformManager {
        
        constructor() {
                this.maxDistanceBetween = 100 + ctx.canvas.width / 4;
                this.colors = ["#4169E1", "#27B810"];

                this.platforms = []
                let numPlatforms = 2 + Math.floor(ctx.canvas.offsetWidth / 1000);
                for (let idx = 0; idx < numPlatforms; idx++) {
                    let last = this.platforms[this.platforms.length - 1];
                    this.platforms[this.platforms.length] = new Platform({
                        x: this.platforms.length > 0 ? last.x + last.width + random(this.maxDistanceBetween/2.5, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 8,
                        y: ctx.canvas.height / 1.25, 
                        width: ctx.canvas.width / 1.25, 
                        height: ctx.canvas.height / 5,
                        color: randomChoice(this.colors) 
                    });
                }
            
                this.colliding = false;
        }

        update() {                      
            for (let platform in this.platforms) {
                this.platforms[platform].x -= 3 + engine.acceleration;

                if (this.platforms[platform].x + this.platforms[platform].width < 0) {
                    let endPlatform = this.platforms[platform > 0 ? platform - 1 : this.platforms.length - 1];
                    
                    this.platforms[platform].width = random(450, ctx.canvas.width + 200);
                    this.platforms[platform].x = (endPlatform.x + endPlatform.width) + random(this.maxDistanceBetween * 0.5, this.maxDistanceBetween);
                    this.platforms[platform].y = random(endPlatform.y - 32, ctx.canvas.height - 80);
                    this.platforms[platform].height = this.platforms[0].y + ctx.canvas.height + 10;

                    // create new spikes if at that stage.
                    if (engine.maxSpikes >= 1) {
                        this.platforms[platform].createSpikes(random(0, engine.maxSpikes));  
                    }     
                }
                
                // update the spikes if at that stage.
                if (engine.maxSpikes >= 1) {
                    for (let spike of  this.platforms[platform].spikes) spike.update();
                }
            }
        }

        updateOnDeath() {
            let counter = -1;

            for (let platform of this.platforms) {
                platform.spikes = [];
                platform.x = ++counter > 0 ? this.platforms[counter - 1].x + this.platforms[counter - 1].width + random(this.maxDistanceBetween * 0.5, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 8;
                platform.y = ctx.canvas.height / 1.25;
                platform.width = random(450, ctx.canvas.width + 200);
                platform.spikes = [] // delete
            }

            this.colliding = false;
        }    
    }

    function updateScore() {
        engine.jumpCount++;
        if (engine.jumpCount > engine.jumpCountRecord){
            engine.jumpCountRecord = engine.jumpCount;
            let multiplerText = Math.floor((engine.jumpCountRecord + 100) / 100) + '.';
            if (engine.jumpCountRecord < 10) {
                multiplerText += "0";
            }
            document.querySelector("#runner_multiplier").innerHTML = multiplerText + engine.jumpCountRecord;
        }
    }
    class Particle {
        
        constructor(options) {
            this.x = options.x;
            this.y = options.y;
            this.size = 10;
            this.velocityX = options.velocityX || 2 * random(-(engine.acceleration * 3) + -8,-(engine.acceleration * 3));
            this.velocityY = options.velocityY || random(-(engine.acceleration * 3) + -8,-(engine.acceleration * 3));
            this.color = options.color;
        }

        update() {
            this.x += this.velocityX;
            this.y += this.velocityY/4;
            this.size *= 0.89;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x * 0.9, this.y, this.size, this.size);
        }
    }

    document.onclick = () => {
        let vel = engine.player.velocityY;
        if (engine.player.jumpsLeft > 0) {
            processJump();
            if (vel == engine.player.velocityY) {
                engine.player.velocityY = engine.player.jumpSize;
            }
            engine.player.jumpsLeft--;
        }   
    };

    document.onkeypress = function(event) {
        if (event.which == "32") {
            try {
                let vel = engine.player.velocityY;
                if (engine.player.jumpsLeft > 0) {
                    processJump();
                    if (vel == engine.player.velocityY) {
                        engine.player.velocityY = engine.player.jumpSize;
                    }
                    engine.player.jumpsLeft--;
                }   
            } catch (UninitialisedException) {
                console.log("Game not yet initialised.");
            }
        }
    };

    function processJump() {
        if (engine.player.velocityY < -8) engine.player.velocityY += -0.25;
        engine.player.velocityY = engine.player.jumpSize;
        updateScore();
    }

    function start_handler() {
        document.querySelector("#runner_container").style.display = "block";
        document.querySelector("#runner_before").style.display = "none";
        startRunner();
        hasStarted = true;
        engineRunning = true;
      }
      
    window.onload = function() {
        document.querySelector("#start_runner_btn").addEventListener("click", this.start_handler);
    }

    window.onresize = function() {
        setSize();
    }

    function setSize() {
        ctx.canvas.width  = document.querySelector("#Runner").offsetWidth;
        ctx.canvas.height = ctx.canvas.width
    }