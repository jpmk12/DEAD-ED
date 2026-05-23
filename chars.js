// Character path data and metadata for the drawing animation.
// Each viewBox is 100x140; multiple strokes per char = multiple "pen lifts".
window.CHAR_PATHS = {
  // ===== Digits =====
  '0': ['M 50 15 Q 20 15 20 70 Q 20 130 50 130 Q 80 130 80 70 Q 80 15 50 15'],
  '1': ['M 28 35 L 55 15 L 55 130'],
  '2': ['M 18 35 Q 18 10 50 10 Q 82 10 82 38 Q 82 55 50 75 L 18 130 L 82 130'],
  '3': ['M 20 28 Q 30 10 55 10 Q 82 10 82 35 Q 82 55 50 65 Q 82 75 82 100 Q 82 130 55 130 Q 25 130 18 110'],
  '4': ['M 70 15 L 20 85 L 85 85', 'M 70 15 L 70 130'],
  '5': ['M 75 15 L 30 15 L 25 65 Q 50 50 72 70 Q 85 85 75 108 Q 65 130 35 130 Q 18 125 15 110'],
  '6': ['M 75 25 Q 50 15 32 50 Q 15 80 25 110 Q 35 130 55 130 Q 82 130 82 100 Q 82 72 55 72 Q 30 72 25 95'],
  '7': ['M 18 15 L 82 15 L 38 130'],
  '8': ['M 50 70 Q 22 70 22 40 Q 22 12 50 12 Q 78 12 78 40 Q 78 70 50 70 Q 18 70 18 100 Q 18 132 50 132 Q 82 132 82 100 Q 82 70 50 70'],
  '9': ['M 78 50 Q 78 15 50 15 Q 22 15 22 40 Q 22 65 50 65 Q 78 65 78 50 L 78 130'],

  // ===== Uppercase letters =====
  'A': ['M 18 130 L 50 15 L 82 130', 'M 30 95 L 70 95'],
  'B': ['M 25 130 L 25 15 L 60 15 Q 82 15 82 40 Q 82 60 55 65 Q 82 70 82 100 Q 82 130 60 130 L 25 130'],
  'C': ['M 80 35 Q 60 10 40 20 Q 18 35 18 72 Q 18 110 40 125 Q 60 135 80 110'],
  'D': ['M 25 15 L 25 130 L 55 130 Q 85 125 85 72 Q 85 20 55 15 L 25 15'],
  'E': ['M 80 15 L 25 15 L 25 130 L 80 130', 'M 25 72 L 65 72'],
  'F': ['M 25 130 L 25 15 L 80 15', 'M 25 72 L 65 72'],
  'G': ['M 80 35 Q 60 10 40 20 Q 18 35 18 72 Q 18 110 40 125 Q 65 135 82 115 L 82 80 L 55 80'],
  'H': ['M 25 15 L 25 130', 'M 75 15 L 75 130', 'M 25 72 L 75 72'],
  'I': ['M 30 15 L 70 15', 'M 50 15 L 50 130', 'M 30 130 L 70 130'],
  'J': ['M 70 15 L 70 105 Q 70 130 45 130 Q 22 130 18 110'],
  'K': ['M 25 15 L 25 130', 'M 80 15 L 30 72 L 80 130'],
  'L': ['M 25 15 L 25 130 L 80 130'],
  'M': ['M 15 130 L 15 15 L 50 90 L 85 15 L 85 130'],
  'N': ['M 20 130 L 20 15 L 80 130 L 80 15'],
  'O': ['M 50 15 Q 18 15 18 72 Q 18 130 50 130 Q 82 130 82 72 Q 82 15 50 15'],
  'P': ['M 25 130 L 25 15 L 60 15 Q 82 15 82 40 Q 82 65 60 65 L 25 65'],
  'Q': ['M 50 15 Q 18 15 18 72 Q 18 130 50 130 Q 82 130 82 72 Q 82 15 50 15', 'M 58 95 L 92 135'],
  'R': ['M 25 130 L 25 15 L 60 15 Q 82 15 82 40 Q 82 65 60 65 L 25 65', 'M 55 65 L 85 130'],
  'S': ['M 80 25 Q 60 10 40 18 Q 20 28 22 50 Q 28 65 58 72 Q 82 78 82 102 Q 78 128 55 130 Q 30 130 18 115'],
  'T': ['M 15 15 L 85 15', 'M 50 15 L 50 130'],
  'U': ['M 20 15 L 20 100 Q 20 130 50 130 Q 80 130 80 100 L 80 15'],
  'V': ['M 15 15 L 50 130 L 85 15'],
  'W': ['M 10 15 L 28 130 L 50 60 L 72 130 L 90 15'],
  'X': ['M 20 15 L 80 130', 'M 80 15 L 20 130'],
  'Y': ['M 15 15 L 50 75 L 85 15', 'M 50 75 L 50 130'],
  'Z': ['M 20 15 L 80 15 L 20 130 L 80 130'],
};

// Phonetic spelling used in speech ("A" alone often gets pronounced "uh" by
// TTS engines — "ay" is reliable across browsers).
window.LETTER_NAMES = {
  A: 'ay',   B: 'bee',  C: 'see',  D: 'dee',  E: 'ee',   F: 'eff',
  G: 'jee',  H: 'aitch', I: 'eye', J: 'jay',  K: 'kay',  L: 'ell',
  M: 'em',   N: 'en',   O: 'oh',   P: 'pee',  Q: 'cue',  R: 'arr',
  S: 'ess',  T: 'tee',  U: 'you',  V: 'vee',  W: 'double-you',
  X: 'ex',   Y: 'why',  Z: 'zee',
};

// What each letter is "for" on a learn card.
window.LETTER_INFO = {
  A: { word: 'Apple',     emoji: '🍎' },
  B: { word: 'Bone',      emoji: '🦴' },
  C: { word: 'Cactus',    emoji: '🌵' },
  D: { word: 'Dinosaur',  emoji: '🦕' },
  E: { word: 'Egg',       emoji: '🥚' },
  F: { word: 'Fish',      emoji: '🐟' },
  G: { word: 'Grass',     emoji: '🌿' },
  H: { word: 'Hat',       emoji: '🎩' },
  I: { word: 'Ice cream', emoji: '🍦' },
  J: { word: 'Juice',     emoji: '🧃' },
  K: { word: 'Kite',      emoji: '🪁' },
  L: { word: 'Leaf',      emoji: '🍃' },
  M: { word: 'Moon',      emoji: '🌙' },
  N: { word: 'Nest',      emoji: '🪺' },
  O: { word: 'Octopus',   emoji: '🐙' },
  P: { word: 'Pizza',     emoji: '🍕' },
  Q: { word: 'Queen',     emoji: '👑' },
  R: { word: 'Rainbow',   emoji: '🌈' },
  S: { word: 'Sun',       emoji: '☀️' },
  T: { word: 'T-Rex',     emoji: '🦖' },
  U: { word: 'Umbrella',  emoji: '☂️' },
  V: { word: 'Volcano',   emoji: '🌋' },
  W: { word: 'Whale',     emoji: '🐳' },
  X: { word: 'X-ray',     emoji: '🩻' },
  Y: { word: 'Yo-yo',     emoji: '🪀' },
  Z: { word: 'Zebra',     emoji: '🦓' },
};

window.LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
