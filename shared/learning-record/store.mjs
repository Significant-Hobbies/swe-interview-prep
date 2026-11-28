/**
 * D1 persistence for the adaptive learning record. Every function is scoped to
 * one user id supplied by the authenticated caller; no query reads across users.
 */
import {
  CONCEPT_BY_ID,
  PRODUCT_ORIGIN,
  conceptSummary,
  contributionGuide,
  requireConceptIds,
} from './curriculum.mjs';
import {
  applyAssessment,
  categoryOf,
  emptyState,
  presentState,
  replayAssessments,
  resolveSubject,
} from './knowledge.mjs';
import {
  INTEREST_RANK,
  LearningRecordError,
  RESOURCE_STATUS_RANK,
  canonicalUrl,
  decodeCursor,
  encodeCursor,
  invalid,
  notFound,
  parseJson,
  sha256Hex,
  slugify,
  stableStringify,
  topicKey,
  uniqueStrings,
} from './schema.mjs';

const RECORD_URL = `${PRODUCT_ORIGIN}/record`;
export const links = {
  profile: () => `${RECORD_URL}#profile`,
  knowledge: () => `${RECORD_URL}#knowledge`,
  course: (id) => `${RECORD_URL}/courses/${encodeURIComponent(id)}`,
  session: (id) => `${RECORD_URL}/sessions/${encodeURIComponent(id)}`,
  resource: (id) => `${RECORD_URL}/resources/${encodeURIComponent(id)}`,
  gap: (id) => `${RECORD_URL}#gap-${encodeURIComponent(id)}`,
};

const MAX_PAGE = 50;

function nowIso(ctx) {
  return (ctx?.now ?? new Date()).toISOString();
}

async function newId(prefix, ctx, seed) {
  const basis = seed ?? ctx?.idempotencySeed;
  if (basis)
    return `${prefix}_${(await sha256Hex(`${ctx?.userId ?? ''}:${prefix}:${basis}`)).slice(0, 24)}`;
  return `${prefix}_${crypto.randomUUID().replace(/-/gu, '').slice(0, 24)}`;
}

function pageArgs(args) {
  const limit = Math.min(Math.max(args.limit ?? 20, 1), MAX_PAGE);
  return { limit, offset: decodeCursor(args.cursor) };
}

function pageResult(rows, { limit, offset }, map) {
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map(map);
  return { items, nextCursor: hasMore ? encodeCursor(offset + limit) : null };
}

function conflict(message) {
  return new LearningRecordError('version_conflict', message);
}

function dedupeObjects(values, limit = 200) {
  const seen = new Set();
  const output = [];
  for (const value of values ?? []) {
    const key = stableStringify(value);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(value);
    if (output.length >= limit) break;
  }
  return output;
}

// --- Knowledge -----------------------------------------------------------------

async function loadStates(db, userId, keys) {
  if (!keys.length) return new Map();
  const result = await db.execute({
    sql: `SELECT * FROM knowledge_states WHERE user_id = ? AND subject_key IN (${keys.map(() => '?').join(',')})`,
    args: [userId, ...keys],
  });
  return new Map(result.rows.map((row) => [row.subject_key, row]));
}

export async function loadAllStates(db, userId) {
  const result = await db.execute({
    sql: 'SELECT * FROM knowledge_states WHERE user_id = ?',
    args: [userId],
  });
  return new Map(result.rows.map((row) => [row.subject_key, row]));
}

function saveStateStatement(userId, state, ctx) {
  return {
    sql: `INSERT INTO knowledge_states (
            user_id, subject_key, subject_kind, label, self_reported_level, assessed_level,
            target_level, interest, confidence, outcome, evidence_count, exposure_count,
            review_interval_days, review_due_at, last_assessed_at, last_engaged_at, notes, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, subject_key) DO UPDATE SET
            subject_kind = excluded.subject_kind, label = excluded.label,
            self_reported_level = excluded.self_reported_level,
            assessed_level = excluded.assessed_level, target_level = excluded.target_level,
            interest = excluded.interest, confidence = excluded.confidence,
            outcome = excluded.outcome, evidence_count = excluded.evidence_count,
            exposure_count = excluded.exposure_count,
            review_interval_days = excluded.review_interval_days,
            review_due_at = excluded.review_due_at, last_assessed_at = excluded.last_assessed_at,
            last_engaged_at = excluded.last_engaged_at, notes = excluded.notes,
            updated_at = excluded.updated_at`,
    args: [
      userId,
      state.subject_key,
      state.subject_kind,
      state.label,
      state.self_reported_level ?? null,
      state.assessed_level ?? null,
      state.target_level ?? null,
      state.interest ?? null,
      state.confidence ?? 0,
      state.outcome ?? null,
      state.evidence_count ?? 0,
      state.exposure_count ?? 0,
      state.review_interval_days ?? null,
      state.review_due_at ?? null,
      state.last_assessed_at ?? null,
      state.last_engaged_at ?? null,
      state.notes ?? null,
      nowIso(ctx),
    ],
  };
}

/** Subjects from a session/resource: curriculum concepts plus free-text topics. */
function subjectsFrom(conceptIds = [], topics = []) {
  const subjects = new Map();
  for (const conceptId of conceptIds) {
    const subject = resolveSubject({ conceptId });
    subjects.set(subject.key, subject);
  }
  for (const topic of topics) {
    const subject = resolveSubject({ topic });
    if (!subjects.has(subject.key)) subjects.set(subject.key, subject);
  }
  return [...subjects.values()];
}

export async function getKnowledgeState(db, userId, args, ctx) {
  const now = ctx?.now ?? new Date();
  const states = await loadAllStates(db, userId);
  let entries = [...states.values()];
  if (args.subjects?.length) {
    const keys = new Set(args.subjects.map((subject) => resolveSubject(subject).key));
    entries = entries.filter((state) => keys.has(state.subject_key));
    for (const subject of args.subjects) {
      const resolved = resolveSubject(subject);
      if (!states.has(resolved.key)) entries.push(emptyState(resolved));
    }
  }
  if (args.includeUnassessedCurriculum) {
    for (const concept of CONCEPT_BY_ID.values()) {
      if (!states.has(concept.id)) {
        entries.push(emptyState({ key: concept.id, kind: 'concept', label: concept.name }));
      }
    }
  }
  if (args.subjectKind)
    entries = entries.filter((state) => state.subject_kind === args.subjectKind);
  if (args.domain) {
    entries = entries.filter((state) => {
      if (state.subject_key === `domain:${args.domain}`) return true;
      return (CONCEPT_BY_ID.get(state.subject_key)?.tags ?? []).includes(args.domain);
    });
  }
  if (args.minInterest) {
    entries = entries.filter(
      (state) => (INTEREST_RANK[state.interest] ?? -2) >= INTEREST_RANK[args.minInterest]
    );
  }
  const presented = entries.map((state) => presentState(state, now));
  const summary = {};
  for (const entry of presented) summary[entry.category] = (summary[entry.category] ?? 0) + 1;
  let filtered = presented;
  if (args.category) filtered = presented.filter((entry) => entry.category === args.category);
  if (args.belowTargetOnly) filtered = filtered.filter((entry) => entry.belowTarget);
  filtered.sort(
    (a, b) =>
      String(b.lastAssessedAt ?? b.lastEngagedAt ?? '').localeCompare(
        String(a.lastAssessedAt ?? a.lastEngagedAt ?? '')
      ) || a.subject.key.localeCompare(b.subject.key)
  );
  const { limit, offset } = pageArgs(args);
  const items = filtered.slice(offset, offset + limit);
  return {
    summary: {
      recordedSubjects: states.size,
      curriculumConcepts: CONCEPT_BY_ID.size,
      unassessedCurriculumConcepts: [...CONCEPT_BY_ID.keys()].filter(
        (id) => !states.get(id)?.assessed_level
      ).length,
      byCategory: summary,
    },
    items,
    total: filtered.length,
    nextCursor:
      offset + items.length < filtered.length ? encodeCursor(offset + items.length) : null,
    policy:
      'A subject without assessed evidence is "unassessed", never beginner. Self-reported levels are listed separately and never count as demonstrated understanding.',
    url: links.knowledge(),
  };
}

// --- Assessments ---------------------------------------------------------------

function presentAssessment(row) {
  const concept = CONCEPT_BY_ID.get(row.subject_key);
  return {
    id: row.id,
    subject: {
      key: row.subject_key,
      conceptId: concept ? concept.id : null,
      label: concept?.name ?? row.subject_key.replace(/^(topic|domain):/u, '').replace(/-/gu, ' '),
    },
    method: row.method,
    question: row.question ?? null,
    response: row.response ?? null,
    evaluation: row.evaluation,
    gaps: parseJson(row.gaps_json, []),
    demonstratedLevel: row.demonstrated_level,
    outcome: row.outcome,
    score: row.score ?? null,
    sessionId: row.session_id ?? null,
    courseId: row.course_id ?? null,
    provenance: parseJson(row.provenance_json, {}),
    assessedAt: row.assessed_at,
    sessionUrl: row.session_id ? links.session(row.session_id) : null,
  };
}

