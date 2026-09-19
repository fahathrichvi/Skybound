/** Rename the game here; also update the HTML title and package name for distribution. */
export const PROJECT = { name: 'Skybound Adventure', subtitle: 'Explore. Discover. Rise Beyond the Clouds.', version: '0.3.0', stage: 3 } as const;
export const GAME_SIZE = { width: 1280, height: 720 } as const;
export const WORLDS = [
  { name: 'Emerald Valley', label: 'Where the journey begins', color: '#9bd5a6' },
  { name: 'Crystal Caverns', label: 'Secrets beneath the surface', color: '#b9a1dd' },
  { name: 'Sunset Desert', label: 'Echoes of an ancient world', color: '#e6b18b' },
  { name: 'Frozen Peaks', label: 'Beyond the winter veil', color: '#a8d8e6' },
  { name: 'Sky Kingdom', label: 'Among the endless clouds', color: '#c3dabb' },
  { name: 'Void Fortress', label: 'A light in the darkness', color: '#ae9ac3' },
] as const;
