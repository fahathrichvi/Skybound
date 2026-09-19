import type { ObjectSnapshot } from '../objects/ObjectProgress';

export const SCORE_VALUES = {
  shard: 100,
  gem: 1000,
  enemy: 200,
  completion: 2000,
  heart: 500,
  timePerSecond: 10,
  targetSeconds: 180,
} as const;

export interface RunSnapshot { readonly score: number; readonly elapsedMs: number }
export interface LevelResult extends RunSnapshot {
  readonly levelId: string;
  readonly shards: number; readonly totalShards: number;
  readonly gems: number; readonly totalGems: number;
  readonly enemiesDefeated: number; readonly totalEnemies: number;
  readonly hearts: number; readonly deaths: number;
  readonly completionBonus: number; readonly healthBonus: number; readonly timeBonus: number;
}

/** Pure score and elapsed-time state. Scene time is supplied by Phaser so pauses never count. */
export class RunProgress {
  private score = 0;
  private startedAt = 0;
  private previousObjects?: Pick<ObjectSnapshot, 'shards' | 'gems'>;
  private finished = false;

  start(now: number) { this.score = 0; this.startedAt = now; this.previousObjects = undefined; this.finished = false; }

  trackObjects(snapshot: ObjectSnapshot) {
    const previous = this.previousObjects;
    this.previousObjects = { shards: snapshot.shards, gems: snapshot.gems };
    if (!previous) return 0;
    const gained = Math.max(0, snapshot.shards - previous.shards) * SCORE_VALUES.shard + Math.max(0, snapshot.gems - previous.gems) * SCORE_VALUES.gem;
    this.score += gained;
    return gained;
  }

  defeatEnemy() { this.score += SCORE_VALUES.enemy; return SCORE_VALUES.enemy; }
  snapshot(now: number): RunSnapshot { return { score: this.score, elapsedMs: Math.max(0, now - this.startedAt) }; }

  complete(now: number, data: Omit<LevelResult, keyof RunSnapshot | 'completionBonus' | 'healthBonus' | 'timeBonus'>): LevelResult {
    const elapsedMs = Math.max(0, now - this.startedAt);
    const completionBonus = this.finished ? 0 : SCORE_VALUES.completion;
    const healthBonus = this.finished ? 0 : data.hearts * SCORE_VALUES.heart;
    const remainingSeconds = Math.max(0, SCORE_VALUES.targetSeconds - Math.floor(elapsedMs / 1000));
    const timeBonus = this.finished ? 0 : remainingSeconds * SCORE_VALUES.timePerSecond;
    if (!this.finished) { this.score += completionBonus + healthBonus + timeBonus; this.finished = true; }
    return { ...data, score: this.score, elapsedMs, completionBonus, healthBonus, timeBonus };
  }
}
