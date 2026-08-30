import conceptsData from '../../src/data/concepts.json' with { type: 'json' };
import drillsData from '../../src/data/drills.json' with { type: 'json' };
import roadmapsData from '../../src/data/roadmaps.json' with { type: 'json' };

import { masteryConfidence } from './confidence.mjs';

const CONCEPTS = conceptsData.concepts ?? [];
const CONCEPT_BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
const DRILLS = drillsData.drills ?? [];
const DRILL_BY_ID = new Map(DRILLS.map((drill) => [drill.id, drill]));
const ROADMAPS = roadmapsData.roadmaps ?? [];
const ROADMAP_BY_ID = new Map(ROADMAPS.map((roadmap) => [roadmap.id, roadmap]));
const DEFAULT_ROADMAP_ID = 'ai-search-infra-90-day';
const PREREQUISITE_CONFIDENCE = 0.4;

const DEFAULT_PROFILE = {
  minutesPerDay: 45,
  roadmapWeights: { [DEFAULT_ROADMAP_ID]: 1 },
  trackIds: [],
  skipConceptIds: [],
};

function profileFromRow(row) {
  if (!row?.profile_json) return DEFAULT_PROFILE;
  try {
    const parsed = JSON.parse(row.profile_json);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function normalizeWeights(weights) {
  const entries = Object.entries(weights ?? {}).filter(
    ([id, weight]) => ROADMAP_BY_ID.has(id) && Number.isFinite(weight) && weight > 0
  );
  if (!entries.length) return [[DEFAULT_ROADMAP_ID, 1]];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  return entries.map(([id, weight]) => [id, weight / total]).sort((a, b) => b[1] - a[1]);
}

function masteryMap(rows, now) {
  return Object.fromEntries(
    rows.map((row) => [
      row.concept_id,
      {
        stability: row.stability ?? 0,
        reps: row.reps ?? 0,
        lapses: row.lapses ?? 0,
        lastReview: row.last_review ?? null,
        due: row.due ?? null,
        confidence: masteryConfidence(row, now),
      },
    ])
  );
}

function isDue(entry, now) {
  if (!entry?.due) return false;
  const dueAt = Date.parse(entry.due);
  return Number.isFinite(dueAt) && dueAt <= now.getTime();
}

function status(entry, now) {
  if (!entry) return 'untouched';
  if (entry.confidence >= 0.85 && entry.reps >= 2) return 'mastered';
  if (isDue(entry, now)) return 'due';
  if (entry.reps >= 3) return 'drilling';
  return 'learning';
}

function selectedTracks(profile) {
  const ids = (profile.trackIds ?? []).filter(Boolean);
  return ids.length ? new Set(ids) : null;
}

function conceptAllowed(concept, profile, tracks) {
  if (!concept || new Set(profile.skipConceptIds ?? []).has(concept.id)) return false;
  return !tracks || concept.tags.some((tag) => tracks.has(tag));
}

function reachable(concept, mastery) {
  return (concept.prerequisites ?? []).every(
    (conceptId) => (mastery[conceptId]?.confidence ?? 0) >= PREREQUISITE_CONFIDENCE
  );
}

function roadmapConcepts(roadmap) {
  return (roadmap?.milestones ?? []).flatMap((milestone) => milestone.concepts ?? []);
}

function recoveryCandidate(drillRows, profile, mastery, tracks) {
  return drillRows
    .filter((row) => (row.attempts ?? 0) >= 2 && row.status !== 'solved')
    .map((row) => {
      const drill = DRILL_BY_ID.get(row.drill_id);
      const concept = drill ? CONCEPT_BY_ID.get(drill.conceptId) : null;
      return { row, drill, concept };
    })
    .filter(
      ({ concept }) =>
        conceptAllowed(concept, profile, tracks) && (mastery[concept.id]?.confidence ?? 0) < 0.55
    )
    .sort(
      (a, b) =>
        (b.row.attempts ?? 0) - (a.row.attempts ?? 0) || a.drill.id.localeCompare(b.drill.id)
    )[0];
}

function retentionCandidate(profile, mastery, tracks, now) {
  const candidates = [];
  for (const [roadmapId, weight] of normalizeWeights(profile.roadmapWeights)) {
    const roadmap = ROADMAP_BY_ID.get(roadmapId);
    for (const conceptId of roadmapConcepts(roadmap)) {
      const concept = CONCEPT_BY_ID.get(conceptId);
      const entry = mastery[conceptId];
      if (
        !conceptAllowed(concept, profile, tracks) ||
        !reachable(concept, mastery) ||
        !isDue(entry, now)
      ) {
        continue;
      }
      candidates.push({ concept, roadmap, score: weight * (1 - (entry?.confidence ?? 0)) });
    }
  }
  return candidates.sort(
    (a, b) => b.score - a.score || a.concept.id.localeCompare(b.concept.id)
  )[0];
}

function progressionCandidate(profile, mastery, tracks, now) {
  for (const [roadmapId] of normalizeWeights(profile.roadmapWeights)) {
    const roadmap = ROADMAP_BY_ID.get(roadmapId);
    for (const conceptId of roadmapConcepts(roadmap)) {
      const concept = CONCEPT_BY_ID.get(conceptId);
      if (
        conceptAllowed(concept, profile, tracks) &&
        reachable(concept, mastery) &&
        status(mastery[conceptId], now) !== 'mastered'
      ) {
        return { concept, roadmap };
      }
    }
  }

  const concept = CONCEPTS.filter(
    (candidate) =>
      conceptAllowed(candidate, profile, tracks) &&
      reachable(candidate, mastery) &&
      status(mastery[candidate.id], now) !== 'mastered'
  ).sort((a, b) => {
    const confidenceDelta = (mastery[a.id]?.confidence ?? 0) - (mastery[b.id]?.confidence ?? 0);
    return confidenceDelta || (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id);
  })[0];
  if (!concept && tracks)
    return progressionCandidate({ ...profile, trackIds: [] }, mastery, null, now);
  if (!concept) return null;
  const roadmap =
    ROADMAPS.find((candidate) => roadmapConcepts(candidate).includes(concept.id)) ??
    ROADMAP_BY_ID.get(DEFAULT_ROADMAP_ID) ??
    ROADMAPS[0];
  return { concept, roadmap };
}

function actionFor(concept, reason, drill) {
  if (reason === 'recovery' && drill) {
    return {
      label: 'Retry the failed drill',
      url: `https://learn.significanthobbies.com/drills/${drill.id}`,
    };
  }
  if (reason === 'retention') {
    return {
      label: 'Start due retrieval',
      url: 'https://learn.significanthobbies.com/practice/all?tab=reviews',
    };
  }
  return {
    label: 'Start focused study',
    url: `https://learn.significanthobbies.com/study/concept/${concept.id}`,
  };
}

function priorityCandidate({ mastery, drillRows, profile, now }) {
  const tracks = selectedTracks(profile);
  const recovery = recoveryCandidate(drillRows, profile, mastery, tracks);
  if (recovery) return { ...recovery, reason: 'recovery', roadmap: null };
  const retention = retentionCandidate(profile, mastery, tracks, now);
  if (retention) return { ...retention, reason: 'retention', drill: null, row: null };
  const progression = progressionCandidate(profile, mastery, tracks, now);
  if (progression) return { ...progression, reason: 'progression', drill: null, row: null };
  return null;
}

function priorityCopy(candidate, entry) {
  const { concept, drill, reason, row } = candidate;
  if (reason === 'recovery') {
    return {
      objective: `Repair the misconception blocking ${concept.name}.`,
      rationale: `${row.attempts} unsuccessful attempts expose a live misconception. Recovery outranks new material.`,
      evidenceRequired: `Solve “${drill.title}” and explain why the failed approach breaks.`,
    };
  }
  if (reason === 'retention') {
    return {
      objective: `Retrieve ${concept.name} before its memory trace weakens further.`,
      rationale: `${concept.name} is due at ${Math.round((entry?.confidence ?? 0) * 100)}% confidence. Retention outranks progression.`,
      evidenceRequired:
        'Answer the due review, then explain the mechanism without opening the source.',
    };
  }
  return {
    objective: `Build a causal model of ${concept.name}.`,
    rationale: `${concept.name} is the next reachable unfinished concept in ${candidate.roadmap?.title ?? 'your active path'}.`,
    evidenceRequired: 'Write an explain-back with one example and one failure mode.',
  };
}

function dailyPriority({ mastery, drillRows, profile, now }) {
  const candidate = priorityCandidate({ mastery, drillRows, profile, now });
  if (!candidate) {
    return {
      state: 'caught-up',
      reason: 'caught-up',
      concept: null,
      objective: 'Synthesize one mechanism you can explain without notes.',
      rationale: 'No failed, due, or reachable unfinished concept remains in the selected scope.',
      evidenceRequired: 'Write a causal explanation and one counterexample in Playground.',
      minutes: profile.minutesPerDay,
      action: {
        label: 'Start a synthesis note',
        url: 'https://learn.significanthobbies.com/playground',
      },
    };
  }

  const { concept, roadmap, reason } = candidate;
  const entry = mastery[concept.id];
  const copy = priorityCopy(candidate, entry);

  return {
    state: 'ready',
    reason,
    concept: {
      id: concept.id,
      name: concept.name,
      description: concept.description,
      difficulty: concept.difficulty,
      tags: concept.tags,
      confidence: entry?.confidence ?? null,
      status: status(entry, now),
    },
    roadmap: roadmap ? { id: roadmap.id, title: roadmap.title } : null,
    ...copy,
    minutes: profile.minutesPerDay,
    action: actionFor(concept, reason, candidate.drill),
  };
}

function progressSummary({ mastery, drillRows, activityRow, feynmanRow, now }) {
  const counts = {
    total: CONCEPTS.length,
    untouched: 0,
    learning: 0,
    drilling: 0,
    due: 0,
    mastered: 0,
  };
  let confidenceTotal = 0;
  for (const concept of CONCEPTS) {
    const entry = mastery[concept.id];
    const lifecycle = status(entry, now);
    counts[lifecycle] += 1;
    confidenceTotal += entry?.confidence ?? 0;
  }

  const shaky = CONCEPTS.filter((concept) => {
    const entry = mastery[concept.id];
    return entry && entry.confidence < 0.6;
  })
    .sort((a, b) => mastery[a.id].confidence - mastery[b.id].confidence || a.id.localeCompare(b.id))
    .map((concept) => ({
      id: concept.id,
      name: concept.name,
      kind: 'shaky',
      confidence: mastery[concept.id].confidence,
    }));
  const uncovered = CONCEPTS.filter((concept) => !mastery[concept.id])
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id))
    .map((concept) => ({
      id: concept.id,
      name: concept.name,
      kind: 'uncovered',
      confidence: null,
    }));

  return {
    concepts: counts,
    averageConfidence: CONCEPTS.length ? confidenceTotal / CONCEPTS.length : 0,
    drills: {
      attempted: drillRows.filter((row) => (row.attempts ?? 0) > 0).length,
      solved: drillRows.filter((row) => row.status === 'solved').length,
    },
    explainBacks: {
      count: Number(feynmanRow?.count ?? 0),
      averageGrade:
        feynmanRow?.average_grade == null ? null : Math.round(Number(feynmanRow.average_grade)),
    },
    activity: {
      events: Number(activityRow?.count ?? 0),
      activeMinutes: Math.round(Number(activityRow?.duration_ms ?? 0) / 60_000),
      lastAt: activityRow?.last_at ?? null,
    },
    biggestGaps: [...shaky, ...uncovered].slice(0, 5),
  };
}

