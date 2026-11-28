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
import { categoryOf, deriveState, emptyState, presentState, resolveSubject } from './knowledge.mjs';
import {
  INTEREST_RANK,
  LearningRecordError,
  RESOURCE_STATUS_RANK,
  canonicalUrl,
  decodeKeyset,
  encodeKeyset,
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
  gap: (id) => `${RECORD_URL}/gaps/${encodeURIComponent(id)}`,
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

function pageLimit(args) {
  return Math.min(Math.max(args.limit ?? 20, 1), MAX_PAGE);
}

/**
 * Keyset page over rows sorted descending by immutable `columns` (the last is
 * unique), so rows written while a client pages never shift, repeat or skip.
 */
function keysetPage(args, columns) {
  const paging = { limit: pageLimit(args), columns, where: [], params: [] };
  const after = decodeKeyset(args.cursor, columns.length);
  if (!after) return paging;
  // Plain joins rather than nested template literals keep the complexity
  // checker's parser in sync with the source.
  const clauses = columns.map((column, index) => {
    const equal = columns.slice(0, index).map((prior) => [prior, '= ?'].join(' '));
    return ['(', [...equal, [column, '< ?'].join(' ')].join(' AND '), ')'].join('');
  });
  paging.where = [['(', clauses.join(' OR '), ')'].join('')];
  paging.params = columns.flatMap((_, index) => after.slice(0, index + 1));
  return paging;
}

function keysetSql(paging) {
  const order = paging.columns.map((column) => [column, 'DESC'].join(' ')).join(', ');
  return ['ORDER BY', order, 'LIMIT ?'].join(' ');
}

function keysetResult(rows, paging, map) {
  const page = rows.slice(0, paging.limit);
  const last = page.at(-1);
  const hasMore = rows.length > paging.limit;
  return {
    items: page.map(map),
    nextCursor: hasMore ? encodeKeyset(paging.columns.map((column) => last[column])) : null,
  };
}

const knowledgeSortKey = (entry) => [
  String(entry.lastAssessedAt ?? entry.lastEngagedAt ?? ''),
  entry.subject.key,
];

/** Sort order for knowledge: most recent first, then subject key. */
function compareKnowledgeKeys(a, b) {
  return b[0].localeCompare(a[0]) || a[1].localeCompare(b[1]);
}

/** Keyset page over the sorted knowledge list, resuming after the cursor's subject. */
function knowledgePage(sorted, args) {
  const limit = pageLimit(args);
  const after = decodeKeyset(args.cursor, 2);
  const start = after
    ? sorted.findIndex((entry) => compareKnowledgeKeys(knowledgeSortKey(entry), after) > 0)
    : 0;
  const from = start === -1 ? sorted.length : start;
  const items = sorted.slice(from, from + limit);
  const more = from + limit < sorted.length;
  return { items, nextCursor: more ? encodeKeyset(knowledgeSortKey(items.at(-1))) : null };
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

// Lists are bound as one JSON parameter: D1 caps a statement at 100 parameters.
const JSON_LIST = '(SELECT value FROM json_each(?))';

function subjectFromKey(key, label) {
  if (CONCEPT_BY_ID.has(key)) return resolveSubject({ conceptId: key });
  if (key.startsWith('domain:')) return { key, kind: 'domain', label: label ?? key.slice(7) };
  return { key, kind: 'topic', label: label ?? key.slice(6) };
}

/** Derive knowledge states for subjects from preferences plus assessments. */
function deriveStates(preferenceRows, assessmentRows, keys) {
  const preferences = new Map(preferenceRows.map((row) => [row.subject_key, row]));
  const evidence = new Map();
  for (const row of assessmentRows) {
    if (!evidence.has(row.subject_key)) evidence.set(row.subject_key, []);
    evidence.get(row.subject_key).push(row);
  }
  const states = new Map();
  for (const key of keys ?? new Set([...preferences.keys(), ...evidence.keys()])) {
    if (!preferences.has(key) && !evidence.has(key)) continue;
    const preference = preferences.get(key);
    const subject = subjectFromKey(key, preference?.label ?? evidence.get(key)?.[0]?.subject_label);
    states.set(key, deriveState(subject, preference, evidence.get(key)));
  }
  return states;
}

// rowid breaks ties between assessments with the same timestamp in insertion order.
const EVIDENCE_COLUMNS =
  'id, subject_key, subject_label, method, demonstrated_level, outcome, score, assessed_at, rowid AS row_order';

async function loadStates(db, userId, keys) {
  if (!keys.length) return new Map();
  const list = JSON.stringify([...new Set(keys)]);
  const [preferences, assessments] = await Promise.all([
    db.execute({
      sql: `SELECT * FROM knowledge_states WHERE user_id = ? AND subject_key IN ${JSON_LIST}`,
      args: [userId, list],
    }),
    db.execute({
      sql: `SELECT ${EVIDENCE_COLUMNS} FROM learning_assessments WHERE user_id = ? AND subject_key IN ${JSON_LIST}`,
      args: [userId, list],
    }),
  ]);
  return deriveStates(preferences.rows, assessments.rows, new Set(keys));
}

export async function loadAllStates(db, userId) {
  const [preferences, assessments] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM knowledge_states WHERE user_id = ?', args: [userId] }),
    db.execute({
      sql: `SELECT ${EVIDENCE_COLUMNS} FROM learning_assessments WHERE user_id = ?`,
      args: [userId],
    }),
  ]);
  return deriveStates(preferences.rows, assessments.rows);
}

/** Set learner preferences for a subject; omitted (undefined) fields are kept. */
/**
 * Optional batch guard: `{ sql, args }` that must hold for a statement to apply,
 * typically "the versioned write earlier in this batch landed".
 */
function guardClause(guard) {
  return guard ? { sql: `WHERE ${guard.sql}`, args: guard.args } : { sql: 'WHERE 1', args: [] };
}

function guardSuffix(guard) {
  return guard ? ['AND', guard.sql].join(' ') : '';
}

function tokenGuard(table, idColumn, id, userId, token) {
  return {
    sql: `EXISTS (SELECT 1 FROM ${table} WHERE user_id = ? AND ${idColumn} = ? AND write_token = ?)`,
    args: [userId, id, token],
  };
}

/** Set learner preferences for a subject; omitted (undefined) fields are kept. */
function preferenceStatement(userId, subject, preferences, ctx, guard) {
  const value = (key) => (preferences[key] === undefined ? null : preferences[key]);
  const where = guardClause(guard);
  return {
    sql: `INSERT INTO knowledge_states (user_id, subject_key, subject_kind, label, target_level, interest, notes, updated_at)
          SELECT ?, ?, ?, ?, ?, ?, ?, ? ${where.sql}
          ON CONFLICT(user_id, subject_key) DO UPDATE SET
            target_level = COALESCE(excluded.target_level, knowledge_states.target_level),
            interest = COALESCE(excluded.interest, knowledge_states.interest),
            notes = COALESCE(excluded.notes, knowledge_states.notes),
            updated_at = excluded.updated_at`,
    args: [
      userId,
      subject.key,
      subject.kind,
      subject.label,
      value('targetLevel'),
      value('interest'),
      value('notes'),
      nowIso(ctx),
      ...where.args,
    ],
  };
}

/** Record exposure (and optional interest) without touching evidence fields. */
const NOT_CREDITED = `NOT EXISTS (SELECT 1 FROM learning_exposure_credits
  WHERE user_id = ? AND session_id = ? AND subject_key = ?)`;

/**
 * One session's exposure to one subject, counted at most once: the credit row
 * written alongside makes any later recount (completion, a late assessment, a
 * replaced assessment) a no-op.
 */
