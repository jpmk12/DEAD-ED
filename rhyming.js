// Word pairs for Rhyming. Each pair is shown as emoji + word and spoken
// out loud. `rhyme: true` means the words end in the same sound.
// The first 8 entries match the exact pairs from Declan's report card test.
window.RHYME_PAIRS = [
  // ===== From the report-card test =====
  { w1: 'BUG',  e1: '🐛',  w2: 'PLUG', e2: '🔌', rhyme: true  },
  { w1: 'CANE', e1: '🦯',  w2: 'MANE', e2: '🦁', rhyme: true  },
  { w1: 'CHOP', e1: '🪓',  w2: 'STOP', e2: '🛑', rhyme: true  },
  { w1: 'FACE', e1: '😀',  w2: 'RACE', e2: '🏁', rhyme: true  },
  { w1: 'HIT',  e1: '👊',  w2: 'FIT',  e2: '💪', rhyme: true  },
  { w1: 'BED',  e1: '🛏️', w2: 'BAT',  e2: '🦇', rhyme: false },
  { w1: 'GOAT', e1: '🐐',  w2: 'GLUE', e2: '🧴', rhyme: false },
  { w1: 'BIKE', e1: '🚲',  w2: 'SHOE', e2: '👟', rhyme: false }, // close stand-in for bike/fine

  // ===== Extra rhyming pairs for practice =====
  { w1: 'CAT',  e1: '🐱',  w2: 'HAT',  e2: '🎩', rhyme: true },
  { w1: 'DOG',  e1: '🐶',  w2: 'LOG',  e2: '🪵', rhyme: true },
  { w1: 'BEE',  e1: '🐝',  w2: 'TREE', e2: '🌳', rhyme: true },
  { w1: 'CAR',  e1: '🚗',  w2: 'STAR', e2: '⭐', rhyme: true },
  { w1: 'BAG',  e1: '👜',  w2: 'TAG',  e2: '🏷️', rhyme: true },
  { w1: 'CAKE', e1: '🍰',  w2: 'SNAKE', e2: '🐍', rhyme: true },
  { w1: 'RING', e1: '💍',  w2: 'KING', e2: '👑', rhyme: true },
  { w1: 'CAP',  e1: '🧢',  w2: 'MAP',  e2: '🗺️', rhyme: true },
  { w1: 'HEN',  e1: '🐔',  w2: 'PEN',  e2: '🖊️', rhyme: true },
  { w1: 'FOX',  e1: '🦊',  w2: 'BOX',  e2: '📦', rhyme: true },
  { w1: 'SUN',  e1: '☀️', w2: 'BUN',  e2: '🍞', rhyme: true },

  // ===== Extra non-rhyming pairs for practice =====
  { w1: 'CAT',  e1: '🐱',  w2: 'DOG',  e2: '🐶', rhyme: false },
  { w1: 'SUN',  e1: '☀️', w2: 'MOON', e2: '🌙', rhyme: false },
  { w1: 'BALL', e1: '⚽',  w2: 'CUP',  e2: '☕', rhyme: false },
  { w1: 'FISH', e1: '🐟',  w2: 'BIRD', e2: '🐦', rhyme: false },
  { w1: 'PIG',  e1: '🐷',  w2: 'SHEEP', e2: '🐑', rhyme: false },
  { w1: 'APPLE', e1: '🍎', w2: 'EGG',  e2: '🥚', rhyme: false },
  { w1: 'STAR', e1: '⭐', w2: 'FROG', e2: '🐸', rhyme: false },
  { w1: 'CAR',  e1: '🚗',  w2: 'BUS',  e2: '🚌', rhyme: false },
];