async function requireOwned(db, table, userId, id, label) {
  const result = await db.execute({
    sql: `SELECT * FROM ${table} WHERE user_id = ? AND id = ? LIMIT 1`,
    args: [userId, id],
  });
  const row = result.rows[0];
  if (!row) throw notFound(`${label} "${id}" was not found for this learner.`);
  return row;
}

export async function submitAssessment(db, userId, args, ctx) {
  const subject = resolveSubject(args.subject);
  if (args.method !== 'self-assessment' && !args.outcome) {
    throw invalid('outcome is required for evidence-based assessments.');
  }
  let sessionRow = null;
  if (args.sessionId)
    sessionRow = await requireOwned(db, 'learning_sessions', userId, args.sessionId, 'Session');
  if (args.courseId) await requireOwned(db, 'learning_courses', userId, args.courseId, 'Course');
  const id = await newId('asm', ctx);
  const existing = await db.execute({
    sql: 'SELECT * FROM learning_assessments WHERE user_id = ? AND id = ?',
    args: [userId, id],
  });
  if (existing.rows[0]) {
    return { assessment: presentAssessment(existing.rows[0]), replayed: true };
  }
  const row = {
    id,
    subject_key: subject.key,
    session_id: args.sessionId ?? null,
    course_id: args.courseId ?? sessionRow?.course_id ?? null,
    method: args.method,
    question: args.question ?? null,
    response: args.response ?? null,
    evaluation: args.evaluation,
    gaps_json: JSON.stringify(uniqueStrings(args.gaps ?? [])),
    demonstrated_level: args.demonstratedLevel,
    outcome: args.outcome ?? 'unverified',
    score: args.score ?? null,
    provenance_json: JSON.stringify({
      recordedVia: 'mcp',
      clientName: ctx?.clientName ?? null,
      ...(args.provenance ?? {}),
    }),
    assessed_at: args.assessedAt ? new Date(args.assessedAt).toISOString() : nowIso(ctx),
  };
  const before =
    (await loadStates(db, userId, [subject.key])).get(subject.key) ?? emptyState(subject);
  const after = applyAssessment({ ...before, label: before.label ?? subject.label }, row);
  if (args.targetLevel) after.target_level = args.targetLevel;
  const statements = [
    {
      sql: `INSERT INTO learning_assessments (id, user_id, subject_key, session_id, course_id, method,
              question, response, evaluation, gaps_json, demonstrated_level, outcome, score,
              provenance_json, assessed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        row.id,
        userId,
        row.subject_key,
        row.session_id,
        row.course_id,
        row.method,
        row.question,
        row.response,
        row.evaluation,
        row.gaps_json,
        row.demonstrated_level,
        row.outcome,
        row.score,
        row.provenance_json,
        row.assessed_at,
      ],
    },
    saveStateStatement(userId, after, ctx),
  ];
  if (sessionRow) {
    const record = parseJson(sessionRow.record_json, {});
    record.assessmentIds = uniqueStrings([...(record.assessmentIds ?? []), id]);
    if (subject.kind === 'concept') {
      record.conceptIds = uniqueStrings([...(record.conceptIds ?? []), subject.key]);
    } else if (subject.kind === 'topic') {
      record.topics = uniqueStrings([...(record.topics ?? []), subject.label]);
    }
    statements.push({
      sql: `UPDATE learning_sessions SET record_json = ?, version = version + 1, updated_at = ?
            WHERE user_id = ? AND id = ?`,
      args: [JSON.stringify(record), nowIso(ctx), userId, sessionRow.id],
    });
  }
  await db.batch(statements);
  return {
    assessment: presentAssessment({ ...row, user_id: userId }),
    knowledgeBefore: presentState(before, ctx?.now),
    knowledgeAfter: presentState(after, ctx?.now),
    policy:
      row.method === 'self-assessment'
        ? 'Self-assessment updates the self-reported level only; assessed level is unchanged.'
        : 'Assessed level reflects this evidence. Review is scheduled from the outcome.',
  };
}

export async function getAssessmentHistory(db, userId, args) {
  const where = ['user_id = ?'];
  const params = [userId];
  if (args.subject) {
    where.push('subject_key = ?');
    params.push(resolveSubject(args.subject).key);
  }
  for (const [field, column] of [
    ['courseId', 'course_id'],
    ['sessionId', 'session_id'],
    ['method', 'method'],
    ['outcome', 'outcome'],
  ]) {
    if (args[field]) {
      where.push(`${column} = ?`);
      params.push(args[field]);
    }
  }
  if (args.since) {
    where.push('assessed_at >= ?');
    params.push(new Date(args.since).toISOString());
  }
  if (args.until) {
    where.push('assessed_at <= ?');
    params.push(new Date(args.until).toISOString());
  }
  const paging = pageArgs(args);
  const result = await db.execute({
    sql: `SELECT * FROM learning_assessments WHERE ${where.join(' AND ')}
          ORDER BY assessed_at DESC, id DESC LIMIT ? OFFSET ?`,
    args: [...params, paging.limit + 1, paging.offset],
  });
  return pageResult(result.rows, paging, presentAssessment);
}

// --- Profile -------------------------------------------------------------------

const PROFILE_ARRAY_FIELDS = new Set([
  'experience',
  'skills',
  'interests',
  'disinterests',
  'careerObjectives',
  'desiredDepth',
  'preferredMethods',
  'priorities',
]);

export async function getProfile(db, userId) {
  const [profile, legacy, selfReported] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM learner_profiles WHERE user_id = ?', args: [userId] }),
    db.execute({ sql: 'SELECT profile_json FROM user_profile WHERE user_id = ?', args: [userId] }),
    db.execute({
      sql: `SELECT subject_key, subject_kind, label, self_reported_level, target_level, interest
            FROM knowledge_states WHERE user_id = ?
              AND (self_reported_level IS NOT NULL OR target_level IS NOT NULL OR interest IS NOT NULL)
            ORDER BY updated_at DESC LIMIT 200`,
      args: [userId],
    }),
  ]);
  const row = profile.rows[0];
  const legacyProfile = parseJson(legacy.rows[0]?.profile_json, {});
  const data = parseJson(row?.profile_json, {});
  return {
    profile: data,
    version: row?.version ?? 0,
    updatedAt: row?.updated_at ?? null,
    productPreferences: {
      minutesPerDay: legacyProfile.minutesPerDay ?? null,
      trackIds: legacyProfile.trackIds ?? [],
    },
    subjectPreferences: selfReported.rows.map((state) => ({
      subject: { key: state.subject_key, kind: state.subject_kind, label: state.label },
      selfReportedLevel: state.self_reported_level ?? null,
      targetLevel: state.target_level ?? null,
      interest: state.interest ?? null,
    })),
    policy: 'Self-reported familiarity is stored separately from assessed knowledge.',
    url: links.profile(),
  };
}

export async function updateProfile(db, userId, args, ctx) {
  const current = await db.execute({
    sql: 'SELECT * FROM learner_profiles WHERE user_id = ?',
    args: [userId],
  });
  const row = current.rows[0];
  const version = row?.version ?? 0;
  if (args.expectedVersion !== undefined && args.expectedVersion !== version) {
    throw conflict(
      `Profile is at version ${version}, not ${args.expectedVersion}. Re-read and retry.`
    );
  }
  const profile = parseJson(row?.profile_json, {});
  for (const [key, value] of Object.entries(args.set ?? {})) {
    if (value === null) delete profile[key];
    else profile[key] = value;
  }
  for (const [key, values] of Object.entries(args.append ?? {})) {
    if (!PROFILE_ARRAY_FIELDS.has(key)) throw invalid(`append.${key} is not a list field.`);
    const merged = [...(profile[key] ?? []), ...values];
    profile[key] = merged.every((value) => typeof value === 'string')
      ? uniqueStrings(merged)
      : dedupeObjects(merged);
  }
  for (const [key, values] of Object.entries(args.remove ?? {})) {
    if (!PROFILE_ARRAY_FIELDS.has(key)) throw invalid(`remove.${key} is not a list field.`);
    const drop = new Set(
      values.map((value) =>
        stableStringify(typeof value === 'string' ? value.toLowerCase() : value)
      )
    );
    profile[key] = (profile[key] ?? []).filter(
      (value) =>
        !drop.has(stableStringify(typeof value === 'string' ? value.toLowerCase() : value)) &&
        !(
          typeof value === 'object' &&
          value?.name &&
          drop.has(stableStringify(String(value.name).toLowerCase()))
        )
    );
  }
  const statements = [];
  const changedProfile = args.set || args.append || args.remove;
  if (changedProfile) {
    statements.push(
      row
        ? {
            sql: `UPDATE learner_profiles SET profile_json = ?, version = version + 1, updated_at = ?
                  WHERE user_id = ? AND version = ?`,
            args: [JSON.stringify(profile), nowIso(ctx), userId, version],
          }
        : {
            sql: `INSERT INTO learner_profiles (user_id, profile_json, version, updated_at)
                  VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING`,
            args: [userId, JSON.stringify(profile), nowIso(ctx)],
          }
    );
  }
  const selfAssessments = args.selfAssessments ?? [];
  if (selfAssessments.length) {
    const subjects = selfAssessments.map((item) => resolveSubject(item));
    const states = await loadStates(
      db,
      userId,
      subjects.map((subject) => subject.key)
    );
    for (const [index, item] of selfAssessments.entries()) {
      const subject = subjects[index];
      let state = states.get(subject.key) ?? emptyState(subject);
      if (item.level) {
        const assessment = {
          id: await newId(
            'asm',
            ctx,
            ctx?.idempotencySeed ? `${ctx.idempotencySeed}:${index}` : undefined
          ),
          method: 'self-assessment',
          demonstrated_level: item.level,
          outcome: 'unverified',
          assessed_at: nowIso(ctx),
        };
        state = applyAssessment(state, assessment);
        statements.push({
          sql: `INSERT OR IGNORE INTO learning_assessments (id, user_id, subject_key, method, evaluation,
                  demonstrated_level, outcome, provenance_json, assessed_at)
                VALUES (?, ?, ?, 'self-assessment', ?, ?, 'unverified', ?, ?)`,
          args: [
            assessment.id,
            userId,
            subject.key,
            item.notes ?? 'Learner self-assessment recorded through the learning profile.',
            item.level,
            JSON.stringify({
              recordedVia: 'mcp',
              source: 'learner-self-report',
              clientName: ctx?.clientName ?? null,
            }),
            assessment.assessed_at,
          ],
        });
      }
      if (item.targetLevel !== undefined) state.target_level = item.targetLevel;
      if (item.interest !== undefined) state.interest = item.interest;
      if (item.notes !== undefined) state.notes = item.notes;
      states.set(subject.key, state);
      statements.push(saveStateStatement(userId, state, ctx));
    }
  }
  if (!statements.length)
    throw invalid('Nothing to update: pass set, append, remove or selfAssessments.');
  const results = await db.batch(statements);
  if (changedProfile && results[0].rowsAffected === 0) {
    throw conflict('Profile changed concurrently. Re-read with get_learning_profile and retry.');
  }
  return getProfile(db, userId);
}

// --- Courses -------------------------------------------------------------------

function normalizeLessons(lessons, existing = []) {
  const used = new Set();
  const normalized = lessons.map((lesson, index) => {
    const previous = existing.find((item) => item.id === lesson.id);
    let id = lesson.id ?? slugify(lesson.title) ?? `lesson-${index + 1}`;
    if (!id) id = `lesson-${index + 1}`;
    while (used.has(id)) id = `${id}-${index + 1}`;
    used.add(id);
    const conceptIds = requireConceptIds(
      uniqueStrings(lesson.conceptIds ?? previous?.conceptIds ?? []),
      `lessons[${index}].conceptIds`
    );
    return {
      id,
      title: lesson.title ?? previous?.title,
      objective: lesson.objective ?? previous?.objective ?? null,
      conceptIds,
      topics: uniqueStrings(lesson.topics ?? previous?.topics ?? []).map((topic) => {
        resolveSubject({ topic });
        return topic;
      }),
      dependsOn: uniqueStrings(lesson.dependsOn ?? previous?.dependsOn ?? []),
      status: lesson.status ?? previous?.status ?? 'planned',
      notes: lesson.notes ?? previous?.notes ?? null,
    };
  });
  const ids = new Set(normalized.map((lesson) => lesson.id));
  for (const lesson of normalized) {
    if (!lesson.title) throw invalid(`Lesson "${lesson.id}" needs a title.`);
    const missing = lesson.dependsOn.filter((id) => !ids.has(id) || id === lesson.id);
    if (missing.length) {
      throw invalid(
        `Lesson "${lesson.id}" depends on unknown lesson id(s): ${missing.join(', ')}.`
      );
    }
  }
  return normalized;
}

function nextLesson(lessons) {
  const done = new Set(
    lessons
      .filter((lesson) => ['completed', 'skipped'].includes(lesson.status))
      .map((lesson) => lesson.id)
  );
  return (
    lessons.find(
      (lesson) => lesson.status === 'active' && lesson.dependsOn.every((id) => done.has(id))
    ) ??
    lessons.find(
      (lesson) => lesson.status === 'planned' && lesson.dependsOn.every((id) => done.has(id))
    ) ??
    null
  );
}

export { nextLesson as nextCourseLesson };

function courseFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    objective: row.objective,
    targetLevel: row.target_level ?? null,
    status: row.status,
    isPrimary: Boolean(row.is_primary),
    lessons: parseJson(row.lessons_json, []),
    supplementalObjectives: parseJson(row.supplemental_objectives_json, []),
    notes: row.notes ?? null,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    url: links.course(row.id),
  };
}

async function loadCourses(db, userId, statuses) {
  const result = await db.execute({
    sql: `SELECT * FROM learning_courses WHERE user_id = ?
          ${statuses ? `AND status IN (${statuses.map(() => '?').join(',')})` : ''}
          ORDER BY is_primary DESC, updated_at DESC`,
    args: [userId, ...(statuses ?? [])],
  });
  return result.rows.map(courseFromRow);
}

function courseProgress(course, states, now) {
  const lessons = course.lessons;
  const conceptIds = uniqueStrings(lessons.flatMap((lesson) => lesson.conceptIds));
  const topicKeys = uniqueStrings(lessons.flatMap((lesson) => lesson.topics))
    .map((topic) => {
      try {
        return resolveSubject({ topic }).key;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const target = course.targetLevel;
  const evidence = {
    subjects: 0,
    atOrAboveTarget: 0,
    belowTarget: 0,
    unassessed: 0,
    needsRevision: 0,
  };
  for (const key of uniqueStrings([...conceptIds, ...topicKeys])) {
    evidence.subjects += 1;
    const state = states.get(key);
    const category = categoryOf(state, now);
    if (category === 'unassessed') evidence.unassessed += 1;
    else {
      const levelRank = ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(
        state.assessed_level
      );
      const targetRank = target
        ? ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(target)
        : 1;
      if (levelRank >= targetRank) evidence.atOrAboveTarget += 1;
      else evidence.belowTarget += 1;
      if (category === 'needs-revision' || category === 'due-for-review')
        evidence.needsRevision += 1;
    }
  }
  return {
    lessons: {
      total: lessons.length,
      completed: lessons.filter((lesson) => lesson.status === 'completed').length,
      active: lessons.filter((lesson) => lesson.status === 'active').length,
      skipped: lessons.filter((lesson) => lesson.status === 'skipped').length,
    },
    evidence,
    policy: 'Lesson completion is activity. Evidence counts come only from assessments.',
  };
}

async function shouldBePrimary(db, userId, args, status) {
  if (args.isPrimary !== undefined) return args.isPrimary;
  if (status !== 'active') return false;
  const primaries = await db.execute({
    sql: "SELECT id FROM learning_courses WHERE user_id = ? AND is_primary = 1 AND status = 'active'",
    args: [userId],
  });
  return primaries.rows.length === 0;
}

const CLEAR_PRIMARY = (userId) => ({
  sql: 'UPDATE learning_courses SET is_primary = 0 WHERE user_id = ? AND is_primary = 1',
  args: [userId],
});

export async function createCourse(db, userId, args, ctx) {
  const id = await newId('crs', ctx);
  const existing = await db.execute({
    sql: 'SELECT id FROM learning_courses WHERE user_id = ? AND id = ?',
    args: [userId, id],
  });
  if (existing.rows[0]) return getCourse(db, userId, { courseId: id }, ctx);
  const lessons = normalizeLessons(args.lessons ?? []);
  const status = args.status ?? 'active';
  const isPrimary = await shouldBePrimary(db, userId, args, status);
  const insert = {
    sql: `INSERT INTO learning_courses (id, user_id, title, objective, target_level, status, is_primary,
            lessons_json, supplemental_objectives_json, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      userId,
      args.title,
      args.objective,
      args.targetLevel ?? null,
      status,
      isPrimary ? 1 : 0,
      JSON.stringify(lessons),
      JSON.stringify(uniqueStrings(args.supplementalObjectives ?? [])),
      args.notes ?? null,
      nowIso(ctx),
      nowIso(ctx),
    ],
  };
  await db.batch(isPrimary ? [CLEAR_PRIMARY(userId), insert] : [insert]);
  return getCourse(db, userId, { courseId: id }, ctx);
}

export async function getCourse(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_courses', userId, args.courseId, 'Course');
  const course = courseFromRow(row);
  const keys = uniqueStrings(course.lessons.flatMap((lesson) => lesson.conceptIds));
  const topicKeys = course.lessons.flatMap((lesson) =>
    lesson.topics.map((topic) => resolveSubject({ topic }).key)
  );
  const states = await loadStates(db, userId, uniqueStrings([...keys, ...topicKeys]));
  const sessions = await db.execute({
    sql: `SELECT id, kind, title, status, lesson_id, started_at, ended_at, summary FROM learning_sessions
          WHERE user_id = ? AND course_id = ? ORDER BY started_at DESC LIMIT 10`,
    args: [userId, course.id],
  });
  const now = ctx?.now ?? new Date();
  const upcoming = nextLesson(course.lessons);
  return {
    course: {
      ...course,
      lessons: course.lessons.map((lesson) => ({
        ...lesson,
        concepts: lesson.conceptIds.map((conceptId) => ({
          ...conceptSummary(CONCEPT_BY_ID.get(conceptId)),
          knowledge: presentState(
            states.get(conceptId) ?? emptyState(resolveSubject({ conceptId })),
            now
          ),
        })),
      })),
      nextLessonId: upcoming?.id ?? null,
      progress: courseProgress(course, states, now),
      recentSessions: sessions.rows.map((session) => ({
        id: session.id,
        kind: session.kind,
        title: session.title,
        status: session.status,
        lessonId: session.lesson_id ?? null,
        startedAt: session.started_at,
        endedAt: session.ended_at ?? null,
        summary: session.summary ?? null,
        url: links.session(session.id),
      })),
    },
  };
}

export async function listCourses(db, userId, args) {
  const where = ['user_id = ?'];
  const params = [userId];
  if (args.status) {
    where.push('status = ?');
    params.push(args.status);
  }
  if (args.primaryOnly) where.push('is_primary = 1');
  if (args.q) {
    where.push('(title LIKE ? OR objective LIKE ?)');
    params.push(`%${args.q}%`, `%${args.q}%`);
  }
  const paging = pageArgs(args);
  const result = await db.execute({
    sql: `SELECT * FROM learning_courses WHERE ${where.join(' AND ')}
          ORDER BY is_primary DESC, updated_at DESC, id LIMIT ? OFFSET ?`,
    args: [...params, paging.limit + 1, paging.offset],
  });
  return pageResult(result.rows, paging, (row) => {
    const course = courseFromRow(row);
    const upcoming = nextLesson(course.lessons);
    return {
      id: course.id,
      title: course.title,
      objective: course.objective,
      status: course.status,
      isPrimary: course.isPrimary,
      targetLevel: course.targetLevel,
      lessonCount: course.lessons.length,
      completedLessons: course.lessons.filter((lesson) => lesson.status === 'completed').length,
      nextLesson: upcoming ? { id: upcoming.id, title: upcoming.title } : null,
      updatedAt: course.updatedAt,
      url: course.url,
    };
  });
}

/** Value for a nullable field in a partial `set`: null clears, undefined keeps. */
function patched(set, key, current) {
  if (set[key] === null) return null;
  return set[key] ?? current;
}

function upsertLessons(lessons, upserts) {
  const next = [...lessons];
  for (const lesson of upserts) {
    const index = lesson.id ? next.findIndex((item) => item.id === lesson.id) : -1;
    if (index >= 0) {
      next[index] = { ...next[index], ...lesson };
      continue;
    }
    if (!lesson.insertAfter) {
      next.push(lesson);
      continue;
    }
    const after = next.findIndex((item) => item.id === lesson.insertAfter);
    if (after < 0) throw invalid(`insertAfter lesson "${lesson.insertAfter}" does not exist.`);
    next.splice(after + 1, 0, lesson);
  }
  return next;
}

function removeLessons(lessons, ids) {
  const drop = new Set(ids);
  return lessons
    .filter((lesson) => !drop.has(lesson.id))
    .map((lesson) => ({
      ...lesson,
      dependsOn: (lesson.dependsOn ?? []).filter((id) => !drop.has(id)),
    }));
}

function reorderLessons(lessons, order) {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const ordered = order.map((id) => {
    if (!byId.has(id)) throw invalid(`lessonOrder references unknown lesson "${id}".`);
    return byId.get(id);
  });
  return [...ordered, ...lessons.filter((lesson) => !order.includes(lesson.id))];
}

function editedLessons(course, args) {
  let lessons = args.lessons ?? course.lessons;
  if (args.upsertLessons?.length) lessons = upsertLessons(lessons, args.upsertLessons);
  if (args.removeLessonIds?.length) lessons = removeLessons(lessons, args.removeLessonIds);
  if (args.lessonOrder?.length) lessons = reorderLessons(lessons, args.lessonOrder);
  return normalizeLessons(
    lessons.map(({ insertAfter: _ignored, ...lesson }) => lesson),
    course.lessons
  );
}

function editedSupplemental(course, args) {
  const remove = new Set(
    (args.removeSupplementalObjectives ?? []).map((value) => value.toLowerCase())
  );
  return uniqueStrings([
    ...course.supplementalObjectives.filter((item) => !remove.has(item.toLowerCase())),
    ...(args.addSupplementalObjectives ?? []),
  ]);
}

function courseUpdateArgs(course, args) {
  const set = args.set || {};
  const status = set.status || course.status;
  const isPrimary = set.isPrimary ?? (status === 'active' && course.isPrimary);
  return {
    isPrimary,
    values: [
      set.title || course.title,
      set.objective || course.objective,
      patched(set, 'targetLevel', course.targetLevel),
      status,
      isPrimary ? 1 : 0,
      JSON.stringify(editedLessons(course, args)),
      JSON.stringify(editedSupplemental(course, args)),
      patched(set, 'notes', course.notes),
    ],
  };
}

export async function updateCourse(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_courses', userId, args.courseId, 'Course');
  assertVersion(row, args.expectedVersion, 'Course', 'get_course');
  const course = courseFromRow(row);
  const { isPrimary, values } = courseUpdateArgs(course, args);
  const update = {
    sql: `UPDATE learning_courses SET title = ?, objective = ?, target_level = ?, status = ?,
            is_primary = ?, lessons_json = ?, supplemental_objectives_json = ?, notes = ?,
            version = version + 1, updated_at = ?
          WHERE user_id = ? AND id = ? AND version = ?`,
    args: [...values, nowIso(ctx), userId, course.id, row.version],
  };
  const results = await db.batch(
    isPrimary && !course.isPrimary ? [CLEAR_PRIMARY(userId), update] : [update]
  );
  if (results.at(-1).rowsAffected === 0) {
    throw conflict('Course changed concurrently. Re-read with get_course and retry.');
  }
  return getCourse(db, userId, { courseId: course.id }, ctx);
}

// --- Resources -----------------------------------------------------------------

function resourceFromRow(row) {
  return {
    id: row.id,
    url: row.url,
    canonicalUrl: row.canonical_url,
    title: row.title,
    kind: row.kind,
    status: row.status,
    author: row.author ?? null,
    publishedAt: row.published_at ?? null,
    summary: row.summary ?? null,
    conceptIds: parseJson(row.concept_ids_json, []),
    topics: parseJson(row.topics_json, []),
    notes: row.notes ?? null,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    detailUrl: links.resource(row.id),
  };
}

/** Upsert by canonical URL; status only moves forward unless set explicitly. */
async function findResourceByUrl(db, userId, canonical) {
  const result = await db.execute({
    sql: 'SELECT * FROM learning_resources WHERE user_id = ? AND canonical_url = ?',
    args: [userId, canonical],
  });
  return result.rows[0] ?? null;
}

const RESOURCE_OPTIONAL_FIELDS = ['author', 'publishedAt', 'summary', 'notes'];

function optionalFields(source) {
  return Object.fromEntries(RESOURCE_OPTIONAL_FIELDS.map((key) => [key, source[key] ?? null]));
}

async function insertResource(db, userId, canonical, args, conceptIds, ctx, autoStatus) {
  if (!args.title) throw invalid('title is required when saving a new resource.');
  const id = await newId('res', { ...ctx, idempotencySeed: undefined }, canonical);
  const optional = optionalFields(args);
  const status = args.status || autoStatus || 'saved';
  await db.execute({
    sql: `INSERT INTO learning_resources (id, user_id, canonical_url, url, title, kind, status, author,
            published_at, summary, concept_ids_json, topics_json, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, canonical_url) DO NOTHING`,
    args: [
      id,
      userId,
      canonical,
      args.url,
      args.title,
      args.kind || 'article',
      status,
      optional.author,
      optional.publishedAt,
      optional.summary,
      JSON.stringify(conceptIds),
      JSON.stringify(uniqueStrings(args.topics || [])),
      optional.notes,
      nowIso(ctx),
      nowIso(ctx),
    ],
  });
}

function nextResourceStatus(current, explicit, autoStatus) {
  if (explicit) return explicit;
  if (autoStatus && RESOURCE_STATUS_RANK[autoStatus] > RESOURCE_STATUS_RANK[current])
    return autoStatus;
  return current;
}

/** Re-saving a known URL merges associations and fills only missing metadata. */
/** Re-saving a known URL merges associations and fills only missing metadata. */
async function mergeResource(db, userId, current, args, conceptIds, ctx, autoStatus) {
  const incoming = optionalFields(args);
  const kept = optionalFields(current);
  const filled = Object.fromEntries(
    RESOURCE_OPTIONAL_FIELDS.map((key) => [key, kept[key] === null ? incoming[key] : kept[key]])
  );
  await db.execute({
    sql: `UPDATE learning_resources SET status = ?, author = ?, published_at = ?, summary = ?,
            concept_ids_json = ?, topics_json = ?, notes = ?, version = version + 1, updated_at = ?
          WHERE user_id = ? AND id = ?`,
    args: [
      nextResourceStatus(current.status, args.status, autoStatus),
      filled.author,
      filled.publishedAt,
      filled.summary,
      JSON.stringify(uniqueStrings([...current.conceptIds, ...conceptIds])),
      JSON.stringify(uniqueStrings([...current.topics, ...(args.topics || [])])),
      filled.notes,
      nowIso(ctx),
      userId,
      current.id,
    ],
  });
}

/** Upsert by canonical URL; status only moves forward unless set explicitly. */
export async function saveResource(db, userId, args, ctx, { autoStatus } = {}) {
  const canonical = canonicalUrl(args.url);
  const conceptIds = requireConceptIds(uniqueStrings(args.conceptIds ?? []));
  const row = await findResourceByUrl(db, userId, canonical);
  if (row) await mergeResource(db, userId, resourceFromRow(row), args, conceptIds, ctx, autoStatus);
  else await insertResource(db, userId, canonical, args, conceptIds, ctx, autoStatus);
  return {
    resource: resourceFromRow(await findResourceByUrl(db, userId, canonical)),
    created: !row,
  };
}

function editedList(current, add, remove) {
  const drop = new Set((remove ?? []).map((value) => value.toLowerCase()));
  return uniqueStrings([
    ...current.filter((value) => !drop.has(value.toLowerCase())),
    ...(add ?? []),
  ]);
}

export async function updateResource(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_resources', userId, args.resourceId, 'Resource');
  if (args.expectedVersion !== undefined && args.expectedVersion !== row.version) {
    throw conflict(
      `Resource is at version ${row.version}, not ${args.expectedVersion}. Re-read and retry.`
    );
  }
  const current = resourceFromRow(row);
  const set = args.set ?? {};
  requireConceptIds(uniqueStrings(args.addConceptIds ?? []), 'addConceptIds');
  await db.execute({
    sql: `UPDATE learning_resources SET title = ?, kind = ?, status = ?, author = ?, published_at = ?,
            summary = ?, notes = ?, concept_ids_json = ?, topics_json = ?, version = version + 1, updated_at = ?
          WHERE user_id = ? AND id = ?`,
    args: [
      set.title ?? current.title,
      set.kind ?? current.kind,
      set.status ?? current.status,
      patched(set, 'author', current.author),
      patched(set, 'publishedAt', current.publishedAt),
      patched(set, 'summary', current.summary),
      patched(set, 'notes', current.notes),
      JSON.stringify(editedList(current.conceptIds, args.addConceptIds, args.removeConceptIds)),
      JSON.stringify(editedList(current.topics, args.addTopics, args.removeTopics)),
      nowIso(ctx),
      userId,
      current.id,
    ],
  });
  return getResource(db, userId, { resourceId: current.id });
}

export async function getResource(db, userId, args) {
  let row;
  if (args.resourceId)
    row = await requireOwned(db, 'learning_resources', userId, args.resourceId, 'Resource');
  else if (args.url) {
    const result = await db.execute({
      sql: 'SELECT * FROM learning_resources WHERE user_id = ? AND canonical_url = ?',
      args: [userId, canonicalUrl(args.url)],
    });
    row = result.rows[0];
    if (!row)
      throw notFound('No saved resource matches that URL. Save it with save_learning_resource.');
  } else throw invalid('Pass resourceId or url.');
  const sessions = await db.execute({
    sql: `SELECT id, kind, title, status, started_at, summary, record_json FROM learning_sessions
          WHERE user_id = ? AND EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.resourceIds') WHERE value = ?)
          ORDER BY started_at DESC LIMIT 20`,
    args: [userId, row.id],
  });
  return {
    resource: resourceFromRow(row),
    sessions: sessions.rows.map((session) => {
      const record = parseJson(session.record_json, {});
      return {
        id: session.id,
        kind: session.kind,
        title: session.title,
        status: session.status,
        startedAt: session.started_at,
        summary: session.summary ?? null,
        insights: record.insights ?? [],
        unresolvedQuestions: record.unresolvedQuestions ?? [],
        url: links.session(session.id),
      };
    }),
    policy: 'Reading or discussing a resource never marks its concepts as mastered.',
  };
}

export async function listResources(db, userId, args) {
  const where = ['user_id = ?'];
  const params = [userId];
  for (const [field, column] of [
    ['status', 'status'],
    ['kind', 'kind'],
  ]) {
    if (args[field]) {
      where.push(`${column} = ?`);
      params.push(args[field]);
    }
  }
  if (args.conceptId) {
    where.push(
      'EXISTS (SELECT 1 FROM json_each(learning_resources.concept_ids_json) WHERE value = ?)'
    );
    params.push(args.conceptId);
  }
  if (args.topic) {
    where.push(
      'EXISTS (SELECT 1 FROM json_each(learning_resources.topics_json) WHERE lower(value) = lower(?))'
    );
    params.push(args.topic);
  }
  if (args.q) {
    where.push('(title LIKE ? OR summary LIKE ? OR canonical_url LIKE ?)');
    params.push(`%${args.q}%`, `%${args.q}%`, `%${args.q}%`);
  }
  const paging = pageArgs(args);
  const result = await db.execute({
    sql: `SELECT * FROM learning_resources WHERE ${where.join(' AND ')}
          ORDER BY updated_at DESC, id LIMIT ? OFFSET ?`,
    args: [...params, paging.limit + 1, paging.offset],
  });
  return pageResult(result.rows, paging, resourceFromRow);
}

// --- Sessions ------------------------------------------------------------------

const SESSION_STRING_LISTS = [
  'objectives',
  'topics',
  'questions',
  'insights',
  'explanations',
  'misconceptions',
  'unresolvedQuestions',
  'nextSteps',
  'conceptIds',
  'resourceIds',
];
const SESSION_OBJECT_LISTS = ['exercises', 'interestSignals'];

function sessionFromRow(row) {
  const record = parseJson(row.record_json, {});
  return {
    id: row.id,
    kind: row.kind,
    status: row.status,
    title: row.title,
    courseId: row.course_id ?? null,
    lessonId: row.lesson_id ?? null,
    summary: row.summary ?? null,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? null,
    durationMinutes: row.duration_minutes ?? null,
    ...Object.fromEntries(SESSION_STRING_LISTS.map((key) => [key, record[key] ?? []])),
    ...Object.fromEntries(SESSION_OBJECT_LISTS.map((key) => [key, record[key] ?? []])),
    assessmentIds: record.assessmentIds ?? [],
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    url: links.session(row.id),
  };
}

async function resolveSessionResources(db, userId, resources, ctx) {
  const ids = [];
  for (const resource of resources ?? []) {
    const { resource: saved } = await saveResource(db, userId, resource, ctx, {
      autoStatus: 'discussed',
    });
    ids.push(saved.id);
  }
  return ids;
}

async function requireResourceIds(db, userId, ids) {
  if (!ids?.length) return;
  const found = await db.execute({
    sql: `SELECT id FROM learning_resources WHERE user_id = ? AND id IN (${ids.map(() => '?').join(',')})`,
    args: [userId, ...ids],
  });
  const known = new Set(found.rows.map((row) => row.id));
  const missing = ids.filter((id) => !known.has(id));
  if (missing.length) throw notFound(`Unknown resource id(s): ${missing.join(', ')}.`);
}

function validateRecordSubjects(changes) {
  if (changes.conceptIds) requireConceptIds(changes.conceptIds);
  for (const topic of changes.topics ?? []) resolveSubject({ topic });
  for (const signal of changes.interestSignals ?? []) resolveSubject(signal.subject);
}

async function mergeRecord(db, userId, record, changes, ctx) {
  validateRecordSubjects(changes);
  await requireResourceIds(db, userId, changes.resourceIds);
  const saved = await resolveSessionResources(db, userId, changes.resources, ctx);
  const additions = { ...changes, resourceIds: [...(changes.resourceIds ?? []), ...saved] };
  const next = { ...record };
  for (const key of SESSION_STRING_LISTS) {
    if (additions[key]?.length)
      next[key] = uniqueStrings([...(next[key] ?? []), ...additions[key]]);
  }
  for (const key of SESSION_OBJECT_LISTS) {
    if (additions[key]?.length)
      next[key] = dedupeObjects([...(next[key] ?? []), ...additions[key]]);
  }
  return next;
}

function removeFromRecord(record, removals = {}) {
  const next = { ...record };
  for (const [key, values] of Object.entries(removals)) {
    const drop = new Set(values.map((value) => value.toLowerCase()));
    next[key] = (next[key] ?? []).filter((value) => !drop.has(String(value).toLowerCase()));
  }
  return next;
}

async function validateCourseLink(db, userId, courseId, lessonId) {
  if (!courseId) {
    if (lessonId) throw invalid('lessonId requires courseId.');
    return null;
  }
  const row = await requireOwned(db, 'learning_courses', userId, courseId, 'Course');
  const course = courseFromRow(row);
  if (lessonId && !course.lessons.some((lesson) => lesson.id === lessonId)) {
    throw invalid(
      `Course "${courseId}" has no lesson "${lessonId}". Lessons: ${course.lessons.map((lesson) => lesson.id).join(', ') || 'none'}.`
    );
  }
  return { row, course };
}

function lessonStatusStatement(userId, link, lessonId, status, ctx) {
  const lessons = link.course.lessons.map((lesson) =>
    lesson.id === lessonId ? { ...lesson, status } : lesson
  );
  return {
    sql: `UPDATE learning_courses SET lessons_json = ?, version = version + 1, updated_at = ?
          WHERE user_id = ? AND id = ?`,
    args: [JSON.stringify(lessons), nowIso(ctx), userId, link.course.id],
  };
}

/** Engagement roll-up: exposure and interest only, never assessed level. */
async function engagementStatements(db, userId, record, endedAt, ctx) {
  const subjects = subjectsFrom(record.conceptIds, record.topics);
  const signals = (record.interestSignals ?? []).map((signal) => ({
    subject: resolveSubject(signal.subject),
    interest: signal.interest,
  }));
  for (const signal of signals) {
    if (!subjects.some((subject) => subject.key === signal.subject.key))
      subjects.push(signal.subject);
  }
  const states = await loadStates(
    db,
    userId,
    subjects.map((subject) => subject.key)
  );
  return subjects.map((subject) => {
    const state = { ...(states.get(subject.key) ?? emptyState(subject)) };
    state.exposure_count = (state.exposure_count ?? 0) + 1;
    state.last_engaged_at = endedAt;
    const signal = signals.find((item) => item.subject.key === subject.key);
    if (signal) state.interest = signal.interest;
    return saveStateStatement(userId, state, ctx);
  });
}

function minutesBetween(startedAt, endedAt) {
  return Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 60_000);
}

