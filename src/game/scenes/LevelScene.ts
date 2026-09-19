import Phaser from 'phaser';
import { GameBridge } from '../bridge';
import { EnemySystem } from '../entities/enemies/EnemySystem';
import { BossSystem } from '../entities/bosses/BossSystem';
import { Player } from '../entities/player/Player';
import { PlayerInput } from '../entities/player/PlayerInput';
import { PlayerVitals, type DamageResult } from '../entities/player/PlayerVitals';
import { PRACTICE_LEVEL } from '../levels/practice';
import type { LevelConfig } from '../levels/types';
import { GameObjectSystem } from '../objects/GameObjectSystem';
import { FollowCamera } from '../systems/FollowCamera';
import { RunProgress } from '../systems/RunProgress';
import { ParallaxWorld } from '../world/ParallaxWorld';
import { resolveLevel, regionAt } from '../world/levelData';
import { WorldBuilder } from '../world/WorldBuilder';

export class LevelScene extends Phaser.Scene {
  private player!: Player;
  private controls!: PlayerInput;
  private followCamera!: FollowCamera;
  private userPaused = false;
  private suspended = false;
  private debug = false;
  private debugSafe = false;
  private debugText?: Phaser.GameObjects.Text;
  private nextDebugAt = 0;
  private nextRunAt = 0;
  private world!: WorldBuilder;
  private scenery!: ParallaxWorld;
  private level!: LevelConfig;
  private recoveries = 0;
  private currentRegion = '';
  private notice!: Phaser.GameObjects.Text;
  private objects!: GameObjectSystem;
  private enemies!: EnemySystem;
  private boss?: BossSystem;
  private vitals = new PlayerVitals();
  private run = new RunProgress();
  private completed = false;
  private dying = false;
  private gameOver = false;
  private previousPlayerState = 'idle';
  private windNoticeId?: number;
  private activeWindZone?: number;

  constructor(private bridge: GameBridge, private reducedMotion: boolean, private definition: unknown, key = 'Level') { super(key); }

