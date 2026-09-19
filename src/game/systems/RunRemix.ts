import type { LevelConfig } from '../levels/types';

const unit = (seed: number, index: number) => ((Math.sin(seed * 97.31 + index * 41.7) + 1) / 2);
/** Keeps authored geometry intact while rotating optional rewards, patrol tempo and wind each fresh run. */
export function remixLevel(level: LevelConfig, seed: number): LevelConfig {
  if (level.id === 'practice') return level;
  return { ...level,
    collectibles: level.collectibles.map((item, index) => ({ ...item, x: Math.max(24, Math.min(level.width - 24, item.x + Math.round(unit(seed, index) * 2 - 1) * 32)) })),
    blocks: level.blocks.map((block, index) => ({ ...block, x: Math.max(32, Math.min(level.width - 32, block.x + Math.round(unit(seed, index + 20) * 2 - 1) * 32)), reward: block.kind === 'mystery' ? 2 + Math.floor(unit(seed, index + 40) * 5) : block.reward })),
    enemies: level.enemies.map((enemy, index) => ({ ...enemy, x: enemy.patrolFrom + (enemy.patrolTo - enemy.patrolFrom) * (.15 + unit(seed, index + 60) * .7), speed: Math.round(enemy.speed * (.82 + unit(seed, index + 80) * .36)) })),
    windZones: level.windZones?.map((zone, index) => ({ ...zone, strength: Math.round(zone.strength * (.8 + unit(seed, index + 100) * .4)) })),
  };
}
