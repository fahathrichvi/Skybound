import { describe, expect, it } from 'vitest';
import { PlayerVitals } from './PlayerVitals';

describe('PlayerVitals', () => {
  it('removes one heart and grants a 1.5 second protection window', () => {
    const vitals = new PlayerVitals();
    expect(vitals.damage(100)).toEqual({ applied: true, knockedOut: false, gameOver: false, hearts: 2, lives: 3 });
    expect(vitals.damage(1599).applied).toBe(false);
    expect(vitals.damage(1600)).toEqual({ applied: true, knockedOut: false, gameOver: false, hearts: 1, lives: 3 });
  });

  it('records defeat only when the last heart is removed', () => {
    const vitals = new PlayerVitals(2, 10);
    vitals.damage(0);
    expect(vitals.damage(10)).toEqual({ applied: true, knockedOut: true, gameOver: false, hearts: 0, lives: 2 });
    expect(vitals.snapshot(20).deaths).toBe(1);
    expect(vitals.damage(20).applied).toBe(false);
  });

  it('revives with full hearts while keeping the run death count', () => {
    const vitals = new PlayerVitals(1, 10);
    vitals.damage(0); vitals.revive(100);
    expect(vitals.snapshot(100)).toEqual({ hearts: 1, maxHearts: 1, lives: 2, maxLives: 3, deaths: 1, invulnerable: true, gameOver: false });
  });

  it('fully resets a replay', () => {
    const vitals = new PlayerVitals(1);
    vitals.damage(0); vitals.reset();
    expect(vitals.snapshot(1)).toEqual({ hearts: 1, maxHearts: 1, lives: 3, maxLives: 3, deaths: 0, invulnerable: false, gameOver: false });
  });
  it('reaches Game Over after the final enabled life', () => {
    const vitals = new PlayerVitals(1, 0, 2);
    expect(vitals.damage(0).gameOver).toBe(false); vitals.revive(1);
    expect(vitals.fall()).toMatchObject({ knockedOut: true, gameOver: true, lives: 0 });
    expect(vitals.revive(2)).toBe(false);
  });
  it('supports casual revives without consuming lives', () => {
    const vitals = new PlayerVitals(1, 0, 3, false);
    for (let i = 0; i < 5; i++) { const now = i * 1000; expect(vitals.damage(now).gameOver).toBe(false); vitals.revive(now + 1); }
    expect(vitals.snapshot(5000)).toMatchObject({ lives: null, deaths: 5, gameOver: false });
  });
});