function engagementStatement(userId, subject, endedAt, interest, ctx, guard, sessionId) {
  const where = guardClause(guard);
  return [
    {
      sql: `INSERT INTO knowledge_states (user_id, subject_key, subject_kind, label, interest, exposure_count, last_engaged_at, updated_at)
            SELECT ?, ?, ?, ?, ?, 1, ?, ? ${where.sql} AND ${NOT_CREDITED}
            ON CONFLICT(user_id, subject_key) DO UPDATE SET
              exposure_count = knowledge_states.exposure_count + 1,
              last_engaged_at = MAX(COALESCE(knowledge_states.last_engaged_at, ''), excluded.last_engaged_at),
              interest = COALESCE(excluded.interest, knowledge_states.interest),
              updated_at = excluded.updated_at`,
      args: [
        userId,
        subject.key,
        subject.kind,
        subject.label,
        interest ?? null,
        endedAt,
        nowIso(ctx),
        ...where.args,
        userId,
        sessionId,
        subject.key,
      ],
    },
    {
      sql: `INSERT OR IGNORE INTO learning_exposure_credits (user_id, session_id, subject_key)
            SELECT ?, ?, ? ${where.sql}`,
      args: [userId, sessionId, subject.key, ...where.args],
    },
  ];
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

/** One entry per subject: recorded states, plus empty ones for requested or curriculum subjects. */
function requestedEntries(states, args) {
  const entries = new Map();
  if (args.subjects?.length) {
    for (const subject of args.subjects) {
      const resolved = resolveSubject(subject);
      entries.set(resolved.key, states.get(resolved.key) ?? emptyState(resolved));
    }
  } else {
    for (const [key, state] of states) entries.set(key, state);
  }
  if (args.includeUnassessedCurriculum) {
    for (const concept of CONCEPT_BY_ID.values()) {
      if (!entries.has(concept.id) && !states.has(concept.id)) {
        entries.set(
          concept.id,
          emptyState({ key: concept.id, kind: 'concept', label: concept.name })
        );
      }
    }
  }
  return [...entries.values()];
}

export async function getKnowledgeState(db, userId, args, ctx) {
  const now = ctx?.now ?? new Date();
  const states = await loadAllStates(db, userId);
  let entries = requestedEntries(states, args);
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
  filtered.sort((a, b) => compareKnowledgeKeys(knowledgeSortKey(a), knowledgeSortKey(b)));
  const { items, nextCursor } = knowledgePage(filtered, args);
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
    nextCursor,
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
      label: concept?.name ?? row.subject_label,
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

function assessmentRow(id, subject, args, sessionRow, ctx) {
  return {
    id,
    subject_key: subject.key,
    subject_label: subject.label,
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
}

const ASSESSMENT_COLUMNS = [
  'id',
  'user_id',
  'subject_key',
  'subject_label',
  'session_id',
  'course_id',
  'method',
  'question',
  'response',
  'evaluation',
  'gaps_json',
  'demonstrated_level',
  'outcome',
  'score',
  'provenance_json',
  'assessed_at',
];

/**
 * Insert an assessment. When it belongs to a session, the insert applies only
 * if that session still exists, so a concurrent session deletion cannot leave
 * an orphaned assessment behind.
 */
function insertAssessmentStatement(userId, row, guard) {
  const values = ASSESSMENT_COLUMNS.map((column) => (column === 'user_id' ? userId : row[column]));
  const conditions = [];
  const args = [...values];
  if (row.session_id) {
    conditions.push('EXISTS (SELECT 1 FROM learning_sessions WHERE user_id = ? AND id = ?)');
    args.push(userId, row.session_id);
  }
  if (row.course_id) {
    conditions.push('EXISTS (SELECT 1 FROM learning_courses WHERE user_id = ? AND id = ?)');
    args.push(userId, row.course_id);
  }
  if (guard) {
    conditions.push(guard.sql);
    args.push(...guard.args);
  }
  return {
    sql: `INSERT INTO learning_assessments (${ASSESSMENT_COLUMNS.join(', ')})
          SELECT ${ASSESSMENT_COLUMNS.map(() => '?').join(', ')} WHERE ${conditions.join(' AND ') || '1'}
          ON CONFLICT(id) DO NOTHING`,
    args,
  };
}

/**
 * Exposure for evidence that lands on an already completed session. The
 * completion batch counts subjects assessed before it; this covers the other
 * commit order. The session's credit for the subject keeps it to one count.
 */
function lateAssessmentExposure(userId, subject, row, ctx) {
  const lands = `EXISTS (SELECT 1 FROM learning_assessments WHERE user_id = ? AND id = ?)
    AND EXISTS (SELECT 1 FROM learning_sessions WHERE user_id = ? AND id = ? AND status = 'completed')`;
  const landsArgs = [userId, row.id, userId, row.session_id];
  return [
    {
      sql: `INSERT INTO knowledge_states (user_id, subject_key, subject_kind, label, exposure_count, last_engaged_at, updated_at)
            SELECT ?, ?, ?, ?, 1, ?, ? WHERE ${lands} AND ${NOT_CREDITED}
            ON CONFLICT(user_id, subject_key) DO UPDATE SET
              exposure_count = knowledge_states.exposure_count + 1,
              last_engaged_at = MAX(COALESCE(knowledge_states.last_engaged_at, ''), excluded.last_engaged_at),
              updated_at = excluded.updated_at`,
      args: [
        userId,
        subject.key,
        subject.kind,
        subject.label,
        row.assessed_at,
        nowIso(ctx),
        ...landsArgs,
        userId,
        row.session_id,
        subject.key,
      ],
    },
    {
      sql: `INSERT OR IGNORE INTO learning_exposure_credits (user_id, session_id, subject_key)
            SELECT ?, ?, ? WHERE ${lands}`,
      args: [userId, row.session_id, subject.key, ...landsArgs],
    },
  ];
}

export async function submitAssessment(db, userId, args, ctx) {
  const subject = resolveSubject(args.subject);
  if (args.method !== 'self-assessment' && !args.outcome) {
    throw invalid('outcome is required for evidence-based assessments.');
  }
  const sessionRow = args.sessionId
    ? await requireOwned(db, 'learning_sessions', userId, args.sessionId, 'Session')
    : null;
  if (args.courseId) await requireOwned(db, 'learning_courses', userId, args.courseId, 'Course');
  const id = await newId('asm', ctx);
  const row = assessmentRow(id, subject, args, sessionRow, ctx);
  const before =
    (await loadStates(db, userId, [subject.key])).get(subject.key) ?? emptyState(subject);
  // The target level is saved only if the assessment itself was stored.
  const sessionGuard = {
    sql: 'EXISTS (SELECT 1 FROM learning_assessments WHERE user_id = ? AND id = ?)',
    args: [userId, row.id],
  };
  await db.batch([
    insertAssessmentStatement(userId, row),
    preferenceStatement(userId, subject, { targetLevel: args.targetLevel }, ctx, sessionGuard),
    ...(row.session_id ? lateAssessmentExposure(userId, subject, row, ctx) : []),
  ]);
  const stored = await db.execute({
    sql: 'SELECT * FROM learning_assessments WHERE user_id = ? AND id = ?',
    args: [userId, id],
  });
  if (!stored.rows[0])
    throw notFound('The session or course was deleted before the assessment was saved.');
  const after = (await loadStates(db, userId, [subject.key])).get(subject.key);
  return {
    assessment: presentAssessment(stored.rows[0]),
    knowledgeBefore: presentState(before, ctx?.now),
    knowledgeAfter: presentState(after, ctx?.now),
    policy:
      row.method === 'self-assessment'
        ? 'Self-assessment updates the self-reported level only; assessed level is unchanged.'
        : 'Assessed level reflects this evidence. Review is scheduled from the outcome.',
  };
}

export async function getAssessment(db, userId, args) {
  return {
    assessment: presentAssessment(
      await requireOwned(db, 'learning_assessments', userId, args.assessmentId, 'Assessment')
    ),
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
  const paging = keysetPage(args, ['assessed_at', 'id']);
  const result = await db.execute({
    sql: `SELECT * FROM learning_assessments WHERE ${[...where, ...paging.where].join(' AND ')}
          ${keysetSql(paging)}`,
    args: [...params, ...paging.params, paging.limit + 1],
  });
  return keysetResult(result.rows, paging, presentAssessment);
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
  const [profile, legacy, states] = await Promise.all([
    db.execute({ sql: 'SELECT * FROM learner_profiles WHERE user_id = ?', args: [userId] }),
    db.execute({ sql: 'SELECT profile_json FROM user_profile WHERE user_id = ?', args: [userId] }),
    loadAllStates(db, userId),
  ]);
  const row = profile.rows[0];
  const legacyProfile = parseJson(legacy.rows[0]?.profile_json, {});
  const subjectPreferences = [...states.values()]
    .filter((state) => state.self_reported_level || state.target_level || state.interest)
    .slice(0, 200)
    .map((state) => ({
      subject: { key: state.subject_key, kind: state.subject_kind, label: state.label },
      selfReportedLevel: state.self_reported_level ?? null,
      targetLevel: state.target_level ?? null,
      interest: state.interest ?? null,
    }));
  return {
    profile: parseJson(row?.profile_json, {}),
    version: row?.version ?? 0,
    updatedAt: row?.updated_at ?? null,
    productPreferences: {
      minutesPerDay: legacyProfile.minutesPerDay ?? null,
      trackIds: legacyProfile.trackIds ?? [],
    },
    subjectPreferences,
    policy: 'Self-reported familiarity is stored separately from assessed knowledge.',
    url: links.profile(),
  };
}

/** Self-reports are stored as self-assessment evidence plus subject preferences. */
async function selfAssessmentStatements(userId, items, ctx, guard) {
  const statements = [];
  for (const [index, item] of items.entries()) {
    const subject = resolveSubject(item);
    statements.push(preferenceStatement(userId, subject, item, ctx, guard));
    if (!item.level) continue;
    const seed = ctx?.idempotencySeed ? `${ctx.idempotencySeed}:${index}` : undefined;
    const row = assessmentRow(
      await newId('asm', ctx, seed),
      subject,
      {
        method: 'self-assessment',
        evaluation: item.notes ?? 'Learner self-assessment recorded through the learning profile.',
        demonstratedLevel: item.level,
        provenance: { source: 'learner-self-report' },
      },
      null,
      ctx
    );
    statements.push(insertAssessmentStatement(userId, row, guard));
  }
  return statements;
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
  const changedProfile = Boolean(args.set || args.append || args.remove);
  if (!changedProfile && !args.selfAssessments?.length) {
    throw invalid('Nothing to update: pass set, append, remove or selfAssessments.');
  }
  const statements = [];
  let guard;
  if (changedProfile) {
    const token = crypto.randomUUID();
    guard = {
      sql: 'EXISTS (SELECT 1 FROM learner_profiles WHERE user_id = ? AND write_token = ?)',
      args: [userId, token],
    };
    statements.push(
      row
        ? {
            sql: `UPDATE learner_profiles SET profile_json = ?, version = version + 1, write_token = ?, updated_at = ?
                  WHERE user_id = ? AND version = ?`,
            args: [JSON.stringify(profile), token, nowIso(ctx), userId, version],
          }
        : {
            sql: `INSERT INTO learner_profiles (user_id, profile_json, version, write_token, updated_at)
                  VALUES (?, ?, 1, ?, ?) ON CONFLICT(user_id) DO NOTHING`,
            args: [userId, JSON.stringify(profile), token, nowIso(ctx)],
          }
    );
  }
  // Self-reports commit only together with the profile write they came with.
  statements.push(
    ...(await selfAssessmentStatements(userId, args.selfAssessments ?? [], ctx, guard))
  );
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
  assertAcyclic(normalized);
  return normalized;
}

/** Reject dependency cycles, which would leave no lesson ever available. */
function assertAcyclic(lessons) {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const state = new Map();
  const visit = (id, path) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'visiting') {
      throw invalid(`Lesson dependencies form a cycle: ${[...path, id].join(' -> ')}.`);
    }
    state.set(id, 'visiting');
    for (const next of byId.get(id).dependsOn) visit(next, [...path, id]);
    state.set(id, 'done');
  };
  for (const lesson of lessons) visit(lesson.id, []);
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

/** Every distinct subject a course covers (uncapped). */
function courseSubjectKeys(course) {
  const keys = new Set();
  for (const lesson of course.lessons) {
    for (const conceptId of lesson.conceptIds) keys.add(conceptId);
    for (const topic of lesson.topics) keys.add(resolveSubject({ topic }).key);
  }
  return [...keys];
}

const ASSESSED_ORDER = ['beginner', 'intermediate', 'advanced', 'expert'];

function courseProgress(course, states, now) {
  const lessons = course.lessons;
  const targetRank = course.targetLevel ? ASSESSED_ORDER.indexOf(course.targetLevel) : 1;
  const evidence = {
    subjects: 0,
    atOrAboveTarget: 0,
    belowTarget: 0,
    unassessed: 0,
    needsRevision: 0,
  };
  for (const key of courseSubjectKeys(course)) {
    evidence.subjects += 1;
    const state = states.get(key);
    const category = categoryOf(state, now);
    if (category === 'unassessed') {
      evidence.unassessed += 1;
      continue;
    }
    if (ASSESSED_ORDER.indexOf(state.assessed_level) >= targetRank) evidence.atOrAboveTarget += 1;
    else evidence.belowTarget += 1;
    if (category === 'needs-revision' || category === 'due-for-review') evidence.needsRevision += 1;
  }
  const count = (status) => lessons.filter((lesson) => lesson.status === status).length;
  return {
    lessons: {
      total: lessons.length,
      completed: count('completed'),
      active: count('active'),
      skipped: count('skipped'),
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

/**
 * Demote every other primary course, but only if the write identified by
 * `token` landed. Bumps versions so stale edits of a demoted course fail.
 */
const CLEAR_OTHER_PRIMARIES = (userId, courseId, token) => ({
  sql: `UPDATE learning_courses SET is_primary = 0, version = version + 1
        WHERE user_id = ? AND is_primary = 1 AND id != ?
          AND EXISTS (SELECT 1 FROM learning_courses WHERE user_id = ? AND id = ? AND write_token = ?)`,
  args: [userId, courseId, userId, courseId, token],
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
  const token = crypto.randomUUID();
  const insert = {
    sql: `INSERT INTO learning_courses (id, user_id, title, objective, target_level, status, is_primary,
            lessons_json, supplemental_objectives_json, notes, write_token, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
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
      token,
      nowIso(ctx),
      nowIso(ctx),
    ],
  };
  await db.batch(isPrimary ? [insert, CLEAR_OTHER_PRIMARIES(userId, id, token)] : [insert]);
  return getCourse(db, userId, { courseId: id }, ctx);
}

export async function getCourse(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_courses', userId, args.courseId, 'Course');
  const course = courseFromRow(row);
  const states = await loadStates(db, userId, courseSubjectKeys(course));
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
  const paging = keysetPage(args, ['created_at', 'id']);
  const result = await db.execute({
    sql: `SELECT * FROM learning_courses WHERE ${[...where, ...paging.where].join(' AND ')}
          ${keysetSql(paging)}`,
    args: [...params, ...paging.params, paging.limit + 1],
  });
  return keysetResult(result.rows, paging, (row) => {
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
  if (new Set(order).size !== order.length)
    throw invalid('lessonOrder must not repeat a lesson id.');
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

/** Sessions linked to a lesson that no longer exists keep the course link only. */
/** Sessions linked to a lesson that no longer exists keep only the course link. */
function detachRemovedLessonsStatement(userId, courseId, lessonIds, token, ctx) {
  return {
    sql: `UPDATE learning_sessions SET lesson_id = NULL, version = version + 1, updated_at = ?
          WHERE user_id = ? AND course_id = ? AND lesson_id IS NOT NULL
            AND lesson_id NOT IN ${JSON_LIST}
            AND EXISTS (SELECT 1 FROM learning_courses WHERE user_id = ? AND id = ? AND write_token = ?)`,
    args: [nowIso(ctx), userId, courseId, JSON.stringify(lessonIds), userId, courseId, token],
  };
}

export async function updateCourse(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_courses', userId, args.courseId, 'Course');
  assertVersion(row, args.expectedVersion, 'Course', 'get_course');
  const course = courseFromRow(row);
  const { isPrimary, values } = courseUpdateArgs(course, args);
  const lessonIds = JSON.parse(values[5]).map((lesson) => lesson.id);
  const token = crypto.randomUUID();
  const statements = [
    {
      sql: `UPDATE learning_courses SET title = ?, objective = ?, target_level = ?, status = ?,
              is_primary = ?, lessons_json = ?, supplemental_objectives_json = ?, notes = ?,
              version = version + 1, write_token = ?, updated_at = ?
            WHERE user_id = ? AND id = ? AND version = ?`,
      args: [...values, token, nowIso(ctx), userId, course.id, row.version],
    },
    detachRemovedLessonsStatement(userId, course.id, lessonIds, token, ctx),
  ];
  if (isPrimary) statements.push(CLEAR_OTHER_PRIMARIES(userId, course.id, token));
  const results = await db.batch(statements);
  if (results[0].rowsAffected === 0) {
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
const STATUS_ORDER = `',recommended,saved,reading,discussed,completed,'`;
const statusRank = (expression) => `instr(${STATUS_ORDER}, ',' || ${expression} || ',')`;
const mergedJsonList = (column) =>
  `(SELECT json_group_array(value) FROM (
      SELECT value FROM json_each(learning_resources.${column})
      UNION SELECT value FROM json_each(excluded.${column})))`;

/**
 * Save or merge a resource by canonical URL in one statement, against the row
 * as it is at write time: associations merge, missing metadata is filled, and
 * status only moves forward unless the caller set it explicitly.
 */
function resourceUpsertStatement(userId, plan, options, ctx, guard) {
  const { id, canonical, args, conceptIds } = plan;
  const explicit = Boolean(args.status);
  const status = args.status || options.autoStatus || 'saved';
  const where = guardClause(guard);
  return {
    sql: `INSERT INTO learning_resources (id, user_id, canonical_url, url, title, kind, status, author,
            published_at, summary, concept_ids_json, topics_json, notes, created_at, updated_at)
          SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ${where.sql}
            AND NOT EXISTS (SELECT 1 FROM learning_resource_deletions d WHERE d.user_id = ? AND d.resource_id = ?)
          ON CONFLICT(user_id, canonical_url) DO UPDATE SET
            status = CASE
              WHEN ${explicit ? 1 : 0} = 1 THEN excluded.status
              WHEN ${statusRank('excluded.status')} > ${statusRank('learning_resources.status')} THEN excluded.status
              ELSE learning_resources.status END,
            author = COALESCE(learning_resources.author, excluded.author),
            published_at = COALESCE(learning_resources.published_at, excluded.published_at),
            summary = COALESCE(learning_resources.summary, excluded.summary),
            notes = COALESCE(learning_resources.notes, excluded.notes),
            concept_ids_json = ${mergedJsonList('concept_ids_json')},
            topics_json = ${mergedJsonList('topics_json')},
            version = learning_resources.version + 1,
            updated_at = excluded.updated_at
          RETURNING *`,
    args: [
      id,
      userId,
      canonical,
      args.url,
      args.title || canonical,
      args.kind || 'article',
      status,
      args.author ?? null,
      args.publishedAt ?? null,
      args.summary ?? null,
      JSON.stringify(conceptIds),
      JSON.stringify(uniqueStrings(args.topics || [])),
      args.notes ?? null,
      nowIso(ctx),
      nowIso(ctx),
      ...where.args,
      userId,
      id,
    ],
  };
}

/** Deletion records keep a learner-scoped fingerprint, never the URL itself. */
async function urlFingerprint(userId, canonical) {
  return sha256Hex(`${userId}:resource-url:${canonical}`);
}

/**
 * The live resource for a URL and the URL's deletion generation, read in one
 * statement so a save-and-delete in between cannot shift the generation.
 */
async function resourceIdentity(db, userId, canonical) {
  const result = await db.execute({
    sql: `SELECT
            (SELECT id FROM learning_resources WHERE user_id = ? AND canonical_url = ?) AS id,
            (SELECT COUNT(*) FROM learning_resource_deletions WHERE user_id = ? AND url_fingerprint = ?) AS generation`,
    args: [userId, canonical, userId, await urlFingerprint(userId, canonical)],
  });
  const row = result.rows[0] ?? {};
  return { existingId: row.id ?? null, generation: Number(row.generation ?? 0) };
}

/** Validate a resource input and work out its id without writing. */
async function planResource(db, userId, args, ctx) {
  const canonical = canonicalUrl(args.url);
  const conceptIds = requireConceptIds(uniqueStrings(args.conceptIds ?? []));
  const { existingId, generation } = await resourceIdentity(db, userId, canonical);
  if (!existingId && !args.title)
    throw invalid(`title is required for the new resource ${args.url}.`);
  // Concurrent first saves agree on the id; a re-save after deletion gets a new one.
  const id =
    existingId ??
    (await newId('res', { ...ctx, idempotencySeed: undefined }, `${canonical}#${generation}`));
  return { id, canonical, conceptIds, args };
}

/** Upsert by canonical URL; status only moves forward unless set explicitly. */
export async function saveResource(db, userId, args, ctx) {
  const plan = await planResource(db, userId, args, ctx);
  const result = await db.execute(resourceUpsertStatement(userId, plan, {}, ctx));
  const written = result.rows[0];
  // No row means the planned id was deleted meanwhile; never answer with a replacement.
  if (!written) throw conflict('The resource was deleted while it was being saved. Save it again.');
  // Answer from the row this write produced, never a later writer's state.
  return { resource: resourceFromRow(written), created: Number(written.version) === 1 };
}

/**
 * Apply association edits. Without edits the stored list is kept verbatim, so
 * changing another field never trims associations merged in by earlier saves.
 */
function editedList(stored, current, add, remove) {
  if (!add?.length && !remove?.length) return stored;
  const drop = new Set((remove ?? []).map((value) => value.toLowerCase()));
  return JSON.stringify(
    uniqueStrings(
      [...current.filter((value) => !drop.has(value.toLowerCase())), ...(add ?? [])],
      Number.MAX_SAFE_INTEGER
    )
  );
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
  const result = await db.execute({
    sql: `UPDATE learning_resources SET title = ?, kind = ?, status = ?, author = ?, published_at = ?,
            summary = ?, notes = ?, concept_ids_json = ?, topics_json = ?, version = version + 1, updated_at = ?
          WHERE user_id = ? AND id = ? AND version = ?`,
    args: [
      set.title ?? current.title,
      set.kind ?? current.kind,
      set.status ?? current.status,
      patched(set, 'author', current.author),
      patched(set, 'publishedAt', current.publishedAt),
      patched(set, 'summary', current.summary),
      patched(set, 'notes', current.notes),
      editedList(
        row.concept_ids_json,
        current.conceptIds,
        args.addConceptIds,
        args.removeConceptIds
      ),
      editedList(row.topics_json, current.topics, args.addTopics, args.removeTopics),
      nowIso(ctx),
      userId,
      current.id,
      row.version,
    ],
  });
  if (result.rowsAffected === 0) {
    throw conflict('Resource changed concurrently. Re-read with get_learning_resource and retry.');
  }
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
  const paging = keysetPage(args, ['created_at', 'id']);
  const result = await db.execute({
    sql: `SELECT * FROM learning_resources WHERE ${[...where, ...paging.where].join(' AND ')}
          ${keysetSql(paging)}`,
    args: [...params, ...paging.params, paging.limit + 1],
  });
  return keysetResult(result.rows, paging, resourceFromRow);
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

/**
 * Validate inline resources and work out their ids without writing anything.
 * Resource ids derive from the canonical URL, so they are known up front and
 * the resources are saved only after the session write has succeeded.
 */
/**
 * Validate inline resources and work out their ids without writing anything.
 * Resource ids derive from the canonical URL, so the upserts can join the
 * session's own batch and commit only together with it.
 */
async function planSessionResources(db, userId, resources, ctx) {
  const planned = [];
  for (const resource of resources ?? [])
    planned.push(await planResource(db, userId, resource, ctx));
  return planned;
}

function plannedResourceStatements(userId, planned, ctx, guard) {
  return planned.map((plan) =>
    resourceUpsertStatement(userId, plan, { autoStatus: 'discussed' }, ctx, guard)
  );
}

async function requireResourceIds(db, userId, ids) {
  if (!ids?.length) return;
  const found = await db.execute({
    sql: `SELECT id FROM learning_resources WHERE user_id = ? AND id IN ${JSON_LIST}`,
    args: [userId, JSON.stringify(ids)],
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

const SESSION_LIST_LIMIT = 500;

/** An append that would exceed a session list's limit is rejected, never truncated. */
function withinSessionLimit(key, values) {
  if (values.length > SESSION_LIST_LIMIT) {
    throw invalid(
      `A session holds at most ${SESSION_LIST_LIMIT} ${key}. Start a new session to record more.`
    );
  }
  return values;
}

async function mergeRecord(db, userId, record, changes, ctx, preplanned = null) {
  validateRecordSubjects(changes);
  await requireResourceIds(db, userId, changes.resourceIds);
  const planned = preplanned ?? (await planSessionResources(db, userId, changes.resources, ctx));
  const additions = {
    ...changes,
    resourceIds: [...(changes.resourceIds ?? []), ...planned.map((item) => item.id)],
  };
  const next = { ...record };
  for (const key of SESSION_STRING_LISTS) {
    if (additions[key]?.length)
      next[key] = withinSessionLimit(
        key,
        uniqueStrings([...(next[key] ?? []), ...additions[key]], SESSION_LIST_LIMIT + 1)
      );
  }
  for (const key of SESSION_OBJECT_LISTS) {
    if (additions[key]?.length)
      next[key] = withinSessionLimit(
        key,
        dedupeObjects([...(next[key] ?? []), ...additions[key]], SESSION_LIST_LIMIT + 1)
      );
  }
  return { record: next, planned };
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

/**
 * Set one lesson's status inside SQL, against the course as it is now, so a
 * concurrent course edit is never overwritten by a stale lesson list.
 */
function lessonStatusStatement(userId, courseId, lessonId, status, ctx, guard, onlyFrom) {
  const lessonMatch = onlyFrom
    ? "json_extract(value, '$.id') = ? AND json_extract(value, '$.status') = ?"
    : "json_extract(value, '$.id') = ?";
  const lessonArgs = onlyFrom ? [lessonId, onlyFrom] : [lessonId];
  return {
    sql: `UPDATE learning_courses SET
            lessons_json = json_set(lessons_json, '$[' || (
              SELECT key FROM json_each(learning_courses.lessons_json)
              WHERE json_extract(value, '$.id') = ?
            ) || '].status', ?),
            version = version + 1, updated_at = ?
          WHERE user_id = ? AND id = ?
            AND EXISTS (SELECT 1 FROM json_each(learning_courses.lessons_json) WHERE ${lessonMatch})
            ${guardSuffix(guard)}`,
    args: [lessonId, status, nowIso(ctx), userId, courseId, ...lessonArgs, ...(guard?.args ?? [])],
  };
}

/** Engagement roll-up: exposure and interest only, never assessed level. */
function engagementStatements(userId, record, endedAt, ctx, guard, sessionId) {
  const interests = new Map();
  const subjects = subjectsFrom(record.conceptIds, record.topics);
  for (const signal of record.interestSignals ?? []) {
    const subject = resolveSubject(signal.subject);
    interests.set(subject.key, signal.interest);
    if (!subjects.some((item) => item.key === subject.key)) subjects.push(subject);
  }
  const statements = subjects.flatMap((subject) =>
    engagementStatement(userId, subject, endedAt, interests.get(subject.key), ctx, guard, sessionId)
  );
  if (record.resourceIds?.length) {
    statements.push({
      sql: `UPDATE learning_resources SET status = 'discussed', version = version + 1, updated_at = ?
            WHERE user_id = ? AND id IN ${JSON_LIST} AND status IN ('recommended', 'saved', 'reading')
              ${guardSuffix(guard)}`,
      args: [nowIso(ctx), userId, JSON.stringify(record.resourceIds), ...(guard?.args ?? [])],
    });
  }
  statements.push(...assessedEngagementStatements(userId, sessionId, endedAt, ctx, guard));
  return statements;
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

function startLessonStatement(userId, link, args, ctx, guard) {
  if (!link || !args.lessonId) return null;
  if (args.lessonStatus) {
    return lessonStatusStatement(
      userId,
      link.course.id,
      args.lessonId,
      args.lessonStatus,
      ctx,
      guard
    );
  }
  // Implicit activation applies only to a lesson that is still planned now.
  return lessonStatusStatement(
    userId,
    link.course.id,
    args.lessonId,
    'active',
    ctx,
    guard,
    'planned'
  );
}

/**
 * Create a session. The session row, its inline resources, lesson status and
 * (for retrospective logs) engagement all commit in one batch, so a retry
 * that finds the session also finds every effect.
 */
export async function startSession(db, userId, args, ctx) {
  const id = await newId('ses', ctx);
  const existing = await db.execute({
    sql: 'SELECT id FROM learning_sessions WHERE user_id = ? AND id = ?',
    args: [userId, id],
  });
  if (existing.rows[0]) return getSession(db, userId, { sessionId: id });
  const { startedAt, endedAt, duration } = sessionTimes(args, ctx);
  const link = await validateCourseLink(db, userId, args.courseId, args.lessonId);
  const { record, planned } = await mergeRecord(db, userId, {}, args, ctx);
  const token = crypto.randomUUID();
  const guard = tokenGuard('learning_sessions', 'id', id, userId, token);
  const linkGuard = sessionWriteGuard(
    userId,
    args.courseId,
    args.lessonId,
    args.resourceIds,
    planned.map((plan) => plan.id)
  );
  const statements = [
    {
      sql: `INSERT INTO learning_sessions (id, user_id, kind, status, title, course_id, lesson_id,
              record_json, summary, started_at, ended_at, duration_minutes, write_token, created_at, updated_at)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE ${linkGuard.sql}
            ON CONFLICT(id) DO NOTHING`,
      args: [
        id,
        userId,
        args.kind ?? (args.courseId ? 'course-lesson' : 'exploration'),
        endedAt ? 'completed' : 'active',
        args.title,
        args.courseId ?? null,
        args.lessonId ?? null,
        serializeRecord(record),
        args.summary ?? null,
        startedAt,
        endedAt,
        duration,
        token,
        nowIso(ctx),
        nowIso(ctx),
        ...linkGuard.args,
      ],
    },
    ...plannedResourceStatements(userId, planned, ctx, guard),
  ];
  const lessonStatement = startLessonStatement(userId, link, args, ctx, guard);
  if (lessonStatement) statements.push(lessonStatement);
  if (endedAt) statements.push(...engagementStatements(userId, record, endedAt, ctx, guard, id));
  await db.batch(statements);
  const created = await db.execute({
    sql: 'SELECT id FROM learning_sessions WHERE user_id = ? AND id = ?',
    args: [userId, id],
  });
  if (!created.rows[0])
    throw notFound(
      'A linked course, lesson or resource was removed while the session was being started.'
    );
  return getSession(db, userId, { sessionId: id });
}

/**
 * A condition that holds only while the resources a session write links still
 * exist: explicit ids must be live, and inline resources must not have been
 * deleted since they were planned.
 */
function resourceLinkGuard(userId, explicitIds = [], plannedIds = []) {
  if (!explicitIds.length && !plannedIds.length) return { sql: '1', args: [] };
  return {
    sql: `(SELECT COUNT(*) FROM learning_resources WHERE user_id = ? AND id IN ${JSON_LIST}) = ?
          AND NOT EXISTS (SELECT 1 FROM learning_resource_deletions WHERE user_id = ? AND resource_id IN ${JSON_LIST})`,
    args: [
      userId,
      JSON.stringify(explicitIds),
      new Set(explicitIds).size,
      userId,
      JSON.stringify([...explicitIds, ...plannedIds]),
    ],
  };
}

function sessionWriteGuard(userId, courseId, lessonId, explicitIds, plannedIds) {
  const course = courseLinkGuard(userId, courseId, lessonId);
  const resources = resourceLinkGuard(userId, explicitIds, plannedIds);
  return { sql: `${course.sql} AND ${resources.sql}`, args: [...course.args, ...resources.args] };
}

/** A condition that holds only while a session's course (and lesson) still exist. */
function courseLinkGuard(userId, courseId, lessonId) {
  if (!courseId) return { sql: '1', args: [] };
  const lesson = lessonId
    ? " AND EXISTS (SELECT 1 FROM json_each(c.lessons_json) WHERE json_extract(value, '$.id') = ?)"
    : '';
  return {
    sql: `EXISTS (SELECT 1 FROM learning_courses c WHERE c.user_id = ? AND c.id = ?${lesson})`,
    args: lessonId ? [userId, courseId, lessonId] : [userId, courseId],
  };
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

/** Session record JSON, with normalized topic keys for case- and script-safe lookup. */
function serializeRecord(record) {
  return JSON.stringify({
    ...record,
    topicKeys: (record.topics ?? []).map((topic) => topicKey(topic)),
  });
}

function sessionUpdateStatement(userId, row, fields, token, ctx) {
  // The destination course, lesson and newly linked resources must still
  // exist when the update lands.
  const link = sessionWriteGuard(
    userId,
    fields.courseId,
    fields.lessonId,
    fields.links.explicit,
    fields.links.planned
  );
  return {
    sql: `UPDATE learning_sessions SET kind = ?, status = ?, title = ?, course_id = ?, lesson_id = ?,
            record_json = ?, summary = ?, started_at = ?, ended_at = ?, duration_minutes = ?,
            version = version + 1, write_token = ?, updated_at = ?
          WHERE user_id = ? AND id = ? AND version = ? AND ${link.sql}`,
    args: [
      fields.kind,
      fields.status,
      fields.title,
      fields.courseId,
      fields.lessonId,
      serializeRecord(fields.record),
      fields.summary,
      fields.startedAt,
      fields.endedAt,
      fields.duration,
      token,
      nowIso(ctx),
      userId,
      row.id,
      row.version,
      ...link.args,
    ],
  };
}

function sessionSideEffects(userId, context, ctx, guard) {
  const { lessonId, courseId, args, complete, row, record, endedAt } = context;
  const statements = [];
  if (courseId && lessonId && args.lessonStatus) {
    statements.push(
      lessonStatusStatement(userId, courseId, lessonId, args.lessonStatus, ctx, guard)
    );
  }
  if (complete && row.status !== 'completed') {
    statements.push(...engagementStatements(userId, record, endedAt, ctx, guard, row.id));
  }
  return statements;
}

/**
 * Exposure for subjects assessed during a session. It reads the assessments
 * inside the completion batch, so evidence saved while the session is
 * completing is still counted; credits keep each subject to one count.
 */
function assessedEngagementStatements(userId, sessionId, endedAt, ctx, guard) {
  const suffix = guardSuffix(guard);
  return [
    {
      sql: `INSERT INTO knowledge_states (user_id, subject_key, subject_kind, label, exposure_count, last_engaged_at, updated_at)
            SELECT ?, a.subject_key,
              CASE WHEN a.subject_key LIKE 'domain:%' THEN 'domain'
                   WHEN a.subject_key LIKE 'topic:%' THEN 'topic' ELSE 'concept' END,
              MAX(a.subject_label), 1, ?, ?
            FROM learning_assessments a
            WHERE a.user_id = ? AND a.session_id = ? ${suffix}
              AND NOT EXISTS (SELECT 1 FROM learning_exposure_credits c
                WHERE c.user_id = a.user_id AND c.session_id = a.session_id AND c.subject_key = a.subject_key)
            GROUP BY a.subject_key
            ON CONFLICT(user_id, subject_key) DO UPDATE SET
              exposure_count = knowledge_states.exposure_count + 1,
              last_engaged_at = MAX(COALESCE(knowledge_states.last_engaged_at, ''), excluded.last_engaged_at),
              updated_at = excluded.updated_at`,
      args: [userId, endedAt, nowIso(ctx), userId, sessionId, ...(guard?.args ?? [])],
    },
    {
      sql: `INSERT OR IGNORE INTO learning_exposure_credits (user_id, session_id, subject_key)
            SELECT DISTINCT a.user_id, a.session_id, a.subject_key FROM learning_assessments a
            WHERE a.user_id = ? AND a.session_id = ? ${suffix}`,
      args: [userId, sessionId, ...(guard?.args ?? [])],
    },
  ];
}

const SESSION_UPDATE_ATTEMPTS = 3;

/**
 * One versioned attempt. The session write and all of its effects commit in a
 * single batch; effects are guarded by this attempt's write token, so a lost
 * race changes nothing. Returns null when the session changed underneath it.
 */
async function attemptSessionUpdate(db, userId, args, ctx, complete, plan) {
  const row = await requireOwned(db, 'learning_sessions', userId, args.sessionId, 'Session');
  assertVersion(row, args.expectedVersion, 'Session', 'get_learning_session');
  const set = args.set || {};
  const times = completionTimes(row, set, args, ctx, complete);
  const courseId = patched(set, 'courseId', row.course_id);
  const lessonId = patched(set, 'lessonId', row.lesson_id);
  await validateCourseLink(db, userId, courseId, lessonId);
  const cleaned = removeFromRecord(parseJson(row.record_json, {}), args.remove);
  // Inline resources are planned once per request: a retry must never re-plan
  // a resource deleted meanwhile under a new generation and recreate it.
  const { record, planned } = await mergeRecord(
    db,
    userId,
    cleaned,
    args.append || {},
    ctx,
    plan.planned
  );
  plan.planned = planned;
  const fields = {
    ...times,
    kind: set.kind || row.kind,
    status: complete ? 'completed' : row.status,
    title: set.title || row.title,
    courseId,
    lessonId,
    record,
    summary: firstDefined(args.summary, set.summary, row.summary),
    links: { explicit: args.append?.resourceIds ?? [], planned: planned.map((plan) => plan.id) },
  };
  const token = crypto.randomUUID();
  const guard = tokenGuard('learning_sessions', 'id', row.id, userId, token);
  const results = await db.batch([
    sessionUpdateStatement(userId, row, fields, token, ctx),
    ...plannedResourceStatements(userId, planned, ctx, guard),
    ...sessionSideEffects(
      userId,
      { lessonId, courseId, args, complete, row, record, endedAt: times.endedAt },
      ctx,
      guard
    ),
  ]);
  return results[0].rowsAffected === 0 ? null : row;
}

export async function updateSession(db, userId, args, ctx, { complete = false } = {}) {
  // Without expectedVersion, a concurrent append (such as an assessment link) is
  // merged by re-reading and retrying instead of failing the caller.
  const attempts = args.expectedVersion === undefined ? SESSION_UPDATE_ATTEMPTS : 1;
  let row = null;
  const plan = { planned: null };
  for (let attempt = 0; attempt < attempts && !row; attempt += 1) {
    row = await attemptSessionUpdate(db, userId, args, ctx, complete, plan);
    if (!row) await assertPlannedResourcesLive(db, userId, plan.planned);
  }
  if (!row)
    throw conflict('Session changed concurrently. Re-read with get_learning_session and retry.');
  if (!complete) return getSession(db, userId, { sessionId: row.id });
  return getCompletedSession(db, userId, { sessionId: row.id }, ctx);
}

/** A resource this request attaches was deleted meanwhile: stop rather than recreate it. */
async function assertPlannedResourcesLive(db, userId, planned) {
  if (!planned?.length) return;
  const deleted = await db.execute({
    sql: `SELECT resource_id FROM learning_resource_deletions WHERE user_id = ? AND resource_id IN ${JSON_LIST}`,
    args: [userId, JSON.stringify(planned.map((item) => item.id))],
  });
  if (deleted.rows.length) {
    throw conflict(
      'A resource this request attaches was deleted meanwhile. Re-read the session and attach it again if it is still wanted.'
    );
  }
}

/** Subjects assessed during a session count as explored in it, without writing to the session. */
function assessedSubjects(session, assessmentRows, labelRows) {
  const labels = new Map(labelRows.map((row) => [row.subject_key, row.label]));
  const assessmentLabels = new Map(
    assessmentRows.map((row) => [row.subject_key, row.subject_label])
  );
  const assessedKeys = assessmentRows.map((row) => row.subject_key);
  return {
    conceptIds: uniqueStrings(
      [...session.conceptIds, ...assessedKeys.filter((key) => CONCEPT_BY_ID.has(key))],
      500
    ),
    topics: uniqueStrings(
      [
        ...session.topics,
        ...assessedKeys
          .filter((key) => key.startsWith('topic:'))
          .map((key) => labels.get(key) ?? assessmentLabels.get(key) ?? key),
      ],
      500
    ),
  };
}

/** Full sessions for a history page, with live assessment ids and assessed subjects. */
async function detailedSessions(db, userId, rows) {
  const ids = JSON.stringify(rows.map((row) => row.id));
  const [assessments, labels] = await Promise.all([
    db.execute({
      sql: `SELECT id, session_id, subject_key, subject_label FROM learning_assessments
            WHERE user_id = ? AND session_id IN ${JSON_LIST} ORDER BY assessed_at, rowid`,
      args: [userId, ids],
    }),
    db.execute({
      sql: `SELECT subject_key, label FROM knowledge_states WHERE user_id = ? AND subject_key IN (
              SELECT subject_key FROM learning_assessments WHERE user_id = ? AND session_id IN ${JSON_LIST})`,
      args: [userId, userId, ids],
    }),
  ]);
  return rows.map((row) => {
    const session = sessionFromRow(row);
    const own = assessments.rows.filter((item) => item.session_id === session.id);
    return {
      ...session,
      assessmentIds: own.map((item) => item.id),
      ...assessedSubjects(session, own, labels.rows),
    };
  });
}

/** A session with the knowledge snapshot and policy completion promises. */
export async function getCompletedSession(db, userId, args, ctx) {
  const detail = await getSession(db, userId, args);
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
  const [assessments, resources, course, preferenceLabels] = await Promise.all([
    db.execute({
      sql: 'SELECT * FROM learning_assessments WHERE user_id = ? AND session_id = ? ORDER BY assessed_at, rowid',
      args: [userId, session.id],
    }),
    session.resourceIds.length
      ? db.execute({
          sql: `SELECT * FROM learning_resources WHERE user_id = ? AND id IN ${JSON_LIST}`,
          args: [userId, JSON.stringify(session.resourceIds)],
        })
      : { rows: [] },
    session.courseId
      ? db.execute({
          sql: 'SELECT id, title, lessons_json FROM learning_courses WHERE user_id = ? AND id = ?',
          args: [userId, session.courseId],
        })
      : { rows: [] },
    db.execute({
      sql: `SELECT subject_key, label FROM knowledge_states WHERE user_id = ? AND subject_key IN (
              SELECT subject_key FROM learning_assessments WHERE user_id = ? AND session_id = ?)`,
      args: [userId, userId, session.id],
    }),
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
      concepts: uniqueStrings(
        [...session.conceptIds, ...assessments.rows.map((item) => item.subject_key)],
        500
      )
        .filter((id) => CONCEPT_BY_ID.has(id))
        .map((id) => conceptSummary(CONCEPT_BY_ID.get(id))),
      resources: resources.rows.map(resourceFromRow),
      // Live rows, so deleted evidence never lingers in a cached id list.
      assessmentIds: assessments.rows.map((item) => item.id),
      ...assessedSubjects(session, assessments.rows, preferenceLabels.rows),
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
  const assessedIn = `EXISTS (SELECT 1 FROM learning_assessments a
    WHERE a.user_id = learning_sessions.user_id AND a.session_id = learning_sessions.id AND a.subject_key = ?)`;
  if (args.conceptId) {
    where.push(
      `(EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.conceptIds') WHERE value = ?) OR ${assessedIn})`
    );
    params.push(args.conceptId, args.conceptId);
  }
  if (args.topic) {
    where.push(
      `(EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.topicKeys') WHERE value = ?) OR ${assessedIn})`
    );
    params.push(topicKey(args.topic), topicKey(args.topic));
  }
  if (args.resourceId) {
    where.push(
      "EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.resourceIds') WHERE value = ?)"
    );
    params.push(args.resourceId);
  }
  if (args.q) {
    where.push(
      "(title LIKE ? OR summary LIKE ? OR EXISTS (SELECT 1 FROM json_tree(json_remove(learning_sessions.record_json, '$.topicKeys')) WHERE type = 'text' AND value LIKE ?))"
    );
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
  const ascending = args.order === 'asc';
  const order = ascending ? 'ASC' : 'DESC';
  // Keyset pagination: rows recorded while a client pages never shift or repeat a page.
  const after = decodeKeyset(args.cursor);
  if (after) {
    const comparison = ascending ? '>' : '<';
    where.push(`(started_at ${comparison} ? OR (started_at = ? AND id ${comparison} ?))`);
    params.push(after[0], after[0], after[1]);
  }
  const limit = pageLimit(args);
  const result = await db.execute({
    sql: `SELECT learning_sessions.*, (
            SELECT COUNT(*) FROM learning_assessments a
            WHERE a.user_id = learning_sessions.user_id AND a.session_id = learning_sessions.id
          ) AS assessment_count
          FROM learning_sessions WHERE ${where.join(' AND ')}
          ORDER BY started_at ${order}, id ${order} LIMIT ?`,
    args: [...params, limit + 1],
  });
  const rows = result.rows.slice(0, limit);
  const last = rows.at(-1);
  const nextCursor = result.rows.length > limit ? encodeKeyset([last.started_at, last.id]) : null;
  if (args.detail) return { nextCursor, items: await detailedSessions(db, userId, rows) };
  return {
    nextCursor,
    items: rows.map((row) => {
      const session = sessionFromRow(row);
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
        assessmentCount: Number(row.assessment_count ?? 0),
        url: session.url,
      };
    }),
  };
}

// --- Curriculum gaps -------------------------------------------------------------

const GAP_RECORD_DEFAULTS = {
  reports: [],
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

const OPEN_GAP_STATUSES = new Set(['open', 'proposed', 'pr-opened']);

const OPEN_GAP_SQL = `SELECT * FROM curriculum_gaps WHERE user_id = ? AND topic_key = ?
  AND status IN ('open', 'proposed', 'pr-opened') ORDER BY created_at LIMIT 1`;

/**
 * Merge a report into a gap record. Each report has an id (the request's
 * idempotency seed when present), so re-running the same report is a no-op.
 */
function mergeGapRecord(record, args, reportId) {
  const merge = (key) => uniqueStrings([...(record[key] ?? []), ...(args[key] ?? [])], 500);
  const reports = uniqueStrings([...(record.reports ?? []), reportId], 1000);
  return {
    relatedConceptIds: merge('relatedConceptIds'),
    prerequisiteConceptIds: merge('prerequisiteConceptIds'),
    learningObjectives: merge('learningObjectives'),
    proposedConcept: args.proposedConcept ?? record.proposedConcept ?? null,
    evidence: merge('evidence'),
    reports,
    reportCount: reports.length,
  };
}

/** Insert a new open gap and return its id; a concurrent duplicate is ignored (null). */
async function insertGap(db, userId, key, args, reportId, ctx) {
  const id = await newId('gap', ctx);
  const result = await db.execute({
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
      JSON.stringify(mergeGapRecord({}, args, reportId)),
      args.sessionId ?? null,
      nowIso(ctx),
      nowIso(ctx),
    ],
  });
  return result.rowsAffected > 0 ? id : null;
}

/** Compare-and-swap merge into an existing open gap. */
async function mergeIntoGap(db, userId, row, args, reportId, ctx) {
  const merged = mergeGapRecord(parseJson(row.record_json, {}), args, reportId);
  const result = await db.execute({
    sql: `UPDATE curriculum_gaps SET description = ?, gap_kind = ?, record_json = ?, updated_at = ?
          WHERE user_id = ? AND id = ? AND record_json = ?
            AND status IN ('open', 'proposed', 'pr-opened')`,
    args: [
      args.description ?? row.description,
      args.gapKind ?? row.gap_kind,
      JSON.stringify(merged),
      nowIso(ctx),
      userId,
      row.id,
      row.record_json,
    ],
  });
  return result.rowsAffected > 0;
}

const GAP_WRITE_ATTEMPTS = 5;

export async function reportGap(db, userId, args, ctx) {
  requireConceptIds(args.relatedConceptIds ?? [], 'relatedConceptIds');
  requireConceptIds(args.prerequisiteConceptIds ?? [], 'prerequisiteConceptIds');
  if (args.sessionId)
    await requireOwned(db, 'learning_sessions', userId, args.sessionId, 'Session');
  const key = topicKey(args.topic);
  const reportId = ctx?.idempotencySeed ?? crypto.randomUUID();
  let merged = false;
  let gapId = null;
  for (let attempt = 0; attempt < GAP_WRITE_ATTEMPTS && !gapId; attempt += 1) {
    const row = (await db.execute({ sql: OPEN_GAP_SQL, args: [userId, key] })).rows[0];
    if (row) {
      merged = true;
      if (await mergeIntoGap(db, userId, row, args, reportId, ctx)) gapId = row.id;
    } else {
      gapId = await insertGap(db, userId, key, args, reportId, ctx);
    }
  }
  if (!gapId) throw conflict('The curriculum gap changed concurrently. Retry the same call.');
  const gap = gapFromRow(
    await requireOwned(db, 'curriculum_gaps', userId, gapId, 'Curriculum gap')
  );
  return { gap, merged, contribution: contributionGuide(gap) };
}

export async function updateGap(db, userId, args, ctx) {
  let row = await requireOwned(db, 'curriculum_gaps', userId, args.gapId, 'Curriculum gap');
  for (let attempt = 0; attempt < GAP_WRITE_ATTEMPTS; attempt += 1) {
    if (await swapGapFields(db, userId, row, args, ctx)) {
      const gap = gapFromRow(
        await requireOwned(db, 'curriculum_gaps', userId, row.id, 'Curriculum gap')
      );
      return { gap, contribution: contributionGuide(gap) };
    }
    row = await requireOwned(db, 'curriculum_gaps', userId, args.gapId, 'Curriculum gap');
  }
  throw conflict('The curriculum gap changed concurrently. Retry the same call.');
}

/**
 * Apply an update only if the gap's record and status are unchanged since it
 * was read, so a concurrent report or update is never overwritten. The record
 * is rewritten only when the update changes record fields.
 */
async function swapGapFields(db, userId, row, args, ctx) {
  const record = parseJson(row.record_json, {});
  if (args.learningObjectives) record.learningObjectives = uniqueStrings(args.learningObjectives);
  if (args.proposedConcept) record.proposedConcept = args.proposedConcept;
  const nextStatus =
    args.status ?? (args.prUrl && row.status === 'open' ? 'pr-opened' : row.status);
  await assertNoOtherOpenGap(db, userId, row, nextStatus);
  const result = await uniqueAsConflict(db, {
    sql: `UPDATE curriculum_gaps SET status = ?, pr_url = ?, description = ?, record_json = ?, updated_at = ?
          WHERE user_id = ? AND id = ? AND record_json = ? AND status = ?
            AND description = ? AND pr_url IS ?`,
    args: [
      nextStatus,
      args.prUrl ?? row.pr_url,
      args.description ?? row.description,
      args.learningObjectives || args.proposedConcept ? JSON.stringify(record) : row.record_json,
      nowIso(ctx),
      userId,
      row.id,
      row.record_json,
      row.status,
      row.description,
      row.pr_url ?? null,
    ],
  });
  return result.rowsAffected > 0;
}

/** A concurrent reopen that collides with the unique open-topic index is a conflict, not a crash. */
async function uniqueAsConflict(db, statement) {
  try {
    return await db.execute(statement);
  } catch (error) {
    if (/UNIQUE constraint/u.test(String(error?.message))) {
      throw conflict(
        'Another unresolved gap now covers this topic. List gaps and update that one.'
      );
    }
    throw error;
  }
}

/** Reopening a gap is refused while another unresolved gap covers the same topic. */
async function assertNoOtherOpenGap(db, userId, row, nextStatus) {
  if (!OPEN_GAP_STATUSES.has(nextStatus) || OPEN_GAP_STATUSES.has(row.status)) return;
  const other = (await db.execute({ sql: OPEN_GAP_SQL, args: [userId, row.topic_key] })).rows[0];
  if (other && other.id !== row.id) {
    throw new LearningRecordError(
      'version_conflict',
      `Gap "${other.id}" is already open for this topic. Update that gap instead.`,
      { openGapId: other.id }
    );
  }
}

export async function getGap(db, userId, args) {
  const gap = gapFromRow(
    await requireOwned(db, 'curriculum_gaps', userId, args.gapId, 'Curriculum gap')
  );
  return { gap, contribution: contributionGuide(gap) };
}

export async function listGaps(db, userId, args) {
  const paging = keysetPage(args, ['created_at', 'id']);
  const where = ['user_id = ?', ...(args.status ? ['status = ?'] : []), ...paging.where];
  const result = await db.execute({
    sql: `SELECT * FROM curriculum_gaps WHERE ${where.join(' AND ')} ${keysetSql(paging)}`,
    args: [userId, ...(args.status ? [args.status] : []), ...paging.params, paging.limit + 1],
  });
  return keysetResult(result.rows, paging, gapFromRow);
}

// --- Priority overrides ----------------------------------------------------------

function overrideFromRow(row) {
  return {
    id: row.id,
    day: row.day,
    reason: row.reason,
    chosen: parseJson(row.chosen_json, {}),
    recommended: parseJson(row.recommended_json, {}),
    createdAt: row.created_at,
  };
}

/** Whether the course, lesson and resource an override chose still exist. */
async function overrideTargetsExist(db, userId, chosen) {
  try {
    if (chosen.courseId) await validateCourseLink(db, userId, chosen.courseId, chosen.lessonId);
    if (chosen.resourceId)
      await requireOwned(db, 'learning_resources', userId, chosen.resourceId, 'Resource');
    return true;
  } catch (error) {
    if (error instanceof LearningRecordError) return false;
    throw error;
  }
}

/**
 * Today's active override: the latest one, unless what it chose has since
 * been deleted, in which case the computed recommendation applies again.
 */
export async function loadOverride(db, userId, day) {
  const result = await db.execute({
    sql: `SELECT * FROM learning_priority_overrides WHERE user_id = ? AND day = ?
          ORDER BY created_at DESC, rowid DESC LIMIT 1`,
    args: [userId, day],
  });
  const row = result.rows[0];
  if (!row) return null;
  const override = overrideFromRow(row);
  return (await overrideTargetsExist(db, userId, override.chosen)) ? override : null;
}

/** One override by id, as recorded. */
export async function getOverride(db, userId, id) {
  return overrideFromRow(
    await requireOwned(db, 'learning_priority_overrides', userId, id, 'Override')
  );
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
  return getOverride(db, userId, id);
}

// --- Deletion (cleanup) ------------------------------------------------------------

/** Removes the subject's preferences and all of its evidence together. */
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
    {
      sql: 'DELETE FROM learning_exposure_credits WHERE user_id = ? AND subject_key = ?',
      args: [userId, subject.key],
    },
  ]);
  return {
    entity: 'knowledge-state',
    subject: subject.key,
    deleted: result[0].rowsAffected + result[1].rowsAffected > 0,
    deletedAssessments: result[0].rowsAffected,
  };
}

/** Knowledge is derived from the remaining assessments, so a delete is one statement. */
async function deleteAssessment(db, userId, args) {
  const row = await requireOwned(db, 'learning_assessments', userId, args.id, 'Assessment');
  await db.execute({
    sql: 'DELETE FROM learning_assessments WHERE user_id = ? AND id = ?',
    args: [userId, row.id],
  });
  return { entity: 'assessment', id: row.id, deleted: true };
}

async function deleteSession(db, userId, args) {
  const row = await requireOwned(db, 'learning_sessions', userId, args.id, 'Session');
  const assessments = args.cascade
    ? {
        sql: 'DELETE FROM learning_assessments WHERE user_id = ? AND session_id = ?',
        args: [userId, row.id],
      }
    : {
        sql: 'UPDATE learning_assessments SET session_id = NULL WHERE user_id = ? AND session_id = ?',
        args: [userId, row.id],
      };
  const result = await db.batch([
    assessments,
    {
      sql: 'DELETE FROM learning_exposure_credits WHERE user_id = ? AND session_id = ?',
      args: [userId, row.id],
    },
    { sql: 'DELETE FROM learning_sessions WHERE user_id = ? AND id = ?', args: [userId, row.id] },
  ]);
  return {
    entity: 'session',
    id: row.id,
    deleted: true,
    deletedAssessments: args.cascade ? result[0].rowsAffected : 0,
  };
}

async function deleteCourse(db, userId, args) {
  const row = await requireOwned(db, 'learning_courses', userId, args.id, 'Course');
  await db.batch([
    {
      sql: 'UPDATE learning_sessions SET course_id = NULL, lesson_id = NULL, version = version + 1 WHERE user_id = ? AND course_id = ?',
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

/**
 * Unlinks the resource from sessions and records its id as deleted, so a
 * re-save of the URL gets a new id that old references never reach.
 */
async function deleteResource(db, userId, args, ctx) {
  const row = await requireOwned(db, 'learning_resources', userId, args.id, 'Resource');
  await db.batch([
    {
      sql: `UPDATE learning_sessions SET
              record_json = json_set(record_json, '$.resourceIds', json((
                SELECT json_group_array(value) FROM json_each(learning_sessions.record_json, '$.resourceIds')
                WHERE value <> ?))),
              version = version + 1
            WHERE user_id = ?
              AND EXISTS (SELECT 1 FROM json_each(learning_sessions.record_json, '$.resourceIds') WHERE value = ?)`,
      args: [row.id, userId, row.id],
    },
    {
      sql: `INSERT OR IGNORE INTO learning_resource_deletions (user_id, resource_id, url_fingerprint, deleted_at)
            VALUES (?, ?, ?, ?)`,
      args: [userId, row.id, await urlFingerprint(userId, row.canonical_url), nowIso(ctx)],
    },
    { sql: 'DELETE FROM learning_resources WHERE user_id = ? AND id = ?', args: [userId, row.id] },
  ]);
  return { entity: 'resource', id: row.id, deleted: true };
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
  resource: deleteResource,
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

/**
 * Reserve an idempotency key before running a mutation. Returns the existing
 * receipt when the key is already used, or null when this caller owns it.
 * A reservation is never reclaimed automatically: if a request died after
 * committing but before completing its receipt, its outcome is unknown, and
 * re-running it could undo newer changes. The caller re-reads and uses a new key.
 */
export async function reserveReceipt(db, userId, key, tool, hash, now = new Date()) {
  const reserved = await db.execute({
    sql: `INSERT INTO mcp_mutation_receipts (user_id, idempotency_key, tool, request_hash, state, created_at)
          VALUES (?, ?, ?, ?, 'pending', ?) ON CONFLICT(user_id, idempotency_key) DO NOTHING`,
    args: [userId, key, tool, hash, now.toISOString()],
  });
  if (reserved.rowsAffected > 0) return null;
  const existing = await db.execute({
    sql: `SELECT tool, request_hash, state, response_json, created_at FROM mcp_mutation_receipts
          WHERE user_id = ? AND idempotency_key = ?`,
    args: [userId, key],
  });
  return existing.rows[0] ?? { tool, request_hash: hash, state: 'pending', response_json: '' };
}

export async function completeReceipt(db, userId, key, response) {
  await db.execute({
    sql: `UPDATE mcp_mutation_receipts SET state = 'complete', response_json = ?
          WHERE user_id = ? AND idempotency_key = ?`,
    args: [JSON.stringify(response), userId, key],
  });
}

export async function releaseReceipt(db, userId, key) {
  await db.execute({
    sql: "DELETE FROM mcp_mutation_receipts WHERE user_id = ? AND idempotency_key = ? AND state = 'pending'",
    args: [userId, key],
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
