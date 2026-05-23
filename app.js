// ====== Data ======
const NUMBER_WORDS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five',
  'Six', 'Seven', 'Eight', 'Nine', 'Ten'
];

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
  defs.innerHTML = `
    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
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
  'letters-menu': document.getElementById('letters-menu'),
  'letters-learn': document.getElementById('letters-learn'),
  'letters-test': document.getElementById('letters-test'),
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
  });
});

// counting mode picker -> learn / test
document.querySelectorAll('[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    if (mode === 'learn') {
      showScreen('learn-mode');
      learnShow(1);
    } else if (mode === 'test') {
      showScreen('test-mode');
      resetScore();
      nextTestRound();
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
  learnNumber = Math.max(1, Math.min(10, n));
  renderChar(learnNumber, learnNumberEl);
  learnWordEl.textContent = NUMBER_WORDS[learnNumber];

  // populate dino row with an SVG dino per item, all the same species per card
  learnDinosEl.innerHTML = '';
  const dinoKey = window.DINO_KEYS[(learnNumber - 1) % window.DINO_KEYS.length];
  const dinoSvg = window.DINO_SVGS[dinoKey];
  for (let i = 0; i < learnNumber; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'dino';
    wrap.innerHTML = dinoSvg;
    wrap.style.animationDelay = `${i * 0.08}s`;
    learnDinosEl.appendChild(wrap);
  }

  // replay card pop animation
  learnCardEl.classList.remove('pop');
  void learnCardEl.offsetWidth; // reflow to restart anim
  learnCardEl.classList.add('pop');

  speakNumber(learnNumber);
}

function speakNumber(n) {
  say(`This is the number ${NUMBER_WORDS[n]}.`, { rate: 0.8, pitch: 1.25 });
}

document.getElementById('learn-prev').addEventListener('click', () => {
  learnShow(learnNumber === 1 ? 10 : learnNumber - 1);
});
document.getElementById('learn-next').addEventListener('click', () => {
  learnShow(learnNumber === 10 ? 1 : learnNumber + 1);
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
  currentAnswer = Math.floor(Math.random() * 10) + 1;

  // Build 4 unique choices including the correct one
  const pool = new Set([currentAnswer]);
  while (pool.size < 4) pool.add(Math.floor(Math.random() * 10) + 1);
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
  const pieces = [...DINOS, ...EXTRAS, '🎉', '✨', '🌟'];
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

// ====== LETTERS LEARN MODE ======
let letterIdx = 0;

const lettersLetterEl = document.getElementById('letters-letter');
const lettersImgEl    = document.getElementById('letters-img');
const lettersWordEl   = document.getElementById('letters-word');
const lettersCardEl   = document.getElementById('letters-card');

function lettersShow(idx) {
  letterIdx = ((idx % 26) + 26) % 26;
  const letter = window.LETTERS[letterIdx];
  const info   = window.LETTER_INFO[letter];

  renderChar(letter, lettersLetterEl);
  lettersImgEl.textContent = info.emoji;
  lettersWordEl.textContent = `${letter} is for ${info.word}`;

  // retrigger the emoji pop animation
  lettersImgEl.style.animation = 'none';
  void lettersImgEl.offsetWidth;
  lettersImgEl.style.animation = '';

  // retrigger card pop
  lettersCardEl.classList.remove('pop');
  void lettersCardEl.offsetWidth;
  lettersCardEl.classList.add('pop');

  speakLetter(letter);
}

function speakLetter(letter) {
  const info = window.LETTER_INFO[letter];
  const name = window.LETTER_NAMES[letter];
  say(`This is the letter ${name}. ${name} is for ${info.word}.`, { rate: 0.8, pitch: 1.25 });
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
  lettersAnswer = window.LETTERS[Math.floor(Math.random() * 26)];

  const pool = new Set([lettersAnswer]);
  while (pool.size < 4) pool.add(window.LETTERS[Math.floor(Math.random() * 26)]);
  const choices = shuffle([...pool]);

  lettersChoicesEl.innerHTML = '';
  choices.forEach((l, i) => {
    const btn = document.createElement('button');
    btn.className = `choice c${i + 1}`;
    btn.textContent = l;
    btn.dataset.value = l;
    btn.addEventListener('click', () => handleLetterChoice(btn, l));
    lettersChoicesEl.appendChild(btn);
  });

  setTimeout(sayLettersTestPrompt, 350);
}

function sayLettersTestPrompt() {
  const name = window.LETTER_NAMES[lettersAnswer];
  say(`Can you find... ${name}?`, { rate: 0.85, pitch: 1.25 });
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
    say(`Yes! Letter ${name}! Great job!`, { rate: 0.9, pitch: 1.3 });
    celebrate();
    setTimeout(nextLettersTestRound, 1800);
  } else {
    btn.classList.add('wrong');
    say(`Try again!`, { rate: 0.95, pitch: 1.2 });
    setTimeout(() => btn.classList.remove('wrong'), 600);
  }
}

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
