import { readJsonBody } from '../shared/api/read-json.mjs';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
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

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'GET') {
    const reviews = await listImportedReviews(db, user.id);
    return json({ reviews });
  }

  if (request.method === 'POST') {
    const { deckName, cards } = await readJsonBody(request);
    const result = await upsertImportedReviews(db, user.id, { deckName, cards });
    const reviews = await listImportedReviews(db, user.id);
    return json({ ...result, reviews });
  }

  if (request.method === 'DELETE') {
    const body = await readJsonBody(request);
    const deckName = new URL(request.url).searchParams.get('deck') || body?.deckName;
    const result = await deleteImportedDeck(db, user.id, deckName);
    return json(result);
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
