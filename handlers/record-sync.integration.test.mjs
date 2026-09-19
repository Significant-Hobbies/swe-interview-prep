// @vitest-environment node
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import drills from './drills.mjs';
import artifacts from './artifacts.mjs';
import projects from './projects.mjs';
import { setRequestDb } from '../shared/db/client.mjs';
import { createD1Client } from '../shared/db/d1-client.mjs';
import { RecordSyncStore } from '../src/lib/recordSync';
const config = {
  localKey: 'test-drills',
  action: 'drills',
  field: 'drills',
  toPayload: (drillId, entry) => ({
    drillId,
    ...entry,
  }),
};
const content = (lastCode) => ({ status: 'solved', lastCode });
const handlers = { drills, artifacts, projects };
let database;
let account = 'alice';
let stores;
let storage;
function store(user = 'alice') {
  const result = new RecordSyncStore(config, user);
  stores.push(result);
  return result;
}
function savedEnvelope(user = 'alice') {
  return JSON.parse(storage.get(`test-drills:account:${encodeURIComponent(user)}:v1`) || 'null');
}
async function network(url, init = {}) {
  const action = new URL(String(url), 'http://local').searchParams.get('action');
  return handlers[action]({
    request: new Request(new URL(String(url), 'http://local'), init),
    user: { id: account },
    json: (body, options = {}) =>
      new Response(JSON.stringify(body), {
        ...options,
        headers: { 'content-type': 'application/json' },
      }),
  });
}
beforeEach(() => {
  account = 'alice';
  stores = [];
  storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  });
  database = new DatabaseSync(':memory:');
  for (const migration of ['0001_initial.sql', '0003_record_sync_receipts.sql']) {
    database.exec(readFileSync(new URL(`../migrations/d1/${migration}`, import.meta.url), 'utf8'));
  }
  database.exec(
    "INSERT INTO users (id,google_id,email,name) VALUES ('alice','alice','alice@example.invalid','Alice'), ('bob','bob','bob@example.invalid','Bob')"
  );
  const binding = {
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
        const result = statements.map((statement) => statement.execute());
        database.exec('COMMIT');
        return result;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    },
  };
  setRequestDb(createD1Client(binding));
  vi.stubGlobal('fetch', vi.fn(network));
});
afterEach(() => {
  for (const item of stores) item.setActive(false);
  database.close();
  vi.unstubAllGlobals();
});
it('retains adopted operations when storage fails before the merged envelope is durable', () => {
  const surviving = store();
  const closedTab = store();
  closedTab.set('other-tab', content('must survive'));
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: () => {
      throw new Error('quota exceeded');
    },
  });
  surviving.set('own-edit', content('also retained'));
  expect(surviving.getSnapshot().status).toBe('failed');
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  });
  surviving.retry();
  expect(
    savedEnvelope()
      .pending.map((operation) => operation.id)
      .sort()
  ).toEqual(['other-tab', 'own-edit']);
  expect(surviving.getSnapshot().pending).toHaveLength(2);
});

