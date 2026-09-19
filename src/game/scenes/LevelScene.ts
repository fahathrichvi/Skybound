import Phaser from 'phaser';
import { GameBridge } from '../bridge';
import { Player } from '../entities/player/Player';
import { PlayerInput } from '../entities/player/PlayerInput';
import { PRACTICE_LEVEL } from '../levels/practice';
import type { LevelConfig } from '../levels/types';
import { resolveLevel, regionAt } from '../world/levelData';
import { WorldBuilder } from '../world/WorldBuilder';
import { ParallaxWorld } from '../world/ParallaxWorld';
import { FollowCamera } from '../systems/FollowCamera';

export class LevelScene extends Phaser.Scene {
  private player!: Player;
  private controls!: PlayerInput;
  private followCamera!: FollowCamera;
  private userPaused = false;
  private suspended = false;
  private debug = false;
  private debugText?: Phaser.GameObjects.Text;
  private nextDebugAt = 0;
  private world!: WorldBuilder;
  private scenery!: ParallaxWorld;
  private level!: LevelConfig;
  private recoveries = 0;
  private currentRegion = '';
  private notice!: Phaser.GameObjects.Text;
  constructor(private bridge: GameBridge, private reducedMotion: boolean, private definition: unknown, key = 'Level') { super(key); }
  create() {
    this.userPaused = this.suspended = false;
    this.recoveries = 0; this.currentRegion = ''; this.nextDebugAt = 0;
    const resolved = resolveLevel(this.definition, PRACTICE_LEVEL);
    this.level = resolved.level;
    if (resolved.warning) this.bridge.emit({ type: 'error', message: resolved.warning });
    this.debug = import.meta.env.DEV && new URLSearchParams(location.search).get('debug') === 'true';
    this.physics.world.setBounds(0, 0, this.level.width, this.level.height);
    this.scenery = new ParallaxWorld(this, this.level, this.reducedMotion);
    this.world = new WorldBuilder(this, this.level);
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y, this.reducedMotion);
    this.world.connect(this.player);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.notice = this.add.text(640, 130, '', { fontFamily: 'sans-serif', fontSize: '18px', color: '#f1f3d7', backgroundColor: '#1e493f', padding: { x: 18, y: 12 } }).setOrigin(.5).setScrollFactor(0).setDepth(80).setVisible(false);
    if (this.debug) this.world.drawDebug();
    this.controls = new PlayerInput(this.game.canvas, () => { this.userPaused = !this.userPaused; this.applyPause(); }, () => this.restartRun());
    this.followCamera = new FollowCamera(this.cameras.main, this.player.sprite, this.level.width, this.level.height);
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.player.syncVisual);
    if (this.debug) this.debugText = this.add.text(20, 85, '', { fontFamily: 'monospace', fontSize: '15px', color: '#f5f9cf', backgroundColor: '#183a32', padding: { x: 12, y: 8 } }).setScrollFactor(0).setDepth(100);
    const unsubscribe = this.bridge.onCommand(command => {
      if (command.type === 'suspend') { this.suspended = command.suspended; this.applyPause(); }
      if (command.type === 'pause' || command.type === 'resume') { this.userPaused = command.type === 'pause'; this.applyPause(); }
      if (command.type === 'restart') this.restartRun();
      if (command.type === 'input' && !this.userPaused && !this.suspended) this.controls.setTouch(command.action, command.pressed);
      if (command.type === 'preferences') {
        this.reducedMotion = command.reducedMotion; this.player.setReducedMotion(command.reducedMotion);
        this.scenery.setReducedMotion(command.reducedMotion);
      }
    });
    const blur = () => { this.userPaused = true; this.applyPause(); };
    const hidden = () => { if (document.hidden) blur(); };
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', hidden);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubscribe(); this.controls.destroy(); this.player.destroy(); this.world.destroy();
      window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden);
      delete this.game.canvas.dataset.debug;
    });
    this.bridge.emit({ type: 'level', id: this.level.id, name: this.level.name });
    this.bridge.emit({ type: 'ready' });
    if (!this.reducedMotion) this.cameras.main.fadeIn(350, 22, 53, 43);
    this.writeDebug();
  }
  private applyPause() {
    const paused = this.userPaused || this.suspended;
    this.controls.clear(); this.player.motor.clearBufferedInput();
    if (paused) this.scene.pause(); else this.scene.resume();
    this.bridge.emit({ type: 'paused', paused });
    this.writeDebug();
  }
  private restartRun() {
    this.controls.clear(); this.player.reset(this.level.spawn.x, this.level.spawn.y);
    this.notice.setVisible(false); this.followCamera.reset(); this.userPaused = false; this.applyPause();
  }
  update(time: number, delta: number) {
    if (this.player.body.top > this.level.fallLimit) {
      this.recoveries++;
      this.restartRun();
      this.notice.setText('A fresh start. Try holding jump across the gap.').setVisible(true);
      this.time.delayedCall(2300, () => this.notice.setVisible(false));
    }
    this.player.update(time, delta, this.controls.read());
    const region = regionAt(this.level, this.player.sprite.x).name;
    if (region !== this.currentRegion) { this.currentRegion = region; this.bridge.emit({ type: 'region', name: region }); }
    this.followCamera.update(delta, this.player.body.velocity.x);
    if (time >= this.nextDebugAt) { this.writeDebug(); this.nextDebugAt = time + 40; }
  }
  private writeDebug() {
    if (!this.debug) return;
    const b = this.player.body;
    const snapshot = { x: this.player.sprite.x, y: b.bottom, vx: b.velocity.x, vy: b.velocity.y,
      grounded: b.blocked.down || b.touching.down, ceiling: b.blocked.up, state: this.player.state,
      cameraX: this.cameras.main.scrollX, cameraY: this.cameras.main.scrollY,
      paused: this.userPaused || this.suspended, fps: this.game.loop.actualFps,
      levelId: this.level.id, region: this.currentRegion, recoveries: this.recoveries,
      worldWidth: this.level.width, worldHeight: this.level.height,
      tileCount: this.world.tileCount,
      oneWayCount: this.level.platforms.filter(platform => platform.kind === 'one-way').length,
      parallax: this.scenery.layers.map(layer => layer.scrollFactorX) };
    // Read-only telemetry for local browser checks; no exposed entities or dev cheats.
    this.game.canvas.dataset.debug = JSON.stringify(snapshot);
    this.debugText?.setText(`FPS ${snapshot.fps.toFixed(0)}  ARI ${snapshot.x.toFixed(0)}, ${snapshot.y.toFixed(0)}\n${snapshot.state.toUpperCase()}  vx ${snapshot.vx.toFixed(0)}  vy ${snapshot.vy.toFixed(0)}${snapshot.paused ? '  PAUSED' : ''}`);
  }
}
