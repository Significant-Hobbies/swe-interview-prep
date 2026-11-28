// @vitest-environment node
// Regressions for the third independent review. Interleavings are forced with
// the harness's pause hook; each test fails on the pre-fix source.
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

function assess(subject, extra = {}) {
  return h.ok('submit_assessment', {
    subject,
    method: 'exercise',
    evaluation: 'Evaluated',
    demonstratedLevel: 'intermediate',
    outcome: 'newly-learned',
    idempotencyKey: key('assess'),
    ...extra,
  });
}

async function gapById(id) {
  const { items } = await h.ok('list_curriculum_gaps', { limit: 50 });
  return items.find((item) => item.id === id);
}

async function race(pattern, first, during) {
  const gate = h.pauseOnce(matches(pattern));
  const pending = first();
  await gate.reached;
  const middle = await during();
  gate.release();
  return { first: await pending, middle };
}

function createCourse(lessons = [{ id: 'one', title: 'One' }]) {
  return h.ok('create_course', { title: 'C', objective: 'O', lessons, idempotencyKey: key('c') });
}

describe('writes that race a deletion', () => {
  it('does not create a session for a course deleted while it starts', async () => {
    const { course } = await createCourse();
    const { first } = await race(
      /INSERT INTO learning_sessions/u,
      () =>
        h.call('start_learning_session', {
          title: 'S',
          courseId: course.id,
          lessonId: 'one',
          idempotencyKey: key('s'),
        }),
      () => h.ok('delete_learning_record', { entity: 'course', id: course.id })
    );
    expect(first.isError).toBe(true);
    expect(first.error.code).toBe('not_found');
    expect(h.count('learning_sessions')).toBe(0);
  });

  it('does not store a target level for an assessment whose session was deleted', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'S',
      idempotencyKey: key('s'),
    });
    const { first } = await race(
      /INSERT INTO learning_assessments/u,
      () =>
        h.call('submit_assessment', {
          subject: { topic: 'Bloom filters' },
          sessionId: session.id,
          method: 'exercise',
          evaluation: 'E',
          demonstratedLevel: 'intermediate',
          outcome: 'newly-learned',
          targetLevel: 'expert',
          idempotencyKey: key('a'),
        }),
      () => h.ok('delete_learning_record', { entity: 'session', id: session.id, cascade: true })
    );
    expect(first.isError).toBe(true);
    expect(h.count('knowledge_states')).toBe(0);
  });
});

describe('curriculum gaps', () => {
  const report = (extra = {}) =>
    h.ok('report_curriculum_gap', {
      topic: 'Merkle trees',
      gapKind: 'missing',
      description: 'None',
      idempotencyKey: key('gap'),
      ...extra,
    });

  it('keeps a concurrent report when a status update lands', async () => {
    const { gap } = await report();
    await race(
      /UPDATE curriculum_gaps SET status/u,
      () => h.ok('update_curriculum_gap', { gapId: gap.id, status: 'proposed' }),
      () => report({ evidence: ['Second learner question'] })
    );
    const current = await gapById(gap.id);
    expect(current.status).toBe('proposed');
    expect(current.reportCount).toBe(2);
    expect(current.evidence).toContain('Second learner question');
  });

  it('never merges a report into a gap that was resolved meanwhile', async () => {
    const { gap } = await report();
    const { first } = await race(
      /UPDATE curriculum_gaps SET description/u,
      () => report({ evidence: ['After resolution'] }),
      () => h.ok('update_curriculum_gap', { gapId: gap.id, status: 'resolved' })
    );
    expect(first.gap.id).not.toBe(gap.id);
    expect(first.gap.status).toBe('open');
    const resolved = await gapById(gap.id);
    expect(resolved.status).toBe('resolved');
    expect(resolved.evidence ?? []).not.toContain('After resolution');
  });

  it('tells the agent what a practice-backed track needs before opening a PR', () => {
    const guide = contributionGuide({
      topic: 'Raft log compaction',
      gapKind: 'missing',
      description: 'Not covered',
      proposedConcept: { tags: ['distributed-systems'] },
    });
    expect(guide.problems.join(' ')).toMatch(/drills, reviewQuestions and roadmaps/u);
  });
});

