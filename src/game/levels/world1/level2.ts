import { LEVEL_1 } from './level1';
import type { LevelConfig } from '../types';

/** World 1-2 reuses the valley's established terrain grammar with wind-current routes and a denser night patrol. */
export const LEVEL_2: LevelConfig = {
  ...LEVEL_1, id: '1-2', name: 'Moonlit Grove',
  signs: [
    { x: 145, y: 756, title: 'MOONLIT GROVE', text: 'The breeze carries a hidden route.\nLet it lift your jumps across the canopy.' },
    { x: 1600, y: 570, title: 'WHISPERWIND', text: 'Pale currents nudge Ari through the air.\nUse their lift, then steer for the ledges.' },
    { x: 3310, y: 958, title: 'SILVER ROOTS', text: 'Winglings gather where the grove is quiet.\nStomp from above, then keep moving.' },
    { x: 5690, y: 650, title: 'GROVE HEART', text: 'The moonlight opens the path ahead.' },
  ],
  regions: [
    { from: 0, to: 1536, name: 'Lantern Meadow' }, { from: 1536, to: 2720, name: 'Whisperwind Canopy' },
    { from: 2720, to: 4096, name: 'Silver Root Hollow', cave: { x: 3072, y: 880, width: 1024, height: 208 } },
    { from: 4096, to: 5504, name: 'Moonlit Terraces' }, { from: 5504, to: 6144, name: 'Grove Heart' },
  ],
  collectibles: LEVEL_1.collectibles.map(item => ({ ...item, id: `g-${item.id}` })),
  blocks: LEVEL_1.blocks.map(item => ({ ...item, id: `g-${item.id}` })),
  checkpoints: LEVEL_1.checkpoints.map(item => ({ ...item, id: `g-${item.id}` })),
  enemies: [
    { id: 'grove-blob-01', kind: 'blobling', x: 1450, y: 960, patrolFrom: 1380, patrolTo: 1540, speed: 64 },
    { id: 'grove-wing-01', kind: 'wingling', x: 1850, y: 620, patrolFrom: 1640, patrolTo: 2130, speed: 112, waveHeight: 70 },
    { id: 'grove-wing-02', kind: 'wingling', x: 2950, y: 780, patrolFrom: 2760, patrolTo: 3060, speed: 106, waveHeight: 64 },
    { id: 'grove-blob-02', kind: 'blobling', x: 3600, y: 1024, patrolFrom: 3400, patrolTo: 3740, speed: 92 },
    { id: 'grove-wing-03', kind: 'wingling', x: 4780, y: 690, patrolFrom: 4580, patrolTo: 5020, speed: 122, waveHeight: 72 },
    { id: 'grove-blob-03', kind: 'blobling', x: 5800, y: 896, patrolFrom: 5680, patrolTo: 5900, speed: 108 },
  ],
  windZones: [{ x: 500, y: 800, width: 700, height: 250, strength: 180 }, { x: 4550, y: 500, width: 620, height: 430, strength: 210 }],
  exit: { id: 'exit-1-2', x: 5968, y: 896 },
};
