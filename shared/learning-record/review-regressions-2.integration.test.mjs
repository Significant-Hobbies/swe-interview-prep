// @vitest-environment node
// Regressions for the second independent review: interleavings and partial
// failures are forced with the harness's pause and failure hooks.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { handleLearningRecordRequest } from './browser-api.mjs';
import { createMcpHarness } from './mcp-test-harness.mjs';
import { handleLearningMcpRequest } from './mcp-server.mjs';
import { topicKey } from './schema.mjs';

let h;
let keySeq = 0;
const key = (label) => `${label}-${(keySeq += 1).toString().padStart(4, '0')}`;
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

async function level(subject) {
  return (await h.ok('get_knowledge_state', { subjects: [subject] })).items[0];
}

async function race(pattern, first, during) {
  const gate = h.pauseOnce(matches(pattern));
  const pending = first();
  await gate.reached;
  const middle = await during();
  gate.release();
  return { first: await pending, middle };
}

describe('subject identity', () => {
  it('keeps topics that differ only by an unmapped symbol apart', async () => {
    expect(topicKey('SQL < operator')).not.toBe(topicKey('SQL > operator'));
    await assess({ topic: 'SQL < operator' }, { demonstratedLevel: 'advanced' });
    await assess({ topic: 'SQL > operator' });
    await h.ok('delete_learning_record', {
      entity: 'knowledge-state',
      subject: { topic: 'SQL > operator' },
    });
    expect((await level({ topic: 'SQL < operator' })).level).toBe('advanced');
  });

  it('never re-keys a free-text topic as a curriculum concept', async () => {
    await assess({ topic: 'BM25' }, { demonstratedLevel: 'advanced' });
    const topic = await level({ topic: 'BM25' });
    expect(topic.subject.key).toMatch(/^topic:bm25~[0-9a-f]{8}$/u);
    expect(topic.level).toBe('advanced');
    expect((await level({ conceptId: 'bm25' })).level).toBe('unassessed');
  });

  it('keeps assessments from different tools with look-alike keys separate', async () => {
    await h.ok('update_learning_profile', {
      selfAssessments: [{ conceptId: 'bm25', level: 'advanced' }],
      idempotencyKey: 'shared-key-0001',
    });
    await h.ok('submit_assessment', {
      subject: { conceptId: 'tokenization' },
      method: 'exercise',
      evaluation: 'E',
      demonstratedLevel: 'beginner',
      outcome: 'needs-depth',
      idempotencyKey: 'shared-key-0001:0',
    });
    expect((await level({ conceptId: 'tokenization' })).level).toBe('beginner');
    expect(h.count('learning_assessments')).toBe(2);
  });
});

