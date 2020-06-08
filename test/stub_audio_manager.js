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

    // This function should load all audio files. 
    async setupAudio() {
        fetch("http://" + config.address + ":" + config.port + '/audio', {
            method: "GET", 
            credentials:"omit"
        }).then(response => {
            if (response.status === 200 && response.ok) {
                response.json().then(data => {
                    data["message"].forEach(file => {
                        let audio = file.substring(file.indexOf("public"));
                        this.audioFiles[file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf("."))] = audio;
                    });
                }).catch(err => {
                    // node doesn't have Audio objects
                    log(err.message, "error");
                });
            } else {
                throw Error(response.statusText);
            }
        }).catch(err => {
            log("Error encountered when retrieving audio files: " + err.message, "error");
        });
    }
}