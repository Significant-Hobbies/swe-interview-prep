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

export function isAnkiReviewQuestion(id: string): boolean {
  return id.startsWith('rq-anki-');
}

/** Questions eligible for FSRS scheduling and session planning. */
export function isSchedulableReviewQuestion(q: ReviewQuestion): boolean {
  if (isFormulaicReviewQuestion(q.id)) return false;
  if (q.source === 'library' || isIngestedReviewQuestion(q.id)) {
    return (q.answer?.length ?? 0) >= 80;
  }
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