function sessionTimes(args, ctx) {
  const startedAt = args.startedAt ? new Date(args.startedAt).toISOString() : nowIso(ctx);
  const endedAt = args.endedAt ? new Date(args.endedAt).toISOString() : null;
  if (endedAt && endedAt < startedAt) throw invalid('endedAt must not be before startedAt.');
  const duration = args.durationMinutes ?? (endedAt ? minutesBetween(startedAt, endedAt) : null);
  return { startedAt, endedAt, duration };
}

function startLessonStatement(userId, link, args, ctx) {
  if (!link || !args.lessonId) return null;
  const lesson = link.course.lessons.find((item) => item.id === args.lessonId);
  const status = args.lessonStatus ?? (lesson.status === 'planned' ? 'active' : null);
  return status ? lessonStatusStatement(userId, link, args.lessonId, status, ctx) : null;
}

export async function startSession(db, userId, args, ctx) {
  const id = await newId('ses', ctx);
  const existing = await db.execute({
    sql: 'SELECT * FROM learning_sessions WHERE user_id = ? AND id = ?',
    args: [userId, id],
  });
  if (existing.rows[0]) return getSession(db, userId, { sessionId: id });
  const link = await validateCourseLink(db, userId, args.courseId, args.lessonId);
  const record = await mergeRecord(db, userId, {}, args, ctx);
  const { startedAt, endedAt, duration } = sessionTimes(args, ctx);
  const statements = [
    {
      sql: `INSERT INTO learning_sessions (id, user_id, kind, status, title, course_id, lesson_id,
              record_json, summary, started_at, ended_at, duration_minutes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        userId,
        args.kind ?? (args.courseId ? 'course-lesson' : 'exploration'),
        endedAt ? 'completed' : 'active',
        args.title,
        args.courseId ?? null,
        args.lessonId ?? null,
        JSON.stringify(record),
        args.summary ?? null,
        startedAt,
        endedAt,
        duration,
        nowIso(ctx),
        nowIso(ctx),
      ],
    },
  ];
  const lessonStatement = startLessonStatement(userId, link, args, ctx);
  if (lessonStatement) statements.push(lessonStatement);
  if (endedAt) statements.push(...(await engagementStatements(db, userId, record, endedAt, ctx)));
  await db.batch(statements);
  return getSession(db, userId, { sessionId: id });
}

function isoOr(value, fallback) {
  return value ? new Date(value).toISOString() : fallback;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null) ?? null;
}

function completionTimes(row, set, args, ctx, complete) {
  const startedAt = isoOr(set.startedAt, row.started_at);
  const endedAt = complete ? isoOr(args.endedAt, row.ended_at || nowIso(ctx)) : row.ended_at;
  if (endedAt && endedAt < startedAt) throw invalid('endedAt must not be before startedAt.');
  const derived = complete && endedAt ? minutesBetween(startedAt, endedAt) : null;
  return {
    startedAt,
    endedAt,
    duration: firstDefined(
      args.durationMinutes,
      set.durationMinutes,
      row.duration_minutes,
      derived
    ),
  };
}

async function knowledgeSnapshot(db, userId, session, ctx) {
  const subjects = subjectsFrom(session.conceptIds, session.topics);
  const states = await loadStates(
    db,
    userId,
    subjects.map((subject) => subject.key)
  );
  return subjects.map((subject) =>
    presentState(states.get(subject.key) ?? emptyState(subject), ctx?.now)
  );
}

function assertVersion(row, expected, label, reread) {
  if (expected !== undefined && expected !== row.version) {
    throw conflict(
      `${label} is at version ${row.version}, not ${expected}. Re-read with ${reread} and retry.`
    );
  }
}

function sessionUpdateStatement(userId, row, fields, ctx) {
  return {
    sql: `UPDATE learning_sessions SET kind = ?, status = ?, title = ?, course_id = ?, lesson_id = ?,
            record_json = ?, summary = ?, started_at = ?, ended_at = ?, duration_minutes = ?,
            version = version + 1, updated_at = ?
          WHERE user_id = ? AND id = ? AND version = ?`,
    args: [
      fields.kind,
      fields.status,
      fields.title,
      fields.courseId,
      fields.lessonId,
      JSON.stringify(fields.record),
      fields.summary,
      fields.startedAt,
      fields.endedAt,
      fields.duration,
      nowIso(ctx),
      userId,
      row.id,
      row.version,
    ],
  };
}

async function sessionSideEffects(db, userId, context, ctx) {
  const { link, lessonId, args, complete, row, record, endedAt } = context;
  const statements = [];
  if (link && lessonId && args.lessonStatus) {
    statements.push(lessonStatusStatement(userId, link, lessonId, args.lessonStatus, ctx));
  }
  if (complete && row.status !== 'completed') {
    statements.push(...(await engagementStatements(db, userId, record, endedAt, ctx)));
  }
  return statements;
}

export async function updateSession(db, userId, args, ctx, { complete = false } = {}) {
  const row = await requireOwned(db, 'learning_sessions', userId, args.sessionId, 'Session');
  assertVersion(row, args.expectedVersion, 'Session', 'get_learning_session');
  const set = args.set || {};
  const courseId = patched(set, 'courseId', row.course_id);
  const lessonId = patched(set, 'lessonId', row.lesson_id);
  const link = await validateCourseLink(db, userId, courseId, lessonId);
  const cleaned = removeFromRecord(parseJson(row.record_json, {}), args.remove);
  const record = await mergeRecord(db, userId, cleaned, args.append || {}, ctx);
  const times = completionTimes(row, set, args, ctx, complete);
  const fields = {
    ...times,
    kind: set.kind || row.kind,
    status: complete ? 'completed' : row.status,
    title: set.title || row.title,
    courseId,
    lessonId,
    record,
    summary: firstDefined(args.summary, set.summary, row.summary),
  };
  const sideEffects = await sessionSideEffects(
    db,
    userId,
    { link, lessonId, args, complete, row, record, endedAt: times.endedAt },
    ctx
  );
  const results = await db.batch([
    sessionUpdateStatement(userId, row, fields, ctx),
    ...sideEffects,
  ]);
  if (results[0].rowsAffected === 0) {
    throw conflict('Session changed concurrently. Re-read with get_learning_session and retry.');
  }
  const detail = await getSession(db, userId, { sessionId: row.id });
  if (!complete) return detail;
  return {
    ...detail,
    knowledgeSnapshot: await knowledgeSnapshot(db, userId, detail.session, ctx),
    policy:
      'Completing a session records activity and exposure only. Use submit_assessment to record demonstrated understanding.',
  };
}

export async function getSession(db, userId, args) {
  const row = await requireOwned(db, 'learning_sessions', userId, args.sessionId, 'Session');
  const session = sessionFromRow(row);
  const [assessments, resources, course] = await Promise.all([
    db.execute({
      sql: 'SELECT * FROM learning_assessments WHERE user_id = ? AND session_id = ? ORDER BY assessed_at',
      args: [userId, session.id],
    }),
    session.resourceIds.length
      ? db.execute({
          sql: `SELECT * FROM learning_resources WHERE user_id = ? AND id IN (${session.resourceIds.map(() => '?').join(',')})`,
          args: [userId, ...session.resourceIds],
        })
      : { rows: [] },
    session.courseId
      ? db.execute({
          sql: 'SELECT id, title, lessons_json FROM learning_courses WHERE user_id = ? AND id = ?',
          args: [userId, session.courseId],
        })
      : { rows: [] },
  ]);
  const courseRow = course.rows[0];
  const lesson = courseRow
    ? parseJson(courseRow.lessons_json, []).find((item) => item.id === session.lessonId)
    : null;
  return {
    session: {
      ...session,
      course: courseRow
        ? { id: courseRow.id, title: courseRow.title, url: links.course(courseRow.id) }
        : null,
      lesson: lesson ? { id: lesson.id, title: lesson.title, status: lesson.status } : null,
      concepts: session.conceptIds
        .filter((id) => CONCEPT_BY_ID.has(id))
        .map((id) => conceptSummary(CONCEPT_BY_ID.get(id))),
      resources: resources.rows.map(resourceFromRow),
      assessments: assessments.rows.map(presentAssessment),
    },
  };
}

export async function getHistory(db, userId, args) {
  const where = ['user_id = ?'];
  const params = [userId];
  for (const [field, column] of [
    ['kind', 'kind'],
    ['status', 'status'],
    ['courseId', 'course_id'],
  ]) {
    if (args[field]) {
      where.push(`${column} = ?`);
      params.push(args[field]);
    }
  }
  if (args.conceptId) {
    where.push(
      "EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.conceptIds') WHERE value = ?)"
    );
    params.push(args.conceptId);
  }
  if (args.topic) {
    where.push(
      "EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.topics') WHERE lower(value) = lower(?))"
    );
    params.push(args.topic);
  }
  if (args.resourceId) {
    where.push(
      "EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.resourceIds') WHERE value = ?)"
    );
    params.push(args.resourceId);
  }
  if (args.q) {
    where.push('(title LIKE ? OR summary LIKE ? OR record_json LIKE ?)');
    params.push(`%${args.q}%`, `%${args.q}%`, `%${args.q}%`);
  }
  if (args.since) {
    where.push('started_at >= ?');
    params.push(new Date(args.since).toISOString());
  }
  if (args.until) {
    where.push('started_at <= ?');
    params.push(new Date(args.until).toISOString());
  }
  const order = args.order === 'asc' ? 'ASC' : 'DESC';
  const paging = pageArgs(args);
  const result = await db.execute({
    sql: `SELECT * FROM learning_sessions WHERE ${where.join(' AND ')}
          ORDER BY started_at ${order}, id ${order} LIMIT ? OFFSET ?`,
    args: [...params, paging.limit + 1, paging.offset],
  });
  return pageResult(result.rows, paging, (row) => {
    const session = sessionFromRow(row);
    if (args.detail) return session;
    return {
      id: session.id,
      kind: session.kind,
      status: session.status,
      title: session.title,
      courseId: session.courseId,
      lessonId: session.lessonId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationMinutes: session.durationMinutes,
      summary: session.summary,
      conceptIds: session.conceptIds,
      topics: session.topics,
      resourceIds: session.resourceIds,
      insights: session.insights.slice(0, 5),
      unresolvedQuestions: session.unresolvedQuestions,
      nextSteps: session.nextSteps,
      assessmentCount: session.assessmentIds.length,
      url: session.url,
    };
  });
}

// --- Curriculum gaps -------------------------------------------------------------

const GAP_RECORD_DEFAULTS = {
  relatedConceptIds: [],
  prerequisiteConceptIds: [],
  learningObjectives: [],
  proposedConcept: null,
  evidence: [],
  reportCount: 1,
};

function gapFromRow(row) {
  const record = { ...GAP_RECORD_DEFAULTS, ...parseJson(row.record_json, {}) };
  return {
    id: row.id,
    topic: row.topic,
    gapKind: row.gap_kind,
    description: row.description,
    status: row.status,
    prUrl: row.pr_url ?? null,
    sessionId: row.session_id ?? null,
    relatedConceptIds: record.relatedConceptIds,
    prerequisiteConceptIds: record.prerequisiteConceptIds,
    learningObjectives: record.learningObjectives,
    proposedConcept: record.proposedConcept,
    evidence: record.evidence,
    reportCount: record.reportCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    url: links.gap(row.id),
  };
}

const OPEN_GAP_SQL = `SELECT * FROM curriculum_gaps WHERE user_id = ? AND topic_key = ?
  AND status IN ('open', 'proposed', 'pr-opened') ORDER BY created_at LIMIT 1`;

function mergeGapRecord(record, args) {
  const merge = (key) => uniqueStrings([...(record[key] ?? []), ...(args[key] ?? [])]);
  return {
    relatedConceptIds: merge('relatedConceptIds'),
    prerequisiteConceptIds: merge('prerequisiteConceptIds'),
    learningObjectives: merge('learningObjectives'),
    proposedConcept: args.proposedConcept ?? record.proposedConcept ?? null,
    evidence: merge('evidence'),
    reportCount: (record.reportCount ?? 1) + 1,
  };
}

async function insertGap(db, userId, key, args, ctx) {
  const id = await newId('gap', ctx);
  await db.execute({
    sql: `INSERT OR IGNORE INTO curriculum_gaps (id, user_id, topic, topic_key, gap_kind, description, status,
            record_json, session_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?)`,
    args: [
      id,
      userId,
      args.topic,
      key,
      args.gapKind,
      args.description,
      JSON.stringify({ ...mergeGapRecord({}, args), reportCount: 1 }),
      args.sessionId ?? null,
      nowIso(ctx),
      nowIso(ctx),
    ],
  });
}

export async function reportGap(db, userId, args, ctx) {
  requireConceptIds(args.relatedConceptIds ?? [], 'relatedConceptIds');
  requireConceptIds(args.prerequisiteConceptIds ?? [], 'prerequisiteConceptIds');
  if (args.sessionId)
    await requireOwned(db, 'learning_sessions', userId, args.sessionId, 'Session');
  const key = topicKey(args.topic);
  const row = (await db.execute({ sql: OPEN_GAP_SQL, args: [userId, key] })).rows[0];
  if (row) {
    const merged = mergeGapRecord(parseJson(row.record_json, {}), args);
    await db.execute({
      sql: `UPDATE curriculum_gaps SET description = ?, gap_kind = ?, record_json = ?, updated_at = ?
            WHERE user_id = ? AND id = ?`,
      args: [
        args.description ?? row.description,
        args.gapKind ?? row.gap_kind,
        JSON.stringify(merged),
        nowIso(ctx),
        userId,
        row.id,
      ],
    });
  } else {
    await insertGap(db, userId, key, args, ctx);
  }
  const gap = gapFromRow((await db.execute({ sql: OPEN_GAP_SQL, args: [userId, key] })).rows[0]);
  return { gap, merged: Boolean(row), contribution: contributionGuide(gap) };
}

export async function updateGap(db, userId, args, ctx) {
  const row = await requireOwned(db, 'curriculum_gaps', userId, args.gapId, 'Curriculum gap');
  const record = parseJson(row.record_json, {});
  if (args.learningObjectives) record.learningObjectives = uniqueStrings(args.learningObjectives);
  if (args.proposedConcept) record.proposedConcept = args.proposedConcept;
  await db.execute({
    sql: `UPDATE curriculum_gaps SET status = ?, pr_url = ?, description = ?, record_json = ?, updated_at = ?
          WHERE user_id = ? AND id = ?`,
    args: [
      args.status ?? (args.prUrl && row.status === 'open' ? 'pr-opened' : row.status),
      args.prUrl ?? row.pr_url,
      args.description ?? row.description,
      JSON.stringify(record),
      nowIso(ctx),
      userId,
      row.id,
    ],
  });
  const gap = gapFromRow(
    await requireOwned(db, 'curriculum_gaps', userId, row.id, 'Curriculum gap')
  );
  return { gap, contribution: contributionGuide(gap) };
}

export async function listGaps(db, userId, args) {
  const paging = pageArgs(args);
  const result = await db.execute({
    sql: `SELECT * FROM curriculum_gaps WHERE user_id = ? ${args.status ? 'AND status = ?' : ''}
          ORDER BY updated_at DESC, id LIMIT ? OFFSET ?`,
    args: [userId, ...(args.status ? [args.status] : []), paging.limit + 1, paging.offset],
  });
  return pageResult(result.rows, paging, gapFromRow);
}

// --- Priority overrides ----------------------------------------------------------

export async function loadOverride(db, userId, day) {
  const result = await db.execute({
    sql: `SELECT * FROM learning_priority_overrides WHERE user_id = ? AND day = ?
          ORDER BY created_at DESC LIMIT 1`,
    args: [userId, day],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    day: row.day,
    reason: row.reason,
    chosen: parseJson(row.chosen_json, {}),
    recommended: parseJson(row.recommended_json, {}),
    createdAt: row.created_at,
  };
}

export async function saveOverride(db, userId, { day, recommended, chosen, reason }, ctx) {
  if (chosen.conceptIds) requireConceptIds(chosen.conceptIds, 'chosen.conceptIds');
  if (chosen.courseId) await validateCourseLink(db, userId, chosen.courseId, chosen.lessonId);
  if (chosen.resourceId)
    await requireOwned(db, 'learning_resources', userId, chosen.resourceId, 'Resource');
  const id = await newId('ovr', ctx);
  await db.execute({
    sql: `INSERT OR IGNORE INTO learning_priority_overrides (id, user_id, day, recommended_json, chosen_json, reason, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      userId,
      day,
      JSON.stringify(recommended),
      JSON.stringify(chosen),
      reason,
      nowIso(ctx),
    ],
  });
  return loadOverride(db, userId, day);
}

