import { describe, expect, it } from 'vitest';
import { LEVEL_1 } from '../levels/world1/level1';
import { validateLevel } from '../world/levelData';
import { remixLevel } from './RunRemix';

describe('remixLevel', () => {
  it('keeps the authored route valid and produces repeatable fresh-run variation', () => {
    const first = remixLevel(LEVEL_1, 1);
    const again = remixLevel(LEVEL_1, 1);
    const next = remixLevel(LEVEL_1, 2);
    expect(first).toEqual(again);
    expect(first.terrain).toBe(LEVEL_1.terrain);
    expect(first.platforms).toBe(LEVEL_1.platforms);
    expect(() => validateLevel(first)).not.toThrow();
    expect(next).not.toEqual(first);
  });
});
