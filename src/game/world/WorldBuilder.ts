import Phaser from 'phaser';
import type { LevelConfig } from '../levels/types';
import type { Player } from '../entities/player/Player';
import { buildTileData, canLandOnOneWay } from './levelData';
import { createTerrainArt } from './TerrainArt';

export class WorldBuilder {
  readonly map: Phaser.Tilemaps.Tilemap;
  readonly terrain: Phaser.Tilemaps.TilemapLayer;
  readonly solids: Phaser.Physics.Arcade.StaticGroup;
  readonly ledges: Phaser.Physics.Arcade.StaticGroup;
  readonly tileCount: number;
  constructor(private scene: Phaser.Scene, readonly level: LevelConfig) {
    createTerrainArt(scene);
    this.map = scene.make.tilemap({ data: buildTileData(level), tileWidth: level.tileSize, tileHeight: level.tileSize });
    const tiles = this.map.addTilesetImage('emerald', 'emerald-tiles', 32, 32, 0, 0);
    if (!tiles) throw new Error('The terrain tileset could not be created.');
    const layer = this.map.createLayer(0, tiles, 0, 0);
    if (!layer) throw new Error('The terrain layer could not be created.');
    this.terrain = layer.setDepth(5).setCollisionBetween(0, 2);
    this.tileCount = layer.getTilesWithin().filter(tile => tile.index >= 0).length;
    this.solids = scene.physics.add.staticGroup(); this.ledges = scene.physics.add.staticGroup();
    const details = scene.add.graphics().setDepth(6);
    for (const p of level.platforms) {
      const timber = p.kind === 'one-way';
      const body = scene.add.rectangle(p.x, p.y, p.width, p.height, timber ? 0x89623f : 0x385d49).setOrigin(0).setDepth(5);
      scene.physics.add.existing(body, true);
      (timber ? this.ledges : this.solids).add(body);
      details.fillStyle(timber ? 0xd3b779 : 0xb7cd79).fillRect(p.x, p.y, p.width, timber ? 4 : 8);
      for (let x = p.x + 10; x < p.x + p.width; x += 32) {
        details.fillStyle(timber ? 0x4c4533 : 0x70935f, .65).fillRect(x, p.y + 5, 2, p.height - 7);
        if (timber) details.fillStyle(0xdfc38d).fillCircle(x + 6, p.y + 8, 1.5);
      }
      if (timber) details.lineStyle(3, 0x687453).lineBetween(p.x + 20, p.y, p.x + 20, p.y - 24).lineBetween(p.x + p.width - 20, p.y, p.x + p.width - 20, p.y - 24);
    }
  }
  connect(player: Player) {
    this.scene.physics.add.collider(player.sprite, this.terrain);
    this.scene.physics.add.collider(player.sprite, this.solids);
    this.scene.physics.add.collider(player.sprite, this.ledges, undefined, (_player, platform) => {
      const body = (platform as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody }).body;
      return canLandOnOneWay(player.body.prev.y + player.body.height, player.body.velocity.y, body.top);
    });
    // One-way ledges never obstruct Ari's head or sides.
    for (const object of this.ledges.getChildren()) {
      const body = (object as Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.StaticBody }).body;
      body.checkCollision.down = body.checkCollision.left = body.checkCollision.right = false;
    }
  }
  drawDebug() {
    this.terrain.renderDebug(this.scene.add.graphics().setDepth(30), { tileColor: null, collidingTileColor: new Phaser.Display.Color(180, 210, 90, 40), faceColor: new Phaser.Display.Color(140, 240, 210, 180) });
  }
  destroy() { this.map.destroy(); }
}
