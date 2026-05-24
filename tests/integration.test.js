// Integration tests via headless Chromium (Playwright).
// Covers smoke for each of the 6 apps plus a handful of regression cases.
//
// Run with:  NODE_PATH=/opt/node22/lib/node_modules node tests/integration.test.js
// (or wherever your global node_modules live — `npm root -g` to find it)

'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const APP_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

// Resolve the bundled headless shell first; fall back to playwright's default
function pickExecutable() {
  const candidates = [
    '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  ];
  for (const p of candidates) if (fs.existsSync(p)) return p;
  return undefined; // let Playwright pick
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

// Patch speech in the page so it doesn't depend on real audio. Every
// SpeechSynthesisUtterance is recorded with a timestamp; onend fires fast.
const SPEECH_PATCH = `
  window.__spoken = [];
  const Orig = window.SpeechSynthesisUtterance;
  window.SpeechSynthesisUtterance = function(text) {
    const u = new Orig(text);
    window.__spoken.push({ text, t: performance.now() });
    setTimeout(() => { if (u.onend) u.onend(); }, 60);
    return u;
  };
  window.speechSynthesis.speak = () => {};
`;

// ===== Smoke =====

test('landing loads with no page errors and shows 6 active tiles', async (page) => {
  await page.goto(APP_URL);
  const count = await page.locator('#landing .tile[data-app]').count();
  if (count !== 6) throw new Error(`expected 6 active tiles, got ${count}`);
});

test('every landing tile navigates to its menu screen', async (page) => {
  const apps = ['counting','letters','phonics','rhyming','shapes','name'];
  for (const app of apps) {
    await page.goto(APP_URL);
    await page.click(`button[data-app="${app}"]`);
    await page.waitForTimeout(150);
    const menuId = app === 'name' ? 'tracing-menu' : `${app}-menu`;
    const visible = await page.locator(`#${menuId}.active`).count();
    if (visible !== 1) throw new Error(`${app} did not activate ${menuId}`);
  }
});

// ===== Counting =====

test('counting learn 1-10 starts at "One" with one dino', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="counting"]');
  await page.waitForTimeout(150);
  await page.click('button[data-mode="learn"]');
  await page.waitForTimeout(2700);
  const word = await page.locator('#learn-word').textContent();
  if (word !== 'One') throw new Error(`expected "One", got "${word}"`);
  const dinos = await page.locator('#learn-dinos .dino').count();
  if (dinos !== 1) throw new Error(`expected 1 dino, got ${dinos}`);
});

test('counting learn 11-20 renders the dashed ten-pack + extras', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="counting"]');
  await page.waitForTimeout(150);
  await page.click('.toggle-numbers .case-btn[data-range="11-20"]');
  await page.click('button[data-mode="learn"]');
  // Jump to 17 directly so we know the expected group sizes
  await page.evaluate(() => window.learnShow(17));
  await page.waitForTimeout(500);
  const word = await page.locator('#learn-word').textContent();
  if (word !== 'Seventeen') throw new Error(`expected "Seventeen", got "${word}"`);
  const isGrouped = await page.locator('#learn-dinos.grouped').count();
  if (isGrouped !== 1) throw new Error('expected .grouped class on dino row');
  const tenCount = await page.locator('#learn-dinos .dino-group.ten .dino').count();
  if (tenCount !== 10) throw new Error(`ten-pack should have 10 dinos, got ${tenCount}`);
  const extras = await page.locator('#learn-dinos .dino-group.extras .dino').count();
  if (extras !== 7) throw new Error(`extras should have 7 dinos, got ${extras}`);
});

test('counting listen test produces 4 unique choice tiles', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="counting"]');
  await page.waitForTimeout(150);
  await page.click('button[data-mode="test"]');
  await page.waitForTimeout(500);
  const values = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#test-choices .choice')).map(c => c.textContent));
  if (values.length !== 4) throw new Error(`expected 4 choices, got ${values.length}`);
  if (new Set(values).size !== 4) throw new Error(`choices not unique: ${values.join(',')}`);
});

