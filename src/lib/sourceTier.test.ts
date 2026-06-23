import { describe, expect, it } from 'vitest';

import { CONCEPT_PACKS } from '../data/learning-os';
import { assertSTierPackItems, isSTierSource } from './sourceTier';

describe('sourceTier', () => {
  it('rejects Wikipedia and Refactoring Guru', () => {
    expect(isSTierSource('BM25', 'https://en.wikipedia.org/wiki/Okapi_BM25', 'blog')).toBe(false);
    expect(
      isSTierSource('Strategy', 'https://refactoring.guru/design-patterns/strategy', 'paper')
    ).toBe(false);
  });

  it('accepts canonical university and research sources', () => {
    expect(isSTierSource('Attention', 'https://arxiv.org/abs/1706.03762', 'paper')).toBe(true);
    expect(isSTierSource('IR Book', 'https://nlp.stanford.edu/IR-book/', 'book')).toBe(true);
    expect(isSTierSource('CS336', 'https://cs336.stanford.edu/spring2025/', 'book')).toBe(true);
    expect(isSTierSource('Kleppmann', 'https://martin.kleppmann.com/', 'blog')).toBe(true);
  });

  it('every filled generated pack link is S-tier', () => {
    const { ok, violations } = assertSTierPackItems(CONCEPT_PACKS);
    if (!ok) {
      console.error(violations.slice(0, 5));
    }
    expect(ok).toBe(true);
    expect(violations).toHaveLength(0);
  });
});
