import Phaser from 'phaser';
import { GameBridge } from '../bridge';
export class PreloadScene extends Phaser.Scene {
  constructor(private bridge: GameBridge, private target = 'Level') { super('Preload'); }
  preload() {
    this.cameras.main.setBackgroundColor('#173b36');
    this.add.text(640, 314, 'GATHERING A LITTLE WONDER', { fontFamily: 'sans-serif', fontSize: '18px', color: '#e4edcf', letterSpacing: 4 }).setOrigin(.5);
    const bar = this.add.rectangle(440, 369, 0, 4, 0xc4e994).setOrigin(0);
    this.add.rectangle(640, 371, 400, 4, 0xffffff, .1).setDepth(-1);
    this.load.on('progress', (progress: number) => { bar.width = 400 * progress; this.bridge.emit({ type: 'loading', progress }); });
    this.load.on('loaderror', () => this.bridge.emit({ type: 'error', message: 'The landscape could not load. Showing a simple fallback sky.' }));
    this.load.svg('valley', `${import.meta.env.BASE_URL}assets/valley.svg`, { width: 1600, height: 1000 });
  }
  create() { this.scene.start(this.target); }
}