test('counting look test: name hidden initially, revealed + scored after Knew it', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="counting"]');
  await page.waitForTimeout(150);
  await page.click('button[data-mode="look"]');
  await page.waitForTimeout(2700);
  const before = await page.evaluate(() => ({
    revealed: document.getElementById('look-card').classList.contains('revealed'),
    wordOpacity: getComputedStyle(document.getElementById('look-word')).opacity,
  }));
  if (before.revealed) throw new Error('card should NOT be revealed before answering');
  if (before.wordOpacity !== '0') throw new Error(`word opacity should be 0, got ${before.wordOpacity}`);
  await page.click('#look-knew');
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => ({
    revealed: document.getElementById('look-card').classList.contains('revealed'),
    correct: document.getElementById('look-score-correct').textContent,
    tries: document.getElementById('look-score-tries').textContent,
  }));
  if (!after.revealed) throw new Error('card should be revealed after Knew it');
  if (after.correct !== '1' || after.tries !== '1') {
    throw new Error(`score should be 1/1, got ${after.correct}/${after.tries}`);
  }
});

// ===== Letters =====

test('letters learn upper-case → lower-case toggle changes the displayed letter', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="letters"]');
  await page.waitForTimeout(150);
  // Start in upper (default)
  await page.click('button[data-letters-mode="learn"]');
  await page.waitForTimeout(2500);
  const upperCaption = await page.locator('#letters-word').textContent();
  if (!/^A\b/.test(upperCaption)) throw new Error(`upper caption "${upperCaption}" should start with "A"`);

  // Back and switch case
  await page.locator('#letters-learn .back-btn').click();
  await page.waitForTimeout(150);
  await page.click('.toggle-letters .case-btn[data-case="lower"]');
  await page.click('button[data-letters-mode="learn"]');
  await page.waitForTimeout(2500);
  const lowerCaption = await page.locator('#letters-word').textContent();
  if (!/^a\b/.test(lowerCaption)) throw new Error(`lower caption "${lowerCaption}" should start with "a"`);
});

test('letters listen test choice tiles render in active case', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="letters"]');
  await page.waitForTimeout(150);
  await page.click('.toggle-letters .case-btn[data-case="lower"]');
  await page.click('button[data-letters-mode="test"]');
  await page.waitForTimeout(500);
  const shown = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#letters-test-choices .choice')).map(c => c.textContent));
  if (shown.some(s => s !== s.toLowerCase())) {
    throw new Error(`expected all-lowercase choice tiles, got ${shown.join(',')}`);
  }
});

// ===== Phonics =====

test('phonics learn first card shows CAT with 3 letter boxes and cat emoji', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="phonics"]');
  await page.waitForTimeout(150);
  await page.click('button[data-phonics-mode="learn"]');
  await page.waitForTimeout(500);
  const letters = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#phonics-letters .phonics-letter')).map(l => l.textContent).join(''));
  if (letters !== 'CAT') throw new Error(`expected "CAT", got "${letters}"`);
  const emoji = await page.locator('#phonics-emoji').textContent();
  if (emoji !== '🐱') throw new Error(`expected cat emoji, got "${emoji}"`);
});

test('phonics test choice tiles each have an emoji and a word', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="phonics"]');
  await page.waitForTimeout(150);
  await page.click('button[data-phonics-mode="test"]');
  await page.waitForTimeout(500);
  const choices = await page.evaluate(() =>
    Array.from(document.querySelectorAll('#phonics-test-choices .choice')).map(c => ({
      emoji: c.querySelector('.choice-emoji')?.textContent,
      word:  c.querySelector('.choice-word')?.textContent,
    })));
  if (choices.length !== 4) throw new Error(`expected 4, got ${choices.length}`);
  choices.forEach((c, i) => {
    if (!c.emoji || !c.word) throw new Error(`choice ${i} missing parts: ${JSON.stringify(c)}`);
  });
});

// ===== Rhyming =====

