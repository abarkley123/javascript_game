export class AudioManager {

    constructor() {
        this.audioFiles = {};

        this.setupAudio()
            .then(() => console.log("Successfully loaded audio files."))
            .catch(e => console.log("Failed to setup audio due to cause: " + e));
    }
     /* Background music supplied by Eva – 失望した: https://youtu.be/jVTsD4UPT-k, 
     * License: Creative Commons Attribution 3.0 - http://bit.ly/RFP_CClicense. **/

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
        // pause all currently playing audio objects when the user leaves the tab.
        for (const [, audio] of Object.entries(this.audioFiles)) {
            document.addEventListener("visibilitychange", () => {
                try {
                    if (document.hidden && !audio.paused) {
                        audio.pause();
                    } else if (audio.paused) {
                        audio.play();
                    }
                } catch (NoSuchAudioException) {
                    console.log("Unable to change state of audio due to: " + NoSuchAudioException);
                }
            }, false);
        }

        // loop the background music
        this.audioFiles["backgroundMain"].addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
          }, false);
    }
    
    playAudio(file) {
        let audio = this.audioFiles[file];
    
        try {
            audio.play().then(() => {
                console.log("Playing audio: " + file);
                return;
            }).catch(function(PlaybackException) {
                console.log('Audio failed to play due to cause: \n' + PlaybackException);
                this.setupAudio(); //objects may have become corrupted, try to reinitialise them.
            });
        } catch (NoSuchAudioException) {
            console.log("Could not find audio object '" + file + "' with cause: \n" + NoSuchAudioException);
            // asynchronous AJAX request may not have finished, so retry quietly.
            this.retryPlayback(file);
        }
    }
    
    retryPlayback(file) {
        let audio, currentInvocations = 0, maxInvocations = 10;
        let retry = setTimeout(() => {
            console.log("Retrying playback of audio file: " + file);
            // if the file was retrieved, then it can be played.
            if (audio = this.audioFiles[file]) {
                this.playAudio(file);
                clearInterval(retry);
            } else if (++currentInvocations >= maxInvocations) {
                clearInterval(retry);
            }
        }, 1500);  
    }
}