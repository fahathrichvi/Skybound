import type { MovementInput } from './PlayerMotor';
export type MoveAction = 'left' | 'right' | 'jump' | 'sprint';
const KEYS: Readonly<Record<string, MoveAction>> = {
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'jump', KeyW: 'jump', ArrowUp: 'jump', ShiftLeft: 'sprint', ShiftRight: 'sprint',
};
export class PlayerInput {
  private keys = new Set<string>();
  private touch = new Set<MoveAction>();
  private jumpQueued = false;
  constructor(private canvas: HTMLCanvasElement, private pause: () => void, private restart: () => void) {
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Ari movement practice. A and D to move, Space to jump, Shift to sprint, Escape to pause.');
    canvas.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    canvas.addEventListener('blur', this.clear);
    canvas.addEventListener('pointerdown', this.focus);
  }
  private has(action: MoveAction) { return this.touch.has(action) || [...this.keys].some(key => KEYS[key] === action); }
  private keyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (event.code === 'Escape') { event.preventDefault(); if (!event.repeat) this.pause(); return; }
    if (event.code === 'KeyR') { event.preventDefault(); if (!event.repeat) this.restart(); return; }
    const action = KEYS[event.code];
    if (!action) return;
    event.preventDefault();
    if (action === 'jump' && !event.repeat && !this.has('jump')) this.jumpQueued = true;
    this.keys.add(event.code);
  };
  private keyUp = (event: KeyboardEvent) => { this.keys.delete(event.code); };
  private focus = () => { this.canvas.focus({ preventScroll: true }); };
  setTouch(action: MoveAction, pressed: boolean) {
    if (action === 'jump' && pressed && !this.has('jump')) this.jumpQueued = true;
    if (pressed) this.touch.add(action); else this.touch.delete(action);
  }
  read(): MovementInput {
    const result: MovementInput = { axis: (Number(this.has('right')) - Number(this.has('left'))) as -1 | 0 | 1,
      sprint: this.has('sprint'), jumpHeld: this.has('jump'), jumpPressed: this.jumpQueued };
    this.jumpQueued = false;
    return result;
  }
  clear = () => { this.keys.clear(); this.touch.clear(); this.jumpQueued = false; };
  destroy() {
    this.clear(); this.canvas.removeEventListener('keydown', this.keyDown); window.removeEventListener('keyup', this.keyUp);
    this.canvas.removeEventListener('blur', this.clear); this.canvas.removeEventListener('pointerdown', this.focus);
  }
}
