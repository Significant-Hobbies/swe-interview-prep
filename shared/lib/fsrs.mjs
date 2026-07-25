import { fsrs, generatorParameters, Rating, createEmptyCard } from 'ts-fsrs';

import { masteryConfidence } from './confidence.mjs';

const params = generatorParameters({
  enable_fuzz: false,
  request_retention: 0.9,
  maximum_interval: 365,
});
const scheduler = fsrs(params);

const RATING_MAP = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

function rowToCard(row) {
  if (!row?.last_review) return createEmptyCard(new Date());
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
  const lastReview = card.last_review ? card.last_review.toISOString() : null;
  // Same definition the read path uses — elapsed is ~0 here, so this is the
  // durability term only. It must never come out at 1.0 after a failed review.
  const confidence = masteryConfidence(
    { stability: card.stability, last_review: lastReview },
    card.last_review ?? new Date()
  );
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: lastReview,
    due: card.due.toISOString(),
    confidence,
  };
}

export function reviewConcept(prev, rating, now = new Date()) {
  const card = prev ? rowToCard(prev) : createEmptyCard(now);
  const result = scheduler.next(card, now, RATING_MAP[rating] || Rating.Good);
  return cardToRow(result.card);
}

export { masteryConfidence } from './confidence.mjs';
