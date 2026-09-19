import type { LevelConfig } from './types';
import { PRACTICE_LEVEL } from './practice';
import { LEVEL_1 } from './world1/level1';
import { LEVEL_2 } from './world1/level2';
import { LEVEL_3 } from './world1/level3';

/** Register additional definitions here; scenes and the world builder remain unchanged. */
export const LEVELS: Readonly<Record<string, LevelConfig>> = { practice: PRACTICE_LEVEL, '1-1': LEVEL_1, '1-2': LEVEL_2, '1-3': LEVEL_3 };
export function getLevelDefinition(id: string): LevelConfig | undefined { return Object.hasOwn(LEVELS, id) ? LEVELS[id] : undefined; }
