const json = (value, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
export function createAttendanceHandler(getStore) {
  return async (request) => {
    try {
      if (request.method === 'POST') {
        const text = await request.text();
        if (text.length > 2048) return json({ error: 'Record too large.' }, 413);
        let value;
        try { value = JSON.parse(text); } catch { return json({ error: 'Invalid record.' }, 400); }
        if (!value || typeof value !== 'object' || Array.isArray(value)) return json({ error: 'Invalid record.' }, 400);
        const { sessionId, startedAt, name, email, score } = value;
        if (typeof sessionId !== 'string' || !/^[a-f0-9-]{36}$/i.test(sessionId) ||
            typeof name !== 'string' || !name.trim() || name.length > 150 ||
            typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !Number.isInteger(score) || score < 0 || score > 240 || score % 10 !== 0 ||
            typeof startedAt !== 'string' || !Number.isFinite(Date.parse(startedAt))) {
          return json({ error: 'Invalid player details or score.' }, 400);
        }
        // Each score snapshot has its own key: simultaneous devices cannot overwrite each other.
        const record = { sessionId, startedAt, name: name.trim(), email: email.trim().toLowerCase(), score };
        await getStore().setJSON(`sessions/${sessionId}/${score}`, record);
        return json({ saved: true });
      }
      if (request.method !== 'GET') return json({ error: 'Method not allowed.' }, 405);
      const store = getStore();
      const { blobs } = await store.list({ prefix: 'sessions/' });
      const people = new Map();
      for (let offset = 0; offset < blobs.length; offset += 25) {
        const records = await Promise.all(blobs.slice(offset, offset + 25).map(({ key }) => store.get(key, { type: 'json' })));
        for (const record of records) {
          if (!record) continue;
          const previous = people.get(record.email);
          if (!previous || Date.parse(record.startedAt) > Date.parse(previous.startedAt) ||
              (record.sessionId === previous.sessionId && record.score > previous.score)) people.set(record.email, record);
        }
      }
      return json({ attendees: [...people.values()].sort((a, b) => a.name.localeCompare(b.name)).map(({ name, email, score }) => ({ name, email, score })) });
    } catch {
      return json({ error: 'Shared storage is unavailable. Please retry.' }, 503);
    }
  };
}
