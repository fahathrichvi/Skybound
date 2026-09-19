/** A forgiving top-contact window for the Guardian's glowing crown. */
export function isGuardianStomp(previousBottom: number, currentBottom: number, velocityY: number, guardianTop: number) {
  return velocityY >= -120 && previousBottom <= guardianTop + 20 && currentBottom <= guardianTop + 44;
}
