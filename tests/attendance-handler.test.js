import test from 'node:test';
import assert from 'node:assert/strict';
import { createAttendanceHandler } from '../server/attendance-handler.js';

function setup() {
  const data = new Map();
  const store = { setJSON: async (key, value) => data.set(key, value), list: async () => ({ blobs: [...data.keys()].map((key) => ({ key })) }), get: async (key) => data.get(key) };
  return createAttendanceHandler(() => store);
}
const player = (id, email, score = 0, startedAt = '2026-11-17T04:00:00Z') => ({ sessionId: `${id}0000000-0000-4000-8000-000000000000`, startedAt, name: 'Player', email, score });
const post = (handler, value) => handler(new Request('https://example.test/api', { method: 'POST', body: JSON.stringify(value) }));
const get = (handler) => handler(new Request('https://example.test/api'));

test('three devices save concurrently without losing players', async () => {
  const handler = setup();
  const results = await Promise.all([post(handler, player('1', 'one@example.com', 10)), post(handler, player('2', 'two@example.com', 20)), post(handler, player('3', 'three@example.com', 30))]);
  assert.ok(results.every((response) => response.status === 200));
  const { attendees } = await (await get(handler)).json();
  assert.equal(attendees.length, 3);
  assert.deepEqual(Object.keys(attendees[0]), ['name', 'email', 'score']);
});
test('late retries cannot lower the current score; latest game replaces old score', async () => {
  const handler = setup();
  await post(handler, player('1', 'one@example.com', 50));
  await post(handler, player('1', 'one@example.com', 0));
  assert.equal((await (await get(handler)).json()).attendees[0].score, 50);
  await post(handler, player('2', 'one@example.com', 10, '2026-11-17T05:00:00Z'));
  assert.equal((await (await get(handler)).json()).attendees[0].score, 10);
});
test('shared attendees are accessible without a password', async () => {
  const response = await get(setup());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { attendees: [] });
});
test('rejects malformed data, invalid scores and unsupported methods', async () => {
  const handler = setup();
  for (const score of [-10, 250, 1, '10']) assert.equal((await post(handler, player('1', 'one@example.com', score))).status, 400);
  assert.equal((await post(handler, { ...player('1', 'one@example.com'), sessionId: '../bad' })).status, 400);
  assert.equal((await handler(new Request('https://example.test/api', { method: 'DELETE' }))).status, 405);
});
test('reports storage failures instead of acknowledging an unsaved score', async () => {
  const handler = createAttendanceHandler(() => { throw new Error('offline'); });
  assert.equal((await post(handler, player('1', 'one@example.com'))).status, 503);
});

test('null and non-object JSON are validation errors, not storage failures', async () => {
  const handler = setup();
  for (const value of [null, [], true, "text", 42]) assert.equal((await post(handler, value)).status, 400);
});
