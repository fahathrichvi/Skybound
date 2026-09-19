import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
const page = await context.newPage();
const errors = [];
const trail = process.env.SKYBOUND_COURSE === 'trail';
page.on('pageerror', error => errors.push(error.message));
const state = () => page.locator('canvas').evaluate(canvas => JSON.parse(canvas.dataset.debug));
try {
  await mkdir('artifacts', { recursive: true });
  await page.goto(`http://127.0.0.1:5173/?debug=true#/${trail ? 'play' : 'practice'}`);
  await page.getByText(trail ? '1-1 / The Verdant Trail' : 'Movement practice / Stage 2').waitFor();
  await page.locator('.game-frame').scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: 'Move right', exact: true })).toBeVisible();
  const cdp = await context.newCDPSession(page);
  async function point(label, id) { const box = await page.getByRole('button', { name: label, exact: true }).boundingBox(); assert.ok(box); return { id, x: box.x + box.width / 2, y: box.y + box.height / 2 }; }
  const right = await point('Move right', 1); const jump = await point('Jump', 2); const sprint = await point('Sprint', 3);
  const scrollBefore = await page.evaluate(() => scrollY);
  const start = await state();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [right] });
  await expect.poll(async () => (await state()).x).toBeGreaterThan(start.x + 40);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [right, sprint] });
  await expect.poll(async () => (await state()).vx).toBe(410);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [right, sprint, jump] });
  await expect.poll(async () => (await state()).vy).toBeLessThan(-100);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => Math.abs((await state()).vx)).toBe(0);
  assert.equal(await page.evaluate(() => scrollY), scrollBefore, 'Touch controls do not scroll the page');
  await page.getByRole('button', { name: trail ? 'Pause trail' : 'Pause practice' }).tap();
  await expect(page.getByRole('button', { name: trail ? 'Resume trail' : 'Resume practice' })).toBeVisible();
  await page.getByRole('button', { name: trail ? 'Resume trail' : 'Resume practice' }).tap();
  await page.screenshot({ path: `artifacts/${trail ? 'stage3' : 'stage2'}-touch-landscape.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => page.locator('canvas').evaluate(canvas => Math.abs(canvas.getBoundingClientRect().width - canvas.parentElement.getBoundingClientRect().width))).toBeLessThan(3);
  await expect(page.getByRole('button', { name: 'Move right', exact: true })).toBeVisible();
  await page.screenshot({ path: `artifacts/${trail ? 'stage3' : 'stage2'}-touch-portrait.png`, fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log('Touch checks passed: real multi-touch movement, sprint, jump, release, scroll suppression, pause/resume, responsive layout.');
} finally { await browser.close(); }
