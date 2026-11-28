// @vitest-environment node
// Regressions for the sixth independent review (of the fifth-round fixes).
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { contributionGuide } from './curriculum.mjs';
import { createMcpHarness } from './mcp-test-harness.mjs';
import { topicKey } from './schema.mjs';

let h;
let keySeq = 0;
const key = (label) => `${label}-key-${(keySeq += 1).toString().padStart(4, '0')}`;
const matches = (pattern) => (sql) => pattern.test(sql);

beforeEach(() => {
  h = createMcpHarness();
});

afterEach(() => h.close());

async function race(pattern, first, during) {
  const gate = h.pauseOnce(matches(pattern));
  const pending = first();
  await gate.reached;
  const middle = await during();
  gate.release();
  return { first: await pending, middle };
}

const startSession = (extra = {}) =>
  h.ok('start_learning_session', { title: 'S', idempotencyKey: key('session'), ...extra });

const saveResource = (extra = {}) =>
  h.ok('save_learning_resource', {
    url: 'https://example.com/private/a?share=x',
    title: 'A',
    ...extra,
  });

function assessIn(sessionId, topic) {
  return h.ok('submit_assessment', {
    subject: { topic },
    sessionId,
    method: 'exercise',
    evaluation: 'E',
    demonstratedLevel: 'intermediate',
    outcome: 'newly-learned',
    idempotencyKey: key('a'),
  });
}

async function exposure(topic) {
  return (await h.ok('get_knowledge_state', { subjects: [{ topic }] })).items[0].exposureCount;
}

describe('deleted resources stay deleted', () => {
  for (const tool of ['update_learning_session', 'complete_learning_session']) {
    it(`${tool} does not recreate a resource deleted while it attaches it`, async () => {
      const { resource } = await saveResource();
      const { session } = await startSession();
      const { first } = await race(
        /UPDATE learning_sessions SET kind/u,
        () =>
          h.call(tool, {
            sessionId: session.id,
            append: { resources: [{ url: resource.url, title: 'A', notes: 'pending note' }] },
          }),
        () => h.ok('delete_learning_record', { entity: 'resource', id: resource.id })
      );
      expect(first.error.code).toBe('version_conflict');
      expect(h.count('learning_resources')).toBe(0);
    });
  }

  it('reports a conflict instead of answering with a replacement resource', async () => {
    const { resource } = await saveResource();
    const { first } = await race(
      /INSERT INTO learning_resources/u,
      () => h.call('save_learning_resource', { url: resource.url, status: 'completed' }),
      async () => {
        await h.ok('delete_learning_record', { entity: 'resource', id: resource.id });
        return saveResource();
      }
    );
    expect(first.error.code).toBe('version_conflict');
    const { items } = await h.ok('list_learning_resources', {});
    expect(items.map((item) => item.status)).toEqual(['saved']);
  });

  it('keeps no copy of a deleted resource URL', async () => {
    const { resource } = await saveResource();
    await h.ok('delete_learning_record', { entity: 'resource', id: resource.id });
    const rows = h.database.prepare('SELECT * FROM learning_resource_deletions').all();
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows)).not.toMatch(/example\.com|share=x/u);
  });
});

describe('history search', () => {
  it('does not match derived topic keys in text search', async () => {
    await startSession({ title: 'Reading' });
    expect((await h.ok('get_learning_history', { q: 'topic' })).items).toHaveLength(0);
  });
});

describe('exposure credits', () => {
  it('counts a subject once when it was an interest signal and is assessed after completion', async () => {
    const { session } = await startSession({
      interestSignals: [{ subject: { topic: 'Gossip' }, interest: 'high' }],
    });
    await h.ok('complete_learning_session', { sessionId: session.id });
    await assessIn(session.id, 'Gossip');
    expect(await exposure('Gossip')).toBe(1);
  });

  it('does not recount when an assessment is deleted and recorded again', async () => {
    const { session } = await startSession();
    const { assessment } = await assessIn(session.id, 'Quorums');
    await h.ok('complete_learning_session', { sessionId: session.id });
    await h.ok('delete_learning_record', { entity: 'assessment', id: assessment.id });
    await assessIn(session.id, 'Quorums');
    expect(await exposure('Quorums')).toBe(1);
  });

  it('counts a topic appended after completion once it is assessed', async () => {
    const { session } = await startSession();
    await h.ok('complete_learning_session', { sessionId: session.id });
    await h.ok('update_learning_session', {
      sessionId: session.id,
      append: { topics: ['Leases'] },
    });
    await assessIn(session.id, 'Leases');
    expect(await exposure('Leases')).toBe(1);
  });
});

describe('topic identity', () => {
  it('rejects topics with lone surrogates instead of merging them', async () => {
    expect(() => topicKey('Topic \uD800')).toThrow(/valid Unicode/u);
    const result = await h.call('submit_assessment', {
      subject: { topic: 'Topic \uD801' },
      method: 'exercise',
      evaluation: 'E',
      demonstratedLevel: 'intermediate',
      outcome: 'newly-learned',
      idempotencyKey: key('a'),
    });
    expect(result.error.code).toBe('invalid_input');
  });

  it('treats Greek final sigma as the same letter', async () => {
    expect(topicKey('ΟΔΟΣ')).toBe(topicKey('οδοσ'));
    await startSession({ topics: ['Σ'] });
    expect((await h.ok('get_learning_history', { topic: 'ς' })).items).toHaveLength(1);
  });
});

describe('curriculum guide', () => {
  it('reports practice that belongs to another concept', () => {
    const guide = contributionGuide({
      topic: 'CRDT garbage collection',
      gapKind: 'missing',
      description: 'Not covered',
      proposedConcept: {
        tags: ['search-ir'],
        drills: ['build-tokenizer'],
        reviewQuestions: ['rq-tokenization-symmetry'],
      },
    });
    expect(guide.problems.join(' ')).toMatch(/belong to other concepts/u);
  });
});
