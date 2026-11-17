export const attendanceEndpoint = '/.netlify/functions/attendance';
export function getDeviceId() {
  const deviceId = localStorage.getItem('ged-device-id');
  if (!['1', '2', '3'].includes(deviceId)) throw new Error('Sign in as Admin1, Admin2 or Admin3 to assign this TV.');
  return deviceId;
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
  if (!response.ok) {
    if (response.status === 401 && action === 'register') window.dispatchEvent(new Event('admin-session-expired'));
    throw new Error(result.error || 'Request failed. Please retry.');
  }
  if ((action === 'login' || action === 'auth') && ['1', '2', '3'].includes(result.deviceId)) {
    localStorage.setItem('ged-device-id', result.deviceId);
  }
  if (action === 'logout') localStorage.removeItem('ged-device-id');
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
