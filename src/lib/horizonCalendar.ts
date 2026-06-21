// Day-by-day study calendar from interview horizon — pure heuristics.
import type { Concept, MasteryEntry } from '../hooks/useConcepts';
import type { LearnerProfile } from './profile';
import { normalizeModalityWeights } from './profile';
import { pickConceptForSession } from './planner';
import type { ReviewMasteryEntry } from './reviewMastery';
import { dueReviewQuestions } from './planner';
import type { DrillEntry } from '../hooks/useUserStore';
export type HorizonFocus = 'review' | 'drill' | 'build' | 'learn' | 'mock';

export interface HorizonDay {
  dayOffset: number;
  date: string;
  label: string;
  focus: HorizonFocus;
  concept: Concept | null;
  minutes: number;
  note: string;
}

function dateStr(offset: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

function focusForDay(
  profile: LearnerProfile,
  dayOffset: number,
  reviewsDue: number,
): HorizonFocus {
  const horizon = profile.interviewHorizonDays ?? 60;
  const w = normalizeModalityWeights(profile.modalityWeights);
  if (reviewsDue > 5 && dayOffset % 3 === 0) return 'review';
  if (horizon <= 14 && dayOffset % 5 === 4) return 'mock';
  if (horizon <= 21 && dayOffset % 4 === 3) return 'mock';
  const r = dayOffset % 10;
  if (r < w.review * 10) return 'review';
  if (r < (w.review + w.drill) * 10) return 'drill';
  if (r < (w.review + w.drill + w.build) * 10) return 'build';
  if (r < (w.review + w.drill + w.build + w.learn) * 10) return 'learn';
  return 'drill';
}

export function buildHorizonCalendar(opts: {
  profile: LearnerProfile;
  mastery: Record<string, MasteryEntry>;
  rqMastery: Record<string, ReviewMasteryEntry>;
  drillState: Record<string, DrillEntry>;
  maxDays?: number;
}): HorizonDay[] {
  const { profile, mastery, rqMastery, drillState } = opts;
  const horizon = profile.interviewHorizonDays;
  if (horizon == null || horizon < 1) return [];

  const maxDays = Math.min(opts.maxDays ?? 14, horizon);
  const reviewsDue = dueReviewQuestions(rqMastery, mastery).length;
  const usedConcepts = new Set<string>();
  const days: HorizonDay[] = [];

  for (let i = 0; i < maxDays; i++) {
    const focus = focusForDay(profile, i, reviewsDue);
    const picked = pickConceptForSession(
      { ...profile, skipConceptIds: [...profile.skipConceptIds, ...usedConcepts] },
      mastery,
      null,
    );
    const concept = picked?.concept ?? null;
    if (concept) usedConcepts.add(concept.id);

    const minutes = profile.minutesPerDay;
    let label: string;
    let note: string;

    if (focus === 'review') {
      label = `Review sprint · ${Math.min(reviewsDue, 8)} cards`;
      note = 'Clear the FSRS queue before it rots.';
    } else if (focus === 'mock') {
      label = 'Mock interview rep';
      note = 'Timed prompt + rubric checklist.';
    } else if (focus === 'drill' && concept) {
      label = `Drill · ${concept.name}`;
      note = 'Verified test pass required.';
    } else if (focus === 'build' && concept) {
      label = `Build · ${concept.name}`;
      note = 'Ship an artifact in Playground.';
    } else if (concept) {
      label = `Learn · ${concept.name}`;
      note = 'Read concept, then explain back.';
    } else {
      label = 'Light review day';
      note = 'Catch up on due cards.';
    }

    days.push({
      dayOffset: i,
      date: dateStr(i),
      label,
      focus,
      concept,
      minutes,
      note,
    });
  }
  return days;
}