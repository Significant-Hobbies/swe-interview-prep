// @vitest-environment node
// Regressions for the independent review of the adaptive learning record.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { handleLearningRecordRequest } from './browser-api.mjs';
import { createMcpHarness } from './mcp-test-harness.mjs';
import { canonicalUrl, topicKey } from './schema.mjs';

let h;
let keySeq = 0;
const key = (label) => `${label}-${(keySeq += 1).toString().padStart(4, '0')}`;

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
  const state = await h.ok('get_knowledge_state', { subjects: [subject] });
  return state.items[0];
}

describe('subject identity', () => {
  it('keeps symbol-distinct topics separate for evidence and deletion', async () => {
    expect(topicKey('C++')).not.toBe(topicKey('C#'));
    expect(topicKey('.NET')).toMatch(/^topic:dot-net~[0-9a-f]{8}$/u);
    await assess({ topic: 'C++' }, { demonstratedLevel: 'advanced' });
    await assess({ topic: 'C#' }, { demonstratedLevel: 'beginner', outcome: 'needs-depth' });
    expect((await level({ topic: 'C++' })).level).toBe('advanced');
    expect((await level({ topic: 'C#' })).level).toBe('beginner');
    await h.ok('delete_learning_record', { entity: 'knowledge-state', subject: { topic: 'C#' } });
    expect((await level({ topic: 'C++' })).evidenceCount).toBe(1);
  });

  it('keeps case-sensitive GitHub file paths distinct', () => {
    expect(canonicalUrl('https://github.com/Owner/Repo/blob/main/Foo.ts')).toBe(
      'https://github.com/owner/repo/blob/main/Foo.ts'
    );
    expect(canonicalUrl('https://github.com/owner/repo/blob/main/foo.ts')).not.toBe(
      canonicalUrl('https://github.com/owner/repo/blob/main/Foo.ts')
    );
  });
});

const isKnowledgeWrite = (sql) => /INSERT INTO knowledge_states/u.test(sql);

describe('concurrent writes', () => {
  it('keeps a session edit made while an assessment links to the session', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'Race',
      idempotencyKey: key('session'),
    });
    // Hold the assessment after it has read the session but before it writes.
    const gate = h.pauseOnce((sql) => /INSERT (OR IGNORE )?INTO learning_assessments/u.test(sql));
    const assessment = assess({ conceptId: 'bm25' }, { sessionId: session.id });
    await gate.reached;
    await h.ok('update_learning_session', {
      sessionId: session.id,
      append: { insights: ['Kept insight'] },
    });
    gate.release();
    await assessment;
    const detail = await h.ok('get_learning_session', { sessionId: session.id });
    expect(detail.session.insights).toEqual(['Kept insight']);
    expect(detail.session.assessments).toHaveLength(1);
    expect(detail.session.conceptIds).toContain('bm25');
  });

  it('does not let session completion erase a concurrent assessment', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'Complete race',
      conceptIds: ['bm25'],
      idempotencyKey: key('session'),
    });
    // Completion has read the knowledge state; an assessment lands before it writes.
    const gate = h.pauseOnce(isKnowledgeWrite);
    const completion = h.ok('complete_learning_session', { sessionId: session.id });
    await gate.reached;
    await assess({ conceptId: 'bm25' }, { demonstratedLevel: 'advanced' });
    gate.release();
    await completion;
    const state = await level({ conceptId: 'bm25' });
    expect(state.level).toBe('advanced');
    expect(state.evidenceCount).toBe(1);
    expect(state.exposureCount).toBe(1);
  });

  it('counts both of two overlapping assessments of one subject', async () => {
    const gate = h.pauseOnce(isKnowledgeWrite);
    const first = assess({ conceptId: 'tokenization' });
    await gate.reached;
    await assess({ conceptId: 'tokenization' });
    gate.release();
    await first;
    expect((await level({ conceptId: 'tokenization' })).evidenceCount).toBe(2);
  });

  it('orders backfilled evidence by assessment time', async () => {
    await assess(
      { conceptId: 'bm25' },
      { demonstratedLevel: 'advanced', assessedAt: '2026-11-27T10:00:00.000Z' }
    );
    await assess(
      { conceptId: 'bm25' },
      {
        demonstratedLevel: 'beginner',
        outcome: 'needs-depth',
        assessedAt: '2026-10-01T10:00:00.000Z',
      }
    );
    const state = await level({ conceptId: 'bm25' });
    expect(state.level).toBe('advanced');
    expect(state.lastAssessedAt).toBe('2026-11-27T10:00:00.000Z');
  });

  it('rejects one of two edits made from the same resource version', async () => {
    const { resource } = await h.ok('save_learning_resource', {
      url: 'https://example.com/a',
      title: 'A',
    });
    const gate = h.pauseOnce((sql) => /UPDATE learning_resources SET title/u.test(sql));
    const stale = h.call('update_learning_resource', {
      resourceId: resource.id,
      set: { title: 'Stale' },
      expectedVersion: resource.version,
    });
    await gate.reached;
    await h.ok('update_learning_resource', {
      resourceId: resource.id,
      set: { summary: 'Newer summary' },
      expectedVersion: resource.version,
    });
    gate.release();
    expect((await stale).error.code).toBe('version_conflict');
    const saved = await h.ok('get_learning_resource', { resourceId: resource.id });
    expect(saved.resource.summary).toBe('Newer summary');
    expect(saved.resource.title).toBe('A');
  });
});