// --- Deletion (cleanup) ------------------------------------------------------------

async function replaySubjects(db, userId, keys, ctx) {
  const statements = [];
  for (const key of uniqueStrings(keys)) {
    const state = (await loadStates(db, userId, [key])).get(key);
    if (!state) continue;
    const assessments = await db.execute({
      sql: 'SELECT * FROM learning_assessments WHERE user_id = ? AND subject_key = ?',
      args: [userId, key],
    });
    statements.push(saveStateStatement(userId, replayAssessments(state, assessments.rows), ctx));
  }
  if (statements.length) await db.batch(statements);
}

async function deleteKnowledgeState(db, userId, args) {
  const subject = resolveSubject(args.subject ?? {});
  const result = await db.batch([
    {
      sql: 'DELETE FROM learning_assessments WHERE user_id = ? AND subject_key = ?',
      args: [userId, subject.key],
    },
    {
      sql: 'DELETE FROM knowledge_states WHERE user_id = ? AND subject_key = ?',
      args: [userId, subject.key],
    },
  ]);
  return {
    entity: 'knowledge-state',
    subject: subject.key,
    deleted: result[1].rowsAffected > 0,
    deletedAssessments: result[0].rowsAffected,
  };
}

async function detachAssessmentFromSession(db, userId, row) {
  if (!row.session_id) return;
  const session = await db.execute({
    sql: 'SELECT record_json FROM learning_sessions WHERE user_id = ? AND id = ?',
    args: [userId, row.session_id],
  });
  if (!session.rows[0]) return;
  const record = parseJson(session.rows[0].record_json, {});
  record.assessmentIds = (record.assessmentIds ?? []).filter((id) => id !== row.id);
  await db.execute({
    sql: 'UPDATE learning_sessions SET record_json = ?, version = version + 1 WHERE user_id = ? AND id = ?',
    args: [JSON.stringify(record), userId, row.session_id],
  });
}

