// Editorial quality bar — bootstrap-generated content is quarantined from recommendations.
import type { Artifact, Drill, ReviewQuestion } from '../data/learning-os';

const GENERIC_DRILL_MARKERS = [
  'Task: Implement the core mechanism in TypeScript',
  'Start from the smallest example that exercises the idea.',
];

const GENERIC_ARTIFACT_CRITERIA = 'Demonstrates the core mechanism from the mental model';

/** LeetCode metadata stubs — external practice, not in-app automated drills. */
export function isMetadataDrill(drill: Drill): boolean {
  return (
    drill.id.startsWith('lc-') ||
    (drill as Drill & { source?: string }).source === 'leetcode-metadata'
  );
}

/**
 * How much a "solved" mark on this drill is actually worth.
 * - `automated`    — stdout is compared against an expected value.
 * - `outline-check` — only the shape of a written design outline is checked;
 *                     nobody grades whether the content is right.
 * - `self-reported` — no in-app check at all (LeetCode metadata stubs).
 */
export type DrillVerification = 'automated' | 'outline-check' | 'self-reported';

export function drillVerification(drill: Drill): DrillVerification {
  if (!drill.testCases?.length) return 'self-reported';
  if (drill.type === 'system-design-prompt') return 'outline-check';
  return 'automated';
}

export const DRILL_VERIFICATION_LABEL: Record<DrillVerification, string> = {
  automated: 'Auto-graded',
  'outline-check': 'Self-graded',
  'self-reported': 'Honor system',
};

export const DRILL_VERIFICATION_HINT: Record<DrillVerification, string> = {
  automated: 'Your output is compared against the expected result before this counts as solved.',
  'outline-check':
    'Only the shape of your outline is checked — that every required point is answered in your own words. Nobody grades whether it is right, so mastery moves less than an auto-graded drill.',
  'self-reported':
    'Nothing is verified in-app. Marking this solved is your own claim, and it moves mastery less than an auto-graded drill.',
};

export function isEditorialDrill(drill: Drill): boolean {
  if (isMetadataDrill(drill)) return false;
  if (drill.id.startsWith('drill-')) return false;
  if (GENERIC_DRILL_MARKERS.every((m) => drill.prompt.includes(m))) return false;
  return true;
}

export function isEditorialArtifact(artifact: Artifact): boolean {
  if (artifact.id.startsWith('build-')) return false;
  const generic = artifact.successCriteria?.every((c) => !c.includes(GENERIC_ARTIFACT_CRITERIA));
  if (!generic && artifact.successCriteria?.some((c) => c.includes(GENERIC_ARTIFACT_CRITERIA)))
    return false;
  return true;
}

export function isFormulaicReviewQuestion(id: string): boolean {
  return id.endsWith('-core') && id.startsWith('rq-');
}

export function isIngestedReviewQuestion(id: string): boolean {
  return id.startsWith('rq-lib-');
}

function isAnkiReviewQuestion(id: string): boolean {
  return id.startsWith('rq-anki-');
}

/**
 * Questions eligible for FSRS scheduling and session planning.
 *
 * Library-ingested questions are QUARANTINED. Every one of them is the same
 * template ("{Repo}: {Section} — explain the core idea in your own words")
 * with a scraped markdown fragment as the answer, mapped to a concept by a
 * keyword match that lands roughly at random (an AWS certificate page mapped
 * to `load-balancing`, a DevOps page to `teamwork-and-collaboration`). The
 * only gate was an answer length of 80 characters, which those pass trivially.
 * Re-enable when `scripts/ingest-library-rqs.mjs` can produce a real question
 * and a real answer with a defensible concept mapping.
 */
export function isSchedulableReviewQuestion(q: ReviewQuestion): boolean {
  if (isFormulaicReviewQuestion(q.id)) return false;
  if (q.source === 'library' || isIngestedReviewQuestion(q.id)) return false;
  if (q.source === 'anki' || isAnkiReviewQuestion(q.id)) {
    return (q.question?.length ?? 0) >= 8 && (q.answer?.length ?? 0) >= 20;
  }
  return true;
}

/** Playground templates with only stub implementations. */
export function isStubPlaygroundCode(code: string): boolean {
  const trimmed = code.trim();
  if (trimmed.length < 80) return true;
  if (/console\.log\('Implement /.test(code)) return true;
  if (code.includes('replace with real implementation')) return true;
  return false;
}
