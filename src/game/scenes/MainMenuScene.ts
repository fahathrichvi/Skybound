import Phaser from 'phaser';
import { GameBridge } from '../bridge';
export class MainMenuScene extends Phaser.Scene {
  constructor(private bridge: GameBridge, private reducedMotion: boolean) { super('MainMenu'); }
  create() {
    this.cameras.main.setBackgroundColor('#99c6b5');
    if (this.textures.exists('valley')) this.add.image(640, 360, 'valley').setDisplaySize(1280, 800);
    if (!this.reducedMotion) {
      const graphics = this.make.graphics({ x: 0, y: 0 });
      graphics.fillStyle(0xfff5bf).fillCircle(4, 4, 4).generateTexture('mote', 8, 8).destroy();
      this.add.particles(0, 0, 'mote', { x: { min: 0, max: 1280 }, y: { min: 160, max: 720 }, lifespan: 6500, speedY: { min: -15, max: -40 }, speedX: { min: -8, max: 8 }, scale: { start: .6, end: 0 }, alpha: { start: .65, end: 0 }, frequency: 280, maxParticles: 30 });
      this.cameras.main.fadeIn(650, 20, 46, 41);
    }
    this.bridge.emit({ type: 'ready' });
  }
}
