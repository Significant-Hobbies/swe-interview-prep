import { describe, expect, it } from 'vitest';

import conceptPacksData from '../data/concept-packs.json';

// Deliberately the script copy: `scripts/source-tier.mjs` is the module that
// `scripts/generate-concept-packs.mjs` actually runs. A parallel
// `src/lib/sourceTier.ts` existed, was imported only by this test, and had
// already drifted to a more permissive allow-list than the live rules.
import { isSTierSource } from '../../scripts/source-tier.mjs';

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

  it('keeps every checked-in concept-pack source within the live tier rules', () => {
    const violations = Object.entries(conceptPacksData.packs).flatMap(([conceptId, pack]) =>
      pack.items
        .filter(
          (item) =>
            item.url &&
            ['video', 'paper', 'blog', 'book', 'more'].includes(item.category) &&
            !isSTierSource(
              item.title,
              item.url,
              item.category === 'more' ? undefined : item.category
            )
        )
        .map((item) => `${conceptId}:${item.category}:${item.url}`)
    );

    expect(violations).toEqual([]);
  });
});
