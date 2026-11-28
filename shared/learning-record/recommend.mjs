/**
 * Adaptive daily priority. Deterministic: the same record yields the same
 * recommendation. Order of concern:
 *   1. Revision of evidence-backed knowledge that is slipping (needs-revision / due).
 *   2. A prerequisite with demonstrated weakness blocking the primary course.
 *   3. The next lesson of the primary course (other active courses after it).
 *   4. Unresolved questions from recent sessions.
 *   5. Emerging interests discovered through reading and discussion.
 *   6. The product's legacy curriculum priority, filtered by the knowledge record.
 * Unassessed concepts are probed, never assumed to be beginner material, and
 * old failed drills never outrank the learner's own course objectives.
 */
import { CONCEPT_BY_ID, PRODUCT_ORIGIN, conceptSummary, conceptUrl } from './curriculum.mjs';
import { belowTarget, categoryOf, presentState, resolveSubject } from './knowledge.mjs';
import { nextCourseLesson, links } from './store.mjs';
import { INTEREST_RANK, LEVEL_RANK } from './schema.mjs';

const DAY_MS = 86_400_000;

function disinterested(profile, state, concept) {
  if (state?.interest === 'avoid') return true;
  const avoid = (profile?.profile?.disinterests ?? []).map((item) => String(item).toLowerCase());
  if (!avoid.length) return false;
  const haystack = [state?.label, concept?.name, concept?.id, ...(concept?.tags ?? [])]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase());
  return avoid.some((term) => haystack.some((value) => value.includes(term)));
}

function minutesFor(profile, legacyMinutes) {
  return (
    profile?.profile?.availableTime?.minutesPerSession ??
    profile?.profile?.availableTime?.minutesPerDay ??
    profile?.productPreferences?.minutesPerDay ??
    legacyMinutes ??
    45
  );
}

function conceptRef(conceptId, states, now) {
  const concept = CONCEPT_BY_ID.get(conceptId);
  if (!concept) return null;
  const state = states.get(conceptId);
  return {
    ...conceptSummary(concept),
    learnerLevel: state?.assessed_level ?? 'unassessed',
    selfReportedLevel: state?.self_reported_level ?? null,
    category: categoryOf(state, now),
  };
}

function courseConceptIds(course) {
  return new Set(course.lessons.flatMap((lesson) => lesson.conceptIds ?? []));
}

function revisionCandidates(inputs, now, primaryConcepts) {
  const output = [];
  for (const state of inputs.states.values()) {
    const category = categoryOf(state, now);
    if (category !== 'needs-revision' && category !== 'due-for-review') continue;
    const concept = CONCEPT_BY_ID.get(state.subject_key);
    if (disinterested(inputs.profile, state, concept)) continue;
    const relevant =
      primaryConcepts.has(state.subject_key) ||
      (INTEREST_RANK[state.interest] ?? 0) >= 1 ||
      Boolean(state.target_level);
    if (!relevant) continue;
    const overdueDays = state.review_due_at
      ? Math.max(0, (now.getTime() - Date.parse(state.review_due_at)) / DAY_MS)
      : 0;
    output.push({
      kind: 'revision',
      score:
        (category === 'needs-revision' ? 92 : 78) +
        (primaryConcepts.has(state.subject_key) ? 5 : 0) +
        Math.min(5, overdueDays),
      objective: `Revise ${state.label}: retrieve the mechanism from memory, then repair what slipped.`,
      rationale:
        category === 'needs-revision'
          ? `The last assessment of ${state.label} found gaps that need revision.`
          : `${state.label} was demonstrated at ${state.assessed_level} but its review came due ${state.review_due_at.slice(0, 10)}.`,
      evidenceRequired: 'Run a recall-check without notes and submit it with submit_assessment.',
      subjectKeys: [state.subject_key],
      topic: concept ? null : state.label,
    });
  }
  return output;
}

