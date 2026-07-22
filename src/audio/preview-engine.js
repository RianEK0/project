const MOOD_CONFIG = {
  Love: { tempo: 96, scale: "major", color: "silk", progression: [0, 5, 3, 4] },
  Heartbreak: { tempo: 78, scale: "minor", color: "glass", progression: [0, 3, 5, 4] },
  Sad: { tempo: 72, scale: "minor", color: "mist", progression: [0, 5, 4, 3] },
  Lonely: { tempo: 84, scale: "dorian", color: "night", progression: [0, 5, 3, 6] },
  "Missing Someone": { tempo: 76, scale: "minor", color: "letter", progression: [0, 3, 4, 5] },
  Healing: { tempo: 92, scale: "major", color: "dawn", progression: [0, 4, 5, 3] },
  Happy: { tempo: 114, scale: "major", color: "sun", progression: [0, 4, 5, 4] },
  Motivation: { tempo: 122, scale: "mixolydian", color: "edge", progression: [0, 5, 6, 4] },
  Driving: { tempo: 112, scale: "mixolydian", color: "road", progression: [0, 5, 3, 4] },
  Coffee: { tempo: 82, scale: "major7", color: "cafe", progression: [0, 3, 4, 5] },
  Beach: { tempo: 104, scale: "major", color: "tide", progression: [0, 4, 3, 5] },
  Study: { tempo: 74, scale: "major7", color: "focus", progression: [0, 5, 3, 4] },
  Sleep: { tempo: 66, scale: "minor", color: "dream", progression: [0, 3, 5, 3] },
  Sunset: { tempo: 90, scale: "major7", color: "amber", progression: [0, 4, 5, 3] },
  Midnight: { tempo: 88, scale: "dorian", color: "neon", progression: [0, 5, 6, 4] },
  Rain: { tempo: 80, scale: "minor", color: "rain", progression: [0, 5, 3, 4] },
  Party: { tempo: 124, scale: "mixolydian", color: "flash", progression: [0, 4, 6, 5] },
  Chill: { tempo: 86, scale: "major7", color: "haze", progression: [0, 4, 3, 5] },
  Acoustic: { tempo: 78, scale: "major", color: "wood", progression: [0, 4, 5, 3] },
};

const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  major7: [0, 2, 4, 7, 9, 11],
};

