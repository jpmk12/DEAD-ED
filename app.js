// ====== Data ======
const NUMBER_WORDS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five',
  'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
  'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'
];

// Selected counting range, toggled on the Counting menu. Shared by Learn and Test.
let numberRange = '1-10';
function rangeBounds() {
  return numberRange === '11-20' ? [11, 20] : [1, 10];
}

// Range toggle (1-10 / 11-20) on the Counting menu screen
document.querySelectorAll('.toggle-numbers .case-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-numbers .case-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    numberRange = btn.dataset.range;
  });
});

// Emoji-based extras used for the confetti burst (cheap to render lots of).
const EXTRAS = ['🥚', '🌴', '🌋', '🦴', '⭐', '🦖', '🦕'];

const SVG_NS = 'http://www.w3.org/2000/svg';

// Renders a string of characters (digits or uppercase letters) as an SVG
// whose strokes animate on via stroke-dashoffset. Used by both Counting and
// Letters in learn mode. Character path data lives in chars.js (CHAR_PATHS).
let _gradCounter = 0;
function renderChar(str, container) {
  const chars = String(str).split('');
  container.innerHTML = '';

  // Each render gets a unique gradient id so multiple SVGs on the page don't
  // collide on `url(#...)` references.
  const gradId = `cg${++_gradCounter}`;
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${chars.length * 100} 140`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const defs = document.createElementNS(SVG_NS, 'defs');
  // gradientUnits="userSpaceOnUse" so the gradient spans the SVG viewBox
  // top-to-bottom rather than each path's own bbox. Without this, paths
  // with zero-width bboxes (vertical-line strokes like in 4, I, T, H)
  // render invisible because the bbox-relative gradient has no area.
  defs.innerHTML = `
    <linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="140">
      <stop offset="0" stop-color="#ff6b6b"/>
      <stop offset="0.5" stop-color="#ffa94d"/>
      <stop offset="1" stop-color="#ffd43b"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  // Each character gets its own group offset horizontally. Strokes within a
  // character animate in sequence, so e.g. the "4" draws the body then the
  // vertical bar, "A" draws the peak then the crossbar.
  let cumulativeDelay = 0;
  chars.forEach((c, charIdx) => {
    const strokes = (window.CHAR_PATHS && window.CHAR_PATHS[c]) || [];
    strokes.forEach((data, strokeIdx) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', data);
      path.setAttribute('transform', `translate(${charIdx * 100} 0)`);
      path.setAttribute('stroke', `url(#${gradId})`);
      svg.appendChild(path);

      // Set CSS custom props BEFORE applying the .draw class so the very first
      // frame already has the correct dasharray/dashoffset.
      const len = path.getTotalLength();
      path.style.setProperty('--len', len);
      path.style.setProperty('--delay', `${cumulativeDelay}s`);
      path.classList.add('draw');
      cumulativeDelay += strokeIdx === strokes.length - 1 ? 0.8 : 0.5;
    });
  });

  container.appendChild(svg);
}

// ====== Speech ======
// Web Speech API. We pick a voice once it's loaded.
let preferredVoice = null;
function pickVoice() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  // Prefer English voices, ideally a child-friendly or female voice if available
  const en = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'));
  preferredVoice =
    en.find(v => /child|kid|samantha|karen|google us english/i.test(v.name)) ||
    en[0] ||
    voices[0];
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

function say(text, { rate = 0.85, pitch = 1.2 } = {}) {
  if (!('speechSynthesis' in window)) return;
  // Cancel anything mid-speech so taps feel responsive
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (preferredVoice) u.voice = preferredVoice;
  u.rate = rate;
  u.pitch = pitch;
  u.volume = 1;
  speechSynthesis.speak(u);
}

// ====== Inject static SVGs ======
// Any element with data-dino="<key>" gets its inner HTML replaced with that
// dino's SVG markup at load time.
document.querySelectorAll('[data-dino]').forEach(el => {
  const key = el.dataset.dino;
  if (window.DINO_SVGS[key]) el.innerHTML = window.DINO_SVGS[key];
});

// ====== Screen navigation ======
const screens = {
  landing: document.getElementById('landing'),
  'counting-menu': document.getElementById('counting-menu'),
  'learn-mode': document.getElementById('learn-mode'),
  'test-mode': document.getElementById('test-mode'),
  'look-mode': document.getElementById('look-mode'),
  'letters-menu': document.getElementById('letters-menu'),
  'letters-learn': document.getElementById('letters-learn'),
  'letters-test': document.getElementById('letters-test'),
  'phonics-menu': document.getElementById('phonics-menu'),
  'phonics-learn': document.getElementById('phonics-learn'),
  'phonics-test': document.getElementById('phonics-test'),
  'rhyming-menu': document.getElementById('rhyming-menu'),
  'rhyming-learn': document.getElementById('rhyming-learn'),
  'rhyming-test': document.getElementById('rhyming-test'),
  'shapes-menu': document.getElementById('shapes-menu'),
  'shapes-learn': document.getElementById('shapes-learn'),
  'shapes-test': document.getElementById('shapes-test'),
  'shapes-look': document.getElementById('shapes-look'),
  'tracing-menu': document.getElementById('tracing-menu'),
  'tracing-mode': document.getElementById('tracing-mode'),
};

function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

// landing tile -> app menu
document.querySelectorAll('[data-app]').forEach(btn => {
  btn.addEventListener('click', () => {
    const app = btn.dataset.app;
    if (app === 'counting') showScreen('counting-menu');
    else if (app === 'letters') showScreen('letters-menu');
    else if (app === 'phonics') showScreen('phonics-menu');
    else if (app === 'rhyming') showScreen('rhyming-menu');
    else if (app === 'shapes') showScreen('shapes-menu');
    else if (app === 'name') {
      kidNameInput.value = getKidName();
      showScreen('tracing-menu');
    }
  });
});

