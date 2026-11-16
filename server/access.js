import { createHmac, timingSafeEqual } from 'node:crypto';
export const admins = ['demo1', 'demo2', 'demo3'];
export function createAccess(env = process.env) {
  const passwords = admins.map((name) => env[`ADMIN_${name.toUpperCase()}_PASSWORD`]);
  const ready = passwords.every((value) => typeof value === 'string' && value.length >= 12) && new Set(passwords).size === 3;
  const secret = passwords.join('\n');
  const equal = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
  const sign = (payload) => {
    const value = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${value}.${createHmac('sha256', secret).update(value).digest('base64url')}`;
  };
  const verify = (token, role) => {
    if (!ready || typeof token !== 'string') return null;
    try {
      const [value, signature] = token.split('.');
      if (!equal(signature, createHmac('sha256', secret).update(value).digest('base64url'))) return null;
      const data = JSON.parse(Buffer.from(value, 'base64url').toString());
      return data.role === role && data.exp > Date.now() ? data : null;
    } catch { return null; }
  };
  return { ready, sign, verify, login: (user, password) => ready && admins.includes(user) && equal(password, passwords[admins.indexOf(user)]) };
}
export const adminCookie = (request) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith('ged-admin='))?.slice(10);
