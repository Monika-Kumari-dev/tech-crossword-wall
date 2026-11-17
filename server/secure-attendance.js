import { createHash } from 'node:crypto';
import { createAccess, adminCookie, adminDevice } from './access.js';
import { createAttendanceHandler } from './attendance-handler.js';
const json = (data, status = 200, headers = {}) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
export function createSecureAttendanceHandler(getStore, env = process.env) {
  const access = createAccess(env);
  const cookie = (request, token, age) => `ged-admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${new URL(request.url).protocol === 'https:' ? '; Secure' : ''}`;
  return async (request) => {
    try {
      if (!access.ready) return json({ error: `Admin setup required: ${access.invalidKeys.join(', ')} must each have a password of at least 12 characters in Netlify's Production environment (Functions scope). The same password is allowed. Redeploy after saving.` }, 503);
      if (request.method === 'POST' && request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) return json({ error: 'Invalid request origin.' }, 403);
      const action = new URL(request.url).searchParams.get('action');
      const admin = access.verify(adminCookie(request), 'admin');
      if (action === 'logout' && request.method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': cookie(request, '', 0) });
      if (action === 'login' && request.method === 'POST') {
        const { username, password } = await request.json();
        if (!access.login(username, password)) return json({ error: 'Incorrect admin username or password.' }, 401);
        const deviceId = adminDevice(username);
        return json({ username, deviceId }, 200, { 'Set-Cookie': cookie(request, access.sign({ role: 'admin', username, deviceId, exp: Date.now() + 8 * 3600000 }), 28800) });
      }
      if (action === 'auth' && request.method === 'GET') return admin ? json({ username: admin.username, deviceId: admin.deviceId }) : json({ error: 'Admin sign-in required.' }, 401);
      if (request.method === 'GET') {
        if (!admin) return json({ error: 'Admin sign-in required.' }, 401);
        const attendees = [];
        for (const deviceId of ['1', '2', '3']) {
          const response = await createAttendanceHandler(() => getStore(deviceId))(request);
          if (!response.ok) return response;
          const result = await response.json();
          attendees.push(...result.attendees.map((row) => ({ ...row, deviceId })));
        }
        return json({ attendees });
      }
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      const text = await request.text();
      if (text.length > 4096) return json({ error: 'Record too large.' }, 413);
      let value;
      try { value = JSON.parse(text); } catch { return json({ error: 'Invalid record.' }, 400); }
      if (!value || !['1', '2', '3'].includes(value.deviceId)) return json({ error: 'Choose a valid device URL (1, 2 or 3).' }, 400);
      const store = getStore(value.deviceId);
      if (action === 'register') {
        if (!admin) return json({ error: 'An admin must sign in on this TV before a player can start.' }, 401);
        if (value.deviceId !== admin.deviceId) return json({ error: 'This login belongs to a different TV. Sign in again on this TV.' }, 403);
        const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : '';
        const name = typeof value.name === 'string' ? value.name.trim() : '';
        if (!name || name.length > 150 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[a-f0-9-]{36}$/i.test(value.sessionId) || !Number.isFinite(Date.parse(value.startedAt))) return json({ error: 'Enter a valid name and email.' }, 400);
        const key = `emails/${createHash('sha256').update(email).digest('hex')}`;
        const registration = { name, email, deviceId: value.deviceId, sessionId: value.sessionId, startedAt: value.startedAt };
        const { modified } = await store.setJSON(key, registration, { onlyIfNew: true });
        if (!modified) {
          const existing = await store.get(key, { type: 'json' });
          if (existing?.sessionId !== value.sessionId) return json({ error: 'This email has already played on this device. Please use a different email.' }, 409);
          Object.assign(registration, existing);
        }
        const playerToken = access.sign({ ...registration, role: 'player', exp: Date.now() + 24 * 3600000 });
        await store.setJSON(`sessions/${value.sessionId}/0/0`, { ...registration, score: 0, questionsPlayed: 0 });
        return json({ ...registration, playerToken });
      }
      const player = access.verify(value.playerToken, 'player');
      if (!player || player.deviceId !== value.deviceId || player.sessionId !== value.sessionId) return json({ error: 'Valid player registration required.' }, 401);
      const record = { sessionId: player.sessionId, score: value.score, questionsPlayed: value.questionsPlayed, name: player.name, email: player.email, startedAt: player.startedAt };
      return createAttendanceHandler(() => store)(new Request(request.url, { method: 'POST', body: JSON.stringify(record) }));
    } catch { return json({ error: 'Shared storage is unavailable. Please retry.' }, 503); }
  };
}
