import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';
import {
  deleteImportedDeck,
  listImportedReviews,
  upsertImportedReviews,
} from '../shared/handlers/imported-reviews-core.mjs';

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method === 'GET') {
    const reviews = await listImportedReviews(db, user.id);
    return res.status(200).json({ reviews });
  }

  if (req.method === 'POST') {
    const { deckName, cards } = req.body || {};
    const result = await upsertImportedReviews(db, user.id, { deckName, cards });
    const reviews = await listImportedReviews(db, user.id);
    return res.status(200).json({ ...result, reviews });
  }

  if (req.method === 'DELETE') {
    const deckName = req.query.deck || req.body?.deckName;
    const result = await deleteImportedDeck(db, user.id, deckName);
    return res.status(200).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}