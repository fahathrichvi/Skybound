import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

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
async function runTo(x) {
  await page.keyboard.down('Shift'); await page.keyboard.down('d');
  await until(state => state.x >= x, `run to ${x}`);
  await page.keyboard.up('d'); await page.keyboard.up('Shift');
  return settle();
}
async function runningJumpTo(x) {
  await page.keyboard.down('Shift'); await page.keyboard.down('d'); await page.keyboard.down('Space');
  await until(state => state.x >= x, `running jump to ${x}`);
  await page.keyboard.up('Space'); await page.keyboard.up('d'); await page.keyboard.up('Shift');
  return settle();
}
async function touchBlob(expectedHearts) {
  await page.keyboard.down('d');
  const state = await until(value => value.combat.hearts === expectedHearts || value.dying, `damage to ${expectedHearts} hearts`);
  await page.keyboard.up('d');
  return state;
}

try {
  await mkdir('artifacts', { recursive: true });
  await page.goto('http://127.0.0.1:5173/?debug=true#/play');
  await page.getByText('1-1 / The Verdant Trail').waitFor(); await settle(); await page.locator('canvas').focus();
  let state = await read();
  assert.equal(state.combat.hearts, 3); assert.equal(state.combat.enemies.total, 6); assert.equal(state.combat.enemies.defeated, 0);
  assert.equal(state.combat.enemies.active, 0, 'distant enemies should sleep at spawn');

  await runTo(1320);
  state = await touchBlob(2);
  assert.equal(state.combat.deaths, 0); assert.equal(state.combat.invulnerable, true);
  await expect(page.locator('.heart-row')).toHaveAttribute('aria-label', '2 of 3 hearts');
  await page.waitForTimeout(1550); await touchBlob(1);
  await page.waitForTimeout(1550); await touchBlob(0);
  state = await until(value => !value.dying && value.combat.hearts === 3 && value.combat.deaths === 1, 'revive at trailhead');
  assert.ok(state.x < 260, `expected trailhead revive: ${JSON.stringify(state)}`);

  await page.keyboard.press('r');
  state = await until(value => value.combat.deaths === 0 && value.combat.enemies.defeated === 0 && value.x < 260, 'replay reset');
  await runTo(1320);
  await page.keyboard.down('Space'); await page.waitForTimeout(430); await page.keyboard.down('d');
  state = await until(value => value.combat.enemies.defeated === 1, 'stomp Blobling near jump apex');
  await page.keyboard.up('d'); await page.keyboard.up('Space');
  assert.equal(state.combat.enemies.defeated, 1, `Blobling stomp: ${JSON.stringify(state)}`);
  assert.ok(state.combat.hearts > 0);
  await expect(page.locator('.object-toast')).toContainText('Blobling dispersed');
  await page.screenshot({ path: 'artifacts/stage5-enemy-combat.png', fullPage: true });
  assert.deepEqual(errors, [], `Browser errors: ${JSON.stringify(errors)}`);
  console.log('Stage 5 enemy activation, damage protection, defeat recovery, replay reset and stomp passed.');
} finally { await browser.close(); }
