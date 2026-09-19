import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const read = () => page.locator('canvas').evaluate(canvas => JSON.parse(canvas.dataset.debug));
async function until(test, label) {
  const start = Date.now();
  while (Date.now() - start < 12000) { const state = await read(); if (test(state)) return state; await page.waitForTimeout(25); }
  throw new Error(`${label}: ${JSON.stringify(await read())}`);
}
try {
  await page.goto('http://127.0.0.1:5173/?debug=true&safe=true#/play/1-2');
  await page.getByText('1-2 / Moonlit Grove').waitFor();
  const moonlit = await read(); assert.equal(moonlit.levelId, '1-2'); assert.equal(moonlit.windZones, 2);
  await page.locator('canvas').focus(); await page.keyboard.down('d');
  await until(state => state.activeWindZone === 0, 'enter Moonlit Grove tailwind'); await page.keyboard.up('d');
  await page.goto('http://127.0.0.1:5173/?debug=true&safe=true#/play/1-3');
  await page.getByText('1-3 / Canopy Crossing').waitFor();
  const canopy = await read(); assert.equal(canopy.levelId, '1-3'); assert.equal(canopy.windZones, 3);
  console.log('Stage 9 level routing, authored enemy courses and wind-current activation passed.');
} finally { await browser.close(); }
