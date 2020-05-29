export class AudioManager {

    constructor() {
        this.audioFiles = this.setupAudio();
    }
     /* Background music supplied by Eva – 失望した: https://youtu.be/jVTsD4UPT-k, 
     * License: Creative Commons Attribution 3.0 - http://bit.ly/RFP_CClicense. **/

    // This function should load all audio files.
    setupAudio() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:8080/audio', true);
        xhr.send();
        // this.getAudioFiles()
        //     .then(files => console.log(files))
        //     .catch(e => console.log(e));
        // this.getAudioFiles
        // let bgm = new Audio('public/audio/background_music.mp3');
        // bgm.volume = 0.4;
        // bgm.addEventListener('ended', function() {
        //     this.currentTime = 0;
        //     this.play();
        // }, false);
        // getAudioFiles
    }

    playAudio(bgm) {
        // pause the music when the user changes tabs.
        document.addEventListener("visibilitychange", () => {
                try {
                if (document.hidden){
                    bgm.pause();
                } else {
                    bgm.play();
                }
                } catch (NoSuchAudioException) {
                console.log("Unable to change state of audio.");
                }
        }, false);
    }
    
    playAudio(bgm) {
        const play = bgm.play();
    
        if (play) {
        play.then(() => {
            return;
        }).catch(function(AudioException) {
            console.log('Audio Failed to play due to cause: \n' + AudioException);
            handleAudioFailure(bgm);
        });
        }
    }
    
    // retry
    handleAudioFailure() {
        setTimeout(() => {
            playAudio(this.audio);
        }, 1500);  
    }
}