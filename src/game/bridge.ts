import type { MoveAction } from './entities/player/PlayerInput';
import type { ObjectSnapshot } from './objects/ObjectProgress';
import type { LevelResult, RunSnapshot } from './systems/RunProgress';
import type { SoundCue } from './audio/AudioManager';
import type { BossSnapshot } from './entities/bosses/BossSystem';
export interface CombatSnapshot { readonly hearts: number; readonly maxHearts: number; readonly lives: number | null; readonly maxLives: number; readonly deaths: number; readonly enemiesDefeated: number; readonly totalEnemies: number }
export type GameEvent = { type: 'loading'; progress: number } | { type: 'ready' } | { type: 'error'; message: string } | { type: 'paused'; paused: boolean } | { type: 'level'; id: string; name: string } | { type: 'region'; name: string } | { type: 'objects'; snapshot: ObjectSnapshot } | { type: 'combat'; snapshot: CombatSnapshot } | { type: 'boss'; snapshot: BossSnapshot } | { type: 'run'; snapshot: RunSnapshot } | { type: 'announcement'; message: string } | { type: 'sound'; cue: SoundCue } | { type: 'level-complete'; snapshot: ObjectSnapshot; result: LevelResult } | { type: 'game-over'; combat: CombatSnapshot; run: RunSnapshot };
export type GameCommand = { type: 'pause' | 'resume' | 'restart' | 'continue' } | { type: 'suspend'; suspended: boolean } | { type: 'input'; action: MoveAction; pressed: boolean } | { type: 'preferences'; reducedMotion: boolean; casualMode: boolean };
type Listener = (event: GameEvent) => void;
/** React owns menus; scenes publish only serializable events. */
export class GameBridge {
  private listeners = new Set<Listener>();
  private commands = new Set<(command: GameCommand) => void>();
  subscribe(listener: Listener) { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  emit(event: GameEvent) { this.listeners.forEach(listener => listener(event)); }
  onCommand(listener: (command: GameCommand) => void) { this.commands.add(listener); return () => { this.commands.delete(listener); }; }
  send(command: GameCommand) { this.commands.forEach(listener => listener(command)); }
}
