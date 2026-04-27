// Auth cookie helpers — XSS hardening: JWT now lives in an httpOnly cookie
// instead of localStorage. Same-site (Vercel proxies /api/* to the same
// origin as the SPA), so SameSite=Lax is enough.

export const AUTH_COOKIE_NAME = 'dsa_prep_auth';
// 30 days — matches the JWT expiry in google.mjs (`expiresIn: '30d'`).
export const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60;

export function buildAuthCookie(token) {
  return `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${AUTH_COOKIE_MAX_AGE}`;
}

export function buildAuthClearCookie() {
  return `${AUTH_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export function readAuthCookie(req) {
  const header = req.headers?.cookie || '';
  if (!header) return null;
  const match = header.match(/(?:^|;\s*)dsa_prep_auth=([^;]+)/);
  return match ? match[1] : null;
}
