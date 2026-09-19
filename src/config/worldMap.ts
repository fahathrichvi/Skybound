import type { GameSave, LevelRecord } from '../services/save';

export type StageKind = 'trail' | 'stage' | 'boss';
export interface StageNode { readonly id: string; readonly title: string; readonly subtitle: string; readonly kind: StageKind; readonly gemTotal: number; readonly available: boolean }

export const EMERALD_VALLEY_STAGES: readonly StageNode[] = [
  { id: '1-1', title: 'Verdant Trail', subtitle: 'Firstlight Meadow', kind: 'trail', gemTotal: 3, available: true },
  { id: '1-2', title: 'Moonlit Grove', subtitle: 'Coming in Stage 9', kind: 'stage', gemTotal: 3, available: false },
  { id: '1-3', title: 'Canopy Crossing', subtitle: 'Coming in Stage 9', kind: 'stage', gemTotal: 3, available: false },
  { id: '1-B', title: 'Forest Guardian', subtitle: 'Boss encounter', kind: 'boss', gemTotal: 0, available: false },
] as const;

export type StageMapState = 'available' | 'unlocked' | 'locked' | 'complete';
export function getStageMapState(stage: StageNode, save: GameSave): StageMapState {
  const record: LevelRecord | undefined = save.levels[stage.id];
  if (record?.completed) return 'complete';
  const index = EMERALD_VALLEY_STAGES.findIndex(candidate => candidate.id === stage.id);
  const previous = index > 0 ? save.levels[EMERALD_VALLEY_STAGES[index - 1].id] : undefined;
  if (index === 0) return 'available';
  return previous?.completed ? 'unlocked' : 'locked';
}
