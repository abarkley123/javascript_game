import config from "../client_config.mjs";
import log from "./logger.mjs";

export class AudioManager {

    constructor() {
        this.audioFiles = {};

        // TODO - consider using service workers to fulfill this.
        this.setupAudio()
            .then(() => log("Successfully loaded audio files.", "info"))
            .catch(e => log("Failed to setup audio due to cause: " + e, "error"));
    }

     /* Background music supplied by Eva – 失望した: https://youtu.be/jVTsD4UPT-k, 
     * License: Creative Commons Attribution 3.0 - http://bit.ly/RFP_CClicense. 
     * Collision sound: @Shades https://opengameart.org/content/8-bit-sound-effect-pack-vol-001 
     * Jump sounds: @Damaged Panda https://opengameart.org/content/100-plus-game-sound-effects-wavoggm4a **/

    // This function should load all audio files. 
    async setupAudio() {
        fetch("http://" + config.address + ":" + config.port + '/audio',{
            method: "GET", 
            credentials:"omit"
        }).then(response => this.handleResponse(response)).catch(err => {
            log("Error encountered when retrieving audio files: " + err.message, "error");
        });
    }

    handleResponse(response) {
        if (response.status === 200 && response.ok) {
            response.json().then(data => {
                data["message"].forEach(file => {
                    let audio, path = file.substring(file.indexOf("public"));
                    try {
                        audio = new Audio(path);
                        audio.volume = 0.4;
                    } catch (InstantiationException) {
                        audio = path;
                        log("Could not create audio object. Defaulting to file path..", "error");
                    }
                    this.audioFiles[file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf("."))] = audio;
                });

                this.setupEventListeners();
            }).catch(err => log(err.message, "error"));
        } else throw Error(response.statusText);
    }

    setupEventListeners() {
        // loop the background music
        this.audioFiles["backgroundMain"].addEventListener('ended', this.playAudio("backgroundMain"), false);

        // pause brackground music when the user leaves the tab. other audio files are short lived so don't require this.
        document.addEventListener("visibilitychange", this.handleTabChange("backgroundMain"), false);
    }
    
    handleTabChange(file) {
        let audio = this.audioFiles[file];

        try {
            if (document.hidden) audio.pause();
            else audio.play();
        } catch (NoSuchAudioException) {
            log("Unable to change state of audio due to: " + NoSuchAudioException, "error");
        }
    }

    playAudio(file, volume = 0.4) {
        let audio = this.audioFiles[file], _this = this;
    
        try {
            audio.volume = volume;
            audio.currentTime = 0;
            if (audio.paused === true) audio.play();
        } catch (NoSuchAudioException) {
            log("Could not find audio object '" + file + "' with cause: " + NoSuchAudioException, "info");
            // asynchronous AJAX request may not have finished, so retry quietly.
            _this.retryPlayback(file);
        }
    }
    
    retryPlayback(file, currentInvocation = 0) {
        setTimeout(this.retryAudioPlayback, 3000, file, currentInvocation);  
    }
    
    retryAudioPlayback(file, currentInvocation) {
        let maxInvocations = 10, audio = this.audioFiles[file];
        // if the file was retrieved, then it can be played.
        if (audio) this.playAudio(file);
        else if (currentInvocation < maxInvocations) this.retryAudioPlayback(file, currentInvocation + 1);
        else log("Retries exhausted: could not play audio file " + file, "error");
    }
}