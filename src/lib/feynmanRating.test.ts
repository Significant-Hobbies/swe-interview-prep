import { describe, expect, it } from 'vitest';

import { gradeToRating, ratingsFromFeynman } from './feynmanRating';

describe('gradeToRating', () => {
  it('maps rubric bands to FSRS ratings', () => {
    expect(gradeToRating(0)).toBe('again');
    expect(gradeToRating(49)).toBe('again');
    expect(gradeToRating(50)).toBe('hard');
    expect(gradeToRating(69)).toBe('hard');
    expect(gradeToRating(70)).toBe('good');
    expect(gradeToRating(89)).toBe('good');
    expect(gradeToRating(90)).toBe('easy');
    expect(gradeToRating(100)).toBe('easy');
  });

  it('treats non-finite grades as failure', () => {
    expect(gradeToRating(Number.NaN)).toBe('again');
    expect(gradeToRating(Number.POSITIVE_INFINITY)).toBe('again');
  });
});

describe('ratingsFromFeynman', () => {
  it('uses explicit AI ratings when present', () => {
    const updates = ratingsFromFeynman({
      grade: 40,
      ratings: [{ concept_id: 'bm25', rating: 'good' }],
    });
    expect(updates).toEqual([{ conceptId: 'bm25', rating: 'good' }]);
  });

  it('drops invalid rating values and falls back to the overall grade', () => {
    const updates = ratingsFromFeynman(
      { grade: 75, ratings: [{ concept_id: 'bm25', rating: 'excellent' }] },
      ['bm25']
    );
    expect(updates).toEqual([{ conceptId: 'bm25', rating: 'good' }]);
  });

  it('marks unrated gap concepts as again', () => {
    const updates = ratingsFromFeynman({
      grade: 80,
      gaps: [{ concept_id: 'hnsw', weakness: 'no idea how layers form' }],
    });
    expect(updates).toEqual([{ conceptId: 'hnsw', rating: 'again' }]);
  });

  it('caps gap concepts at hard even when the AI rated them well', () => {
    const updates = ratingsFromFeynman({
      grade: 85,
      gaps: [{ concept_id: 'hnsw', weakness: 'shaky on ef_search' }],
      ratings: [{ concept_id: 'hnsw', rating: 'easy' }],
    });
    expect(updates).toEqual([{ conceptId: 'hnsw', rating: 'hard' }]);
  });

  it('keeps an AI again/hard rating on gap concepts', () => {
    const updates = ratingsFromFeynman({
      grade: 30,
      gaps: [{ concept_id: 'hnsw' }],
      ratings: [{ concept_id: 'hnsw', rating: 'again' }],
    });
    expect(updates).toEqual([{ conceptId: 'hnsw', rating: 'again' }]);
  });

  it('fills tagged concepts the AI skipped using the overall grade', () => {
    const updates = ratingsFromFeynman(
      { grade: 92, ratings: [{ concept_id: 'bm25', rating: 'good' }] },
      ['bm25', 'inverted-index']
    );
    expect(updates).toContainEqual({ conceptId: 'bm25', rating: 'good' });
    expect(updates).toContainEqual({ conceptId: 'inverted-index', rating: 'easy' });
    expect(updates).toHaveLength(2);
  });

  it('handles a result with no ratings, gaps, or tags', () => {
    expect(ratingsFromFeynman({ grade: 60 })).toEqual([]);
  });
});
