import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const snapshot = () => page.locator('canvas').evaluate(canvas => JSON.parse(canvas.dataset.debug));
const until = predicate => page.waitForFunction(predicate, undefined, { timeout: 10000, polling: 'raf' });
const settle = () => until(() => { const s = JSON.parse(document.querySelector('canvas').dataset.debug); return s.grounded && Math.abs(s.vx) < 1; });
async function restart() { await page.locator('canvas').focus(); await page.keyboard.press('r'); await settle(); }
async function recordJump(heldMs) {
  await restart();
  const record = page.evaluate(() => new Promise(resolve => {
    const start = performance.now(); const samples = [];
    const tick = () => { samples.push(JSON.parse(document.querySelector('canvas').dataset.debug)); if (performance.now() - start < 1150) requestAnimationFrame(tick); else resolve(samples); }; tick();
  }));
  await page.keyboard.down('Space'); await page.waitForTimeout(heldMs); await page.keyboard.up('Space');
  const samples = await record; await settle(); return Math.min(...samples.map(s => s.y));
}
try {
  await mkdir('artifacts', { recursive: true });
  await page.goto('http://127.0.0.1:5173/?debug=true#/practice');
  await page.getByText('Movement practice / Stage 2').waitFor();
  await settle();
  assert.equal(Math.round((await snapshot()).y), 880);
  await page.locator('canvas').focus();
  await page.keyboard.down('d');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).x > 325);
  assert.equal((await snapshot()).vx, 260);
  await page.keyboard.up('d'); await settle();
  await page.keyboard.down('Shift'); await page.keyboard.down('d');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).vx === 410);
  await page.keyboard.up('d'); await page.keyboard.up('Shift'); await settle();
  const shortApex = await recordJump(65); const fullApex = await recordJump(600);
  assert.ok(shortApex - fullApex > 45, `Variable height: short ${shortApex}, full ${fullApex}`);
  await restart();
  await page.keyboard.down('Space'); await page.waitForTimeout(450); await page.keyboard.up('Space');
  await until(() => { const s = JSON.parse(document.querySelector('canvas').dataset.debug); return s.y > 830 && s.vy > 300 && !s.grounded; });
  await page.keyboard.down('Space');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).vy < -400);
  await page.keyboard.up('Space'); await settle();
  // Stand underneath a ledge, then verify the head collides with its underside.
  await page.keyboard.down('d');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).x > 770);
  await page.keyboard.up('d'); await settle();
  assert.equal(Math.round((await snapshot()).y), 880);
  await page.keyboard.down('Space'); await page.waitForTimeout(180);
  assert.ok((await snapshot()).y >= 874, 'Ari cannot jump through the solid ceiling');
  await page.keyboard.up('Space'); await settle();
  await restart();
  await page.keyboard.down('ArrowLeft');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).x < 20);
  await page.keyboard.up('ArrowLeft'); await settle();
  assert.ok((await snapshot()).x >= 14);
  await restart();
  await page.keyboard.down('d');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).x > 590);
  await page.keyboard.down('Space');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).x > 780);
  await page.keyboard.up('d'); await page.keyboard.up('Space'); await settle();
  const ledge = await snapshot();
  assert.equal(Math.round(ledge.y), 785, `First ledge landing: ${JSON.stringify(ledge)}`);
  assert.ok(ledge.cameraX > 80, 'Camera follows horizontal movement');
  await page.screenshot({ path: 'artifacts/stage2-platform.png', fullPage: true });
  // Run off the ledge, then use the grace window after the floor contact ends.
  await page.keyboard.down('d');
  await until(() => { const s = JSON.parse(document.querySelector('canvas').dataset.debug); return s.x > 956 && !s.grounded; });
  await page.keyboard.down('Space');
  await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).vy < -400);
  await page.keyboard.up('Space'); await page.keyboard.up('d'); await settle();
  // Real pause must freeze physics and maintain position through the pause.
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Resume practice' }).waitFor();
  const paused = await snapshot(); await page.waitForTimeout(250);
  assert.equal((await snapshot()).x, paused.x); assert.equal((await snapshot()).y, paused.y);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await snapshot()).paused).toBe(false);
  for (const alias of ['w', 'ArrowUp']) {
    await restart(); await page.keyboard.down(alias);
    await until(() => JSON.parse(document.querySelector('canvas').dataset.debug).vy < -400);
    await page.keyboard.up(alias); await settle();
  }
  await page.getByRole('button', { name: 'Scene settings' }).click();
  await expect.poll(async () => (await snapshot()).paused).toBe(true);
  const beforePreference = await snapshot();
  await page.getByRole('checkbox', { name: /Reduced motion/ }).check();
  assert.equal((await snapshot()).x, beforePreference.x, 'Changing display settings preserves the player position');
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await snapshot()).paused).toBe(false);
  await restart();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.screenshot({ path: 'artifacts/stage2-laptop.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: 'artifacts/stage2-desktop.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'Keyboard movement, sprint, jump aliases, variable jump, buffered jump, ceiling/ledge collision, coyote jump, camera, pause, modal suspension and desktop sizes passed', shortApex, fullApex, ledge }, null, 2));
} finally { await browser.close(); }
