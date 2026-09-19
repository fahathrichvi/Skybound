import { describe, expect, it } from 'vitest';
import { LEVEL_1 } from '../levels/world1/level1';
import { PRACTICE_LEVEL } from '../levels/practice';
import { buildTileData, canLandOnOneWay, regionAt, resolveLevel, validateLevel } from './levelData';

describe('level data', () => {
  it('accepts both the authored trail and original controller course', () => {
    expect(() => validateLevel(LEVEL_1)).not.toThrow();
    expect(() => validateLevel(PRACTICE_LEVEL)).not.toThrow();
  });
  it('rejects malformed, unsupported and out-of-bounds geometry', () => {
    const invalid = [null, {}, { ...LEVEL_1, version: 2 }, { ...LEVEL_1, width: Infinity },
      { ...LEVEL_1, terrain: [{ x: 191, y: 30, width: 2, height: 3, surface: 'grass' }] },
      { ...LEVEL_1, platforms: [{ x: -1, y: 100, width: 100, height: 10, kind: 'one-way' }] },
      { ...LEVEL_1, terrain: [{ x: .5, y: 30, width: 1, height: 3, surface: 'grass' }] },
      { ...LEVEL_1, spawn: { x: 190, y: 1000 } }, { ...LEVEL_1, regions: [] },
      { ...LEVEL_1, regions: [{ from: 32, to: 6144, name: 'Gap' }] },
      { ...LEVEL_1, fallLimit: 900 }, { ...LEVEL_1, signs: [{ x: 4, y: 8, title: '', text: 'Empty title' }] }];
    for (const value of invalid) expect(() => validateLevel(value)).toThrow();
  });
  it('recovers to a validated practice course when a definition fails', () => {
    expect(resolveLevel({ invalid: true }, PRACTICE_LEVEL)).toMatchObject({ level: PRACTICE_LEVEL, warning: expect.stringContaining('movement practice') });
    expect(resolveLevel(LEVEL_1, PRACTICE_LEVEL)).toEqual({ level: LEVEL_1 });
  });
  it('builds continuous terrain, deliberate gaps and the sheltered route', () => {
    const tiles = buildTileData(LEVEL_1);
    expect(tiles).toHaveLength(40); expect(tiles.every(row => row.length === 192)).toBe(true);
    expect(tiles[30].slice(0, 48).every(tile => tile === 0)).toBe(true);
    expect(tiles[31][10]).toBe(1);
    expect(tiles.slice(30).every(row => row.slice(72, 76).every(tile => tile === -1))).toBe(true);
    expect(tiles[25][105]).toBe(0); expect(tiles[29][105]).toBe(-1); expect(tiles[34][105]).toBe(2);
    expect(buildTileData(PRACTICE_LEVEL).flat().every(tile => tile === -1)).toBe(true);
  });
  it('maps exact region edges and world boundaries consistently', () => {
    expect(regionAt(LEVEL_1, -1).name).toBe('Firstlight Meadow');
    expect(regionAt(LEVEL_1, 1535).name).toBe('Firstlight Meadow');
    expect(regionAt(LEVEL_1, 1536).name).toBe('Fernwood Rise');
    expect(regionAt(LEVEL_1, 6144).name).toBe("The Trail's Edge");
  });
});
describe('one-way ledges', () => {
  it('supports standing and descending from above but never catches a rising player', () => {
    expect(canLandOnOneWay(864, 0, 864)).toBe(true);
    expect(canLandOnOneWay(854, 350, 864)).toBe(true);
    expect(canLandOnOneWay(864, -500, 864)).toBe(false);
  });
  it('does not push someone already underneath onto the platform', () => {
    expect(canLandOnOneWay(900, 50, 864)).toBe(false);
    expect(canLandOnOneWay(866.1, 400, 864)).toBe(false);
  });
});
