import Phaser from 'phaser';
import type { Player } from '../player/Player';
import type { LevelConfig } from '../../levels/types';
import type { WorldBuilder } from '../../world/WorldBuilder';
import { Blobling } from './Blobling';
import { Wingling } from './Wingling';
import { EnemyBase, type EnemyState } from './EnemyBase';
import { createEnemyArt } from './EnemyArt';

export interface EnemySnapshot {
  readonly defeated: number;
  readonly total: number;
  readonly active: number;
  readonly lastContact?: { readonly airborne: boolean; readonly previousBottom: number; readonly currentBottom: number; readonly velocityY: number; readonly enemyTop: number; readonly stomp: boolean };
  readonly states: readonly { id: string; kind: 'blobling' | 'wingling'; state: EnemyState; x: number; y: number }[];
}

export interface EnemyEvents {
  defeated(id: string, kind: 'blobling' | 'wingling'): void;
  hurt(sourceX: number): boolean;
}

export function isStomp(previousBottom: number, currentBottom: number, velocityY: number, enemyTop: number) {
  return velocityY > -80 && previousBottom <= enemyTop + 8 && currentBottom <= enemyTop + 24;
}

export class EnemySystem {
  private readonly enemies: EnemyBase[];
  private readonly all: Phaser.Physics.Arcade.Group;
  private defeatedCount = 0;
  private frozen = false;
  private damageEnabled = true;
  private lastContact?: EnemySnapshot['lastContact'];

  constructor(scene: Phaser.Scene, level: LevelConfig, private player: Player, world: WorldBuilder, private events: EnemyEvents) {
    createEnemyArt(scene);
    this.all = scene.physics.add.group();
    this.enemies = level.enemies.map(config => config.kind === 'blobling' ? new Blobling(scene, config) : new Wingling(scene, config));
    for (const enemy of this.enemies) {
      this.all.add(enemy.sprite);
      if (enemy instanceof Blobling) {
        scene.physics.add.collider(enemy.sprite, world.terrain);
        scene.physics.add.collider(enemy.sprite, world.solids);
      }
    }
    scene.physics.add.overlap(player.sprite, this.all, (_player, target) => this.contact((target as Phaser.Physics.Arcade.Sprite).getData('enemy') as EnemyBase));
  }

  update(time: number, delta: number) {
    if (this.frozen) { this.enemies.forEach(enemy => enemy.pause()); return; }
    for (const enemy of this.enemies) {
      if (!enemy.defeated) enemy.setAwake(Math.abs(this.player.sprite.x - enemy.sprite.x) < 800);
      enemy.update(time, delta);
    }
  }

  private contact(enemy: EnemyBase) {
    if (this.frozen || enemy.defeated || !enemy.body.enable) return;
    const player = this.player.body;
    const airborne = !player.blocked.down && !player.touching.down;
    const stomp = airborne && isStomp(player.prev.y + player.height, player.bottom, player.velocity.y, enemy.body.top);
    this.lastContact = { airborne, previousBottom: player.prev.y + player.height, currentBottom: player.bottom, velocityY: player.velocity.y, enemyTop: enemy.body.top, stomp };
    if (stomp) {
      if (enemy.defeat()) {
        this.defeatedCount++; this.player.bounceFromEnemy();
        this.events.defeated(enemy.config.id, enemy.config.kind);
      }
      return;
    }
    if (this.damageEnabled) this.events.hurt(enemy.sprite.x);
  }

  setFrozen(value: boolean) { this.frozen = value; if (value) this.enemies.forEach(enemy => enemy.pause()); }
  setDamageEnabled(value: boolean) { this.damageEnabled = value; }
  reset() { this.defeatedCount = 0; this.frozen = false; this.damageEnabled = true; this.lastContact = undefined; this.enemies.forEach(enemy => enemy.reset()); }
  snapshot(): EnemySnapshot {
    return { defeated: this.defeatedCount, total: this.enemies.length, active: this.enemies.filter(enemy => enemy.body.enable && !enemy.defeated).length, lastContact: this.lastContact,
      states: this.enemies.map(enemy => ({ id: enemy.config.id, kind: enemy.config.kind, state: enemy.state, x: enemy.sprite.x, y: enemy.sprite.y })) };
  }
  destroy() { this.enemies.forEach(enemy => enemy.destroy()); this.all.destroy(false); }
}
