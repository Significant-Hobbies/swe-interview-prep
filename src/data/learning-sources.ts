import snapshotData from './learning-sources.json';

export type LearningSourceKind = 'native' | 'briefing' | 'project' | 'research' | 'reader';

export interface LearningAssessment {
  id: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceFingerprint: string;
  generator: string;
}

export interface LearningSource {
  id: string;
  kind: LearningSourceKind;
  label: string;
  description: string;
  canonicalUrl: string;
  itemCount: number;
  syncStatus: 'fresh' | 'stale' | 'pending';
}

export interface LearningItem {
  id: string;
  sourceId: string;
  sourceKind: LearningSourceKind;
  project?: string;
  collection?: string;
  title: string;
  summary: string;
  canonicalUrl: string;
  repositoryPath?: string;
  tracks: string[];
  format: string;
  estimatedMinutes: number;
  publishedAt?: string;
  fingerprint: string;
  assessments?: LearningAssessment[];
}

export interface LearningSourceSnapshot {
  schemaVersion: number;
  generatedAt: string;
  sources: LearningSource[];
  items: LearningItem[];
}

export interface LearningItemProgress {
  status: 'started' | 'completed';
  startedAt: string;
  completedAt?: string;
  correctAnswers: number;
  attempts: number;
}

export const LEARNING_SOURCES = snapshotData as LearningSourceSnapshot;
export const LEARNING_ITEM_BY_ID = Object.fromEntries(
  LEARNING_SOURCES.items.map((item) => [item.id, item])
) as Record<string, LearningItem>;
const PROGRESS_KEY = 'swe-os:external-learning-progress-v1';

export function loadLearningProgress(): Record<string, LearningItemProgress> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as Record<
      string,
      LearningItemProgress
    >;
  } catch {
    return {};
  }
}

export function saveLearningProgress(progress: Record<string, LearningItemProgress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function nextDurableLearningItem(): LearningItem | undefined {
  const progress = loadLearningProgress();
  const durable = LEARNING_SOURCES.items.filter((item) => item.sourceKind !== 'briefing');
  return durable.find((item) => progress[item.id]?.status !== 'completed') || durable[0];
}

export function todayBriefing(): LearningItem | undefined {
  return LEARNING_SOURCES.items.find((item) => item.sourceKind === 'briefing');
}
