// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createMcpHarness } from './mcp-test-harness.mjs';
import { canonicalUrl } from './schema.mjs';

let h;
const rpc = (...args) => h.rpc(...args);
const call = (...args) => h.call(...args);
const ok = (...args) => h.ok(...args);

beforeEach(() => {
  h = createMcpHarness();
});

afterEach(() => h.close());

describe('MCP protocol and authorization', () => {
  it('initializes, lists every PRD tool with schemas and rejects missing auth', async () => {
    const init = await rpc('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 't', version: '1' },
    });
    expect(init.body.result.protocolVersion).toBe('2025-06-18');
    expect(init.body.result.instructions).toMatch(/unassessed, not beginner/u);
    const list = await rpc('tools/list', {});
    const names = list.body.result.tools.map((tool) => tool.name);
    for (const name of [
      'get_learning_profile',
      'update_learning_profile',
      'get_knowledge_state',
      'create_course',
      'get_course',
      'list_courses',
      'update_course',
      'start_learning_session',
      'update_learning_session',
      'complete_learning_session',
      'get_learning_history',
      'submit_assessment',
      'get_assessment_history',
      'report_curriculum_gap',
      'get_daily_learning_priority',
      'save_learning_resource',
      'search_curriculum',
      'get_curriculum_item',
      'get_current_learning_check',
      'get_learning_progress',
    ]) {
      expect(names).toContain(name);
    }
    for (const tool of list.body.result.tools) expect(tool.inputSchema.type).toBe('object');

    const missing = await rpc('tools/list', {}, 'nobody.no.token');
    expect(missing.status).toBe(401);
  });

  it('requires the write scope for mutations but allows reads', async () => {
    const denied = await call(
      'create_course',
      { title: 'X', objective: 'Y', idempotencyKey: 'key-00000001' },
      'alice.read.only'
    );
    expect(denied.isError).toBe(true);
    expect(denied.error.code).toBe('insufficient_scope');
    await ok('get_learning_profile', {}, 'alice.read.only');
  });

  it('enforces the private owner workspace', async () => {
    const result = await rpc('tools/list', {}, 'bob.read.write', {
      OWNER_EMAIL: 'alice@example.invalid',
    });
    expect(result.status).toBe(403);
  });

  it('returns actionable validation errors', async () => {
    const result = await call('create_course', {
      title: 'Bad',
      objective: 'Bad',
      idempotencyKey: 'key-00000002',
      lessons: [{ title: 'L', conceptIds: ['bm-25-scoring'] }],
    });
    expect(result.isError).toBe(true);
    expect(result.error.message).toMatch(/Unknown curriculum concept id/u);
    expect(result.error.details.suggestions['bm-25-scoring']).toContain('bm25');
    const missing = await call('start_learning_session', { title: 'no key' });
    expect(missing.error.message).toMatch(/idempotencyKey is required/u);
  });
});

