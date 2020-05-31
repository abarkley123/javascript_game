export class AudioManager {

    constructor() {
        this.audioFiles = {};

        this.setupAudio()
            .then(() => console.log("Successfully loaded audio files."))
            .catch(e => console.log("Failed to setup audio due to cause: " + e));
    }
    
     /* Background music supplied by Eva – 失望した: https://youtu.be/jVTsD4UPT-k, 
     * License: Creative Commons Attribution 3.0 - http://bit.ly/RFP_CClicense. 
     * Collision sound: @Shades https://opengameart.org/content/8-bit-sound-effect-pack-vol-001 
     * Jump sounds: @Damaged Panda https://opengameart.org/content/100-plus-game-sound-effects-wavoggm4a **/

    // This function should load all audio files. 
    async setupAudio() {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status == 200) {
                    let files = JSON.parse(xhr.responseText)["message"];

                    files.forEach(file => {
                        let audio = new Audio(file.substring(file.indexOf("public")));
                        audio.volume = 0.4;
                        this.audioFiles[file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf("."))] = audio;
                    });

                    this.setupEventListeners();
                } else {
                    alert("Failed to load audio files.");
                    console.log("Resolving audio files failed due to " + JSON.parse(xhr.responseText)["message"]);
                }
            }
        }
        xhr.open('GET', 'http://localhost:8080/audio', true);
        xhr.send();
    }

    setupEventListeners() {
        // pause brackground music when the user leaves the tab. other audio files are short lived so don't require this.
        document.addEventListener("visibilitychange", () => {
            try {
                if (document.hidden) {
                    this.audioFiles["backgroundMain"].pause();
                } else  {
                    this.audioFiles["backgroundMain"].play();
                }
            } catch (NoSuchAudioException) {
                console.log("Unable to change state of audio due to: " + NoSuchAudioException);
            }
        }, false);

        // loop the background music
        this.audioFiles["backgroundMain"].addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
          }, false);
    }
    
    playAudio(file, volume = 0.4) {
        let audio = this.audioFiles[file], _this = this;
    
        try {
            audio.volume = volume;
            if (!audio.paused) return;
            audio.play().then(() => {
                return;
            }).catch(function(PlaybackException) {
                console.log('Audio failed to play due to cause: \n' + PlaybackException);
                _this.retryPlayback(file); 
            });
        } catch (NoSuchAudioException) {
            console.log("Could not find audio object '" + file + "' with cause: \n" + NoSuchAudioException);
            // asynchronous AJAX request may not have finished, so retry quietly.
            _this.retryPlayback(file);
        }
    }
    
    retryPlayback(file, currentInvocation = 0) {
        let audio, maxInvocations = 10, _this = this;
        setTimeout(() => {
            // if the file was retrieved, then it can be played.
            if (audio = _this.audioFiles[file]) _this.playAudio(file);
            else if (currentInvocation < maxInvocations) _this.retryPlayback(file, currentInvocation + 1);
        }, 3000);  
    }
}