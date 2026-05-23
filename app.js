// ====== Data ======
const NUMBER_WORDS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five',
  'Six', 'Seven', 'Eight', 'Nine', 'Ten'
];

// Emoji-based extras used for the confetti burst (cheap to render lots of).
const EXTRAS = ['🥚', '🌴', '🌋', '🦴', '⭐', '🦖', '🦕'];

// SVG path data for each digit, drawn the way a child writes them
// (top-down, in one stroke where possible). viewBox per digit is 100x140.
const DIGIT_PATHS = {
  '0': ['M 50 15 Q 20 15 20 70 Q 20 130 50 130 Q 80 130 80 70 Q 80 15 50 15'],
  '1': ['M 28 35 L 55 15 L 55 130'],
  '2': ['M 18 35 Q 18 10 50 10 Q 82 10 82 38 Q 82 55 50 75 L 18 130 L 82 130'],
  '3': ['M 20 28 Q 30 10 55 10 Q 82 10 82 35 Q 82 55 50 65 Q 82 75 82 100 Q 82 130 55 130 Q 25 130 18 110'],
  // 4 is two strokes (the body, then the vertical bar)
  '4': ['M 70 10 L 18 80 L 85 80', 'M 70 30 L 70 130'],
  '5': ['M 75 15 L 30 15 L 25 65 Q 50 50 72 70 Q 85 85 75 108 Q 65 130 35 130 Q 18 125 15 110'],
  '6': ['M 75 25 Q 50 15 32 50 Q 15 80 25 110 Q 35 130 55 130 Q 82 130 82 100 Q 82 72 55 72 Q 30 72 25 95'],
  '7': ['M 18 15 L 82 15 L 38 130'],
  '8': ['M 50 70 Q 22 70 22 40 Q 22 12 50 12 Q 78 12 78 40 Q 78 70 50 70 Q 18 70 18 100 Q 18 132 50 132 Q 82 132 82 100 Q 82 70 50 70'],
  '9': ['M 78 50 Q 78 15 50 15 Q 22 15 22 40 Q 22 65 50 65 Q 78 65 78 50 L 78 130'],
};

const SVG_NS = 'http://www.w3.org/2000/svg';

function renderLearnNumber(num) {
  const digits = String(num).split('');
  learnNumberEl.innerHTML = '';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${digits.length * 100} 140`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  // gradient + drop shadow defs (referenced by .big-number path styles)
  const defs = document.createElementNS(SVG_NS, 'defs');
  defs.innerHTML = `
    <linearGradient id="numGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff6b6b"/>
      <stop offset="0.5" stop-color="#ffa94d"/>
      <stop offset="1" stop-color="#ffd43b"/>
    </linearGradient>
  `;
  svg.appendChild(defs);

  // Each digit gets its own group offset horizontally. Strokes within a digit
  // animate in sequence so e.g. the "4" draws the body then the vertical bar.
  let cumulativeDelay = 0;
  digits.forEach((d, digitIdx) => {
    const strokes = DIGIT_PATHS[d] || [];
    strokes.forEach((data, strokeIdx) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', data);
      path.setAttribute('transform', `translate(${digitIdx * 100} 0)`);
      svg.appendChild(path);

      // Set CSS custom props BEFORE applying the .draw class so the very first
      // frame already has the correct dasharray/dashoffset (otherwise you'd see
      // a fully-drawn digit pop in for one frame before the animation begins).
      const len = path.getTotalLength();
      path.style.setProperty('--len', len);
      path.style.setProperty('--delay', `${cumulativeDelay}s`);
      path.classList.add('draw');
      // Stagger: each stroke takes ~1.1s; nudge the next one slightly earlier
      // so the whole number doesn't feel sluggish.
      cumulativeDelay += strokeIdx === strokes.length - 1 ? 0.8 : 0.5;
    });
  });

  learnNumberEl.appendChild(svg);
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
};

function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

// landing tile -> counting menu
document.querySelectorAll('[data-app]').forEach(btn => {
  btn.addEventListener('click', () => {
    const app = btn.dataset.app;
    if (app === 'counting') showScreen('counting-menu');
  });
});

// mode picker -> learn / test
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
  renderLearnNumber(learnNumber);
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