  create() {
    this.userPaused = this.suspended = false;
    this.recoveries = 0; this.currentRegion = ''; this.nextDebugAt = this.nextRunAt = 0;
    this.completed = this.dying = this.gameOver = false; this.previousPlayerState = 'idle'; this.vitals.reset(); this.run.start(this.time.now);
    const resolved = resolveLevel(this.definition, PRACTICE_LEVEL);
    this.level = resolved.level;
    if (resolved.warning) this.bridge.emit({ type: 'error', message: resolved.warning });
    const query = new URLSearchParams(location.search);
    this.debug = import.meta.env.DEV && query.get('debug') === 'true';
    this.debugSafe = this.debug && query.get('safe') === 'true';
    this.physics.world.setBounds(0, 0, this.level.width, this.level.height);
    this.scenery = new ParallaxWorld(this, this.level, this.reducedMotion);
    this.world = new WorldBuilder(this, this.level);
    for (const zone of this.level.windZones ?? []) {
      const current = this.add.rectangle(zone.x + zone.width / 2, zone.y + zone.height / 2, zone.width, zone.height, 0xbde8cf, .055).setDepth(3);
      current.setStrokeStyle(1, 0xd8f1be, .14);
      if (!this.reducedMotion) this.tweens.add({ targets: current, alpha: .13, duration: 850, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y, this.reducedMotion);
    this.world.connect(this.player);
    this.objects = new GameObjectSystem(this, this.level, this.player, {
      progress: snapshot => {
        if (this.run.trackObjects(snapshot) > 0) this.emitRun();
        this.bridge.emit({ type: 'objects', snapshot });
      },
      checkpoint: () => undefined,
      complete: snapshot => this.completeLevel(snapshot),
      announce: message => this.bridge.emit({ type: 'announcement', message }),
      sound: cue => this.bridge.emit({ type: 'sound', cue }),
    }, this.reducedMotion);
    this.objects.connect();
    this.enemies = new EnemySystem(this, this.level, this.player, this.world, {
      defeated: (_id, kind) => {
        this.run.defeatEnemy(); this.emitRun(); this.emitCombat();
        this.bridge.emit({ type: 'sound', cue: 'enemy' });
        this.bridge.emit({ type: 'announcement', message: `+200 · ${kind === 'blobling' ? 'Blobling' : 'Wingling'} dispersed!` });
        if (!this.reducedMotion) this.cameras.main.shake(80, .0025);
      },
      hurt: sourceX => this.damagePlayer(sourceX),
    });
    if (this.debugSafe) this.enemies.setDamageEnabled(false);
    if (this.level.boss) this.boss = new BossSystem(this, this.level.boss, this.player, this.world, { hurt: sourceX => this.damagePlayer(sourceX), announce: message => this.bridge.emit({ type: 'announcement', message }), phase: () => this.emitBoss(), defeated: () => { this.bridge.emit({ type: 'sound', cue: 'complete' }); this.completeLevel(this.objects.snapshot()); } });
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.notice = this.add.text(640, 130, '', { fontFamily: 'sans-serif', fontSize: '18px', color: '#f1f3d7', backgroundColor: '#1e493f', padding: { x: 18, y: 12 } }).setOrigin(.5).setScrollFactor(0).setDepth(80).setVisible(false);
    if (this.debug) this.world.drawDebug();
    this.controls = new PlayerInput(this.game.canvas, () => { this.userPaused = !this.userPaused; this.applyPause(); }, () => this.restartRun());
    this.followCamera = new FollowCamera(this.cameras.main, this.player.sprite, this.level.width, this.level.height);
    this.events.on(Phaser.Scenes.Events.POST_UPDATE, this.player.syncVisual);
    if (this.debug) this.debugText = this.add.text(20, 150, '', { fontFamily: 'monospace', fontSize: '15px', color: '#f5f9cf', backgroundColor: '#183a32', padding: { x: 12, y: 8 } }).setScrollFactor(0).setDepth(100);
    const unsubscribe = this.bridge.onCommand(command => {
      if (command.type === 'suspend') { this.suspended = command.suspended; this.applyPause(); }
      if (command.type === 'pause' || command.type === 'resume') { this.userPaused = command.type === 'pause'; this.applyPause(); }
      if (command.type === 'restart') this.restartRun();
      if (command.type === 'continue' && this.completed) {
        this.completed = false; this.player.reset(Math.max(this.level.spawn.x, this.player.sprite.x - 150), this.player.body.bottom);
        this.enemies.setFrozen(false); this.enemies.setDamageEnabled(!this.debugSafe);
        this.bridge.emit({ type: 'objects', snapshot: this.objects.snapshot() });
      }
      if (command.type === 'input' && !this.userPaused && !this.suspended && !this.gameOver) this.controls.setTouch(command.action, command.pressed);
      if (command.type === 'preferences') {
        this.reducedMotion = command.reducedMotion; this.player.setReducedMotion(command.reducedMotion);
        this.scenery.setReducedMotion(command.reducedMotion); this.objects.setReducedMotion(command.reducedMotion);
        this.vitals.setLivesEnabled(!command.casualMode); this.emitCombat();
      }
    });
    const blur = () => { this.userPaused = true; this.applyPause(); };
    const hidden = () => { if (document.hidden) blur(); };
    window.addEventListener('blur', blur); document.addEventListener('visibilitychange', hidden);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      unsubscribe(); this.boss?.destroy(); this.controls.destroy(); this.enemies.destroy(); this.objects.destroy(); this.player.destroy(); this.world.destroy();
      window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', hidden); delete this.game.canvas.dataset.debug;
    });
    this.bridge.emit({ type: 'level', id: this.level.id, name: this.level.name });
    this.emitCombat(); this.emitBoss(); this.emitRun(); this.bridge.emit({ type: 'ready' });
    if (!this.reducedMotion) this.cameras.main.fadeIn(350, 22, 53, 43);
    this.writeDebug();
  }

  private applyPause() {
    const paused = this.userPaused || this.suspended;
    this.controls.clear(); this.player.motor.clearBufferedInput();
    if (paused) this.scene.pause(); else this.scene.resume();
    this.bridge.emit({ type: 'paused', paused }); this.writeDebug();
  }

