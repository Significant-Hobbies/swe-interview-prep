/**
 * Native, stateless MCP server (Streamable HTTP, JSON responses) for the
 * adaptive learning record. The SaaS Maker gateway performs OAuth and forwards
 * the Auth0 access token; this product verifies it again, maps the Google
 * subject to the linked account and enforces read/write scopes per tool.
 */
import {
  SWE_INTERVIEW_PREP_WRITE_SCOPE,
  verifySweInterviewPrepAuth0Grant,
} from '../lib/auth0-mcp.mjs';
import { LearningRecordError, sha256Hex, stableStringify, validate } from './schema.mjs';
import * as store from './store.mjs';
import { receiptRef, replayReceipt, requireTool, toolList } from './tools.mjs';

const SUPPORTED_PROTOCOLS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const MAX_BODY_BYTES = 256_000;
const MAX_AUTHORIZATION_BYTES = 20_000;

const SERVER_INSTRUCTIONS = [
  'SWE Interview Prep is the durable learning record: profile, knowledge state, personalized courses, learning sessions, external resources, assessments and curriculum gaps. You are the teacher, assessor and course designer.',
  'Start with get_learning_profile and get_daily_learning_priority. Search the curriculum before inventing structure; free-text topics are fine when it lacks coverage (also call report_curriculum_gap, then keep teaching).',
  'Record every meaningful session with start_learning_session (course lessons, reading or discussing a shared article, exploration). Append questions, insights, misconceptions and unresolved questions as you go; finish with complete_learning_session.',
  'When the learner shares a link, pass it in resources on the session (or save_learning_resource); it is deduplicated by canonical URL.',
  'Only submit_assessment changes assessed knowledge. Untouched means unassessed, not beginner: probe before teaching. Reading, discussing or finishing a lesson never equals mastery.',
  'Always send a fresh idempotencyKey with each new mutation and reuse it when retrying the same call.',
  'Socratic, answer-free checks are available with get_current_learning_check. Never reveal stored review answers.',
].join(' ');

function headers(extra = {}) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'private, no-store',
    pragma: 'no-cache',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    ...extra,
  };
}

function rpcResult(id, result) {
  return new Response(JSON.stringify({ jsonrpc: '2.0', id, result }), {
    status: 200,
    headers: headers(),
  });
}

function rpcError(status, id, code, message, data) {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      id: id ?? null,
      error: { code, message, ...(data ? { data } : {}) },
    }),
    { status, headers: headers() }
  );
}

function toolResult(payload, isError = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    structuredContent: payload,
    ...(isError ? { isError: true } : {}),
  };
}

function toolError(error) {
  if (error instanceof LearningRecordError) {
    return toolResult(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      true
    );
  }
  console.error('MCP tool failed', error);
  return toolResult(
    {
      error: {
        code: 'internal_error',
        message:
          'The learning record could not complete this request. Retry with the same idempotencyKey; if that reports the request as in progress, read the current state before sending the change again with a new key.',
      },
    },
    true
  );
}

function bearerToken(request) {
  const value = request.headers.get('authorization');
  if (!value || value.length > MAX_AUTHORIZATION_BYTES) return null;
  return /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/u.exec(value)?.[1] ?? null;
}

async function authenticate(request, env, client, verifyGrant) {
  const token = bearerToken(request);
  if (!token) return { error: [401, 'OAuth authorization is required.'] };
  const grant = await verifyGrant(token, env);
  if (!grant?.googleId) return { error: [401, 'The access token is invalid or expired.'] };
  const result = await client.execute({
    sql: 'SELECT id, email FROM users WHERE google_id = ? LIMIT 1',
    args: [grant.googleId],
  });
  const user = result.rows[0];
  if (!user) {
    return {
      error: [
        403,
        'No SWE Interview Prep account is linked to this Google account. Sign in once at https://learn.significanthobbies.com.',
      ],
    };
  }
  if (
    env.OWNER_EMAIL &&
    String(user.email).toLowerCase() !== String(env.OWNER_EMAIL).toLowerCase()
  ) {
    return { error: [403, 'This learning workspace is private.'] };
  }
  return { user, scopes: new Set(grant.scopes ?? []) };
}

/**
 * Replay a completed request. Receipts hold only references to the records a
 * mutation touched, and the replay re-reads them, so a record deleted since
 * then can never be replayed and no learner content lives in receipts.
 */
async function replayFromReceipt(receipt, name, hash, ctx) {
  if (receipt.tool !== name || receipt.request_hash !== hash) {
    throw new LearningRecordError(
      'idempotency_conflict',
      'This idempotencyKey was already used for a different request. Generate a new key for a new mutation.'
    );
  }
  if (receipt.state !== 'complete') {
    throw new LearningRecordError(
      'idempotency_in_progress',
      'A request with this idempotencyKey is still running or stopped before finishing. Retry shortly; if it stays in progress, read the current state and, only if the change is missing, send it again with a new idempotencyKey.'
    );
  }
  return {
    ...(await replayReceipt(JSON.parse(receipt.response_json), ctx)),
    idempotentReplay: true,
  };
}

