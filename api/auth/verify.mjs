import jwt from 'jsonwebtoken';
import { getUserById } from '../../shared/db/users.mjs';
import { readAuthCookie } from './cookies.mjs';

export function verifyToken(token, secret = process.env.JWT_SECRET) {
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  try {
    return jwt.verify(token, secret);
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
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export async function requireAuth(req, res) {
  if (req._authenticatedUser) return req._authenticatedUser;
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const decoded = verifyToken(token);

  if (!decoded?.userId) {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }

  const user = await getUserById(decoded.userId);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return null;
  }
  const ownerEmail = process.env.OWNER_EMAIL?.toLowerCase();
  if (ownerEmail && user.email?.toLowerCase() !== ownerEmail) {
    res.status(403).json({ error: 'Forbidden' });
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
