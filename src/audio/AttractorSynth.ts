// Gentle per-attractor oscillator bed. 10 sine voices fed by the live
// attractor state: x -> log pitch, y -> pan, z -> filter cutoff.
// Default muted; gesture-gated start so browsers let the context resume.

export interface VoiceSample {
    x: number;
    y: number;
    z: number;
}

interface Voice {
    osc: OscillatorNode;
    filter: BiquadFilterNode;
    panner: StereoPannerNode;
    voiceGain: GainNode;
    baseFreq: number;
}

const PITCH_MIN_HZ = 200;
const PITCH_MAX_HZ = 1200;
const FILTER_MIN_HZ = 250;
const FILTER_MAX_HZ = 4000;
const DEFAULT_VOLUME = 0.1;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const mapLog = (v: number, outMin: number, outMax: number) => {
    const t = clamp(Math.tanh(v * 0.15) * 0.5 + 0.5, 0, 1);
    const lo = Math.log(outMin);
    const hi = Math.log(outMax);
    return Math.exp(lo + t * (hi - lo));
};

const mapPan = (v: number) => clamp(Math.tanh(v * 0.25), -1, 1);

export class AttractorSynth {
    private ctx: AudioContext | null = null;
    private master: GainNode | null = null;
    private lfo: OscillatorNode | null = null;
    private voices: Voice[] = [];
    private muted = true;
    private volume = DEFAULT_VOLUME;
    private ducked = false;
    private started = false;

    get isStarted() {
        return this.started;
    }

    start(voiceCount: number) {
        if (this.started) return;
        const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
        if (!Ctor) return;
        const ctx = new Ctor();
        const master = ctx.createGain();
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.ratio.value = 4;
        compressor.attack.value = 0.01;
        compressor.release.value = 0.2;

        master.gain.value = 0; // start silent, fade in below if not muted
        master.connect(compressor);
        compressor.connect(ctx.destination);

        // Slow filter LFO (0.1 Hz) shared across voices via a scaled sum.
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.1;
        lfo.type = 'sine';
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 300; // +/- 300 Hz wobble on filter cutoff
        lfo.connect(lfoGain);
        lfo.start();

        this.ctx = ctx;
        this.master = master;
        this.lfo = lfo;

        for (let i = 0; i < voiceCount; i++) {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.value = 0.7;
            filter.frequency.value = 1000;
            const panner = ctx.createStereoPanner();
            const voiceGain = ctx.createGain();
            voiceGain.gain.value = 1 / Math.max(1, voiceCount);

            lfoGain.connect(filter.frequency);

            osc.connect(filter);
            filter.connect(panner);
            panner.connect(voiceGain);
            voiceGain.connect(master);

            osc.start();
            this.voices.push({ osc, filter, panner, voiceGain, baseFreq: 440 });
        }

        this.started = true;
        this.applyMasterGain();
    }

    update(index: number, sample: VoiceSample) {
        if (!this.started || !this.ctx) return;
        const v = this.voices[index];
        if (!v) return;
        const now = this.ctx.currentTime;
        const freq = mapLog(sample.x, PITCH_MIN_HZ, PITCH_MAX_HZ);
        const cutoff = mapLog(sample.z, FILTER_MIN_HZ, FILTER_MAX_HZ);
        const pan = mapPan(sample.y);
        v.osc.frequency.setTargetAtTime(freq, now, 0.05);
        v.filter.frequency.setTargetAtTime(cutoff, now, 0.08);
        v.panner.pan.setTargetAtTime(pan, now, 0.1);
    }

    setMuted(muted: boolean) {
        this.muted = muted;
        this.applyMasterGain();
        if (!muted) this.ctx?.resume().catch(() => {});
    }

    isMuted() {
        return this.muted;
    }

    setVolume(v: number) {
        this.volume = clamp(v, 0, 1);
        this.applyMasterGain();
    }

    getVolume() {
        return this.volume;
    }

    duck(on: boolean) {
        this.ducked = on;
        this.applyMasterGain();
    }

    stop() {
        if (!this.started) return;
        this.voices.forEach((v) => {
            try {
                v.osc.stop();
            } catch {
                /* noop */
            }
        });
        try {
            this.lfo?.stop();
        } catch {
            /* noop */
        }
        this.ctx?.close().catch(() => {});
        this.voices = [];
        this.ctx = null;
        this.master = null;
        this.lfo = null;
        this.started = false;
    }

    private applyMasterGain() {
        if (!this.master || !this.ctx) return;
        const now = this.ctx.currentTime;
        const target = this.muted || this.ducked ? 0 : this.volume;
        this.master.gain.cancelScheduledValues(now);
        this.master.gain.setTargetAtTime(target, now, 0.1);
    }
}
