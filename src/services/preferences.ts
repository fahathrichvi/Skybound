export interface Preferences { reducedMotion: boolean; highContrast: boolean }
const KEY = 'skybound.preferences.v1';
export function validatePreferences(value: unknown): Preferences {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return { reducedMotion: data.reducedMotion === true, highContrast: data.highContrast === true };
}
export function loadPreferences(): Preferences {
  try { const raw = localStorage.getItem(KEY); return raw ? validatePreferences(JSON.parse(raw)) : { reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, highContrast: false }; }
  catch { return { reducedMotion: false, highContrast: false }; }
}
export function savePreferences(preferences: Preferences): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(preferences)); return true; } catch { return false; }
}
