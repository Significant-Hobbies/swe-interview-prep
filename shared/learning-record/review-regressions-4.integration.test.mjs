// @vitest-environment node
// Regressions for the fourth independent review. Interleavings and partial
// failures are forced with the harness's pause and failure hooks.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createMcpHarness } from './mcp-test-harness.mjs';

let h;
let keySeq = 0;
const key = (label) => `${label}-key-${(keySeq += 1).toString().padStart(4, '0')}`;
const matches = (pattern) => (sql) => pattern.test(sql);
/** Matches the nth statement that fits the pattern (1-based). */
const nth = (pattern, n) => {
  let seen = 0;
  return (sql) => {
    if (!pattern.test(sql)) return false;
    seen += 1;
    return seen === n;
  };
};

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

async function race(pattern, first, during) {
  const gate = h.pauseOnce(typeof pattern === 'function' ? pattern : matches(pattern));
  const pending = first();
  await gate.reached;
  const middle = await during();
  gate.release();
  return { first: await pending, middle };
}

const startSession = (extra = {}) =>
  h.ok('start_learning_session', { title: 'S', idempotencyKey: key('session'), ...extra });

const createCourse = () =>
  h.ok('create_course', {
    title: 'C',
    objective: 'O',
    lessons: [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ],
    idempotencyKey: key('course'),
  });

describe('idempotency after a partial failure', () => {
  it('never re-applies a committed edit over a newer one when its response read fails', async () => {
    const { resource } = await h.ok('save_learning_resource', {
      url: 'https://example.com/p',
      title: 'P',
    });
    const args = { resourceId: resource.id, set: { status: 'reading' }, idempotencyKey: key('r') };
    h.failOnce(nth(/SELECT \* FROM learning_resources WHERE user_id = \? AND id = \?/u, 2));
    expect((await h.call('update_learning_resource', args)).isError).toBe(true);
    await h.ok('update_learning_resource', {
      resourceId: resource.id,
      set: { status: 'completed' },
    });
    const retry = await h.call('update_learning_resource', args);
    expect(retry.error.code).toBe('idempotency_in_progress');
    const current = await h.ok('get_learning_resource', { resourceId: resource.id });
    expect(current.resource.status).toBe('completed');
  });

  it('replays an override by its own id, not the latest of the day', async () => {
    const firstArgs = {
      chosen: { objective: 'First choice' },
      reason: 'One',
      idempotencyKey: key('ovr'),
    };
    const first = await h.ok('override_daily_learning_priority', firstArgs);
    await h.ok('override_daily_learning_priority', {
      chosen: { objective: 'Second choice' },
      reason: 'Two',
      idempotencyKey: key('ovr'),
    });
    const replay = await h.ok('override_daily_learning_priority', firstArgs);
    expect(replay.override.id).toBe(first.override.id);
    expect(replay.override.chosen.objective).toBe('First choice');
  });
});

describe('subjects and topics', () => {
  it('accepts free-text topics in non-Latin scripts and keeps their label', async () => {
    const { assessment } = await assess({ topic: '分散システム' });
    expect(assessment.subject.label).toBe('分散システム');
    expect(assessment.subject.key).toMatch(/^topic:topic~[0-9a-f]{16}$/u);
    const other = await assess({ topic: '機械学習' });
    expect(other.assessment.subject.key).not.toBe(assessment.subject.key);
  });

  it('returns one row per subject when a subject is requested twice', async () => {
    const result = await h.ok('get_knowledge_state', {
      subjects: [{ topic: 'Paxos' }, { topic: 'paxos' }],
      limit: 1,
    });
    expect(result.total).toBe(1);
    expect(result.nextCursor).toBeNull();
  });
});

describe('resources', () => {
  it('does not attach a re-saved URL to sessions that linked the deleted resource', async () => {
    const { session } = await startSession({
      resources: [{ url: 'https://example.com/a', title: 'A' }],
    });
    const resourceId = session.resourceIds[0];
    await h.ok('delete_learning_record', { entity: 'resource', id: resourceId });
    await h.ok('save_learning_resource', { url: 'https://example.com/a', title: 'A again' });
    const reread = await h.ok('get_learning_session', { sessionId: session.id });
    expect(reread.session.resourceIds).toEqual([]);
    expect(reread.session.resources).toEqual([]);
  });

  it('keeps every merged topic when only the title changes', async () => {
    let id;
    for (let batch = 0; batch < 8; batch += 1) {
      const topics = Array.from({ length: 30 }, (_, index) => `Topic ${batch}-${index}`);
      ({
        resource: { id },
      } = await h.ok('save_learning_resource', {
        url: 'https://example.com/t',
        title: 'T',
        topics,
      }));
    }
    const before = (await h.ok('get_learning_resource', { resourceId: id })).resource.topics.length;
    expect(before).toBe(240);
    await h.ok('update_learning_resource', { resourceId: id, set: { title: 'Renamed' } });
    const after = (await h.ok('get_learning_resource', { resourceId: id })).resource.topics.length;
    expect(after).toBe(240);
  });
});

