import type { MoveAction } from './entities/player/PlayerInput';
export type GameEvent = { type: 'loading'; progress: number } | { type: 'ready' } | { type: 'error'; message: string } | { type: 'paused'; paused: boolean } | { type: 'level'; id: string; name: string } | { type: 'region'; name: string };
export type GameCommand = { type: 'pause' | 'resume' | 'restart' } | { type: 'suspend'; suspended: boolean } | { type: 'input'; action: MoveAction; pressed: boolean } | { type: 'preferences'; reducedMotion: boolean };
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
