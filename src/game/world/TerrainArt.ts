import Phaser from 'phaser';

/** A tiny original tileset, generated once and shared between level instances. */
export function createTerrainArt(scene: Phaser.Scene) {
  if (scene.textures.exists('emerald-tiles')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  for (let tile = 0; tile < 3; tile++) {
    const x = tile * 32;
    g.fillStyle(tile === 2 ? 0x416151 : 0x5b7050).fillRect(x, 0, 32, 32);
    g.fillStyle(tile === 2 ? 0x668474 : 0x77845a).fillRoundedRect(x + 4, 13, 13, 7, 3).fillRoundedRect(x + 22, 26, 8, 4, 2);
    g.fillStyle(0x304c3d, .35).fillRect(x + 5, 23, 3, 2).fillRect(x + 25, 9, 4, 2);
    if (tile === 0) {
      g.fillStyle(0x598b59).fillRect(x, 0, 32, 12);
      g.fillStyle(0xa5c96c).fillRect(x, 0, 32, 6);
      g.fillStyle(0xc7db89).fillRect(x, 0, 32, 2);
      g.fillStyle(0x598b59).fillTriangle(x + 2, 8, x + 5, 17, x + 9, 8).fillTriangle(x + 22, 9, x + 26, 14, x + 28, 9);
    }
  }
  g.generateTexture('emerald-tiles', 96, 32).destroy();
}
