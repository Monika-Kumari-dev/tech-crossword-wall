import { useEffect, useState } from "react";
import { fetchSharedAttendees } from "../utils/attendanceSync";
import { exportAttendance, getAttendees } from "../utils/attendance";

function OrganizerPanel({ onBackToWelcome }) {
  const [attendees, setAttendees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const refresh = async () => {
      try {
        const rows = await fetchSharedAttendees(controller.signal);
        if (active) { setAttendees(rows); setError(""); setLoading(false); }
      } catch (err) {
        if (active) { setError(err.message); setLoading(false); }
      }
    };
    void refresh();
    const interval = setInterval(refresh, 10000);
    return () => { active = false; controller.abort(); clearInterval(interval); };
  }, []);
  const download = async () => {
    setExporting(true);
    try {
      const rows = await fetchSharedAttendees();
      setAttendees(rows);
      setError("");
      exportAttendance(rows);
    } catch (err) { setError(err.message); }
    finally { setExporting(false); }
  };

  return (
    <section className="organizer-panel">
      <div className="organizer-heading">
        <div>
          <p className="eyebrow">GED FY27 · NOVEMBER 17, 2026</p>
          <h2>Organizer Dashboard</h2>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {error && <p>Shared scores could not be loaded. You can export scores saved in this browser below; scores from other devices are not included.</p>}
      {loading && <p role="status">Loading scores from all devices…</p>}
      <div className="organizer-actions">
        <button type="button" onClick={download} disabled={loading || exporting || !!error}>
          {exporting ? "Exporting…" : "Export for Excel (CSV)"}
        </button>
        {error && <button type="button" onClick={() => exportAttendance(getAttendees().filter((person) => person.sessionId))}>
          Export this device (CSV)
        </button>}
        <button type="button" className="secondary-button" onClick={onBackToWelcome}>
          Back to Welcome
        </button>
      </div>
      <div className="attendee-table-wrapper">
        <table className="attendee-table">
          <thead><tr><th scope="col">Name</th><th scope="col">Email ID</th><th scope="col">Score</th><th scope="col">Questions Played</th><th scope="col">Session Started</th></tr></thead>
          <tbody>
            {attendees.map((person) => (
              <tr key={person.sessionId}><td>{person.name}</td><td>{person.email}</td><td>{person.score ?? 0}</td><td>{person.questionsPlayed ?? (person.score ?? 0) / 10}</td><td>{person.startedAt ? new Date(person.startedAt).toLocaleString() : "—"}</td></tr>
            ))}
            {attendees.length === 0 && <tr><td colSpan={5}>{error ? "Shared scores unavailable." : loading ? "Loading players…" : "No players yet."}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrganizerPanel;