test('rhyming Ears Only toggle hides word text on both learn and test cards', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="rhyming"]');
  await page.waitForTimeout(150);
  await page.click('.toggle-rhyme .case-btn[data-rhyme-mode="ears"]');
  await page.click('button[data-rhyming-mode="learn"]');
  await page.waitForTimeout(500);
  const learnOpacity = await page.evaluate(() =>
    getComputedStyle(document.getElementById('rhyme-text-1')).opacity);
  if (learnOpacity !== '0') throw new Error(`learn text opacity should be 0, got ${learnOpacity}`);

  await page.locator('#rhyming-learn .back-btn').click();
  await page.waitForTimeout(150);
  await page.click('button[data-rhyming-mode="test"]');
  await page.waitForTimeout(500);
  const testOpacity = await page.evaluate(() =>
    getComputedStyle(document.getElementById('rhyme-test-text-1')).opacity);
  if (testOpacity !== '0') throw new Error(`test text opacity should be 0, got ${testOpacity}`);
});

test('rhyming test Yes/No buttons update score appropriately', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="rhyming"]');
  await page.waitForTimeout(150);
  await page.click('button[data-rhyming-mode="test"]');
  await page.waitForTimeout(500);
  const beforeTries = await page.locator('#rhyming-score-tries').textContent();
  if (beforeTries !== '0') throw new Error(`tries should start at 0, got ${beforeTries}`);
  // Tap Yes — outcome depends on random pick, but tries must always advance
  await page.click('#rhyme-yes-btn');
  await page.waitForTimeout(400);
  const afterTries = await page.locator('#rhyming-score-tries').textContent();
  if (afterTries !== '1') throw new Error(`tries should be 1 after one tap, got ${afterTries}`);
});

// ===== Shapes =====

test('shapes listen test renders 4 inline SVG choice tiles', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="shapes"]');
  await page.waitForTimeout(150);
  await page.click('button[data-shapes-mode="test"]');
  await page.waitForTimeout(500);
  const svgCount = await page.locator('#shapes-test-choices .choice svg').count();
  if (svgCount !== 4) throw new Error(`expected 4 svg choices, got ${svgCount}`);
});

test('shapes look test: name hidden, then revealed and scored', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="shapes"]');
  await page.waitForTimeout(150);
  await page.click('button[data-shapes-mode="look"]');
  await page.waitForTimeout(500);
  const beforeOpacity = await page.evaluate(() =>
    getComputedStyle(document.getElementById('shapes-look-name')).opacity);
  if (beforeOpacity !== '0') throw new Error(`name opacity should be 0, got ${beforeOpacity}`);
  await page.click('#shapes-look-knew');
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => ({
    opacity: getComputedStyle(document.getElementById('shapes-look-name')).opacity,
    correct: document.getElementById('shapes-look-correct').textContent,
    tries: document.getElementById('shapes-look-tries').textContent,
  }));
  if (after.opacity !== '1') throw new Error(`name opacity should be 1 after reveal, got ${after.opacity}`);
  if (after.correct !== '1' || after.tries !== '1') {
    throw new Error(`score should be 1/1, got ${after.correct}/${after.tries}`);
  }
});

// ===== Name tracing =====

test('name tracing defaults to DECLAN and a typed name persists across reload', async (page) => {
  await page.goto(APP_URL);
  await page.click('button[data-app="name"]');
  await page.waitForTimeout(150);
  const initial = await page.locator('#kid-name-input').inputValue();
  if (initial !== 'DECLAN') throw new Error(`default should be DECLAN, got ${initial}`);
  await page.fill('#kid-name-input', 'sam');
  await page.click('#start-tracing-btn');
  await page.waitForTimeout(400);
  const chips = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.trace-chip')).map(c => c.textContent).join(''));
  if (chips !== 'SAM') throw new Error(`chips should be SAM, got ${chips}`);

  await page.reload();
  await page.waitForTimeout(200);
  await page.click('button[data-app="name"]');
  await page.waitForTimeout(150);
  const reloaded = await page.locator('#kid-name-input').inputValue();
  if (reloaded !== 'SAM') throw new Error(`reload value should be SAM, got ${reloaded}`);
});

