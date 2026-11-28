/**
 * MCP tool catalogue for the adaptive learning record. Each tool declares its
 * JSON Schema (advertised and enforced), whether it mutates, and a handler.
 */
import {
  buildCurrentLearningVerification,
  loadAttemptsProjection,
  loadDailyLearningProjection,
} from '../lib/daily-learning-projection.mjs';
import {
  CONCEPT_BY_ID,
  PRODUCT_ORIGIN,
  conceptUrl,
  getCurriculumItem,
  searchCurriculum,
} from './curriculum.mjs';
import { buildAdaptivePriority } from './recommend.mjs';
import {
  ASSESSED_LEVELS,
  ASSESSMENT_METHODS,
  COURSE_STATUSES,
  GAP_KINDS,
  GAP_STATUSES,
  INTERESTS,
  LESSON_STATUSES,
  OUTCOMES,
  RESOURCE_KINDS,
  RESOURCE_STATUSES,
  SESSION_KINDS,
  invalid,
  s,
} from './schema.mjs';
import * as store from './store.mjs';

const subject = s.object(
  {
    conceptId: s.id('Curriculum concept id from search_curriculum.'),
    domain: s.id('Curriculum track id, for domain-level knowledge.'),
    topic: s.text(200, {
      description: 'Free-text subject outside the curriculum, e.g. "CRDT tombstones".',
    }),
  },
  [],
  'Exactly one of conceptId, domain or topic.'
);
const page = {
  limit: s.int(1, 50, 'Page size (default 20).'),
  cursor: { type: 'string', maxLength: 40, description: 'nextCursor from the previous page.' },
};
const idempotencyKey = {
  type: 'string',
  minLength: 8,
  maxLength: 128,
  pattern: '^[A-Za-z0-9._:-]+$',
  description:
    'Caller-generated unique key for this logical mutation. Reuse the same key when retrying; a retry returns the original result without duplicating records.',
};
const strings = (maxItems = 50, maxLength = 2_000, description = '') =>
  s.list(s.text(maxLength), maxItems, description);
