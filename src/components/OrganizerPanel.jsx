import { useEffect, useState } from "react";
import { fetchSharedAttendees } from "../utils/attendanceSync";
import { exportAttendance } from "../utils/attendance";

function OrganizerPanel({ onBackToWelcome }) {
  const [attendees, setAttendees] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const [pin, setPin] = useState("");
  const [draftPin, setDraftPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    if (!pin) return;
    const controller = new AbortController();
    let active = true;
    const refresh = async () => {
      try {
        const rows = await fetchSharedAttendees(pin, controller.signal);
        if (active) { setAttendees(rows); setError(""); setLoading(false); }
      } catch (err) {
        if (active) { setError(err.message); setLoading(false); }
      }
    };
    void refresh();
    const interval = setInterval(refresh, 10000);
    return () => { active = false; controller.abort(); clearInterval(interval); };
  }, [pin, attempt]);
  const download = async () => {
    setExporting(true);
    try {
      const rows = await fetchSharedAttendees(pin);
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
      <form className="organizer-login" onSubmit={(event) => { event.preventDefault(); setLoading(true); setPin(draftPin); setAttempt((value) => value + 1); }}>
        <label htmlFor="organizer-pin">Organizer PIN</label>
        <input id="organizer-pin" type="password" required value={draftPin} onChange={(event) => setDraftPin(event.target.value)} />
        <button type="submit">Load shared scores</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Loading scores from all devices…</p>}
      <div className="organizer-actions">
        <button type="button" onClick={download} disabled={!pin || loading || exporting || !!error}>
          {exporting ? "Exporting…" : "Export for Excel (CSV)"}
        </button>
        <button type="button" className="secondary-button" onClick={onBackToWelcome}>
          Back to Welcome
        </button>
      </div>
      <div className="attendee-table-wrapper">
        <table className="attendee-table">
          <thead><tr><th scope="col">Name</th><th scope="col">Email ID</th><th scope="col">Score</th></tr></thead>
          <tbody>
            {attendees.map((person) => (
              <tr key={person.email}><td>{person.name}</td><td>{person.email}</td><td>{person.score ?? 0}</td></tr>
            ))}
            {attendees.length === 0 && <tr><td colSpan={3}>{pin ? "No shared players loaded yet." : "Enter your organizer PIN to view shared scores."}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrganizerPanel;
