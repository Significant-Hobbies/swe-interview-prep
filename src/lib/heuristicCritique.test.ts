import { describe, expect, it } from 'vitest';

import { critiqueAnswerHeuristic } from './heuristicCritique';

describe('critiqueAnswerHeuristic', () => {
  it('scores high when answer overlaps reference', () => {
    const r = critiqueAnswerHeuristic(
      'What is BM25?',
      'BM25 is a lexical ranking function using term frequency and document length normalization.',
      'BM25 is a bag-of-words ranking function. It uses term frequency, inverse document frequency, and document length normalization.',
    );
    expect(r.score).toBeGreaterThan(25);
  });

  it('scores low for thin answers', () => {
    const r = critiqueAnswerHeuristic('Explain WAL', 'idk', 'Write-ahead log persists changes before acknowledging.');
    expect(r.score).toBeLessThan(30);
  });
});