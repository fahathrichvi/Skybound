# Skybound Adventure

An original fantasy browser platformer built with React, TypeScript, Vite, and Phaser 3. Ari, a small explorer with a saffron scarf, follows lost crystals through floating kingdoms.

**Milestone: Stage 3 complete - world system.** Play opens the Verdant Trail, the terrain pass for World 1-1. Its paths, platforms, caves, and boundaries are playable; collectibles, enemies, checkpoints, and completion rewards arrive in later stages. The Stage 2 practice course remains available at `#/practice`.

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

## Stage 3 features

- A reusable `LevelConfig`, level registry, runtime validation, and safe practice fallback for invalid definitions.
- A real Phaser tilemap with an original generated grass/earth/stone tileset. Collision faces are calculated across neighboring tiles to avoid seams.
- A 6144 x 1280 terrain preview with 1869 solid tiles, ten one-way timber ledges, stepped hills, two ravines, and five named regions.
- An optional high route and a sheltered lower passage through Mossroot Hollow.
- Separate terrain, solid-platform, and one-way-platform collision handling. Timber ledges allow upward passage and landings from above without side snags.
- Four independently scrolling background layers, original foliage, flowers, cave backdrops, and bounded ambient particles.
- Physics/camera bounds and automatic return to spawn after falling below the level. This is a safety reset, not the future health/checkpoint system.
- Shared scene lifecycle for the trail and the original practice course; Ari's movement tuning is unchanged.
- Live region labels, keyboard/touch controls, pause/settings suspension, and rotation-safe canvas sizing.

Open `#/play` for the trail or `#/practice` for the original controller course. Reaching the far-right sign ends the terrain preview geographically; there is no completion award or unlock yet.

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
| Return to start | R | Restart button |

Hold jump to leap higher. Tap for a smaller hop. Press jump just before landing to buffer the next leap, or just after leaving a ledge to use coyote time. Airborne jumping is intentionally locked to one jump; Wind Boots and double jumps arrive with power-ups.

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
    levels/practice.ts          Data for the safe controller test course
    systems/FollowCamera.ts     Camera smoothing, look-ahead and bounds
    scenes/
      BootScene.ts              Startup handoff
      PreloadScene.ts           Asset loading and fallback
      MainMenuScene.ts          Retained Stage 1 landscape preview scene
      PracticeScene.ts          Original course using the shared level scene
      LevelScene.ts             Level lifecycle, pause, recovery, controller wiring
    levels/index.ts             Registry for additional level definitions
    levels/types.ts             Typed terrain, platforms, regions and signs
    levels/world1/level1.ts      Verdant Trail geometry and routes
    world/
      levelData.ts              Validation, fallback, tile data and collision rules
      levelData.test.ts         Geometry, fallback and one-way tests
      TerrainArt.ts             Original generated tile atlas
      WorldBuilder.ts           Tilemap and platform construction/collisions
      ParallaxWorld.ts          Layered scenery built from level configuration
    bridge.test.ts              Event/command cleanup and preference tests
  services/preferences.ts       Validated local preferences
scripts/
  browser-check.mjs             Menu/navigation regression checks
  movement-check.mjs            Actual keyboard and collision checks
  touch-check.mjs               Real browser multi-touch input checks
  world-check.mjs               Traversal of both routes and world boundaries
