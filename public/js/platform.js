import {Vector2} from "./vector2.js";
import {random} from "./util.js";

export class Platform extends Vector2 {

    // default constructor
    constructor(options) {
        super(options.x || 0, options.y || 0, options.width || 0, options.height || 0);
        this.setup(options.color, options.gradient);
    }

    setup(color, gradient) {
        this.spikes = [];
        this.color = color;
        this.grd = gradient;       
    }

    update(velocity) {
        this.setPosition(this.x - velocity, this.y);
        this.spikes.forEach(spike => spike.update(velocity));
    }

    draw(ctx) {
        ctx.fillStyle = this.grd;
        // avoid sub pixel rendering, so use integers instead of floats
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), Math.floor(this.width), Math.floor(this.height));
        this.spikes.forEach((spike) => spike.draw(ctx));
    }

    createSpikes(number = 0) {
        // reuse objects - only create where needed. 
        for (let i = 0; i < Math.max(this.spikes.length, number); i++) {
            if (i > number) {
                this.spikes[i].initialise([0, 0], [0, 0]);
            } else {
                if (i >= this.spikes.length) this.spikes.push(new Spike({color:"#9E111C"}));  
                this.spikes[i].initialise([this.x + random(48, this.width - 48), this.y - (48)], [48, 48]);
            }
        }
    }
}

class Spike extends Vector2 {

    constructor(options) {
        super(options.x || 0, options.y || 0, options.width || 0, options.height || 0);
        this.color = options.color;
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
        this.setPosition(this.x - velocity, this.y);
    }
}