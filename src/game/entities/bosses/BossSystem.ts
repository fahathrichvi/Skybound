import Phaser from 'phaser';
import type { BossConfig } from '../../levels/types';
import type { Player } from '../player/Player';
import type { WorldBuilder } from '../../world/WorldBuilder';
import { isStomp } from '../enemies/EnemySystem';
import { createForestGuardianArt } from './ForestGuardian';

export interface BossSnapshot { readonly name: string; readonly health: number; readonly maxHealth: number; readonly phase: number; readonly active: boolean; readonly defeated: boolean }
export interface BossEvents { hurt(sourceX: number): boolean; announce(message: string): void; defeated(): void; phase(phase: number): void }

/** A compact three-phase boss controller with readable warning/strike windows. */
export class BossSystem {
  private readonly sprite: Phaser.Physics.Arcade.Sprite;
  private readonly roots: Phaser.Physics.Arcade.StaticGroup;
  private health: number;
  private active = false;
  private defeated = false;
  private nextAttackAt = 0;
  private root?: Phaser.GameObjects.Rectangle;
  private rootLiveUntil = 0;
  private lastPhase = 1;

  constructor(private scene: Phaser.Scene, private config: BossConfig, private player: Player, world: WorldBuilder, private events: BossEvents) {
    createForestGuardianArt(scene); this.health = config.maxHealth;
    this.sprite = scene.physics.add.sprite(config.x, config.y, 'forest-guardian').setOrigin(.5, 1).setDepth(18);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setSize(106, 126).setOffset(27, 26).setImmovable(true).setAllowGravity(true);
    scene.physics.add.collider(this.sprite, world.terrain); scene.physics.add.collider(this.sprite, world.solids);
    this.roots = scene.physics.add.staticGroup();
    scene.physics.add.overlap(player.sprite, this.sprite, () => this.contact());
    scene.physics.add.overlap(player.sprite, this.roots, () => { if (this.active && !this.defeated) this.events.hurt(this.sprite.x); });
  }
  update(time: number) {
    if (this.defeated) return;
    if (!this.active && Math.abs(this.player.sprite.x - this.sprite.x) < 650) { this.active = true; this.nextAttackAt = time + 1200; this.events.announce('Forest Guardian awakened — strike from above!'); }
    if (!this.active) return;
    if (this.root && time >= this.rootLiveUntil) { this.roots.remove(this.root, true, true); this.root = undefined; }
    if (time >= this.nextAttackAt) this.warnRoot(time);
  }
  private contact() {
    if (!this.active || this.defeated) return;
    const body = this.player.body, boss = this.sprite.body as Phaser.Physics.Arcade.Body;
    const airborne = !body.blocked.down && !body.touching.down;
    if (airborne && isStomp(body.prev.y + body.height, body.bottom, body.velocity.y, boss.top)) {
      this.health--; this.player.bounceFromEnemy(); this.sprite.setTint(0xe6cc91); this.scene.time.delayedCall(120, () => this.sprite.clearTint());
      if (this.health <= 0) { this.defeated = true; this.sprite.disableBody(true, false); this.events.announce('The Forest Guardian is restored!'); this.events.defeated(); return; }
      const phase = this.phase(); if (phase !== this.lastPhase) { this.lastPhase = phase; this.events.phase(phase); this.events.announce(`Guardian phase ${phase} — the roots quicken!`); }
      this.nextAttackAt = this.scene.time.now + 900; return;
    }
    this.events.hurt(this.sprite.x);
  }
  private warnRoot(time: number) {
    const phase = this.phase(), x = Phaser.Math.Clamp(this.player.sprite.x, this.config.x - 430, this.config.x + 220);
    const warning = this.scene.add.rectangle(x, 938, 58 + phase * 8, 8, 0xf0c26b, .8).setDepth(16);
    this.scene.tweens.add({ targets: warning, alpha: .25, yoyo: true, repeat: 3, duration: 100, onComplete: () => {
      warning.destroy(); this.root = this.scene.add.rectangle(x, 886, 46 + phase * 8, 74, 0x7f4933, .95).setDepth(17);
      this.scene.physics.add.existing(this.root, true); this.roots.add(this.root); this.rootLiveUntil = this.scene.time.now + 420 + phase * 90;
    } });
    this.nextAttackAt = time + Math.max(1250, 2400 - phase * 350);
  }
  private phase() { return this.health <= 1 ? 3 : this.health === 2 ? 2 : 1; }
  snapshot(): BossSnapshot { return { name: this.config.name, health: this.health, maxHealth: this.config.maxHealth, phase: this.phase(), active: this.active, defeated: this.defeated }; }
  reset() { this.health = this.config.maxHealth; this.active = this.defeated = false; this.nextAttackAt = 0; this.lastPhase = 1; this.sprite.enableBody(false, this.config.x, this.config.y, true, true).clearTint(); if (this.root) { this.roots.remove(this.root, true, true); this.root = undefined; } }
  destroy() { this.roots.destroy(true); this.sprite.destroy(); }
}