const resourceInput = s.object(
  {
    url: s.url('Link to the resource.'),
    title: s.text(300),
    kind: s.enumOf(RESOURCE_KINDS),
    status: s.enumOf(RESOURCE_STATUSES),
    author: s.text(200),
    publishedAt: { type: 'string', maxLength: 40 },
    summary: s.text(4_000),
    conceptIds: s.list(s.id(), 30),
    topics: strings(30, 200),
    notes: s.text(4_000),
  },
  ['url']
);
const exercise = s.object(
  {
    description: s.text(2_000),
    kind: s.enumOf(['exercise', 'experiment', 'implementation', 'debugging', 'thought-experiment']),
    result: s.text(2_000),
    url: s.url(),
  },
  ['description']
);
const interestSignal = s.object({ subject, interest: s.enumOf(INTERESTS), note: s.text(500) }, [
  'subject',
  'interest',
]);
const sessionLists = {
  objectives: strings(),
  conceptIds: s.list(s.id(), 50, 'Curriculum concepts explored.'),
  topics: strings(50, 200, 'Free-text topics explored, including ones outside the curriculum.'),
  questions: strings(100, 2_000, 'Questions the learner asked.'),
  insights: strings(100, 4_000, 'Key insights the learner reached.'),
  explanations: strings(50, 8_000, 'Explanations given or produced during the session.'),
  exercises: s.list(exercise, 50),
  misconceptions: strings(50),
  unresolvedQuestions: strings(50),
  nextSteps: strings(30),
  resourceIds: s.list(s.id(), 30, 'Previously saved resource ids consulted.'),
  resources: s.list(
    resourceInput,
    20,
    'Resources consulted; saved or matched by canonical URL automatically.'
  ),
  interestSignals: s.list(interestSignal, 30, 'Interest the learner showed in a subject.'),
};
const removableLists = s.object(
  Object.fromEntries(
    [
      'objectives',
      'conceptIds',
      'topics',
      'questions',
      'insights',
      'explanations',
      'misconceptions',
      'unresolvedQuestions',
      'nextSteps',
      'resourceIds',
    ].map((key) => [key, strings(100)])
  ),
  [],
  'Exact values to remove (case-insensitive).'
);
const lesson = s.object(
  {
    id: s.id('Stable lesson id; generated from the title when omitted.'),
    title: s.text(300),
    objective: s.text(2_000),
    conceptIds: s.list(s.id(), 20),
    topics: strings(20, 200, 'Supplemental subjects not covered by the curriculum.'),
    dependsOn: s.list(s.id(), 20, 'Lesson ids that should come first.'),
    status: s.enumOf(LESSON_STATUSES),
    notes: s.text(4_000),
    insertAfter: s.id('upsertLessons only: place a new lesson after this lesson id.'),
  },
  []
);
const profileShape = {
  background: s.text(8_000),
  experience: s.list(
    s.object(
      {
        role: s.text(200),
        organization: s.text(200),
        years: { type: 'number', minimum: 0, maximum: 60 },
        summary: s.text(2_000),
      },
      ['role']
    ),
    30
  ),
  skills: s.list(
    s.object({ name: s.text(200), level: s.enumOf(ASSESSED_LEVELS), notes: s.text(500) }, ['name']),
    100,
    'Self-reported skills; never treated as assessed.'
  ),
  interests: strings(100, 200),
  disinterests: strings(100, 200),
  careerObjectives: strings(30, 1_000),
  desiredDepth: s.list(
    s.object({ domain: s.text(200), targetLevel: s.enumOf(ASSESSED_LEVELS), why: s.text(500) }, [
      'domain',
      'targetLevel',
    ]),
    50
  ),
  preferredMethods: strings(30, 200),
  availableTime: s.object({
    minutesPerDay: s.int(5, 600),
    minutesPerSession: s.int(5, 600),
    daysPerWeek: s.int(1, 7),
    notes: s.text(500),
  }),
  priorities: strings(30, 1_000),
  timezone: s.text(64),
};
const nullableProfile = Object.fromEntries(
  Object.entries(profileShape).map(([key, schema]) => [
    key,
    { ...schema, type: [schema.type, 'null'] },
  ])
);
const listFields = Object.fromEntries(
  [
    'experience',
    'skills',
    'interests',
    'disinterests',
    'careerObjectives',
    'desiredDepth',
    'preferredMethods',
    'priorities',
  ].map((key) => [key, profileShape[key]])
);
const assessmentProvenance = s.object(
  {
    agent: s.text(200, { description: 'Who evaluated, e.g. "ChatGPT".' }),
    model: s.text(200),
    evaluator: s.enumOf(['ai-agent', 'learner', 'human-reviewer']),
    rubric: s.text(2_000),
    notes: s.text(2_000),
  },
  []
);
const proposedConcept = s.object({
  id: s.id(),
  name: s.text(200),
  description: s.text(2_000),
  difficulty: s.enumOf(['intro', 'core', 'advanced']),
  priority: s.int(1, 5),
  tags: s.list(s.id(), 10, 'tags[0] must be a track id.'),
  mentalModel: s.text(2_000),
  commonMistakes: strings(10, 500),
  resources: s.list(
    s.object({ title: s.text(300), url: s.url(), type: s.text(40) }, ['title', 'url']),
    10
  ),
});
const priorityChoice = s.object(
  {
    objective: s.text(1_000),
    rationale: s.text(2_000),
    conceptIds: s.list(s.id(), 20),
    topic: s.text(200),
    courseId: s.id(),
    lessonId: s.id(),
    resourceId: s.id(),
    minutes: s.int(5, 600),
  },
  ['objective']
);

function today(ctx) {
  return (ctx.now ?? new Date()).toISOString().slice(0, 10);
}

async function adaptivePriority(ctx, { withOverride = true } = {}) {
  const now = ctx.now ?? new Date();
  const [inputs, legacy, override] = await Promise.all([
    store.loadRecommendationInputs(ctx.db, ctx.userId, now),
    loadDailyLearningProjection(ctx.db, ctx.userId, now),
    withOverride ? store.loadOverride(ctx.db, ctx.userId, today(ctx)) : null,
  ]);
  return buildAdaptivePriority({ inputs, legacy: legacy.priority, now, override });
}

