class TestContext {

    constructor(width, height) {
        this.canvas = new TestCanvas(width, height)
    }
}

class TestCanvas {

    constructor(width, height) {  
        this.width = width;
        this.offsetWidth = width;
        this.height = height;
        this.offsetHeight = height;
    }
}

module.exports = TestContext