/**
 * The single definition of concept confidence, used by BOTH the guest path
 * (src/lib/fsrs.ts) and the authed path (shared/lib/fsrs.mjs + handlers).
 *
 * Confidence = retrievability x durability.
 *
 *   retrievability — FSRS's "will I recall it right now": decays with the time
 *                    elapsed since the last review, relative to stability.
 *   durability     — how far stability has come toward a month-long interval.
 *
 * Both factors are needed. Retrievability alone is ~1.0 for the first hours
 * after ANY review, including a total failure, which would let two "Again"
 * ratings read as mastered. Durability alone never decays, so a concept last
 * touched a year ago would keep its score forever.
 */

/** Stability (in days) at which a concept counts as fully durable. */
const TARGET_STABILITY_DAYS = 30;

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** FSRS v4 retrievability approximation: R = (1 + elapsed / (9 * S))^-1. */
function retrievability(row, now = new Date()) {
  if (!row?.last_review || !row.stability) return 0;
  const elapsedDays = Math.max(0, (now.getTime() - new Date(row.last_review).getTime()) / 86400000);
  return clamp01((1 + elapsedDays / (9 * row.stability)) ** -1);
}

/** How settled the memory is, independent of when it was last seen. */
function durability(row) {
  if (!row?.stability) return 0;
  return clamp01(row.stability / TARGET_STABILITY_DAYS);
}

/**
 * Confidence in 0..1 for a concept-mastery row (snake_case, as stored).
 * Returns 0 for a never-reviewed or missing row.
 */
export function masteryConfidence(row, now = new Date()) {
  if (!row?.last_review || !row.stability) return 0;
  return clamp01(retrievability(row, now) * durability(row));
}
