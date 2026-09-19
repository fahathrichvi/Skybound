import type { LevelConfig, Point } from '../levels/types';

export interface ObjectSnapshot {
  readonly shards: number; readonly totalShards: number; readonly gems: number; readonly totalGems: number;
  readonly checkpointId?: string; readonly respawn: Point; readonly complete: boolean;
}

/** Pure per-run state. A future save adapter can serialize this without Phaser objects. */
export class ObjectProgress {
  private collected = new Set<string>();
  private usedBlocks = new Set<string>();
  private checkpointId?: string;
  private respawn: Point;
  private shardCount = 0;
  private gemCount = 0;
  private finished = false;
  readonly totalShards: number;
  readonly totalGems: number;
  constructor(private level: LevelConfig) {
    this.respawn = level.spawn;
    this.totalShards = level.collectibles.filter(item => item.kind === 'shard').length + level.blocks.reduce((sum, block) => sum + (block.kind === 'mystery' ? block.reward ?? 1 : 0), 0);
    this.totalGems = level.collectibles.filter(item => item.kind === 'gem').length;
  }
  collect(id: string, kind: 'shard' | 'gem') {
    if (this.collected.has(id)) return false;
    this.collected.add(id);
    if (kind === 'shard') this.shardCount++; else this.gemCount++;
    return true;
  }
  useBlock(id: string, reward: number) {
    if (this.usedBlocks.has(id)) return false;
    this.usedBlocks.add(id); this.shardCount += reward;
    return true;
  }
  activateCheckpoint(id: string, respawn: Point) {
    if (this.checkpointId === id) return false;
    this.checkpointId = id; this.respawn = respawn; return true;
  }
  complete() { if (this.finished) return false; this.finished = true; return true; }
  isCollected(id: string) { return this.collected.has(id); }
  isUsed(id: string) { return this.usedBlocks.has(id); }
  getRespawn() { return { ...this.respawn }; }
  reset() {
    this.collected.clear(); this.usedBlocks.clear(); this.checkpointId = undefined;
    this.respawn = this.level.spawn; this.shardCount = this.gemCount = 0; this.finished = false;
  }
  snapshot(): ObjectSnapshot {
    return { shards: this.shardCount, totalShards: this.totalShards, gems: this.gemCount, totalGems: this.totalGems,
      checkpointId: this.checkpointId, respawn: { ...this.respawn }, complete: this.finished };
  }
}
