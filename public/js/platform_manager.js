import {Platform} from "./platform.js";
import {random, randomChoice} from "./util.js";

export class PlatformManager {

    constructor(ctx, dist_between, jump_height) {
        this.maxDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25)  + dist_between * 0.8;
        this.minDistanceBetween = 0; // don't force a jump
        this.maxHeightDistance = jump_height * 0.8;
        this.colors = ["#4169E1", "#27B810"];

        this.platforms = []
        let numPlatforms = 3 + Math.floor(ctx.canvas.offsetWidth / 1000);
        for (let idx = 0; idx < numPlatforms; idx++) {
            let last = this.platforms[this.platforms.length - 1];
            this.platforms[this.platforms.length] = new Platform({
                x: this.platforms.length > 0 ? last.x + last.width + random(this.minDistanceBetween, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 5,
                y: random(ctx.canvas.offsetHeight / 1.1, ctx.canvas.offsetHeight/ 1.1 - this.maxHeightDistance),
                width: random(Math.min(ctx.canvas.width, 1000), Math.min(ctx.canvas.width, 2000)),
                height: random(ctx.canvas.offsetHeight/5, ctx.canvas.offsetHeight/2.5),
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

                this.platforms[platform].width = random(Math.min(canvas.width, 1000), Math.min(canvas.width, 2000));
                this.platforms[platform].x = (endPlatform.x + endPlatform.width) + random(this.minDistanceBetween, this.maxDistanceBetween);
                this.platforms[platform].y =  random(canvas.offsetHeight / 1.1, canvas.offsetHeight/ 1.1 - this.maxHeightDistance);
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

    update_platform_gaps(jump_distance, jump_height) {
        this.maxDistanceBetween = jump_distance;
        this.maxHeightDistance = jump_height;
    }

    updateOnDeath(canvas, dist_between) {
        let counter = -1;
        this.maxDistanceBetween = Math.min(32, canvas.offsetWidth / 25)  + dist_between * 0.8;
        this.minDistanceBetween = 0;
        for (let platform of this.platforms) {
            platform.spikes = [];
            platform.x = ++counter > 0 ? this.platforms[counter - 1].x + this.platforms[counter - 1].width + random(this.minDistanceBetween, this.maxDistanceBetween) : canvas.offsetWidth / 5;
            platform.y = random(canvas.offsetHeight / 1.1, canvas.offsetHeight/ 1.1 - this.maxHeightDistance);
            platform.width = random(Math.min(canvas.width, 1000), Math.min(canvas.width, 2000));
            platform.height =  random(canvas.offsetHeight/5, canvas.offsetHeight/2.5);
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

            // reposition the spikes
            for (let spike of platform.spikes) {
                spike.x *= width_ratio;
                spike.y = platform.y - 48;
            }
        }

        this.maxDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25)  + dist_between * 0.8;
    }
}