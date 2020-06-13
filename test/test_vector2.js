var assert = require('assert');
import {Vector2} from "../public/js/vector2.js";
var TestContext = require("./context.js");

describe('Vector2', function() {
    describe('constructor()', function() {
      it('should successfully initialise.', function() {
        let v = new Vector2(5, 10, 15, 20);
        assert.strictEqual(5, v.x);
        assert.strictEqual(10, v.y);
        assert.strictEqual(15, v.width);
        assert.strictEqual(20, v.height);
      });
    });
    describe('intersects()', function() {
        it('should check intersection.', function() {
          let v = new Vector2(5, 10, 15, 20);
          let v2 = new Vector2(20, 30, 15, 20);
          let v3 = new Vector2(25, 10, 15, 20);

          assert.strictEqual(true, v.intersects(v2));
          assert.strictEqual(false, v.intersects(v3));
        });
    });
    describe('intersects()', function() {
      it('should check intersection at left.', function() {
        let v = new Vector2(5, 55, 15, 20);
        v.velocityY = 10;
        let v2 = new Vector2(20, 30, 15, 20);
        let v3 = new Vector2(25, 10, 15, 20);

        assert.strictEqual(true, v.intersectsLeft(v2, 5));
        assert.strictEqual(false, v.intersects(v3));
      });
  });
  describe('outOfBounds()', function() {
    it('should check out of bounds.', function() {
      let v = new Vector2(5, 10, 15, 20);
      let v2 = new Vector2(-16, 10, 15, 20);
      let v3 = new Vector2(5, 101, 15, 20);
      let ctx = new TestContext(100, 100);
      assert.strictEqual(false, v.outOfBounds(ctx.canvas));
      assert.strictEqual(true, v2.outOfBounds(ctx.canvas));
      assert.strictEqual(true, v3.outOfBounds(ctx.canvas));
    });
  });
});