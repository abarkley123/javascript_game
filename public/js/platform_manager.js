import {Platform} from "./platform.js";
import {random, randomChoice} from "./util.js";

export class PlatformManager {

    constructor(ctx, dist_between) {
        this.maxDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25)  + dist_between * 0.8;
        this.minDistanceBetween = 0; // don't force a jump
        this.colors = ["#4169E1", "#27B810"];

        this.platforms = []
        let numPlatforms = 3 + Math.floor(ctx.canvas.offsetWidth / 1000);
        for (let idx = 0; idx < numPlatforms; idx++) {
            let last = this.platforms[this.platforms.length - 1];
            this.platforms[this.platforms.length] = new Platform({
                x: this.platforms.length > 0 ? last.x + last.width + random(this.minDistanceBetween, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 5,
                y: random(ctx.canvas.offsetHeight / 2, ctx.canvas.offsetHeight/ 1.1),
                width: random(ctx.canvas.width, ctx.canvas.width * 4),
                height: random(ctx.canvas.offsetHeight/5, ctx.canvas.offsetHeight/2),
                color: randomChoice(this.colors)
            });
        }

        this.colliding = false;
    }

    update(canvas, velocity, maxSpikes) {
        for (let platform in this.platforms) {

            this.platforms[platform].x -= velocity;
            if (this.platforms[platform].x + this.platforms[platform].width < 0) {
                let endPlatform = this.platforms[platform > 0 ? platform - 1 : this.platforms.length - 1];

                this.platforms[platform].width = random(canvas.width, canvas.width * 4);
                this.platforms[platform].x = (endPlatform.x + endPlatform.width) + random(this.minDistanceBetween, this.maxDistanceBetween);
                this.platforms[platform].y =  random(canvas.offsetHeight / 2, canvas.offsetHeight/ 1.1);
                this.platforms[platform].height = canvas.offsetHeight - this.platforms[platform].y;

                // create new spikes if at that stage.
                if (maxSpikes >= 1) {
                    this.platforms[platform].createSpikes(canvas,random(0, maxSpikes));
                }
            }

            // update the spikes if at that stage.
            if (maxSpikes >= 1) {
                for (let spike of this.platforms[platform].spikes) spike.update(velocity);
            }
        }
    }

    updateOnDeath(canvas, dist_between) {
        let counter = -1;
        this.maxDistanceBetween = Math.min(32, canvas.offsetWidth / 25)  + dist_between * 0.8;
        this.minDistanceBetween = Math.min(32, canvas.offsetWidth / 25) + 1;
        for (let platform of this.platforms) {
            platform.spikes = [];
            platform.x = ++counter > 0 ? this.platforms[counter - 1].x + this.platforms[counter - 1].width + random(this.maxDistanceBetween * 0.5, this.maxDistanceBetween) : canvas.offsetWidth / 3;
            platform.y = canvas.offsetHeight / 1.25;
            platform.width = random(canvas.offsetWidth / 2, canvas.offsetWidth / 1.25),
            platform.height = random(canvas.offsetHeight/3, canvas.offsetHeight / 5),
            platform.spikes = [] // delete
        }

        this.colliding = false;
    }

    resize(ctx, original_sizes, dist_between) {
        let width_ratio = ctx.canvas.width / original_sizes[0];
        let height_ratio = ctx.canvas.height / original_sizes[1];

        for (let platform of this.platforms) {
            platform.width *= width_ratio;
            platform.x *= width_ratio;
            platform.height *= height_ratio;
            platform.y *= height_ratio;
        }

        this.maxDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25)  + dist_between * 0.8;
        this.minDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25) + 1; //force a jump
    }
}