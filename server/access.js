import { createHmac, timingSafeEqual } from 'node:crypto';
export const admins = ['info@techfluence'];
export function createAccess(env = process.env) {
  const keys = ['Demo1'];
  const passwords = keys.map((key) => env[key]);
  const invalidKeys = keys.filter((_, index) => typeof passwords[index] !== 'string' || passwords[index].length < 12);
  const ready = invalidKeys.length === 0;
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
      return data.role === role && data.exp > Date.now() && (role !== 'admin' || admins.includes(data.username)) ? data : null;
    } catch { return null; }
  };
  return { ready, invalidKeys, sign, verify, login: (user, password) => ready && admins.includes(user) && equal(password, passwords[admins.indexOf(user)]) };
}
export const adminCookie = (request) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith('ged-admin='))?.slice(10);
