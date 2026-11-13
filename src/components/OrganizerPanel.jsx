import { getAttendees, exportAttendance } from "../utils/attendance";

function OrganizerPanel({ onBackToWelcome }) {
  const attendees = getAttendees();

  return (
    <section className="organizer-panel">
      <div className="organizer-heading">
        <div>
          <p className="eyebrow">GED FY27 · NOVEMBER 17, 2026</p>
          <h2>Organizer Dashboard</h2>
        </div>
      </div>
      <div className="organizer-actions">
        <button type="button" onClick={() => exportAttendance(getAttendees())}>
          Export for Excel (CSV)
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
            {attendees.length === 0 && <tr><td colSpan={3}>No players yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OrganizerPanel;
