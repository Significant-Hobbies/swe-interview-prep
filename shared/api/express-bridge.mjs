import { clearRequestDb, setRequestDb } from '../db/client.mjs';

/**
 * Run an Express-style handler (req, res) inside a Fetch/worker context.
 */
export async function runExpressHandler(handler, ctx) {
  const { request, client, user } = ctx;
  const url = new URL(request.url);

  let body = {};
  const contentType = request.headers.get('content-type') || '';
  if (request.method !== 'GET' && request.method !== 'HEAD' && contentType.includes('json')) {
    try {
      body = await request.json();
    } catch {
      body = {};
    }
  }

  const req = {
    method: request.method,
    query: Object.fromEntries(url.searchParams.entries()),
    body,
    headers: {
      authorization: request.headers.get('authorization') || undefined,
      cookie: request.headers.get('cookie') || undefined,
    },
    _authenticatedUser: user || null,
  };

  let statusCode = 200;
  let payload = null;
  let settled = false;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      payload = data;
      settled = true;
    },
    end() {
      settled = true;
    },
  };

  setRequestDb(client);
  try {
    await handler(req, res);
    if (!settled) {
      statusCode = 500;
      payload = { error: 'Handler did not respond' };
    }
    return { status: statusCode, body: payload };
  } finally {
    clearRequestDb();
  }
}