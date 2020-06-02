class TestContext {

    constructor(width, height) {
        this.canvas = new TestCanvas(width, height)
    }

    createLinearGradient(x, y, width, height) {
        return new ColorGradient(x, y, width, height);
    }

    beginPath() {}
    moveTo() {}
    lineTo() {}
    fill() {}
    clearRect(x,y,width,height) {}
    fillRect(x,y,width,height) {}
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