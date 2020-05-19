
class PlatformManager {

    constructor(dist_between) {
        this.maxDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25)  + dist_between/2;
        this.minDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25);
        this.colors = ["#4169E1", "#27B810"];

        this.platforms = []
        let numPlatforms = 3 + Math.floor(ctx.canvas.offsetWidth / 1000);
        for (let idx = 0; idx < numPlatforms; idx++) {
            let last = this.platforms[this.platforms.length - 1];
            this.platforms[this.platforms.length] = new Platform({
                x: this.platforms.length > 0 ? last.x + last.width + random(this.minDistanceBetween, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 8,
                y: ctx.canvas.height / 1.25,
                width: random(ctx.canvas.width / 2, ctx.canvas.width / 1.25),
                height: random(ctx.canvas.height/3, ctx.canvas.height / 5),
                color: randomChoice(this.colors)
            });
        }

        this.colliding = false;
    }

    update() {
        for (let platform in this.platforms) {

            this.platforms[platform].x -= engine.velocityX;
            if (this.platforms[platform].x + this.platforms[platform].width < 0) {
                let endPlatform = this.platforms[platform > 0 ? platform - 1 : this.platforms.length - 1];

                this.platforms[platform].width = random(450, ctx.canvas.width + 200);
                this.platforms[platform].x = (endPlatform.x + endPlatform.width) +  random(this.minDistanceBetween, this.maxDistanceBetween);
                this.platforms[platform].y = random(endPlatform.y - 32, ctx.canvas.height - 80);
                this.platforms[platform].height = this.platforms[0].y + ctx.canvas.height + 10;

                // create new spikes if at that stage.
                if (engine.maxSpikes >= 1) {
                    this.platforms[platform].createSpikes(random(0, engine.maxSpikes));
                }
            }

            // update the spikes if at that stage.
            if (engine.maxSpikes >= 1) {
                for (let spike of this.platforms[platform].spikes) spike.update();
            }
        }
    }

    updateOnDeath(dist_between) {
        let counter = -1;
        this.maxDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25)  + dist_between/2;
        this.minDistanceBetween = Math.min(32, ctx.canvas.offsetWidth / 25);
        for (let platform of this.platforms) {
            platform.spikes = [];
            platform.x = ++counter > 0 ? this.platforms[counter - 1].x + this.platforms[counter - 1].width + random(this.maxDistanceBetween * 0.5, this.maxDistanceBetween) : ctx.canvas.offsetWidth / 8;
            platform.y = ctx.canvas.height / 1.25;
            platform.width = random(ctx.canvas.width / 2, ctx.canvas.width / 1.25),
            platform.height = random(ctx.canvas.height/3, ctx.canvas.height / 5),
            platform.spikes = [] // delete
        }

        this.colliding = false;
    }
}