async function callTool({ params, auth, client, now, clientName }) {
  const name = params?.name;
  const tool = requireTool(name);
  const args = validate(tool.inputSchema, params?.arguments ?? {});
  if (tool.mutation && !auth.scopes.has(SWE_INTERVIEW_PREP_WRITE_SCOPE)) {
    throw new LearningRecordError(
      'insufficient_scope',
      `${name} changes the learning record and needs the ${SWE_INTERVIEW_PREP_WRITE_SCOPE} permission. Reconnect and grant write access.`
    );
  }
  const userId = auth.user.id;
  const ctx = { db: client, userId, now, clientName };
  if (!tool.mutation || !args.idempotencyKey) return tool.handler(args, ctx);

  const { idempotencyKey, ...rest } = args;
  const hash = await sha256Hex(`${name}:${stableStringify(rest)}`);
  const receipt = await store.reserveReceipt(client, userId, idempotencyKey, name, hash, now);
  if (receipt) return replayFromReceipt(receipt, name, hash, ctx);
  // Seeds are namespaced by tool so distinct keys can never alias one record.
  const writes = { changed: false };
  const seeded = {
    ...ctx,
    db: trackChanges(client, writes),
    idempotencySeed: `${name}:${idempotencyKey}`,
  };
  let response;
  try {
    response = await tool.handler(rest, seeded);
  } catch (error) {
    // The key is reusable only when the failed request is known to have
    // changed nothing. After any write that may have committed, the
    // reservation stays and a retry is told to re-read, so it can never
    // re-apply the mutation over a newer edit.
    if (!writes.changed) await store.releaseReceipt(client, userId, idempotencyKey);
    throw error;
  }
  await store.completeReceipt(client, userId, idempotencyKey, receiptRef(name, response, now));
  return response;
}

/**
 * A database client that records whether a write may have committed. A write
 * counts as soon as it is attempted: if the call then rejects, its outcome is
 * unknown (the commit may have landed and only the acknowledgment was lost).
 * Only a write that resolved reporting zero changed rows is known to be a no-op.
 */
function trackChanges(client, writes) {
  const isWrite = (statement) => /^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/iu.test(statement.sql);
  const run = async (statements, call) => {
    const writing = statements.some(isWrite);
    const previous = writes.changed;
    if (writing) writes.changed = true;
    const results = await call();
    if (writing && !previous) {
      writes.changed = results.some(
        (result, index) => isWrite(statements[index]) && result.rowsAffected > 0
      );
    }
    return results;
  };
  return {
    ...client,
    execute: async (statement) =>
      (await run([statement], async () => [await client.execute(statement)]))[0],
    batch: async (statements) => run(statements, () => client.batch(statements)),
  };
}

/** Read at most MAX_BODY_BYTES from the request stream. */
async function readBoundedText(request) {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return null;
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

/** Parse one JSON-RPC message, or return an error response. */
async function readMessage(request) {
  const text = await readBoundedText(request);
  if (text === null) return { error: rpcError(413, null, -32600, 'Request body is too large.') };
  let message;
  try {
    message = JSON.parse(text);
  } catch {
    return { error: rpcError(400, null, -32700, 'Invalid JSON-RPC payload.') };
  }
  const valid =
    message &&
    typeof message === 'object' &&
    !Array.isArray(message) &&
    message.jsonrpc === '2.0' &&
    typeof message.method === 'string';
  if (!valid)
    return { error: rpcError(400, null, -32600, 'Send one JSON-RPC 2.0 message per request.') };
  return { message };
}

function initializeResult(params) {
  const requested = params?.protocolVersion;
  return {
    protocolVersion: SUPPORTED_PROTOCOLS.includes(requested) ? requested : SUPPORTED_PROTOCOLS[0],
    capabilities: { tools: { listChanged: false } },
    serverInfo: {
      name: 'swe-interview-prep-learning',
      title: 'SWE Interview Prep',
      version: '2.0.0',
    },
    instructions: SERVER_INSTRUCTIONS,
  };
}

async function handleToolCall({ id, message, request, auth, client, now }) {
  try {
    const payload = await callTool({
      params: message.params,
      auth,
      client,
      now: now ?? new Date(),
      clientName: request.headers.get('x-mcp-client-name')?.slice(0, 100) ?? null,
    });
    return rpcResult(id, toolResult(payload));
  } catch (error) {
    const unknownTool =
      error instanceof LearningRecordError &&
      error.code === 'invalid_input' &&
      /^Unknown tool/u.test(error.message);
    if (unknownTool) return rpcError(200, id, -32602, error.message);
    return rpcResult(id, toolError(error));
  }
}

export async function handleLearningMcpRequest({
  request,
  env,
  client,
  verifyGrant = verifySweInterviewPrepAuth0Grant,
  now,
}) {
  if (request.method !== 'POST')
    return rpcError(405, null, -32000, 'Use POST with a JSON-RPC message.');
  // Authenticate from headers before reading any body.
  const auth = await authenticate(request, env, client, verifyGrant);
  if (auth.error) return rpcError(auth.error[0], null, -32001, auth.error[1]);
  const { message, error } = await readMessage(request);
  if (error) return error;
  const id = message.id;
  if (id === undefined)
    return new Response(null, { status: 202, headers: { 'cache-control': 'no-store' } });
  if (message.method === 'initialize') return rpcResult(id, initializeResult(message.params));
  if (message.method === 'ping') return rpcResult(id, {});
  if (message.method === 'tools/list') return rpcResult(id, { tools: toolList() });
  if (message.method === 'tools/call')
    return handleToolCall({ id, message, request, auth, client, now });
  return rpcError(200, id, -32601, `Method "${message.method}" is not supported.`);
}
