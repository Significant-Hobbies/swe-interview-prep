import snapshotData from './learning-sources.json';
import { isDue, reviewConcept, type MasteryRating, type MasteryRow } from '../lib/fsrs';

type LearningSourceKind = 'native' | 'briefing' | 'project' | 'research' | 'reader';

interface LearningAssessment {
  id: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceFingerprint: string;
  generator: string;
}

interface LearningReviewQuestion {
  id: string;
  question: string;
  answer: string;
  difficulty: string;
  type: string;
}

export interface LearningSource {
  id: string;
  kind: LearningSourceKind;
  label: string;
  description: string;
  canonicalUrl: string;
  itemCount: number;
  syncStatus: 'fresh' | 'stale' | 'pending';
  roadmap?: {
    label: string;
    canonicalUrl: string;
    modules: string[];
  };
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
  hierarchy?: {
    track: string;
    module: string;
    moduleOrder: number;
    topicOrder: number;
  };
  learningNotes?: string[];
  prerequisites?: string[];
  resources?: Array<{ title: string; url: string; type: string }>;
  reviewQuestions?: LearningReviewQuestion[];
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
  mastery?: MasteryRow;
  lastRating?: MasteryRating;
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

export function rateLearningItem(itemId: string, rating: MasteryRating): LearningItemProgress {
  const progress = loadLearningProgress();
  const existing = progress[itemId];
  const now = new Date();
  const next: LearningItemProgress = {
    status: 'completed',
    startedAt: existing?.startedAt || now.toISOString(),
    completedAt: now.toISOString(),
    correctAnswers: existing?.correctAnswers || 0,
    attempts: (existing?.attempts || 0) + 1,
    mastery: reviewConcept(existing?.mastery || null, rating, now),
    lastRating: rating,
  };
  progress[itemId] = next;
  saveLearningProgress(progress);
  return next;
}

export function buildDailyLearningSession(
  date: string,
  dynamicItems: LearningItem[] = [],
  sourceId?: string
): { items: LearningItem[]; studyMinutes: number; reviewMinutes: number; totalMinutes: number } {
  const progress = loadLearningProgress();
  const allItems = [...LEARNING_SOURCES.items, ...dynamicItems];
  const briefing = allItems.find((item) => item.sourceKind === 'briefing');
  const durable = allItems.filter(
    (item) => item.sourceKind !== 'briefing' && (!sourceId || item.sourceId === sourceId)
  );
  const byHierarchy = (left: LearningItem, right: LearningItem) =>
    (left.hierarchy?.moduleOrder ?? 999) - (right.hierarchy?.moduleOrder ?? 999) ||
    (left.hierarchy?.topicOrder ?? 999) - (right.hierarchy?.topicOrder ?? 999) ||
    left.title.localeCompare(right.title);
  const due = durable
    .filter((item) => progress[item.id]?.mastery && isDue(progress[item.id].mastery ?? null))
    .sort(byHierarchy);
  const unseen = durable.filter((item) => !progress[item.id]).sort(byHierarchy);
  const fallback = durable
    .filter((item) => !due.includes(item) && !unseen.includes(item))
    .sort(byHierarchy);
  const ordered = [...due, ...unseen, ...fallback];
  const seed = [...date, ...(sourceId || 'balanced')].reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  const picked = [] as LearningItem[];
  if (!sourceId && briefing) picked.push(briefing);
  const maxStudy = sourceId ? 24 : 15;
  let used = 0;
  for (let offset = 0; offset < ordered.length; offset += 1) {
    const item = sourceId ? ordered[offset] : ordered[(seed + offset) % ordered.length];
    if (picked.includes(item)) continue;
    if (used > 0 && used + item.estimatedMinutes > maxStudy) continue;
    picked.push(item);
    used += Math.min(item.estimatedMinutes, maxStudy);
    if (used >= maxStudy || picked.length >= (sourceId ? 2 : 2)) break;
  }
  const studyMinutes = sourceId ? Math.min(24, used) : 10 + Math.min(15, used);
  return { items: picked, studyMinutes, reviewMinutes: 30 - studyMinutes, totalMinutes: 30 };
}

export function nextDurableLearningItem(): LearningItem | undefined {
  const progress = loadLearningProgress();
  const durable = LEARNING_SOURCES.items.filter((item) => item.sourceKind !== 'briefing');
  return (
    durable.find(
      (item) => progress[item.id]?.mastery && isDue(progress[item.id].mastery ?? null)
    ) ||
    durable.find((item) => progress[item.id]?.status !== 'completed') ||
    durable[0]
  );
}

export function todayBriefing(): LearningItem | undefined {
  return LEARNING_SOURCES.items.find((item) => item.sourceKind === 'briefing');
}
