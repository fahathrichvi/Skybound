import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const read = () => page.locator('canvas').evaluate(canvas => JSON.parse(canvas.dataset.debug));
async function until(test, label, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) { const state = await read(); if (test(state)) return state; await page.waitForTimeout(30); }
  throw new Error(`${label}: ${JSON.stringify(await read())}`);
}
async function settle() { return until(state => state.grounded && Math.abs(state.vx) < 2 && Math.abs(state.vy) < 1, 'settle'); }
async function moveTo(x, sprint = false) {
  if (sprint) await page.keyboard.down('Shift'); await page.keyboard.down('d');
  await until(state => state.x >= x, `move to ${x}`);
  await page.keyboard.up('d'); await page.keyboard.up('Shift'); return settle();
}
async function leapTo(x) {
  await page.keyboard.down('Shift'); await page.keyboard.down('d'); await page.keyboard.down('Space');
  await until(state => state.x >= x, `leap to ${x}`);
  await page.keyboard.up('Space'); await page.keyboard.up('d'); await page.keyboard.up('Shift'); return settle();
}
async function fallIntoFirstRavine(expectedDeaths) {
  await moveTo(1430, true); await leapTo(1600); await moveTo(2200, true);
  await page.keyboard.down('d'); await until(state => state.x > 2340, 'enter first ravine'); await page.keyboard.up('d');
  if (expectedDeaths < 3) return until(state => !state.dying && state.combat.deaths === expectedDeaths && state.x < 260, `revive ${expectedDeaths}`);
  return until(state => state.gameOver && state.combat.deaths === 3, 'game over');
}

try {
  await page.goto('http://127.0.0.1:5173/?debug=true#/play');
  await page.getByText('1-1 / The Verdant Trail').waitFor(); await settle(); await page.locator('canvas').focus();
  await moveTo(485);
  let state = await read(); assert.equal(state.objects.shards, 3); assert.equal(state.run.score, 300); assert.equal(state.combat.lives, 3);
  state = await fallIntoFirstRavine(1); assert.equal(state.combat.lives, 2); assert.ok(state.run.score >= 300);
  const retainedScore = state.run.score;
  state = await fallIntoFirstRavine(2); assert.equal(state.combat.lives, 1); assert.equal(state.run.score, retainedScore);
  state = await fallIntoFirstRavine(3); assert.equal(state.combat.lives, 0); assert.equal(state.combat.hearts, 0);
  await expect(page.getByRole('region', { name: 'Game over' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Game over' })).toContainText(`Score ${retainedScore.toLocaleString()}`);
  await page.screenshot({ path: 'artifacts/stage6-game-over.png', fullPage: true });
  await page.getByRole('button', { name: 'Retry level' }).click();
  state = await until(value => value.x < 260 && value.combat.lives === 3 && value.run.score === 0 && !value.gameOver, 'retry reset');
  assert.equal(state.objects.shards, 0); assert.equal(state.combat.deaths, 0);
  assert.deepEqual(errors, []);
  console.log('Stage 6 score, life loss, Game Over and full retry reset passed.');
} finally { await browser.close(); }