async function deleteAssessment(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_assessments', userId, args.id, 'Assessment');
  await db.execute({
    sql: 'DELETE FROM learning_assessments WHERE user_id = ? AND id = ?',
    args: [userId, row.id],
  });
  await detachAssessmentFromSession(db, userId, row);
  await replaySubjects(db, userId, [row.subject_key], ctx);
  return { entity: 'assessment', id: row.id, deleted: true };
}

async function deleteSession(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_sessions', userId, args.id, 'Session');
  let subjects = [];
  const statements = [];
  if (args.cascade) {
    const assessments = await db.execute({
      sql: 'SELECT subject_key FROM learning_assessments WHERE user_id = ? AND session_id = ?',
      args: [userId, row.id],
    });
    subjects = assessments.rows.map((item) => item.subject_key);
    statements.push({
      sql: 'DELETE FROM learning_assessments WHERE user_id = ? AND session_id = ?',
      args: [userId, row.id],
    });
  } else {
    statements.push({
      sql: 'UPDATE learning_assessments SET session_id = NULL WHERE user_id = ? AND session_id = ?',
      args: [userId, row.id],
    });
  }
  statements.push({
    sql: 'DELETE FROM learning_sessions WHERE user_id = ? AND id = ?',
    args: [userId, row.id],
  });
  await db.batch(statements);
  await replaySubjects(db, userId, subjects, ctx);
  return { entity: 'session', id: row.id, deleted: true, deletedAssessments: subjects.length };
}

