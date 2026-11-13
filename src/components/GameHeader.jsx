
function GameHeader({
  teamName,
  domain,
  seconds,
  score,
  solvedCount,
  totalWords,
}) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;

  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">GED FY27 · BANGALORE · NOV 17</p>

        <h1>
          TECH <span>CROSSWORD</span>
        </h1>

        <p className="team-label">Team: {teamName} · {domain}</p>
      </div>

      <div className="game-stats">
        <div className="stat-card">
          <span>TIME</span>
          <strong>{formattedTime}</strong>
        </div>

        <div className="stat-card">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>

        <div className="stat-card">
          <span>PROGRESS</span>
          <strong>
            {solvedCount}/{totalWords}
          </strong>
        </div>
      </div>
    </header>
  );
}

export default GameHeader;
