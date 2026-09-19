import { describe, expect, it } from 'vitest';
import { RunProgress, SCORE_VALUES } from './RunProgress';
import type { ObjectSnapshot } from '../objects/ObjectProgress';

const objects = (shards: number, gems: number): ObjectSnapshot => ({ shards, totalShards: 38, gems, totalGems: 3, respawn: { x: 0, y: 0 }, complete: false });

describe('RunProgress', () => {
  it('awards only positive collectible deltas', () => {
    const run = new RunProgress(); run.start(100); run.trackObjects(objects(0, 0));
    expect(run.trackObjects(objects(3, 1))).toBe(3 * SCORE_VALUES.shard + SCORE_VALUES.gem);
    expect(run.trackObjects(objects(2, 0))).toBe(0);
    expect(run.snapshot(1100).score).toBe(1300);
  });

  it('adds enemy and completion bonuses exactly once', () => {
    const run = new RunProgress(); run.start(0); run.trackObjects(objects(0, 0)); run.defeatEnemy();
    const data = { levelId: '1-1', shards: 0, totalShards: 38, gems: 0, totalGems: 3, enemiesDefeated: 1, totalEnemies: 6, hearts: 2, deaths: 1 };
    const result = run.complete(60_000, data);
    expect(result).toMatchObject({ completionBonus: 2000, healthBonus: 1000, timeBonus: 1200, score: 4400, elapsedMs: 60_000 });
    expect(run.complete(61_000, data).score).toBe(4400);
  });

  it('does not count time before a restarted run', () => {
    const run = new RunProgress(); run.start(5000);
    expect(run.snapshot(6500)).toEqual({ score: 0, elapsedMs: 1500 });
  });
});
