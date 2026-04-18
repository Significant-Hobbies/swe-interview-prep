import { fsrs, generatorParameters, Rating, createEmptyCard } from 'ts-fsrs';

const params = generatorParameters({ enable_fuzz: false, request_retention: 0.9, maximum_interval: 365 });
const scheduler = fsrs(params);

const RATING_MAP = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

function rowToCard(row) {
  if (!row || !row.last_review) return createEmptyCard(new Date());
  return {
    due: row.due ? new Date(row.due) : new Date(),
    stability: row.stability ?? 0,
    difficulty: row.difficulty ?? 5,
    elapsed_days: row.elapsed_days ?? 0,
    scheduled_days: row.scheduled_days ?? 0,
    reps: row.reps ?? 0,
    lapses: row.lapses ?? 0,
    state: row.state ?? 0,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
    learning_steps: 0,
  };
}

function cardToRow(card) {
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

export function reviewConcept(prev, rating, now = new Date()) {
  const card = prev ? rowToCard(prev) : createEmptyCard(now);
  const result = scheduler.next(card, now, RATING_MAP[rating] || Rating.Good);
  return cardToRow(result.card);
}

export function decayConfidence(row, now = new Date()) {
  if (!row || !row.last_review || !row.stability) return 0;
  const elapsed = (now.getTime() - new Date(row.last_review).getTime()) / 86400000;
  return Math.max(0, Math.min(1, Math.pow(1 + elapsed / (9 * row.stability), -1)));
}