describe('idempotency', () => {
  it('runs a key once when the same request arrives while the first is in flight', async () => {
    const args = { title: 'Once', objective: 'Once', idempotencyKey: key('course') };
    const gate = h.pauseOnce((sql) => /INSERT INTO learning_courses/u.test(sql));
    const first = h.call('create_course', args);
    await gate.reached;
    const second = await h.call('create_course', args);
    gate.release();
    expect((await first).isError).toBe(false);
    expect(second.error.code).toBe('idempotency_in_progress');
    expect(h.count('learning_courses')).toBe(1);
  });

  it('does not apply a mutation twice when recording its response fails', async () => {
    const args = {
      topic: 'Bloom filters',
      gapKind: 'insufficient',
      description: 'Thin',
      idempotencyKey: key('gap'),
    };
    h.failOnce(
      (sql) =>
        /mcp_mutation_receipts/u.test(sql) && /response_json/u.test(sql) && !/^\s*SELECT/u.test(sql)
    );
    expect((await h.call('report_curriculum_gap', args)).error.code).toBe('internal_error');
    const retry = await h.call('report_curriculum_gap', args);
    expect(retry.isError).toBe(true);
    expect(retry.error.code).toBe('idempotency_in_progress');
    expect((await h.ok('list_curriculum_gaps', {})).items[0].reportCount).toBe(1);
  });

  it('replays a completed keyed mutation without applying it again', async () => {
    const args = {
      topic: 'Skip lists',
      gapKind: 'insufficient',
      description: 'Thin',
      idempotencyKey: key('gap'),
    };
    await h.ok('report_curriculum_gap', args);
    expect((await h.ok('report_curriculum_gap', args)).idempotentReplay).toBe(true);
    expect((await h.ok('list_curriculum_gaps', {})).items[0].reportCount).toBe(1);
  });

  it('releases a key when the mutation fails so a corrected retry can run', async () => {
    const failed = await h.call('start_learning_session', {
      title: 'Bad',
      startedAt: '2026-11-28T10:00:00.000Z',
      endedAt: '2026-11-28T09:00:00.000Z',
      idempotencyKey: key('session'),
    });
    expect(failed.error.code).toBe('invalid_input');
    expect(h.count('mcp_mutation_receipts')).toBe(0);
  });

  it('accepts a retry key when saving a resource', async () => {
    const args = { url: 'https://example.com/b', title: 'B', idempotencyKey: key('resource') };
    await h.ok('save_learning_resource', args);
    expect((await h.ok('save_learning_resource', args)).idempotentReplay).toBe(true);
  });
});

