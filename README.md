# Skybound Adventure

An original fantasy browser platformer developed by **Fahath Richvi** with React, TypeScript, Vite, and Phaser 3. Ari, a small explorer with a saffron scarf, follows lost crystals through floating kingdoms.

**Milestone: Stage 7 complete - UI polish and audio.** The game now has animated HUD feedback, refined panels and transitions, configurable local audio settings, and original synthesized music and sound cues that begin after the first scene interaction. The Stage 2 practice course remains available at `#/practice`.

## Run locally

Use Node.js 22.12+ (Node 24 recommended) and npm.

```sh
npm install
npm run dev
```

Open the URL Vite prints (normally http://127.0.0.1:5173). On Windows PowerShell with restricted script execution, use `npm.cmd` instead of `npm`.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

`dist/` is the production output. Hash-based routes work on static hosting without rewrite rules. Current asset paths assume hosting at the domain root. Set the name and version in `src/config/project.ts`; update HTML metadata and package metadata when renaming for distribution.

## Stage 7 features

- Original Web Audio music loop and sound cues for jumping, landing, collecting, checkpoints, blocks, enemy defeats, damage, defeat, completion, and menu actions.
- Audio starts only after the first player interaction, respecting browser autoplay rules.
- Persisted master, music, and sound-effect sliders, each clamped and safely validated before use.
- Animated HUD arrival, richer toast feedback, softened vignette treatment, and polished completion and Game Over panel transitions.
- Typed sound events keep gameplay scenes independent of browser audio so generated tones can later be replaced with asset-backed music and SFX.

## Stage 6 features retained

- A deterministic score system awards 100 per Star Shard, 1,000 per Sky Gem, 200 per defeated creature, 500 per remaining heart, a 2,000 completion bonus, and up to 1,800 time-bonus points.
- Live score and run time in the HUD, plus a completion breakdown for collected objects, remaining hearts, defeated creatures, time, and total score.
- Three lives per run. Losing all hearts or falling consumes a life and revives Ari at the active checkpoint; exhausting the final life opens Game Over.
- A complete Game Over flow with retry, world-map, and main-menu actions. Retry resets score, time, objects, enemies, hearts, lives, checkpoint state, and the camera.
- Optional **Casual Revives** in Settings keeps checkpoint revival active without consuming lives.
- A versioned local save service records completion, best score, best time, best gem count, and lifetime score. The Worlds screen displays the saved Emerald Valley record.
- Safe validation and fallback for malformed saves, plus import/export/reset methods for later settings and cloud-sync UI.
- Expanded pause controls for resume, full restart, and return to the world map.
- Dedicated unit and browser coverage for scoring, lives, Game Over, checkpoint recovery, persistence, completion records, and retry reset.

Open `#/play` for the complete Stage 6 run. Reach the exit to save a result, or use Settings to enable Casual Revives.

## Stage 5 features retained

- A reusable enemy base with explicit idle, patrol, alert, attack, hit, stunned, and dead states for future enemy types.
- Three ground-patrolling Bloblings with authored patrol limits and edge-safe direction changes.
- Three Winglings following smooth horizontal and vertical wave paths.
- Camera-distance activation disables physics and animation work for creatures far outside the visible play area.
- Forgiving top-contact stomps, bounce feedback, procedural defeat animation, particles, and subtle camera shake.
- Three-heart encounter health, one-heart contact damage, knockback, flashing, and a 1.5-second invulnerability window.
- Defeat and checkpoint revival preserve collected objects and defeated enemies for the current run; replay resets the full encounter.
- Heart and enemy totals in the React HUD and completion panel, with serializable bridge events and debug telemetry.
- Original procedural Blobling and Wingling artwork with distinct silhouettes and movement.

Open `#/play` to meet the creatures. Jump onto a creature from above to disperse it; touching its side causes damage.

## Stage 4 features retained

- 25 placed Star Shards and 3 Sky Gems distributed across the main path, high route, ravines, and cave.
- Three mystery crystals activated from below. Their configured rewards add 13 more Star Shards, for 38 available shards in the level.
- Two brittle blocks that break on a confirmed sprinting side impact, with particles and camera feedback.
- Two checkpoints that become the new recovery point while preserving collected items and used blocks for the current run.
- A working exit portal that opens a completion panel with options to keep exploring or replay the trail.
- Idempotent run-state tracking: repeated overlaps cannot award an item, block reward, checkpoint, or completion twice.
- Original procedural object art, lightweight animation, reduced-motion handling, HUD counters, announcements, and completion UI.
- Runtime validation for object IDs, positions, rewards, respawn points, and exit configuration.

Open `#/play` to play the object route. Collecting every object is optional; reaching the exit completes the level.

## Stage 3 features retained

- A reusable `LevelConfig`, level registry, runtime validation, and safe practice fallback for invalid definitions.
- A real Phaser tilemap with an original generated grass/earth/stone tileset. Collision faces are calculated across neighboring tiles to avoid seams.
- A 6144 x 1280 terrain preview with 1869 solid tiles, ten one-way timber ledges, stepped hills, two ravines, and five named regions.
- An optional high route and a sheltered lower passage through Mossroot Hollow.
- Separate terrain, solid-platform, and one-way-platform collision handling. Timber ledges allow upward passage and landings from above without side snags.
- Four independently scrolling background layers, original foliage, flowers, cave backdrops, and bounded ambient particles.
- Physics/camera bounds and automatic return to the active checkpoint after falling below the level.
- Shared scene lifecycle for the trail and the original practice course; Ari's movement tuning is unchanged.
- Live region labels, keyboard/touch controls, pause/settings suspension, and rotation-safe canvas sizing.

Open `#/practice` for the original controller course. Stage 3's tilemap, routes, cave, scenery, and collision behavior remain unchanged beneath the new object layer.

## Stage 2 features retained

- Configurable walk and sprint speeds, acceleration, ground drag, air control, air drag, gravity, and maximum fall speed.
- 120 ms coyote time and 130 ms jump buffering, with one jump per takeoff.
- Variable jump height: release early for a short hop, hold for a higher jump.
- Original procedural idle, run, sprint, jump, fall, and landing animation states.
- Visual landing squash stays separate from the physics body, keeping collisions stable.
- A 4,800-pixel-wide safe practice course with solid ledges and a continuous floor. R restarts without navigating or rebuilding the scene.
- Smooth camera follow, directional look-ahead, a vertical dead zone, and bounded scrolling.
- Scoped keyboard input; menus retain their normal keyboard behavior. Input is cleared when focus changes.
- Basic multi-touch movement, sprint, and jump controls with pointer capture, cancellation handling, and scroll suppression.
- Escape pause/resume; opening settings suspends simulation; window blur or hiding the tab pauses until resumed.
- Reduced-motion changes update the current scene without resetting Ari's position.
- Container resize observation keeps the canvas fitted when rotating or entering fullscreen.
- Development-only hitboxes and read-only movement telemetry.

Stage 1 remains intact: original landing art, hash routing, world showcase, native settings/credits dialogs, preference persistence, asset loading, lazy Phaser initialization, responsive canvas, and engine cleanup on route changes. Future worlds remain marked as coming later.

## Controls

Click or tap the scene to focus it. The scene receives focus automatically when first opened.

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | A/D or Left/Right | Left/right buttons |
| Jump | Space, W, Up | Up-arrow button |
| Sprint | Hold Shift while moving | Hold lightning while moving |
| Pause/resume | Escape | Pause/resume button |
| Replay from start | R | Restart button |

Hold jump to leap higher. Tap for a smaller hop. Press jump just before landing to buffer the next leap, or just after leaving a ledge to use coyote time. Land on a Blobling or Wingling from above to disperse it. Jump into a mystery crystal from below to release its shards. Sprint into a brittle block from the side to shatter it. Airborne jumping is intentionally locked to one jump; Wind Boots and double jumps arrive with power-ups.

Crouching, attacks, interaction, gamepad mapping, and gameplay remapping are not implemented yet. Touch play is most comfortable in landscape/fullscreen; Stage 11 will address the full mobile experience. Menus use Tab/Enter and Escape as usual.

## Architecture

```text
public/assets/valley.svg         Original landing landscape and Ari illustration
src/
  main.tsx                      React entry and hash router
  app/                          Application shell, menus, routes, styles
  components/
    GameCanvas.tsx              Engine lifecycle, loading, pause and touch UI
    Modal.tsx                   Native modal focus management
  config/project.ts             Name, version, logical size, world metadata
  game/
    createGame.ts               Phaser setup, physics, scene registration
    bridge.ts                   Typed scene events and UI commands
    config/player.ts            Player physics and camera tuning
    entities/player/
      PlayerMotor.ts            Pure movement and jump-window logic
      PlayerInput.ts            Scoped keyboard and touch input adapter
      PlayerArt.ts              Original replaceable animation textures
      Player.ts                 Arcade body, motor, and visual coordination
      PlayerMotor.test.ts       Movement and timing tests
      PlayerVitals.ts           Pure hearts, damage protection and defeat state
      PlayerVitals.test.ts      Damage timing, revival and replay tests
    entities/enemies/
      EnemyBase.ts              Shared enemy lifecycle and states
      Blobling.ts               Bounded ground patrol behavior
      Wingling.ts               Kinematic wave-flight behavior
      EnemyArt.ts               Original procedural enemy textures
      EnemySystem.ts            Activation, contacts, stomps and diagnostics
      EnemySystem.test.ts       Pure contact-classification tests
    levels/practice.ts          Data for the safe controller test course
    systems/FollowCamera.ts     Camera smoothing, look-ahead and bounds
    systems/RunProgress.ts      Score, timer and completion-bonus calculation
    systems/RunProgress.test.ts Score idempotence and completion tests
    scenes/
      BootScene.ts              Startup handoff
      PreloadScene.ts           Asset loading and fallback
      MainMenuScene.ts          Retained Stage 1 landscape preview scene
      PracticeScene.ts          Original course using the shared level scene
      LevelScene.ts             Level lifecycle, pause, recovery, controller wiring
    levels/index.ts             Registry for additional level definitions
    levels/types.ts             Typed terrain, platforms, regions and signs
    levels/world1/level1.ts      Verdant Trail geometry and routes
    objects/
      ObjectProgress.ts          Per-run collection, checkpoint and exit state
      ObjectProgress.test.ts     Idempotence, reset and respawn tests
      ObjectArt.ts               Original procedural object textures
      GameObjectSystem.ts        Object bodies, interactions and visual feedback
    world/
      levelData.ts              Validation, fallback, tile data and collision rules
      levelData.test.ts         Geometry, fallback and one-way tests
      TerrainArt.ts             Original generated tile atlas
      WorldBuilder.ts           Tilemap and platform construction/collisions
      ParallaxWorld.ts          Layered scenery built from level configuration
    bridge.test.ts              Event/command cleanup and preference tests
  services/preferences.ts       Validated local preferences
  services/save.ts              Versioned completion and best-record storage
  services/save.test.ts         Save validation, records and import tests
scripts/
  browser-check.mjs             Menu/navigation regression checks
  movement-check.mjs            Actual keyboard and collision checks
  touch-check.mjs               Real browser multi-touch input checks
  world-check.mjs               Traversal of both routes and world boundaries
  objects-check.mjs             Full collectible/checkpoint/completion browser flow
  enemies-check.mjs             Damage, protection, revival and stomp browser flow
  systems-check.mjs             Lives, Game Over, score retention and retry flow
```

React owns menus and UI. `GameBridge` carries serializable commands and events; components never reach into Phaser entities. `PlayerMotor` decides velocities and jump eligibility while Phaser integrates motion and resolves collisions. `Player` keeps a stable 28 x 64 physics body separate from its animated visual.

## Tuning and extending

Tune the movement constants in `src/game/config/player.ts`, then run the motor and browser movement tests. Current speeds are 260 px/s walking and 410 px/s sprinting; jump velocity is 660 px/s upward with gravity of 1550 px/s squared.

### Adding a level

1. Create a `LevelConfig` in `src/game/levels/world1/` (or a new world folder).
2. Register the definition in `src/game/levels/index.ts`. The builder and scene need no changes.
3. Use tile coordinates for `terrain` rectangles and pixel coordinates for `spawn`, `platforms`, `signs`, `regions`, cave backdrop bounds, collectibles, blocks, checkpoints, enemies, and the exit.
4. Cover the full horizontal extent with contiguous regions. Keep the spawn body clear of solids, and place the fall boundary below the playable route.
5. Validate the definition and test traversal with actual input. Add a UI route/selector when exposing another playable level.

```ts
const terrain = { x: 0, y: 30, width: 48, height: 10, surface: 'grass' };
// 48 tiles wide, with its surface at 30 * 32 = 960 world pixels.
const ledge = { x: 640, y: 864, width: 224, height: 18, kind: 'one-way' };
// Timber ledges accept downward landings; use 'solid' for collision on all sides.
const checkpoint = { id: 'c01', point: { x: 3040, y: 896 }, respawn: { x: 2980, y: 850 } };
// Object IDs must be stable and unique across every object collection in a level.
const blobling = { id: 'blob-01', kind: 'blobling', x: 1450, y: 960, patrolFrom: 1400, patrolTo: 1500, speed: 35 };
// Enemy spawn points must sit within their patrol range. Winglings also define waveHeight.
```

The tile grid uses 32-pixel cells. Supported surfaces are `grass` and `stone`; earthy interior tiles are chosen automatically. Definitions use schema version 1 and the current emerald theme. Invalid metadata, rectangles, cave bounds, region coverage, intersecting spawns, object data, enemy patrols, checkpoint respawns, or exit data produce a visible warning and load the safe practice course. The allocation limit is 262144 tile cells per level. No complete level is embedded in `LevelScene`.

Add an `EnemyConfig` entry to the level, then implement another `EnemyBase` subclass and construct it in `EnemySystem`. Keep movement deterministic, express patrol or wave limits in level data, and preserve the shared activation, contact, defeat, reset, and diagnostic behavior. Store future power-up definitions and durations in configuration, with application and expiry owned by a separate system.

Add assets under `public/assets/` and load them in PreloadScene. PlayerArt currently generates original animated textures; a future sprite sheet can use the same animation keys without changing movement logic. Lucide supplies interface icons; optional Google Fonts load Outfit and DM Sans with system fallbacks. No audio is shipped yet.

## Persistence

Display and accessibility preferences persist between visits using `skybound.preferences.v1`. Completed-level records use the versioned `skybound.save.v1` key and store each level's completion flag, best score, best time, best gem count, plus lifetime score. Invalid or unavailable storage falls back safely. `SaveService` also exposes validated import, export, and reset operations for future UI or cloud adapters.

Object, checkpoint, enemy, heart, life, score, and elapsed-time state stays in memory during a run. Checkpoint revival preserves collected objects, defeated enemies, and score. Retry or reopening a level starts a fresh run; completed records remain saved.

## Debug and verification

Use `http://127.0.0.1:5173/?debug=true#/play` in development to show tile collision faces, hitboxes, FPS, movement state, coordinates, and velocity. Use `?debug=true#/practice` for the original controller fixture. Telemetry also reports level/region, recovery count, tile count, parallax factors, world/camera bounds, hearts, lives, deaths, Game Over state, score, elapsed time, enemy states, active bodies, and the last enemy contact classification. A serialized read-only snapshot on the canvas supports browser checks. The world traversal fixture adds `safe=true` to isolate terrain checks from combat; the enemy suite tests damage separately. Production builds do not enable this telemetry or debug physics, even with the query parameter. There are no developer teleport or completion cheats.

`npm test` covers speed caps, drag, frame-rate-independent acceleration, coyote and buffer boundaries, variable-height release, no double jumping, object idempotence, damage protection, lives and Game Over, score idempotence and bonuses, save validation and best records, stomp classification, checkpoint recovery, replay reset, level validation, bridge cleanup, and preference validation.

Start the dev server on port 5173, then run:

```sh
npm run test:browser
npm run test:movement
npm run test:touch
npm run test:world
npm run test:objects
npm run test:enemies
npm run test:systems
```

To run the touch suite against the new trail, set `SKYBOUND_COURSE=trail` (PowerShell: `$env:SKYBOUND_COURSE="trail"`) before `npm run test:touch`. Its default remains the practice course.

These use installed Google Chrome via Playwright. Install Chrome or change the scripts' browser channel if necessary. Screenshots are saved in the ignored `artifacts/` folder. Movement checks use real keyboard input and read-only telemetry; touch checks send simultaneous browser touch events. No test teleports the player or mutates physics state.

The world suite climbs the high route, traverses the cave and both ravines without recovery, reaches the exit, deliberately falls to check recovery, and verifies one-way platforms. The object suite collects shards and a gem, opens a mystery crystal, breaks both brittle blocks, activates a checkpoint, verifies progress after a fall, completes the level, verifies the saved record, and confirms replay reset. The enemy suite verifies distance activation, contact damage, the protection window, defeat revival, replay reset, and a real-input stomp. The systems suite verifies three successive fatal falls, life consumption, score retention, Game Over, and a clean retry. Pure tests cover malformed definitions, fallback, tile stamping, region edges, one-way collision rules, run-state behavior, scoring, save records, damage timing, and contact classification.

Verification also covers variable jump height, jump aliases, buffered and coyote jumps, floor/ledge/ceiling contact, sprinting, camera following, pause and modal suspension, retained menu behavior, input release, touch scroll suppression, and viewport rotation. Mobile checks emulate touch in desktop Chrome; physical-device validation remains future work.

## Files added or modified in Stage 2

Added: `src/game/config/player.ts`; the five files in `src/game/entities/player/`; `src/game/levels/practice.ts`; `src/game/systems/FollowCamera.ts`; `src/game/scenes/PracticeScene.ts`; `scripts/movement-check.mjs`; `scripts/touch-check.mjs`.

Modified: `src/game/createGame.ts`, `src/game/scenes/PreloadScene.ts`, `src/game/bridge.ts`, `src/game/bridge.test.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, `scripts/browser-check.mjs`, `package.json`, `package-lock.json`, and this README.

## Files added or modified in Stage 3

Added: `src/game/levels/types.ts`, `src/game/levels/index.ts`, `src/game/levels/world1/level1.ts`, `src/game/scenes/LevelScene.ts`, the five files under `src/game/world/`, and `scripts/world-check.mjs`.

Modified: `src/game/scenes/PracticeScene.ts`, `src/game/levels/practice.ts`, `src/game/createGame.ts`, `src/game/scenes/PreloadScene.ts`, `src/game/bridge.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, the three existing browser scripts, `package.json`, `package-lock.json`, and this README. Player controller and camera tuning were preserved.

## Files added or modified in Stage 4

Added: the four files under `src/game/objects/` and `scripts/objects-check.mjs`.

Modified: `src/game/levels/types.ts`, `src/game/levels/practice.ts`, `src/game/levels/world1/level1.ts`, `src/game/world/levelData.ts`, `src/game/world/levelData.test.ts`, `src/game/scenes/LevelScene.ts`, `src/game/bridge.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, `scripts/world-check.mjs`, `package.json`, `package-lock.json`, and this README.

## Files added or modified in Stage 5

Added: the five implementation files and test under `src/game/entities/enemies/`, `src/game/entities/player/PlayerVitals.ts`, `src/game/entities/player/PlayerVitals.test.ts`, and `scripts/enemies-check.mjs`.

Modified: `src/game/entities/player/Player.ts`, `src/game/levels/types.ts`, `src/game/levels/practice.ts`, `src/game/levels/world1/level1.ts`, `src/game/world/levelData.ts`, `src/game/world/levelData.test.ts`, `src/game/scenes/LevelScene.ts`, `src/game/bridge.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, `scripts/world-check.mjs`, `scripts/objects-check.mjs`, `index.html`, `package.json`, `package-lock.json`, and this README.

## Files added or modified in Stage 6

Added: `src/game/systems/RunProgress.ts`, `src/game/systems/RunProgress.test.ts`, `src/services/save.ts`, `src/services/save.test.ts`, and `scripts/systems-check.mjs`.

Modified: `src/game/entities/player/PlayerVitals.ts`, `src/game/entities/player/PlayerVitals.test.ts`, `src/game/scenes/LevelScene.ts`, `src/game/bridge.ts`, `src/game/bridge.test.ts`, `src/services/preferences.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, `scripts/world-check.mjs`, `scripts/objects-check.mjs`, `package.json`, `package-lock.json`, and this README.

## Files added or modified in Stage 7

Added: `src/game/audio/AudioManager.ts`.

Modified: `src/game/bridge.ts`, `src/game/bridge.test.ts`, `src/game/objects/GameObjectSystem.ts`, `src/game/scenes/LevelScene.ts`, `src/services/preferences.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, `package.json`, `package-lock.json`, and this README.

## Known limits and next stage

Health pickups, difficulty presets, score combos, achievements, cloud sync, and multi-level unlock progression are not implemented yet. Completion records the current level but does not unlock another level. Platforms are stationary; moving-platform behavior is not implemented. Gamepad controls, physical mobile-device testing, PWA installation, and offline caching remain future work.

**Next: Stage 8 - world map:** stage selection, unlocking, completion indicators, and gem indicators. Stage 7 stops here and waits for the next development instruction.
