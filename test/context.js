class TestContext {

    constructor(width, height) {
        this.canvas = new TestCanvas(width, height)
    }

    createLinearGradient(x, y, width, height) {
        return new ColorGradient(x, y, width, height);
    }

    beginPath() {
        this.spikesDrawn = true;
    }
    moveTo() {}
    lineTo() {}
    fill() {
        this.drawn = true;
    }
    clearRect(x,y,width,height) {
        this.drawn = true;
    }
    fillRect(x,y,width,height) {
        this.drawn = true;
    }
    strokeRect(x,y,width,height) {}
}

class ColorGradient {

    constructor(x, y, width, height) {}

    addColorStop(idx, color) {}
}

class TestCanvas {

    constructor(width, height) {  
        this.setSize(width, height);
    }

    setSize(width, height) {
        this.width = width;
        this.offsetWidth = width;
        this.height = height;
        this.offsetHeight = height;  
    }
}

module.exports = TestContext