const read = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
const write = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const TOOLS = {
  // --- Existing read tools (preserved names) -------------------------------------
  get_daily_learning_priority: {
    title: "Get today's learning priority",
    description:
      'One adaptive, appropriately challenging objective for today with rationale, curriculum references, deep links and alternatives. Accounts for active courses, assessment evidence, revision due dates, prerequisite gaps, recent sessions, emerging interests from reading and available time. Unassessed concepts are flagged for probing, not treated as beginner material.',
    inputSchema: s.object({}),
    annotations: read,
    handler: (_args, ctx) => adaptivePriority(ctx),
  },
  get_learning_progress: {
    title: 'Get product practice progress',
    description:
      'Product-side spaced-repetition mastery, drill and explain-back activity from the web app. For evidence recorded by agents use get_knowledge_state.',
    inputSchema: s.object({}),
    annotations: read,
    handler: async (_args, ctx) => {
      const projection = await loadDailyLearningProjection(ctx.db, ctx.userId, ctx.now);
      return {
        schemaVersion: projection.schemaVersion,
        generatedAt: projection.generatedAt,
        progress: projection.progress,
        tracking: projection.tracking,
      };
    },
  },
  get_current_learning_check: {
    title: 'Get understanding check',
    description:
      "Answer-free Socratic questions for a concept (default: today's priority concept). Ask one at a time, then record the result with submit_assessment.",
    inputSchema: s.object({ conceptId: s.id() }),
    annotations: read,
    handler: async (args, ctx) => {
      const projection = await loadDailyLearningProjection(ctx.db, ctx.userId, ctx.now);
      const adaptive = args.conceptId ? null : (await adaptivePriority(ctx)).priority;
      const conceptId = args.conceptId ?? adaptive?.concepts?.[0]?.id;
      if (conceptId) {
        const concept = CONCEPT_BY_ID.get(conceptId);
        if (!concept) getCurriculumItem('concept', conceptId);
        projection.priority = {
          ...projection.priority,
          concept: {
            id: concept.id,
            name: concept.name,
            description: concept.description,
            difficulty: concept.difficulty,
            tags: concept.tags,
          },
          actionUrl: adaptive?.actionUrl ?? `${PRODUCT_ORIGIN}/study/concept/${concept.id}`,
          conceptUrl: conceptUrl(concept.id),
        };
      }
      return {
        ...buildCurrentLearningVerification(projection),
        recordWith:
          'submit_assessment (method "socratic" or "explain-back") with the learner response and your evaluation.',
      };
    },
  },
  get_recent_attempts: {
    title: 'Get recent drill attempts',
    description:
      'Recent drill attempts from the web app with submitted code and grader calls (never expected values or reference solutions).',
    inputSchema: s.object({}),
    annotations: read,
    handler: (_args, ctx) => loadAttemptsProjection(ctx.db, ctx.userId, ctx.now),
  },
  search_curriculum: {
    title: 'Search curriculum',
    description:
      'Search tracks, concepts, roadmaps and system-design cases. Concept filters: domain (track id), difficulty, minDifficulty (find advanced material), requires (concepts that build on a concept), prerequisiteOf (what a concept depends on), excludeKnown (hide concepts assessed advanced or above). Each concept shows the learner level.',
    inputSchema: s.object({
      q: { type: 'string', maxLength: 200 },
      kind: s.enumOf(['concept', 'track', 'roadmap', 'system-design-case']),
      domain: s.id(),
      difficulty: s.enumOf(['intro', 'core', 'advanced']),
      minDifficulty: s.enumOf(['intro', 'core', 'advanced']),
      requires: s.id(),
      prerequisiteOf: s.id(),
      excludeKnown: { type: 'boolean' },
      ...page,
    }),
    annotations: read,
    handler: async (args, ctx) => {
      const knowledge = await store.loadAllStates(ctx.db, ctx.userId);
      return searchCurriculum({ ...args, limit: args.limit ?? 20 }, knowledge);
    },
  },
  get_curriculum_item: {
    title: 'Get curriculum item',
    description:
      'One track, roadmap, system-design case or concept. Concepts include prerequisites, dependents, related concepts, learning objectives, resources, exercises and answer-free assessment questions, plus the learner knowledge state.',
    inputSchema: s.object(
      { kind: s.enumOf(['concept', 'track', 'roadmap', 'system-design-case']), id: s.id() },
      ['kind', 'id']
    ),
    annotations: read,
    handler: async (args, ctx) => {
      const item = getCurriculumItem(args.kind, args.id);
      if (args.kind !== 'concept') return item;
      const knowledge = await store.getKnowledgeState(
        ctx.db,
        ctx.userId,
        { subjects: [{ conceptId: args.id }] },
        ctx
      );
      return { ...item, learner: knowledge.items[0] ?? null };
    },
  },
  list_learning_roadmaps: {
    title: 'List learning roadmaps',
    description: 'List curriculum roadmaps with optional text filtering.',
    inputSchema: s.object({ q: { type: 'string', maxLength: 200 }, ...page }),
    annotations: read,
    handler: (args) => searchCurriculum({ ...args, kind: 'roadmap', limit: args.limit ?? 20 }),
  },
  search_system_design_cases: {
    title: 'Search system-design cases',
    description: 'Search system-design cases by text, category or difficulty.',
    inputSchema: s.object({
      q: { type: 'string', maxLength: 200 },
      category: { type: 'string', maxLength: 100 },
      difficulty: { type: 'string', maxLength: 80 },
      ...page,
    }),
    annotations: read,
    handler: (args) =>
      searchCurriculum({
        q: args.q,
        kind: 'system-design-case',
        domain: args.category,
        difficulty: args.difficulty,
        limit: args.limit ?? 20,
        cursor: args.cursor,
      }),
  },
  get_system_design_case: {
    title: 'Get system-design case',
    description: 'Retrieve one system-design case by id.',
    inputSchema: s.object({ id: s.id() }, ['id']),
    annotations: read,
    handler: (args) => getCurriculumItem('system-design-case', args.id),
  },

  // --- Profile & knowledge -------------------------------------------------------
  get_learning_profile: {
    title: 'Get learning profile',
    description:
      'Learner background, experience, skills, interests and disinterests, career objectives, desired depth, preferred methods, available time and priorities, plus per-subject self-reported levels, targets and interest.',
    inputSchema: s.object({}),
    annotations: read,
    handler: (_args, ctx) => store.getProfile(ctx.db, ctx.userId),
  },
  update_learning_profile: {
    title: 'Update learning profile',
    description:
      'Partial update. `set` replaces only the named fields (null clears one); `append`/`remove` edit list fields without overwriting them; `selfAssessments` records self-reported level, target level and interest per subject (stored as self-reported evidence, never as assessed knowledge). Pass expectedVersion to guard against concurrent edits.',
    inputSchema: s.object({
      set: s.object(nullableProfile),
      append: s.object(listFields),
      remove: s.object(listFields),
      selfAssessments: s.list(
        s.object(
          {
            conceptId: s.id(),
            domain: s.id(),
            topic: s.text(200),
            level: s.enumOf(ASSESSED_LEVELS, 'Self-reported level.'),
            targetLevel: s.enumOf(ASSESSED_LEVELS),
            interest: s.enumOf(INTERESTS),
            notes: s.text(1_000),
          },
          []
        ),
        50
      ),
      expectedVersion: s.int(0, 1_000_000),
      idempotencyKey,
    }),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.updateProfile(ctx.db, ctx.userId, args, ctx),
  },
  get_knowledge_state: {
    title: 'Get knowledge state',
    description:
      'Concept, domain and free-topic understanding: assessed level (or "unassessed"), self-reported level, target, interest, assessment confidence, evidence counts, last assessed and review due. Filter by category: previously-known, newly-learned, needs-depth, needs-revision, due-for-review, unassessed.',
    inputSchema: s.object({
      subjects: s.list(
        subject,
        50,
        'Return these subjects (unrecorded ones appear as unassessed).'
      ),
      subjectKind: s.enumOf(['concept', 'domain', 'topic']),
      domain: s.id(),
      category: s.enumOf([
        'previously-known',
        'newly-learned',
        'needs-depth',
        'needs-revision',
        'due-for-review',
        'unassessed',
      ]),
      minInterest: s.enumOf(INTERESTS),
      belowTargetOnly: { type: 'boolean' },
      includeUnassessedCurriculum: {
        type: 'boolean',
        description: 'Also list every untouched curriculum concept as unassessed.',
      },
      ...page,
    }),
    annotations: read,
    handler: (args, ctx) => store.getKnowledgeState(ctx.db, ctx.userId, args, ctx),
  },

  // --- Courses --------------------------------------------------------------------
  create_course: {
    title: 'Create course',
    description:
      'Create a personalized course: title, objective, target level and lessons that reference curriculum concepts (conceptIds) and/or free-text topics for coverage the curriculum lacks. Lessons may declare dependsOn. The first active course becomes primary unless isPrimary is set.',
    inputSchema: s.object(
      {
        title: s.text(300),
        objective: s.text(4_000),
        targetLevel: s.enumOf(ASSESSED_LEVELS),
        status: s.enumOf(COURSE_STATUSES),
        isPrimary: { type: 'boolean' },
        lessons: s.list(lesson, 100),
        supplementalObjectives: strings(50),
        notes: s.text(8_000),
        idempotencyKey,
      },
      ['title', 'objective', 'idempotencyKey']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.createCourse(ctx.db, ctx.userId, args, ctx),
  },
  get_course: {
    title: 'Get course',
    description:
      'Course structure with lessons, per-concept knowledge state, next lesson, progress (activity vs evidence) and recent sessions.',
    inputSchema: s.object({ courseId: s.id() }, ['courseId']),
    annotations: read,
    handler: (args, ctx) => store.getCourse(ctx.db, ctx.userId, args, ctx),
  },
  list_courses: {
    title: 'List courses',
    description: 'List courses, primary first. Filter by status, text or primaryOnly.',
    inputSchema: s.object({
      status: s.enumOf(COURSE_STATUSES),
      primaryOnly: { type: 'boolean' },
      q: { type: 'string', maxLength: 200 },
      ...page,
    }),
    annotations: read,
    handler: (args, ctx) => store.listCourses(ctx.db, ctx.userId, args),
  },
  update_course: {
    title: 'Update course',
    description:
      'Adapt a course. `set` changes title, objective, targetLevel, status (draft, active, paused, completed, archived), isPrimary or notes. `upsertLessons` merges lessons by id (new ones append, or go after insertAfter); `removeLessonIds`; `lessonOrder` reorders; `lessons` replaces all. Supplemental objectives can be added or removed.',
    inputSchema: s.object(
      {
        courseId: s.id(),
        set: s.object({
          title: s.text(300),
          objective: s.text(4_000),
          targetLevel: { ...s.enumOf(ASSESSED_LEVELS), type: ['string', 'null'] },
          status: s.enumOf(COURSE_STATUSES),
          isPrimary: { type: 'boolean' },
          notes: { ...s.text(8_000), type: ['string', 'null'] },
        }),
        lessons: s.list(lesson, 100),
        upsertLessons: s.list(lesson, 100),
        removeLessonIds: s.list(s.id(), 100),
        lessonOrder: s.list(s.id(), 100),
        addSupplementalObjectives: strings(50),
        removeSupplementalObjectives: strings(50),
        expectedVersion: s.int(0, 1_000_000),
        idempotencyKey,
      },
      ['courseId']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.updateCourse(ctx.db, ctx.userId, args, ctx),
  },

  // --- Sessions --------------------------------------------------------------------
  start_learning_session: {
    title: 'Start learning session',
    description:
      'Record a learning session, with or without a course: a course lesson, reading or discussing an article/paper/video, open exploration, practice, review or project work. Pass resources by URL to save and link them automatically; topics may be outside the curriculum. For retrospective logging pass startedAt/endedAt and it is stored as completed. Never marks anything mastered.',
    inputSchema: s.object(
      {
        kind: s.enumOf(SESSION_KINDS),
        title: s.text(300),
        courseId: s.id(),
        lessonId: s.id(),
        lessonStatus: s.enumOf(LESSON_STATUSES, 'Optionally set the linked lesson status.'),
        startedAt: s.dateTime(),
        endedAt: s.dateTime(),
        durationMinutes: s.int(0, 1_440),
        summary: s.text(8_000),
        ...sessionLists,
        idempotencyKey,
      },
      ['title', 'idempotencyKey']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.startSession(ctx.db, ctx.userId, args, ctx),
  },
  update_learning_session: {
    title: 'Update learning session',
    description:
      'Incrementally record activity. `append` adds questions, insights, explanations, exercises, misconceptions, unresolved questions, next steps, concepts, topics, resources and interest signals without overwriting; `remove` deletes exact entries; `set` changes title, kind, summary, course link, duration or start time. Works on completed sessions too.',
    inputSchema: s.object(
      {
        sessionId: s.id(),
        set: s.object({
          title: s.text(300),
          kind: s.enumOf(SESSION_KINDS),
          summary: s.text(8_000),
          courseId: { ...s.id(), type: ['string', 'null'] },
          lessonId: { ...s.id(), type: ['string', 'null'] },
          durationMinutes: s.int(0, 1_440),
          startedAt: s.dateTime(),
        }),
        append: s.object(sessionLists),
        remove: removableLists,
        lessonStatus: s.enumOf(LESSON_STATUSES),
        expectedVersion: s.int(0, 1_000_000),
        idempotencyKey,
      },
      ['sessionId']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.updateSession(ctx.db, ctx.userId, args, ctx),
  },
  complete_learning_session: {
    title: 'Complete learning session',
    description:
      'Finalize a session with summary, end time, final appends and next steps. Rolls up exposure and interest for the concepts and topics touched, promotes linked resources to "discussed", and returns a knowledge snapshot. Does not change assessed levels: record evidence with submit_assessment. Lesson status changes only if lessonStatus is given.',
    inputSchema: s.object(
      {
        sessionId: s.id(),
        summary: s.text(8_000),
        endedAt: s.dateTime(),
        durationMinutes: s.int(0, 1_440),
        append: s.object(sessionLists),
        lessonStatus: s.enumOf(LESSON_STATUSES),
        idempotencyKey,
      },
      ['sessionId']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.updateSession(ctx.db, ctx.userId, args, ctx, { complete: true }),
  },
  get_learning_session: {
    title: 'Get learning session',
    description:
      'One session in full, with its course/lesson, concepts, resources and assessments.',
    inputSchema: s.object({ sessionId: s.id() }, ['sessionId']),
    annotations: read,
    handler: (args, ctx) => store.getSession(ctx.db, ctx.userId, args),
  },
  get_learning_history: {
    title: 'Get learning history',
    description:
      'Chronological session history (newest first by default). Filter by kind, status, course, concept, topic, resource, text, or date range. detail=true returns full records.',
    inputSchema: s.object({
      kind: s.enumOf(SESSION_KINDS),
      status: s.enumOf(['active', 'completed']),
      courseId: s.id(),
      conceptId: s.id(),
      topic: s.text(200),
      resourceId: s.id(),
      q: { type: 'string', maxLength: 200 },
      since: s.dateTime(),
      until: s.dateTime(),
      order: s.enumOf(['desc', 'asc']),
      detail: { type: 'boolean' },
      ...page,
    }),
    annotations: read,
    handler: (args, ctx) => store.getHistory(ctx.db, ctx.userId, args),
  },

  // --- Assessment ------------------------------------------------------------------
  submit_assessment: {
    title: 'Submit assessment',
    description:
      'Persist assessment evidence for a concept, domain or free topic: method (self-assessment, socratic, explain-back, exercise, implementation, debugging, tradeoff-analysis, recall-check), question, learner response, your evaluation, gaps, demonstrated level, outcome (previously-known, newly-learned, needs-depth, needs-revision) and provenance. Updates the assessed level and schedules review. Self-assessment only updates the self-reported level.',
    inputSchema: s.object(
      {
        subject,
        method: s.enumOf(ASSESSMENT_METHODS),
        question: s.text(4_000),
        response: s.text(16_000),
        evaluation: s.text(8_000),
        gaps: strings(30),
        demonstratedLevel: s.enumOf(ASSESSED_LEVELS),
        outcome: s.enumOf(OUTCOMES),
        score: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Optional normalized score.',
        },
        targetLevel: s.enumOf(ASSESSED_LEVELS),
        sessionId: s.id(),
        courseId: s.id(),
        assessedAt: s.dateTime(),
        provenance: assessmentProvenance,
        idempotencyKey,
      },
      ['subject', 'method', 'evaluation', 'demonstratedLevel', 'idempotencyKey']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.submitAssessment(ctx.db, ctx.userId, args, ctx),
  },
  get_assessment_history: {
    title: 'Get assessment history',
    description:
      'Previous assessments with question, response, evaluation, gaps, level, outcome and provenance. Filter by subject, course, session, method, outcome or dates.',
    inputSchema: s.object({
      subject,
      courseId: s.id(),
      sessionId: s.id(),
      method: s.enumOf(ASSESSMENT_METHODS),
      outcome: s.enumOf([...OUTCOMES, 'unverified']),
      since: s.dateTime(),
      until: s.dateTime(),
      ...page,
    }),
    annotations: read,
    handler: (args, ctx) => store.getAssessmentHistory(ctx.db, ctx.userId, args),
  },

  // --- External resources ----------------------------------------------------------
  save_learning_resource: {
    title: 'Save learning resource',
    description:
      'Register an external article, paper, video, documentation page, repository, book or podcast. Deduplicated by canonical URL (tracking parameters, fragments, www, arXiv versions and youtu.be links are normalized): saving again merges concepts/topics, fills only missing metadata and returns the same record (change metadata with update_learning_resource). Status: recommended, saved, reading, discussed, completed. Reading a resource never implies mastery.',
    inputSchema: { ...resourceInput, properties: { ...resourceInput.properties, idempotencyKey } },
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.saveResource(ctx.db, ctx.userId, args, ctx),
  },
  update_learning_resource: {
    title: 'Update learning resource',
    description:
      'Change status, metadata, summary or notes; add or remove concept and topic associations.',
    inputSchema: s.object(
      {
        resourceId: s.id(),
        set: s.object({
          title: s.text(300),
          kind: s.enumOf(RESOURCE_KINDS),
          status: s.enumOf(RESOURCE_STATUSES),
          author: { ...s.text(200), type: ['string', 'null'] },
          publishedAt: { type: ['string', 'null'], maxLength: 40 },
          summary: { ...s.text(4_000), type: ['string', 'null'] },
          notes: { ...s.text(4_000), type: ['string', 'null'] },
        }),
        addConceptIds: s.list(s.id(), 30),
        removeConceptIds: s.list(s.id(), 30),
        addTopics: strings(30, 200),
        removeTopics: strings(30, 200),
        expectedVersion: s.int(0, 1_000_000),
        idempotencyKey,
      },
      ['resourceId']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.updateResource(ctx.db, ctx.userId, args, ctx),
  },
  get_learning_resource: {
    title: 'Get learning resource',
    description:
      'One resource by id or URL, with the sessions that discussed it and their insights and open questions.',
    inputSchema: s.object({ resourceId: s.id(), url: s.url() }),
    annotations: read,
    handler: (args, ctx) => store.getResource(ctx.db, ctx.userId, args),
  },
  list_learning_resources: {
    title: 'List learning resources',
    description:
      'List saved resources, newest activity first. Filter by status, kind, concept, topic or text.',
    inputSchema: s.object({
      status: s.enumOf(RESOURCE_STATUSES),
      kind: s.enumOf(RESOURCE_KINDS),
      conceptId: s.id(),
      topic: s.text(200),
      q: { type: 'string', maxLength: 200 },
      ...page,
    }),
    annotations: read,
    handler: (args, ctx) => store.listResources(ctx.db, ctx.userId, args),
  },

  // --- Curriculum gaps --------------------------------------------------------------
  report_curriculum_gap: {
    title: 'Report curriculum gap',
    description:
      'Record missing or insufficient curriculum coverage without interrupting teaching. Repeated reports of the same topic merge. Returns a contribution guide: a validated concepts.json entry, target file, validation commands and PR title/body, so an agent with GitHub access can open a pull request.',
    inputSchema: s.object(
      {
        topic: s.text(200),
        gapKind: s.enumOf(GAP_KINDS),
        description: s.text(4_000),
        relatedConceptIds: s.list(s.id(), 20),
        prerequisiteConceptIds: s.list(s.id(), 20),
        learningObjectives: strings(20, 1_000),
        evidence: strings(
          20,
          1_000,
          'What revealed the gap, e.g. a question the curriculum could not support.'
        ),
        proposedConcept,
        sessionId: s.id(),
        idempotencyKey,
      },
      ['topic', 'gapKind', 'description']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.reportGap(ctx.db, ctx.userId, args, ctx),
  },
  update_curriculum_gap: {
    title: 'Update curriculum gap',
    description:
      'Attach a pull request URL or change status (open, proposed, pr-opened, resolved, dismissed).',
    inputSchema: s.object(
      {
        gapId: s.id(),
        status: s.enumOf(GAP_STATUSES),
        prUrl: s.url(),
        description: s.text(4_000),
        learningObjectives: strings(20, 1_000),
        proposedConcept,
        idempotencyKey,
      },
      ['gapId']
    ),
    annotations: write,
    mutation: true,
    handler: (args, ctx) => store.updateGap(ctx.db, ctx.userId, args, ctx),
  },
  list_curriculum_gaps: {
    title: 'List curriculum gaps',
    description: 'List recorded curriculum gaps by status.',
    inputSchema: s.object({ status: s.enumOf(GAP_STATUSES), ...page }),
    annotations: read,
    handler: (args, ctx) => store.listGaps(ctx.db, ctx.userId, args),
  },

  // --- Recommendation override & cleanup --------------------------------------------
  override_daily_learning_priority: {
    title: "Override today's priority",
    description:
      "Replace today's recommendation with the learner's or agent's choice and record why. get_daily_learning_priority then returns the override (with the computed recommendation alongside) for the rest of the day.",
    inputSchema: s.object({ chosen: priorityChoice, reason: s.text(2_000), idempotencyKey }, [
      'chosen',
      'reason',
    ]),
    annotations: write,
    mutation: true,
    handler: async (args, ctx) => {
      const computed = await adaptivePriority(ctx, { withOverride: false });
      const override = await store.saveOverride(
        ctx.db,
        ctx.userId,
        {
          day: today(ctx),
          recommended: computed.priority,
          chosen: args.chosen,
          reason: args.reason,
        },
        ctx
      );
      return { override, priority: await adaptivePriority(ctx) };
    },
  },
  delete_learning_record: {
    title: 'Delete learning record',
    description:
      "Permanently delete one record: course, session (cascade=true also deletes its assessments), assessment, resource, curriculum-gap, or knowledge-state (with subject; also deletes that subject's assessments). Knowledge is recomputed from remaining evidence. Use for corrections and removing test data.",
    inputSchema: s.object(
      {
        entity: s.enumOf([
          'course',
          'session',
          'assessment',
          'resource',
          'curriculum-gap',
          'knowledge-state',
        ]),
        id: s.id(),
        subject,
        cascade: { type: 'boolean' },
        idempotencyKey,
      },
      ['entity']
    ),
    annotations: { ...write, destructiveHint: true },
    mutation: true,
    handler: (args, ctx) => store.deleteRecord(ctx.db, ctx.userId, args, ctx),
  },
};

export function toolList() {
  return Object.entries(TOOLS).map(([name, tool]) => ({
    name,
    title: tool.title,
    description: tool.description,
    inputSchema: tool.inputSchema,
    annotations: { title: tool.title, ...tool.annotations },
  }));
}

export function requireTool(name) {
  const tool = Object.hasOwn(TOOLS, name) ? TOOLS[name] : null;
  if (!tool) throw invalid(`Unknown tool "${name}".`);
  return tool;
}
