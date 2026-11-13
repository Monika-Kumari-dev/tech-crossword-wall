const QUEUE_KEY = 'ged-fy27-sync-queue';
const endpoint = '/.netlify/functions/attendance';
let running = false;

function queue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '{}'); } catch { return {}; }
}
function announce(message) {
  window.dispatchEvent(new CustomEvent('attendance-sync', { detail: message }));
}
export function queueAttendee(person) {
  if (!person?.sessionId) return;
  const records = queue();
  const key = `${person.sessionId}/${person.score || 0}`;
  if (records[key]) return;
  records[key] = { sessionId: person.sessionId, startedAt: person.startedAt, name: person.name, email: person.email, score: person.score || 0 };
  localStorage.setItem(QUEUE_KEY, JSON.stringify(records));
  void flushAttendance();
}
export async function flushAttendance() {
  if (running || !Object.keys(queue()).length) return;
  running = true;
  try {
    for (const [key, record] of Object.entries(queue())) {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record), signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Save failed');
      const result = await response.json();
      if (!result.saved) throw new Error('Save failed');
      const pending = queue();
      delete pending[key];
      localStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
    }
    announce('');
  } catch {
    announce('Score saved on this device. Waiting to sync — keep this page open.');
  } finally { running = false; }
}
export async function fetchSharedAttendees(signal) {
  await flushAttendance();
  const response = await fetch(endpoint, { cache: 'no-store', signal });
  let result;
  try { result = await response.json(); } catch { throw new Error('Shared storage needs a Netlify deployment.'); }
  if (!response.ok) throw new Error(result.error || 'Unable to load shared attendees.');
  return result.attendees;
}