it('retains failed writes through reload and retries a lost acknowledgment without duplicate attempts', async () => {
  let fail = true;
  let loseAcknowledgment = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      if (init?.method === 'POST' && fail) return new Response('', { status: 503 });
      const response = await network(url, init);
      if (init?.method === 'POST' && loseAcknowledgment)
        throw new Error('Connection lost after commit');
      return response;
    })
  );
  const first = store();
  first.set('synthetic', content('new local code'));
  first.setActive(true);
  await vi.waitFor(() => expect(first.getSnapshot().status).toBe('failed'));
  first.setActive(false);
  fail = false;
  loseAcknowledgment = true;
  const reloaded = store();
  reloaded.setActive(true);
  await vi.waitFor(() => expect(reloaded.getSnapshot().status).toBe('failed'));
  expect(reloaded.getSnapshot().data.synthetic.lastCode).toBe('new local code');
  loseAcknowledgment = false;
  reloaded.retry();
  await vi.waitFor(() => expect(reloaded.getSnapshot().status).toBe('synced'));
  expect(database.prepare('SELECT attempts,last_code FROM user_drills').get()).toMatchObject({
    attempts: 1,
    last_code: 'new local code',
  });
  expect(database.prepare('SELECT COUNT(*) AS n FROM activity_log').get()?.n).toBe(1);
  expect(reloaded.getSnapshot().pending).toHaveLength(0);
});
it('serializes delayed writes and never lets an old GET or acknowledgment overwrite newer pending edits', async () => {
  let release;
  const delayed = new Promise((resolve) => {
    release = resolve;
  });
  let firstPost = true;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      const response = await network(url, init);
      if (init?.method === 'POST' && firstPost) {
        firstPost = false;
        await delayed;
      }
      return response;
    })
  );
  const current = store();
  current.set('synthetic', content('first'));
  current.setActive(true);
  await vi.waitFor(() => expect(firstPost).toBe(false));
  current.set('synthetic', content('second'));
  await current.reconcile();
  expect(current.getSnapshot().data.synthetic.lastCode).toBe('second');
  release();
  await vi.waitFor(() => expect(current.getSnapshot().status).toBe('synced'));
  expect(database.prepare('SELECT attempts,last_code FROM user_drills').get()).toMatchObject({
    attempts: 2,
    last_code: 'second',
  });
});
it('keeps accounts separate and refuses a pending Alice write under a Bob cookie', async () => {
  const alice = store();
  alice.set('synthetic', content('alice-only'));
  const bob = store('bob');
  expect(bob.getSnapshot().data).toEqual({});
  account = 'bob';
  alice.setActive(true);
  await vi.waitFor(() => expect(alice.getSnapshot().status).toBe('failed'));
  expect(database.prepare('SELECT COUNT(*) AS n FROM user_drills').get()?.n).toBe(0);
  alice.setActive(false);
  account = 'alice';
  alice.setActive(true);
  await vi.waitFor(() => expect(alice.getSnapshot().status).toBe('synced'));
  expect(database.prepare('SELECT user_id FROM user_drills').get()?.user_id).toBe('alice');
});
it.each([
  ['artifacts', { artifactId: 'a', status: 'done', notes: 'keep' }],
  ['projects', { projectId: 'p', status: 'active', nextAction: 'keep' }],
])(
  'deduplicates %s writes using the actual handler and receipt transaction',
  async (action, entry) => {
    const init = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...entry, operationId: 'same-operation', accountId: 'alice' }),
    };
    expect((await network(`/api/learning?action=${action}`, init)).status).toBe(200);
    expect((await network(`/api/learning?action=${action}`, init)).status).toBe(200);
    expect(database.prepare('SELECT COUNT(*) AS n FROM record_sync_receipts').get()?.n).toBe(1);
  }
);
it('keeps unsaved changes visible and does not POST until browser storage succeeds', async () => {
  const current = store();
  const save = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error('Quota exceeded');
  };
  current.set('synthetic', content('retain in memory'));
  current.setActive(true);
  await vi.waitFor(() => expect(current.getSnapshot().status).toBe('failed'));
  expect(current.getSnapshot().error).toContain('not saved in this browser');
  expect(database.prepare('SELECT COUNT(*) AS n FROM user_drills').get()?.n).toBe(0);
  expect(current.getSnapshot().data.synthetic.lastCode).toBe('retain in memory');
  localStorage.setItem = save;
  current.retry();
  await vi.waitFor(() => expect(current.getSnapshot().status).toBe('synced'));
  expect(database.prepare('SELECT attempts FROM user_drills').get()?.attempts).toBe(1);
});
it('ignores a stale GET released after the latest write has committed', async () => {
  let release;
  const delay = new Promise((resolve) => {
    release = resolve;
  });
  let delayGet = true;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      const response = await network(url, init);
      if (init?.method !== 'POST' && delayGet) {
        delayGet = false;
        await delay;
      }
      return response;
    })
  );
  const current = store();
  current.setActive(true);
  await vi.waitFor(() => expect(delayGet).toBe(false));
  current.set('synthetic', content('new code'));
  await current.flush();
  release();
  await vi.waitFor(() => expect(current.getSnapshot().status).toBe('synced'));
  expect(current.getSnapshot().data.synthetic.lastCode).toBe('new code');
  expect(database.prepare('SELECT attempts FROM user_drills').get()?.attempts).toBe(1);
});
it('rolls back the record and receipt together when the activity write fails', async () => {
  database.exec(
    "CREATE TRIGGER reject_activity BEFORE INSERT ON activity_log BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END"
  );
  const init = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      drillId: 'synthetic',
      ...content('atomic'),
      operationId: 'transaction',
      accountId: 'alice',
    }),
  };
  await expect(network('/api/learning?action=drills', init)).rejects.toThrow('synthetic failure');
  expect(database.prepare('SELECT COUNT(*) AS n FROM user_drills').get()?.n).toBe(0);
  expect(database.prepare('SELECT COUNT(*) AS n FROM record_sync_receipts').get()?.n).toBe(0);
  database.exec('DROP TRIGGER reject_activity');
  expect((await network('/api/learning?action=drills', init)).status).toBe(200);
  expect(database.prepare('SELECT attempts FROM user_drills').get()?.attempts).toBe(1);
});
it("delivers a dead tab's pending write after reconnect instead of dropping it", async () => {
  let offline = true;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      if (init?.method === 'POST' && offline) return new Response('', { status: 503 });
      return network(url, init);
    })
  );
  const tabA = store();
  const tabB = store();
  tabA.set('first-tab', content('code from tab A'));
  tabB.set('second-tab', content('code from tab B'));
  tabA.setActive(true);
  tabB.setActive(true);
  await vi.waitFor(() => {
    expect(tabA.getSnapshot().status).toBe('failed');
    expect(tabB.getSnapshot().status).toBe('failed');
  });
  // Both tabs' undelivered operations must survive in the shared envelope.
  const queued = savedEnvelope();
  expect(queued.pending).toHaveLength(2);
  expect(queued.data['first-tab'].lastCode).toBe('code from tab A');
  expect(queued.data['second-tab'].lastCode).toBe('code from tab B');
  // Tab A closes with its edit still undelivered; only tab B stays open.
  tabA.setActive(false);
  offline = false;
  tabB.retry();
  await vi.waitFor(() => expect(tabB.getSnapshot().status).toBe('synced'));
  expect(
    database
      .prepare('SELECT drill_id, last_code, attempts FROM user_drills ORDER BY drill_id')
      .all()
  ).toEqual([
    { drill_id: 'first-tab', last_code: 'code from tab A', attempts: 1 },
    { drill_id: 'second-tab', last_code: 'code from tab B', attempts: 1 },
  ]);
  expect(database.prepare('SELECT COUNT(*) AS n FROM record_sync_receipts').get()?.n).toBe(2);
  expect(database.prepare('SELECT COUNT(*) AS n FROM activity_log').get()?.n).toBe(2);
  // A reload inherits a clean envelope and hydrates both records remotely.
  const reloaded = store();
  expect(reloaded.getSnapshot().pending).toHaveLength(0);
  reloaded.setActive(true);
  await vi.waitFor(() => expect(reloaded.getSnapshot().status).toBe('synced'));
  expect(reloaded.getSnapshot().data['first-tab'].lastCode).toBe('code from tab A');
  expect(reloaded.getSnapshot().data['second-tab'].lastCode).toBe('code from tab B');
});
it('serializes same-record writes from two tabs without losing or duplicating attempts', async () => {
  const tabA = store();
  const tabB = store();
  tabA.set('shared', content('version from tab A'));
  tabB.set('shared', content('version from tab B'));
  tabA.setActive(true);
  await vi.waitFor(() => expect(tabA.getSnapshot().status).toBe('synced'));
  tabB.setActive(true);
  await vi.waitFor(() => {
    expect(tabA.getSnapshot().status).toBe('synced');
    expect(tabB.getSnapshot().status).toBe('synced');
  });
  // Every queued edit is one real attempt; receipts stop any double-count.
  expect(database.prepare('SELECT attempts, last_code FROM user_drills').get()).toMatchObject({
    attempts: 2,
  });
  expect(database.prepare('SELECT COUNT(*) AS n FROM record_sync_receipts').get()?.n).toBe(2);
  expect(database.prepare('SELECT COUNT(*) AS n FROM activity_log').get()?.n).toBe(2);
  // A fresh tab converges to exactly what the server recorded.
  const reloaded = store();
  reloaded.setActive(true);
  await vi.waitFor(() => expect(reloaded.getSnapshot().status).toBe('synced'));
  const committed = database.prepare('SELECT last_code FROM user_drills').get()?.last_code;
  expect(reloaded.getSnapshot().data.shared.lastCode).toBe(committed);
  expect(['version from tab A', 'version from tab B']).toContain(committed);
});
it('merges same-account writes from two devices through the server without loss', async () => {
  const deviceA = storage;
  const tabA = store();
  tabA.set('device-a', content('written on device A'));
  tabA.setActive(true);
  await vi.waitFor(() => expect(tabA.getSnapshot().status).toBe('synced'));
  // A second device has its own browser storage; the server is the merge point.
  storage = new Map();
  const tabB = store();
  expect(tabB.getSnapshot().data['device-a']).toBeUndefined();
  tabB.set('device-b', content('written on device B'));
  tabB.setActive(true);
  await vi.waitFor(() => expect(tabB.getSnapshot().status).toBe('synced'));
  expect(tabB.getSnapshot().data['device-a'].lastCode).toBe('written on device A');
  // Device A picks up the other device's committed record on its next reconcile.
  storage = deviceA;
  const backOnA = store();
  backOnA.setActive(true);
  await vi.waitFor(() => expect(backOnA.getSnapshot().status).toBe('synced'));
  expect(backOnA.getSnapshot().data['device-b'].lastCode).toBe('written on device B');
  expect(database.prepare('SELECT COUNT(*) AS n FROM user_drills').get()?.n).toBe(2);
  expect(database.prepare('SELECT COUNT(*) AS n FROM record_sync_receipts').get()?.n).toBe(2);
});
it('commits an in-flight write under the original account through sign-out and deduplicates its retry', async () => {
  let release;
  const delayed = new Promise((resolve) => {
    release = resolve;
  });
  let posted = false;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      // The handler runs under the cookie that was present when the request
      // was sent; only the response is delayed past the sign-out.
      const response = network(url, init);
      if (init?.method === 'POST') {
        posted = true;
        await delayed;
      }
      return response;
    })
  );
  const aliceStore = store();
  aliceStore.set('in-flight', content('committed during sign-out'));
  aliceStore.setActive(true);
  await vi.waitFor(() => expect(posted).toBe(true));
  aliceStore.setActive(false);
  account = 'bob';
  release();
  await vi.waitFor(() =>
    expect(database.prepare('SELECT COUNT(*) AS n FROM user_drills').get()?.n).toBe(1)
  );
  const bob = store('bob');
  bob.setActive(true);
  await vi.waitFor(() => expect(bob.getSnapshot().status).toBe('synced'));
  expect(bob.getSnapshot().data).toEqual({});
  // The write landed once, under Alice; Bob sees and owns nothing.
  expect(database.prepare('SELECT user_id, attempts FROM user_drills').get()).toMatchObject({
    user_id: 'alice',
    attempts: 1,
  });
  // Alice's retained pending operation retries as a deduplicated no-op.
  account = 'alice';
  aliceStore.setActive(true);
  await vi.waitFor(() => expect(aliceStore.getSnapshot().status).toBe('synced'));
  expect(database.prepare('SELECT attempts FROM user_drills').get()?.attempts).toBe(1);
  expect(database.prepare('SELECT COUNT(*) AS n FROM activity_log').get()?.n).toBe(1);
  expect(database.prepare('SELECT COUNT(*) AS n FROM record_sync_receipts').get()?.n).toBe(1);
});