```

React owns menus and UI. `GameBridge` carries serializable commands and events; components never reach into Phaser entities. `PlayerMotor` decides velocities and jump eligibility while Phaser integrates motion and resolves collisions. `Player` keeps a stable 28 x 64 physics body separate from its animated visual.

## Tuning and extending

Tune the movement constants in `src/game/config/player.ts`, then run the motor and browser movement tests. Current speeds are 260 px/s walking and 410 px/s sprinting; jump velocity is 660 px/s upward with gravity of 1550 px/s squared.

### Adding a level

1. Create a `LevelConfig` in `src/game/levels/world1/` (or a new world folder).
2. Register the definition in `src/game/levels/index.ts`. The builder and scene need no changes.
3. Use tile coordinates for `terrain` rectangles and pixel coordinates for `spawn`, `platforms`, `signs`, `regions`, and cave backdrop bounds.
4. Cover the full horizontal extent with contiguous regions. Keep the spawn body clear of solids, and place the fall boundary below the playable route.
5. Validate the definition and test traversal with actual input. Add a UI route/selector when exposing another playable level.

```ts
const terrain = { x: 0, y: 30, width: 48, height: 10, surface: 'grass' };
// 48 tiles wide, with its surface at 30 * 32 = 960 world pixels.
const ledge = { x: 640, y: 864, width: 224, height: 18, kind: 'one-way' };
// Timber ledges accept downward landings; use 'solid' for collision on all sides.
```

The tile grid uses 32-pixel cells. Supported surfaces are `grass` and `stone`; earthy interior tiles are chosen automatically. Definitions use schema version 1 and the current emerald theme. Invalid metadata, rectangles, cave bounds, region coverage, or intersecting spawns produce a visible warning and load the safe practice course. The allocation limit is 262144 tile cells per level. No complete level is embedded in `LevelScene`.

The full enemy, object, checkpoint, and exit schemas will be added with their working systems in later milestones.

Add enemies as reusable entities implementing a shared state interface. Store power-up definitions and durations in configuration, with application and expiry owned by a separate system. These are extension conventions, not implemented systems.

Add assets under `public/assets/` and load them in PreloadScene. PlayerArt currently generates original animated textures; a future sprite sheet can use the same animation keys without changing movement logic. Lucide supplies interface icons; optional Google Fonts load Outfit and DM Sans with system fallbacks. No audio is shipped yet.

## Persistence

Only display preferences persist, using `skybound.preferences.v1`. Invalid data falls back safely; denied storage leaves settings usable for the current visit. Gameplay saves, scores, achievements, import/export, and cloud adapters remain future milestones. The practice course does not save Ari's position between visits.

## Debug and verification

Use `http://127.0.0.1:5173/?debug=true#/play` in development to show tile collision faces, hitboxes, FPS, movement state, coordinates, and velocity. Use `?debug=true#/practice` for the original controller fixture. Telemetry also reports level/region, recovery count, tile count, parallax factors, and world/camera bounds. A serialized read-only snapshot on the canvas supports browser checks. Production builds do not enable this telemetry or debug physics, even with the query parameter. There are no developer teleport or completion cheats.

`npm test` covers speed caps, drag, frame-rate-independent acceleration, coyote and buffer boundaries, variable-height release, no double jumping, reset behavior, bridge cleanup, and preference validation.

Start the dev server on port 5173, then run:

```sh
npm run test:browser
npm run test:movement
npm run test:touch
npm run test:world
```

To run the touch suite against the new trail, set `SKYBOUND_COURSE=trail` (PowerShell: `$env:SKYBOUND_COURSE="trail"`) before `npm run test:touch`. Its default remains the practice course.

These use installed Google Chrome via Playwright. Install Chrome or change the scripts' browser channel if necessary. Screenshots are saved in the ignored `artifacts/` folder. Movement checks use real keyboard input and read-only telemetry; touch checks send simultaneous browser touch events. No test teleports the player or mutates physics state.

The world suite climbs the high route, traverses the cave and both ravines without recovery, reaches the right boundary, deliberately falls to check recovery, and verifies one-way platforms. Pure tests cover malformed definitions, fallback, tile stamping, region edges, and one-way collision rules.

Verification also covers variable jump height, jump aliases, buffered and coyote jumps, floor/ledge/ceiling contact, sprinting, camera following, pause and modal suspension, retained menu behavior, input release, touch scroll suppression, and viewport rotation. Mobile checks emulate touch in desktop Chrome; physical-device validation remains future work.

## Files added or modified in Stage 2

Added: `src/game/config/player.ts`; the five files in `src/game/entities/player/`; `src/game/levels/practice.ts`; `src/game/systems/FollowCamera.ts`; `src/game/scenes/PracticeScene.ts`; `scripts/movement-check.mjs`; `scripts/touch-check.mjs`.

Modified: `src/game/createGame.ts`, `src/game/scenes/PreloadScene.ts`, `src/game/bridge.ts`, `src/game/bridge.test.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, `scripts/browser-check.mjs`, `package.json`, `package-lock.json`, and this README.

## Files added or modified in Stage 3

Added: `src/game/levels/types.ts`, `src/game/levels/index.ts`, `src/game/levels/world1/level1.ts`, `src/game/scenes/LevelScene.ts`, the five files under `src/game/world/`, and `scripts/world-check.mjs`.

Modified: `src/game/scenes/PracticeScene.ts`, `src/game/levels/practice.ts`, `src/game/createGame.ts`, `src/game/scenes/PreloadScene.ts`, `src/game/bridge.ts`, `src/components/GameCanvas.tsx`, `src/app/App.tsx`, `src/app/styles.css`, `src/config/project.ts`, the three existing browser scripts, `package.json`, `package-lock.json`, and this README. Player controller and camera tuning were preserved.

## Known limits and next stage

The trail is a terrain preview, not the completed three-to-five-minute tutorial level. It has no collectibles, interactive blocks, enemies, health, checkpoints, score, progression save, completion award, music, or boss fight. Platforms are stationary; moving-platform behavior is not implemented. Falling currently returns to the initial spawn without a life penalty. Gamepad controls, physical mobile-device testing, PWA installation, and offline caching remain future work.

**Next: Stage 4 - gameplay objects:** Star Shards, mystery crystals, breakable blocks, checkpoint objects, and the exit portal. Stage 3 stops here and waits for the next development instruction.
