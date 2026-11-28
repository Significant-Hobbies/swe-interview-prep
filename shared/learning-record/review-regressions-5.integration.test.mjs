// @vitest-environment node
// Regressions for the fifth independent review (of the fourth-round fixes).
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

describe('idempotency', () => {
  it('keeps the reservation when a write commits but its acknowledgment is lost', async () => {
    const { resource } = await h.ok('save_learning_resource', {
      url: 'https://example.com/p',
      title: 'P',
    });
    const args = { resourceId: resource.id, set: { status: 'reading' }, idempotencyKey: key('r') };
    h.loseAckOnce(matches(/UPDATE learning_resources SET title/u));
    expect((await h.call('update_learning_resource', args)).isError).toBe(true);
    await h.ok('update_learning_resource', {
      resourceId: resource.id,
      set: { status: 'completed' },
    });
    expect((await h.call('update_learning_resource', args)).error.code).toBe(
      'idempotency_in_progress'
    );
    const current = await h.ok('get_learning_resource', { resourceId: resource.id });
    expect(current.resource.status).toBe('completed');
  });
});

describe('topic identity', () => {
  it('keeps distinct topics apart even when a weak hash would collide', () => {
    expect(topicKey('刔㐀')).not.toBe(topicKey('倔𱈀'));
  });

  it('finds sessions under a topic regardless of case or script normalization', async () => {
    await startSession({ topics: ['ΔΟΚΙΜΉ'] });
    expect((await h.ok('get_learning_history', { topic: 'ΔΟΚΙΜΉ' })).items).toHaveLength(1);
    expect((await h.ok('get_learning_history', { topic: 'δοκιμή' })).items).toHaveLength(1);
  });
});

describe('resources', () => {
  it('never lets a stale edit or override reach a re-saved URL', async () => {
    const saved = await h.ok('save_learning_resource', {
      url: 'https://example.com/a',
      title: 'A',
    });
    await h.ok('override_daily_learning_priority', {
      chosen: { objective: 'Read A', resourceId: saved.resource.id },
      reason: 'Focus',
      idempotencyKey: key('ovr'),
    });
    await h.ok('delete_learning_record', { entity: 'resource', id: saved.resource.id });
    const again = await h.ok('save_learning_resource', {
      url: 'https://example.com/a',
      title: 'A',
    });
    expect(again.resource.id).not.toBe(saved.resource.id);
    const stale = await h.call('update_learning_resource', {
      resourceId: saved.resource.id,
      expectedVersion: 1,
      set: { title: 'Stale' },
    });
    expect(stale.error.code).toBe('not_found');
    expect((await h.ok('get_daily_learning_priority', {})).source).toBe('computed');
  });

  it('does not start a session linking a resource deleted meanwhile', async () => {
    const { resource } = await h.ok('save_learning_resource', {
      url: 'https://example.com/b',
      title: 'B',
    });
    const { first } = await race(
      /INSERT INTO learning_sessions/u,
      () =>
        h.call('start_learning_session', {
          title: 'S',
          resourceIds: [resource.id],
          idempotencyKey: key('session'),
        }),
      () => h.ok('delete_learning_record', { entity: 'resource', id: resource.id })
    );
    expect(first.error.code).toBe('not_found');
    expect(h.count('learning_sessions')).toBe(0);
  });
});

describe('exposure', () => {
  it('counts an assessment that lands after its session completed, once', async () => {
    const { session } = await startSession();
    await race(
      /INSERT INTO learning_assessments/u,
      () =>
        h.ok('submit_assessment', {
          subject: { topic: 'Late topic' },
          sessionId: session.id,
          method: 'exercise',
          evaluation: 'E',
          demonstratedLevel: 'advanced',
          outcome: 'newly-learned',
          idempotencyKey: key('a'),
        }),
      () => h.ok('complete_learning_session', { sessionId: session.id, summary: 'Done' })
    );
    await h.ok('submit_assessment', {
      subject: { topic: 'Late topic' },
      sessionId: session.id,
      method: 'explain-back',
      evaluation: 'E',
      demonstratedLevel: 'advanced',
      outcome: 'previously-known',
      idempotencyKey: key('a'),
    });
    const state = (await h.ok('get_knowledge_state', { subjects: [{ topic: 'Late topic' }] }))
      .items[0];
    expect(state.exposureCount).toBe(1);
  });
});

describe('curriculum guide', () => {
  it('flags placeholder drills and references that do not resolve yet', () => {
    const guide = contributionGuide({
      topic: 'Bloom filter sizing',
      gapKind: 'missing',
      description: 'Not covered',
      proposedConcept: {
        tags: ['search-ir'],
        drills: ['drill-placeholder'],
        reviewQuestions: ['missing-review'],
      },
    });
    const text = guide.problems.join(' ');
    expect(text).toMatch(/drill-placeholder/u);
    expect(text).toMatch(/missing-review/u);
    expect(text).not.toMatch(/testCase[^s]/u);
  });
});
