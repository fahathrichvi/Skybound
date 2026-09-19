import type { BloblingConfig } from '../../levels/types';
import { EnemyBase } from './EnemyBase';

export class Blobling extends EnemyBase {
  private direction: -1 | 1 = -1;
  declare readonly config: BloblingConfig;

  constructor(scene: Phaser.Scene, config: BloblingConfig) {
    super(scene, config, 'blobling-0');
    this.body.setSize(44, 30).setOffset(8, 15).setMaxVelocity(config.speed, 900);
    this.sprite.play('blobling-patrol');
    this.setAwake(false);
  }

  update(_time: number, _delta: number) {
    if (!this.awake || this.defeated) return;
    if (this.sprite.x <= this.config.patrolFrom + 4 || this.body.blocked.left) this.direction = 1;
    if (this.sprite.x >= this.config.patrolTo - 4 || this.body.blocked.right) this.direction = -1;
    this.body.setVelocityX(this.direction * this.config.speed);
    this.sprite.setFlipX(this.direction < 0).play('blobling-patrol', true);
    this.state = 'patrol';
  }

  override reset() { super.reset(); this.direction = -1; this.sprite.setTexture('blobling-0').play('blobling-patrol'); }
}
