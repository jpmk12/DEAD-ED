// Renders images/hero.html to images/hero.png at 1200x630.
// Run from repo root:  NODE_PATH=$(npm root -g) node images/render-hero.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const HERO_URL = 'file://' + path.resolve(__dirname, 'hero.html');
  const OUT = path.resolve(__dirname, 'hero.png');
  const dinosJs = fs.readFileSync(path.resolve(__dirname, '..', 'dinos.js'), 'utf8');

  const candidates = ['/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'];
  const exe = candidates.find(fs.existsSync);

  const browser = await chromium.launch({ executablePath: exe });
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2, // sharper PNG
  });
  const page = await ctx.newPage();
  page.on('console', m => console.log('[page]', m.type(), m.text()));
  page.on('pageerror', e => console.log('[pageerror]', e.message));

  // Make DINO_SVGS available before the page's own scripts run, in case the
  // relative <script src="../dinos.js"> path doesn't resolve under file://.
  await page.addInitScript(dinosJs);

  await page.goto(HERO_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT, fullPage: false });
  await browser.close();
  console.log('wrote', OUT);
})();