describe('atomic mutations', () => {
  it('leaves nothing behind when a session batch fails, and the retry applies everything', async () => {
    const args = {
      title: 'Reading',
      resources: [{ url: 'https://example.com/r', title: 'R' }],
      idempotencyKey: key('session'),
    };
    h.failOnce(matches(/INSERT INTO learning_resources/u));
    expect((await h.call('start_learning_session', args)).isError).toBe(true);
    expect(h.count('learning_sessions')).toBe(0);
    expect(h.count('learning_resources')).toBe(0);
    const { session } = await h.ok('start_learning_session', args);
    expect(session.resources).toHaveLength(1);
  });

  it('rolls completion back as a whole when its engagement write fails', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'S',
      conceptIds: ['bm25'],
      idempotencyKey: key('session'),
    });
    h.failOnce(matches(/exposure_count/u));
    expect((await h.call('complete_learning_session', { sessionId: session.id })).isError).toBe(
      true
    );
    expect((await h.ok('get_learning_session', { sessionId: session.id })).session.status).toBe(
      'active'
    );
    await h.ok('complete_learning_session', { sessionId: session.id });
    expect((await level({ conceptId: 'bm25' })).exposureCount).toBe(1);
  });

  it('refuses an assessment for a session deleted while it was being saved', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'S',
      idempotencyKey: key('session'),
    });
    const { first } = await race(
      /INSERT INTO learning_assessments/u,
      () =>
        h.call('submit_assessment', {
          subject: { conceptId: 'bm25' },
          method: 'exercise',
          evaluation: 'E',
          demonstratedLevel: 'advanced',
          outcome: 'newly-learned',
          sessionId: session.id,
          idempotencyKey: key('assess'),
        }),
      () => h.ok('delete_learning_record', { entity: 'session', id: session.id, cascade: true })
    );
    expect(first.error.code).toBe('not_found');
    expect(h.count('learning_assessments')).toBe(0);
  });

  it('applies nothing from a profile edit that loses a version race', async () => {
    await h.ok('update_learning_profile', {
      set: { background: 'v1' },
      idempotencyKey: key('profile'),
    });
    const { first } = await race(
      /UPDATE learner_profiles/u,
      () =>
        h.call('update_learning_profile', {
          set: { background: 'stale' },
          selfAssessments: [{ conceptId: 'bm25', level: 'expert' }],
          expectedVersion: 1,
        }),
      () => h.ok('update_learning_profile', { set: { background: 'v2' } })
    );
    expect(first.error.code).toBe('version_conflict');
    expect(h.count('learning_assessments')).toBe(0);
    expect((await h.ok('get_learning_profile', {})).profile.background).toBe('v2');
  });

  it('keeps the current primary when a stale promotion loses its race', async () => {
    const { course: primary } = await h.ok('create_course', {
      title: 'P',
      objective: 'O',
      idempotencyKey: key('course'),
    });
    const { course: other } = await h.ok('create_course', {
      title: 'Q',
      objective: 'O',
      idempotencyKey: key('course'),
    });
    const { first } = await race(
      /UPDATE learning_courses SET title/u,
      () => h.call('update_course', { courseId: other.id, set: { isPrimary: true } }),
      () => h.ok('update_course', { courseId: other.id, set: { notes: 'concurrent' } })
    );
    expect(first.error.code).toBe('version_conflict');
    const primaries = await h.ok('list_courses', { primaryOnly: true });
    expect(primaries.items.map((item) => item.id)).toEqual([primary.id]);
  });

  it('never ends with two primary courses after a concurrent edit of the old primary', async () => {
    const { course: oldPrimary } = await h.ok('create_course', {
      title: 'Old',
      objective: 'O',
      idempotencyKey: key('course'),
    });
    const { course: next } = await h.ok('create_course', {
      title: 'New',
      objective: 'O',
      idempotencyKey: key('course'),
    });
    const { first } = await race(
      /UPDATE learning_courses SET title/u,
      () => h.call('update_course', { courseId: oldPrimary.id, set: { title: 'Old renamed' } }),
      () => h.ok('update_course', { courseId: next.id, set: { isPrimary: true } })
    );
    expect(first.error.code).toBe('version_conflict');
    const primaries = await h.ok('list_courses', { primaryOnly: true });
    expect(primaries.items.map((item) => item.id)).toEqual([next.id]);
  });
});

