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
  describe('constructor()', function() {
    it('should successfully initialise the audio manager.', mochaAsync(async() => {
        await manager.setupAudio();
        // check audio files were set
        assert.strictEqual("public/audio/backgroundMain.mp3", manager.audioFiles["backgroundMain"]);
        assert.strictEqual('public/audio/collision.wav', manager.audioFiles["collision"]);
        assert.strictEqual('public/audio/firstJump.m4a', manager.audioFiles["firstJump"]);
        assert.strictEqual('public/audio/secondJump.m4a', manager.audioFiles["secondJump"]);
    }));
  });
});

after(done => {
    server.close(done);
});