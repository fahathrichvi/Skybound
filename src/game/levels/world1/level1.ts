import type { LevelConfig } from '../types';

/** Stage 3 terrain pass. Collectibles, enemies, checkpoints and exit logic follow later. */
export const LEVEL_1: LevelConfig = {
  version: 1, id: '1-1', name: 'The Verdant Trail', theme: 'emerald',
  width: 6144, height: 1280, tileSize: 32, spawn: { x: 192, y: 960 }, fallLimit: 1220,
  terrain: [
    { x: 0, y: 30, width: 48, height: 10, surface: 'grass' },
    { x: 48, y: 28, width: 16, height: 12, surface: 'grass' },
    { x: 64, y: 30, width: 8, height: 10, surface: 'grass' },
    // First 128-pixel ravine: x = 2304..2432. It is visible well before takeoff.
    { x: 76, y: 30, width: 20, height: 10, surface: 'grass' },
    // Lower passage and its solid roof; upper path crosses on timber ledges.
    { x: 96, y: 34, width: 32, height: 6, surface: 'stone' },
    { x: 101, y: 25, width: 19, height: 3, surface: 'grass' },
    { x: 124, y: 32, width: 4, height: 2, surface: 'stone' },
    // Second ravine: x = 4096..4224, with a broad, visible landing.
    { x: 132, y: 30, width: 12, height: 10, surface: 'grass' },
    { x: 144, y: 28, width: 12, height: 12, surface: 'grass' },
    { x: 156, y: 30, width: 14, height: 10, surface: 'grass' },
    { x: 170, y: 29, width: 8, height: 11, surface: 'grass' },
    { x: 178, y: 28, width: 14, height: 12, surface: 'grass' },
  ],
  platforms: [
    { x: 640, y: 864, width: 224, height: 18, kind: 'one-way' },
    { x: 960, y: 768, width: 224, height: 18, kind: 'one-way' },
    { x: 1280, y: 672, width: 224, height: 18, kind: 'one-way' },
    { x: 1616, y: 736, width: 256, height: 18, kind: 'one-way' },
    { x: 1952, y: 800, width: 192, height: 18, kind: 'one-way' },
    { x: 2752, y: 864, width: 224, height: 18, kind: 'one-way' },
    { x: 3072, y: 800, width: 192, height: 18, kind: 'one-way' },
    { x: 3792, y: 896, width: 176, height: 18, kind: 'one-way' },
    { x: 4480, y: 800, width: 192, height: 18, kind: 'one-way' },
    { x: 4864, y: 784, width: 256, height: 18, kind: 'one-way' },
  ],
  signs: [
    { x: 145, y: 756, title: 'THE VERDANT TRAIL', text: 'A / D to move. Space to leap.\nFollow the meadow into the hills.' },
    { x: 630, y: 648, title: 'THE HIGH ROAD', text: 'Jump through timber ledges from below.\nLand on top, or follow the path beneath.' },
    { x: 1580, y: 570, title: 'FERNWOOD RISE', text: 'A little momentum goes a long way.\nHold Shift when crossing a wider gap.' },
    { x: 2070, y: 742, title: 'MIND THE RAVINE', text: 'Jump near the edge. Hold to travel farther.\nA missed leap returns you to the start.' },
    { x: 2780, y: 640, title: 'TWO WAYS THROUGH', text: 'Take the timber path above,\nor explore the quiet hollow below.' },
    { x: 3310, y: 958, title: 'MOSSROOT HOLLOW', text: 'A sheltered path under the stone.\nKeep right to climb back into the light.' },
    { x: 3850, y: 655, title: 'BACK TO THE SKY', text: 'Use the stone step, then leap the gap.\nThe meadow continues on the far side.' },
    { x: 4660, y: 646, title: 'SUNLIT TERRACES', text: 'There is always another way up.\nTry the ledges or stay on the grass.' },
    { x: 5690, y: 650, title: "THE TRAIL'S EDGE", text: 'You have reached the end of this terrain preview.\nExplore back, or press R to start again.' },
  ],
  regions: [
    { from: 0, to: 1536, name: 'Firstlight Meadow' },
    { from: 1536, to: 2720, name: 'Fernwood Rise' },
    { from: 2720, to: 4096, name: 'Mossroot Hollow', cave: { x: 3072, y: 880, width: 1024, height: 208 } },
    { from: 4096, to: 5504, name: 'Sunlit Terraces' },
    { from: 5504, to: 6144, name: "The Trail's Edge" },
  ],
};
