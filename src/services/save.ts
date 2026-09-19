import type { LevelResult } from '../game/systems/RunProgress';

export const SAVE_KEY = 'skybound.save.v1';
export interface LevelRecord {
  readonly completed: boolean; readonly completions: number; readonly bestScore: number;
  readonly bestTimeMs: number; readonly gems: number; readonly totalGems: number;
}
export interface GameSave { readonly version: 1; readonly totalScore: number; readonly levels: Readonly<Record<string, LevelRecord>> }
interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }

export const EMPTY_SAVE: GameSave = { version: 1, totalScore: 0, levels: {} };
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function validateSave(value: unknown): GameSave {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_SAVE;
  const data = value as Record<string, unknown>;
  if (data.version !== 1 || !finite(data.totalScore) || !data.levels || typeof data.levels !== 'object' || Array.isArray(data.levels)) return EMPTY_SAVE;
  const levels: Record<string, LevelRecord> = {};
  for (const [id, candidate] of Object.entries(data.levels as Record<string, unknown>)) {
    if (!candidate || typeof candidate !== 'object' || !id.trim()) continue;
    const record = candidate as Record<string, unknown>;
    if (record.completed !== true || !Number.isInteger(record.completions) || !finite(record.completions) || !finite(record.bestScore) || !finite(record.bestTimeMs) || !Number.isInteger(record.gems) || !finite(record.gems) || !Number.isInteger(record.totalGems) || !finite(record.totalGems) || record.gems > record.totalGems) continue;
    levels[id] = { completed: true, completions: record.completions as number, bestScore: record.bestScore, bestTimeMs: record.bestTimeMs, gems: record.gems as number, totalGems: record.totalGems as number };
  }
  return { version: 1, totalScore: data.totalScore, levels };
}

export class SaveService {
  constructor(private storage: StorageLike | undefined = typeof localStorage === 'undefined' ? undefined : localStorage) {}
  loadGame(): GameSave {
    try { const raw = this.storage?.getItem(SAVE_KEY); return raw ? validateSave(JSON.parse(raw)) : EMPTY_SAVE; }
    catch { return EMPTY_SAVE; }
  }
  saveGame(save: GameSave) { try { this.storage?.setItem(SAVE_KEY, JSON.stringify(validateSave(save))); return Boolean(this.storage); } catch { return false; } }
  recordCompletion(result: LevelResult) {
    const save = this.loadGame(), previous = save.levels[result.levelId];
    const newBest = !previous || result.score > previous.bestScore;
    const record: LevelRecord = { completed: true, completions: (previous?.completions ?? 0) + 1,
      bestScore: Math.max(previous?.bestScore ?? 0, result.score), bestTimeMs: Math.min(previous?.bestTimeMs ?? Infinity, result.elapsedMs),
      gems: Math.max(previous?.gems ?? 0, result.gems), totalGems: result.totalGems };
    const next: GameSave = { version: 1, totalScore: save.totalScore + result.score, levels: { ...save.levels, [result.levelId]: record } };
    return { save: next, record, persisted: this.saveGame(next), newBest };
  }
  resetSave() { try { this.storage?.removeItem(SAVE_KEY); return Boolean(this.storage); } catch { return false; } }
  exportSave() { return JSON.stringify(this.loadGame()); }
  importSave(serialized: string) { try { const parsed = validateSave(JSON.parse(serialized)); return { save: parsed, persisted: this.saveGame(parsed) }; } catch { return { save: EMPTY_SAVE, persisted: false }; } }
}
