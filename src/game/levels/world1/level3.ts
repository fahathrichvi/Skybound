import { LEVEL_1 } from './level1';
import type { LevelConfig } from '../types';

/** World 1-3 makes the canopy route more demanding with opposing gusts and tighter patrols. */
export const LEVEL_3: LevelConfig = {
  ...LEVEL_1, id: '1-3', name: 'Canopy Crossing',
  signs: [
    { x: 145, y: 756, title: 'CANOPY CROSSING', text: 'The highest branches are alive with wind.\nSprint, leap, then steer into each gust.' },
    { x: 2070, y: 742, title: 'CROSSCURRENT', text: 'One wind pushes you forward.\nThe next asks you to hold your ground.' },
    { x: 3850, y: 655, title: 'BRANCHLINE', text: 'Take the high platforms to avoid the thick patrol below.' },
    { x: 5690, y: 650, title: 'CANOPY CREST', text: "The Guardian's clearing waits beyond this trail." },
  ],
  regions: [
    { from: 0, to: 1536, name: 'Bramble Gate' }, { from: 1536, to: 2720, name: 'Crosscurrent Rise' },
    { from: 2720, to: 4096, name: 'Hollow Boughs', cave: { x: 3072, y: 880, width: 1024, height: 208 } },
    { from: 4096, to: 5504, name: 'Skybranch Run' }, { from: 5504, to: 6144, name: 'Canopy Crest' },
  ],
  collectibles: LEVEL_1.collectibles.map(item => ({ ...item, id: `c-${item.id}` })),
  blocks: LEVEL_1.blocks.map(item => ({ ...item, id: `c-${item.id}` })),
  checkpoints: LEVEL_1.checkpoints.map(item => ({ ...item, id: `c-${item.id}` })),
  enemies: [
    { id: 'canopy-wing-01', kind: 'wingling', x: 1320, y: 700, patrolFrom: 1140, patrolTo: 1530, speed: 122, waveHeight: 76 },
    { id: 'canopy-blob-01', kind: 'blobling', x: 1700, y: 896, patrolFrom: 1600, patrolTo: 1900, speed: 112 },
    { id: 'canopy-wing-02', kind: 'wingling', x: 2860, y: 760, patrolFrom: 2700, patrolTo: 3080, speed: 132, waveHeight: 80 },
    { id: 'canopy-blob-02', kind: 'blobling', x: 3460, y: 1024, patrolFrom: 3300, patrolTo: 3700, speed: 118 },
    { id: 'canopy-wing-03', kind: 'wingling', x: 4550, y: 690, patrolFrom: 4380, patrolTo: 4700, speed: 136, waveHeight: 80 },
    { id: 'canopy-wing-04', kind: 'wingling', x: 5080, y: 700, patrolFrom: 4900, patrolTo: 5290, speed: 128, waveHeight: 76 },
    { id: 'canopy-blob-03', kind: 'blobling', x: 5800, y: 896, patrolFrom: 5680, patrolTo: 5900, speed: 120 },
  ],
  windZones: [{ x: 1700, y: 480, width: 620, height: 440, strength: 240 }, { x: 4300, y: 480, width: 500, height: 450, strength: -180 }, { x: 4860, y: 440, width: 540, height: 500, strength: 250 }],
  exit: { id: 'exit-1-3', x: 5968, y: 896 },
};
