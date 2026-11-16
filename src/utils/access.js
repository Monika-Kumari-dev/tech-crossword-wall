export const attendanceEndpoint = '/.netlify/functions/attendance';
export function getDeviceId() {
  const requested = new URLSearchParams(window.location.search).get('device');
  if (['1', '2', '3'].includes(requested)) {
    localStorage.setItem('ged-device-id', requested);
    return requested;
  }
  if (requested !== null) throw new Error("Use a device URL with ?device=1, ?device=2 or ?device=3.");
  return localStorage.getItem('ged-device-id') || '1';
}
export async function accessRequest(action, body, method = 'POST') {
  let response;
  try {
    response = await fetch(`${attendanceEndpoint}?action=${action}`, {
      method, credentials: 'same-origin', headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new Error('Cannot reach the server. Open the deployed Netlify site and check your connection.'); }
  let result;
  try { result = await response.json(); } catch { throw new Error('Player and admin sign-in require the Netlify Function. Open the deployed Netlify site.'); }
  if (!response.ok) throw new Error(result.error || 'Request failed. Please retry.');
  return result;
}
export async function registerPlayer(name, email) {
  const deviceId = getDeviceId();
  const key = `ged-registration-${deviceId}-${email.trim().toLowerCase()}`;
  let pending;
  try { pending = JSON.parse(sessionStorage.getItem(key)); } catch { /* Start a new registration. */ }
  pending ||= { name, email, deviceId, sessionId: crypto.randomUUID(), startedAt: new Date().toISOString() };
  sessionStorage.setItem(key, JSON.stringify(pending));
  const player = await accessRequest('register', pending);
  sessionStorage.removeItem(key);
  return player;
}
