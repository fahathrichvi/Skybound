import { describe, expect, it } from 'vitest';
import { PLAYER_CONFIG as c } from '../../config/player';
import { PlayerMotor, type MovementInput } from './PlayerMotor';

const idle: MovementInput = { axis: 0, sprint: false, jumpPressed: false, jumpHeld: false };
const jump = { ...idle, jumpPressed: true, jumpHeld: true };
const ground = { vx: 0, vy: 0, grounded: true };
const air = { vx: 0, vy: 50, grounded: false };
describe('player movement', () => {
  it('accelerates to walk and sprint caps, then stops promptly', () => {
    const motor = new PlayerMotor(); let motion = ground;
    for (let i = 0; i < 60; i++) motion = { ...motor.step(i * 16, 1 / 60, motion, { ...idle, axis: 1 }), grounded: true };
    expect(motion.vx).toBe(c.walkSpeed);
    for (let i = 60; i < 120; i++) motion = { ...motor.step(i * 16, 1 / 60, motion, { ...idle, axis: 1, sprint: true }), grounded: true };
    expect(motion.vx).toBe(c.runSpeed);
    for (let i = 0; i < 9; i++) motion = { ...motor.step(2000 + i * 16, 1 / 60, motion, idle), grounded: true };
    expect(motion.vx).toBe(0);
  });
  it('gives equivalent acceleration at different frame rates', () => {
    const speedAfter = (hz: number) => { const motor = new PlayerMotor(); let motion = ground; for (let i = 0; i < hz / 10; i++) motion = { ...motor.step(i * 1000 / hz, 1 / hz, motion, { ...idle, axis: 1, sprint: true }), grounded: true }; return motion.vx; };
    expect(speedAfter(30)).toBeCloseTo(speedAfter(120));
  });
  it('permits a late jump inside coyote time but not beyond it', () => {
    for (const delay of [c.coyoteMs, c.coyoteMs + 1]) {
      const motor = new PlayerMotor(); motor.step(0, .016, ground, idle);
      expect(motor.step(delay, .016, air, jump).jumped).toBe(delay <= c.coyoteMs);
    }
  });
  it('buffers a press before landing and expires old presses', () => {
    for (const delay of [c.jumpBufferMs, c.jumpBufferMs + 1]) {
      const motor = new PlayerMotor(); motor.step(0, .016, air, jump);
      expect(motor.step(delay, .016, ground, { ...idle, jumpHeld: true }).jumped).toBe(delay <= c.jumpBufferMs);
    }
  });
  it('cuts upward speed once when released, including a buffered tap', () => {
    const motor = new PlayerMotor(); const initial = motor.step(0, .016, ground, jump);
    const cut = motor.step(16, .016, { vx: 0, vy: initial.vy, grounded: false }, idle);
    expect(cut.vy).toBe(-c.jumpVelocity * c.jumpCutMultiplier);
    expect(motor.step(32, .016, { vx: 0, vy: cut.vy, grounded: false }, idle).vy).toBe(cut.vy);
    motor.reset(); motor.step(0, .016, air, jump);
    expect(motor.step(60, .016, ground, idle).vy).toBe(-c.jumpVelocity * c.jumpCutMultiplier);
  });
  it('does not allow a second airborne jump or reuse stale ground contact', () => {
    const motor = new PlayerMotor(); const first = motor.step(0, .016, ground, jump);
    expect(motor.step(16, .016, { ...ground, vy: first.vy }, jump).jumped).toBe(false);
    expect(motor.step(70, .016, { ...air, vy: -500 }, jump).jumped).toBe(false);
  });
  it('holding jump does not automatically jump again on landing', () => {
    const motor = new PlayerMotor(); motor.step(0, .016, ground, jump);
    motor.step(200, .016, air, { ...idle, jumpHeld: true });
    expect(motor.step(900, .016, ground, { ...idle, jumpHeld: true }).jumped).toBe(false);
  });
  it('allows air reversal, clamps falling speed and clears reset state', () => {
    const motor = new PlayerMotor();
    const next = motor.step(0, .05, { ...air, vx: 60, vy: 1500 }, { ...idle, axis: -1 });
    expect(next.vx).toBeLessThan(0); expect(next.vy).toBe(c.maxFallSpeed); expect(next.facing).toBe(-1);
    motor.step(20, .016, ground, idle); motor.reset();
    expect(motor.step(40, .016, air, jump).jumped).toBe(false); expect(motor.facing).toBe(1);
  });
});
