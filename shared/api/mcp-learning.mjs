import { verifySweInterviewPrepAuth0Subject } from '../lib/auth0-mcp.mjs';
import {
  buildCurrentLearningVerification,
  loadAttemptsProjection,
  loadDailyLearningProjection,
} from '../lib/daily-learning-projection.mjs';

const MAX_AUTHORIZATION_BYTES = 20_000;

function privateHeaders() {
  return {
    'cache-control': 'private, no-store',
    pragma: 'no-cache',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
  };
}

function bearerToken(request) {
  const value = request.headers.get('authorization');
  if (!value || value.length > MAX_AUTHORIZATION_BYTES) return null;
  return /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/u.exec(value)?.[1] ?? null;
}

export async function handleMcpLearningRequest({
  request,
  path,
  env,
  client,
  json,
  verifySubject = verifySweInterviewPrepAuth0Subject,
  now = new Date(),
}) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: privateHeaders() });
  }
  const token = bearerToken(request);
  if (!token) return json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders() });
  const googleId = await verifySubject(token, env);
  if (!googleId) return json({ error: 'Unauthorized' }, { status: 401, headers: privateHeaders() });

  const result = await client.execute({
    sql: 'SELECT id, email FROM users WHERE google_id = ? LIMIT 1',
    args: [googleId],
  });
  const user = result.rows[0];
  if (!user) {
    return json(
      { error: 'Linked learning account not found' },
      { status: 403, headers: privateHeaders() }
    );
  }
  if (
    env.OWNER_EMAIL &&
    String(user.email).toLowerCase() !== String(env.OWNER_EMAIL).toLowerCase()
  ) {
    return json(
      { error: 'This learning workspace is private' },
      { status: 403, headers: privateHeaders() }
    );
  }

  // Answered before the daily projection so a read of the learner's own work
  // does not also pay for the mastery/profile/activity fan-out it never uses.
  if (path === 'mcp/attempts') {
    return json(await loadAttemptsProjection(client, user.id, now), {
      headers: privateHeaders(),
    });
  }

  const projection = await loadDailyLearningProjection(client, user.id, now);
  if (path === 'mcp/daily') {
    return json(
      {
        schemaVersion: projection.schemaVersion,
        generatedAt: projection.generatedAt,
        priority: projection.priority,
        tracking: projection.tracking,
      },
      { headers: privateHeaders() }
    );
  }
  if (path === 'mcp/progress') {
    return json(
      {
        schemaVersion: projection.schemaVersion,
        generatedAt: projection.generatedAt,
        progress: projection.progress,
        tracking: projection.tracking,
      },
      { headers: privateHeaders() }
    );
  }
  if (path === 'mcp/verification') {
    return json(buildCurrentLearningVerification(projection), { headers: privateHeaders() });
  }
  return json({ error: 'API route not found' }, { status: 404, headers: privateHeaders() });
}
