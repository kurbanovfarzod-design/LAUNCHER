// Simple Web Audio API sound synthesizer for TV UI feedback

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playTick() {
    this.playSimple(600, 0.05, 'sine');
  }

  playPop() {
    this.playSimple(400, 0.1, 'square', 0.2);
  }

  playSuccess() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.playNote(523.25, now, 0.1); // C5
    this.playNote(659.25, now + 0.1, 0.1); // E5
    this.playNote(783.99, now + 0.2, 0.2); // G5
  }

  playError() {
    this.init();
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.playNote(150, now, 0.15, 'sawtooth');
    this.playNote(120, now + 0.15, 0.2, 'sawtooth');
  }

  private playNote(freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playSimple(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
    this.init();
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.playNote(freq, now, duration, type);
  }
}

export const sounds = new SoundManager();
