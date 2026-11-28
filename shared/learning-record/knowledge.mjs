/**
 * Pure knowledge-state rules. Evidence (assessments) is the only input that
 * moves an assessed level; self-assessment, reading and session activity are
 * stored but never treated as demonstrated understanding.
 */
import { CONCEPT_BY_ID, TRACK_IDS, conceptUrl, domainOf } from './curriculum.mjs';
import { LEVEL_RANK, invalid, topicKey } from './schema.mjs';

const METHOD_WEIGHT = {
  socratic: 0.6,
  'explain-back': 0.7,
  exercise: 0.75,
  implementation: 0.85,
  debugging: 0.8,
  'tradeoff-analysis': 0.7,
  'recall-check': 0.65,
};
const DAY_MS = 86_400_000;
const MAX_INTERVAL_DAYS = 180;

/** Resolve {conceptId | domain | topic} to a stable subject key. */
export function resolveSubject({ conceptId, domain, topic } = {}) {
  const given = [conceptId, domain, topic].filter((value) => value !== undefined);
  if (given.length !== 1) {
    throw invalid('Specify exactly one of conceptId, domain or topic for a subject.');
  }
  if (conceptId !== undefined) {
    const concept = CONCEPT_BY_ID.get(conceptId);
    if (!concept) {
      throw invalid(
        `Unknown concept id "${conceptId}". Use search_curriculum, or pass it as a free-text topic.`
      );
    }
    return { key: concept.id, kind: 'concept', label: concept.name };
  }
  if (domain !== undefined) {
    if (!TRACK_IDS.has(domain)) {
      throw invalid(`Unknown domain "${domain}". Use search_curriculum with kind "track".`);
    }
    return { key: `domain:${domain}`, kind: 'domain', label: domain };
  }
  const label = String(topic).trim();
  // A free-text topic that exactly names a concept is that concept.
  const key = topicKey(label);
  const concept = CONCEPT_BY_ID.get(key.slice('topic:'.length));
  if (concept) return { key: concept.id, kind: 'concept', label: concept.name };
  return { key, kind: 'topic', label };
}

export function emptyState(subject) {
  return {
    subject_key: subject.key,
    subject_kind: subject.kind,
    label: subject.label,
    self_reported_level: null,
    assessed_level: null,
    target_level: null,
    interest: null,
    confidence: 0,
    outcome: null,
    evidence_count: 0,
    exposure_count: 0,
    review_interval_days: null,
    review_due_at: null,
    last_assessed_at: null,
    last_engaged_at: null,
    notes: null,
  };
}

function nextInterval(previous, outcome) {
  if (outcome === 'needs-revision') return 1;
  if (outcome === 'needs-depth') return 2;
  if (outcome === 'previously-known') {
    return previous ? Math.min(MAX_INTERVAL_DAYS, Math.max(14, previous * 2)) : 30;
  }
  return previous ? Math.min(MAX_INTERVAL_DAYS, Math.round(previous * 2.5)) : 3;
}

/** Fold one assessment into a knowledge state. Returns a new object. */
function applyAssessment(state, assessment) {
  const next = { ...state, evidence_count: (state.evidence_count ?? 0) + 1 };
  if (assessment.method === 'self-assessment') {
    next.self_reported_level = assessment.demonstrated_level;
    return next;
  }
  const base = METHOD_WEIGHT[assessment.method] ?? 0.5;
  const weight =
    typeof assessment.score === 'number' ? base * (0.5 + 0.5 * assessment.score) : base;
  const previous = state.confidence ?? 0;
  let confidence;
  if (assessment.outcome === 'previously-known' || assessment.outcome === 'newly-learned') {
    confidence = 1 - (1 - previous) * (1 - weight * 0.6);
  } else if (assessment.outcome === 'needs-depth') {
    confidence = Math.max(previous * 0.8, weight * 0.35);
  } else {
    confidence = previous * 0.6;
  }
  const interval = nextInterval(state.review_interval_days, assessment.outcome);
  const assessedAt = Date.parse(assessment.assessed_at);
  next.assessed_level = assessment.demonstrated_level;
  next.outcome = assessment.outcome;
  next.confidence = Math.round(Math.min(0.97, confidence) * 1000) / 1000;
  next.review_interval_days = interval;
  next.review_due_at = new Date(assessedAt + interval * DAY_MS).toISOString();
  next.last_assessed_at = assessment.assessed_at;
  return next;
}

/** Recompute evidence-derived fields from scratch (used after deletions). */
/**
 * Recompute every evidence-derived field from the stored assessments, in
 * assessment-time order, so backfilled or deleted evidence cannot leave a
 * stale level. Target level, interest, exposure and notes are kept.
 */
export function replayAssessments(state, assessments) {
  const reset = {
    ...state,
    self_reported_level: null,
    assessed_level: null,
    outcome: null,
    confidence: 0,
    evidence_count: 0,
    review_interval_days: null,
    review_due_at: null,
    last_assessed_at: null,
  };
  return [...assessments]
    .sort(
      (a, b) =>
        String(a.assessed_at).localeCompare(String(b.assessed_at)) ||
        String(a.id).localeCompare(String(b.id))
    )
    .reduce(applyAssessment, reset);
}

export function categoryOf(state, now = new Date()) {
  if (!state?.assessed_level) return 'unassessed';
  if (state.outcome === 'needs-revision') return 'needs-revision';
  if (state.review_due_at && Date.parse(state.review_due_at) <= now.getTime()) {
    return 'due-for-review';
  }
  if (state.outcome === 'needs-depth') return 'needs-depth';
  return state.outcome ?? 'unassessed';
}

export function belowTarget(state) {
  if (!state?.target_level) return false;
  return (LEVEL_RANK[state.assessed_level ?? 'unassessed'] ?? 0) < LEVEL_RANK[state.target_level];
}

export function presentState(state, now = new Date()) {
  const concept = state.subject_kind === 'concept' ? CONCEPT_BY_ID.get(state.subject_key) : null;
  return {
    subject: {
      key: state.subject_key,
      kind: state.subject_kind,
      label: state.label,
      ...(concept
        ? { conceptId: concept.id, domain: domainOf(concept), url: conceptUrl(concept.id) }
        : {}),
    },
    level: state.assessed_level ?? 'unassessed',
    levelBasis: state.assessed_level
      ? 'assessed'
      : state.self_reported_level
        ? 'self-reported-only'
        : 'none',
    selfReportedLevel: state.self_reported_level ?? null,
    assessedLevel: state.assessed_level ?? null,
    targetLevel: state.target_level ?? null,
    belowTarget: belowTarget(state),
    interest: state.interest ?? null,
    assessmentConfidence: state.confidence ?? 0,
    outcome: state.outcome ?? null,
    category: categoryOf(state, now),
    evidenceCount: state.evidence_count ?? 0,
    exposureCount: state.exposure_count ?? 0,
    lastAssessedAt: state.last_assessed_at ?? null,
    lastEngagedAt: state.last_engaged_at ?? null,
    reviewDueAt: state.review_due_at ?? null,
    notes: state.notes ?? null,
  };
}
