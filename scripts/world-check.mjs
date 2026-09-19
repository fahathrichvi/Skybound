import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const read = () => page.locator('canvas').evaluate(canvas => JSON.parse(canvas.dataset.debug));
async function until(test, label) {
  const start = Date.now();
  while (Date.now() - start < 12000) { const s = await read(); if (test(s)) return s; await page.waitForTimeout(25); }
  throw new Error(`${label}: ${JSON.stringify(await read())}`);
}
async function settle() { return until(s => s.grounded && Math.abs(s.vx) < 1, 'settle'); }
async function moveTo(x, sprint = false) {
  if (sprint) await page.keyboard.down('Shift');
  await page.keyboard.down('d'); await until(s => s.x >= x, `move to ${x}`);
  await page.keyboard.up('d'); await page.keyboard.up('Shift'); return settle();
}
async function leapTo(x, expectedY, sprint = true) {
  if (sprint) await page.keyboard.down('Shift'); await page.keyboard.down('d'); await page.keyboard.down('Space');
  await until(s => s.x >= x, `leap to ${x}`);
  await page.keyboard.up('d'); await page.keyboard.up('Shift'); await page.keyboard.up('Space');
  const landed = await settle(); assert.equal(Math.round(landed.y), expectedY, `Landing at ${x}: ${JSON.stringify(landed)}`); return landed;
}
async function restart() { await page.locator('canvas').focus(); await page.keyboard.press('r'); await settle(); }
try {
  await mkdir('artifacts', { recursive: true });
  await page.goto('http://127.0.0.1:5173/?debug=true#/play');
  await page.getByText('1-1 / The Verdant Trail').waitFor(); await settle();
  const first = await read(); assert.equal(first.levelId, '1-1'); assert.equal(first.y, 960);
  assert.ok(first.tileCount > 1500); assert.equal(first.oneWayCount, 10);
  assert.deepEqual(first.parallax, [0, .15, .3, .55]);
  await page.locator('canvas').focus();
  await moveTo(730);
  assert.equal((await read()).y, 960, 'Walk below the one-way ledge without a side collision');
  await page.keyboard.down('Space'); await until(s => s.y < 850, 'pass through ledge');
  await page.keyboard.up('Space'); await settle();
  assert.equal((await read()).y, 864, 'Land on top of the one-way ledge');
  await moveTo(813); await leapTo(1000, 768);
  await moveTo(1125); await leapTo(1325, 672);
  assert.ok((await read()).cameraY < first.cameraY - 80, 'Camera follows the upper route vertically');
  await page.screenshot({ path: 'artifacts/stage3-upper-route.png', fullPage: true });
  await restart();
  // Tile seams must not snag Ari; the first hill and both ravines use real input.
  await moveTo(1435, true); await leapTo(1600, 896);
  await moveTo(2200, true);
  await leapTo(2480, 960);
  await moveTo(3170, true);
  assert.equal((await read()).y, 1088, 'Enter the lower cave route');
  await moveTo(3550, true);
  assert.equal((await read()).region, 'Mossroot Hollow');
  await page.screenshot({ path: 'artifacts/stage3-cave.png', fullPage: true });
  await moveTo(3860); await leapTo(4000, 1024, false);
  await leapTo(4280, 960);
  await moveTo(4500); await leapTo(4690, 896);
  await moveTo(5330, true); await leapTo(5500, 928);
  await moveTo(5590); await leapTo(5770, 896);
  await moveTo(6129, true);
  const end = await read();
  assert.ok(end.x <= 6130); assert.ok(end.cameraX <= 4864); assert.equal(end.region, "The Trail's Edge");
  assert.equal(end.recoveries, 0, 'Both lower routes are traversable without a reset');
  await page.screenshot({ path: 'artifacts/stage3-trail-edge.png', fullPage: true });
  await restart();
  await moveTo(1435, true); await leapTo(1600, 896);
  await page.keyboard.down('d'); await until(s => s.x > 2340, 'enter ravine'); await page.keyboard.up('d');
  await until(s => s.recoveries === 1 && s.x === 192, 'fall recovery'); await settle();
  await expect(page.getByText('1-1 / The Verdant Trail')).toBeVisible();
  await page.getByRole('button', { name: 'Pause trail' }).click();
  assert.equal((await read()).paused, true);
  await page.getByRole('button', { name: 'Resume trail' }).click();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'Tile seams, one-way pass-through/landing, upper route, cave route, hill steps, both ravines, camera/world bounds, fall recovery and pause passed', tiles: first.tileCount, end }, null, 2));
} catch (error) { await page.screenshot({ path: 'artifacts/stage3-failure.png', fullPage: true }); console.error('Browser errors:', errors); throw error; }
finally { await browser.close(); }