function lessonPrerequisites(lesson, states) {
  const own = new Set(lesson.conceptIds ?? []);
  const prerequisites = [
    ...new Set([...own].flatMap((id) => CONCEPT_BY_ID.get(id)?.prerequisites ?? [])),
  ].filter((id) => !own.has(id));
  const isWeak = (state) =>
    Boolean(state?.assessed_level) &&
    (state.outcome === 'needs-depth' || state.outcome === 'needs-revision') &&
    LEVEL_RANK[state.assessed_level] < LEVEL_RANK.intermediate;
  return {
    weak: prerequisites.filter((id) => isWeak(states.get(id))),
    unassessed: prerequisites.filter((id) => !states.get(id)?.assessed_level),
  };
}

function prerequisiteGapCandidate(course, lesson, weak) {
  return {
    kind: 'prerequisite-gap',
    score: 88,
    objective: `Strengthen ${weak.map((id) => CONCEPT_BY_ID.get(id).name).join(', ')} before "${lesson.title}".`,
    rationale: `Assessment evidence shows weak prerequisites for the next lesson of "${course.title}".`,
    evidenceRequired: 'Re-assess each prerequisite with an explain-back or exercise.',
    subjectKeys: weak,
    course,
    lesson,
  };
}

function courseLessonCandidate(course, lesson, unassessed, primary, index) {
  const target = course.targetLevel ? ` (target: ${course.targetLevel})` : '';
  return {
    kind: 'course-lesson',
    score: primary ? 82 : 60 - index,
    objective: lesson.objective ?? `Work through "${lesson.title}".`,
    rationale: `Next lesson in ${primary ? 'your primary course' : 'active course'} "${course.title}"${target}.`,
    evidenceRequired:
      'Teach one idea at a time, then record an assessment (explain-back, exercise or trade-off analysis) for each lesson concept.',
    probeFirst: unassessed.length
      ? {
          conceptIds: unassessed,
          instruction:
            'These prerequisites are unassessed, not unknown. Probe each with one quick question; skip teaching what the learner already knows.',
        }
      : null,
    subjectKeys: lesson.conceptIds ?? [],
    topic: lesson.topics?.[0] ?? null,
    course,
    lesson,
  };
}

function lessonCandidates(inputs) {
  const output = [];
  inputs.courses.forEach((course, index) => {
    const lesson = nextCourseLesson(course.lessons);
    if (!lesson) return;
    const primary = course.isPrimary || index === 0;
    const { weak, unassessed } = lessonPrerequisites(lesson, inputs.states);
    if (primary && weak.length) output.push(prerequisiteGapCandidate(course, lesson, weak));
    output.push(courseLessonCandidate(course, lesson, unassessed, primary, index));
  });
  return output;
}

function followUpCandidates(inputs) {
  const output = [];
  for (const session of inputs.sessions) {
    if (!session.unresolvedQuestions?.length) continue;
    output.push({
      kind: 'follow-up',
      score: 55,
      objective: `Resolve an open question from "${session.title}": ${session.unresolvedQuestions[0]}`,
      rationale: `${session.unresolvedQuestions.length} question(s) were left unresolved on ${session.startedAt.slice(0, 10)}.`,
      evidenceRequired:
        'Answer the question with the learner reasoning aloud; record insights on a new session.',
      subjectKeys: session.conceptIds ?? [],
      topic: session.topics?.[0] ?? null,
      session,
    });
    break;
  }
  return output;
}

