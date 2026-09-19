import { describe, expect, it } from 'vitest';
import { isStomp } from './EnemySystem';

describe('enemy contact classification', () => {
  it('accepts a descending top contact as a stomp', () => {
    expect(isStomp(190, 211, 340, 200)).toBe(true);
    expect(isStomp(202, 203, -35, 200)).toBe(true);
  });

  it('rejects upward, side, and deeply overlapping contacts', () => {
    expect(isStomp(190, 201, -100, 200)).toBe(false);
    expect(isStomp(220, 225, 100, 200)).toBe(false);
    expect(isStomp(190, 230, 300, 200)).toBe(false);
  });
});