// counting mode picker -> learn / test / look
document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    if (mode === 'learn') {
      showScreen('learn-mode');
      learnShow(rangeBounds()[0]);
    } else if (mode === 'test') {
      showScreen('test-mode');
      resetScore();
      nextTestRound();
    } else if (mode === 'look') {
      showScreen('look-mode');
      lookResetScore();
      nextLookRound();
    }
  });
});

// letters mode picker -> learn / test
document.querySelectorAll('[data-letters-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.lettersMode;
    if (mode === 'learn') {
      showScreen('letters-learn');
      lettersShow(0);
    } else if (mode === 'test') {
      showScreen('letters-test');
      lettersResetScore();
      nextLettersTestRound();
    }
  });
});

// phonics mode picker -> learn / test
document.querySelectorAll('[data-phonics-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.phonicsMode;
    if (mode === 'learn') {
      showScreen('phonics-learn');
      phonicsShow(0);
    } else if (mode === 'test') {
      showScreen('phonics-test');
      phonicsResetScore();
      nextPhonicsTestRound();
    }
  });
});

// rhyming mode picker -> learn / test
document.querySelectorAll('[data-rhyming-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.rhymingMode;
    if (mode === 'learn') {
      showScreen('rhyming-learn');
      rhymingShow(0);
    } else if (mode === 'test') {
      showScreen('rhyming-test');
      rhymingResetScore();
      nextRhymingTestRound();
    }
  });
});

// shapes mode picker -> learn / listen test / look test
document.querySelectorAll('[data-shapes-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.shapesMode;
    if (mode === 'learn') {
      showScreen('shapes-learn');
      shapesShow(0);
    } else if (mode === 'test') {
      showScreen('shapes-test');
      shapesResetScore();
      nextShapesTestRound();
    } else if (mode === 'look') {
      showScreen('shapes-look');
      shapesLookResetScore();
      nextShapesLookRound();
    }
  });
});

// back buttons
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => {
    speechSynthesis.cancel();
    showScreen(btn.dataset.back);
  });
});

// ====== LEARN MODE ======
let learnNumber = 1;

const learnNumberEl = document.getElementById('learn-number');
const learnDinosEl  = document.getElementById('learn-dinos');
const learnWordEl   = document.getElementById('learn-word');
const learnCardEl   = document.getElementById('learn-card');

function learnShow(n) {
  const [lo, hi] = rangeBounds();
  learnNumber = Math.max(lo, Math.min(hi, n));
  renderChar(learnNumber, learnNumberEl);
  learnWordEl.textContent = NUMBER_WORDS[learnNumber];

  renderDinoRow(learnDinosEl, learnNumber);

  // replay card pop animation
  learnCardEl.classList.remove('pop');
  void learnCardEl.offsetWidth; // reflow to restart anim
  learnCardEl.classList.add('pop');

  speakNumber(learnNumber);
}

// Lays out dinos for the current count into the given container.
// For 1-10, a single flowing row. For 11-20, splits into a dashed
// "ten pack" + the remaining ones — same visual structure preschool
// teachers use to introduce place value.
function renderDinoRow(container, count) {
  container.innerHTML = '';
  container.classList.toggle('grouped', count > 10);

  const dinoKey = window.DINO_KEYS[(count - 1) % window.DINO_KEYS.length];
  const dinoSvg = window.DINO_SVGS[dinoKey];
  const makeDino = (delayStep) => {
    const wrap = document.createElement('div');
    wrap.className = 'dino';
    wrap.innerHTML = dinoSvg;
    wrap.style.animationDelay = `${delayStep}s`;
    return wrap;
  };

  if (count <= 10) {
    for (let i = 0; i < count; i++) {
      container.appendChild(makeDino(i * 0.08));
    }
    return;
  }

  const tenGroup = document.createElement('div');
  tenGroup.className = 'dino-group ten';
  for (let i = 0; i < 10; i++) tenGroup.appendChild(makeDino(i * 0.04));
  container.appendChild(tenGroup);

  const extras = document.createElement('div');
  extras.className = 'dino-group extras';
  for (let i = 0; i < count - 10; i++) extras.appendChild(makeDino((10 + i) * 0.04));
  container.appendChild(extras);
}

function speakNumber(n) {
  say(`This is the number ${NUMBER_WORDS[n]}.`, { rate: 0.8, pitch: 1.25 });
}

document.getElementById('learn-prev').addEventListener('click', () => {
  const [lo, hi] = rangeBounds();
  learnShow(learnNumber === lo ? hi : learnNumber - 1);
});
document.getElementById('learn-next').addEventListener('click', () => {
  const [lo, hi] = rangeBounds();
  learnShow(learnNumber === hi ? lo : learnNumber + 1);
});
document.getElementById('learn-say').addEventListener('click', () => {
  speakNumber(learnNumber);
});

// Tap the card itself to repeat (kids love poking the big number)
learnCardEl.addEventListener('click', () => speakNumber(learnNumber));

// ====== TEST MODE ======
let currentAnswer = null;
let scoreCorrect = 0;
let scoreTries = 0;
let acceptingAnswer = false;

const choicesEl = document.getElementById('test-choices');
const scoreCorrectEl = document.getElementById('score-correct');
const scoreTriesEl = document.getElementById('score-tries');
const celebrateEl = document.getElementById('celebrate');
const celebrateTextEl = document.getElementById('celebrate-text');
const confettiEl = document.getElementById('confetti');

function resetScore() {
  scoreCorrect = 0;
  scoreTries = 0;
  scoreCorrectEl.textContent = '0';
  scoreTriesEl.textContent = '0';
}

function nextTestRound() {
  acceptingAnswer = true;
  const [lo, hi] = rangeBounds();
  const pick = () => lo + Math.floor(Math.random() * (hi - lo + 1));
  currentAnswer = pick();

  // Build 4 unique choices including the correct one
  const pool = new Set([currentAnswer]);
  while (pool.size < 4) pool.add(pick());
  const choices = shuffle([...pool]);

  choicesEl.innerHTML = '';
  choices.forEach((num, i) => {
    const btn = document.createElement('button');
    btn.className = `choice c${i + 1}`;
    btn.textContent = num;
    btn.dataset.value = num;
    btn.addEventListener('click', () => handleChoice(btn, num));
    choicesEl.appendChild(btn);
  });

  // After a tiny beat, say the prompt
  setTimeout(() => sayTestPrompt(), 350);
}