function interestCandidates(inputs, now, coveredConcepts) {
  const output = [];
  const interesting = [...inputs.states.values()]
    .filter(
      (state) =>
        (INTEREST_RANK[state.interest] ?? 0) >= 1 &&
        !coveredConcepts.has(state.subject_key) &&
        !disinterested(inputs.profile, state, CONCEPT_BY_ID.get(state.subject_key)) &&
        (!state.assessed_level || belowTarget(state))
    )
    .sort(
      (a, b) =>
        (INTEREST_RANK[b.interest] ?? 0) - (INTEREST_RANK[a.interest] ?? 0) ||
        (b.exposure_count ?? 0) - (a.exposure_count ?? 0) ||
        String(b.last_engaged_at ?? '').localeCompare(String(a.last_engaged_at ?? ''))
    );
  const top = interesting[0];
  if (top) {
    const resource = inputs.resources.find(
      (item) =>
        item.conceptIds.includes(top.subject_key) ||
        item.topics.some((topic) => {
          try {
            return resolveSubject({ topic }).key === top.subject_key;
          } catch {
            return false;
          }
        })
    );
    output.push({
      kind: 'explore-interest',
      score: top.interest === 'high' ? 58 : 48,
      objective: `Go deeper on ${top.label}, an interest surfaced in your recent reading and discussion.`,
      rationale: `Interest is ${top.interest} after ${top.exposure_count ?? 0} engagement(s), and no active course covers it yet. Consider creating a course if it holds.`,
      evidenceRequired:
        'Probe current understanding first; record an assessment before calling anything learned.',
      subjectKeys: [top.subject_key],
      topic: CONCEPT_BY_ID.has(top.subject_key) ? null : top.label,
      resource,
    });
  }
  const queued = inputs.resources.find((item) =>
    item.conceptIds.some((id) => coveredConcepts.has(id))
  );
  if (queued) {
    output.push({
      kind: 'resource',
      score: 45,
      objective: `Read and discuss "${queued.title}".`,
      rationale: `It is ${queued.status} and supports an active course concept.`,
      evidenceRequired:
        'Discuss it, record insights in a reading session, then assess the underlying concept.',
      subjectKeys: queued.conceptIds,
      resource: queued,
    });
  }
  return output;
}

function legacyCandidate(inputs, legacy, now, hasCourses) {
  const concept = legacy?.concept ? CONCEPT_BY_ID.get(legacy.concept.id) : null;
  if (!concept) return [];
  const state = inputs.states.get(concept.id);
  if (disinterested(inputs.profile, state, concept)) return [];
  if (state?.assessed_level && !belowTarget(state) && state.outcome !== 'needs-revision') {
    const known = ['previously-known', 'newly-learned'].includes(state.outcome);
    if (known && LEVEL_RANK[state.assessed_level] >= LEVEL_RANK.intermediate) return [];
  }
  const base = legacy.reason === 'recovery' ? 25 : legacy.reason === 'retention' ? 40 : 35;
  return [
    {
      kind: `curriculum-${legacy.reason}`,
      score: hasCourses ? base - 10 : base,
      objective: legacy.objective,
      rationale: `${legacy.rationale} (product curriculum signal)`,
      evidenceRequired: legacy.evidenceRequired,
      subjectKeys: [concept.id],
      probeFirst: state?.assessed_level
        ? null
        : {
            conceptIds: [concept.id],
            instruction: `${concept.name} is unassessed. Probe before teaching; it may already be known.`,
          },
      actionUrl: legacy.actionUrl,
    },
  ];
}

