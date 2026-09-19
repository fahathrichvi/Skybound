import { LEVEL_1 } from './level1';
import type { LevelConfig } from '../types';

/** World 1 finale: a compact clearing that turns the familiar valley route into the Guardian's arena. */
export const BOSS_1: LevelConfig = {
  ...LEVEL_1, id: '1-B', name: 'Forest Guardian',
  signs: [
    { x: 145, y: 756, title: 'THE GUARDIAN CLEARING', text: 'The grove is restless. Follow the trail\nto the old heartwood at the valley’s edge.' },
    { x: 4660, y: 646, title: 'ROOTBOUND', text: 'Watch for the warning glow.\nLeap clear, then strike from above.' },
  ],
  regions: [{ from: 0, to: 3072, name: 'Guardian Approach' }, { from: 3072, to: 5120, name: 'Heartwood Passage', cave: { x: 3072, y: 880, width: 1024, height: 208 } }, { from: 5120, to: 6144, name: 'The Guardian Clearing' }],
  collectibles: LEVEL_1.collectibles.filter(item => item.x < 4300).map(item => ({ ...item, id: `b-${item.id}` })),
  blocks: LEVEL_1.blocks.filter(item => item.x < 4300).map(item => ({ ...item, id: `b-${item.id}` })),
  checkpoints: [{ id: 'b-c01', x: 4320, y: 960, respawn: { x: 4288, y: 960 } }],
  enemies: [{ id: 'guardian-wing', kind: 'wingling', x: 3500, y: 660, patrolFrom: 3260, patrolTo: 3700, speed: 105, waveHeight: 58 }],
  exit: undefined,
  boss: { id: 'forest-guardian', name: 'Forest Guardian', x: 5740, y: 896, maxHealth: 3 },
};