async function deleteCourse(db, userId, args) {
  const row = await requireOwned(db, 'learning_courses', userId, args.id, 'Course');
  await db.batch([
    {
      sql: 'UPDATE learning_sessions SET course_id = NULL, lesson_id = NULL WHERE user_id = ? AND course_id = ?',
      args: [userId, row.id],
    },
    {
      sql: 'UPDATE learning_assessments SET course_id = NULL WHERE user_id = ? AND course_id = ?',
      args: [userId, row.id],
    },
    { sql: 'DELETE FROM learning_courses WHERE user_id = ? AND id = ?', args: [userId, row.id] },
  ]);
  return { entity: 'course', id: row.id, deleted: true };
}

function simpleDelete(entity, table, label) {
  return async (db, userId, args) => {
    const row = await requireOwned(db, table, userId, args.id, label);
    await db.execute({
      sql: `DELETE FROM ${table} WHERE user_id = ? AND id = ?`,
      args: [userId, row.id],
    });
    return { entity, id: row.id, deleted: true };
  };
}

const DELETERS = {
  'knowledge-state': deleteKnowledgeState,
  assessment: deleteAssessment,
  session: deleteSession,
  course: deleteCourse,
  resource: simpleDelete('resource', 'learning_resources', 'Resource'),
  'curriculum-gap': simpleDelete('curriculum-gap', 'curriculum_gaps', 'Curriculum gap'),
};

