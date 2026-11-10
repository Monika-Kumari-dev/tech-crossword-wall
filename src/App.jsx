import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "./reference.css";
import WallPreview from "./components/WallPreview";
import { domains, getDomainPuzzles } from "./data/domains";
import CrosswordGrid from "./components/CrosswordGrid";
import CluePanel from "./components/CluePanel";
import GameHeader from "./components/GameHeader";
import OrganizerPanel from "./components/OrganizerPanel";
import {
  calculateAnswerPoints,
  getLeaderboard,
  saveTeamResult,
} from "./utils/scoring";

function App() {
  const [domain, setDomain] = useState("All domains");
  const puzzles = useMemo(() => getDomainPuzzles(domain), [domain]);
  const [teamName, setTeamName] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showOrganizer, setShowOrganizer] = useState(false);
  const [leaderboard, setLeaderboard] = useState(getLeaderboard);
  const gameSectionRef = useRef(null);
  const savedSessionRef = useRef(false);
  const [selectedWord, setSelectedWord] = useState(puzzles[0]);
  const [solvedWords, setSolvedWords] = useState([]);
  const [letters, setLetters] = useState({});
  const [feedback, setFeedback] = useState("");
  const finished = solvedWords.length === puzzles.length;

  useEffect(() => {
    if (!gameStarted || finished) return undefined;

    const timerId = window.setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [gameStarted, finished]);

  useEffect(() => {
    if (!finished || savedSessionRef.current) return;

    savedSessionRef.current = true;

    const result = {
      id: `${Date.now()}-${teamName}`,
      teamName,
      domain,
      totalWords: puzzles.length,
      score,
      seconds,
      completedAt: new Date().toLocaleString(),
    };

    const updatedLeaderboard = saveTeamResult(result);
    setLeaderboard(updatedLeaderboard);
  }, [finished, teamName, domain, puzzles.length, score, seconds]);

  useEffect(() => {
    if (gameStarted && gameSectionRef.current) {
      gameSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [gameStarted]);

  const selectWord = (word) => {
    setSelectedWord(word);
    setFeedback("");
  };

  const checkAnswer = () => {
    const alreadySolved = solvedWords.includes(selectedWord.id);

    if (alreadySolved) {
      setFeedback("This word is already solved!");
      return;
    }

    const enteredLetters = [...selectedWord.answer]
      .map((_, index) => {
        const row =
          selectedWord.row +
          (selectedWord.direction === "down" ? index : 0);

        const col =
          selectedWord.col +
          (selectedWord.direction === "across" ? index : 0);

        return letters[`${row}-${col}`] || "";
      });
    const enteredAnswer = enteredLetters.join("");

    if (
      enteredLetters.some((letter) => !letter) ||
      !enteredAnswer.trim()
    ) {
      setFeedback("Fill in the crossword boxes first.");
      return;
    }

    if (enteredAnswer === selectedWord.answer) {
      setSolvedWords((previous) => [...previous, selectedWord.id]);
      setScore(
        (previous) =>
          previous + calculateAnswerPoints(true, false)
      );
      setFeedback("Correct! You earned 10 points.");
    } else {
      setFeedback("Not quite! Check the letters and try again.");
    }
  };
  const handleStartGame = () => {
    setTeamName(teamName.trim() || "Tech Explorer");
    setFeedback("");
    setSelectedWord(puzzles[0]);

    setGameStarted(true);
  };

  const resetGame = () => {
    savedSessionRef.current = false;
    setGameStarted(false);
    setTeamName("");
    setSelectedWord(puzzles[0]);
    setLetters({});
    setSolvedWords([]);
    setScore(0);
    setSeconds(0);
    setFeedback("");
  };

  const domainLeaderboard = leaderboard.filter((team) => (team.domain || "All domains") === domain);

  if (showOrganizer) {
    return (
      <main className="game-page">
        <OrganizerPanel
          leaderboard={leaderboard}
          onLeaderboardChange={setLeaderboard}
          onBackToWelcome={() => setShowOrganizer(false)}
        />
      </main>
    );
  }

  if (finished) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
      <main className="app">
        <section className="welcome-card results-card">
          <p className="eyebrow">PUZZLE COMPLETE</p>
          <h1>
            WELL <span>DONE!</span>
          </h1>
          <p className="description">Team {teamName} completed {domain === "All domains" ? "all domains" : domain} — {puzzles.length} clues.</p>
          <div className="result-stats">
            <div>
              <strong>{score}</strong>
              <span>Final score</span>
            </div>
            <div>
              <strong>
                {String(minutes).padStart(2, "0")}:
                {String(remainingSeconds).padStart(2, "0")}
              </strong>
              <span>Time</span>
            </div>
          </div>
          <div className="leaderboard">
            <h2>{domain} Leaderboard</h2>

            {domainLeaderboard.length === 0 ? (
              <p>No completed teams yet.</p>
            ) : (
              domainLeaderboard.map((team, index) => (
                <div className="leaderboard-row" key={team.id}>
                  <span>#{index + 1}</span>
                  <strong>{team.teamName}</strong>
                  <span>{team.score} pts</span>
                  <span>
                    {String(Math.floor(team.seconds / 60)).padStart(2, "0")}:
                    {String(team.seconds % 60).padStart(2, "0")}
                  </span>
                </div>
              ))
            )}
          </div>
          <button type="button" onClick={resetGame}>
            Start Next Team
          </button>
        </section>
      </main>
    );
  }

  return (
    <>
      {!gameStarted && <main className="app home-page">
        <section className="welcome-card">

          <p className="eyebrow">GED WEEK FY27 · BANGALORE</p>

          <h1>
            Tech crossword wall
          </h1>

          <p className="description">
            A fun, collaborative challenge for curious minds. Solve clues across AI, coding, engineering and Intuit / GED to complete the crossword — on your own or as a team.
          </p>

          <div className="theme-tags">{domains.filter((name) => name !== "All domains").map((name) => <span key={name}>{name}</span>)}</div>
          <div className="welcome-form">
          <label htmlFor="domain">CHOOSE YOUR DOMAIN</label>
          <select id="domain" value={domain} onChange={(event) => setDomain(event.target.value)}>
            {domains.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <p className="domain-summary">{puzzles.length} questions · {puzzles.length * 10} possible points</p>

          <label htmlFor="teamName">YOUR NAME OR TEAM (OPTIONAL)</label>

          <input
            id="teamName"
            type="text"
            placeholder="e.g. Tech Explorer"
            onKeyDown={(event) => { if (event.key === "Enter") handleStartGame(); }}
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
          />

          <button onClick={handleStartGame}>
            Start solving <span>→</span>
          </button>

          <button
            type="button"
            className="organizer-link"
            onClick={() => setShowOrganizer(true)}
          >
            Organizer Dashboard
          </button>

          </div>
          <p className="footer-text">WED, NOV 18, 2026 · GED WEEK NOV 16–20</p>
          <p className="source-note">Clues from GED Activation Content Ideas · Intuit Confidential and Proprietary</p>
        </section>
        <WallPreview />
      </main>}

      {gameStarted && <main className="game-page" ref={gameSectionRef}>
        <GameHeader
          teamName={teamName}
          domain={domain}
          seconds={seconds}
          score={score}
          solvedCount={solvedWords.length}
          totalWords={puzzles.length}
        />
        <section className="game-layout">
          <div className="crossword-panel">
            <div className="panel-heading">
              <h2>Crossword Grid</h2>
              <span>Blue = selected · Green = solved</span>
            </div>

            <CrosswordGrid
              checkAnswer={checkAnswer}
              feedback={feedback}
              puzzles={puzzles}
              solvedWords={solvedWords}
              selectedWord={selectedWord}
              onSelectWord={selectWord}
              letters={letters}
              setLetters={setLetters}
            />
          </div>

          <CluePanel
            key={selectedWord.id}
            puzzles={puzzles}
            selectedWord={selectedWord}
            solvedWords={solvedWords}
            onSelectWord={selectWord}
            checkAnswer={checkAnswer}
            feedback={feedback}
          />
        </section>
        <footer className="game-footer"><span>GED Bangalore · Nov 18, 2026 · Hints are free. Each word earns 10 points.</span><button type="button" className="reset-button" onClick={resetGame}>Start over</button></footer>
      </main>}
    </>
  );
}

export default App;
