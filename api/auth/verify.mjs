import jwt from 'jsonwebtoken';
import { getUserById } from '../../shared/db/users.mjs';
import { readAuthCookie } from './cookies.mjs';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function extractToken(req) {
  // Prefer the httpOnly cookie (XSS-safe). Fall back to the legacy
  // Authorization header so we don't break clients still on the old flow
  // during the rollout window.
  const cookieToken = readAuthCookie(req);
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export async function requireAuth(req, res) {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  const user = await getUserById(decoded.userId);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return null;
  }

  return user;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  return res.status(200).json({ user });
}
