import Phaser from 'phaser';
import type { PlayerState } from './PlayerMotor';

const frames: Record<PlayerState, number> = { idle: 4, run: 6, sprint: 6, jump: 1, fall: 1, land: 1 };
/** Original procedural animation frames. Replace textures without changing the controller. */
export function createPlayerArt(scene: Phaser.Scene) {
  if (scene.textures.exists('ari-idle-0')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  for (const [name, count] of Object.entries(frames)) {
    const state = name as PlayerState;
    for (let frame = 0; frame < count; frame++) {
      g.clear();
      const phase = frame / count * Math.PI * 2;
      const moving = state === 'run' || state === 'sprint';
      const air = state === 'jump' || state === 'fall';
      const stride = moving ? Math.sin(phase) * 8 : air ? 5 : 0;
      const bob = moving ? Math.abs(Math.cos(phase)) * -2 : state === 'idle' ? Math.sin(phase) : 0;
      // Boots and alternating legs.
      g.fillStyle(0x213d38).fillRoundedRect(23 + stride, 52 + bob, 10, air ? 13 : 17, 3);
      g.fillStyle(0x31594c).fillRoundedRect(34 - stride, 52 + bob, 10, 17, 3);
      g.fillStyle(0xd2b17a).fillRect(23 + stride, 66 + bob, 13, 4).fillRect(34 - stride, 66 + bob, 13, 4);
      // Backpack and teal cloak.
      g.fillStyle(0xa88048).fillRoundedRect(15, 32 + bob, 16, 23, 5);
      g.fillStyle(0x246c68).fillPoints([{ x: 26, y: 29 + bob }, { x: 42, y: 29 + bob }, { x: 49, y: 57 + bob }, { x: 20, y: 57 + bob }], true);
      g.fillStyle(0x45977b).fillTriangle(26, 33 + bob, 35, 55 + bob, 20, 56 + bob);
      // Expressive head, asymmetric cap and one visible eye.
      g.fillStyle(0xf0cc9a).fillRoundedRect(25, 12 + bob, 24, 24, 7);
      g.fillStyle(0x234e45).fillRoundedRect(20, 6 + bob, 28, 15, 7).fillRect(21, 17 + bob, 8, 10);
      g.fillStyle(0x37766a).fillTriangle(19, 14 + bob, 35, 1 + bob, 52, 18 + bob);
      g.fillStyle(0x213832).fillCircle(43, 24 + bob, 2.5);
      g.fillStyle(0xe4a870).fillCircle(47, 29 + bob, 2);
      // Saffron scarf trails behind Ari's facing direction.
      g.fillStyle(0xf0bf58).fillRoundedRect(24, 33 + bob, 24, 7, 2);
      const tail = moving ? Math.sin(phase) * 3 : 0;
      g.fillStyle(0xe6ad48).fillPoints([{ x: 26, y: 34 + bob }, { x: 10, y: 30 + tail }, { x: 2, y: 22 + tail }, { x: 5, y: 38 + tail }, { x: 26, y: 41 + bob }], true);
      g.fillStyle(0xefc995).fillRoundedRect(43, (air ? 32 : 43) + bob, 7, 10, 3);
      g.generateTexture(`ari-${state}-${frame}`, 64, 72);
    }
    scene.anims.create({ key: `ari-${state}`, frames: Array.from({ length: count }, (_, i) => ({ key: `ari-${state}-${i}` })), frameRate: state === 'sprint' ? 16 : movingRate(state), repeat: -1 });
  }
  g.clear().fillStyle(0xffffff).fillRect(0, 0, 32, 72).generateTexture('ari-body', 32, 72);
  g.destroy();
}
function movingRate(state: PlayerState) { return state === 'run' ? 11 : 4; }
