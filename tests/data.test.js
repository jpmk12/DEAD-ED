// Data-file integrity tests. Runs in Node (no browser) by mocking `window`
// so the JS files (which all do `window.X = ...`) can be required.
//
// Run with:  node tests/data.test.js

'use strict';

global.window = global.window || {};
require('../dinos.js');
require('../chars.js');
require('../phonics.js');
require('../rhyming.js');
require('../shapes.js');

const W = global.window;

let passed = 0, failed = 0, currentGroup = '';

function group(name, fn) {
  currentGroup = name;
  console.log(`\n${name}`);
  fn();
}
function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.error(`  ✗ ${name}\n      ${e.message}`); failed++; }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}
function assertEq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'not equal'}\n      expected: ${JSON.stringify(expected)}\n      actual:   ${JSON.stringify(actual)}`);
  }
}

// ===== chars.js =====
group('chars.js', () => {
  test('CHAR_PATHS has all 10 digits', () => {
    for (let i = 0; i <= 9; i++) {
      const k = String(i);
      assert(Array.isArray(W.CHAR_PATHS[k]), `digit ${k} missing or not array`);
    }
  });
  test('CHAR_PATHS has all 26 uppercase letters', () => {
    for (let i = 65; i <= 90; i++) {
      const c = String.fromCharCode(i);
      assert(Array.isArray(W.CHAR_PATHS[c]), `uppercase ${c} missing`);
    }
  });
  test('CHAR_PATHS has all 26 lowercase letters', () => {
    for (let i = 97; i <= 122; i++) {
      const c = String.fromCharCode(i);
      assert(Array.isArray(W.CHAR_PATHS[c]), `lowercase ${c} missing`);
    }
  });
  test('every CHAR_PATHS entry is a non-empty array of path strings starting with M', () => {
    for (const [k, paths] of Object.entries(W.CHAR_PATHS)) {
      assert(paths.length > 0, `${k} has empty stroke array`);
      paths.forEach((p, i) => {
        assert(typeof p === 'string', `${k}[${i}] not a string`);
        assert(p.trim().startsWith('M'), `${k}[${i}] should start with M (got: ${p.slice(0, 10)})`);
      });
    }
  });
  test('LETTER_INFO has all 26 letters with non-empty word + emoji', () => {
    for (let i = 65; i <= 90; i++) {
      const c = String.fromCharCode(i);
      const info = W.LETTER_INFO[c];
      assert(info, `${c} missing`);
      assert(typeof info.word === 'string' && info.word.length > 0, `${c}.word`);
      assert(typeof info.emoji === 'string' && info.emoji.length > 0, `${c}.emoji`);
    }
  });
  test('LETTER_NAMES has all 26 letters with non-empty phonetic name', () => {
    for (let i = 65; i <= 90; i++) {
      const c = String.fromCharCode(i);
      assert(typeof W.LETTER_NAMES[c] === 'string' && W.LETTER_NAMES[c].length > 0, `${c} missing`);
    }
  });
  test('LETTERS is A-Z in order', () => {
    assertEq(W.LETTERS.length, 26, 'count');
    for (let i = 0; i < 26; i++) {
      assertEq(W.LETTERS[i], String.fromCharCode(65 + i), `index ${i}`);
    }
  });
  test('no LETTER_NAMES key collides between upper/lower case lookups', () => {
    // LETTER_NAMES only keys on uppercase. Confirm.
    Object.keys(W.LETTER_NAMES).forEach(k => {
      assert(/^[A-Z]$/.test(k), `unexpected LETTER_NAMES key: ${k}`);
    });
  });
});

// ===== phonics.js =====
group('phonics.js', () => {
  test('PHONICS_WORDS exists with at least 15 entries', () => {
    assert(Array.isArray(W.PHONICS_WORDS) && W.PHONICS_WORDS.length >= 15,
      `got ${W.PHONICS_WORDS && W.PHONICS_WORDS.length} entries`);
  });
  test('every word is uppercase A-Z only and 3 letters', () => {
    W.PHONICS_WORDS.forEach((p, i) => {
      assert(/^[A-Z]{3}$/.test(p.word), `entry ${i} word=${p.word}`);
    });
  });
  test('every entry has a sounds array matching word length', () => {
    W.PHONICS_WORDS.forEach((p, i) => {
      assert(Array.isArray(p.sounds), `entry ${i} sounds not array`);
      assertEq(p.sounds.length, p.word.length, `entry ${i} word=${p.word}`);
      p.sounds.forEach((s, j) => {
        assert(typeof s === 'string' && s.length > 0, `entry ${i} sound[${j}]`);
      });
    });
  });
  test('every entry has a non-empty emoji', () => {
    W.PHONICS_WORDS.forEach((p, i) => {
      assert(typeof p.emoji === 'string' && p.emoji.length > 0, `entry ${i}`);
    });
  });
  test('no duplicate words', () => {
    const seen = new Set();
    W.PHONICS_WORDS.forEach((p, i) => {
      assert(!seen.has(p.word), `entry ${i} duplicate word=${p.word}`);
      seen.add(p.word);
    });
  });
});

// ===== rhyming.js =====
group('rhyming.js', () => {
  test('RHYME_PAIRS exists with at least 20 entries', () => {
    assert(Array.isArray(W.RHYME_PAIRS) && W.RHYME_PAIRS.length >= 20,
      `got ${W.RHYME_PAIRS && W.RHYME_PAIRS.length} entries`);
  });
  test('has at least 8 rhyming and 8 non-rhyming pairs', () => {
    const rhymes = W.RHYME_PAIRS.filter(p => p.rhyme === true);
    const nonRhymes = W.RHYME_PAIRS.filter(p => p.rhyme === false);
    assert(rhymes.length >= 8, `only ${rhymes.length} rhyming pairs`);
    assert(nonRhymes.length >= 8, `only ${nonRhymes.length} non-rhyming pairs`);
  });
  test('every pair has w1/w2/e1/e2 strings and boolean rhyme', () => {
    W.RHYME_PAIRS.forEach((p, i) => {
      assert(typeof p.w1 === 'string' && p.w1.length > 0, `entry ${i} w1`);
      assert(typeof p.w2 === 'string' && p.w2.length > 0, `entry ${i} w2`);
      assert(typeof p.e1 === 'string' && p.e1.length > 0, `entry ${i} e1`);
      assert(typeof p.e2 === 'string' && p.e2.length > 0, `entry ${i} e2`);
      assert(typeof p.rhyme === 'boolean', `entry ${i} rhyme not boolean`);
    });
  });
  test('all 7 exact pairs from the report-card test are present', () => {
    const required = [
      ['BUG',  'PLUG', true],
      ['CANE', 'MANE', true],
      ['CHOP', 'STOP', true],
      ['FACE', 'RACE', true],
      ['HIT',  'FIT',  true],
      ['BED',  'BAT',  false],
      ['GOAT', 'GLUE', false],
    ];
    required.forEach(([w1, w2, expectedRhyme]) => {
      const found = W.RHYME_PAIRS.find(p => p.w1 === w1 && p.w2 === w2);
      assert(found, `missing pair ${w1}/${w2}`);
      assertEq(found.rhyme, expectedRhyme, `${w1}/${w2} rhyme flag`);
    });
  });
});

// ===== shapes.js =====
group('shapes.js', () => {
  test('SHAPES has 9 entries', () => {
    assertEq(W.SHAPES.length, 9);
  });
  test('every shape has a name and an inline SVG string', () => {
    W.SHAPES.forEach((s, i) => {
      assert(typeof s.name === 'string' && s.name.length > 0, `entry ${i} name`);
      assert(typeof s.svg === 'string' && s.svg.includes('<svg'), `entry ${i} svg`);
      assert(s.svg.includes('viewBox'), `entry ${i} svg missing viewBox`);
    });
  });
  test('all 9 classroom shapes are present', () => {
    const required = ['Circle', 'Square', 'Rectangle', 'Triangle', 'Star',
                       'Heart', 'Diamond', 'Oval', 'Hexagon'];
    const names = W.SHAPES.map(s => s.name);
    required.forEach(n => assert(names.includes(n), `missing ${n}`));
  });
  test('Rectangle and Oval drawn at matching wider-than-tall proportions (the classroom-confusion fix)', () => {
    const rect = W.SHAPES.find(s => s.name === 'Rectangle');
    const oval = W.SHAPES.find(s => s.name === 'Oval');
    // Rectangle: width 88, height 40 — wider than tall
    assert(rect.svg.includes('width="88"') && rect.svg.includes('height="40"'),
      'Rectangle dimensions changed — make sure it still distinctly differs from Square');
    // Oval: rx 44 (wide), ry 26 (short) — matches Rectangle's proportion
    assert(oval.svg.includes('rx="44"') && oval.svg.includes('ry="26"'),
      'Oval dimensions changed — should match Rectangle proportions so the only diff is corners vs curves');
  });
});

// ===== dinos.js =====
group('dinos.js', () => {
  test('DINO_SVGS has the 5 expected dinos', () => {
    ['trex', 'bronto', 'trike', 'stego', 'raptor'].forEach(k =>
      assert(typeof W.DINO_SVGS[k] === 'string', `missing dino: ${k}`));
  });
  test('every dino svg is well-formed SVG markup', () => {
    Object.entries(W.DINO_SVGS).forEach(([k, svg]) => {
      assert(svg.includes('<svg'), `${k} missing <svg`);
      assert(svg.includes('viewBox'), `${k} missing viewBox`);
      assert(svg.includes('</svg>'), `${k} missing closing tag`);
    });
  });
  test('DINO_KEYS lists every dino present in DINO_SVGS', () => {
    assert(Array.isArray(W.DINO_KEYS) && W.DINO_KEYS.length === 5,
      `expected 5 keys, got ${W.DINO_KEYS && W.DINO_KEYS.length}`);
    W.DINO_KEYS.forEach(k => assert(W.DINO_SVGS[k], `${k} in DINO_KEYS but missing from DINO_SVGS`));
  });
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
