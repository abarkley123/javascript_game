import {Vector2} from "./vector2.js";
import {random} from "./util.js";

export class Platform extends Vector2 {

    constructor(options) {
        super(options.x, options.y, options.width, options.height);
        this.previousX = 0;
        this.previousY = 0;
        this.spikes = [];
        this.color = options.color[0];
        this.grd = options.ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        this.grd.addColorStop(0, options.color[0]);
        this.grd.addColorStop(1, options.color[1]);
    }

    draw(ctx) {
        ctx.fillStyle = this.grd;
        // avoid sub pixel rendering, so use integers instead of floats
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.width), Math.floor(this.height));
    }

    createSpikes(number) {
        this.spikes = [];
        try {
            for (let i = 0; i < number; i++) {
                this.spikes.push(new Spike({
                    x: this.x + random(48, this.width - 48),
                    y: this.y - (48),
                    width: 48,
                    height: 48
                }));
            }
        } catch (UninitialisedException) {
            console.log("Exception encountered when trying to spawn spikes:\n" + UninitialisedException);
        }
    }
}

class Spike extends Vector2 {

    constructor(options) {
        super(options.x, options.y, options.width, options.height);
        this.previousX = 0;
        this.previousY = 0;
        this.color = "#9E111C";
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y);
        ctx.fill();
    }

    update(velocity) {
        this.x -= velocity;
    }
}