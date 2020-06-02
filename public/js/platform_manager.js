import {Platform} from "./platform.js";
import {random, randomChoice} from "./util.js";

export class PlatformManager {

    constructor(ctx, jumpSizes) {
            this.platforms = []
            this.minDistanceX = 0; // don't force a jump
            this.maxDistanceX = Math.min(32, ctx.canvas.offsetWidth / 25)  + jumpSizes[0] * 0.8;
            this.maxDistanceY = jumpSizes[1] * 0.8;
            
            let colors = [["#4A205A", "#2D0754"], ["#58186F", "#1B082E"]];
            let numPlatforms = 3 + Math.floor(ctx.canvas.offsetWidth / 1000);
            let startX = 0, canvasWidth = ctx.canvas.width, canvasHeight = ctx.canvas.height;
            for (let idx = 0; idx < numPlatforms; idx++) {
                let position = [startX + this.minDistanceX, random(canvasHeight/1.1, canvasHeight/ 1.1 - this.maxDistanceY)];
                let size = [random(Math.min(canvasWidth, 1000), Math.min(canvasWidth, 2000)), canvasHeight - position[1]];

                this.platforms[idx] = new Platform({
                    color: randomChoice(colors)[1],
                    gradient: this.createColorGradient(ctx, randomChoice(colors), position, size)
                });

                startX = position[0] + size[0];
                this.platforms[idx].initialise(position, size);
            }
    }

    update(canvas, velocity, difficultyLevel) {
        for (let lastPlatform, i = 0; i < this.platforms.length; i++) {
            this.platforms[i].update(velocity);

            // if any platforms have moved off the screen, reuse that object.
            if (this.platforms[i].outOfBounds(canvas) === true) {
                let startX = this.platforms[lastPlatform = i > 0 ? i - 1 : this.platforms.length - 1].x + this.platforms[lastPlatform].width;
                let position = [startX + random(this.minDistanceX, this.maxDistanceX), random(canvas.height/1.1, canvas.height/1.1 - this.maxDistanceY)];
                let size = [random(Math.min(canvas.width, 1000), Math.min(canvas.width, 2000)), canvas.offsetHeight - position[1]];

                this.platforms[i].initialise(position, size);  
                this.platforms[i].createSpikes(random(0, Math.floor((difficultyLevel-1)/2)));
            }
        };
    }

    updatePlatformGaps(canvas, jumpSizes) {
        this.maxDistanceX = Math.min(32, canvas.offsetWidth / 25)  + jumpSizes[0] * 0.8;
        this.maxDistanceY = jumpSizes[1] * 0.8;
    }

    resize(ctx, originalSizes) {
        let widthRatio = ctx.canvas.width / originalSizes[0];
        let heightRatio = ctx.canvas.height / originalSizes[1];

        this.platforms.forEach(platform => {
            let position = [platform.x * widthRatio, platform.y * heightRatio];
            let size = [platform.width * widthRatio, platform.height * heightRatio];
            platform.initialise(position, size);
            platform.spikes.forEach(spike => spike.setPosition(spike.x * widthRatio, platform.y - 48));
        });
    }

    createColorGradient(ctx, colors, position, size) {
        // Create a gradient starting from x0, y0, x1, y1.
        let gradient = ctx.createLinearGradient(position[0], position[1], position[0], position[1] + size[1]/6);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
    }
}