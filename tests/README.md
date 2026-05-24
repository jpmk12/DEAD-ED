# Tests

Two test suites, both runnable with stock `node` (the integration suite uses
the already-installed `playwright` package).

## Data tests — `tests/data.test.js`

Validates the static data files (`chars.js`, `phonics.js`, `rhyming.js`,
`shapes.js`, `dinos.js`) for shape, completeness, and cross-references.
Runs in Node by mocking `window`. No browser needed.

```sh
node tests/data.test.js
```

24 assertions. Examples:
- `CHAR_PATHS` has all 10 digits + 26 uppercase + 26 lowercase
- Every `PHONICS_WORDS` entry has `sounds.length === word.length`
- All 7 exact pairs from the report-card rhyming test are present
- Rectangle and Oval are drawn at matching wider-than-tall proportions
  (the classroom-confusion fix)

## Integration tests — `tests/integration.test.js`

Drives the actual app in a headless browser via Playwright. Covers a smoke
path through each of the six learning apps plus regression tests for the
bugs caught in the post-build code review.

```sh
NODE_PATH=$(npm root -g) node tests/integration.test.js
```

22 tests. Highlights:
- Every landing tile navigates to its menu
- Counting Learn at 11–20 renders the dashed ten-pack + extras
- Letters case toggle changes both the rendered letter and the caption
- Phonics test choices have both emoji and word
- Rhyming Ears-Only hides word text on Learn and Test cards
- Shapes Look Test reveals + scores correctly
- Name tracing persists across page reload

**Regression tests** (each pinned to a specific code-review finding):
- Back-nav during chunked speech cancels the in-flight sequence
- Back-nav cancels a pending `nextRound` timer (no stale round on re-entry)
- `localStorage.getItem` throwing (Safari Private Mode) doesn't break the Name app
- `say()` during a learn-speech pause interrupts the in-flight sequence