describe('profile and knowledge', () => {
  it('keeps self-reported familiarity distinct from assessed knowledge', async () => {
    const profile = await ok('update_learning_profile', {
      set: { background: 'Backend engineer, 8 years', availableTime: { minutesPerDay: 60 } },
      append: { interests: ['distributed systems', 'search'], disinterests: ['frontend styling'] },
      selfAssessments: [
        { conceptId: 'bm25', level: 'advanced', targetLevel: 'expert', interest: 'high' },
      ],
      idempotencyKey: 'profile-0001',
    });
    expect(profile.version).toBe(1);
    expect(profile.profile.interests).toEqual(['distributed systems', 'search']);

    const partial = await ok('update_learning_profile', {
      append: { interests: ['Search', 'compilers'] },
      idempotencyKey: 'profile-0002',
    });
    expect(partial.profile.background).toBe('Backend engineer, 8 years');
    expect(partial.profile.interests).toEqual(['distributed systems', 'search', 'compilers']);

    const knowledge = await ok('get_knowledge_state', {
      subjects: [{ conceptId: 'bm25' }, { conceptId: 'tokenization' }],
    });
    const bm25 = knowledge.items.find((item) => item.subject.key === 'bm25');
    const tokenization = knowledge.items.find((item) => item.subject.key === 'tokenization');
    expect(bm25.level).toBe('unassessed');
    expect(bm25.selfReportedLevel).toBe('advanced');
    expect(bm25.levelBasis).toBe('self-reported-only');
    expect(tokenization.level).toBe('unassessed');
    expect(tokenization.levelBasis).toBe('none');

    await ok('submit_assessment', {
      subject: { conceptId: 'tokenization' },
      method: 'explain-back',
      evaluation: 'Shaky on analyzer symmetry',
      demonstratedLevel: 'beginner',
      outcome: 'needs-depth',
      idempotencyKey: 'assess-tok-1',
    });
    const after = await ok('get_knowledge_state', { category: 'needs-depth' });
    expect(after.items.map((item) => item.subject.key)).toEqual(['tokenization']);
    expect(after.items[0].level).toBe('beginner');
    expect(after.summary.byCategory.unassessed).toBe(1);
  });

  it('discovers advanced curriculum filtered by prerequisites and known material', async () => {
    const advanced = await ok('search_curriculum', { minDifficulty: 'advanced', limit: 50 });
    expect(advanced.items.length).toBeGreaterThan(0);
    expect(advanced.items.every((item) => item.difficulty === 'advanced')).toBe(true);
    const buildsOnBm25 = await ok('search_curriculum', { requires: 'bm25' });
    expect(buildsOnBm25.items.every((item) => item.prerequisites.includes('bm25'))).toBe(true);
    const detail = await ok('get_curriculum_item', { kind: 'concept', id: 'bm25' });
    expect(detail.assessmentQuestions.length).toBeGreaterThan(0);
    expect(JSON.stringify(detail)).not.toMatch(/"answer"|referenceSolution/u);
    expect(detail.learner.level).toBe('unassessed');
  });
});