export async function deleteRecord(db, userId, args, ctx) {
  const deleter = DELETERS[args.entity];
  if (!deleter) throw invalid(`Unsupported entity "${args.entity}".`);
  if (args.entity !== 'knowledge-state' && !args.id)
    throw invalid('id is required for this entity.');
  return deleter(db, userId, args, ctx);
}

// --- Idempotency -----------------------------------------------------------------

export async function findReceipt(db, userId, key) {
  const result = await db.execute({
    sql: 'SELECT tool, request_hash, response_json FROM mcp_mutation_receipts WHERE user_id = ? AND idempotency_key = ?',
    args: [userId, key],
  });
  return result.rows[0] ?? null;
}

export async function saveReceipt(db, userId, key, tool, hash, response) {
  await db.execute({
    sql: `INSERT OR IGNORE INTO mcp_mutation_receipts (user_id, idempotency_key, tool, request_hash, response_json)
          VALUES (?, ?, ?, ?, ?)`,
    args: [userId, key, tool, hash, JSON.stringify(response)],
  });
}

// --- Recommendation inputs --------------------------------------------------------

export async function loadRecommendationInputs(db, userId, now) {
  const since = new Date(now.getTime() - 21 * 86_400_000).toISOString();
  const [profile, courses, states, sessions, resources, gaps] = await Promise.all([
    getProfile(db, userId),
    loadCourses(db, userId, ['active']),
    loadAllStates(db, userId),
    db.execute({
      sql: `SELECT * FROM learning_sessions WHERE user_id = ? AND started_at >= ?
            ORDER BY started_at DESC LIMIT 50`,
      args: [userId, since],
    }),
    db.execute({
      sql: `SELECT * FROM learning_resources WHERE user_id = ? AND status IN ('recommended', 'saved', 'reading')
            ORDER BY updated_at DESC LIMIT 50`,
      args: [userId],
    }),
    db.execute({
      sql: "SELECT COUNT(*) AS count FROM curriculum_gaps WHERE user_id = ? AND status IN ('open', 'proposed', 'pr-opened')",
      args: [userId],
    }),
  ]);
  return {
    profile,
    courses,
    states,
    sessions: sessions.rows.map(sessionFromRow),
    resources: resources.rows.map(resourceFromRow),
    openGaps: Number(gaps.rows[0]?.count ?? 0),
  };
}
