import type { LevelConfig } from './types';
import { PRACTICE_LEVEL } from './practice';
import { LEVEL_1 } from './world1/level1';

/** Register additional definitions here; scenes and the world builder remain unchanged. */
export const LEVELS: Readonly<Record<string, LevelConfig>> = { practice: PRACTICE_LEVEL, '1-1': LEVEL_1 };
export function getLevelDefinition(id: string): LevelConfig | undefined { return Object.hasOwn(LEVELS, id) ? LEVELS[id] : undefined; }
