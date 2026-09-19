import Phaser from 'phaser';

export function createObjectArt(scene: Phaser.Scene) {
  if (scene.textures.exists('star-shard')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0xffef9a).fillPoints([{ x: 14, y: 1 }, { x: 25, y: 14 }, { x: 15, y: 31 }, { x: 3, y: 17 }], true);
  g.fillStyle(0xfff8c9).fillTriangle(14, 1, 15, 20, 25, 14).fillStyle(0xd8bd5b).fillTriangle(3, 17, 15, 20, 15, 31);
  g.generateTexture('star-shard', 28, 32).clear();
  g.fillStyle(0xcbb2ff).fillPoints([{ x: 18, y: 1 }, { x: 34, y: 14 }, { x: 28, y: 38 }, { x: 8, y: 38 }, { x: 2, y: 14 }], true);
  g.fillStyle(0xf0e3ff).fillTriangle(18, 1, 18, 25, 34, 14).fillStyle(0x8d6ac7).fillTriangle(2, 14, 18, 25, 8, 38);
  g.generateTexture('crystal-gem', 36, 40).clear();
  drawBlock(g, 0x6e507e, 0xc8a7e1, true); g.generateTexture('mystery-crystal', 56, 56).clear();
  drawBlock(g, 0x785b42, 0xd0a66f, false); g.generateTexture('breakable-block', 56, 56).clear();
  drawBlock(g, 0x43584f, 0x67766b, false); g.generateTexture('used-crystal', 56, 56).clear();
  drawCheckpoint(g, false); g.generateTexture('checkpoint-off', 52, 100).clear();
  drawCheckpoint(g, true); g.generateTexture('checkpoint-on', 52, 100).clear();
  drawPortal(g); g.generateTexture('exit-portal', 92, 128).clear();
  g.fillStyle(0xfff1a0).fillCircle(4, 4, 4).generateTexture('object-spark', 8, 8).destroy();
}
function drawBlock(g: Phaser.GameObjects.Graphics, base: number, edge: number, mystery: boolean) {
  g.fillStyle(0x203f38, .25).fillRoundedRect(3, 5, 50, 50, 10);
  g.fillStyle(base).fillRoundedRect(1, 1, 50, 50, 9);
  g.lineStyle(3, edge).strokeRoundedRect(3, 3, 46, 46, 7);
  g.lineStyle(2, edge, .55).lineBetween(7, 18, 45, 18).lineBetween(18, 6, 18, 46);
  if (mystery) {
    g.fillStyle(0xf7e79a).fillPoints([{ x: 26, y: 9 }, { x: 38, y: 20 }, { x: 27, y: 40 }, { x: 14, y: 23 }], true);
    g.fillStyle(0xffffff, .65).fillTriangle(26, 9, 27, 28, 38, 20);
  } else {
    g.lineStyle(3, edge, .75).lineBetween(5, 42, 19, 28).lineBetween(19, 28, 28, 37).lineBetween(28, 37, 46, 17);
  }
}
function drawCheckpoint(g: Phaser.GameObjects.Graphics, active: boolean) {
  g.fillStyle(0x2e4a40).fillRoundedRect(22, 45, 8, 53, 3).fillEllipse(26, 96, 40, 7);
  g.fillStyle(active ? 0xd9f29a : 0x769180).fillPoints([{ x: 26, y: 1 }, { x: 48, y: 29 }, { x: 29, y: 62 }, { x: 5, y: 33 }], true);
  g.fillStyle(active ? 0xffffd2 : 0x9bafa1).fillTriangle(26, 1, 29, 39, 48, 29);
  g.lineStyle(2, active ? 0xf5ffc7 : 0x526d60).strokePoints([{ x: 26, y: 1 }, { x: 48, y: 29 }, { x: 29, y: 62 }, { x: 5, y: 33 }], true);
}
function drawPortal(g: Phaser.GameObjects.Graphics) {
  g.lineStyle(12, 0x493b64).strokeEllipse(46, 64, 66, 112);
  g.lineStyle(6, 0xc4a6ed).strokeEllipse(46, 64, 58, 103);
  g.fillStyle(0x9f81d2, .35).fillEllipse(46, 64, 48, 92);
  g.fillStyle(0xf1ddff, .7).fillPoints([{ x: 46, y: 25 }, { x: 61, y: 62 }, { x: 46, y: 100 }, { x: 31, y: 64 }], true);
}
