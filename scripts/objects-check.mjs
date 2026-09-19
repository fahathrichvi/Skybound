import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const read = () => page.locator('canvas').evaluate(canvas => JSON.parse(canvas.dataset.debug));
async function until(test, label, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { const state = await read(); if (test(state)) return state; await page.waitForTimeout(25); }
  throw new Error(`${label}: ${JSON.stringify(await read())}`);
}
async function settle() { return until(s => s.grounded && Math.abs(s.vx) < 1 && Math.abs(s.vy) < 1, 'settle'); }
async function moveTo(x, sprint = false, direction = 'd') {
  if (sprint) await page.keyboard.down('Shift'); await page.keyboard.down(direction);
  await until(s => direction === 'd' ? s.x >= x : s.x <= x, `move ${direction} to ${x}`);
  await page.keyboard.up(direction); await page.keyboard.up('Shift'); return settle();
}
async function leapTo(x, expectedY, sprint = true) {
  if (sprint) await page.keyboard.down('Shift'); await page.keyboard.down('d'); await page.keyboard.down('Space');
  await until(s => s.x >= x, `leap to ${x}`);
  await page.keyboard.up('d'); await page.keyboard.up('Shift'); await page.keyboard.up('Space');
  const landed = await settle(); assert.ok(Math.abs(landed.y - expectedY) <= 1, `landing at ${x}: ${JSON.stringify(landed)}`); return landed;
}
async function runningLeap(runFrom, jumpAt, target, expectedY) {
  await moveTo(runFrom); await page.keyboard.down('Shift'); await page.keyboard.down('d');
  await until(s => s.x >= jumpAt, `run-up to ${jumpAt}`); await page.keyboard.down('Space');
  await until(s => s.x >= target, `running leap to ${target}`);
  await page.keyboard.up('Space'); await page.keyboard.up('d'); await page.keyboard.up('Shift');
  const landed = await settle(); assert.ok(Math.abs(landed.y - expectedY) <= 1, `running landing at ${target}: ${JSON.stringify(landed)}`); return landed;
}
try {
  await mkdir('artifacts', { recursive: true });
  await page.goto('http://127.0.0.1:5173/?debug=true#/play');
  await page.getByText('1-1 / The Verdant Trail').waitFor(); await settle(); await page.locator('canvas').focus();
  let state = await read();
  assert.deepEqual(state.objects, { shards: 0, totalShards: 38, gems: 0, totalGems: 3, respawn: { x: 192, y: 960 }, complete: false });
  assert.deepEqual(state.objectBodies, { activeCollectibles: 28, activeBlocks: 5, activeCheckpoints: 2, exitActive: true });
  await moveTo(485);
  await expect(page.locator('.object-hud')).toContainText('3');
  assert.equal((await read()).objects.shards, 3);
  await page.keyboard.down('Space');
  await until(s => s.objects.shards === 8, 'mystery crystal reward');
  await page.keyboard.up('Space'); await settle();
  assert.equal((await read()).objectBodies.activeBlocks, 5, 'Used crystal remains a solid block');
  await page.keyboard.down('Shift'); await page.keyboard.down('d');
  await until(s => s.x > 930, 'sprint through brittle block');
  await page.keyboard.up('d'); await page.keyboard.up('Shift'); await settle();
  assert.equal((await read()).objectBodies.activeBlocks, 4);
  // Take the high route to its hidden Crystal Gem.
  await moveTo(730, false, 'a'); await page.keyboard.down('Space'); await page.waitForTimeout(480); await page.keyboard.up('Space'); await settle();
  assert.equal(Math.round((await read()).y), 864);
  await moveTo(813); await leapTo(1000, 768); await moveTo(1125); await leapTo(1375, 672);
  state = await read(); assert.equal(state.objects.gems, 1); assert.ok(state.objects.shards >= 10);
  await page.screenshot({ path: 'artifacts/stage4-gem-and-blocks.png', fullPage: true });
  // Return to the ground, cross the first ravine, and activate checkpoint one.
  await runningLeap(2070, 2220, 2480, 960);
  await moveTo(2600);
  state = await read(); assert.equal(state.objects.checkpointId, 'c01'); assert.deepEqual(state.objects.respawn, { x: 2512, y: 960 });
  const retainedShards = state.objects.shards, retainedGems = state.objects.gems;
  await moveTo(2410, false, 'a');
  await until(s => s.recoveries === 1 && Math.abs(s.x - 2512) < 2, 'checkpoint fall recovery'); await settle();
  state = await read(); assert.ok(state.objects.shards >= retainedShards, 'Respawn preserves all collected shards'); assert.equal(state.objects.gems, retainedGems); assert.equal(state.objects.checkpointId, 'c01');
  await page.screenshot({ path: 'artifacts/stage4-checkpoint.png', fullPage: true });
  // Follow the lower path through the cave and to the exit portal.
  await moveTo(3170, true); await moveTo(3740, true);
  await page.keyboard.down('Shift'); await page.keyboard.down('d');
  await until(s => s.x > 3810, 'shatter cave block'); await page.keyboard.up('d'); await page.keyboard.up('Shift'); await settle();
  await moveTo(3860); await leapTo(4000, 1024, false); await leapTo(4280, 960);
  await moveTo(4380); state = await read(); assert.equal(state.objects.checkpointId, 'c02');
  await moveTo(4500); await leapTo(4690, 896); await moveTo(5330, true); await leapTo(5500, 928); await moveTo(5590);
  await page.keyboard.down('d'); await page.keyboard.down('Space'); await until(s => s.objects.gems === 3 || s.completed, 'collect final gem'); await page.keyboard.up('Space'); await page.keyboard.up('d');
  if (!(await read()).completed) { await settle(); await page.keyboard.down('d'); await until(s => s.completed, 'enter exit portal'); await page.keyboard.up('d'); }
  await expect(page.getByRole('region', { name: 'Trail complete' })).toBeVisible();
  state = await read(); assert.equal(state.completed, true); assert.equal(state.objects.complete, true); assert.ok(state.run.score > 0);
  await expect(page.getByRole('region', { name: 'Trail complete' })).toContainText('Best score');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('skybound.save.v1')));
  assert.equal(saved.version, 1); assert.equal(saved.levels['1-1'].completed, true); assert.equal(saved.levels['1-1'].bestScore, state.run.score);
  assert.equal(saved.levels['1-1'].gems, state.objects.gems);
  await page.screenshot({ path: 'artifacts/stage4-complete.png', fullPage: true });
  await page.getByRole('button', { name: 'Replay level' }).click(); await settle();
  state = await read(); assert.deepEqual(state.objects, { shards: 0, totalShards: 38, gems: 0, totalGems: 3, respawn: { x: 192, y: 960 }, complete: false });
  assert.equal(state.objectBodies.activeCollectibles, 28); assert.equal(state.objectBodies.activeBlocks, 5); assert.equal(state.recoveries, 0); assert.equal(state.run.score, 0);
  await page.getByRole('link', { name: 'Explore the worlds' }).click();
  await expect(page.locator('.save-summary')).toContainText(`Best ${saved.levels['1-1'].bestScore.toLocaleString()}`);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'Shards, mystery reward, sprint block, gem, checkpoint respawn/persistence, cave block, exit completion and replay reset passed', retainedShards, retainedGems }, null, 2));
} catch (error) { await page.screenshot({ path: 'artifacts/stage4-failure.png', fullPage: true }); console.error('Browser errors:', errors); throw error; }
finally { await browser.close(); }
