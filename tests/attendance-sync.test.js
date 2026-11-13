import test from 'node:test';
import assert from 'node:assert/strict';
import { queueAttendee, flushAttendance, fetchSharedAttendees } from '../src/utils/attendanceSync.js';

test('offline saves persist, retry succeeds, and simultaneous queued players are retained', async () => {
  const data = new Map();
  globalThis.localStorage = { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  const events = [];
  globalThis.window = { dispatchEvent: (event) => events.push(event.detail) };
  const person = (id) => ({ sessionId: id, startedAt: '2026-11-17T04:00:00Z', name: `Player ${id}`, email: `${id}@example.com`, score: 10 });
  globalThis.fetch = async () => { throw new Error('Offline'); };
  queueAttendee(person('device1'));
  queueAttendee(person('device2'));
  queueAttendee(person('device3'));
  await new Promise(setImmediate);
  assert.equal(Object.keys(JSON.parse(data.get('ged-fy27-sync-queue'))).length, 3);
  assert.match(events.at(-1), /Waiting to sync/);
  const saved = [];
  globalThis.fetch = async (_url, options) => {
    saved.push(JSON.parse(options.body));
    return Response.json({ saved: true });
  };
  await flushAttendance();
  assert.equal(saved.length, 3);
  assert.equal(Object.keys(JSON.parse(data.get('ged-fy27-sync-queue'))).length, 0);
  assert.equal(events.at(-1), '');
  globalThis.fetch = async () => new Response('<html>Not found</html>', { status: 404 });
  await assert.rejects(fetchSharedAttendees(), /Netlify deployment/);
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers, undefined);
    return Response.json({ attendees: saved.map(({ name, email, score }) => ({ name, email, score })) });
  };
  const rows = await fetchSharedAttendees();
  assert.equal(rows.length, 3);
});
