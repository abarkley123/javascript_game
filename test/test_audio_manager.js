require('jsdom-global')()
var assert = require('assert');
import {TestAudioManager} from "./stub_audio_manager.js";
import app from "../server.mjs";

let server, manager;

before(done => {
  manager = new TestAudioManager();
  server = app.listen(3002, done);
});

let mochaAsync = (fn) => {
  return (done) => {
    fn.call().then(done, (err)=>{done(err)});
  };
};

describe('AudioManager', function() {
  describe('setupAudio()', function() {
    it('should successfully initialise the audio manager.', mochaAsync(async() => {
        await manager.setupAudio();
        // check audio files were set
        assert.strictEqual("public/audio/backgroundMain.mp3", manager.audioFiles["backgroundMain"]);
        assert.strictEqual('public/audio/collision.wav', manager.audioFiles["collision"]);
        assert.strictEqual('public/audio/firstJump.m4a', manager.audioFiles["firstJump"]);
        assert.strictEqual('public/audio/secondJump.m4a', manager.audioFiles["secondJump"]);
    }));
  });
  describe('handleResponse()', function() {
    it('should throw error for bad request.', mochaAsync(async() => {
        manager.audioFiles = [];
        try {
          manager.handleResponse({status:400,ok:false,statusText:"failed"});
          assert.fail();
        } catch (err) {
          assert.strictEqual(err.message, "failed");
          // check audio files were set
          assert.strictEqual(manager.audioFiles.length, 0);
        }
    }));
  });
  describe('setupEventListeners()', function() {
    it('should setup event listener.', mochaAsync(async() => {
      manager.audioFiles["backgroundMain"] = new TestAudio();
      manager.setupEventListeners();
      //check not null
      assert.ok(manager.audioFiles["backgroundMain"].eventListeners["ended"]);
    }));
  });
  describe('playAudio()', function() {
    it('should play audio if paused.', mochaAsync(async() => {
        manager.audioFiles["test"] = new TestAudio();
        manager.playAudio("test");
        assert.strictEqual(manager.audioFiles["test"].paused, false);
    }));
    it('should not play audio if not paused.', mochaAsync(async() => {
      manager.audioFiles["test"] = new TestAudio();
      manager.audioFiles["test"].paused = false;
      manager.playAudio("test");
      assert.strictEqual(manager.audioFiles["test"].paused, false);
    }));
    it('should quietly handle exception if file not found.', mochaAsync(async() => {
      manager.playAudio("undefined");
      assert.strictEqual(manager.audioFiles["test"].paused, false);
    }));
  });
  describe('handleTabChange()', function() {
    it('should pause audio if document hidden.', mochaAsync(async() => {
      manager.audioFiles["tab"] = new TestAudio();
      manager.audioFiles["tab"].paused = false;
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: function() { return true; }
      });
      manager.handleTabChange("tab");
      assert.strictEqual(manager.audioFiles["tab"].paused, true);
    }));
    it('should play audio if document hidden.', mochaAsync(async() => {
      manager.audioFiles["tab"] = new TestAudio();
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: function() { return false; }
      });
      manager.handleTabChange("tab");
      assert.strictEqual(manager.audioFiles["tab"].paused, false);
    }));
    it('should handle exception if audio element not found.', mochaAsync(async() => {
      manager.handleTabChange("not_found");
      assert.strictEqual(manager.audioFiles["not_found"], undefined);
    }));
  });
  describe('retryAudioPlayback()', function() {
    it('should play audio if available.', mochaAsync(async() => {
      manager.audioFiles["tab"] = new TestAudio();
      manager.retryAudioPlayback("tab", 0);
      assert.strictEqual(manager.audioFiles["tab"].paused, false);
    }));
    it('should not play audio if not available.', mochaAsync(async() => {
      manager.retryAudioPlayback("invalid", 0);
      assert.ok(manager.audioFiles["invalid"] === undefined);
    }));
  });
});

class TestAudio {

  constructor() {
    this.volume = 0;
    this.paused = true;
    this.eventListeners = {};
  }

  play() {
    this.paused = false;
    return Promise.resolve(this.paused);
  }

  pause() {
    this.paused = true;
    return Promise.resolve(this.paused);
  }

  addEventListener(trigger) {
    this.eventListeners[trigger] = "eventListener";
  }
}

after(done => {
    server.close(done);
});