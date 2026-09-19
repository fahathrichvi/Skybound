import type { LevelConfig } from './types';
/** A safe controller test course, not World 1-1 or the Stage 3 level system. */
export const PRACTICE = {
  width: 4800, height: 1080, spawn: { x: 190, y: 880 },
  platforms: [
    { x: 0, y: 880, width: 4800, height: 200 },
    { x: 680, y: 785, width: 260, height: 26 },
    { x: 1080, y: 715, width: 240, height: 26 },
    { x: 1480, y: 635, width: 280, height: 26 },
    { x: 1870, y: 735, width: 250, height: 26 },
    { x: 2330, y: 760, width: 320, height: 30 },
    { x: 2900, y: 785, width: 230, height: 26 },
    { x: 3270, y: 715, width: 230, height: 26 },
    { x: 3640, y: 635, width: 320, height: 26 },
    { x: 4160, y: 755, width: 250, height: 26 },
  ],
  signs: [
    { x: 160, y: 700, title: 'A LITTLE COURAGE', text: 'A / D or ← / → to move\nHold Shift to find your stride' },
    { x: 715, y: 585, title: 'TAKE YOUR FIRST LEAP', text: 'Space / W / ↑ to jump\nTap for a hop. Hold to soar.' },
    { x: 1530, y: 440, title: 'TRUST YOUR FOOTING', text: 'A late jump can still catch an edge\nPress just before landing to leap again' },
    { x: 2350, y: 560, title: 'ROOM TO EXPERIMENT', text: 'Change direction in the air\nThe meadow below is always safe' },
    { x: 3660, y: 430, title: 'A LITTLE HIGHER', text: 'Find a rhythm between the ledges\nYour next adventure is taking shape' },
    { x: 4450, y: 680, title: 'THE SKY CAN WAIT', text: 'Practice at your own pace\nR to return to the start' },
  ],
} as const;

export const PRACTICE_LEVEL: LevelConfig = {
  version: 1, id: 'practice', name: 'Movement practice', theme: 'emerald', tileSize: 32,
  width: PRACTICE.width, height: PRACTICE.height, spawn: PRACTICE.spawn, fallLimit: 1060,
  terrain: [], platforms: PRACTICE.platforms.map(platform => ({ ...platform, kind: 'solid' })),
  signs: PRACTICE.signs, regions: [{ from: 0, to: PRACTICE.width, name: 'Practice Meadow' }],
};