describe('concurrent edits', () => {
  it('keeps a concurrent course edit when a session changes a lesson status', async () => {
    const { course } = await h.ok('create_course', {
      title: 'C',
      objective: 'O',
      lessons: [{ id: 'one', title: 'One' }],
      idempotencyKey: key('course'),
    });
    await race(
      /json_set\(lessons_json/u,
      () =>
        h.ok('start_learning_session', {
          title: 'S',
          courseId: course.id,
          lessonId: 'one',
          idempotencyKey: key('session'),
        }),
      () =>
        h.ok('update_course', {
          courseId: course.id,
          upsertLessons: [
            { id: 'one', title: 'One renamed' },
            { id: 'two', title: 'Two' },
          ],
        })
    );
    const lessons = (await h.ok('get_course', { courseId: course.id })).course.lessons;
    expect(lessons.map((lesson) => [lesson.id, lesson.title, lesson.status])).toEqual([
      ['one', 'One renamed', 'active'],
      ['two', 'Two', 'planned'],
    ]);
  });

  it('merges a resource re-save into a newer edit instead of reverting it', async () => {
    const { resource } = await h.ok('save_learning_resource', {
      url: 'https://example.com/x',
      title: 'X',
    });
    await race(
      /INSERT INTO learning_resources/u,
      () => h.ok('save_learning_resource', { url: 'https://example.com/x', topics: ['added'] }),
      () =>
        h.ok('update_learning_resource', {
          resourceId: resource.id,
          set: { notes: 'Newer notes', status: 'completed' },
        })
    );
    const saved = (await h.ok('get_learning_resource', { resourceId: resource.id })).resource;
    expect(saved.notes).toBe('Newer notes');
    expect(saved.status).toBe('completed');
    expect(saved.topics).toEqual(['added']);
  });

  it('merges two first saves of the same URL into one record', async () => {
    const { first, middle } = await race(
      /INSERT INTO learning_resources/u,
      () =>
        h.ok('save_learning_resource', { url: 'https://example.com/y', title: 'Y', topics: ['a'] }),
      () =>
        h.ok('save_learning_resource', { url: 'https://example.com/y', title: 'Y', topics: ['b'] })
    );
    expect(h.count('learning_resources')).toBe(1);
    expect([first.created, middle.created].filter(Boolean)).toHaveLength(1);
    expect(first.resource.topics.sort()).toEqual(['a', 'b']);
  });

  it('records one gap when two first reports of a topic overlap', async () => {
    const args = { topic: 'Vector clocks', gapKind: 'missing', description: 'None' };
    await race(
      /INSERT OR IGNORE INTO curriculum_gaps/u,
      () => h.ok('report_curriculum_gap', args),
      () => h.ok('report_curriculum_gap', args)
    );
    expect(h.count('curriculum_gaps')).toBe(1);
    expect((await h.ok('list_curriculum_gaps', {})).items[0].reportCount).toBe(2);
  });

  it('derives levels correctly when an assessment and a deletion interleave', async () => {
    const old = await assess(
      { conceptId: 'bm25' },
      { demonstratedLevel: 'beginner', outcome: 'needs-depth' }
    );
    await race(
      /DELETE FROM learning_assessments/u,
      () => h.ok('delete_learning_record', { entity: 'assessment', id: old.assessment.id }),
      () => assess({ conceptId: 'bm25' }, { demonstratedLevel: 'advanced' })
    );
    const state = await level({ conceptId: 'bm25' });
    expect(state.level).toBe('advanced');
    expect(state.evidenceCount).toBe(1);
  });
});

describe('idempotency receipts', () => {
  it('never replays an assessment deleted while its receipt was being recorded', async () => {
    const args = {
      subject: { conceptId: 'bm25' },
      method: 'explain-back',
      response: 'Secret learner answer',
      evaluation: 'Good',
      demonstratedLevel: 'advanced',
      outcome: 'newly-learned',
      idempotencyKey: key('assess'),
    };
    const { first } = await race(
      /UPDATE mcp_mutation_receipts SET state/u,
      () => h.ok('submit_assessment', args),
      async () => {
        const history = await h.ok('get_assessment_history', {});
        return h.ok('delete_learning_record', { entity: 'assessment', id: history.items[0].id });
      }
    );
    expect(first.assessment.response).toBe('Secret learner answer');
    const retry = await h.ok('submit_assessment', args);
    expect(JSON.stringify(retry)).not.toContain('Secret learner answer');
    expect(retry.deletedRecord).toBe(true);
    expect(h.count('learning_assessments')).toBe(0);
    expect(
      h.database
        .prepare('SELECT response_json FROM mcp_mutation_receipts')
        .all()
        .map((row) => row.response_json)
        .join()
    ).not.toContain('Secret');
  });

  it('replays a profile update with current state, not deleted self-reports', async () => {
    const args = {
      selfAssessments: [{ conceptId: 'bm25', level: 'expert' }],
      idempotencyKey: key('profile'),
    };
    await h.ok('update_learning_profile', args);
    const history = await h.ok('get_assessment_history', {});
    await h.ok('delete_learning_record', { entity: 'assessment', id: history.items[0].id });
    const retry = await h.ok('update_learning_profile', args);
    expect(retry.idempotentReplay).toBe(true);
    expect(retry.subjectPreferences.some((item) => item.selfReportedLevel === 'expert')).toBe(
      false
    );
  });

  it('never re-runs a mutation whose reservation was abandoned, however old', async () => {
    const args = {
      topic: 'Merkle trees',
      gapKind: 'missing',
      description: 'None',
      idempotencyKey: key('gap'),
    };
    h.failOnce(matches(/UPDATE mcp_mutation_receipts SET state/u));
    expect((await h.call('report_curriculum_gap', args)).isError).toBe(true);
    h.now = new Date(h.now.getTime() + 86_400_000);
    const retry = await h.call('report_curriculum_gap', args);
    expect(retry.isError).toBe(true);
    expect(retry.error.code).toBe('idempotency_in_progress');
    expect((await h.ok('list_curriculum_gaps', {})).items[0].reportCount).toBe(1);
  });
});

describe('reads', () => {
  it('counts every subject in a course with more than 200', async () => {
    const lessons = Array.from({ length: 11 }, (_, lessonIndex) => ({
      title: `Lesson ${lessonIndex}`,
      topics: Array.from({ length: 20 }, (_, topicIndex) => `T ${lessonIndex}-${topicIndex}`),
    }));
    const { course } = await h.ok('create_course', {
      title: 'Huge',
      objective: 'O',
      lessons,
      idempotencyKey: key('course'),
    });
    await assess({ topic: 'T 10-19' }, { demonstratedLevel: 'expert' });
    const progress = (await h.ok('get_course', { courseId: course.id })).course.progress.evidence;
    expect(progress.subjects).toBe(220);
    expect(progress.atOrAboveTarget).toBe(1);
  });

  it('checks the concept an override chose, or the topic of a free-text lesson', async () => {
    await h.ok('override_daily_learning_priority', {
      chosen: { objective: 'Hybrid search today', conceptIds: ['hybrid-search'] },
      reason: 'Interview tomorrow',
      idempotencyKey: key('override'),
    });
    expect((await h.ok('get_current_learning_check', {})).concept.id).toBe('hybrid-search');
  });

  it('checks a free-text lesson topic instead of an unrelated concept', async () => {
    await h.ok('create_course', {
      title: 'C',
      objective: 'O',
      lessons: [{ title: 'Learned sparse retrieval', topics: ['SPLADE'] }],
      idempotencyKey: key('course'),
    });
    const check = await h.ok('get_current_learning_check', {});
    expect(check.concept).toBeNull();
    expect(check.topic).toBe('SPLADE');
    expect(check.questions[0].prompt).toContain('SPLADE');
  });

  it('pages history without repeating rows when a session is recorded mid-browse', async () => {
    for (let index = 0; index < 31; index += 1) {
      h.now = new Date(Date.UTC(2026, 10, 1, 0, index));
      await h.ok('start_learning_session', { title: `S${index}`, idempotencyKey: key('session') });
    }
    const first = await h.ok('get_learning_history', { limit: 30 });
    h.now = new Date(Date.UTC(2026, 10, 2));
    await h.ok('start_learning_session', { title: 'New', idempotencyKey: key('session') });
    const second = await h.ok('get_learning_history', { limit: 30, cursor: first.nextCursor });
    expect(second.items.map((item) => item.title)).toEqual(['S0']);
  });

  it('pages knowledge on the record page', async () => {
    for (let index = 0; index < 51; index += 1) await assess({ topic: `K${index}` });
    const json = (data, init = {}) => new Response(JSON.stringify(data), init);
    const get = async (query) =>
      (
        await handleLearningRecordRequest({
          request: new Request(`https://learn.example/api/learning-record?${query}`),
          client: h.client,
          user: { id: 'alice' },
          json,
        })
      ).json();
    const overview = await get('view=overview');
    expect(overview.knowledge.items).toHaveLength(50);
    const next = await get(`view=list&section=knowledge&cursor=${overview.knowledge.nextCursor}`);
    expect(next.items).toHaveLength(1);
  });

  it('rejects an unauthenticated request without reading its body', async () => {
    const request = new Request('https://learn.example/api/mcp', {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    const response = await handleLearningMcpRequest({
      request,
      env: {},
      client: h.client,
      verifyGrant: async () => null,
    });
    expect(response.status).toBe(401);
    expect(request.bodyUsed).toBe(false);
  });

  it('proposes a valid concept id even for a symbol-only topic', async () => {
    const report = await h.ok('report_curriculum_gap', {
      topic: '++',
      gapKind: 'missing',
      description: 'Increment operators',
      proposedConcept: { tags: ['search-ir'] },
    });
    expect(report.contribution.entry.id).toBe('plus-plus');
    expect(report.contribution.problems).toEqual([]);
  });
});