describe('deletion', () => {
  it('recomputes every subject touched by a large cascade, atomically', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'Many',
      idempotencyKey: key('session'),
    });
    for (let index = 0; index < 205; index += 1) {
      await assess(
        { topic: `Subject ${index}` },
        { sessionId: session.id, demonstratedLevel: 'advanced' }
      );
    }
    await h.ok('delete_learning_record', { entity: 'session', id: session.id, cascade: true });
    const remaining = await h.ok('get_knowledge_state', { category: 'newly-learned', limit: 50 });
    expect(remaining.total).toBe(0);
  });

  it('keeps evidence and level together when a delete fails', async () => {
    const first = await assess({ conceptId: 'bm25' }, { demonstratedLevel: 'advanced' });
    h.failOnce((sql) => /DELETE FROM learning_assessments/u.test(sql));
    const failed = await h.call('delete_learning_record', {
      entity: 'assessment',
      id: first.assessment.id,
    });
    expect(failed.isError).toBe(true);
    expect(h.count('learning_assessments')).toBe(1);
    expect((await level({ conceptId: 'bm25' })).level).toBe('advanced');
    await h.ok('delete_learning_record', { entity: 'assessment', id: first.assessment.id });
    expect((await level({ conceptId: 'bm25' })).level).toBe('unassessed');
  });

  it('clears a self-reported level when its only evidence is deleted', async () => {
    await h.ok('update_learning_profile', {
      selfAssessments: [{ conceptId: 'bm25', level: 'expert' }],
      idempotencyKey: key('profile'),
    });
    const history = await h.ok('get_assessment_history', { subject: { conceptId: 'bm25' } });
    await h.ok('delete_learning_record', { entity: 'assessment', id: history.items[0].id });
    expect((await level({ conceptId: 'bm25' })).selfReportedLevel).toBeNull();
  });

  it('never replays deleted answers or recreates a deleted record on retry', async () => {
    const args = {
      subject: { conceptId: 'bm25' },
      method: 'explain-back',
      response: 'Secret answer text',
      evaluation: 'Good',
      demonstratedLevel: 'advanced',
      outcome: 'newly-learned',
      idempotencyKey: key('assess'),
    };
    const first = await h.ok('submit_assessment', args);
    await h.ok('delete_learning_record', { entity: 'assessment', id: first.assessment.id });
    const retry = await h.ok('submit_assessment', args);
    expect(JSON.stringify(retry)).not.toContain('Secret answer text');
    expect(retry.deletedRecord).toBe(true);
    expect(h.count('learning_assessments')).toBe(0);
  });

  it('reports live assessment counts after subject deletion', async () => {
    const { session } = await h.ok('start_learning_session', {
      title: 'Counts',
      idempotencyKey: key('session'),
    });
    await assess({ topic: 'Paxos' }, { sessionId: session.id });
    await h.ok('delete_learning_record', {
      entity: 'knowledge-state',
      subject: { topic: 'Paxos' },
    });
    const history = await h.ok('get_learning_history', {});
    expect(history.items[0].assessmentCount).toBe(0);
    expect(
      (await h.ok('get_learning_session', { sessionId: session.id })).session.assessmentIds
    ).toEqual([]);
  });
});

