var Platform = require("./platform.js"); 
var util = require("./util.js");

export class PlatformManager {

    constructor(ctx, dist_between) {
        this.maxDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25)  + dist_between * 0.8;
        this.minDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25) + 1; //force a jump
        this.colors = ["#4169E1", "#27B810"];

        this.platforms = []
        let numPlatforms = 3 + Math.floor(ctx.canvas.offsetWidth / 1000);
        for (let idx = 0; idx < numPlatforms; idx++) {
            let last = this.platforms[this.platforms.length - 1];
            this.platforms[this.platforms.length] = new Platform({
                x: this.platforms.length > 0 ? last.x + last.width + util.random(this.minDistanceBetween, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 8,
                y: ctx.canvas.height / 1.25,
                width: util.random(ctx.canvas.width / 2, ctx.canvas.width / 1.25),
                height: util.random(ctx.canvas.height/3, ctx.canvas.height / 5),
                color: util.randomChoice(this.colors)
            });
        }

        this.colliding = false;
    }

    update(canvas, velocity, maxSpikes) {
        for (let platform in this.platforms) {

            this.platforms[platform].x -= velocity;
            if (this.platforms[platform].x + this.platforms[platform].width < 0) {
                let endPlatform = this.platforms[platform > 0 ? platform - 1 : this.platforms.length - 1];

                this.platforms[platform].width = util.random(450, canvas.width + 200);
                this.platforms[platform].x = (endPlatform.x + endPlatform.width) +  util.random(this.minDistanceBetween, this.maxDistanceBetween);
                this.platforms[platform].y = util.random(endPlatform.y - 32, canvas.height - 80);
                this.platforms[platform].height = this.platforms[0].y + canvas.height + 10;

                // create new spikes if at that stage.
                if (engine.maxSpikes >= 1) {
                    this.platforms[platform].createSpikes(canvas, util.random(0, maxSpikes));
                }
            }

            // update the spikes if at that stage.
            if (engine.maxSpikes >= 1) {
                for (let spike of this.platforms[platform].spikes) spike.update(velocity);
            }
        }
    }

    updateOnDeath(canvas, dist_between) {
        let counter = -1;
        this.maxDistanceBetween = Math.min(32, canvas.offsetWidth / 25)  + dist_between/2;
        this.minDistanceBetween = Math.min(32, canvas.offsetWidth / 25);
        for (let platform of this.platforms) {
            platform.spikes = [];
            platform.x = ++counter > 0 ? this.platforms[counter - 1].x + this.platforms[counter - 1].width + util.random(this.maxDistanceBetween * 0.5, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 8;
            platform.y = canvas.height / 1.25;
            platform.width = util.random(canvas.width / 2, canvas.width / 1.25),
            platform.height = util.random(canvas.height/3, canvas.height / 5),
            platform.spikes = [] // delete
        }

        this.colliding = false;
    }
}