describe('courses, sessions and assessments', () => {
  it('runs a full course lesson outside the app and persists across sessions', async () => {
    const created = await ok('create_course', {
      title: 'Search ranking in depth',
      objective: 'Understand lexical and hybrid ranking well enough to design a search stack',
      targetLevel: 'advanced',
      lessons: [
        { id: 'bm25', title: 'BM25 mechanics', conceptIds: ['bm25'] },
        {
          id: 'hybrid',
          title: 'Hybrid retrieval',
          conceptIds: ['hybrid-search'],
          dependsOn: ['bm25'],
        },
        { title: 'Learned sparse retrieval', topics: ['SPLADE'] },
      ],
      idempotencyKey: 'course-search-1',
    });
    const course = created.course;
    expect(course.isPrimary).toBe(true);
    expect(course.nextLessonId).toBe('bm25');
    expect(course.lessons[2].id).toBe('learned-sparse-retrieval');

    const retry = await ok('create_course', {
      title: 'Search ranking in depth',
      objective: 'Understand lexical and hybrid ranking well enough to design a search stack',
      targetLevel: 'advanced',
      lessons: [
        { id: 'bm25', title: 'BM25 mechanics', conceptIds: ['bm25'] },
        {
          id: 'hybrid',
          title: 'Hybrid retrieval',
          conceptIds: ['hybrid-search'],
          dependsOn: ['bm25'],
        },
        { title: 'Learned sparse retrieval', topics: ['SPLADE'] },
      ],
      idempotencyKey: 'course-search-1',
    });
    expect(retry.course.id).toBe(course.id);
    expect(retry.idempotentReplay).toBe(true);
    expect(h.database.prepare('SELECT COUNT(*) AS n FROM learning_courses').get().n).toBe(1);
    const reused = await call('create_course', {
      title: 'Other',
      objective: 'Other',
      idempotencyKey: 'course-search-1',
    });
    expect(reused.error.code).toBe('idempotency_conflict');

    const priority = await ok('get_daily_learning_priority');
    expect(priority.priority.kind).toBe('course-lesson');
    expect(priority.priority.lesson.id).toBe('bm25');
    expect(priority.priority.deepLinks.course).toMatch(/\/record\/courses\//u);

    const started = await ok('start_learning_session', {
      kind: 'course-lesson',
      title: 'BM25 from first principles',
      courseId: course.id,
      lessonId: 'bm25',
      objectives: ['Explain term saturation'],
      idempotencyKey: 'session-bm25-1',
    });
    const sessionId = started.session.id;
    const startedAgain = await ok('start_learning_session', {
      kind: 'course-lesson',
      title: 'BM25 from first principles',
      courseId: course.id,
      lessonId: 'bm25',
      objectives: ['Explain term saturation'],
      idempotencyKey: 'session-bm25-1',
    });
    expect(startedAgain.session.id).toBe(sessionId);
    expect(h.database.prepare('SELECT COUNT(*) AS n FROM learning_sessions').get().n).toBe(1);

    await ok('update_learning_session', {
      sessionId,
      append: {
        questions: ['Why does k1 cap term frequency?'],
        insights: ['Saturation stops keyword stuffing from dominating'],
        misconceptions: ['Thought IDF was per-document'],
        unresolvedQuestions: ['How does BM25F weight fields?'],
      },
      idempotencyKey: 'session-bm25-upd-1',
    });
    await ok('update_learning_session', {
      sessionId,
      append: { insights: ['Saturation stops keyword stuffing from dominating'] },
    });

    const assessed = await ok('submit_assessment', {
      subject: { conceptId: 'bm25' },
      method: 'explain-back',
      sessionId,
      question: 'Explain how BM25 handles a term repeated 50 times.',
      response: 'k1 saturates tf so extra repeats add little; b normalizes length.',
      evaluation: 'Correct causal model including length normalization.',
      demonstratedLevel: 'advanced',
      outcome: 'newly-learned',
      score: 0.9,
      provenance: { agent: 'ChatGPT', evaluator: 'ai-agent' },
      idempotencyKey: 'assess-bm25-1',
    });
    expect(assessed.knowledgeBefore.level).toBe('unassessed');
    expect(assessed.knowledgeAfter.level).toBe('advanced');
    expect(assessed.knowledgeAfter.reviewDueAt).toBe('2026-12-01T09:00:00.000Z');

    const completed = await ok('complete_learning_session', {
      sessionId,
      summary: 'Built a causal model of BM25.',
      lessonStatus: 'completed',
      endedAt: '2026-11-28T09:40:00.000Z',
      idempotencyKey: 'session-bm25-done',
    });
    expect(completed.session.status).toBe('completed');
    expect(completed.session.durationMinutes).toBe(40);
    expect(completed.session.insights).toEqual([
      'Saturation stops keyword stuffing from dominating',
    ]);
    expect(completed.session.assessments).toHaveLength(1);
    expect(completed.policy).toMatch(/activity and exposure only/u);

    // A later conversation reads everything back.
    h.now = new Date('2026-11-29T09:00:00.000Z');
    const history = await ok('get_learning_history', { courseId: course.id });
    expect(history.items).toHaveLength(1);
    expect(history.items[0].unresolvedQuestions).toEqual(['How does BM25F weight fields?']);
    const detail = await ok('get_learning_session', { sessionId });
    expect(detail.session.lesson).toEqual({
      id: 'bm25',
      title: 'BM25 mechanics',
      status: 'completed',
    });
    const assessments = await ok('get_assessment_history', { subject: { conceptId: 'bm25' } });
    expect(assessments.items[0].provenance.agent).toBe('ChatGPT');

    const next = await ok('get_daily_learning_priority');
    expect(next.priority.kind).toBe('course-lesson');
    expect(next.priority.lesson.id).toBe('hybrid');

    // Evidence that understanding slipped outranks progression.
    await ok('submit_assessment', {
      subject: { conceptId: 'bm25' },
      method: 'recall-check',
      evaluation: 'Forgot length normalization',
      demonstratedLevel: 'intermediate',
      outcome: 'needs-revision',
      idempotencyKey: 'assess-bm25-2',
    });
    const revision = await ok('get_daily_learning_priority');
    expect(revision.priority.kind).toBe('revision');
    expect(revision.priority.concepts[0].id).toBe('bm25');
    expect(revision.alternatives.some((item) => item.kind === 'course-lesson')).toBe(true);

    const override = await ok('override_daily_learning_priority', {
      chosen: {
        objective: 'Study hybrid search today',
        conceptIds: ['hybrid-search'],
        courseId: course.id,
        lessonId: 'hybrid',
      },
      reason: 'Learner has an interview about hybrid retrieval tomorrow',
      idempotencyKey: 'override-1',
    });
    expect(override.priority.source).toBe('agent-override');
    expect(override.priority.computed.kind).toBe('revision');
    expect((await ok('get_daily_learning_priority')).override.reason).toMatch(/interview/u);

    const { course: current } = await ok('get_course', { courseId: course.id });
    expect(current.lessons[0].status).toBe('completed');
    const adapted = await ok('update_course', {
      courseId: course.id,
      upsertLessons: [
        { id: 'bm25f', title: 'BM25F field weighting', topics: ['BM25F'], insertAfter: 'bm25' },
      ],
      removeLessonIds: ['learned-sparse-retrieval'],
      set: { notes: 'Adapted after the BM25 session' },
      expectedVersion: current.version,
    });
    expect(adapted.course.lessons.map((item) => item.id)).toEqual(['bm25', 'bm25f', 'hybrid']);
    const stale = await call('update_course', {
      courseId: course.id,
      set: { title: 'x' },
      expectedVersion: current.version,
    });
    expect(stale.error.code).toBe('version_conflict');
  });
});

describe('external resources and unstructured learning', () => {
  it('records a discussed article without curriculum coverage and never treats it as mastery', async () => {
    const url = 'https://www.Example.com/posts/crdts/?utm_source=twitter&ref=hn#comments';
    const session = await ok('start_learning_session', {
      kind: 'reading',
      title: 'Discussing a CRDT article',
      resources: [{ url, title: 'CRDTs for mortals', kind: 'article', author: 'A. Writer' }],
      topics: ['CRDT tombstones'],
      interestSignals: [{ subject: { topic: 'CRDT tombstones' }, interest: 'high' }],
      idempotencyKey: 'reading-crdt-1',
    });
    const resourceId = session.session.resourceIds[0];
    expect(session.session.resources[0].canonicalUrl).toBe('https://example.com/posts/crdts');

    await ok('update_learning_session', {
      sessionId: session.session.id,
      append: {
        insights: ['Tombstones make deletes commutative but grow state'],
        unresolvedQuestions: ['When can tombstones be garbage collected?'],
      },
    });
    await ok('complete_learning_session', {
      sessionId: session.session.id,
      summary: 'Explored CRDT deletes.',
    });

    const again = await ok('save_learning_resource', {
      url: 'http://example.com/posts/crdts',
      title: 'ignored',
      topics: ['local-first'],
    });
    expect(again.created).toBe(false);
    expect(again.resource.id).toBe(resourceId);
    expect(again.resource.status).toBe('discussed');
    expect(again.resource.title).toBe('CRDTs for mortals');
    expect(again.resource.topics).toEqual(['local-first']);
    expect(h.database.prepare('SELECT COUNT(*) AS n FROM learning_resources').get().n).toBe(1);

    const knowledge = await ok('get_knowledge_state', { subjects: [{ topic: 'CRDT tombstones' }] });
    expect(knowledge.items[0].level).toBe('unassessed');
    expect(knowledge.items[0].exposureCount).toBe(1);
    expect(knowledge.items[0].interest).toBe('high');

    const resource = await ok('get_learning_resource', {
      url: 'https://example.com/posts/crdts?utm_medium=x',
    });
    expect(resource.sessions[0].insights).toContain(
      'Tombstones make deletes commutative but grow state'
    );
    expect(resource.policy).toMatch(/never marks/u);

    const listed = await ok('list_learning_resources', { topic: 'local-first' });
    expect(listed.items.map((item) => item.id)).toEqual([resourceId]);

    // With no course, open questions and the emerging interest drive the recommendation.
    const priority = await ok('get_daily_learning_priority');
    expect(['follow-up', 'explore-interest']).toContain(priority.priority.kind);
    const kinds = [priority.priority.kind, ...priority.alternatives.map((item) => item.kind)];
    expect(kinds).toContain('explore-interest');

    const history = await ok('get_learning_history', { topic: 'crdt tombstones' });
    expect(history.items).toHaveLength(1);
  });

  it('canonicalizes common URL variants', () => {
    expect(canonicalUrl('https://arxiv.org/pdf/1706.03762v7.pdf')).toBe(
      'https://arxiv.org/abs/1706.03762'
    );
    expect(canonicalUrl('https://youtu.be/dQw4w9WgXcQ?si=abc')).toBe(
      'https://youtube.com/watch?v=dQw4w9WgXcQ'
    );
    expect(canonicalUrl('https://github.com/Foo/Bar.git')).toBe('https://github.com/foo/bar');
  });
});

describe('curriculum gaps, isolation and cleanup', () => {
  it('records gaps with a contribution guide and merges repeats', async () => {
    const first = await ok('report_curriculum_gap', {
      topic: 'CRDT garbage collection',
      gapKind: 'missing',
      description: 'No coverage of tombstone GC',
      relatedConceptIds: ['bm25'],
      learningObjectives: ['Explain causal stability'],
      proposedConcept: { tags: ['search-ir'], difficulty: 'advanced' },
    });
    expect(first.contribution.file).toBe('src/data/concepts.json');
    expect(first.contribution.entry.id).toBe('crdt-garbage-collection');
    expect(first.contribution.entry.tags[0]).toBe('search-ir');
    expect(first.contribution.problems).toEqual([]);
    const second = await ok('report_curriculum_gap', {
      topic: 'CRDT Garbage Collection',
      gapKind: 'missing',
      description: 'Still missing',
      evidence: ['Asked twice'],
    });
    expect(second.merged).toBe(true);
    expect(second.gap.id).toBe(first.gap.id);
    expect(second.gap.reportCount).toBe(2);
    const updated = await ok('update_curriculum_gap', {
      gapId: first.gap.id,
      prUrl: 'https://github.com/o/r/pull/1',
    });
    expect(updated.gap.status).toBe('pr-opened');
  });

  it('isolates learners and cleans up synthetic records with knowledge replay', async () => {
    const session = await ok('start_learning_session', {
      title: 'Alice only',
      topics: ['Zig comptime'],
      idempotencyKey: 'iso-session-1',
    });
    const hidden = await call(
      'get_learning_session',
      { sessionId: session.session.id },
      'bob.read.write'
    );
    expect(hidden.error.code).toBe('not_found');
    expect((await ok('get_learning_history', {}, 'bob.read.write')).items).toEqual([]);

    const good = await ok('submit_assessment', {
      subject: { topic: 'Zig comptime' },
      method: 'exercise',
      evaluation: 'Solid',
      demonstratedLevel: 'intermediate',
      outcome: 'newly-learned',
      sessionId: session.session.id,
      idempotencyKey: 'iso-assess-1',
    });
    h.now = new Date('2026-11-28T10:00:00.000Z');
    const bad = await ok('submit_assessment', {
      subject: { topic: 'Zig comptime' },
      method: 'exercise',
      evaluation: 'Synthetic test row',
      demonstratedLevel: 'expert',
      outcome: 'previously-known',
      idempotencyKey: 'iso-assess-2',
    });
    await ok('delete_learning_record', { entity: 'assessment', id: bad.assessment.id });
    const replayed = await ok('get_knowledge_state', { subjects: [{ topic: 'Zig comptime' }] });
    expect(replayed.items[0].level).toBe('intermediate');
    expect(replayed.items[0].evidenceCount).toBe(1);

    await ok('delete_learning_record', {
      entity: 'session',
      id: session.session.id,
      cascade: true,
    });
    expect(h.database.prepare('SELECT COUNT(*) AS n FROM learning_assessments').get().n).toBe(0);
    await ok('delete_learning_record', {
      entity: 'knowledge-state',
      subject: { topic: 'Zig comptime' },
    });
    expect(h.database.prepare('SELECT COUNT(*) AS n FROM knowledge_states').get().n).toBe(0);
    expect(good.assessment.id).toMatch(/^asm_/u);
  });
});