describe('sessions and lessons', () => {
  it('counts subjects assessed during a session as explored when it completes', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'S',
      idempotencyKey: key('s'),
    });
    await assess({ topic: 'Skip lists' }, { sessionId: session.id });
    await h.ok('complete_learning_session', { sessionId: session.id, summary: 'Done' });
    const state = (await h.ok('get_knowledge_state', { subjects: [{ topic: 'Skip lists' }] }))
      .items[0];
    expect(state.exposureCount).toBe(1);
  });

  it('does not reopen a completed lesson when a session starts on it', async () => {
    const { course } = await createCourse();
    await h.ok('update_course', {
      courseId: course.id,
      upsertLessons: [{ id: 'one', title: 'One', status: 'completed' }],
    });
    await h.ok('start_learning_session', {
      title: 'Revisit',
      courseId: course.id,
      lessonId: 'one',
      idempotencyKey: key('s'),
    });
    const lessons = (await h.ok('get_course', { courseId: course.id })).course.lessons;
    expect(lessons[0].status).toBe('completed');
  });

  it('includes live assessment ids and assessed subjects in detailed history', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'S',
      idempotencyKey: key('s'),
    });
    const { assessment } = await assess({ topic: 'Tries' }, { sessionId: session.id });
    const history = await h.ok('get_learning_history', { detail: true });
    expect(history.items[0].assessmentIds).toEqual([assessment.id]);
    expect(history.items[0].topics).toContain('Tries');
  });
});

describe('ordering and pagination', () => {
  it('replays same-timestamp evidence in the order it was recorded', async () => {
    const assessedAt = '2026-11-27T10:00:00.000Z';
    await assess({ topic: 'Heaps' }, { demonstratedLevel: 'advanced', assessedAt });
    await assess(
      { topic: 'Heaps' },
      { demonstratedLevel: 'beginner', outcome: 'needs-revision', assessedAt }
    );
    const tied = (await h.ok('get_knowledge_state', { subjects: [{ topic: 'Heaps' }] })).items[0];

    const other = createMcpHarness();
    try {
      const ordered = (extra) =>
        other.ok('submit_assessment', {
          subject: { topic: 'Heaps' },
          method: 'exercise',
          evaluation: 'Evaluated',
          outcome: 'newly-learned',
          idempotencyKey: key('assess'),
          ...extra,
        });
      await ordered({ demonstratedLevel: 'advanced', assessedAt });
      await ordered({
        demonstratedLevel: 'beginner',
        outcome: 'needs-revision',
        assessedAt: '2026-11-27T10:00:00.001Z',
      });
      const sequential = (await other.ok('get_knowledge_state', { subjects: [{ topic: 'Heaps' }] }))
        .items[0];
      expect([tied.level, tied.outcome]).toEqual([sequential.level, sequential.outcome]);
    } finally {
      other.close();
    }
  });

  it('pages resources without repeating or skipping when one is saved mid-way', async () => {
    for (const name of ['a', 'b', 'c', 'd']) {
      h.now = new Date(h.now.getTime() + 1_000);
      await h.ok('save_learning_resource', { url: `https://example.com/${name}`, title: name });
    }
    const first = await h.ok('list_learning_resources', { limit: 2 });
    h.now = new Date(h.now.getTime() + 1_000);
    await h.ok('save_learning_resource', { url: 'https://example.com/new', title: 'new' });
    const second = await h.ok('list_learning_resources', { limit: 2, cursor: first.nextCursor });
    const titles = [...first.items, ...second.items].map((item) => item.title);
    expect(titles).toEqual(['d', 'c', 'b', 'a']);
  });

  it('pages assessment history by a stable keyset', async () => {
    for (const day of [1, 2, 3]) {
      await assess({ topic: `T${day}` }, { assessedAt: `2026-11-0${day}T10:00:00.000Z` });
    }
    const first = await h.ok('get_assessment_history', { limit: 2 });
    await assess({ topic: 'Late' }, { assessedAt: '2026-11-20T10:00:00.000Z' });
    const second = await h.ok('get_assessment_history', { limit: 2, cursor: first.nextCursor });
    expect([...first.items, ...second.items].map((item) => item.subject.label)).toEqual([
      'T3',
      'T2',
      'T1',
    ]);
  });
});

describe('recommendations', () => {
  it('treats a free-text course topic as covered, not as a separate interest', async () => {
    await createCourse([{ id: 'raft', title: 'Raft', topics: ['Raft snapshots'] }]);
    await h.ok('start_learning_session', {
      title: 'Reading',
      kind: 'reading',
      topics: ['Raft snapshots'],
      interestSignals: [{ subject: { topic: 'Raft snapshots' }, interest: 'high' }],
      endedAt: h.now.toISOString(),
      idempotencyKey: key('s'),
    });
    const daily = await h.ok('get_daily_learning_priority', {});
    const kinds = [daily.priority, ...daily.alternatives].map((item) => item.kind);
    expect(kinds).toContain('course-lesson');
    expect(kinds).not.toContain('explore-interest');
  });
});
