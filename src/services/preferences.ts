export interface Preferences { reducedMotion: boolean; highContrast: boolean; casualMode: boolean; masterVolume: number; musicVolume: number; sfxVolume: number }
const KEY = 'skybound.preferences.v1';
export function validatePreferences(value: unknown): Preferences {
  const data = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const volume = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
  return { reducedMotion: data.reducedMotion === true, highContrast: data.highContrast === true, casualMode: data.casualMode === true,
    masterVolume: volume(data.masterVolume, .7), musicVolume: volume(data.musicVolume, .35), sfxVolume: volume(data.sfxVolume, .7) };
}
export function loadPreferences(): Preferences {
  try { const raw = localStorage.getItem(KEY); return raw ? validatePreferences(JSON.parse(raw)) : { reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches, highContrast: false, casualMode: false, masterVolume: .7, musicVolume: .35, sfxVolume: .7 }; }
  catch { return { reducedMotion: false, highContrast: false, casualMode: false, masterVolume: .7, musicVolume: .35, sfxVolume: .7 }; }
}
export function savePreferences(preferences: Preferences): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(preferences)); return true; } catch { return false; }
}
