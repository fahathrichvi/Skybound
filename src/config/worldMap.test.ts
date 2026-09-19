import { describe, expect, it } from 'vitest';
import { EMERALD_VALLEY_STAGES, getStageMapState } from './worldMap';
import { EMPTY_SAVE } from '../services/save';

describe('Emerald Valley map progression', () => {
  it('starts with the Verdant Trail available', () => expect(getStageMapState(EMERALD_VALLEY_STAGES[0], EMPTY_SAVE)).toBe('available'));
  it('unlocks the following node after a completed level', () => {
    const save = { ...EMPTY_SAVE, levels: { '1-1': { completed: true as const, completions: 1, bestScore: 5000, bestTimeMs: 90000, gems: 2, totalGems: 3 } } };
    expect(getStageMapState(EMERALD_VALLEY_STAGES[1], save)).toBe('unlocked');
    expect(getStageMapState(EMERALD_VALLEY_STAGES[2], save)).toBe('locked');
  });
});
