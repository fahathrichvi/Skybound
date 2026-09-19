import Phaser from 'phaser';
import type { LevelConfig } from '../levels/types';
import { buildTileData } from './levelData';

export class ParallaxWorld {
  readonly layers: Phaser.GameObjects.Graphics[] = [];
  private ambience: Phaser.GameObjects.Particles.ParticleEmitter;
  constructor(scene: Phaser.Scene, level: LevelConfig, reducedMotion: boolean) {
    scene.cameras.main.setBackgroundColor('#c4dcd0');
    const sky = scene.add.graphics().setScrollFactor(0);
    sky.fillStyle(0xe9edc6, .8).fillCircle(1000, 140, 58);
    sky.fillStyle(0xf6f3da, .65);
    for (const c of [{ x: 230, y: 120 }, { x: 660, y: 210 }, { x: 1170, y: 290 }]) sky.fillEllipse(c.x, c.y, 140, 30).fillEllipse(c.x - 22, c.y - 12, 70, 45);
    const far = scene.add.graphics().setScrollFactor(.15, .12);
    far.fillStyle(0x8fb5a1, .45);
    for (let x = -300; x < 1600 + level.width * .15; x += 370) far.fillTriangle(x, 650, x + 230, 240 + Math.sin(x) * 40, x + 510, 650);
    const hills = scene.add.graphics().setScrollFactor(.3, .2);
    hills.fillStyle(0x7eaa8f, .55);
    for (let x = -200; x < 1700 + level.width * .3; x += 420) hills.fillEllipse(x, 700, 840, 430);
    const trees = scene.add.graphics().setScrollFactor(.55, .4);
    for (let x = 70; x < 1500 + level.width * .55; x += 340) {
      const y = 730 + Math.sin(x) * 35;
      trees.fillStyle(0x719783, .5).fillRect(x, y - 120, 12, 180);
      trees.fillStyle(0x699a80, .6).fillCircle(x - 24, y - 115, 55).fillCircle(x + 23, y - 145, 63).fillCircle(x + 52, y - 105, 44);
    }
    this.layers.push(sky, far, hills, trees);
    const plants = scene.add.graphics().setDepth(4);
    const groundDetails = scene.add.graphics().setDepth(6);
    const data = buildTileData(level);
    for (let row = 0; row < data.length; row++) for (let col = 0; col < data[row].length; col++) {
      if (data[row][col] !== 0 || (row > 0 && data[row - 1][col] !== -1)) continue;
      const x = col * 32 + 15, y = row * 32;
      if (col % 3 === 0) {
        groundDetails.lineStyle(2, 0x55875d).lineBetween(x, y, x + 3, y - 13).lineBetween(x + 2, y, x + 10, y - 9);
        groundDetails.fillStyle(col % 2 ? 0xe0b9d5 : 0xf0d881).fillCircle(x + 3, y - 14, 3);
      }
      if (col % 19 === 8) {
        plants.fillStyle(0x658666).fillRoundedRect(x, y - 130, 17, 134, 7);
        plants.fillStyle(0x4e8867).fillCircle(x - 31, y - 140, 50).fillCircle(x + 18, y - 172, 57).fillCircle(x + 56, y - 126, 46);
        plants.fillStyle(0x86ad78, .8).fillEllipse(x + 8, y - 191, 80, 37).fillEllipse(x - 39, y - 153, 53, 27);
      }
      if (col % 11 === 4) plants.fillStyle(0x7d9e6b).fillEllipse(x, y, 72, 28).fillEllipse(x + 22, y - 6, 48, 31);
    }
    for (const region of level.regions.filter(region => region.cave)) {
      const bounds = region.cave!;
      const left = bounds.x, width = bounds.width, floor = bounds.y + bounds.height;
      const cave = scene.add.graphics().setDepth(3);
      cave.fillStyle(0x25483f).fillRoundedRect(left, bounds.y, width, bounds.height, 48);
      for (let x = left + 50; x < left + width; x += 110) {
        cave.fillStyle(0x466950).fillEllipse(x, bounds.y + 45, 65, 55);
        cave.fillStyle(0x97cda5, .12).fillCircle(x, floor - 38, 25);
        cave.fillStyle(0x91b88e).fillRect(x, floor - 34, 4, 20);
        cave.fillStyle(0xb5d4a1).fillEllipse(x + 2, floor - 35, 20, 10);
      }
    }
    for (const sign of level.signs) {
      const inCave = level.regions.some(region => region.cave && sign.x >= region.cave.x && sign.x < region.cave.x + region.cave.width && sign.y >= region.cave.y);
      scene.add.text(sign.x, sign.y, sign.title, { fontFamily: 'sans-serif', fontSize: '14px', color: inCave ? '#d7e9b4' : '#244d43', fontStyle: 'bold', letterSpacing: 2 }).setDepth(7);
      scene.add.text(sign.x, sign.y + 28, sign.text, { fontFamily: 'sans-serif', fontSize: '16px', color: inCave ? '#c1d5b8' : '#315b4c', lineSpacing: 9 }).setDepth(7);
    }
    if (!scene.textures.exists('mote')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffce).fillCircle(3, 3, 3).generateTexture('mote', 6, 6).destroy();
    }
    this.ambience = scene.add.particles(0, 0, 'mote', { x: { min: 0, max: 1280 }, y: { min: 200, max: 720 }, lifespan: 5500, speedY: -18, speedX: 7, alpha: { start: .6, end: 0 }, scale: { start: .6, end: 0 }, frequency: 350, maxParticles: 24 }).setScrollFactor(0).setDepth(10);
    this.setReducedMotion(reducedMotion);
  }
  setReducedMotion(reduced: boolean) { if (reduced) this.ambience.stop(true); else this.ambience.start(); }
}
