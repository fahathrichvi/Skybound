export interface Point { readonly x: number; readonly y: number }
export interface TerrainRect extends Point { readonly width: number; readonly height: number; readonly surface: 'grass' | 'stone' }
export interface PlatformConfig extends Point { readonly width: number; readonly height: number; readonly kind: 'solid' | 'one-way' }
export interface SignConfig extends Point { readonly title: string; readonly text: string }
export interface RegionConfig { readonly from: number; readonly to: number; readonly name: string; readonly cave?: Point & { readonly width: number; readonly height: number } }
export interface CollectibleConfig extends Point { readonly id: string; readonly kind: 'shard' | 'gem' }
export interface BlockConfig extends Point { readonly id: string; readonly kind: 'mystery' | 'breakable'; readonly reward?: number }
export interface CheckpointConfig extends Point { readonly id: string; readonly respawn: Point }
export interface ExitConfig extends Point { readonly id: string }
export interface BloblingConfig extends Point { readonly id: string; readonly kind: 'blobling'; readonly patrolFrom: number; readonly patrolTo: number; readonly speed: number }
export interface WinglingConfig extends Point { readonly id: string; readonly kind: 'wingling'; readonly patrolFrom: number; readonly patrolTo: number; readonly speed: number; readonly waveHeight: number }
export type EnemyConfig = BloblingConfig | WinglingConfig;
/** Terrain uses tile coordinates; platforms, spawn, signs and regions use world pixels. */
export interface LevelConfig {
  readonly version: 1; readonly id: string; readonly name: string; readonly theme: 'emerald';
  readonly width: number; readonly height: number; readonly tileSize: 32;
  readonly spawn: Point; readonly fallLimit: number;
  readonly terrain: readonly TerrainRect[]; readonly platforms: readonly PlatformConfig[];
  readonly signs: readonly SignConfig[]; readonly regions: readonly RegionConfig[];
  readonly collectibles: readonly CollectibleConfig[]; readonly blocks: readonly BlockConfig[];
  readonly checkpoints: readonly CheckpointConfig[]; readonly enemies: readonly EnemyConfig[]; readonly exit?: ExitConfig;
}
