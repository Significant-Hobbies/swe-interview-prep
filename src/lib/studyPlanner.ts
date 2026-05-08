import type { Concept, MasteryEntry } from '../hooks/useConcepts';

type TaskType = 'build' | 'review' | 'read' | 'explain';

export interface WeaknessPlanItem {
  concept: Concept;
  confidence: number | null;
  due: boolean;
  blockedBy: string[];
  weaknessScore: number;
  reason: string;
  taskType: TaskType;
  minutes: number;
  prompt: string;
}

export interface StudyPlanDay {
  dayIndex: number;
  label: string;
  item: WeaknessPlanItem;
}

export interface WeaknessStudyPlan {
  focus: WeaknessPlanItem[];
  schedule: StudyPlanDay[];
  summary: {
    readyWeaknesses: number;
    blockedWeaknesses: number;
    untouched: number;
    due: number;
  };
}

const TASKS: TaskType[] = ['build', 'explain', 'review', 'read'];

function isDue(due?: string | null, now = new Date()): boolean {
  if (!due) return true;
  return new Date(due) <= now;
}

function dayLabel(now: Date, offset: number): string {
  const day = new Date(now);
  day.setDate(day.getDate() + offset);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  return day.toLocaleDateString('en-US', { weekday: 'short' });
}

function taskFor(item: {
  confidence: number | null;
  due: boolean;
  concept: Concept;
  weaknessScore: number;
}, index: number): TaskType {
  if (item.confidence === null) return 'build';
  if (item.confidence < 0.35) return 'explain';
  if (item.due) return 'review';
  return TASKS[(index + item.concept.category.length) % TASKS.length];
}

function promptFor(concept: Concept, taskType: TaskType): string {
  if (taskType === 'build') {
    return `Build a small ${concept.name} exercise from scratch, then write one edge case and its expected result.`;
  }
  if (taskType === 'explain') {
    return `Explain ${concept.name} out loud without notes. Include when it fails, complexity tradeoffs, and one interview trap.`;
  }
  if (taskType === 'read') {
    return `Read the library notes for ${concept.name}, then turn the section into three interview questions.`;
  }
  return `Review ${concept.name} with a tiny example, one invariant, and one counterexample.`;
}

function reasonFor(
  concept: Concept,
  mastery: MasteryEntry | undefined,
  confidence: number | null,
  due: boolean,
  blockedBy: string[],
): string {
  if (blockedBy.length > 0) {
    return `Prereq repair first: ${blockedBy.join(', ')} is below 40%.`;
  }
  if (!mastery || confidence === null) {
    return `No reps logged yet, so ${concept.name} needs a baseline pass.`;
  }
  if (confidence < 0.35) {
    return `Confidence is down to ${Math.round(confidence * 100)}%; rebuild before stacking harder work on it.`;
  }
  if (due) {
    return `FSRS says this is due now at ${Math.round(confidence * 100)}% confidence.`;
  }
  if (mastery.lapses > 0) {
    return `${mastery.lapses} lapse${mastery.lapses === 1 ? '' : 's'} logged; keep it in the rotation.`;
  }
  return `${concept.category.toUpperCase()} coverage is still shallow compared with stronger concepts.`;
}

export function buildWeaknessStudyPlan(
  concepts: Concept[],
  mastery: Record<string, MasteryEntry>,
  now = new Date(),
): WeaknessStudyPlan {
  const items = concepts.map((concept) => {
    const entry = mastery[concept.id];
    const confidence = entry ? Math.max(0, Math.min(1, entry.confidence ?? 0)) : null;
    const due = isDue(entry?.due, now);
    const blockedBy = concept.prereqs.filter((id) => {
      const prereq = mastery[id];
      return prereq && (prereq.confidence ?? 0) < 0.4;
    });

    const confidenceGap = confidence === null ? 0.55 : 1 - confidence;
    const dueBoost = due ? 0.2 : 0;
    const lapseBoost = Math.min((entry?.lapses ?? 0) * 0.08, 0.24);
    const untouchedBoost = confidence === null ? 0.12 : 0;
    const blockedPenalty = blockedBy.length * 0.45;
    const weaknessScore = confidenceGap + dueBoost + lapseBoost + untouchedBoost - blockedPenalty;
    const taskType = taskFor({ concept, confidence, due, weaknessScore }, concept.id.length);

    return {
      concept,
      confidence,
      due,
      blockedBy,
      weaknessScore,
      reason: reasonFor(concept, entry, confidence, due, blockedBy),
      taskType,
      minutes: taskType === 'build' ? 35 : taskType === 'read' ? 20 : 15,
      prompt: promptFor(concept, taskType),
    };
  });

  const sorted = [...items].sort((a, b) => {
    if (a.blockedBy.length !== b.blockedBy.length) return a.blockedBy.length - b.blockedBy.length;
    if (b.weaknessScore !== a.weaknessScore) return b.weaknessScore - a.weaknessScore;
    return a.concept.name.localeCompare(b.concept.name);
  });

  const focus = sorted.slice(0, 6);
  const schedulePool = focus.length > 0 ? focus : sorted.slice(0, 1);
  const schedule = Array.from({ length: Math.min(7, schedulePool.length * 2 || 0) }, (_, index) => ({
    dayIndex: index,
    label: dayLabel(now, index),
    item: schedulePool[index % schedulePool.length],
  }));

  return {
    focus,
    schedule,
    summary: {
      readyWeaknesses: items.filter(item => item.blockedBy.length === 0 && item.weaknessScore >= 0.65).length,
      blockedWeaknesses: items.filter(item => item.blockedBy.length > 0).length,
      untouched: items.filter(item => item.confidence === null).length,
      due: items.filter(item => item.due).length,
    },
  };
}
