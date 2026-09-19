export type SoundCue = 'jump' | 'land' | 'shard' | 'gem' | 'checkpoint' | 'block' | 'enemy' | 'hit' | 'defeat' | 'complete' | 'menu';
export interface AudioSettings { masterVolume: number; musicVolume: number; sfxVolume: number }

const NOTES: Record<SoundCue, readonly [number, number, OscillatorType]> = {
  jump: [420, .07, 'triangle'], land: [150, .05, 'sine'], shard: [720, .08, 'sine'], gem: [980, .16, 'sine'],
  checkpoint: [520, .22, 'triangle'], block: [240, .1, 'square'], enemy: [270, .13, 'square'], hit: [130, .18, 'sawtooth'],
  defeat: [95, .28, 'sawtooth'], complete: [660, .32, 'triangle'], menu: [390, .06, 'triangle'],
};

/** Original Web Audio cues. Asset-backed audio can replace these calls without touching gameplay code. */
export class AudioManager {
  private context?: AudioContext;
  private musicTimer?: number;
  private settings: AudioSettings = { masterVolume: .7, musicVolume: .35, sfxVolume: .7 };

  setSettings(next: AudioSettings) { this.settings = next; }
  async unlock() {
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === 'suspended') await this.context.resume();
  }
  play(cue: SoundCue) {
    if (!this.context || this.context.state !== 'running') return;
    const [frequency, duration, type] = NOTES[cue];
    const oscillator = this.context.createOscillator(), gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    if (cue === 'complete' || cue === 'gem' || cue === 'checkpoint') oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.context.currentTime + duration);
    gain.gain.setValueAtTime(Math.max(.0001, this.settings.masterVolume * this.settings.sfxVolume * .1), this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination); oscillator.start(); oscillator.stop(this.context.currentTime + duration);
  }
  startMusic() {
    if (this.musicTimer || !this.context || this.context.state !== 'running') return;
    const phrase = [196, 247, 294, 247, 220, 262, 330, 294]; let step = 0;
    const playNote = () => {
      if (!this.context || this.context.state !== 'running') return;
      const oscillator = this.context.createOscillator(), gain = this.context.createGain(), now = this.context.currentTime;
      oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(phrase[step++ % phrase.length], now);
      gain.gain.setValueAtTime(Math.max(.0001, this.settings.masterVolume * this.settings.musicVolume * .045), now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .5); oscillator.connect(gain).connect(this.context.destination); oscillator.start(now); oscillator.stop(now + .52);
    };
    playNote(); this.musicTimer = window.setInterval(playNote, 620);
  }
  stopMusic() { if (this.musicTimer) window.clearInterval(this.musicTimer); this.musicTimer = undefined; }
  destroy() { this.stopMusic(); void this.context?.close(); this.context = undefined; }
}
