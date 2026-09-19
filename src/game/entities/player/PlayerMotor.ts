import { PLAYER_CONFIG, type PlayerConfig } from '../../config/player';

export interface MovementInput { axis: -1 | 0 | 1; sprint: boolean; jumpPressed: boolean; jumpHeld: boolean }
export interface Motion { vx: number; vy: number; grounded: boolean }
export type PlayerState = 'idle' | 'run' | 'sprint' | 'jump' | 'fall' | 'land';
export function approach(value: number, target: number, amount: number) {
  return value < target ? Math.min(value + amount, target) : Math.max(value - amount, target);
}

/** Owns input grace windows; Arcade owns integration and collision response. */
export class PlayerMotor {
  private lastGroundAt = -Infinity;
  private jumpQueuedAt = -Infinity;
  private wasGrounded = false;
  private cutAvailable = false;
  private landingUntil = 0;
  facing: -1 | 1 = 1;
  constructor(readonly config: Readonly<PlayerConfig> = PLAYER_CONFIG) {}
  reset() {
    this.lastGroundAt = this.jumpQueuedAt = -Infinity;
    this.wasGrounded = this.cutAvailable = false;
    this.landingUntil = 0;
    this.facing = 1;
  }
  clearBufferedInput() { this.jumpQueuedAt = -Infinity; }
  step(now: number, deltaSeconds: number, motion: Motion, input: MovementInput) {
    const c = this.config;
    const dt = Math.min(deltaSeconds, .05);
    // A stale floor contact on the takeoff frame must not grant another jump.
    const grounded = motion.grounded && motion.vy >= 0;
    const landed = grounded && !this.wasGrounded;
    if (grounded) { this.lastGroundAt = now; this.cutAvailable = false; }
    if (landed) this.landingUntil = now + 100;
    if (input.jumpPressed) this.jumpQueuedAt = now;
    if (input.axis) this.facing = input.axis;
    const target = input.axis * (input.sprint ? c.runSpeed : c.walkSpeed);
    const rate = input.axis ? c.acceleration * (grounded ? 1 : c.airControl) : (grounded ? c.drag : c.airDrag);
    const vx = approach(motion.vx, target, rate * dt);
    let vy = Math.min(motion.vy, c.maxFallSpeed);
    const jumped = now - this.jumpQueuedAt <= c.jumpBufferMs && now - this.lastGroundAt <= c.coyoteMs;
    if (jumped) {
      vy = -c.jumpVelocity;
      this.jumpQueuedAt = this.lastGroundAt = -Infinity;
      this.cutAvailable = true;
    }
    // This also cuts a buffered tap released before its landing frame.
    if (this.cutAvailable && !input.jumpHeld && vy < 0) {
      vy *= c.jumpCutMultiplier;
      this.cutAvailable = false;
    }
    this.wasGrounded = grounded && !jumped;
    const state: PlayerState = jumped || !grounded
      ? (vy < -10 ? 'jump' : 'fall')
      : Math.abs(vx) > 15 ? (input.sprint ? 'sprint' : 'run') : now < this.landingUntil ? 'land' : 'idle';
    return { vx, vy, state, jumped, landed, facing: this.facing };
  }
}
