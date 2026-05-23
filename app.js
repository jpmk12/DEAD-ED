// ====== Data ======
const NUMBER_WORDS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five',
  'Six', 'Seven', 'Eight', 'Nine', 'Ten'
];

// Dinos used to visually count out the number on the learn card.
// Mixed creatures keep each card feeling a little different.
const DINOS = ['🦖', '🦕', '🐉', '🦎'];
const EXTRAS = ['🥚', '🌴', '🌋', '🦴', '⭐'];

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
  learnNumberEl.textContent = learnNumber;
  learnWordEl.textContent = NUMBER_WORDS[learnNumber];

  // populate dino row
  learnDinosEl.innerHTML = '';
  const dino = DINOS[(learnNumber - 1) % DINOS.length];
  for (let i = 0; i < learnNumber; i++) {
    const s = document.createElement('span');
    s.textContent = dino;
    s.style.animationDelay = `${i * 0.08}s`;
    learnDinosEl.appendChild(s);
  }

  // replay card pop animation
  learnCardEl.classList.remove('pop');
  void learnCardEl.offsetWidth; // reflow to restart anim
  learnCardEl.classList.add('pop');

  speakNumber(learnNumber);
}

function speakNumber(n) {
  say(NUMBER_WORDS[n], { rate: 0.8, pitch: 1.25 });
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
