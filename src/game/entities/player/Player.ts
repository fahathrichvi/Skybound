import Phaser from 'phaser';
import { PLAYER_CONFIG } from '../../config/player';
import { PlayerMotor, type MovementInput, type PlayerState } from './PlayerMotor';
import { createPlayerArt } from './PlayerArt';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly visual: Phaser.GameObjects.Sprite;
  readonly motor = new PlayerMotor();
  state: PlayerState = 'idle';
  private landTime = -Infinity;
  private wasAirborne = false;
  constructor(private scene: Phaser.Scene, x: number, y: number, private reducedMotion: boolean) {
    createPlayerArt(scene);
    this.sprite = scene.physics.add.sprite(x, y, 'ari-body').setOrigin(.5, 1).setVisible(false).setCollideWorldBounds(true);
    this.body.setSize(28, 64).setOffset(2, 8).setMaxVelocity(PLAYER_CONFIG.runSpeed, PLAYER_CONFIG.maxFallSpeed);
    this.visual = scene.add.sprite(x, y, 'ari-idle-0').setOrigin(.5, 1).setDepth(20);
  }
  get body() { return this.sprite.body as Phaser.Physics.Arcade.Body; }
  setReducedMotion(value: boolean) { this.reducedMotion = value; }
  update(now: number, delta: number, input: MovementInput) {
    const grounded = this.body.blocked.down || this.body.touching.down;
    const next = this.motor.step(now, delta / 1000, { vx: this.body.velocity.x, vy: this.body.velocity.y, grounded }, input);
    this.body.setVelocity(next.vx, next.vy);
    this.state = next.state;
    if (next.landed && this.wasAirborne) this.landTime = now;
    this.wasAirborne = !grounded || next.jumped;
    this.visual.play(`ari-${next.state}`, true).setFlipX(next.facing < 0);
    this.syncVisual();
    const squash = this.reducedMotion ? 0 : Math.max(0, 1 - (now - this.landTime) / 140);
    this.visual.setScale(1 + squash * .16, 1 - squash * .15);
  }
  syncVisual = () => { this.visual.setPosition(this.sprite.x, this.body.bottom); };
  reset(x: number, y: number) {
    this.body.reset(x, y); this.body.setVelocity(0, 0); this.motor.reset(); this.landTime = -Infinity;
    this.wasAirborne = false; this.state = 'idle'; this.visual.setScale(1).setFlipX(false).play('ari-idle'); this.syncVisual();
  }
  destroy() { this.scene.events.off(Phaser.Scenes.Events.POST_UPDATE, this.syncVisual); this.visual.destroy(); this.sprite.destroy(); }
}
