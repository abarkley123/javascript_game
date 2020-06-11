var assert = require('assert');
import {Platform} from "../public/js/platform.js";
import { Test } from "mocha";
var TestContext = require("./context.js");

describe('Platform', function() {
    describe('constructor()', function() {
      it('should successfully initialise the platform.', function() {
        let p = new Platform({x:5,y:5,width:10,height:10,color:"#fff",gradient:"123"});
        assert.strictEqual(5, p.x);
        assert.strictEqual(5, p.y);
        assert.strictEqual(10, p.width);
        assert.strictEqual(10, p.height);
        assert.strictEqual("#fff", p.color);
        assert.strictEqual("123", p.colorGradient);
        assert.strictEqual(0, p.spikes.length);
    });
      it('should successfully initialise the platform with default constructor.', function() {
        let p = new Platform();
        assert.strictEqual(0, p.x);
        assert.strictEqual(0, p.y);
        assert.strictEqual(0, p.width);
        assert.strictEqual(0, p.height);
        assert.strictEqual("#2D0754", p.color);
        assert.strictEqual(undefined, p.colorGradient);
        assert.strictEqual(0, p.spikes.length);
      });
    });
    describe('update()', function() {
        it('should successfully update the platform and its spikes.', function() {
            let p = new Platform();
            p.width = 100;
            p.createSpikes(1);
            p.update(10);
            assert.strictEqual(-10, p.x);
            assert.strictEqual(0, p.y);
            assert.ok(p.spikes[0].x > p.x);
            assert.strictEqual(p.y - 48, p.spikes[0].y);
        });
    });
    describe('draw()', function() {
        it('should successfully draw the platform and its spikes.', function() {
            let p = new Platform();
            p.createSpikes(1);
            let ctx = new TestContext(100, 100);
            // check platform draws
            p.draw(ctx);
            assert.strictEqual(true, ctx.drawn);
            // check spikes draw
            ctx.drawn = false;
            p.spikes[0].draw(ctx);
            assert.strictEqual(true, ctx.drawn);
        });
    });
    describe('createSpikes()', function() {
        it('should successfully create spikes.', function() {
            let p = new Platform();
            p.width = 100;
            p.createSpikes(1);
            assert.strictEqual(1, p.spikes.length);
            assert.strictEqual(48, p.spikes[0].width);
            assert.strictEqual(48, p.spikes[0].height);
            assert.strictEqual(p.y - 48, p.spikes[0].y);
            assert.ok(p.spikes[0].x >= p.x + 48 && p.spikes[0].x <= p.x + p.width);

            // check that the correct number are created (i.e. not 11)
            p.createSpikes(10);
            assert.strictEqual(10, p.spikes.length);

            for (let i = 0; i < 10; i++) {
                assert.strictEqual(48, p.spikes[i].width);
                assert.strictEqual(48, p.spikes[i].height);
                assert.strictEqual(p.y - 48, p.spikes[i].y);
                assert.ok(p.spikes[i].x >= p.x + 48 && p.spikes[i].x <= p.x + p.width);
            }

            // now check that the unrequired objects aren't deleted, but kept offscreen.
            p.createSpikes(1);
            assert.strictEqual(10, p.spikes.length);
            assert.strictEqual(48, p.spikes[0].width);
            assert.strictEqual(48, p.spikes[0].height);
            assert.strictEqual(p.y - 48, p.spikes[0].y);
            assert.ok(p.spikes[0].x >= p.x + 48 && p.spikes[0].x <= p.x + p.width);
            // offscreen spikes - aren't being used but object is 'cached'.
            for (let i = 1; i < 10; i++) {
                assert.strictEqual(0, p.spikes[i].width);
                assert.strictEqual(0, p.spikes[i].height);
                assert.strictEqual(-48, p.spikes[i].x);
                assert.strictEqual(-48, p.spikes[i].y);
            }
        });
        it('should not create any spikes when number not specified.', function() {
            let p = new Platform();
            p.width = 100;
            p.createSpikes();
            assert.strictEqual(0, p.spikes.length);
        });
    });
});