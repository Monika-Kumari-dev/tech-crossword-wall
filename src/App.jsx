import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "./reference.css";
import "./template.css";
import usePageRoute, { navigate } from "./hooks/usePageRoute";
import { recordArrival, updateAttendeeProgress } from "./utils/attendance";
import WallPreview from "./components/WallPreview";
import PhoneGame from "./components/PhoneGame";
import { getDomainPuzzles } from "./data/domains";
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
  const domain = "All domains";
  const puzzles = useMemo(() => getDomainPuzzles(domain), [domain]);
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const page = usePageRoute();
  const [leaderboard, setLeaderboard] = useState(getLeaderboard);
  const savedSessionRef = useRef(false);
  const [selectedWord, setSelectedWord] = useState(puzzles[0]);
  const [solvedWords, setSolvedWords] = useState([]);
  const [letters, setLetters] = useState({});
  const [feedback, setFeedback] = useState("");
  const [endedEarly, setEndedEarly] = useState(false);
  const completed = solvedWords.length === puzzles.length;
  const finished = completed || endedEarly;

  useEffect(() => {
    if (!gameStarted || finished || page !== "/game") return undefined;

    const timerId = window.setInterval(() => {
      setSeconds((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [gameStarted, finished, page]);

  useEffect(() => {
    if (!finished || savedSessionRef.current) return;

    savedSessionRef.current = true;

    const result = {
      id: `${Date.now()}-${teamName}`,
      teamName,
      email,
      domain,
      totalWords: puzzles.length,
      solvedCount: solvedWords.length,
      completed,
      score,
      seconds,
      completedAt: new Date().toLocaleString(),
    };

    const updatedLeaderboard = saveTeamResult(result);
    setLeaderboard(updatedLeaderboard);
    navigate("/results");
  }, [finished, completed, solvedWords.length, teamName, email, domain, puzzles.length, score, seconds]);

  useEffect(() => {
    if (page === "/game" && finished) {
      navigate("/results", true);
      return;
    }
    if ((page === "/game" && !gameStarted) || (page === "/results" && !finished)) {
      navigate("/", true);
    }
  }, [page, gameStarted, finished]);

  const navigation = (
    <nav className="page-navigation" aria-label="Page navigation">
      <a href="#/">← Home</a>
      {gameStarted && !finished && page !== "/game" && <a href="#/game">Resume game</a>}
      {finished && page !== "/results" && <a href="#/results">Results</a>}
      {page !== "/organizer" && <a href="#/organizer">Organizer Dashboard</a>}
    </nav>
  );

  useEffect(() => {
    if (!gameStarted) return;
    updateAttendeeProgress(email, {
      score,
      solvedCount: solvedWords.length,
      seconds,
      status: completed ? "Completed" : endedEarly ? "Ended early" : "In progress",
      ...(finished ? { endedAt: new Date().toISOString() } : {}),
    });
  }, [gameStarted, email, score, solvedWords.length, seconds, completed, endedEarly, finished]);

  const selectWord = (word) => {
    setSelectedWord(word);
    setFeedback("");
  };

  const checkAnswer = () => {
    if (finished) return;
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
  const handleStartGame = (event) => {
    event.preventDefault();
    if (!teamName.trim()) {
      event.currentTarget.elements.teamName.setCustomValidity("Please enter your name.");
      event.currentTarget.reportValidity();
      return;
    }
    setTeamName(teamName.trim());
    setEmail(email.trim());
    setFeedback("");
    setSelectedWord(puzzles[0]);

    recordArrival(teamName, email, true);
    setGameStarted(true);
    navigate("/game");
  };

  const resetGame = () => {
    if (gameStarted && !finished) {
      updateAttendeeProgress(email, { status: "Ended early", endedAt: new Date().toISOString() });
    }
    savedSessionRef.current = false;
    setGameStarted(false);
    setEndedEarly(false);
    navigate("/");
    setTeamName("");
    setEmail("");
    setSelectedWord(puzzles[0]);
    setLetters({});
    setSolvedWords([]);
    setScore(0);
    setSeconds(0);
    setFeedback("");
  };

  const domainLeaderboard = leaderboard.filter((team) => (team.domain || "All domains") === domain);

  if (page === "/organizer") {
    return (
      <main className="game-page">
        {navigation}
        <OrganizerPanel
          onBackToWelcome={() => navigate("/")}
        />
      </main>
    );
  }

  if (page === "/results" && finished) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
      <main className="app">
        <section className="welcome-card results-card">
          {navigation}
          <p className="eyebrow">{completed ? "PUZZLE COMPLETE" : "YOUR RESULTS"}</p>
          <h1>
            WELL <span>DONE!</span>
          </h1>
          <p className="description">{teamName} solved {solvedWords.length} of {puzzles.length} clues.</p>
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
      {page === "/" && <main className="app home-page">
        <header className="home-heading">
          <p className="eyebrow">GED WEEK FY27 · BANGALORE</p>

          <h1>
            Tech crossword wall
          </h1>



        </header>
        <section className="welcome-card">
          {!gameStarted ? <form className="welcome-form" onSubmit={handleStartGame}>

          <label htmlFor="teamName">Enter your name</label>

          <input
            id="teamName"
            name="teamName"
            autoComplete="name"
            required
            type="text"
            placeholder="Enter your name"
            value={teamName}
            onChange={(event) => { event.target.setCustomValidity(""); setTeamName(event.target.value); }}
          />

          <label className="email-label" htmlFor="email">enter your intuit email id</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="enter your intuit email id"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button type="submit">
            Start solving <span>→</span>
          </button>

          <button
            type="button"
            className="organizer-link"
            onClick={() => navigate("/organizer")}
          >
            Organizer Dashboard
          </button>

          </form> : <div className="welcome-form">
            <p>{finished ? "Crossword complete" : "Game in progress"} · {teamName}</p>
            <button type="button" onClick={() => navigate(finished ? "/results" : "/game")}>{finished ? "View results" : "Resume game"} →</button>
            <button type="button" className="organizer-link" onClick={() => navigate("/organizer")}>Organizer Dashboard</button>
            <button type="button" className="organizer-link" onClick={resetGame}>Start a new game</button>
          </div>}
        </section>
        <WallPreview />
        <aside className="home-introduction">
          <p className="description">
            A fun, collaborative challenge for curious minds. Solve clues across AI, coding, engineering and Intuit / GED to complete the crossword — on your own or as a team.
          </p>
          <p className="wall-caption">A little curiosity. A lot of connections.</p>
        </aside>
        <footer className="home-event-footer"><img className="reference-track" src="/ged-reference-track.svg" alt="" /><p className="footer-text">TUE, NOV 17, 2026 · GED WEEK NOV 16–20</p><img className="event-logo" src="/ged-logo.png" alt="GED" width="37" height="54" /></footer>
      </main>}

      {page === "/game" && gameStarted && <main className="game-page play-page">
        {navigation}
        <GameHeader
          teamName={teamName}
          domain={domain}
          seconds={seconds}
          score={score}
          solvedCount={solvedWords.length}
          totalWords={puzzles.length}
        />
        <PhoneGame onEdit={() => setFeedback("")} key={selectedWord.id} puzzles={puzzles} selectedWord={selectedWord} solvedWords={solvedWords} letters={letters} setLetters={setLetters} onSelectWord={selectWord} checkAnswer={checkAnswer} feedback={feedback} />
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
        <footer className="game-footer"><span>GED Bangalore · Nov 17, 2026 · Hints are free. Each word earns 10 points.</span><div className="game-footer-actions"><button type="button" className="finish-button" onClick={() => setEndedEarly(true)}>Finish &amp; view score</button><button type="button" className="reset-button" onClick={resetGame}>Start over</button></div></footer>
      </main>}
    </>
  );
}

export default App;