// ===== Speech sequencing =====

test('speakLetter emits 3 utterances with pauses between them', async (page) => {
  await page.addInitScript(SPEECH_PATCH);
  await page.goto(APP_URL);
  await page.evaluate(() => { window.__spoken = []; });
  await page.evaluate(() => window.speakLetter('A'));
  await page.waitForTimeout(3000);
  const seq = await page.evaluate(() => window.__spoken);
  if (seq.length !== 3) throw new Error(`expected 3 utterances, got ${seq.length}: ${JSON.stringify(seq)}`);
  const gap1 = seq[1].t - seq[0].t;
  const gap2 = seq[2].t - seq[1].t;
  // Each gap = 60ms fake onend + ~450/550ms sleep
  if (gap1 < 400) throw new Error(`gap1 too short: ${gap1}ms`);
  if (gap2 < 500) throw new Error(`gap2 too short: ${gap2}ms`);
});

test('speakNumber emits 2 utterances with a pause between them', async (page) => {
  await page.addInitScript(SPEECH_PATCH);
  await page.goto(APP_URL);
  await page.evaluate(() => { window.__spoken = []; });
  await page.evaluate(() => window.speakNumber(7));
  await page.waitForTimeout(2000);
  const seq = await page.evaluate(() => window.__spoken);
  if (seq.length !== 2) throw new Error(`expected 2 utterances, got ${seq.length}: ${JSON.stringify(seq)}`);
  if (seq[0].text !== 'This is the number') throw new Error(`first text: ${seq[0].text}`);
  const gap = seq[1].t - seq[0].t;
  if (gap < 400) throw new Error(`gap too short: ${gap}ms`);
});

// ===== Regression tests for code-review bug fixes =====

test('REGRESSION: back-nav during speech cancels pending utterances', async (page) => {
  // Bug: speakLetter chunks utterances across sleeps; if user navigates back
  // during a sleep, the sleep wakes, token check passes (was never bumped),
  // and the next chunk gets queued on the wrong screen.
  await page.addInitScript(SPEECH_PATCH);
  await page.goto(APP_URL);
  await page.click('button[data-app="letters"]');
  await page.waitForTimeout(150);
  await page.click('button[data-letters-mode="learn"]');
  await page.waitForTimeout(50); // fire-and-forget speech is in flight
  const before = await page.evaluate(() => window.__spoken.length);
  // Navigate back BEFORE the second chunk's sleep elapses (~530ms gap)
  await page.locator('#letters-learn .back-btn').click();
  await page.waitForTimeout(2000); // well past all pending sleeps
  const after = await page.evaluate(() => window.__spoken.length);
  // Should have at most the chunk(s) already queued before the back tap,
  // not the full 3-chunk sequence.
  if (after >= 3) throw new Error(`back-nav should cancel sequence; got ${after} utterances total (started at ${before})`);
});

test('REGRESSION: back-nav cancels a pending nextRound timer (no stale round on re-entry)', async (page) => {
  // Bug: tap Knew it in Look mode → 2000ms timer queued for nextLookRound;
  // if user backs out and re-enters within that window, the stale timer
  // fires and overwrites the freshly-reset state.
  // (Using Look mode because Knew it is always treated as correct, so the
  // timer is queued deterministically — no need to know the random answer.)
  await page.goto(APP_URL);
  await page.click('button[data-app="counting"]');
  await page.waitForTimeout(150);
  await page.click('button[data-mode="look"]');
  await page.waitForTimeout(500);
  await page.click('#look-knew');
  await page.waitForTimeout(200); // celebration up, nextLookRound queued for 2s
  await page.locator('#look-mode .back-btn').click();
  await page.waitForTimeout(150);
  // Re-enter immediately; the queued nextLookRound should NOT fire on top of us
  await page.click('button[data-mode="look"]');
  await page.waitForTimeout(2400); // longer than the original 2000ms timer
  const scores = await page.evaluate(() => ({
    correct: document.getElementById('look-score-correct').textContent,
    tries: document.getElementById('look-score-tries').textContent,
  }));
  // Fresh entry — scores should be 0/0, NOT incremented by a leaked timer
  if (scores.correct !== '0' || scores.tries !== '0') {
    throw new Error(`stale timer leaked: score ${scores.correct}/${scores.tries} should be 0/0`);
  }
});

