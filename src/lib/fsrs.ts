import { fsrs, generatorParameters, Rating, State, createEmptyCard, type Card, type Grade } from 'ts-fsrs';

const params = generatorParameters({ enable_fuzz: false, request_retention: 0.9, maximum_interval: 365 });
const scheduler = fsrs(params);

export type MasteryRow = {
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string | null;
  due?: string | null;
  confidence?: number;
};

export type MasteryRating = 'again' | 'hard' | 'good' | 'easy';

const RATING_MAP: Record<MasteryRating, Rating> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

function rowToCard(row: MasteryRow): Card {
  if (!row.last_review) return createEmptyCard(new Date());
  return {
    due: row.due ? new Date(row.due) : new Date(),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as State,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
    learning_steps: 0,
  };
}

function cardToRow(card: Card): MasteryRow {
  // Confidence: bounded retrievability proxy. Stability scaled into 0..1.
  const confidence = Math.min(1, card.stability / 30);
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : null,
    due: card.due.toISOString(),
    confidence,
  };
}

export function reviewConcept(prev: MasteryRow | null, rating: MasteryRating, now = new Date()): MasteryRow {
  const card = prev ? rowToCard(prev) : createEmptyCard(now);
  const result = scheduler.next(card, now, RATING_MAP[rating] as Grade);
  return cardToRow(result.card);
}

export function isDue(row: MasteryRow | null, now = new Date()): boolean {
  if (!row || !row.due) return true;
  return new Date(row.due) <= now;
}

export function decayConfidence(row: MasteryRow, now = new Date()): number {
  if (!row.last_review || !row.stability) return 0;
  const elapsed = (now.getTime() - new Date(row.last_review).getTime()) / 86400000;
  // FSRS retrievability formula approximation: R = (1 + elapsed / (9 * S))^-1
  return Math.max(0, Math.min(1, Math.pow(1 + elapsed / (9 * row.stability), -1)));
}