describe('sessions and courses', () => {
  it('rejects an append that would exceed a session list instead of dropping it', async () => {
    const { session } = await startSession();
    for (let round = 0; round < 5; round += 1) {
      await h.ok('update_learning_session', {
        sessionId: session.id,
        append: {
          insights: Array.from({ length: 100 }, (_, index) => `Insight ${round}-${index}`),
        },
      });
    }
    const before = (await h.ok('get_learning_session', { sessionId: session.id })).session.version;
    const over = await h.call('update_learning_session', {
      sessionId: session.id,
      append: { insights: ['One more'] },
    });
    expect(over.error.code).toBe('invalid_input');
    const after = (await h.ok('get_learning_session', { sessionId: session.id })).session.version;
    expect(after).toBe(before);
  });

  it('does not link a session to a course deleted while the edit lands', async () => {
    const { course } = await createCourse();
    const { session } = await startSession();
    await race(
      /UPDATE learning_sessions SET kind/u,
      () =>
        h.call('update_learning_session', { sessionId: session.id, set: { courseId: course.id } }),
      () => h.ok('delete_learning_record', { entity: 'course', id: course.id })
    );
    const reread = await h.ok('get_learning_session', { sessionId: session.id });
    expect(reread.session.courseId).toBeNull();
  });

  it('records exposure for an assessment saved while the session completes', async () => {
    const { session } = await startSession();
    await race(
      /UPDATE learning_sessions SET kind/u,
      () => h.ok('complete_learning_session', { sessionId: session.id, summary: 'Done' }),
      () => assess({ topic: 'Late subject' }, { sessionId: session.id })
    );
    const state = (await h.ok('get_knowledge_state', { subjects: [{ topic: 'Late subject' }] }))
      .items[0];
    expect(state.exposureCount).toBe(1);
  });

  it('rejects a lesson order that repeats a lesson', async () => {
    const { course } = await createCourse();
    const result = await h.call('update_course', {
      courseId: course.id,
      lessonOrder: ['a', 'a', 'b'],
    });
    expect(result.error.code).toBe('invalid_input');
    const lessons = (await h.ok('get_course', { courseId: course.id })).course.lessons;
    expect(lessons.map((lesson) => lesson.id)).toEqual(['a', 'b']);
  });

  it('stops recommending an override whose course was deleted', async () => {
    const { course } = await createCourse();
    await h.ok('override_daily_learning_priority', {
      chosen: { objective: 'Do course C', courseId: course.id },
      reason: 'Focus',
      idempotencyKey: key('ovr'),
    });
    await h.ok('delete_learning_record', { entity: 'course', id: course.id });
    const daily = await h.ok('get_daily_learning_priority', {});
    expect(daily.source).toBe('computed');
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

  it('keeps a concurrent description correction when a PR link is added', async () => {
    const { gap } = await report();
    await race(
      /UPDATE curriculum_gaps SET status/u,
      () =>
        h.ok('update_curriculum_gap', { gapId: gap.id, prUrl: 'https://github.com/o/r/pull/1' }),
      () => h.ok('update_curriculum_gap', { gapId: gap.id, description: 'Corrected' })
    );
    const { items } = await h.ok('list_curriculum_gaps', {});
    expect(items[0].description).toBe('Corrected');
    expect(items[0].prUrl).toBe('https://github.com/o/r/pull/1');
  });

  it('refuses to reopen a gap while another open gap covers its topic', async () => {
    const { gap } = await report();
    await h.ok('update_curriculum_gap', { gapId: gap.id, status: 'resolved' });
    const { gap: current } = await report({ description: 'Missing again' });
    const reopen = await h.call('update_curriculum_gap', { gapId: gap.id, status: 'open' });
    expect(reopen.error.code).toBe('version_conflict');
    expect(reopen.error.details.openGapId).toBe(current.id);
  });

  it('asks for the drill and review question every concept needs', async () => {
    const { contribution } = await report({ proposedConcept: { tags: ['search-ir'] } });
    expect(contribution.problems.join(' ')).toMatch(/editorial drill/u);
    expect(contribution.problems.join(' ')).toMatch(/review question/u);
  });
});
