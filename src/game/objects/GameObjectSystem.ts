import Phaser from 'phaser';
import type { Player } from '../entities/player/Player';
import type { BlockConfig, CheckpointConfig, CollectibleConfig, LevelConfig, Point } from '../levels/types';
import { ObjectProgress, type ObjectSnapshot } from './ObjectProgress';
import { createObjectArt } from './ObjectArt';
import type { SoundCue } from '../audio/AudioManager';

export interface ObjectEvents {
  progress(snapshot: ObjectSnapshot): void;
  checkpoint(id: string, respawn: Point): void;
  complete(snapshot: ObjectSnapshot): void;
  announce(message: string): void;
  sound(cue: SoundCue): void;
}
type DataSprite = Phaser.Physics.Arcade.Sprite & { getData(key: 'config'): CollectibleConfig | BlockConfig | CheckpointConfig };

export class GameObjectSystem {
  readonly progress: ObjectProgress;
  private collectibles: Phaser.Physics.Arcade.StaticGroup;
  private blocks: Phaser.Physics.Arcade.StaticGroup;
  private checkpoints: Phaser.Physics.Arcade.StaticGroup;
  private exit?: Phaser.Physics.Arcade.Sprite;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private tweens: Phaser.Tweens.Tween[] = [];
  constructor(private scene: Phaser.Scene, level: LevelConfig, private player: Player, private events: ObjectEvents, reducedMotion: boolean) {
    createObjectArt(scene);
    this.progress = new ObjectProgress(level);
    this.collectibles = scene.physics.add.staticGroup();
    this.blocks = scene.physics.add.staticGroup();
    this.checkpoints = scene.physics.add.staticGroup();
    this.particles = scene.add.particles(0, 0, 'object-spark', { lifespan: 520, speed: { min: 55, max: 150 }, angle: { min: 0, max: 360 }, gravityY: 220, scale: { start: .8, end: 0 }, emitting: false }).setDepth(40);
    for (const item of level.collectibles) {
      const sprite = this.collectibles.create(item.x, item.y, item.kind === 'gem' ? 'crystal-gem' : 'star-shard') as DataSprite;
      sprite.setData('config', item).setDepth(14).refreshBody();
      if (!reducedMotion) this.tweens.push(scene.tweens.add({ targets: sprite, y: item.y - 8, duration: 850 + (item.x % 5) * 90, yoyo: true, repeat: -1, ease: 'Sine.inOut' }));
    }
    for (const block of level.blocks) {
      const sprite = this.blocks.create(block.x, block.y, block.kind === 'mystery' ? 'mystery-crystal' : 'breakable-block') as DataSprite;
      sprite.setOrigin(.5).setData('config', block).setDepth(12).refreshBody();
    }
    for (const checkpoint of level.checkpoints) {
      const sprite = this.checkpoints.create(checkpoint.x, checkpoint.y, 'checkpoint-off') as DataSprite;
      sprite.setOrigin(.5, 1).setData('config', checkpoint).setDepth(13).refreshBody();
      const body = sprite.body as Phaser.Physics.Arcade.StaticBody; body.setSize(44, 92).setOffset(4, 8); body.updateFromGameObject();
    }
    if (level.exit) {
      this.exit = scene.physics.add.staticSprite(level.exit.x, level.exit.y, 'exit-portal').setOrigin(.5, 1).setDepth(13);
      const body = this.exit.body as Phaser.Physics.Arcade.StaticBody; body.setSize(68, 112).setOffset(12, 16); body.updateFromGameObject();
      if (!reducedMotion) this.tweens.push(scene.tweens.add({ targets: this.exit, alpha: .72, scaleX: .96, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' }));
    }
  }
  connect() {
    this.scene.physics.add.overlap(this.player.sprite, this.collectibles, (_player, target) => this.collect(target as DataSprite));
    this.scene.physics.add.overlap(this.player.sprite, this.checkpoints, (_player, target) => this.activate(target as DataSprite));
    if (this.exit) this.scene.physics.add.overlap(this.player.sprite, this.exit, () => this.finish());
    this.scene.physics.add.collider(this.player.sprite, this.blocks, (_player, target) => this.hitBlock(target as DataSprite));
    this.events.progress(this.progress.snapshot());
  }
  private collect(sprite: DataSprite) {
    if (!sprite.active) return;
    const config = sprite.getData('config') as CollectibleConfig;
    if (!this.progress.collect(config.id, config.kind)) return;
    this.burst(sprite.x, sprite.y, config.kind === 'gem' ? 18 : 8);
    sprite.disableBody(true, true); this.events.progress(this.progress.snapshot());
    this.events.sound(config.kind === 'gem' ? 'gem' : 'shard');
    this.events.announce(config.kind === 'gem' ? 'Crystal Gem discovered!' : '+1 Star Shard');
  }
  private activate(sprite: DataSprite) {
    const config = sprite.getData('config') as CheckpointConfig;
    if (!this.progress.activateCheckpoint(config.id, config.respawn)) return;
    for (const child of this.checkpoints.getChildren()) (child as Phaser.Physics.Arcade.Sprite).setTexture('checkpoint-off');
    sprite.setTexture('checkpoint-on'); this.burst(sprite.x, sprite.y - 44, 24);
    this.events.checkpoint(config.id, config.respawn); this.events.progress(this.progress.snapshot());
    this.events.sound('checkpoint');
    this.events.announce('Checkpoint awakened');
  }
  private hitBlock(sprite: DataSprite) {
    if (!sprite.active) return;
    const config = sprite.getData('config') as BlockConfig;
    const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
    const fromBelow = this.player.body.prev.y >= body.bottom - 4 && this.player.body.top <= body.bottom + 3;
    if (config.kind === 'mystery' && fromBelow) {
      const reward = config.reward ?? 1;
      if (!this.progress.useBlock(config.id, reward)) return;
      sprite.setTexture('used-crystal'); this.burst(sprite.x, sprite.y, 16);
      this.events.progress(this.progress.snapshot()); this.events.announce(`Mystery Crystal: +${reward} Star Shards`);
      this.events.sound('block');
      this.scene.tweens.add({ targets: sprite, y: sprite.y - 10, duration: 70, yoyo: true });
      return;
    }
    const fromSide = this.player.body.right <= body.left + 5 || this.player.body.left >= body.right - 5;
    const sprintImpact = this.player.state === 'sprint' && fromSide && this.player.body.bottom > body.top + 8;
    if (config.kind === 'breakable' && sprintImpact && !this.progress.isUsed(config.id)) {
      this.progress.useBlock(config.id, 0); this.burst(sprite.x, sprite.y, 22);
      sprite.disableBody(true, true); this.events.progress(this.progress.snapshot()); this.events.announce('Brittle block shattered!'); this.events.sound('block');
    }
  }
  private finish() {
    if (!this.progress.complete()) return;
    if (this.exit) this.burst(this.exit.x, this.exit.y - 60, 34);
    this.events.sound('complete');
    this.events.progress(this.progress.snapshot()); this.events.complete(this.progress.snapshot());
  }
  private burst(x: number, y: number, amount: number) { this.particles.explode(amount, x, y); }
  reset() {
    this.progress.reset();
    for (const child of this.collectibles.getChildren()) { const sprite = child as DataSprite; sprite.enableBody(false, sprite.x, (sprite.getData('config') as CollectibleConfig).y, true, true); }
    for (const child of this.blocks.getChildren()) {
      const sprite = child as DataSprite, config = sprite.getData('config') as BlockConfig;
      sprite.enableBody(false, config.x, config.y, true, true).setTexture(config.kind === 'mystery' ? 'mystery-crystal' : 'breakable-block');
    }
    for (const child of this.checkpoints.getChildren()) (child as Phaser.Physics.Arcade.Sprite).setTexture('checkpoint-off');
    this.events.progress(this.progress.snapshot());
  }
  setReducedMotion(reduced: boolean) { for (const tween of this.tweens) if (reduced) tween.pause(); else tween.resume(); }
  snapshot() { return this.progress.snapshot(); }
  diagnostics() {
    return { activeCollectibles: this.collectibles.countActive(true), activeBlocks: this.blocks.countActive(true),
      activeCheckpoints: this.checkpoints.countActive(true), exitActive: this.exit?.active ?? false };
  }
  destroy() { this.tweens.forEach(tween => tween.destroy()); this.particles.destroy(); }
}
