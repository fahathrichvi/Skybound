import Phaser from 'phaser';

/** Original procedural silhouettes for the Verdant Trail enemies. */
export function createEnemyArt(scene: Phaser.Scene) {
  if (scene.textures.exists('blobling-0')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  for (let frame = 0; frame < 2; frame++) {
    g.clear();
    const squash = frame ? 3 : 0;
    g.fillStyle(0x183d38, .28).fillEllipse(30, 43, 48, 10);
    g.fillStyle(0x7854a6).fillRoundedRect(6, 8 + squash, 48, 34 - squash, 16);
    g.fillStyle(0x9b72ca).fillEllipse(23, 17 + squash, 20, 13);
    g.fillStyle(0xd8f3bc).fillCircle(20, 25 + squash, 5).fillCircle(40, 25 + squash, 5);
    g.fillStyle(0x223c39).fillCircle(21, 26 + squash, 2).fillCircle(39, 26 + squash, 2);
    g.fillStyle(0xf0bf58).fillCircle(12, 40, 4).fillCircle(48, 40, 4);
    g.generateTexture(`blobling-${frame}`, 60, 48);
  }
  for (let frame = 0; frame < 2; frame++) {
    g.clear();
    const wing = frame ? 3 : -2;
    g.fillStyle(0x183d38, .2).fillEllipse(34, 51, 42, 8);
    g.fillStyle(0x78c4b1).fillTriangle(20, 25, 2, 8 + wing, 8, 36).fillTriangle(48, 25, 66, 8 + wing, 60, 36);
    g.fillStyle(0x3f756e).fillRoundedRect(18, 12, 32, 34, 14);
    g.fillStyle(0x61a596).fillEllipse(34, 18, 22, 15);
    g.fillStyle(0xe6f4d0).fillCircle(28, 28, 5).fillCircle(40, 28, 5);
    g.fillStyle(0x1d3734).fillCircle(29, 28, 2).fillCircle(39, 28, 2);
    g.fillStyle(0xf0bf58).fillTriangle(31, 35, 37, 35, 34, 40);
    g.generateTexture(`wingling-${frame}`, 68, 58);
  }
  g.clear();
  g.fillStyle(0x725599).fillEllipse(30, 35, 52, 15).fillStyle(0xd8f3bc).fillCircle(21, 33, 3).fillCircle(39, 33, 3);
  g.generateTexture('blobling-defeated', 60, 48);
  g.clear();
  g.fillStyle(0x3f756e).fillEllipse(34, 35, 48, 18).fillStyle(0xf0bf58).fillTriangle(31, 33, 37, 33, 34, 38);
  g.generateTexture('wingling-defeated', 68, 58);
  g.destroy();
  scene.anims.create({ key: 'blobling-patrol', frames: [{ key: 'blobling-0' }, { key: 'blobling-1' }], frameRate: 4, repeat: -1 });
  scene.anims.create({ key: 'wingling-patrol', frames: [{ key: 'wingling-0' }, { key: 'wingling-1' }], frameRate: 7, repeat: -1 });
}
