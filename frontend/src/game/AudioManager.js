class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.connect(this.ctx.destination);
        this.masterVolume.gain.value = 0.5;

        this.engineOsc = null;
        this.engineGain = null;
        this.modulator = null;
        this.modulatorGain = null;
        this.noiseNode = null;
        this.noiseGain = null;

        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }

        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.value = 0.0;

        this.modulator = this.ctx.createOscillator();
        this.modulator.type = 'square';
        this.modulator.frequency.value = 40;

        this.modulatorGain = this.ctx.createGain();
        this.modulatorGain.gain.value = 50;

        this.modulator.connect(this.modulatorGain);
        this.modulatorGain.connect(this.engineOsc.frequency);
        this.engineOsc.connect(this.engineGain);
        this.engineGain.connect(this.masterVolume);

        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        this.noiseNode = this.ctx.createBufferSource();
        this.noiseNode.buffer = noiseBuffer;
        this.noiseNode.loop = true;

        this.noiseGain = this.ctx.createGain();
        this.noiseGain.gain.value = 0.0;

        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = 400;

        this.noiseNode.connect(this.filter);
        this.filter.connect(this.noiseGain);
        this.noiseGain.connect(this.masterVolume);

        this.engineOsc.start();
        this.modulator.start();
        this.noiseNode.start();

        this.initialized = true;
        console.log('F1 Audio System Initialized 🏎️');
    }

    updateEngine(rpm, speed) {
        if (!this.initialized) return;

        const baseFreq = 60 + (rpm / 12000) * 340;
        this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);

        this.modulatorGain.gain.setTargetAtTime(rpm / 200, this.ctx.currentTime, 0.1);

        const targetVol = 0.1 + (rpm / 12000) * 0.3;
        this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);

        const noiseVol = (speed / 300) * 0.4;
        this.noiseGain.gain.setTargetAtTime(noiseVol, this.ctx.currentTime, 0.5);

        const filterFreq = 400 + (speed / 300) * 2000;
        this.filter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.2);
    }

    stop() {
        if (this.engineOsc) this.engineOsc.stop();
        if (this.modulator) this.modulator.stop();
        if (this.noiseNode) this.noiseNode.stop();
        this.ctx.close();
    }
}

export default AudioManager;
