import test from 'node:test';
import assert from 'node:assert/strict';
import { createSecureAttendanceHandler } from '../server/secure-attendance.js';
const env = { Demo1: 'first-private-password', Demo2: 'second-private-password', Demo3: 'third-private-password' };
function setup(config = env) {
  const stores = new Map();
  return createSecureAttendanceHandler((id) => {
    if (!stores.has(id)) {
      const data = new Map();
      stores.set(id, {
        setJSON: async (key, value, options) => {
          if (options?.onlyIfNew && data.has(key)) return { modified: false };
          data.set(key, structuredClone(value)); return { modified: true };
        },
        get: async (key) => data.get(key) || null,
        list: async ({ prefix }) => ({ blobs: [...data.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })) }),
      });
    }
    return stores.get(id);
  }, config);
}
const request = async (handler, action, body, cookie) => {
  if (action === 'register' && !cookie) cookie = await login(handler);
  return handler(new Request(`https://example.test/api${action ? `?action=${action}` : ''}`, {
  method: body ? 'POST' : 'GET', headers: cookie ? { cookie } : {}, body: body ? JSON.stringify(body) : undefined,
}));
};
const player = (deviceId = '1', email = 'player@example.com') => ({ deviceId, email, name: 'Player', sessionId: crypto.randomUUID(), startedAt: new Date().toISOString() });
async function login(handler, username = 'info@techfluence', password = env.Demo1) {
  const response = await request(handler, 'login', { username, password });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
  return response.headers.get('set-cookie').split(';')[0];
}
test('the shared TV admin can read all devices; anonymous and invalid credentials cannot read or export', async () => {
  const handler = setup();
  assert.equal((await request(handler)).status, 401);
  assert.equal((await request(handler, 'login', { username: 'info@techfluence', password: 'wrong' })).status, 401);
  for (const id of ['1', '2', '3']) assert.equal((await request(handler, 'register', player(id))).status, 200);
  for (const [index, username] of ['info@techfluence'].entries()) {
    const cookie = await login(handler, username, Object.values(env)[index]);
    const result = await (await request(handler, '', undefined, cookie)).json();
    assert.deepEqual(result.attendees.map((row) => row.deviceId), ['1', '2', '3']);
  }
});
test('concurrent duplicate emails are rejected per device and normalized; a different device accepts the same email', async () => {
  const handler = setup();
  const responses = await Promise.all([request(handler, 'register', player('1', ' Player@Example.com ')), request(handler, 'register', player('1'))]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409]);
  assert.equal((await request(handler, 'register', player('2'))).status, 200);
});
test('registration retries are idempotent; player credentials cannot write another session or device', async () => {
  const handler = setup();
  const registration = player();
  const saved = await (await request(handler, 'register', registration)).json();
  assert.equal((await request(handler, 'register', registration)).status, 200);
  const progress = { ...saved, score: 20, questionsPlayed: 3 };
  assert.equal((await request(handler, '', progress)).status, 200);
  for (const tampered of [{ ...progress, deviceId: '2' }, { ...progress, sessionId: crypto.randomUUID() }, { ...progress, playerToken: '' }]) {
    assert.equal((await request(handler, '', tampered)).status, 401);
  }
  const cookie = await login(handler);
  const { attendees } = await (await request(handler, '', undefined, cookie)).json();
  assert.equal(attendees[0].score, 20);
  assert.equal(attendees[0].playerToken, undefined);
});
test('missing admin configuration fails closed and forged cookies are rejected', async () => {
  assert.equal((await request(setup({}))).status, 503);
  assert.equal((await request(setup(), '', undefined, 'ged-admin=forged.token')).status, 401);
});

test('the info@techfluence account uses Demo1; missing and short passwords are rejected', async () => {
  const password = 'shared-admin-password';
  const handler = setup({ Demo1: password, Demo2: password, Demo3: password });
  for (const username of ['info@techfluence']) {
    const cookie = await login(handler, username, password);
    assert.equal((await request(handler, '', undefined, cookie)).status, 200);
  }
  for (const config of [{}, { Demo1: 'short' }]) {
    assert.equal((await request(setup(config))).status, 503);
  }
});

test('players cannot register before admin sign-in and old demo usernames are rejected', async () => {
  const handler = setup();
  const anonymous = await handler(new Request('https://example.test/api?action=register', { method: 'POST', body: JSON.stringify(player()) }));
  assert.equal(anonymous.status, 401);
  for (const username of ['demo1', 'demo2', 'demo3']) {
    assert.equal((await request(handler, 'login', { username, password: env.Demo1 })).status, 401);
  }
  const cookie = await login(handler);
  assert.equal((await request(handler, 'register', player(), cookie)).status, 200);
});
