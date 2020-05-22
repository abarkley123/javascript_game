import {Vector2} from "./vector2.js";
import {random} from "./util.js";

export class Platform extends Vector2 {

    constructor(options) {
        super(options.x, options.y, options.width, options.height);
        this.previousX = 0;
        this.previousY = 0;
        this.color = options.color;
        this.spikes = [];
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    createSpikes(canvas, number) {
        this.spikes = [];
        try {
            for (let i = 0; i < number; i++) {
                const spike = new Spike({
                    x: this.x + random(48, this.width - 48),
                    y: this.y - (48),
                    width: 48,
                    height: 48
                });
                this.spikes.push(spike);
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

    draw(ctx) {
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

    update(velocity) {
        this.x -= velocity;
    }
}