function sayTestPrompt() {
  say(`Can you find... ${NUMBER_WORDS[currentAnswer]}?`, { rate: 0.85, pitch: 1.25 });
}

document.getElementById('test-say').addEventListener('click', sayTestPrompt);

function handleChoice(btn, value) {
  if (!acceptingAnswer) return;
  scoreTries++;
  scoreTriesEl.textContent = String(scoreTries);

  if (value === currentAnswer) {
    acceptingAnswer = false;
    btn.classList.add('correct');
    scoreCorrect++;
    scoreCorrectEl.textContent = String(scoreCorrect);
    say(`Yes! ${NUMBER_WORDS[currentAnswer]}! Great job!`, { rate: 0.9, pitch: 1.3 });
    celebrate();
    setTimeout(nextTestRound, 1800);
  } else {
    btn.classList.add('wrong');
    say(`Try again!`, { rate: 0.95, pitch: 1.2 });
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ====== Celebrate ======
const CELEBRATE_WORDS = ['Yay!', 'Roar-some!', 'Awesome!', 'Woohoo!', 'Great!', 'Dino-mite!'];
function celebrate() {
  celebrateTextEl.textContent = CELEBRATE_WORDS[Math.floor(Math.random() * CELEBRATE_WORDS.length)];
  celebrateEl.classList.add('show');

  // confetti
  confettiEl.innerHTML = '';
  const pieces = [...EXTRAS, '🎉', '✨', '🌟'];
  for (let i = 0; i < 22; i++) {
    const s = document.createElement('span');
    s.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 0.4}s`;
    s.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
    confettiEl.appendChild(s);
  }

  setTimeout(() => celebrateEl.classList.remove('show'), 1500);
}

// ====== LOOK TEST (see numeral, say it) ======
// Recognition drill: numeral is shown on the card; dinos + word are hidden
// until the parent taps "Knew it" or "Help me", at which point everything
// fades in and the answer is spoken. Score is self-reported.
const lookNumberEl  = document.getElementById('look-number');
const lookWordEl    = document.getElementById('look-word');
const lookDinosEl   = document.getElementById('look-dinos');
const lookCardEl    = document.getElementById('look-card');
const lookCorrectEl = document.getElementById('look-score-correct');
const lookTriesEl   = document.getElementById('look-score-tries');

let lookAnswer = null;
let lookCorrect = 0;
let lookTries = 0;
let lookAccepting = false;

function lookResetScore() {
  lookCorrect = 0;
  lookTries = 0;
  lookCorrectEl.textContent = '0';
  lookTriesEl.textContent = '0';
}

function nextLookRound() {
  speechSynthesis.cancel();
  const [lo, hi] = rangeBounds();
  lookAnswer = lo + Math.floor(Math.random() * (hi - lo + 1));

  // Draw the numeral; leave word + dinos empty until reveal.
  renderChar(lookAnswer, lookNumberEl);
  lookWordEl.textContent = NUMBER_WORDS[lookAnswer]; // pre-populated; opacity hides it
  lookDinosEl.innerHTML = '';
  lookCardEl.classList.remove('revealed');

  lookAccepting = true;
}

function handleLookAnswer(knew) {
  if (!lookAccepting) return;
  lookAccepting = false;

  lookTries++;
  lookTriesEl.textContent = String(lookTries);
  if (knew) {
    lookCorrect++;
    lookCorrectEl.textContent = String(lookCorrect);
  }

  // Reveal: fade in the word, populate dinos, speak the answer.
  renderDinoRow(lookDinosEl, lookAnswer);
  lookCardEl.classList.add('revealed');
  say(`${NUMBER_WORDS[lookAnswer]}!`, { rate: 0.9, pitch: 1.3 });

  if (knew) celebrate();

  setTimeout(nextLookRound, 2000);
}

document.getElementById('look-knew').addEventListener('click', () => handleLookAnswer(true));
document.getElementById('look-help').addEventListener('click', () => handleLookAnswer(false));

// ====== LETTERS LEARN MODE ======
let letterIdx = 0;
let letterCase = 'upper'; // 'upper' | 'lower' — shared by Learn and Test

// Case toggle (ABC / abc) on the Letters menu screen
document.querySelectorAll('.toggle-letters .case-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-letters .case-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    letterCase = btn.dataset.case;
  });
});

function castCase(upper) {
  return letterCase === 'lower' ? upper.toLowerCase() : upper;
}

const lettersLetterEl = document.getElementById('letters-letter');
const lettersImgEl    = document.getElementById('letters-img');
const lettersWordEl   = document.getElementById('letters-word');
const lettersCardEl   = document.getElementById('letters-card');

function lettersShow(idx) {
  letterIdx = ((idx % 26) + 26) % 26;
  const upper = window.LETTERS[letterIdx];
  const letter = castCase(upper);
  const info  = window.LETTER_INFO[upper];

  renderChar(letter, lettersLetterEl);
  lettersImgEl.textContent = info.emoji;
  lettersWordEl.textContent = `${letter} is for ${letterCase === 'lower' ? info.word.toLowerCase() : info.word}`;

  // retrigger the emoji pop animation
  lettersImgEl.style.animation = 'none';
  void lettersImgEl.offsetWidth;
  lettersImgEl.style.animation = '';

  // retrigger card pop
  lettersCardEl.classList.remove('pop');
  void lettersCardEl.offsetWidth;
  lettersCardEl.classList.add('pop');

  speakLetter(upper);
}

function speakLetter(letter) {
  const info = window.LETTER_INFO[letter];
  const name = window.LETTER_NAMES[letter];
  const lead = letterCase === 'lower'
    ? `This is lowercase ${name}.`
    : `This is capital ${name}.`;
  say(`${lead} ${name} is for ${info.word}.`, { rate: 0.8, pitch: 1.25 });
}

document.getElementById('letters-prev').addEventListener('click', () => lettersShow(letterIdx - 1));
document.getElementById('letters-next').addEventListener('click', () => lettersShow(letterIdx + 1));
document.getElementById('letters-say').addEventListener('click', () => speakLetter(window.LETTERS[letterIdx]));
lettersCardEl.addEventListener('click', () => speakLetter(window.LETTERS[letterIdx]));

// ====== LETTERS TEST MODE ======
let lettersAnswer = null;
let lettersCorrect = 0;
let lettersTries = 0;
let lettersAccepting = false;

const lettersChoicesEl     = document.getElementById('letters-test-choices');
const lettersCorrectEl     = document.getElementById('letters-score-correct');
const lettersTriesEl       = document.getElementById('letters-score-tries');

function lettersResetScore() {
  lettersCorrect = 0;
  lettersTries = 0;
  lettersCorrectEl.textContent = '0';
  lettersTriesEl.textContent = '0';
}

function nextLettersTestRound() {
  lettersAccepting = true;
  // lettersAnswer is always stored as the uppercase key (used to look up
  // the phonetic name in LETTER_NAMES); choice tiles render in current case.
  lettersAnswer = window.LETTERS[Math.floor(Math.random() * 26)];

  const pool = new Set([lettersAnswer]);
  while (pool.size < 4) pool.add(window.LETTERS[Math.floor(Math.random() * 26)]);
  const choices = shuffle([...pool]);

  lettersChoicesEl.innerHTML = '';
  choices.forEach((l, i) => {
    const display = castCase(l);
    const btn = document.createElement('button');
    btn.className = `choice c${i + 1}`;
    btn.textContent = display;
    btn.dataset.value = l;
    btn.addEventListener('click', () => handleLetterChoice(btn, l));
    lettersChoicesEl.appendChild(btn);
  });

  setTimeout(sayLettersTestPrompt, 350);
}

function sayLettersTestPrompt() {
  const name = window.LETTER_NAMES[lettersAnswer];
  const lead = letterCase === 'lower' ? 'lowercase' : 'capital';
  say(`Can you find ${lead} ${name}?`, { rate: 0.85, pitch: 1.25 });
}

document.getElementById('letters-test-say').addEventListener('click', sayLettersTestPrompt);

function handleLetterChoice(btn, value) {
  if (!lettersAccepting) return;
  lettersTries++;
  lettersTriesEl.textContent = String(lettersTries);

  if (value === lettersAnswer) {
    lettersAccepting = false;
    btn.classList.add('correct');
    lettersCorrect++;
    lettersCorrectEl.textContent = String(lettersCorrect);
    const name = window.LETTER_NAMES[lettersAnswer];
    const lead = letterCase === 'lower' ? 'lowercase' : 'capital';
    say(`Yes! ${lead} ${name}! Great job!`, { rate: 0.9, pitch: 1.3 });
    celebrate();
    setTimeout(nextLettersTestRound, 1800);
  } else {
    btn.classList.add('wrong');
    say(`Try again!`, { rate: 0.95, pitch: 1.2 });
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

// ====== PHONICS LEARN MODE ======
// Sequenced TTS helpers — needed so each letter sound can finish before
// the next one starts (and the matching letter box can highlight).
function sayAsync(text, opts = {}) {
  return new Promise(resolve => {
    if (!('speechSynthesis' in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    if (preferredVoice) u.voice = preferredVoice;
    u.rate   = opts.rate   ?? 0.8;
    u.pitch  = opts.pitch  ?? 1.2;
    u.volume = opts.volume ?? 1;
    // Resolve on both end and error — speechSynthesis.cancel() fires
    // onerror in some browsers, onend in others. Either way, unblock.
    u.onend = u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

let phonicsIdx = 0;
// Monotonic id so a stale speak-loop from the previous card can detect
// that it's been superseded and stop touching the DOM.
let phonicsPlayToken = 0;

const phonicsLettersEl = document.getElementById('phonics-letters');
const phonicsEmojiEl   = document.getElementById('phonics-emoji');
const phonicsWordEl    = document.getElementById('phonics-word');
const phonicsCardEl    = document.getElementById('phonics-card');

function phonicsShow(idx) {
  const total = window.PHONICS_WORDS.length;
  phonicsIdx = ((idx % total) + total) % total;
  const item = window.PHONICS_WORDS[phonicsIdx];

  // Build the row of letter boxes (each tappable to play just its sound)
  phonicsLettersEl.innerHTML = '';
  item.word.split('').forEach((ch, i) => {
    const box = document.createElement('div');
    box.className = 'phonics-letter';
    box.textContent = ch;
    box.style.animationDelay = `${i * 0.08}s`;
    box.addEventListener('click', () => playSingleSound(item, i));
    phonicsLettersEl.appendChild(box);
  });

  phonicsEmojiEl.textContent = item.emoji;
  phonicsWordEl.textContent  = item.word.charAt(0) + item.word.slice(1).toLowerCase();

  // retrigger emoji pop
  phonicsEmojiEl.style.animation = 'none';
  void phonicsEmojiEl.offsetWidth;
  phonicsEmojiEl.style.animation = '';

  // retrigger card pop
  phonicsCardEl.classList.remove('pop');
  void phonicsCardEl.offsetWidth;
  phonicsCardEl.classList.add('pop');

  speakPhonicsWord(item);
}

async function speakPhonicsWord(item) {
  speechSynthesis.cancel();
  const token = ++phonicsPlayToken;
  const letters = phonicsLettersEl.querySelectorAll('.phonics-letter');

  // Sound out each letter while highlighting the matching box
  for (let i = 0; i < item.sounds.length; i++) {
    if (token !== phonicsPlayToken) return;
    if (letters[i]) letters[i].classList.add('active');
    await sayAsync(item.sounds[i], { rate: 0.6, pitch: 1.25 });
    if (token !== phonicsPlayToken) return;
    if (letters[i]) letters[i].classList.remove('active');
    await sleep(180);
  }

  if (token !== phonicsPlayToken) return;
  // Then say the whole word with all boxes lit
  letters.forEach(l => l.classList.add('active'));
  await sleep(160);
  await sayAsync(item.word, { rate: 0.9, pitch: 1.3 });
  if (token !== phonicsPlayToken) return;
  letters.forEach(l => l.classList.remove('active'));
}

async function playSingleSound(item, i) {
  speechSynthesis.cancel();
  const token = ++phonicsPlayToken;
  const letters = phonicsLettersEl.querySelectorAll('.phonics-letter');
  if (letters[i]) letters[i].classList.add('active');
  await sayAsync(item.sounds[i], { rate: 0.6, pitch: 1.25 });
  if (token !== phonicsPlayToken) return;
  if (letters[i]) letters[i].classList.remove('active');
}

document.getElementById('phonics-prev').addEventListener('click', () => phonicsShow(phonicsIdx - 1));
document.getElementById('phonics-next').addEventListener('click', () => phonicsShow(phonicsIdx + 1));
document.getElementById('phonics-say').addEventListener('click', () => speakPhonicsWord(window.PHONICS_WORDS[phonicsIdx]));
phonicsEmojiEl.addEventListener('click', () => speakPhonicsWord(window.PHONICS_WORDS[phonicsIdx]));

// ====== PHONICS TEST MODE ======
let phonicsAnswer = null;
let phonicsCorrect = 0;
let phonicsTries = 0;
let phonicsAccepting = false;

const phonicsChoicesEl     = document.getElementById('phonics-test-choices');
const phonicsCorrectEl     = document.getElementById('phonics-score-correct');
const phonicsTriesEl       = document.getElementById('phonics-score-tries');

function phonicsResetScore() {
  phonicsCorrect = 0;
  phonicsTries = 0;
  phonicsCorrectEl.textContent = '0';
  phonicsTriesEl.textContent = '0';
}

function nextPhonicsTestRound() {
  phonicsAccepting = true;
  const pool = window.PHONICS_WORDS;
  phonicsAnswer = pool[Math.floor(Math.random() * pool.length)];

  // Pick 3 distinct wrong choices
  const set = new Set([phonicsAnswer.word]);
  const choices = [phonicsAnswer];
  while (choices.length < 4) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (!set.has(c.word)) { set.add(c.word); choices.push(c); }
  }
  shuffle(choices);

  phonicsChoicesEl.innerHTML = '';
  choices.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = `choice phonics-choice c${i + 1}`;
    btn.innerHTML =
      `<div class="choice-emoji">${item.emoji}</div>` +
      `<div class="choice-word">${item.word.toLowerCase()}</div>`;
    btn.dataset.value = item.word;
    btn.addEventListener('click', () => handlePhonicsChoice(btn, item));
    phonicsChoicesEl.appendChild(btn);
  });

  setTimeout(sayPhonicsTestPrompt, 350);
}

async function sayPhonicsTestPrompt() {
  speechSynthesis.cancel();
  const token = ++phonicsPlayToken;
  await sayAsync('Can you find...', { rate: 0.85, pitch: 1.25 });
  if (token !== phonicsPlayToken) return;
  await sleep(150);
  for (const s of phonicsAnswer.sounds) {
    if (token !== phonicsPlayToken) return;
    await sayAsync(s, { rate: 0.55, pitch: 1.25 });
    await sleep(120);
  }
  if (token !== phonicsPlayToken) return;
  await sayAsync(phonicsAnswer.word, { rate: 0.85, pitch: 1.3 });
}

document.getElementById('phonics-test-say').addEventListener('click', sayPhonicsTestPrompt);

function handlePhonicsChoice(btn, item) {
  if (!phonicsAccepting) return;
  phonicsTries++;
  phonicsTriesEl.textContent = String(phonicsTries);

  if (item.word === phonicsAnswer.word) {
    phonicsAccepting = false;
    btn.classList.add('correct');
    phonicsCorrect++;
    phonicsCorrectEl.textContent = String(phonicsCorrect);
    say(`Yes! ${phonicsAnswer.word}! Great job!`, { rate: 0.9, pitch: 1.3 });
    celebrate();
    setTimeout(nextPhonicsTestRound, 1800);
  } else {
    btn.classList.add('wrong');
    say(`Try again!`, { rate: 0.95, pitch: 1.2 });
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

// ====== RHYMING LEARN MODE ======
// Display mode toggle on the Rhyming menu — 'show' renders the printed
// words alongside emoji (default), 'ears' hides the words so the kid has
// to listen for the matching sound instead of pattern-matching letters.
let rhymeMode = 'show'; // 'show' | 'ears'

document.querySelectorAll('.toggle-rhyme .case-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-rhyme .case-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    rhymeMode = btn.dataset.rhymeMode;
  });
});

function applyRhymeMode(cardEl) {
  cardEl.classList.toggle('ears-only', rhymeMode === 'ears');
}

const rhymeEmoji1El   = document.getElementById('rhyme-emoji-1');
const rhymeText1El    = document.getElementById('rhyme-text-1');
const rhymeEmoji2El   = document.getElementById('rhyme-emoji-2');
const rhymeText2El    = document.getElementById('rhyme-text-2');
const rhymeVerdictEl  = document.getElementById('rhyme-verdict');
const rhymingCardEl   = document.getElementById('rhyming-card');

let rhymeIdx = 0;
let rhymePlayToken = 0;

function rhymingShow(idx) {
  const total = window.RHYME_PAIRS.length;
  rhymeIdx = ((idx % total) + total) % total;
  const pair = window.RHYME_PAIRS[rhymeIdx];

  rhymeEmoji1El.textContent = pair.e1;
  rhymeText1El.textContent  = pair.w1.toLowerCase();
  rhymeEmoji2El.textContent = pair.e2;
  rhymeText2El.textContent  = pair.w2.toLowerCase();

  rhymeVerdictEl.textContent = pair.rhyme ? 'They Rhyme!' : "They Don't Rhyme";
  rhymeVerdictEl.className   = 'rhyme-verdict ' + (pair.rhyme ? 'yes' : 'no');

  applyRhymeMode(rhymingCardEl);

  // Replay the verdict pop animation
  rhymeVerdictEl.style.animation = 'none';
  void rhymeVerdictEl.offsetWidth;
  rhymeVerdictEl.style.animation = '';

  // Card pop
  rhymingCardEl.classList.remove('pop');
  void rhymingCardEl.offsetWidth;
  rhymingCardEl.classList.add('pop');

  speakRhymePair(pair, { withVerdict: true });
}

async function speakRhymePair(pair, opts = {}) {
  speechSynthesis.cancel();
  const token = ++rhymePlayToken;
  await sayAsync(pair.w1, { rate: 0.85, pitch: 1.25 });
  if (token !== rhymePlayToken) return;
  await sleep(220);
  await sayAsync(pair.w2, { rate: 0.85, pitch: 1.25 });
  if (token !== rhymePlayToken || !opts.withVerdict) return;
  await sleep(380);
  await sayAsync(pair.rhyme ? 'They rhyme!' : "They don't rhyme.", { rate: 0.85, pitch: 1.3 });
}

document.getElementById('rhyming-prev').addEventListener('click', () => rhymingShow(rhymeIdx - 1));
document.getElementById('rhyming-next').addEventListener('click', () => rhymingShow(rhymeIdx + 1));
document.getElementById('rhyming-say').addEventListener('click', () => speakRhymePair(window.RHYME_PAIRS[rhymeIdx], { withVerdict: true }));
rhymingCardEl.addEventListener('click', () => speakRhymePair(window.RHYME_PAIRS[rhymeIdx], { withVerdict: true }));

// ====== RHYMING TEST MODE ======
const rhymeTestEmoji1El = document.getElementById('rhyme-test-emoji-1');
const rhymeTestText1El  = document.getElementById('rhyme-test-text-1');
const rhymeTestEmoji2El = document.getElementById('rhyme-test-emoji-2');
const rhymeTestText2El  = document.getElementById('rhyme-test-text-2');
const rhymeYesBtn       = document.getElementById('rhyme-yes-btn');
const rhymeNoBtn        = document.getElementById('rhyme-no-btn');
const rhymeCorrectEl    = document.getElementById('rhyming-score-correct');
const rhymeTriesEl      = document.getElementById('rhyming-score-tries');

let rhymeAnswer = null;
let rhymeCorrect = 0;
let rhymeTries = 0;
let rhymeAccepting = false;

function rhymingResetScore() {
  rhymeCorrect = 0;
  rhymeTries = 0;
  rhymeCorrectEl.textContent = '0';
  rhymeTriesEl.textContent = '0';
}

function nextRhymingTestRound() {
  rhymeAccepting = true;
  rhymeAnswer = window.RHYME_PAIRS[Math.floor(Math.random() * window.RHYME_PAIRS.length)];

  rhymeTestEmoji1El.textContent = rhymeAnswer.e1;
  rhymeTestText1El.textContent  = rhymeAnswer.w1.toLowerCase();
  rhymeTestEmoji2El.textContent = rhymeAnswer.e2;
  rhymeTestText2El.textContent  = rhymeAnswer.w2.toLowerCase();

  applyRhymeMode(document.getElementById('rhyming-test-card'));

  // Reset any lingering button flash from the previous round
  rhymeYesBtn.classList.remove('correct', 'wrong');
  rhymeNoBtn.classList.remove('correct', 'wrong');

  setTimeout(() => speakRhymePair(rhymeAnswer), 350);
}

document.getElementById('rhyming-test-say').addEventListener('click', () => {
  if (rhymeAnswer) speakRhymePair(rhymeAnswer);
});

function handleRhymeAnswer(btn, saidYes) {
  if (!rhymeAccepting) return;
  rhymeTries++;
  rhymeTriesEl.textContent = String(rhymeTries);

  const isCorrect = saidYes === rhymeAnswer.rhyme;
  if (isCorrect) {
    rhymeAccepting = false;
    rhymeCorrect++;
    rhymeCorrectEl.textContent = String(rhymeCorrect);
    btn.classList.add('correct');
    say(saidYes ? 'Yes! They rhyme! Great job!' : "Right! They don't rhyme! Great job!",
        { rate: 0.9, pitch: 1.3 });
    celebrate();
    setTimeout(nextRhymingTestRound, 1800);
  } else {
    btn.classList.add('wrong');
    say('Try again!', { rate: 0.95, pitch: 1.2 });
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

rhymeYesBtn.addEventListener('click', () => handleRhymeAnswer(rhymeYesBtn, true));
rhymeNoBtn .addEventListener('click', () => handleRhymeAnswer(rhymeNoBtn,  false));

// ====== SHAPES LEARN MODE ======
const shapeDisplayEl  = document.getElementById('shape-display');
const shapeNameEl     = document.getElementById('shape-name');
const shapesCardEl    = document.getElementById('shapes-card');

let shapeIdx = 0;

function shapesShow(idx) {
  const total = window.SHAPES.length;
  shapeIdx = ((idx % total) + total) % total;
  const shape = window.SHAPES[shapeIdx];

  shapeDisplayEl.innerHTML = shape.svg;
  shapeNameEl.textContent  = shape.name;

  // Retrigger shape pop animation
  shapeDisplayEl.style.animation = 'none';
  void shapeDisplayEl.offsetWidth;
  shapeDisplayEl.style.animation = '';

  // Card pop
  shapesCardEl.classList.remove('pop');
  void shapesCardEl.offsetWidth;
  shapesCardEl.classList.add('pop');

  speakShape(shape);
}

function speakShape(shape) {
  // "A" vs "An" — Oval is the only vowel-starter
  const article = /^[aeiou]/i.test(shape.name) ? 'an' : 'a';
  say(`This is ${article} ${shape.name.toLowerCase()}.`, { rate: 0.85, pitch: 1.25 });
}

document.getElementById('shapes-prev').addEventListener('click', () => shapesShow(shapeIdx - 1));
document.getElementById('shapes-next').addEventListener('click', () => shapesShow(shapeIdx + 1));
document.getElementById('shapes-say').addEventListener('click', () => speakShape(window.SHAPES[shapeIdx]));
shapesCardEl.addEventListener('click', () => speakShape(window.SHAPES[shapeIdx]));

// ====== SHAPES LISTEN TEST ======
const shapesChoicesEl    = document.getElementById('shapes-test-choices');
const shapesCorrectEl    = document.getElementById('shapes-score-correct');
const shapesTriesEl      = document.getElementById('shapes-score-tries');

let shapesAnswer = null;
let shapesCorrect = 0;
let shapesTries = 0;
let shapesAccepting = false;

function shapesResetScore() {
  shapesCorrect = 0;
  shapesTries = 0;
  shapesCorrectEl.textContent = '0';
  shapesTriesEl.textContent = '0';
}

function nextShapesTestRound() {
  shapesAccepting = true;
  const pool = window.SHAPES;
  shapesAnswer = pool[Math.floor(Math.random() * pool.length)];

  // Pick 3 distinct wrong choices
  const set = new Set([shapesAnswer.name]);
  const choices = [shapesAnswer];
  while (choices.length < 4) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (!set.has(c.name)) { set.add(c.name); choices.push(c); }
  }
  shuffle(choices);

  shapesChoicesEl.innerHTML = '';
  choices.forEach((shape, i) => {
    const btn = document.createElement('button');
    btn.className = `choice shape-choice c${i + 1}`;
    btn.innerHTML = shape.svg;
    btn.dataset.value = shape.name;
    btn.addEventListener('click', () => handleShapeChoice(btn, shape));
    shapesChoicesEl.appendChild(btn);
  });

  setTimeout(sayShapeTestPrompt, 350);
}

function sayShapeTestPrompt() {
  const article = /^[aeiou]/i.test(shapesAnswer.name) ? 'an' : 'a';
  say(`Can you find ${article} ${shapesAnswer.name.toLowerCase()}?`, { rate: 0.85, pitch: 1.25 });
}

document.getElementById('shapes-test-say').addEventListener('click', sayShapeTestPrompt);

function handleShapeChoice(btn, shape) {
  if (!shapesAccepting) return;
  shapesTries++;
  shapesTriesEl.textContent = String(shapesTries);

  if (shape.name === shapesAnswer.name) {
    shapesAccepting = false;
    btn.classList.add('correct');
    shapesCorrect++;
    shapesCorrectEl.textContent = String(shapesCorrect);
    say(`Yes! ${shapesAnswer.name}! Great job!`, { rate: 0.9, pitch: 1.3 });
    celebrate();
    setTimeout(nextShapesTestRound, 1800);
  } else {
    btn.classList.add('wrong');
    say(`Try again!`, { rate: 0.95, pitch: 1.2 });
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

// ====== SHAPES LOOK TEST (see shape, say it) ======
const shapesLookDisplayEl = document.getElementById('shapes-look-display');
const shapesLookNameEl    = document.getElementById('shapes-look-name');
const shapesLookCardEl    = document.getElementById('shapes-look-card');
const shapesLookCorrectEl = document.getElementById('shapes-look-correct');
const shapesLookTriesEl   = document.getElementById('shapes-look-tries');

let shapesLookAnswer = null;
let shapesLookCorrect = 0;
let shapesLookTries = 0;
let shapesLookAccepting = false;

function shapesLookResetScore() {
  shapesLookCorrect = 0;
  shapesLookTries = 0;
  shapesLookCorrectEl.textContent = '0';
  shapesLookTriesEl.textContent = '0';
}

function nextShapesLookRound() {
  speechSynthesis.cancel();
  shapesLookAnswer = window.SHAPES[Math.floor(Math.random() * window.SHAPES.length)];

  shapesLookDisplayEl.innerHTML = shapesLookAnswer.svg;
  shapesLookNameEl.textContent  = shapesLookAnswer.name;
  shapesLookCardEl.classList.remove('revealed');

  shapesLookAccepting = true;
}

function handleShapesLookAnswer(knew) {
  if (!shapesLookAccepting) return;
  shapesLookAccepting = false;

  shapesLookTries++;
  shapesLookTriesEl.textContent = String(shapesLookTries);
  if (knew) {
    shapesLookCorrect++;
    shapesLookCorrectEl.textContent = String(shapesLookCorrect);
  }

  shapesLookCardEl.classList.add('revealed');
  say(`${shapesLookAnswer.name}!`, { rate: 0.9, pitch: 1.3 });

  if (knew) celebrate();

  setTimeout(nextShapesLookRound, 2000);
}

document.getElementById('shapes-look-knew').addEventListener('click', () => handleShapesLookAnswer(true));
document.getElementById('shapes-look-help').addEventListener('click', () => handleShapesLookAnswer(false));

// ====== NAME TRACING ======
// Parent enters the name on the menu screen; it's persisted in localStorage.
// Tracing screen shows one letter at a time as a fat gray "track" (the
// existing CHAR_PATHS rendered with a wide light-gray stroke). A canvas
// overlay captures the kid's finger drawing — no strict hit detection,
// just paint-by-tracing so it stays fun for 3-5 year olds.

const KID_NAME_KEY = 'dinoLearnKidName';
const KID_NAME_DEFAULT = 'DECLAN';
function getKidName() {
  const stored = (localStorage.getItem(KID_NAME_KEY) || '').toUpperCase();
  return stored || KID_NAME_DEFAULT;
}
function setKidName(name) {
  const cleaned = String(name || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (cleaned) localStorage.setItem(KID_NAME_KEY, cleaned);
  return cleaned;
}

const kidNameInput        = document.getElementById('kid-name-input');
const traceProgressEl     = document.getElementById('trace-progress');
const traceTemplateEl     = document.getElementById('trace-template');
const traceCardEl         = document.getElementById('trace-card');
const traceCanvas         = document.getElementById('trace-canvas');
const traceCtx            = traceCanvas.getContext('2d');

// Auto-uppercase as user types so it matches the template letters
kidNameInput.addEventListener('input', () => {
  const start = kidNameInput.selectionStart;
  kidNameInput.value = kidNameInput.value.toUpperCase().replace(/[^A-Z ]/g, '');
  kidNameInput.setSelectionRange(start, start);
});

// Rotate through these colors as the kid traces successive letters
const TRACE_COLORS = ['#ff6b6b', '#ffa94d', '#fab005', '#51cf66', '#339af0', '#b197fc', '#ff8fab'];

let traceLetters = [];
let traceLetterIdx = 0;

document.getElementById('start-tracing-btn').addEventListener('click', () => {
  const cleaned = setKidName(kidNameInput.value) || KID_NAME_DEFAULT;
  kidNameInput.value = cleaned;
  traceLetters = cleaned.split('');
  traceLetterIdx = 0;
  showScreen('tracing-mode');
  // Defer setup until the screen is on-screen so the canvas has its real size
  requestAnimationFrame(() => showTraceLetter(0));
});

function showTraceLetter(idx) {
  traceLetterIdx = Math.max(0, Math.min(traceLetters.length - 1, idx));
  const letter = traceLetters[traceLetterIdx];

  // Render the gray template (reusing CHAR_PATHS from chars.js)
  renderTraceTemplate(letter, traceTemplateEl);

  // Render progress chips
  traceProgressEl.innerHTML = '';
  traceLetters.forEach((l, i) => {
    const chip = document.createElement('span');
    chip.className = 'trace-chip';
    if (i < traceLetterIdx) chip.classList.add('done');
    if (i === traceLetterIdx) chip.classList.add('current');
    chip.textContent = l;
    traceProgressEl.appendChild(chip);
  });

  // Card pop
  traceCardEl.style.animation = 'none';
  void traceCardEl.offsetWidth;
  traceCardEl.style.animation = '';

  // Clear and resize the canvas; pick the next color
  resetTraceCanvas();
  traceCtx.strokeStyle = TRACE_COLORS[traceLetterIdx % TRACE_COLORS.length];

  // Speak the letter so they hear what they're tracing
  const name = (window.LETTER_NAMES && window.LETTER_NAMES[letter]) || letter;
  say(`${name}!`, { rate: 0.85, pitch: 1.25 });
}

function renderTraceTemplate(letter, container) {
  const strokes = (window.CHAR_PATHS && window.CHAR_PATHS[letter]) || [];
  container.innerHTML = '';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 100 140');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  strokes.forEach(d => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#e9ecef');
    path.setAttribute('stroke-width', '34');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);

    // A subtle dashed inner guide along the path's centerline so it's
    // obvious which way the stroke runs.
    const guide = document.createElementNS(SVG_NS, 'path');
    guide.setAttribute('d', d);
    guide.setAttribute('fill', 'none');
    guide.setAttribute('stroke', '#ced4da');
    guide.setAttribute('stroke-width', '1.5');
    guide.setAttribute('stroke-dasharray', '3 3');
    guide.setAttribute('stroke-linecap', 'round');
    svg.appendChild(guide);
  });

  container.appendChild(svg);
}

function resetTraceCanvas() {
  // Match canvas internal pixels to its CSS box (×DPR for sharpness)
  const rect = traceCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  traceCanvas.width  = Math.max(1, Math.round(rect.width * dpr));
  traceCanvas.height = Math.max(1, Math.round(rect.height * dpr));
  // setTransform replaces any prior scale (avoids compounding across resets)
  traceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  traceCtx.clearRect(0, 0, rect.width, rect.height);
  traceCtx.lineWidth = 18;
  traceCtx.lineCap = 'round';
  traceCtx.lineJoin = 'round';
  traceCtx.strokeStyle = TRACE_COLORS[traceLetterIdx % TRACE_COLORS.length];
}

let isTracing = false;
function tracePoint(e) {
  const rect = traceCanvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
traceCanvas.addEventListener('pointerdown', e => {
  isTracing = true;
  traceCanvas.setPointerCapture(e.pointerId);
  const p = tracePoint(e);
  traceCtx.beginPath();
  traceCtx.moveTo(p.x, p.y);
  // Dot in case they just tap-and-release
  traceCtx.lineTo(p.x + 0.01, p.y + 0.01);
  traceCtx.stroke();
});
traceCanvas.addEventListener('pointermove', e => {
  if (!isTracing) return;
  const p = tracePoint(e);
  traceCtx.lineTo(p.x, p.y);
  traceCtx.stroke();
});
const stopTracing = (e) => {
  if (!isTracing) return;
  isTracing = false;
  try { traceCanvas.releasePointerCapture(e.pointerId); } catch (_) {}
};
traceCanvas.addEventListener('pointerup', stopTracing);
traceCanvas.addEventListener('pointercancel', stopTracing);
traceCanvas.addEventListener('pointerleave', stopTracing);

// Re-fit the canvas if the window resizes while a card is shown
window.addEventListener('resize', () => {
  if (screens['tracing-mode'].classList.contains('active')) resetTraceCanvas();
});

document.getElementById('trace-clear').addEventListener('click', resetTraceCanvas);
document.getElementById('trace-say').addEventListener('click', () => {
  const letter = traceLetters[traceLetterIdx];
  const name = (window.LETTER_NAMES && window.LETTER_NAMES[letter]) || letter;
  say(`${name}.`, { rate: 0.85, pitch: 1.25 });
});
document.getElementById('trace-next').addEventListener('click', () => {
  if (traceLetterIdx < traceLetters.length - 1) {
    showTraceLetter(traceLetterIdx + 1);
  } else {
    // Last letter — celebrate the whole name!
    celebrate();
    say(`You wrote your name! ${traceLetters.join('')}!`, { rate: 0.9, pitch: 1.3 });
    setTimeout(() => showScreen('tracing-menu'), 2400);
  }
});

// ====== Voice priming ======
// Mobile browsers require a user gesture before TTS will work. The first tap
// anywhere on the page will trigger an empty utterance to "unlock" speech.
let voicePrimed = false;
document.addEventListener('pointerdown', () => {
  if (voicePrimed || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  speechSynthesis.speak(u);
  voicePrimed = true;
}, { once: true });
