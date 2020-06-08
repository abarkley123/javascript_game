var assert = require('assert');
import {TestAudioManager} from "./stub_audio_manager.js";
import app from "../server.mjs";

let server;

before(done => {
  server = app.listen(3002, done);
});

describe('AudioManager', function() {
  describe('constructor()', function() {
    it('should successfully initialise the audio manager.', function() {
        let manager = new TestAudioManager();

        // while (true) console.log(manager.filePaths);
        assert.ok(manager.filePaths.length > 0);
    });
  });
});

after(done => {
    server.close(done);
});