  private restartRun() {
    this.completed = this.dying = this.gameOver = false; this.recoveries = 0; this.previousPlayerState = 'idle'; this.vitals.reset(); this.run.start(this.time.now);
    this.objects.reset(); this.enemies.reset(); this.boss?.reset(); this.enemies.setDamageEnabled(!this.debugSafe); this.emitCombat(); this.emitBoss(); this.emitRun();
    this.controls.clear(); this.player.reset(this.level.spawn.x, this.level.spawn.y);
    this.notice.setVisible(false); this.followCamera.reset(); this.userPaused = false; this.applyPause();
    if (!this.reducedMotion) this.cameras.main.fadeIn(240, 22, 53, 43);
  }

  update(time: number, delta: number) {
    if (!this.dying && !this.gameOver && this.player.body.top > this.level.fallLimit) {
      this.recoveries++; this.beginDefeat(this.vitals.fall(), 'The trail slipped away…');
    }
    if (this.completed || this.dying || this.gameOver) {
      this.followCamera.update(delta, 0);
      if (time >= this.nextDebugAt) { this.writeDebug(); this.nextDebugAt = time + 40; }
      return;
    }
    this.player.update(time, delta, this.controls.read());
    this.applyWind(delta);
    if (this.player.state === 'jump' && this.previousPlayerState !== 'jump') this.bridge.emit({ type: 'sound', cue: 'jump' });
    if (this.player.state === 'land' && this.previousPlayerState !== 'land') this.bridge.emit({ type: 'sound', cue: 'land' });
    this.previousPlayerState = this.player.state; this.enemies.update(time, delta); this.boss?.update(time); this.emitBoss();
    const region = regionAt(this.level, this.player.sprite.x).name;
    if (region !== this.currentRegion) { this.currentRegion = region; this.bridge.emit({ type: 'region', name: region }); }
    this.followCamera.update(delta, this.player.body.velocity.x);
    if (time >= this.nextRunAt) { this.emitRun(); this.nextRunAt = time + 250; }
    if (time >= this.nextDebugAt) { this.writeDebug(); this.nextDebugAt = time + 40; }
  }

  private damagePlayer(sourceX: number) {
    if (this.completed || this.dying || this.gameOver) return false;
    const result = this.vitals.damage(this.time.now);
    if (!result.applied) return false;
    this.player.takeHit(this.time.now, sourceX); this.emitCombat();
    this.bridge.emit({ type: 'sound', cue: result.knockedOut ? 'defeat' : 'hit' });
    if (!this.reducedMotion) this.cameras.main.shake(130, .004);
    if (!result.knockedOut) {
      this.bridge.emit({ type: 'announcement', message: `${result.hearts} ${result.hearts === 1 ? 'heart' : 'hearts'} remaining` });
      return true;
    }
    this.beginDefeat(result, 'Ari lost their light…'); return true;
  }

  private applyWind(delta: number) {
    const x = this.player.sprite.x, y = this.player.body.center.y;
    const zone = (this.level.windZones ?? []).find(candidate => x >= candidate.x && x <= candidate.x + candidate.width && y >= candidate.y && y <= candidate.y + candidate.height);
    if (!zone) { this.windNoticeId = this.activeWindZone = undefined; return; }
    this.player.body.setVelocityX(Phaser.Math.Clamp(this.player.body.velocity.x + zone.strength * delta / 1000, -520, 520));
    const id = (this.level.windZones ?? []).indexOf(zone); this.activeWindZone = id;
    if (this.windNoticeId !== id) { this.windNoticeId = id; this.bridge.emit({ type: 'announcement', message: zone.strength > 0 ? 'A tailwind carries Ari forward' : 'A crosswind presses against the trail' }); }
  }

