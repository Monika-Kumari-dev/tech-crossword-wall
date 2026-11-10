import { useState } from "react";



function buildGrid(puzzles, rows, cols) {
  const grid = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );

  puzzles.forEach((word) => {
    [...word.answer].forEach((letter, index) => {
      const row =
        word.row + (word.direction === "down" ? index : 0);
      const col =
        word.col + (word.direction === "across" ? index : 0);

      if (!grid[row] || col < 0 || col >= cols) return;

      if (!grid[row][col]) {
        grid[row][col] = { letter, words: [], numbers: [] };
      } else if (grid[row][col].letter !== letter) {
        console.error("Conflicting crossword letters:", row, col);
      }

      grid[row][col].words.push(word.id);

      if (index === 0) {
        grid[row][col].numbers.push(word.number);
      }
    });
  });

  return grid;
}

function WordEntry({ word, solvedWords, puzzles, letters, setLetters, checkAnswer, onSelectWord }) {
  const [showHint, setShowHint] = useState(false);
  const wordIndex = puzzles.findIndex((item) => item.id === word.id);
  const answer = [...word.answer].map((_, index) => letters[`${word.row + (word.direction === "down" ? index : 0)}-${word.col + (word.direction === "across" ? index : 0)}`] || " ").join("").trimEnd();
  const solved = solvedWords.includes(word.id);

  const updateAnswer = (event) => {
    const value = event.target.value.replace(/[^a-z]/gi, "").toUpperCase().slice(0, word.answer.length);
    setLetters((previous) => {
      const next = { ...previous };
      [...word.answer].forEach((_, index) => {
        const row = word.row + (word.direction === "down" ? index : 0);
        const col = word.col + (word.direction === "across" ? index : 0);
        const locked = puzzles.some((other) => solvedWords.includes(other.id) && [...other.answer].some((_, i) =>
          other.row + (other.direction === "down" ? i : 0) === row &&
          other.col + (other.direction === "across" ? i : 0) === col));
        if (!locked) next[`${row}-${col}`] = value[index] || "";
      });
      return next;
    });
  };

  return (
    <section className="mobile-word-entry" aria-label="Selected word">
      <div className="mobile-clue-nav">
        <button type="button" aria-label="Previous question" onClick={() => onSelectWord(puzzles[(wordIndex - 1 + puzzles.length) % puzzles.length])}>←</button>
        <select aria-label="Choose a question" value={word.id} onChange={(event) => onSelectWord(puzzles.find((item) => item.id === Number(event.target.value)))}>
          {puzzles.map((item, index) => <option key={item.id} value={item.id}>Question {index + 1} of {puzzles.length}{solvedWords.includes(item.id) ? ' · ✓' : ''}</option>)}
        </select>
        <button type="button" aria-label="Next question" onClick={() => onSelectWord(puzzles[(wordIndex + 1) % puzzles.length])}>→</button>
      </div>
      <p className="eyebrow">{word.number} {word.direction} · {word.answer.length} letters · {word.theme}</p>
      <label htmlFor="mobile-answer">{word.clue}</label>
      <div className="mobile-answer-actions">
        <input id="mobile-answer" type="text" value={solved ? word.answer : answer} onChange={updateAnswer}
          placeholder="Type the whole answer" maxLength={word.answer.length} disabled={solved}
          autoComplete="off" autoCapitalize="characters" spellCheck={false}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); checkAnswer(); } }} />
        <button type="button" onClick={checkAnswer} disabled={solved}>{solved ? "Solved ✓" : "Check"}</button>
      </div>
      <button className="mobile-hint-button" type="button" aria-expanded={showHint} aria-controls="mobile-hint" onClick={() => setShowHint(!showHint)}>{showHint ? 'Hide hint' : 'Need a hint?'}</button>
      {showHint && <p id="mobile-hint" className="hint-text">{word.hint}</p>}
    </section>
  );
}