function present(candidate, inputs, now, minutes) {
  const concepts = (candidate.subjectKeys ?? [])
    .map((key) => conceptRef(key, inputs.states, now))
    .filter(Boolean);
  const topics = (candidate.subjectKeys ?? [])
    .filter((key) => !CONCEPT_BY_ID.has(key))
    .map((key) => inputs.states.get(key))
    .filter(Boolean)
    .map((state) => presentState(state, now));
  const deepLinks = {
    ...(candidate.course ? { course: links.course(candidate.course.id) } : {}),
    ...(candidate.session ? { session: links.session(candidate.session.id) } : {}),
    ...(candidate.resource
      ? { resource: links.resource(candidate.resource.id), source: candidate.resource.url }
      : {}),
  };
  const firstConcept = concepts[0];
  return {
    kind: candidate.kind,
    objective: candidate.objective,
    rationale: candidate.rationale,
    evidenceRequired: candidate.evidenceRequired,
    minutes,
    concepts,
    topics,
    topic: candidate.topic ?? null,
    course: candidate.course
      ? {
          id: candidate.course.id,
          title: candidate.course.title,
          url: links.course(candidate.course.id),
        }
      : null,
    lesson: candidate.lesson
      ? {
          id: candidate.lesson.id,
          title: candidate.lesson.title,
          objective: candidate.lesson.objective ?? null,
        }
      : null,
    resource: candidate.resource
      ? { id: candidate.resource.id, title: candidate.resource.title, url: candidate.resource.url }
      : null,
    probeFirst: candidate.probeFirst ?? null,
    deepLinks,
    actionUrl:
      candidate.actionUrl ??
      deepLinks.course ??
      deepLinks.session ??
      deepLinks.resource ??
      (firstConcept
        ? `${PRODUCT_ORIGIN}/study/concept/${firstConcept.id}`
        : `${PRODUCT_ORIGIN}/record`),
    conceptUrl: firstConcept ? conceptUrl(firstConcept.id) : null,
  };
}

export function buildAdaptivePriority({ inputs, legacy, now = new Date(), override = null }) {
  const primary = inputs.courses.find((course) => course.isPrimary) ?? inputs.courses[0] ?? null;
  const primaryConcepts = primary ? courseConceptIds(primary) : new Set();
  const covered = new Set(inputs.courses.flatMap((course) => [...courseConceptIds(course)]));
  const minutes = minutesFor(inputs.profile, legacy?.minutes);
  const candidates = [
    ...revisionCandidates(inputs, now, primaryConcepts),
    ...lessonCandidates(inputs),
    ...followUpCandidates(inputs),
    ...interestCandidates(inputs, now, covered),
    ...legacyCandidate(inputs, legacy, now, inputs.courses.length > 0),
  ].sort((a, b) => b.score - a.score || a.objective.localeCompare(b.objective));

  const seen = new Set();
  const ranked = candidates.filter((candidate) => {
    const key = `${candidate.kind}:${(candidate.subjectKeys ?? []).join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const computed = ranked[0]
    ? present(ranked[0], inputs, now, minutes)
    : {
        kind: 'set-direction',
        objective: 'Choose what to learn next: discuss interests and goals, then create a course.',
        rationale:
          'The record has no active course, due revision, open question or emerging interest yet.',
        evidenceRequired: 'Update the learning profile and create a course with create_course.',
        minutes,
        concepts: [],
        topics: [],
        topic: null,
        course: null,
        lesson: null,
        resource: null,
        probeFirst: null,
        deepLinks: {},
        actionUrl: `${PRODUCT_ORIGIN}/record`,
        conceptUrl: null,
      };
  const alternatives = ranked
    .slice(1, 4)
    .map((candidate) => present(candidate, inputs, now, minutes));
  const signals = {
    activeCourses: inputs.courses.length,
    primaryCourse: primary ? { id: primary.id, title: primary.title } : null,
    recentSessions: inputs.sessions.length,
    revisionDue: [...inputs.states.values()].filter((state) =>
      ['needs-revision', 'due-for-review'].includes(categoryOf(state, now))
    ).length,
    queuedResources: inputs.resources.length,
    openCurriculumGaps: inputs.openGaps,
    availableMinutes: minutes,
  };
  const base = {
    schemaVersion: 'swe-adaptive-priority.v1',
    generatedAt: now.toISOString(),
    signals,
    alternatives,
    productPriority: legacy ?? null,
    howToOverride:
      'If the learner wants something else, call override_daily_learning_priority with the chosen objective and the reason.',
  };
  if (override) {
    return {
      ...base,
      source: 'agent-override',
      priority: {
        ...override.chosen,
        kind: 'override',
        minutes: override.chosen.minutes ?? minutes,
      },
      override: { id: override.id, reason: override.reason, createdAt: override.createdAt },
      computed,
    };
  }
  return { ...base, source: 'computed', priority: computed };
}