export function buildDailyLearningProjection({
  masteryRows = [],
  drillRows = [],
  profileRow = null,
  activityRow = null,
  feynmanRow = null,
  now = new Date(),
}) {
  const mastery = masteryMap(masteryRows, now);
  const profile = profileFromRow(profileRow);
  return {
    schemaVersion: 'swe-learning-projection.v1',
    generatedAt: now.toISOString(),
    priority: dailyPriority({ mastery, drillRows, profile, now }),
    progress: progressSummary({ mastery, drillRows, activityRow, feynmanRow, now }),
    tracking: {
      sourceOfTruth: 'SWE Interview Prep',
      masteryPolicy:
        'ChatGPT is read-only. Mastery changes only through product evidence, reviews, and accepted explain-backs.',
    },
  };
}

export async function loadDailyLearningProjection(db, userId, now = new Date()) {
  const [mastery, drills, profile, activity, feynman] = await Promise.all([
    db.execute({
      sql: `SELECT concept_id, stability, reps, lapses, last_review, due
            FROM concept_mastery WHERE user_id = ?`,
      args: [userId],
    }),
    db.execute({
      sql: `SELECT drill_id, status, attempts, last_attempt
            FROM user_drills WHERE user_id = ?`,
      args: [userId],
    }),
    db.execute({
      sql: 'SELECT profile_json FROM user_profile WHERE user_id = ? LIMIT 1',
      args: [userId],
    }),
    db.execute({
      sql: `SELECT COUNT(*) AS count, COALESCE(SUM(duration_ms), 0) AS duration_ms,
                   MAX(created_at) AS last_at
            FROM activity_log WHERE user_id = ?`,
      args: [userId],
    }),
    db.execute({
      sql: `SELECT COUNT(*) AS count, AVG(grade) AS average_grade
            FROM feynman_logs WHERE user_id = ?`,
      args: [userId],
    }),
  ]);
  return buildDailyLearningProjection({
    masteryRows: mastery.rows,
    drillRows: drills.rows,
    profileRow: profile.rows[0] ?? null,
    activityRow: activity.rows[0] ?? null,
    feynmanRow: feynman.rows[0] ?? null,
    now,
  });
}
