import { useState } from "react";
import AnswerReveal from "./AnswerReveal";


function CluePanel({
  puzzles,
  selectedWord,
  solvedWords,
  onSelectWord,
  checkAnswer,
  feedback,
}) {
  const [showHint, setShowHint] = useState(false);
  const renderClues = (direction) => {
    return puzzles
      .filter((word) => word.direction === direction)
      .sort((a, b) => a.number - b.number)
      .map((word) => {
        const isSelected = selectedWord.id === word.id;
        const isSolved = solvedWords.includes(word.id);

        return (
          <button
            type="button"
            key={word.id}
            className={`clue-card ${
              isSelected ? "active-clue" : ""
            } ${isSolved ? "solved-clue" : ""}`}
            aria-pressed={isSelected}
            onClick={() => onSelectWord(word)}
          >
            <strong>
              {word.number}. {word.answer.length} letters · {word.theme}
            </strong>

            <span>{word.clue}</span>

            {isSolved && <small>✓ Solved</small>}
          </button>
        );
      });
  };

  const isCurrentWordSolved = solvedWords.includes(
    selectedWord.id
  );

  return (
    <div className="clue-panel" id="clue-panel">
      <h2>GED Clue Bank</h2>

      <div className="answer-box">
        <p className="eyebrow">{selectedWord.number} {selectedWord.direction} · {selectedWord.answer.length} letters · {selectedWord.theme}</p>
        <h3>{selectedWord.clue}</h3>

        <p className="answer-instructions">
          Type in the highlighted boxes, then check your answer. Use Backspace to go back or Enter to check.
        </p>

        <section className="hint-section" aria-label="Hint section">
          <button type="button" className="hint-button" aria-expanded={showHint} aria-controls="selected-hint" onClick={() => setShowHint(!showHint)}>
            {showHint ? "Hide hint" : "Need a hint?"}
          </button>
          {showHint && <p id="selected-hint" className="hint-text">{selectedWord.hint}</p>}
        </section>
        <AnswerReveal answer={selectedWord.answer} buttonClassName="hint-button" />
        <button
          type="button"
          onClick={checkAnswer}
          disabled={isCurrentWordSolved}
        >
          Check Answer
        </button>

        {feedback && (
          <p className="feedback" role="status">
            {feedback}
          </p>
        )}
      </div>
      <p className="clue-category">ACROSS</p>
      {renderClues("across")}

      <p className="clue-category">DOWN</p>
      {renderClues("down")}

    </div>
  );
}

export default CluePanel;
