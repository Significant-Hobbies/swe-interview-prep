// Test-only harness: the real D1 migrations in node:sqlite behind the D1
// client, driven through the MCP JSON-RPC endpoint with fake verified grants.
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { createD1Client } from '../db/d1-client.mjs';
import { handleLearningMcpRequest } from './mcp-server.mjs';

const GRANTS = {
  'alice.read.write': {
    googleId: 'g-alice',
    scopes: ['swe-interview-prep.read', 'swe-interview-prep.write'],
  },
  'alice.read.only': { googleId: 'g-alice', scopes: ['swe-interview-prep.read'] },
  'bob.read.write': {
    googleId: 'g-bob',
    scopes: ['swe-interview-prep.read', 'swe-interview-prep.write'],
  },
};

/** Cloudflare D1 rejects statements with more than 100 bound parameters. */
const D1_MAX_PARAMETERS = 100;

/**
 * Interleaving hooks: a test can pause the first statement matching a
 * predicate (to force a race ordering) or make one fail (to simulate a crash).
 */
async function runHook(hooks, sqls, after) {
  const index = hooks.findIndex(
    (hook) => Boolean(hook.after) === after && sqls.some((sql) => hook.predicate(sql))
  );
  if (index < 0) return;
  const [hook] = hooks.splice(index, 1);
  await hook.run();
}

function createHooks() {
  const hooks = [];
  return {
    pauseOnce(predicate) {
      let release;
      let reached;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      const arrived = new Promise((resolve) => {
        reached = resolve;
      });
      hooks.push({
        predicate,
        run: async () => {
          reached();
          await gate;
        },
      });
      return { reached: arrived, release: () => release() };
    },
    failOnce(predicate) {
      hooks.push({
        predicate,
        run: async () => {
          throw new Error('Injected D1 failure');
        },
      });
    },
    /** The statement commits, then the call rejects: a lost acknowledgment. */
    loseAckOnce(predicate) {
      hooks.push({
        predicate,
        after: true,
        run: async () => {
          throw new Error('Injected lost acknowledgment');
        },
      });
    },
    async before(sqls) {
      await runHook(hooks, sqls, false);
    },
    async after(sqls) {
      await runHook(hooks, sqls, true);
    },
  };
}

function d1Binding(db, hooks) {
  return {
    prepare(sql) {
      const statement = db.prepare(sql);
      const bound = (args) => ({
        sql,
        execute: () => {
          if (args.length > D1_MAX_PARAMETERS) {
            throw new Error(`D1 parameter limit exceeded: ${args.length}`);
          }
          return {
            results: statement.all(...args),
            meta: { changes: Number(db.prepare('SELECT changes() AS n').get()?.n) },
          };
        },
        all: async () => {
          await hooks.before([sql]);
          const result = bound(args).execute();
          await hooks.after([sql]);
          return result;
        },
        bind: (...values) => bound(values),
      });
      return bound([]);
    },
    async batch(statements) {
      await hooks.before(statements.map((statement) => statement.sql));
      db.exec('BEGIN');
      try {
        const result = statements.map((statement) => statement.execute());
        db.exec('COMMIT');
        await hooks.after(statements.map((statement) => statement.sql));
        return result;
      } catch (error) {
        if (db.isTransaction) db.exec('ROLLBACK');
        throw error;
      }
    },
  };
}

export function createMcpHarness() {
  const database = new DatabaseSync(':memory:');
  const dir = new URL('../../migrations/d1/', import.meta.url);
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()) {
    database.exec(readFileSync(new URL(file, dir), 'utf8'));
  }
  database.exec(`INSERT INTO users (id, google_id, email, name) VALUES
    ('alice', 'g-alice', 'alice@example.invalid', 'Alice'),
    ('bob', 'g-bob', 'bob@example.invalid', 'Bob')`);
  const hooks = createHooks();
  const harness = {
    database,
    client: createD1Client(d1Binding(database, hooks)),
    pauseOnce: hooks.pauseOnce,
    failOnce: hooks.failOnce,
    loseAckOnce: hooks.loseAckOnce,
    now: new Date('2026-11-28T09:00:00.000Z'),
    rpcId: 0,
    count: (table) => database.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n,
    async rpc(method, params, token = 'alice.read.write', env = {}) {
      harness.rpcId += 1;
      const response = await handleLearningMcpRequest({
        request: new Request('https://learn.example/api/mcp', {
          method: 'POST',
          headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: harness.rpcId, method, params }),
        }),
        env,
        client: harness.client,
        verifyGrant: async (value) => GRANTS[value] ?? null,
        now: harness.now,
      });
      return { status: response.status, body: await response.json() };
    },
    async call(name, args = {}, token = 'alice.read.write') {
      const { body } = await harness.rpc('tools/call', { name, arguments: args }, token);
      if (body.error) throw new Error(`${name}: ${body.error.message}`);
      return { ...body.result.structuredContent, isError: body.result.isError === true };
    },
    async ok(name, args, token) {
      const result = await harness.call(name, args, token);
      if (result.isError) throw new Error(`${name}: ${JSON.stringify(result.error)}`);
      return result;
    },
    close: () => database.close(),
  };
  return harness;
}