describe('sessions, courses and resources', () => {
  it('leaves no resource behind when a session is rejected', async () => {
    const result = await h.call('start_learning_session', {
      title: 'Bad times',
      resources: [{ url: 'https://example.com/never', title: 'Never' }],
      startedAt: '2026-11-28T10:00:00.000Z',
      endedAt: '2026-11-28T09:00:00.000Z',
      idempotencyKey: key('session'),
    });
    expect(result.error.code).toBe('invalid_input');
    expect(h.count('learning_resources')).toBe(0);
  });

  it('lets sessions complete after their lesson is removed', async () => {
    const { course } = await h.ok('create_course', {
      title: 'C',
      objective: 'O',
      lessons: [
        { id: 'one', title: 'One' },
        { id: 'two', title: 'Two' },
      ],
      idempotencyKey: key('course'),
    });
    const { session } = await h.ok('start_learning_session', {
      title: 'S',
      courseId: course.id,
      lessonId: 'two',
      idempotencyKey: key('session'),
    });
    await h.ok('update_course', { courseId: course.id, removeLessonIds: ['two'] });
    const done = await h.ok('complete_learning_session', { sessionId: session.id });
    expect(done.session.status).toBe('completed');
    expect(done.session.lessonId).toBeNull();
    expect(done.session.courseId).toBe(course.id);
  });

  it('rejects cyclic lesson dependencies', async () => {
    const result = await h.call('create_course', {
      title: 'Cycle',
      objective: 'O',
      lessons: [
        { id: 'a', title: 'A', dependsOn: ['b'] },
        { id: 'b', title: 'B', dependsOn: ['a'] },
      ],
      idempotencyKey: key('course'),
    });
    expect(result.error.message).toMatch(/cycle/u);
  });

  it('creates and reads a maximal course within the D1 parameter limit', async () => {
    const lessons = Array.from({ length: 5 }, (_, lessonIndex) => ({
      title: `Lesson ${lessonIndex}`,
      topics: Array.from({ length: 20 }, (_, topicIndex) => `Topic ${lessonIndex}-${topicIndex}`),
    }));
    const { course } = await h.ok('create_course', {
      title: 'Big',
      objective: 'O',
      lessons,
      idempotencyKey: key('course'),
    });
    expect(course.progress.evidence.subjects).toBe(100);
    expect((await h.ok('get_course', { courseId: course.id })).course.lessons).toHaveLength(5);
  });

  it('promotes resources linked by id to discussed on completion', async () => {
    const { resource } = await h.ok('save_learning_resource', {
      url: 'https://example.com/c',
      title: 'C',
    });
    const { session } = await h.ok('start_learning_session', {
      title: 'Read',
      resourceIds: [resource.id],
      idempotencyKey: key('session'),
    });
    await h.ok('complete_learning_session', { sessionId: session.id });
    expect((await h.ok('get_learning_resource', { resourceId: resource.id })).resource.status).toBe(
      'discussed'
    );
  });

  it('rejects malformed gap proposals before storing them', async () => {
    const { gap } = await h.ok('report_curriculum_gap', {
      topic: 'Raft',
      gapKind: 'missing',
      description: 'None',
    });
    const bad = await h.call('update_curriculum_gap', {
      gapId: gap.id,
      proposedConcept: { tags: 'not-a-list' },
    });
    expect(bad.error.code).toBe('invalid_input');
    expect(
      (await h.ok('update_curriculum_gap', { gapId: gap.id, status: 'dismissed' })).gap.status
    ).toBe('dismissed');
  });
});

describe('recommendation consistency', () => {
  it('checks understanding of the concept today’s priority chose', async () => {
    await h.ok('create_course', {
      title: 'C',
      objective: 'O',
      lessons: [{ title: 'BM25', conceptIds: ['bm25'] }],
      idempotencyKey: key('course'),
    });
    const priority = await h.ok('get_daily_learning_priority', {});
    const check = await h.ok('get_current_learning_check', {});
    expect(check.concept.id).toBe(priority.priority.concepts[0].id);
    expect(check.actionUrl).toBe(priority.priority.actionUrl);
  });

  it('uses the latest override when two arrive in the same millisecond', async () => {
    for (const objective of ['First choice', 'Second choice']) {
      await h.ok('override_daily_learning_priority', {
        chosen: { objective },
        reason: 'Learner asked',
        idempotencyKey: key('override'),
      });
    }
    expect((await h.ok('get_daily_learning_priority', {})).priority.objective).toBe(
      'Second choice'
    );
  });
});

describe('record page', () => {
  it('paginates long lists and resolves gap deep links', async () => {
    for (let index = 0; index < 32; index += 1) {
      await h.ok('start_learning_session', { title: `S${index}`, idempotencyKey: key('session') });
    }
    const { gap } = await h.ok('report_curriculum_gap', {
      topic: 'Gossip',
      gapKind: 'missing',
      description: 'None',
    });
    const json = (data, init = {}) => new Response(JSON.stringify(data), init);
    const get = async (query) => {
      const response = await handleLearningRecordRequest({
        request: new Request(`https://learn.example/api/learning-record?${query}`),
        client: h.client,
        user: { id: 'alice' },
        json,
      });
      return response.json();
    };
    const overview = await get('view=overview');
    expect(overview.sessions.items).toHaveLength(30);
    const next = await get(`view=list&section=sessions&cursor=${overview.sessions.nextCursor}`);
    expect(next.items).toHaveLength(2);
    expect(gap.url).toMatch(/\/record\/gaps\//u);
    expect((await get(`view=gap&id=${gap.id}`)).gap.topic).toBe('Gossip');
  });
});
