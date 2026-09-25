class AudioManager {
    constructor() {
        this.tracks = {};
        this.masterVolume = 1.0;
    }

    // Load an audio file and create an HTML5 Audio element
    load(name, src, loop = false, defaultVolume = 1.0) {
        const audio = new Audio(src);
        audio.loop = loop;
        audio.volume = defaultVolume * this.masterVolume;
        this.tracks[name] = {
            element: audio,
            baseVolume: defaultVolume
        };
        return audio;
    }

    play(name) {
        if (this.tracks[name]) {
            this.tracks[name].element.play().catch(e => console.log("Audio play prevented:", e));
        }
    }

    stop(name) {
        if (this.tracks[name]) {
            this.tracks[name].element.pause();
            this.tracks[name].element.currentTime = 0;
        }
    }

    setMasterVolume(vol) {
        this.masterVolume = vol;
        for (let key in this.tracks) {
            this.tracks[key].element.volume = this.tracks[key].baseVolume * this.masterVolume;
        }
    }

    fadeOut(name, durationMs = 1000) {
        if (!this.tracks[name]) return;
        const audio = this.tracks[name].element;
        const startVol = audio.volume;
        const steps = 20;
        const stepTime = durationMs / steps;
        const volStep = startVol / steps;

        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            if (audio.volume - volStep > 0) {
                audio.volume -= volStep;
            } else {
                audio.volume = 0;
                audio.pause();
                audio.currentTime = 0;
                audio.volume = this.tracks[name].baseVolume * this.masterVolume; // Reset for next play
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }
}

const audioManager = new AudioManager();

// Pre-load audio as per prompt
audioManager.load("menu-music", "assets/audio/menu-music.mp3", true, 0.7);
// Fallback path if user adds the track with exact name as requested
audioManager.load("menu-tension", "assets/audio/Bee's Photo - Annabelle Creation Soundtrack.mp3", true, 0.2); 
audioManager.load("clock", "assets/audio/clock-ticking.mp3.mp3", true, 0.8);
audioManager.load("wind", "assets/audio/soundreality-wind-blowing-457954.mp3", true, 0.4);
audioManager.load("thunder", "assets/audio/dragon-studio-dry-thunder-364468.mp3", false, 0.9);
