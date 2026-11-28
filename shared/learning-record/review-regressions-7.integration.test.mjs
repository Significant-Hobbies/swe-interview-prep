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
  it('does not recreate a URL saved and deleted while a save was planning', async () => {
    const url = 'https://example.com/raced';
    const gate = h.pauseOnce(matches(/INSERT INTO learning_resources/u));
    const pending = h.call('save_learning_resource', { url, title: 'Raced' });
    await gate.reached;
    // The paused save planned generation 0. Another request saves and deletes
    // the URL before the paused write lands, retiring that generation-0 id.
    h.database
      .prepare(
        `INSERT INTO learning_resource_deletions (user_id, resource_id, url_fingerprint, deleted_at)
         SELECT 'alice', ?, 'fingerprint', '2026-11-28T00:00:00.000Z'`
      )
      .run(await plannedId(url));
    gate.release();
    const result = await pending;
    expect(result.error.code).toBe('version_conflict');
    expect(h.count('learning_resources')).toBe(0);
  });
});

/** The generation-0 id the store derives for a URL (same derivation as newId). */
async function plannedId(url) {
  const bytes = new TextEncoder().encode(`alice:res:${url}#0`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0'));
  return `res_${hex.join('').slice(0, 24)}`;
}

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
