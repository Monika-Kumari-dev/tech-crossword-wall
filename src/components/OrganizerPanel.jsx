
import { clearLeaderboard } from "../utils/scoring";

function OrganizerPanel({
  leaderboard,
  onLeaderboardChange,
  onBackToWelcome,
}) {
  const exportResults = () => {
    if (leaderboard.length === 0) {
      alert("There are no results to export yet.");
      return;
    }

    const headers = [
      "Rank",
      "Team Name",
      "Domain",
      "Total Questions",
      "Score",
      "Time (seconds)",
      "Completed At",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = leaderboard.map((team, index) => [
      index + 1,
      team.teamName,
      team.domain || "All domains",
      team.totalWords || 24,
      team.score,
      team.seconds,
      team.completedAt,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ged-fy27-crossword-results.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      "Clear all saved leaderboard results? This cannot be undone."
    );

    if (!confirmed) return;

    clearLeaderboard();
    onLeaderboardChange([]);
  };

  return (
    <section className="organizer-panel">
      <div className="organizer-heading">
        <div>
          <p className="eyebrow">GED FY27 · BANGALORE</p>
          <h2>Organizer Dashboard</h2>
          <p>November 18, 2026 · Choose one domain (6 clues) or all domains (24 clues). Results are saved in this browser.</p>
        </div>

        <span className="team-count">
          {leaderboard.length} teams
        </span>
      </div>

      <div className="organizer-actions">
        <button type="button" onClick={exportResults}>
          Export Results (CSV)
        </button>

        <button
          type="button"
          className="danger-button"
          onClick={handleClear}
        >
          Clear Leaderboard
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={onBackToWelcome}
        >
          Back to Welcome
        </button>
      </div>

      <h3>Saved Teams</h3>

      {leaderboard.length === 0 ? (
        <p className="empty-state">
          No completed teams yet. Results will appear here.
        </p>
      ) : (
        <div className="organizer-table">
          {leaderboard.map((team, index) => (
            <div className="organizer-row" key={team.id}>
              <span>#{index + 1}</span>
              <strong>{team.teamName}<small className="result-domain">{team.domain || "All domains"}</small></strong>
              <span>{team.score} points</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrganizerPanel;