test('REGRESSION: localStorage throwing on getItem does not break the Name app', async (page) => {
  // Bug: getKidName() called localStorage.getItem unguarded — Safari Private
  // Browsing throws SecurityError, breaking navigation to tracing-menu.
  await page.addInitScript(() => {
    // Simulate Safari private-mode by patching getItem to throw
    const proto = Object.getPrototypeOf(window.localStorage);
    proto.getItem = () => { throw new Error('SecurityError: localStorage disabled'); };
    proto.setItem = () => { throw new Error('SecurityError: localStorage disabled'); };
  });
  await page.goto(APP_URL);
  // Should NOT throw despite getItem failing
  await page.click('button[data-app="name"]');
  await page.waitForTimeout(200);
  const visible = await page.locator('#tracing-menu.active').count();
  if (visible !== 1) throw new Error('Name menu did not open');
  const fallback = await page.locator('#kid-name-input').inputValue();
  if (fallback !== 'DECLAN') throw new Error(`should fall back to DECLAN default, got "${fallback}"`);
});

test('REGRESSION: say() during a learn-speech pause interrupts the in-flight sequence', async (page) => {
  // Bug: say() called speechSynthesis.cancel() but didn't bump learnPlayToken,
  // so a chunked sequence currently in `await sleep(...)` would resume and
  // queue more utterances on top of say()'s new utterance.
  await page.addInitScript(SPEECH_PATCH);
  await page.goto(APP_URL);
  await page.evaluate(() => { window.__spoken = []; });
  await page.evaluate(async () => {
    window.speakLetter('A');                            // queues 3 utterances over ~1s
    await new Promise(r => setTimeout(r, 200));         // during the first sleep
    window.say('Yes! Great job!', { rate: 0.9 });        // should cancel A's sequence
  });
  await page.waitForTimeout(2500);
  const seq = await page.evaluate(() => window.__spoken.map(s => s.text));
  // Expect: A's first chunk ("This is capital"), then say()'s utterance.
  // The remaining 2 chunks of A ("ay" and "ay is for Apple.") must NOT be present.
  if (seq.some(t => t === 'ay' || /is for Apple/.test(t))) {
    throw new Error(`stale A sequence leaked through: ${seq.join(' | ')}`);
  }
});

test('interrupting speakLetter with another speakLetter halts the stale sequence', async (page) => {
  await page.addInitScript(SPEECH_PATCH);
  await page.goto(APP_URL);
  await page.evaluate(() => { window.__spoken = []; });
  await page.evaluate(async () => {
    window.speakLetter('A');
    await new Promise(r => setTimeout(r, 200));
    window.speakLetter('B'); // should stop A from queueing further chunks
  });
  await page.waitForTimeout(3000);
  const seq = await page.evaluate(() => window.__spoken);
  // A queues its first utterance, then is preempted before queuing more.
  // B then queues all 3 of its chunks.
  if (seq.length !== 4) throw new Error(`expected 4 utterances total (1 from A + 3 from B), got ${seq.length}: ${seq.map(s=>s.text).join(' | ')}`);
});

// ===== Runner =====

(async () => {
  const browser = await chromium.launch({ executablePath: pickExecutable() });
  let passed = 0, failed = 0;
  try {
    for (const t of tests) {
      const ctx = await browser.newContext({ viewport: { width: 800, height: 1100 } });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      try {
        await t.fn(page);
        if (errors.length) throw new Error('page error: ' + errors.join(' | '));
        console.log(`  ✓ ${t.name}`);
        passed++;
      } catch (e) {
        console.error(`  ✗ ${t.name}\n      ${e.message}`);
        failed++;
      } finally {
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
