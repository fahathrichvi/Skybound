import Phaser from 'phaser';
import type { EnemyConfig } from '../../levels/types';

export type EnemyState = 'idle' | 'patrol' | 'alert' | 'attack' | 'hit' | 'stunned' | 'dead';

export abstract class EnemyBase {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  state: EnemyState = 'idle';
  defeated = false;
  protected awake = true;

  constructor(protected scene: Phaser.Scene, readonly config: EnemyConfig, texture: string) {
    this.sprite = scene.physics.add.sprite(config.x, config.y, texture).setOrigin(.5, 1).setDepth(16);
    this.sprite.setData('enemy', this);
  }

  get body() { return this.sprite.body as Phaser.Physics.Arcade.Body; }
  abstract update(time: number, delta: number): void;

  setAwake(value: boolean) {
    if (this.defeated || (this.awake === value && this.body.enable === value)) return;
    this.awake = value;
    this.sprite.setActive(value).setVisible(value);
    this.body.enable = value;
    if (!value) this.body.stop();
    this.state = value ? 'patrol' : 'idle';
  }

  pause() { if (this.body.enable) this.body.setVelocity(0, 0); }

  defeat() {
    if (this.defeated) return false;
    this.defeated = true; this.state = 'dead'; this.body.stop(); this.body.enable = false;
    this.sprite.setTexture(this.config.kind === 'blobling' ? 'blobling-defeated' : 'wingling-defeated');
    this.scene.tweens.add({ targets: this.sprite, alpha: 0, scaleX: 1.25, scaleY: .35, y: this.sprite.y + 10, duration: 260, ease: 'Cubic.in', onComplete: () => this.sprite.setVisible(false).setActive(false) });
    return true;
  }

  reset() {
    this.scene.tweens.killTweensOf(this.sprite);
    this.defeated = false; this.awake = false; this.state = 'idle';
    this.sprite.setPosition(this.config.x, this.config.y).setAlpha(1).setScale(1).setFlipX(false).setActive(false).setVisible(false);
    this.body.reset(this.config.x, this.config.y); this.body.enable = false;
  }

  destroy() { this.sprite.destroy(); }
}
