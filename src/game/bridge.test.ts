import { describe, expect, it, vi } from 'vitest';
import { GameBridge } from './bridge';
import { validatePreferences } from '../services/preferences';
describe('scene bridge', () => {
  it('routes UI commands and removes handlers when a scene shuts down', () => {
    const bridge = new GameBridge(); const listener = vi.fn(); const unsubscribe = bridge.onCommand(listener);
    bridge.send({ type: 'pause' }); expect(listener).toHaveBeenCalledWith({ type: 'pause' });
    unsubscribe(); bridge.send({ type: 'restart' }); expect(listener).toHaveBeenCalledTimes(1);
  });
  it('delivers progress and releases listeners on unmount', () => {
    const bridge = new GameBridge(); const listener = vi.fn(); const unsubscribe = bridge.subscribe(listener);
    bridge.emit({ type: 'loading', progress: .5 }); expect(listener).toHaveBeenCalledWith({ type: 'loading', progress: .5 });
    unsubscribe(); bridge.emit({ type: 'ready' }); expect(listener).toHaveBeenCalledTimes(1);
  });
});
describe('preference validation', () => {
  it('rejects malformed and non-boolean values', () => { for (const value of [null, [], 8, { highContrast: 'true', reducedMotion: 1 }]) expect(validatePreferences(value)).toEqual({ highContrast: false, reducedMotion: false }); });
  it('keeps supported values without accepting unknown fields', () => expect(validatePreferences({ reducedMotion: true, highContrast: false, extra: 1 })).toEqual({ reducedMotion: true, highContrast: false }));
});