function CrosswordGrid({
  puzzles,
  solvedWords,
  selectedWord,
  onSelectWord,
  letters,
  setLetters,
  checkAnswer,
  feedback,
}) {
  const rows = Math.max(...puzzles.map((word) => word.row + (word.direction === "down" ? word.answer.length : 1)));
  const cols = Math.max(...puzzles.map((word) => word.col + (word.direction === "across" ? word.answer.length : 1)));
  const grid = buildGrid(puzzles, rows, cols);

  const handleCellSelect = (cell) => {
    const currentWordUsesCell =
      selectedWord &&
      cell.words.includes(selectedWord.id);

    if (currentWordUsesCell) return;

    const nextWord = puzzles.find(
      (word) =>
        cell.words.includes(word.id) &&
        !solvedWords.includes(word.id)
    );

    if (nextWord) onSelectWord(nextWord);
  };

  const handleLetterChange = (event, row, col) => {
    const letter = event.target.value
      .replace(/[^a-z]/gi, "")
      .slice(-1)
      .toUpperCase();

    setLetters((previous) => ({
      ...previous,
      [`${row}-${col}`]: letter,
    }));

    if (!letter || !selectedWord) return;

    const currentIndex =
      selectedWord.direction === "across"
        ? col - selectedWord.col
        : row - selectedWord.row;

    let nextIndex = currentIndex + 1;
    while (nextIndex < selectedWord.answer.length) {
      const r = selectedWord.row + (selectedWord.direction === "down" ? nextIndex : 0);
      const c = selectedWord.col + (selectedWord.direction === "across" ? nextIndex : 0);
      if (!document.querySelector(`[data-cell="${r}-${c}"]`)?.disabled) break;
      nextIndex += 1;
    }

    if (nextIndex >= selectedWord.answer.length) return;

    const nextRow =
      selectedWord.row +
      (selectedWord.direction === "down" ? nextIndex : 0);

    const nextCol =
      selectedWord.col +
      (selectedWord.direction === "across" ? nextIndex : 0);

    requestAnimationFrame(() => {
      document
        .querySelector(`[data-cell="${nextRow}-${nextCol}"]`)
        ?.focus();
    });
  };

  return (
    <>
      <WordEntry key={selectedWord.id} onSelectWord={onSelectWord} word={selectedWord} puzzles={puzzles} solvedWords={solvedWords} letters={letters} setLetters={setLetters} checkAnswer={checkAnswer} />
      {feedback && <p className="mobile-feedback feedback" role="status">{feedback}</p>}
      <p className="board-scroll-help" id="board-scroll-help">Choose a question above or tap a word on the board.</p>
      <div className="crossword-scroll" role="region" aria-label="Crossword board" aria-describedby="board-scroll-help" tabIndex={0}>
    <div className="crossword-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `min(100%, 620px, ${75 * cols / rows}svh)` }}>
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;

          if (!cell) {
            return (
              <div
                className="grid-cell blocked"
                key={key}
              />
            );
          }

          const isSolved = cell.words.some((id) =>
            solvedWords.includes(id)
          );

          const isSelected =
            selectedWord &&
            cell.words.includes(selectedWord.id);

          return (
            <div
              className={`grid-cell ${
                isSelected ? "selected-cell" : ""
              } ${isSolved ? "solved-cell" : ""}`}
              key={key}
            >
              {cell.numbers.length > 0 && (
                <span className="cell-number">
                  {cell.numbers[0]}
                </span>
              )}

              <input
                type="text"
                data-cell={key}
                value={letters[key] || ""}
                maxLength={1}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                aria-label={`Row ${rowIndex + 1}, column ${
                  colIndex + 1
                }`}
                onFocus={() => handleCellSelect(cell)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    checkAnswer();
                    return;
                  }
                  const index = selectedWord.direction === "across" ? colIndex - selectedWord.col : rowIndex - selectedWord.row;
                  let offset = 0;
                  if (event.key === "Backspace" && !letters[key]) offset = -1;
                  if (event.key === "ArrowRight" && selectedWord.direction === "across") offset = 1;
                  if (event.key === "ArrowLeft" && selectedWord.direction === "across") offset = -1;
                  if (event.key === "ArrowDown" && selectedWord.direction === "down") offset = 1;
                  if (event.key === "ArrowUp" && selectedWord.direction === "down") offset = -1;
                  if (!offset) return;
                  event.preventDefault();
                  let next = index + offset;
                  while (next >= 0 && next < selectedWord.answer.length) {
                    const r = selectedWord.row + (selectedWord.direction === "down" ? next : 0);
                    const c = selectedWord.col + (selectedWord.direction === "across" ? next : 0);
                    const input = document.querySelector(`[data-cell="${r}-${c}"]`);
                    if (input && !input.disabled) { input.focus(); break; }
                    next += offset;
                  }
                }}
                onChange={(event) =>
                  handleLetterChange(event, rowIndex, colIndex)
                }
                disabled={isSolved}
              />
            </div>
          );
        })
      )}
    </div>
      </div>
    </>
  );
}

export default CrosswordGrid;
