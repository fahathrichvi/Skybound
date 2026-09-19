import { describe, expect, it } from 'vitest';
import { isGuardianStomp } from './GuardianCombat';

describe('Forest Guardian crown contact', () => {
  it('accepts an ordinary descending jump with a forgiving crown window', () => {
    expect(isGuardianStomp(790, 826, 180, 800)).toBe(true);
    expect(isGuardianStomp(808, 836, -50, 800)).toBe(true);
  });

  it('rejects upward and deep side contacts', () => {
    expect(isGuardianStomp(790, 820, -160, 800)).toBe(false);
    expect(isGuardianStomp(850, 875, 240, 800)).toBe(false);
  });
});
