import { randomBytes } from 'node:crypto';

import { readJsonBody } from '../shared/api/read-json.mjs';
import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

const DELAYED_OUTCOMES = new Set(['demonstrated', 'partial', 'not-demonstrated', 'unknown']);
const CRITIQUE_SOURCES = new Set(['heuristic', 'ai', 'unknown']);

function parseDatabaseTimestamp(value) {
  if (typeof value !== 'string') return new Date(Number.NaN);
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
  return new Date(normalized);
}

export async function prepareDelayedTransferReceipt({
  db,
  userId,
  problemId,
  conceptIds,
  payload,
  now = new Date(),
  dueSnapshot,
}) {
  if (
    typeof problemId !== 'string' ||
    !Array.isArray(conceptIds) ||
    conceptIds.length !== 1 ||
    typeof conceptIds[0] !== 'string' ||
    !payload ||
    payload.schemaVersion !== 1 ||
    typeof payload.interventionId !== 'string' ||
    !DELAYED_OUTCOMES.has(payload.outcome) ||
    !CRITIQUE_SOURCES.has(payload.critiqueSource)
  ) {
    return { error: 'Invalid delayed transfer receipt.', status: 400 };
  }

  const conceptId = conceptIds[0];
  const score = payload.score;
  if (
    (payload.outcome === 'unknown' && (score !== null || payload.critiqueSource !== 'unknown')) ||
    (payload.outcome !== 'unknown' &&
      (!Number.isInteger(score) ||
        score < 0 ||
        score > 100 ||
        payload.critiqueSource === 'unknown'))
  ) {
    return { error: 'Invalid delayed transfer result.', status: 400 };
  }
  if (score !== null) {
    const expectedOutcome =
      score >= 80 ? 'demonstrated' : score >= 55 ? 'partial' : 'not-demonstrated';
    if (payload.outcome !== expectedOutcome) {
      return { error: 'Delayed transfer result does not match its score band.', status: 400 };
    }
  }

  const interventionResult = await db.execute({
    sql: 'SELECT id, concept_ids, created_at FROM feynman_logs WHERE id = ? AND user_id = ?',
    args: [payload.interventionId, userId],
  });
  const intervention = interventionResult.rows[0];
  if (!intervention) return { error: 'Intervention not found.', status: 404 };

  let interventionConceptIds;
  try {
    interventionConceptIds = JSON.parse(intervention.concept_ids || '[]');
  } catch {
    return { error: 'Intervention metadata is invalid.', status: 409 };
  }
  const interventionAt = parseDatabaseTimestamp(intervention.created_at);
  if (
    !Array.isArray(interventionConceptIds) ||
    !interventionConceptIds.includes(conceptId) ||
    !Number.isFinite(interventionAt.getTime()) ||
    interventionAt.getTime() >= now.getTime()
  ) {
    return {
      error: 'Intervention does not match this concept or precede the review.',
      status: 409,
    };
  }

  const reviewDueAt = dueSnapshot?.due;
  const due = parseDatabaseTimestamp(reviewDueAt);
  if (
    dueSnapshot?.source !== 'question' ||
    !reviewDueAt ||
    !Number.isFinite(due.getTime()) ||
    due.getTime() > now.getTime()
  ) {
    return { error: 'Review is not due for this question.', status: 409 };
  }

  return {
    payload: {
      schemaVersion: 1,
      interventionId: intervention.id,
      interventionAt: interventionAt.toISOString(),
      elapsedMs: now.getTime() - interventionAt.getTime(),
      reviewDueAt: parseDatabaseTimestamp(reviewDueAt).toISOString(),
      dueSource: 'question',
      conceptId,
      outcome: payload.outcome,
      score,
      critiqueSource: payload.critiqueSource,
    },
  };
}

export default async function handler({ request, user, json }) {
  await ensureInit();
  if (!user) return json({ error: 'Unauthorized' }, { status: 401 });
  const db = getDb();

  if (request.method === 'POST') {
    const { kind, problemId, conceptIds, durationMs, payload } = await readJsonBody(request);
    if (!kind) return json({ error: 'kind required' }, { status: 400 });
    if (kind === 'delayed_transfer') {
      return json(
        { error: 'Delayed transfer receipts must accompany a saved review.' },
        { status: 400 }
      );
    }
    const id = randomBytes(16).toString('hex');
    await db.execute({
      sql: `INSERT INTO activity_log (id, user_id, kind, problem_id, concept_ids, duration_ms, payload)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        user.id,
        kind,
        problemId || null,
        conceptIds ? JSON.stringify(conceptIds) : null,
        durationMs || 0,
        payload ? JSON.stringify(payload) : null,
      ],
    });
    return json({ id });
  }

  if (request.method === 'GET') {
    const params = new URL(request.url).searchParams;
    const requestedDays = Number.parseInt(params.get('days') || '7', 10);
    const days = Number.isFinite(requestedDays) ? Math.max(1, Math.min(requestedDays, 365)) : 7;
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const kind = params.get('kind');
    const kindFilter = kind ? ' AND kind = ?' : '';
    const result = await db.execute({
      sql: `SELECT id, kind, problem_id, concept_ids, duration_ms, payload, created_at
            FROM activity_log WHERE user_id = ? AND created_at >= ?${kindFilter} ORDER BY created_at DESC LIMIT 500`,
      args: kind ? [user.id, since, kind] : [user.id, since],
    });
    const rows = result.rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      problemId: r.problem_id,
      conceptIds: r.concept_ids ? JSON.parse(r.concept_ids) : [],
      durationMs: r.duration_ms,
      payload: r.payload ? JSON.parse(r.payload) : null,
      createdAt: r.created_at,
    }));
    return json({ activity: rows });
  }

  return json({ error: 'Method not allowed' }, { status: 405 });
}