function hashString(value) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRng(seed) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function midiToFrequency(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function scaleStepToMidi(root, scaleName, degree, octaveOffset = 0) {
  const intervals = SCALE_INTERVALS[scaleName] ?? SCALE_INTERVALS.major;
  const wrappedDegree = ((degree % intervals.length) + intervals.length) % intervals.length;
  const octave = Math.floor(degree / intervals.length);
  return root + intervals[wrappedDegree] + (octave + octaveOffset) * 12;
}

export class NoctraPreviewEngine {
  constructor({ onProgress, onEnded } = {}) {
    this.onProgress = onProgress;
    this.onEnded = onEnded;
    this.audioContext = null;
    this.masterGain = null;
    this.analyser = null;
    this.compressor = null;
    this.schedulerId = null;
    this.progressFrame = null;
    this.song = null;
    this.songProfile = null;
    this.songDuration = 0;
    this.startTime = 0;
    this.pausedAt = 0;
    this.nextStepTime = 0;
    this.nextStepIndex = 0;
    this.activeNodes = new Set();
    this.frequencyArray = null;
    this.isPlaying = false;
    this.volume = 0.72;
  }

  async ensureContext() {
    if (this.audioContext) {
      return;
    }

    const AudioContextRef = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextRef();
    this.compressor = this.audioContext.createDynamicsCompressor();
    this.compressor.threshold.value = -16;
    this.compressor.knee.value = 20;
    this.compressor.ratio.value = 6;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.18;

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.volume;

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 128;
    this.frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  setVolume(volume) {
    this.volume = clamp(volume, 0, 1);
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 0.015);
    }
  }

  async loadSong(song) {
    await this.ensureContext();
    this.stopVoices();
    this.song = song;
    this.songDuration = clamp(song.durationSeconds, 60, 210);
    this.songProfile = this.createSongProfile(song);
    this.pausedAt = 0;
    this.nextStepIndex = 0;
    this.nextStepTime = this.audioContext.currentTime + 0.02;
    this.emitProgress();
  }

  async play(song = null) {
    if (song && song.id !== this.song?.id) {
      await this.loadSong(song);
    }

    if (!this.song) {
      return;
    }

    await this.ensureContext();

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.stopProgressLoop();
    this.clearScheduler();

    this.startTime = this.audioContext.currentTime - this.pausedAt;
    this.nextStepIndex = Math.max(0, Math.floor(this.pausedAt / this.stepDuration()));
    this.nextStepTime = this.audioContext.currentTime + 0.02;
    this.isPlaying = true;

    this.schedulerId = window.setInterval(() => this.schedulerTick(), 80);
    this.progressFrame = window.requestAnimationFrame(() => this.progressTick());
    this.emitProgress();
  }

  async pause() {
    if (!this.audioContext || !this.isPlaying) {
      return;
    }

    this.pausedAt = this.getCurrentTime();
    this.isPlaying = false;
    this.clearScheduler();
    this.stopProgressLoop();
    await this.audioContext.suspend();
    this.emitProgress();
  }

  async seek(seconds) {
    if (!this.song || !this.audioContext) {
      return;
    }

    const wasPlaying = this.isPlaying;
    this.pausedAt = clamp(seconds, 0, this.songDuration - 0.05);
    this.stopVoices();
    this.clearScheduler();
    this.stopProgressLoop();

    if (wasPlaying) {
      await this.audioContext.resume();
      this.startTime = this.audioContext.currentTime - this.pausedAt;
      this.nextStepIndex = Math.max(0, Math.floor(this.pausedAt / this.stepDuration()));
      this.nextStepTime = this.audioContext.currentTime + 0.02;
      this.schedulerId = window.setInterval(() => this.schedulerTick(), 80);
      this.progressFrame = window.requestAnimationFrame(() => this.progressTick());
    }

    this.emitProgress();
  }

  async stop() {
    this.isPlaying = false;
    this.pausedAt = 0;
    this.clearScheduler();
    this.stopProgressLoop();
    this.stopVoices();

    if (this.audioContext && this.audioContext.state === "running") {
      await this.audioContext.suspend();
    }

    this.emitProgress();
  }

  destroy() {
    this.clearScheduler();
    this.stopProgressLoop();
    this.stopVoices();
    this.audioContext?.close();
    this.audioContext = null;
  }

  getFrequencyData() {
    if (!this.analyser || !this.frequencyArray) {
      return [];
    }

    this.analyser.getByteFrequencyData(this.frequencyArray);
    return Array.from(this.frequencyArray);
  }

  getCurrentTime() {
    if (!this.audioContext) {
      return this.pausedAt;
    }

    if (!this.isPlaying) {
      return this.pausedAt;
    }

    return clamp(this.audioContext.currentTime - this.startTime, 0, this.songDuration);
  }

  progressTick() {
    this.emitProgress();

    if (this.isPlaying) {
      const currentTime = this.getCurrentTime();

      if (currentTime >= this.songDuration - 0.03) {
        this.isPlaying = false;
        this.pausedAt = 0;
        this.clearScheduler();
        this.stopVoices();
        this.emitProgress();
        this.onEnded?.();
        return;
      }

      this.progressFrame = window.requestAnimationFrame(() => this.progressTick());
    }
  }

  emitProgress() {
    this.onProgress?.({
      currentTime: this.getCurrentTime(),
      duration: this.songDuration,
      isPlaying: this.isPlaying,
    });
  }

  clearScheduler() {
    if (this.schedulerId) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = null;
    }
  }

  stopProgressLoop() {
    if (this.progressFrame) {
      window.cancelAnimationFrame(this.progressFrame);
      this.progressFrame = null;
    }
  }

  stopVoices() {
    if (!this.audioContext) {
      return;
    }

    this.activeNodes.forEach((node) => {
      try {
        if (typeof node.stop === "function") {
          node.stop(this.audioContext.currentTime);
        }
      } catch (_error) {
        // Ignore nodes that have already stopped.
      }

      try {
        node.disconnect?.();
      } catch (_error) {
        // Ignore disconnect issues during cleanup.
      }
    });

    this.activeNodes.clear();
  }

  createSongProfile(song) {
    const seed = hashString(song.id + song.artist + song.genre);
    const random = createRng(seed);
    const config = MOOD_CONFIG[song.mood] ?? MOOD_CONFIG.Midnight;
    const root = 45 + (seed % 10);
    const melodyPattern = Array.from({ length: 16 }, (_, index) => {
      if (index % 4 === 3 && random() > 0.42) {
        return null;
      }

      return Math.floor(random() * 7) + (index % 8 === 0 ? 7 : 0);
    });

    const leadOctave = song.language === "Japanese" || song.language === "Korean" ? 2 : 1;
    const padSpread = 1 + Math.floor(random() * 2);

    return {
      ...config,
      root,
      melodyPattern,
      bassPattern: [0, 0, 3, 5],
      leadOctave,
      padSpread,
      accentPulse: random() > 0.5 ? 2 : 3,
      sparklePattern: Array.from({ length: 16 }, (_, index) => random() > 0.58 || index % 4 === 0),
    };
  }

  stepDuration() {
    return 60 / this.songProfile.tempo / 4;
  }

  schedulerTick() {
    if (!this.audioContext || !this.songProfile) {
      return;
    }

    const scheduleUntil = this.audioContext.currentTime + 0.35;

    while (
      this.nextStepTime < scheduleUntil &&
      this.nextStepIndex * this.stepDuration() < this.songDuration + this.stepDuration()
    ) {
      this.scheduleStep(this.nextStepIndex, this.nextStepTime);
      this.nextStepIndex += 1;
      this.nextStepTime += this.stepDuration();
    }
  }

  scheduleStep(stepIndex, time) {
    const { progression, scale, root, melodyPattern, bassPattern, leadOctave, padSpread, sparklePattern, accentPulse } =
      this.songProfile;
    const beatIndex = Math.floor(stepIndex / 4);
    const barIndex = Math.floor(stepIndex / 16);
    const chordDegree = progression[barIndex % progression.length];
    const chordRoot = scaleStepToMidi(root, scale, chordDegree, 0);

    if (stepIndex % 16 === 0) {
      this.schedulePadChord(chordRoot, time, this.stepDuration() * 15.5, padSpread);
    }

    if (stepIndex % 4 === 0) {
      const bassDegree = bassPattern[beatIndex % bassPattern.length];
      this.scheduleBass(scaleStepToMidi(root - 12, scale, bassDegree, 0), time, this.stepDuration() * 3.2);
    }

    if (stepIndex % 2 === 0) {
      this.schedulePulseTick(time, stepIndex % accentPulse === 0 ? 0.16 : 0.1);
    }

    if (sparklePattern[stepIndex % sparklePattern.length]) {
      this.scheduleSparkle(time + this.stepDuration() * 0.2, 0.055);
    }

    const melodyDegree = melodyPattern[stepIndex % melodyPattern.length];
    if (melodyDegree !== null) {
      const leadNote = scaleStepToMidi(chordRoot + 12, scale, melodyDegree % 7, leadOctave);
      const noteLength = stepIndex % 8 === 6 ? this.stepDuration() * 2.2 : this.stepDuration() * 1.3;
      this.scheduleLead(leadNote, time, noteLength, stepIndex % 8 === 0 ? 0.22 : 0.16);
    }
  }

  schedulePadChord(rootMidi, startTime, duration, spread) {
    const chordIntervals = [0, 2, 4].map((degree) => scaleStepToMidi(rootMidi, this.songProfile.scale, degree, 0));
    chordIntervals.push(scaleStepToMidi(rootMidi, this.songProfile.scale, 6, 0));

    chordIntervals.forEach((note, index) => {
      this.scheduleOscillatorVoice({
        frequency: midiToFrequency(note + index * spread),
        startTime,
        duration,
        waveform: index % 2 === 0 ? "sawtooth" : "triangle",
        volume: 0.03,
        attack: 0.18,
        release: 0.85,
        filterFrequency: 1200,
        detune: index * 4,
      });
    });
  }

  scheduleBass(midi, startTime, duration) {
    this.scheduleOscillatorVoice({
      frequency: midiToFrequency(midi),
      startTime,
      duration,
      waveform: "sine",
      volume: 0.16,
      attack: 0.01,
      release: 0.12,
      filterFrequency: 180,
      detune: 0,
    });
  }

  scheduleLead(midi, startTime, duration, volume) {
    this.scheduleOscillatorVoice({
      frequency: midiToFrequency(midi),
      startTime,
      duration,
      waveform: "triangle",
      volume,
      attack: 0.01,
      release: 0.15,
      filterFrequency: 2800,
      detune: 3,
    });

    this.scheduleOscillatorVoice({
      frequency: midiToFrequency(midi) * 2,
      startTime,
      duration: duration * 0.6,
      waveform: "sine",
      volume: volume * 0.18,
      attack: 0.01,
      release: 0.12,
      filterFrequency: 3400,
      detune: -4,
    });
  }

  schedulePulseTick(startTime, volume) {
    this.scheduleNoiseBurst({
      startTime,
      duration: 0.075,
      volume,
      filterFrequency: 4200,
    });
  }

  scheduleSparkle(startTime, volume) {
    this.scheduleOscillatorVoice({
      frequency: 1900 + ((this.songProfile.root % 6) * 140),
      startTime,
      duration: 0.08,
      waveform: "square",
      volume,
      attack: 0.002,
      release: 0.05,
      filterFrequency: 5200,
      detune: 6,
    });
  }

  scheduleOscillatorVoice({
    frequency,
    startTime,
    duration,
    waveform,
    volume,
    attack,
    release,
    filterFrequency,
    detune,
  }) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.detune.setValueAtTime(detune, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFrequency, startTime);
    filter.Q.value = 0.4;

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.compressor);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + release + 0.03);
    oscillator.onended = () => {
      this.activeNodes.delete(oscillator);
      try {
        oscillator.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch (_error) {
        // Ignore cleanup issues after node completion.
      }
    };

    this.activeNodes.add(oscillator);
  }

  scheduleNoiseBurst({ startTime, duration, volume, filterFrequency }) {
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    }

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.setValueAtTime(filterFrequency, startTime);
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.compressor);

    source.start(startTime);
    source.stop(startTime + duration + 0.02);
    source.onended = () => {
      this.activeNodes.delete(source);
      try {
        source.disconnect();
        filter.disconnect();
        gainNode.disconnect();
      } catch (_error) {
        // Ignore cleanup issues after node completion.
      }
    };

    this.activeNodes.add(source);
  }
}
