import { describe, expect, it } from 'vitest';
import { EMPTY_SAVE, SAVE_KEY, SaveService, validateSave } from './save';
import type { LevelResult } from '../game/systems/RunProgress';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const result = (score: number, gems = 2, elapsedMs = 90_000): LevelResult => ({ levelId: '1-1', score, elapsedMs, shards: 12, totalShards: 38, gems, totalGems: 3, enemiesDefeated: 2, totalEnemies: 6, hearts: 2, deaths: 1, completionBonus: 2000, healthBonus: 1000, timeBonus: 900 });

describe('SaveService', () => {
  it('falls back safely for corrupt or unsupported data', () => {
    expect(validateSave(null)).toBe(EMPTY_SAVE); expect(validateSave({ version: 2, totalScore: 5, levels: {} })).toBe(EMPTY_SAVE);
    const storage = new MemoryStorage(); storage.setItem(SAVE_KEY, '{bad'); expect(new SaveService(storage).loadGame()).toBe(EMPTY_SAVE);
  });
  it('keeps best level records and accumulates lifetime score', () => {
    const storage = new MemoryStorage(), service = new SaveService(storage);
    service.recordCompletion(result(4000, 2, 90_000));
    const second = service.recordCompletion(result(3500, 3, 80_000));
    expect(second.record).toEqual({ completed: true, completions: 2, bestScore: 4000, bestTimeMs: 80_000, gems: 3, totalGems: 3 });
    expect(second.save.totalScore).toBe(7500);
  });
  it('exports, imports and resets versioned saves', () => {
    const first = new SaveService(new MemoryStorage()); first.recordCompletion(result(3000));
    const storage = new MemoryStorage(), second = new SaveService(storage);
    expect(second.importSave(first.exportSave()).persisted).toBe(true);
    expect(second.loadGame().levels['1-1'].bestScore).toBe(3000);
    expect(second.resetSave()).toBe(true); expect(second.loadGame()).toBe(EMPTY_SAVE);
  });
});
