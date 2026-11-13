import test from 'node:test';
import assert from 'node:assert/strict';
import puzzles from '../src/data/puzzles.js';
import { calculateAnswerPoints } from '../src/utils/scoring.js';
import { csvCell } from '../src/utils/attendance.js';

test('24 unique clues fit the grid without conflicting intersection letters', () => {
  assert.equal(puzzles.length, 24);
  assert.equal(new Set(puzzles.map((word) => word.id)).size, 24);
  const cells = new Map();
  for (const word of puzzles) {
    assert.match(word.answer, /^[A-Z]+$/);
    assert.ok(word.clue && word.hint);
    assert.ok(word.row >= 0 && word.col >= 0);
    for (const [i, letter] of [...word.answer].entries()) {
      const key = `${word.row + (word.direction === 'down' ? i : 0)}-${word.col + (word.direction === 'across' ? i : 0)}`;
      if (cells.has(key)) assert.equal(cells.get(key), letter, `conflicting cell ${key}`);
      cells.set(key, letter);
    }
  }
});
test('correct answers earn ten points, incorrect and repeated answers earn zero', () => {
  assert.equal(calculateAnswerPoints(true, false), 10);
  assert.equal(calculateAnswerPoints(false, false), 0);
  assert.equal(calculateAnswerPoints(true, true), 0);
  assert.equal(puzzles.reduce((sum) => sum + calculateAnswerPoints(true, false), 0), 240);
});
test('CSV protects formula-like names and escapes quotes, commas and line breaks', () => {
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell('@test'), '"\'@test"');
  assert.equal(csvCell('Sam, "A"\nB'), '"Sam, ""A""\nB"');
  assert.equal(csvCell(0), '"0"');
});
