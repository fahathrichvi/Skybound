import Phaser from 'phaser';

export function createForestGuardianArt(scene: Phaser.Scene) {
  if (scene.textures.exists('forest-guardian')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x163c35, .35).fillEllipse(80, 148, 132, 18);
  g.fillStyle(0x5c3d29).fillRoundedRect(37, 44, 86, 95, 24);
  g.fillStyle(0x7c5436).fillRoundedRect(53, 22, 54, 82, 23);
  g.fillStyle(0x315f46).fillCircle(46, 35, 29).fillCircle(82, 20, 34).fillCircle(116, 38, 28);
  g.fillStyle(0x52865c).fillCircle(42, 29, 18).fillCircle(86, 13, 21).fillCircle(121, 32, 16);
  g.fillStyle(0xe5efb1).fillCircle(62, 77, 7).fillCircle(99, 77, 7);
  g.fillStyle(0x243a30).fillCircle(62, 78, 3).fillCircle(99, 78, 3);
  g.fillStyle(0xe1a853).fillTriangle(78, 90, 86, 90, 82, 98);
  g.fillStyle(0x443020).fillRoundedRect(18, 102, 24, 40, 10).fillRoundedRect(118, 102, 24, 40, 10);
  g.generateTexture('forest-guardian', 160, 156); g.destroy();
}
