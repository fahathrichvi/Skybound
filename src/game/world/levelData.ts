import type { LevelConfig } from '../levels/types';

type RecordValue = Record<string, unknown>;
function record(value: unknown): value is RecordValue { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function number(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }
function integer(value: unknown): value is number { return number(value) && Number.isInteger(value); }
function text(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }
function point(value: unknown): value is RecordValue & { x: number; y: number } { return record(value) && number(value.x) && number(value.y); }
function box(value: unknown): value is RecordValue & { x: number; y: number; width: number; height: number } {
  return point(value) && record(value) && number(value.width) && number(value.height) && value.width > 0 && value.height > 0;
}
export function validateLevel(value: unknown): asserts value is LevelConfig {
  if (!record(value) || value.version !== 1 || !text(value.id) || !text(value.name) || value.theme !== 'emerald' || value.tileSize !== 32) throw new Error('Unsupported level metadata.');
  if (!integer(value.width) || !integer(value.height) || value.width < 1280 || value.height < 720 || value.width > 65536 || value.height > 16384) throw new Error('Invalid world bounds.');
  if (Math.ceil(value.width / 32) * Math.ceil(value.height / 32) > 262144) throw new Error('Level exceeds the tile budget.');
  if (!point(value.spawn) || value.spawn.x < 14 || value.spawn.x > value.width - 14 || value.spawn.y < 64 || value.spawn.y >= value.height) throw new Error('Spawn is outside the world.');
  if (!number(value.fallLimit) || value.fallLimit <= value.spawn.y || value.fallLimit > value.height) throw new Error('Invalid fall recovery boundary.');
  for (const key of ['terrain', 'platforms', 'signs', 'regions', 'collectibles', 'blocks', 'checkpoints', 'enemies']) if (!Array.isArray(value[key])) throw new Error(`Missing ${key} data.`);
  const terrain = value.terrain as unknown[];
  for (const tile of terrain) {
    if (!box(tile) || !record(tile) || ![tile.x, tile.y, tile.width, tile.height].every(integer) || tile.x < 0 || tile.y < 0 || (tile.x + tile.width) * 32 > value.width || (tile.y + tile.height) * 32 > value.height || !['grass', 'stone'].includes(String(tile.surface))) throw new Error('Invalid terrain rectangle.');
  }
  for (const platform of value.platforms as unknown[]) {
    if (!box(platform) || !record(platform) || platform.x < 0 || platform.y < 0 || platform.x + platform.width > value.width || platform.y + platform.height > value.height || !['solid', 'one-way'].includes(String(platform.kind))) throw new Error('Invalid platform.');
  }
  for (const sign of value.signs as unknown[]) {
    if (!point(sign) || !record(sign) || sign.x < 0 || sign.y < 0 || sign.x >= value.width || sign.y >= value.height || !text(sign.title) || !text(sign.text)) throw new Error('Invalid sign.');
  }
  let lastEnd = 0;
  for (const region of value.regions as unknown[]) {
    if (!record(region) || !number(region.from) || !number(region.to) || region.from !== lastEnd || region.to <= region.from || region.to > value.width || !text(region.name)) throw new Error('Regions must cover the world without overlaps or gaps.');
    if (region.cave !== undefined && (!box(region.cave) || region.cave.x < region.from || region.cave.x + region.cave.width > region.to || region.cave.y < 0 || region.cave.y + region.cave.height > value.height)) throw new Error('Invalid cave backdrop bounds.');
    lastEnd = region.to;
  }
  if (lastEnd !== value.width) throw new Error('Regions do not cover the world.');
  const worldWidth = value.width as number, worldHeight = value.height as number;
  const ids = new Set<string>();
  const checkObject = (item: unknown, label: string) => {
    if (!point(item) || !text(item.id) || item.x < 0 || item.x > worldWidth || item.y < 0 || item.y > worldHeight) throw new Error(`Invalid ${label}.`);
    if (ids.has(item.id)) throw new Error(`Duplicate object id: ${item.id}.`);
    ids.add(item.id);
    return item;
  };
  for (const item of value.collectibles as unknown[]) {
    const object = checkObject(item, 'collectible');
    if (!['shard', 'gem'].includes(String(object.kind))) throw new Error('Invalid collectible kind.');
  }
  for (const item of value.blocks as unknown[]) {
    const object = checkObject(item, 'block');
    if (!['mystery', 'breakable'].includes(String(object.kind)) || (object.reward !== undefined && (!integer(object.reward) || object.reward < 1 || object.reward > 100))) throw new Error('Invalid block.');
  }
  for (const item of value.checkpoints as unknown[]) {
    const object = checkObject(item, 'checkpoint');
    if (!point(object.respawn) || object.respawn.x < 14 || object.respawn.x > worldWidth - 14 || object.respawn.y < 64 || object.respawn.y >= worldHeight) throw new Error('Invalid checkpoint respawn.');
  }
  for (const item of value.enemies as unknown[]) {
    const enemy = checkObject(item, 'enemy');
    if (!['blobling', 'wingling'].includes(String(enemy.kind)) || !number(enemy.patrolFrom) || !number(enemy.patrolTo) || enemy.patrolFrom < 0 || enemy.patrolTo > worldWidth || enemy.patrolFrom >= enemy.patrolTo || enemy.x < enemy.patrolFrom || enemy.x > enemy.patrolTo || !number(enemy.speed) || enemy.speed < 1 || enemy.speed > 1000) throw new Error('Invalid enemy.');
    if (enemy.kind === 'wingling' && (!number(enemy.waveHeight) || enemy.waveHeight < 1 || enemy.waveHeight > 500)) throw new Error('Invalid Wingling wave.');
  }
  if (value.exit !== undefined) checkObject(value.exit, 'exit');
  const spawn = value.spawn;
  const intersects = (x: number, y: number, w: number, h: number) => spawn.x + 14 > x && spawn.x - 14 < x + w && spawn.y > y && spawn.y - 64 < y + h;
  for (const rect of terrain as LevelConfig['terrain']) if (intersects(rect.x * 32, rect.y * 32, rect.width * 32, rect.height * 32)) throw new Error('Spawn intersects terrain.');
  for (const rect of value.platforms as LevelConfig['platforms']) if (rect.kind === 'solid' && intersects(rect.x, rect.y, rect.width, rect.height)) throw new Error('Spawn intersects a solid platform.');
}
export function resolveLevel(candidate: unknown, fallback: LevelConfig): { level: LevelConfig; warning?: string } {
  try { validateLevel(candidate); return { level: candidate }; }
  catch (error) { validateLevel(fallback); return { level: fallback, warning: `Level data could not load (${error instanceof Error ? error.message : 'invalid data'}). Opened movement practice instead.` }; }
}
export function buildTileData(level: LevelConfig): number[][] {
  const rows = Math.ceil(level.height / level.tileSize), columns = Math.ceil(level.width / level.tileSize);
  const data = Array.from({ length: rows }, () => Array<number>(columns).fill(-1));
  for (const rect of level.terrain) for (let y = rect.y; y < rect.y + rect.height; y++) for (let x = rect.x; x < rect.x + rect.width; x++) data[y][x] = rect.surface === 'stone' ? 2 : y === rect.y ? 0 : 1;
  return data;
}
export function canLandOnOneWay(previousBottom: number, velocityY: number, platformTop: number) {
  return velocityY >= 0 && previousBottom <= platformTop + 2;
}
export function regionAt(level: LevelConfig, x: number) {
  if (x < 0) return level.regions[0];
  return level.regions.find(region => x >= region.from && x < region.to) ?? level.regions[level.regions.length - 1];
}
