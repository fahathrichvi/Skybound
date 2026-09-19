import type { WinglingConfig } from '../../levels/types';
import { EnemyBase } from './EnemyBase';

export class Wingling extends EnemyBase {
  declare readonly config: WinglingConfig;
  private previousX: number;

  constructor(scene: Phaser.Scene, config: WinglingConfig) {
    super(scene, config, 'wingling-0');
    this.previousX = config.x;
    this.body.setAllowGravity(false).setImmovable(true).setSize(46, 34).setOffset(11, 12);
    this.body.moves = false;
    this.sprite.play('wingling-patrol');
    this.setAwake(false);
  }

  update(time: number, _delta: number) {
    if (!this.awake || this.defeated) return;
    const range = this.config.patrolTo - this.config.patrolFrom;
    const period = Math.max(1800, range / this.config.speed * 2000);
    const phase = time / period * Math.PI * 2 + (this.config.x % 7) * .24;
    const x = this.config.patrolFrom + range * (.5 + Math.sin(phase) * .5);
    const y = this.config.y + Math.sin(phase * 2) * this.config.waveHeight;
    this.sprite.setFlipX(x < this.previousX).setPosition(x, y).play('wingling-patrol', true);
    this.body.updateFromGameObject(); this.previousX = x; this.state = 'patrol';
  }

  override reset() { super.reset(); this.previousX = this.config.x; this.sprite.setTexture('wingling-0').play('wingling-patrol'); }
}
