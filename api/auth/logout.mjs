import { buildAuthClearCookie } from './cookies.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Set-Cookie', buildAuthClearCookie());
  return res.status(200).json({ ok: true });
}
