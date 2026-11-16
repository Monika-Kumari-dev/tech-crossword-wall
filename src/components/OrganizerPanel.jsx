import { useEffect, useState } from "react";
import { fetchSharedAttendees } from "../utils/attendanceSync";
import { accessRequest } from "../utils/access";
import { exportAttendance, getAttendees } from "../utils/attendance";

function OrganizerScores({ onBackToWelcome, username, onLogout }) {
  const [device, setDevice] = useState("all");
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
      exportAttendance(device === "all" ? rows : rows.filter((row) => row.deviceId === device));
    } catch (err) { setError(err.message); }
    finally { setExporting(false); }
  };

  return (
    <section className="organizer-panel">
      <div className="organizer-heading">
        <div>
          <p className="eyebrow">GED FY27 · NOVEMBER 17, 2026</p>
          <h2>Organizer Dashboard</h2>
          <p>Signed in as {username}</p>
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      {error && <p>Shared scores could not be loaded. You can export scores saved in this browser below; scores from other devices are not included.</p>}
      {loading && <p role="status">Loading scores from all devices…</p>}
      <label htmlFor="device-filter">Device results </label>
      <select id="device-filter" value={device} onChange={(event) => setDevice(event.target.value)}>
        <option value="all">All devices</option>
        <option value="1">Device 1</option><option value="2">Device 2</option><option value="3">Device 3</option>
      </select>
      <div className="organizer-actions">
        <button type="button" className="secondary-button" onClick={onLogout}>Sign out</button>
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
          <thead><tr><th scope="col">Device</th><th scope="col">Name</th><th scope="col">Email ID</th><th scope="col">Score</th><th scope="col">Questions Played</th><th scope="col">Session Started</th></tr></thead>
          <tbody>
            {attendees.filter((row) => device === "all" || row.deviceId === device).map((person) => (
              <tr key={`${person.deviceId}/${person.sessionId}`}><td>{person.deviceId || "Legacy"}</td><td>{person.name}</td><td>{person.email}</td><td>{person.score ?? 0}</td><td>{person.questionsPlayed ?? (person.score ?? 0) / 10}</td><td>{person.startedAt ? new Date(person.startedAt).toLocaleString() : "—"}</td></tr>
            ))}
            {attendees.length === 0 && <tr><td colSpan={6}>{error ? "Shared scores unavailable." : loading ? "Loading players…" : "No players yet."}</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function OrganizerPanel({ onBackToWelcome }) {
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState("demo1");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    accessRequest("auth", undefined, "GET").then((data) => { if (active) setUsername(data.username); })
      .catch(() => {}).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  const login = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try { const result = await accessRequest("login", { username: user, password }); setUsername(result.username); setPassword(""); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    try { await accessRequest("logout"); setUsername(""); }
    catch (err) { setError(err.message); }
  };
  if (checking) return <section className="organizer-panel"><p role="status">Checking admin access…</p></section>;
  if (username) return <><OrganizerScores username={username} onLogout={logout} onBackToWelcome={onBackToWelcome} />{error && <p role="alert">{error}</p>}</>;
  return <section className="organizer-panel">
    <h2>Organizer Dashboard</h2>
    <form className="welcome-form" onSubmit={login}>
      <label htmlFor="admin-user">Admin username</label>
      <select id="admin-user" value={user} onChange={(event) => setUser(event.target.value)}>
        <option>demo1</option><option>demo2</option><option>demo3</option>
      </select>
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Admin sign in"}</button>
      <button type="button" className="secondary-button" onClick={onBackToWelcome}>Back to Welcome</button>
    </form>
  </section>;
}
