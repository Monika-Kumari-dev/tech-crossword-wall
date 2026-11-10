import { useState } from "react";

export default function PhoneGame({ puzzles, selectedWord: word, solvedWords, letters, setLetters, onSelectWord, checkAnswer, feedback, onEdit }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const solved = solvedWords.includes(word.id);
  const index = puzzles.findIndex((item) => item.id === word.id);
  const coordinates = [...word.answer].map((_, i) => `${word.row + (word.direction === 'down' ? i : 0)}-${word.col + (word.direction === 'across' ? i : 0)}`);
  const locked = (key) => puzzles.some((item) => solvedWords.includes(item.id) && [...item.answer].some((_, i) => `${item.row + (item.direction === 'down' ? i : 0)}-${item.col + (item.direction === 'across' ? i : 0)}` === key));
  const enterLetter = (letter) => {
    if (solved) return;
    const target = coordinates.findIndex((key, i) => i >= activeIndex && !locked(key));
    if (target < 0) return;
    onEdit();
    setLetters((previous) => ({ ...previous, [coordinates[target]]: letter }));
    const next = coordinates.findIndex((key, i) => i > target && !locked(key));
    setActiveIndex(next < 0 ? target : next);
  };
  const clear = () => {
    onEdit();
    setLetters((previous) => {
      const next = { ...previous };
      coordinates.forEach((key) => { if (!locked(key)) delete next[key]; });
      return next;
    });
    setActiveIndex(0);
  };
  const nextQuestion = () => {
    const next = [...puzzles.slice(index + 1), ...puzzles.slice(0, index + 1)].find((item) => !solvedWords.includes(item.id));
    if (next) onSelectWord(next);
  };
  return (
    <section className="phone-game" aria-label="Crossword question">
      <div className="phone-level-nav">
        <button type="button" aria-label="Previous question" onClick={() => onSelectWord(puzzles[(index - 1 + puzzles.length) % puzzles.length])}>←</button>
        <span>Question {String(index + 1).padStart(2, '0')} / {puzzles.length}</span>
        <button type="button" aria-label="Next question" onClick={() => onSelectWord(puzzles[(index + 1) % puzzles.length])}>→</button>
      </div>
      <progress value={solvedWords.length} max={puzzles.length} aria-label="Questions solved" />
      <div className={`phone-answer-tiles ${solved ? 'phone-tiles-correct' : feedback ? 'phone-tiles-wrong' : ''}`}>
        {coordinates.map((key, i) => <button key={key} type="button" className={i === activeIndex ? 'phone-active-tile' : ''} disabled={solved || locked(key)} aria-label={`Letter ${i + 1}: ${letters[key] || 'empty'}`} onClick={() => setActiveIndex(i)}>{letters[key] || ''}</button>)}
      </div>
      <div className="phone-question"><p>{word.direction} · {word.answer.length} letters · {word.theme}</p><h2>{word.clue}</h2></div>
      <div className={`phone-feedback ${solved ? 'phone-correct' : feedback ? 'phone-wrong' : ''}`} role="status">{solved ? '✓ Correct! You earned 10 points.' : feedback || 'Tap a box, then choose a letter.'}</div>
      {!solved && <div className="phone-keyboard" aria-label="Letter keyboard">
        {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row) => <div key={row}>{[...row].map((letter) => <button type="button" key={letter} onClick={() => enterLetter(letter)}>{letter}</button>)}</div>)}
      </div>}
      {showHint && <p className="phone-hint" id="phone-hint">{word.hint}</p>}
      <div className="phone-actions">
        <button type="button" className="phone-tool" aria-expanded={showHint} aria-controls="phone-hint" onClick={() => setShowHint(!showHint)}>Hint</button>
        <button type="button" className="phone-check" onClick={solved ? nextQuestion : checkAnswer}>{solved ? 'Next →' : 'Check'}</button>
        <button type="button" className="phone-tool" onClick={clear} disabled={solved}>Clear</button>
      </div>
    </section>
  );
}
