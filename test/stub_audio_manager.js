import config from "../public/client_config.mjs";
import log from "../public/js/logger.mjs";
import { AudioManager } from "../public/js/audio_manager";
import fetch from "node-fetch";


export class TestAudioManager extends AudioManager {

    constructor() {
        super();
    }

    /* Background music supplied by Eva – 失望した: https://youtu.be/jVTsD4UPT-k, 
     * License: Creative Commons Attribution 3.0 - http://bit.ly/RFP_CClicense. 
     * Collision sound: @Shades https://opengameart.org/content/8-bit-sound-effect-pack-vol-001 
     * Jump sounds: @Damaged Panda https://opengameart.org/content/100-plus-game-sound-effects-wavoggm4a **/

    // This function should load all audio files using node fetch.
    async setupAudio() {
        fetch("http://" + config.address + ":" + config.port + '/audio', {
            method: "GET", 
            credentials:"omit"
        }).then(response => this.handleResponse(response)).catch(err => {
            log("Error encountered when retrieving audio files: " + err.message, "test");
        });
    }
}