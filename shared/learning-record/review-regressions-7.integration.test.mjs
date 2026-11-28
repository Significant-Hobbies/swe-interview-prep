// @vitest-environment node
// Regressions for the seventh independent review (of the sixth-round fixes).
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { contributionGuide } from './curriculum.mjs';
import { createMcpHarness } from './mcp-test-harness.mjs';

let h;
let keySeq = 0;
const key = (label) => `${label}-key-${(keySeq += 1).toString().padStart(4, '0')}`;
const matches = (pattern) => (sql) => pattern.test(sql);

beforeEach(() => {
  h = createMcpHarness();
});

afterEach(() => h.close());

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

describe('exposure credits', () => {
  it('counts exposure again after the subject is deleted and re-assessed', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'S',
      idempotencyKey: key('s'),
    });
    await h.ok('complete_learning_session', { sessionId: session.id });
    await assessIn(session.id, 'Vector clocks');
    await h.ok('delete_learning_record', {
      entity: 'knowledge-state',
      subject: { topic: 'Vector clocks' },
    });
    await assessIn(session.id, 'Vector clocks');
    const state = (await h.ok('get_knowledge_state', { subjects: [{ topic: 'Vector clocks' }] }))
      .items[0];
    expect(state.exposureCount).toBe(1);
    expect(state.lastEngagedAt).not.toBeNull();
  });
});

describe('resource identity', () => {
  it('does not recreate a URL saved and deleted right after a save read its identity', async () => {
    const url = 'https://example.com/raced';
    const gate = h.pauseAfterOnce(matches(/\(SELECT id FROM learning_resources/u));
    const pending = h.call('save_learning_resource', { url, title: 'Raced' });
    await gate.reached;
    const other = await h.ok('save_learning_resource', { url, title: 'Other' });
    await h.ok('delete_learning_record', { entity: 'resource', id: other.resource.id });
    gate.release();
    const result = await pending;
    expect(result.error.code).toBe('version_conflict');
    expect(h.count('learning_resources')).toBe(0);
  });

  it("answers a save with its own write, not a later writer's", async () => {
    const url = 'https://example.com/answer';
    await h.ok('save_learning_resource', { url, title: 'A' });
    const gate = h.pauseAfterOnce(matches(/INSERT INTO learning_resources/u));
    const pending = h.ok('save_learning_resource', { url, topics: ['First'] });
    await gate.reached;
    await h.ok('save_learning_resource', { url, status: 'completed', topics: ['Second'] });
    gate.release();
    const first = await pending;
    expect(first.resource.version).toBe(2);
    expect(first.resource.status).toBe('saved');
    expect(first.created).toBe(false);
    const stored = await h.ok('get_learning_resource', { url });
    expect(stored.resource.version).toBe(3);
    expect(stored.resource.topics).toEqual(['First', 'Second']);
  });
});

describe('history search', () => {
  it('matches session text, not JSON field names', async () => {
    await h.ok('start_learning_session', {
      title: 'Reading',
      topics: ['Gossip'],
      idempotencyKey: key('s'),
    });
    expect((await h.ok('get_learning_history', { q: 'topics' })).items).toHaveLength(0);
    expect((await h.ok('get_learning_history', { q: 'Gossip' })).items).toHaveLength(1);
  });

  it('rejects text with NUL characters, which stored-text search could not match', async () => {
    const result = await h.call('start_learning_session', {
      title: 'packet\u0000tail',
      idempotencyKey: key('s'),
    });
    expect(result.error.code).toBe('invalid_input');
  });
});

describe('curriculum guide', () => {
  it('names a missing review question even when it looks like a drill id', () => {
    const guide = contributionGuide({
      topic: 'Hinted handoff',
      gapKind: 'missing',
      description: 'Not covered',
      proposedConcept: { tags: ['search-ir'], reviewQuestions: ['drill-nonexistent-review'] },
    });
    expect(guide.problems.join(' ')).toMatch(/drill-nonexistent-review/u);
  });
});
