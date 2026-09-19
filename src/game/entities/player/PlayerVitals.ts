export interface VitalSnapshot {
  readonly hearts: number;
  readonly maxHearts: number;
  readonly lives: number | null;
  readonly maxLives: number;
  readonly deaths: number;
  readonly invulnerable: boolean;
  readonly gameOver: boolean;
}

export interface DamageResult {
  readonly applied: boolean;
  readonly knockedOut: boolean;
  readonly gameOver: boolean;
  readonly hearts: number;
  readonly lives: number | null;
}

/** Pure damage timing and heart state. Stage 6 can wrap this with lives and saves. */
export class PlayerVitals {
  private hearts: number;
  private deaths = 0;
  private invulnerableUntil = -Infinity;
  private lives: number;
  private livesEnabled: boolean;
  private over = false;

  constructor(readonly maxHearts = 3, readonly invulnerabilityMs = 1500, readonly maxLives = 3, livesEnabled = true) {
    if (!Number.isInteger(maxHearts) || maxHearts < 1) throw new Error('maxHearts must be a positive integer.');
    if (!Number.isInteger(maxLives) || maxLives < 1) throw new Error('maxLives must be a positive integer.');
    this.hearts = maxHearts;
    this.lives = maxLives; this.livesEnabled = livesEnabled;
  }

  damage(now: number): DamageResult {
    if (this.hearts <= 0 || this.over || now < this.invulnerableUntil) return this.result(false, this.hearts <= 0);
    this.hearts--;
    const knockedOut = this.hearts === 0;
    if (knockedOut) this.useLife();
    else this.invulnerableUntil = now + this.invulnerabilityMs;
    return this.result(true, knockedOut);
  }

  fall(): DamageResult {
    if (this.over || this.hearts <= 0) return this.result(false, this.hearts <= 0);
    this.hearts = 0; this.useLife(); return this.result(true, true);
  }
  private useLife() { this.deaths++; if (this.livesEnabled) this.lives--; this.over = this.livesEnabled && this.lives <= 0; }
  private result(applied: boolean, knockedOut: boolean): DamageResult { return { applied, knockedOut, gameOver: this.over, hearts: this.hearts, lives: this.livesEnabled ? this.lives : null }; }
  revive(now: number) { if (this.over) return false; this.hearts = this.maxHearts; this.invulnerableUntil = now + 500; return true; }
  setLivesEnabled(enabled: boolean) { this.livesEnabled = enabled; if (!enabled) this.over = false; else if (this.lives < 1) this.lives = this.maxLives; }
  reset() { this.hearts = this.maxHearts; this.lives = this.maxLives; this.deaths = 0; this.invulnerableUntil = -Infinity; this.over = false; }
  isInvulnerable(now: number) { return this.hearts > 0 && !this.over && now < this.invulnerableUntil; }
  snapshot(now: number): VitalSnapshot {
    return { hearts: this.hearts, maxHearts: this.maxHearts, lives: this.livesEnabled ? this.lives : null, maxLives: this.maxLives,
      deaths: this.deaths, invulnerable: this.isInvulnerable(now), gameOver: this.over };
  }
}
