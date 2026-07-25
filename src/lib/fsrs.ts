import {
  type Card,
  createEmptyCard,
  fsrs,
  generatorParameters,
  type Grade,
  Rating,
  type State,
} from 'ts-fsrs';

// The confidence formula is shared verbatim with the server path
// (shared/lib/fsrs.mjs + handlers/concepts.mjs) so guest and authed users
// cannot diverge.
import { masteryConfidence } from '../../shared/lib/confidence.mjs';

export { masteryConfidence };

const params = generatorParameters({
  enable_fuzz: false,
  request_retention: 0.9,
  maximum_interval: 365,
});
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
  const lastReview = card.last_review ? card.last_review.toISOString() : null;
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

export function reviewConcept(
  prev: MasteryRow | null,
  rating: MasteryRating,
  now = new Date()
): MasteryRow {
  const card = prev ? rowToCard(prev) : createEmptyCard(now);
  const result = scheduler.next(card, now, RATING_MAP[rating] as Grade);
  return cardToRow(result.card);
}

// `isDue` and confidence-as-percentage live in ./conceptState — this module
// owns scheduling only. Importing two different `isDue` definitions was how
// "untouched means due" and "untouched means not due" ended up coexisting.