  private beginDefeat(result: DamageResult, message: string) {
    if (!result.applied) return;
    this.dying = true; this.controls.clear(); this.enemies.setDamageEnabled(false); this.player.playDefeat(); this.emitCombat();
    this.bridge.emit({ type: 'announcement', message });
    this.time.delayedCall(650, () => {
      if (result.gameOver) {
        this.dying = false; this.gameOver = true; this.enemies.setFrozen(true);
        this.bridge.emit({ type: 'game-over', combat: this.combatSnapshot(), run: this.run.snapshot(this.time.now) }); this.writeDebug(); return;
      }
      const respawn = this.objects.progress.getRespawn();
      this.player.reset(respawn.x, respawn.y); this.vitals.revive(this.time.now); this.dying = false;
      this.enemies.setDamageEnabled(!this.debugSafe); this.followCamera.reset(); this.emitCombat();
      if (!this.reducedMotion) this.cameras.main.fadeIn(180, 22, 53, 43);
      this.notice.setText(this.objects.snapshot().checkpointId ? 'Revived at the checkpoint.' : 'Revived at the trailhead.').setVisible(true);
      this.time.delayedCall(1800, () => this.notice.setVisible(false));
      this.bridge.emit({ type: 'announcement', message: this.objects.snapshot().checkpointId ? 'Revived at the checkpoint' : 'Revived at the trailhead' });
    });
  }

  private combatSnapshot() {
    const vitals = this.vitals.snapshot(this.time.now), enemies = this.enemies?.snapshot();
    return { hearts: vitals.hearts, maxHearts: vitals.maxHearts, lives: vitals.lives, maxLives: vitals.maxLives, deaths: vitals.deaths,
      enemiesDefeated: enemies?.defeated ?? 0, totalEnemies: enemies?.total ?? this.level.enemies.length };
  }
  private completeLevel(snapshot: import('../objects/ObjectProgress').ObjectSnapshot) {
    if (this.completed) return;
    this.completed = true; this.controls.clear(); this.player.body.setVelocity(0, 0); this.enemies.setFrozen(true); this.enemies.setDamageEnabled(false);
    const vitals = this.vitals.snapshot(this.time.now), enemies = this.enemies.snapshot();
    const result = this.run.complete(this.time.now, { levelId: this.level.id, shards: snapshot.shards, totalShards: snapshot.totalShards, gems: snapshot.gems, totalGems: snapshot.totalGems, enemiesDefeated: enemies.defeated, totalEnemies: enemies.total, hearts: vitals.hearts, deaths: vitals.deaths });
    this.emitRun(); this.bridge.emit({ type: 'level-complete', snapshot, result });
  }
  private emitCombat() { this.bridge.emit({ type: 'combat', snapshot: this.combatSnapshot() }); }
  private emitBoss() { if (this.boss) this.bridge.emit({ type: 'boss', snapshot: this.boss.snapshot() }); }
  private emitRun() { this.bridge.emit({ type: 'run', snapshot: this.run.snapshot(this.time.now) }); }

  private writeDebug() {
    if (!this.debug) return;
    const b = this.player.body;
    const snapshot = { x: this.player.sprite.x, y: b.bottom, vx: b.velocity.x, vy: b.velocity.y,
      grounded: b.blocked.down || b.touching.down, ceiling: b.blocked.up, state: this.player.state,
      cameraX: this.cameras.main.scrollX, cameraY: this.cameras.main.scrollY,
      paused: this.userPaused || this.suspended, fps: this.game.loop.actualFps,
      levelId: this.level.id, region: this.currentRegion, recoveries: this.recoveries,
      worldWidth: this.level.width, worldHeight: this.level.height, tileCount: this.world.tileCount,
      oneWayCount: this.level.platforms.filter(platform => platform.kind === 'one-way').length,
      parallax: this.scenery.layers.map(layer => layer.scrollFactorX), objects: this.objects.snapshot(), objectBodies: this.objects.diagnostics(),
      combat: { ...this.vitals.snapshot(this.time.now), enemies: this.enemies.snapshot() }, run: this.run.snapshot(this.time.now), windZones: this.level.windZones?.length ?? 0, activeWindZone: this.activeWindZone,
      completed: this.completed, dying: this.dying, gameOver: this.gameOver };
    this.game.canvas.dataset.debug = JSON.stringify(snapshot);
    this.debugText?.setText(`FPS ${snapshot.fps.toFixed(0)}  ARI ${snapshot.x.toFixed(0)}, ${snapshot.y.toFixed(0)}\n${snapshot.state.toUpperCase()}  vx ${snapshot.vx.toFixed(0)}  vy ${snapshot.vy.toFixed(0)}${snapshot.paused ? '  PAUSED' : ''}`);
  }
}
