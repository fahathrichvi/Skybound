import { describe, expect, it } from 'vitest';
import { LEVEL_1 } from '../levels/world1/level1';
import { ObjectProgress } from './ObjectProgress';

describe('level object progress', () => {
  it('counts authored and mystery rewards in the available shard total', () => {
    const progress = new ObjectProgress(LEVEL_1);
    expect(progress.snapshot()).toMatchObject({ shards: 0, totalShards: 38, gems: 0, totalGems: 3, complete: false });
  });
  it('collects every object id only once', () => {
    const progress = new ObjectProgress(LEVEL_1);
    expect(progress.collect('s01', 'shard')).toBe(true);
    expect(progress.collect('s01', 'shard')).toBe(false);
    expect(progress.collect('g01', 'gem')).toBe(true);
    expect(progress.collect('g01', 'gem')).toBe(false);
    expect(progress.snapshot()).toMatchObject({ shards: 1, gems: 1 });
  });
  it('makes mystery rewards and broken blocks idempotent', () => {
    const progress = new ObjectProgress(LEVEL_1);
    expect(progress.useBlock('m01', 5)).toBe(true);
    expect(progress.useBlock('m01', 5)).toBe(false);
    expect(progress.useBlock('b01', 0)).toBe(true);
    expect(progress.isUsed('b01')).toBe(true);
    expect(progress.snapshot().shards).toBe(5);
  });
  it('uses the latest checkpoint and preserves it on completion', () => {
    const progress = new ObjectProgress(LEVEL_1);
    expect(progress.activateCheckpoint('c01', { x: 2512, y: 960 })).toBe(true);
    expect(progress.activateCheckpoint('c01', { x: 0, y: 0 })).toBe(false);
    expect(progress.getRespawn()).toEqual({ x: 2512, y: 960 });
    expect(progress.complete()).toBe(true); expect(progress.complete()).toBe(false);
    expect(progress.snapshot()).toMatchObject({ checkpointId: 'c01', complete: true });
  });
  it('fully resets a replay while returning defensive respawn copies', () => {
    const progress = new ObjectProgress(LEVEL_1);
    progress.collect('s01', 'shard'); progress.useBlock('m01', 5);
    progress.activateCheckpoint('c01', { x: 2512, y: 960 }); progress.complete();
    const respawn = progress.getRespawn(); respawn.x = 99;
    expect(progress.getRespawn().x).toBe(2512);
    progress.reset();
    expect(progress.snapshot()).toEqual({ shards: 0, totalShards: 38, gems: 0, totalGems: 3, checkpointId: undefined, respawn: LEVEL_1.spawn, complete: false });
  });
});
