// @vitest-environment node
import { createHmac, randomUUID } from 'node:crypto';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { backup, DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { onRequest } from '../../functions/api/[[path]].js';

const secret = 'synthetic-test-signing-key';
let database;
let env;
let databaseFile;

beforeEach(() => {
  databaseFile = undefined;
  database = new DatabaseSync(':memory:');
  for (const migration of ['0001_initial.sql', '0003_record_sync_receipts.sql']) {
    database.exec(
      readFileSync(new URL(`../../migrations/d1/${migration}`, import.meta.url), 'utf8')
    );
  }
  database.exec(
    "INSERT INTO users (id,google_id,email,name) VALUES ('alice','alice','alice@example.invalid','Alice'), ('bob','bob','bob@example.invalid','Bob'), ('owner','owner','owner@example.invalid','Synthetic owner')"
  );
  env = {
    JWT_SECRET: secret,
    OWNER_EMAIL: 'owner@example.invalid',
    DB: {
      prepare(sql) {
        const statement = database.prepare(sql);
        const bound = (args) => ({
          execute: () => ({
            results: statement.all(...args),
            meta: { changes: Number(database.prepare('SELECT changes() AS n').get()?.n) },
          }),
          all: async () => bound(args).execute(),
          bind: (...values) => bound(values),
        });
        return bound([]);
      },
      async batch(statements) {
        database.exec('BEGIN');
        try {
          const results = statements.map((statement) => statement.execute());
          database.exec('COMMIT');
          return results;
        } catch (error) {
          database.exec('ROLLBACK');
          throw error;
        }
      },
    },
  };
});
afterEach(() => {
  database.close();
  if (databaseFile && existsSync(databaseFile)) unlinkSync(databaseFile);
});

function request(action, user = 'alice', body = undefined, accountId = user, path = ['learning']) {
  const unsigned = [
    { alg: 'HS256', typ: 'JWT' },
    { userId: user, exp: Math.floor(Date.now() / 1000) + 600 },
  ]
    .map((value) => Buffer.from(JSON.stringify(value)).toString('base64url'))
    .join('.');
  const token = `${unsigned}.${createHmac('sha256', secret).update(unsigned).digest('base64url')}`;
  return onRequest({
    request: new Request(
      `https://prep.example.invalid/api/${path.join('/')}?action=${action}&accountId=${accountId}`,
      {
        method: body ? 'POST' : 'GET',
        headers: {
          ...(user ? { Cookie: `dsa_prep_auth=${token}` } : {}),
          'Content-Type': 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }
    ),
    env,
    params: { path },
  });
}

it.each(['artifacts', 'drills', 'projects'])(
  'allows a signed-in non-owner to read their own %s records',
  async (action) => {
    const response = await request(action);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ [action]: {} });
  }
);

it('persists non-owner records without exposing them to another account', async () => {
  const body = {
    accountId: 'alice',
    operationId: 'save-1',
    drillId: 'synthetic-drill',
    status: 'solved',
    lastCode: 'Alice private attempt',
  };
  expect((await request('drills', 'alice', body)).status).toBe(200);
  const own = await (await request('drills')).json();
  expect(own.drills['synthetic-drill'].lastCode).toBe(body.lastCode);
  expect(await (await request('drills', 'bob')).json()).toEqual({ drills: {} });
  expect((await request('drills', 'bob', body)).status).toBe(409);
  expect((await request('drills', 'bob', undefined, 'alice')).status).toBe(409);
});

it('retains owner-only learning and provider access and rejects anonymous record reads', async () => {
  expect((await request('concepts')).status).toBe(401);
  expect((await request('drills', '')).status).toBe(401);
  const response = await request('', 'alice', { messages: [] }, 'alice', ['ai', 'chat']);
  expect(response.status).toBe(403);
  expect((await request('', 'alice', undefined, 'alice', ['auth', 'verify'])).status).toBe(200);
});

it('retains signed-in owner mastery after reopening the backing database', async () => {
  databaseFile = join(tmpdir(), `swe-mastery-${randomUUID()}.sqlite`);
  await backup(database, databaseFile);
  database.close();
  database = new DatabaseSync(databaseFile);

  const initial = await request('concepts', 'owner');
  expect(initial.status).toBe(200);
  expect(await initial.json()).toEqual({ mastery: {} });
  const saved = await request('concepts', 'owner', {
    conceptId: 'tokenization',
    rating: 'good',
  });
  expect(saved.status).toBe(200);
  const { mastery } = await saved.json();
  expect(mastery.reps).toBe(1);
  expect(Number.isFinite(Date.parse(mastery.lastReview))).toBe(true);
  expect(Number.isFinite(Date.parse(mastery.due))).toBe(true);

  database.close();
  database = new DatabaseSync(databaseFile);
  const restored = await request('concepts', 'owner');
  expect(restored.status).toBe(200);
  const readback = await restored.json();
  expect(Object.keys(readback.mastery)).toEqual(['tokenization']);
  expect(readback.mastery.tokenization).toMatchObject({
    reps: mastery.reps,
    lapses: mastery.lapses,
    stability: mastery.stability,
    difficulty: mastery.difficulty,
    lastReview: mastery.lastReview,
    due: mastery.due,
  });
  expect((await request('concepts', 'alice')).status).toBe(401);
  expect((await request('concepts', '')).status).toBe(401);
});
