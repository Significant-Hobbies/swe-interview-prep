import { describe, expect, it } from 'vitest';

import { CONCEPTS, type Concept } from '../data/learning-os';
import {
  bestHubFor,
  hubCoverageFloor,
  isUnknown,
  MIN_HUB_COVERAGE,
  rankDomains,
  SOURCE_HUBS,
  type SourceHub,
} from './roi';
import { MIN_DOMAIN_SIZE } from './sweep';

function concept(partial: Partial<Concept> & { id: string }): Concept {
  return {
    name: partial.id,
    tags: [],
    roadmaps: [],
    difficulty: 'core',
    priority: 1,
    prerequisites: [],
    related: [],
    description: '',
    mentalModel: Array(40).fill('word').join(' '),
    ...partial,
  };
}

const HUBS: SourceHub[] = [
  { id: 'cmu', label: 'CMU 15-445', url: 'https://x/', conceptIds: ['a', 'b', 'c'] },
  { id: 'ddia', label: 'DDIA', url: 'https://y/', conceptIds: ['a', 'b'] },
  { id: 'solo', label: 'Solo', url: 'https://z/', conceptIds: ['e'] },
];

/**
 * Covers THREE gaps, so it clears MIN_HUB_COVERAGE — the share gate is the only
 * thing that can reject it. The previous fixture covered two and was killed by
 * the count floor one line earlier, so MIN_HUB_SHARE had zero coverage and
 * setting it to 0 left the whole suite green.
 */
const INCIDENTAL: SourceHub[] = [
  { id: 'mdn', label: 'MDN Web Docs', url: 'https://m/', conceptIds: ['g0', 'g1', 'g2'] },
];

describe('isUnknown', () => {
  it('treats untouched concepts as unknown — the blind spot this exists to fix', () => {
    // recommend.ts `weakConcepts` requires mastery[c.id] to exist, so a domain
    // you have never opened is invisible to it. Here, absence IS the signal.
    expect(isUnknown('never-seen', {})).toBe(true);
    expect(isUnknown('x', { x: 'new' })).toBe(true);
    expect(isUnknown('x', { x: 'fuzzy' })).toBe(true);
    expect(isUnknown('x', { x: 'known' })).toBe(false);
  });
});

describe('bestHubFor', () => {
  it('picks the hub covering the most gaps', () => {
    expect(bestHubFor(['a', 'b', 'c'], HUBS)).toEqual({
      label: 'CMU 15-445',
      url: 'https://x/',
      covers: 3,
    });
  });

  it('never recommends a hub that closes fewer than the minimum', () => {
    expect(MIN_HUB_COVERAGE).toBe(3);
    // 30 gaps, so the full count floor applies: a hub covering 2 is rejected.
    const many = ['a', 'b', ...Array.from({ length: 28 }, (_, i) => `n${i}`)];
    expect(bestHubFor(many, HUBS)).toBeUndefined();
    expect(bestHubFor(['e'], HUBS)).toBeUndefined();
  });

  it('rejects a source that overlaps incidentally rather than covering the domain', () => {
    // 3 of 20 gaps = 15%, under MIN_HUB_SHARE. This is how
    // "distributed-systems -> MDN Web Docs" happened; saying nothing is honest.
    const twentyGaps = Array.from({ length: 20 }, (_, i) => `g${i}`);
    expect(bestHubFor(twentyGaps, INCIDENTAL)).toBeUndefined();
    // Same hub, same 3 concepts, smaller domain -> now a real recommendation.
    expect(bestHubFor(['g0', 'g1', 'g2', 'g3'], INCIDENTAL)?.covers).toBe(3);
  });

  it('breaks a coverage tie on hub order, which is not arbitrary in practice', () => {
    // Real ties exist: in `dsa`, Erickson and the USACO Guide each cover 14.
    // The winner is decided here, by `covers > best.covers` keeping the first,
    // and hub order comes from build-source-hubs.mjs sorting on id. Pin it so
    // a `>=` typo cannot silently flip the headline recommendation.
    const tied: SourceHub[] = [
      { id: 'a-first', label: 'First', url: 'https://a/', conceptIds: ['x', 'y', 'z'] },
      { id: 'b-second', label: 'Second', url: 'https://b/', conceptIds: ['x', 'y', 'z'] },
    ];
    expect(bestHubFor(['x', 'y', 'z'], tied)?.label).toBe('First');
  });

  it('returns nothing when there are no gaps left', () => {
    expect(bestHubFor([], HUBS)).toBeUndefined();
  });

  it('still recommends when a domain is nearly finished', () => {
    // A flat count floor made the app go quiet exactly when it was most
    // useful: across the real catalog, domains with a hub fell from 72% to
    // 38% as concepts were marked Known, because the overlap count shrinks
    // faster than the share rises. Two gaps, both covered, is a real answer.
    expect(hubCoverageFloor(20)).toBe(MIN_HUB_COVERAGE);
    expect(hubCoverageFloor(2)).toBe(2);
    expect(bestHubFor(['a', 'b'], HUBS)?.covers).toBe(2);
  });

  it('will not recommend a whole work to close one concept', () => {
    // The concept's own reading list is the better answer at that point.
    expect(hubCoverageFloor(1)).toBe(2);
    expect(bestHubFor(['a'], HUBS)).toBeUndefined();
  });
});

describe('rankDomains', () => {
  const catalog = [
    ...Array.from({ length: 6 }, (_, i) => concept({ id: `db${i}`, tags: ['databases'] })),
    ...Array.from({ length: 6 }, (_, i) => concept({ id: `hr${i}`, tags: ['behavioral'] })),
    concept({ id: 'facet', tags: ['tokenization'] }),
  ];

  it('ranks by gaps the app can actually close', () => {
    const ranked = rankDomains(catalog, { rated: {} });
    expect(ranked.map((r) => r.tag)).toEqual(['behavioral', 'databases']);
    expect(ranked[0]).toMatchObject({ total: 6, unknown: 6, thin: 0, score: 6, swept: false });
  });

  it('drops muted domains entirely', () => {
    const ranked = rankDomains(catalog, { rated: {}, muted: ['behavioral'] });
    expect(ranked.map((r) => r.tag)).toEqual(['databases']);
  });

  it('ignores tags too small to be a domain', () => {
    expect(rankDomains(catalog, { rated: {} }).map((r) => r.tag)).not.toContain('tokenization');
  });

  it('keeps a tag sitting exactly on the minimum', () => {
    // The boundary, not just a value near it. Five real domains sit exactly
    // here — indexing, ann, foundations, storage-engines, quant — so a `<`/`<=`
    // slip would silently drop all of them from the ROI grid.
    const exact = Array.from({ length: MIN_DOMAIN_SIZE }, (_, i) =>
      concept({ id: `e${i}`, tags: ['storage-engines'] })
    );
    const under = Array.from({ length: MIN_DOMAIN_SIZE - 1 }, (_, i) =>
      concept({ id: `u${i}`, tags: ['indexing'] })
    );
    const tags = rankDomains([...exact, ...under], { rated: {} }).map((r) => r.tag);
    expect(tags).toContain('storage-engines');
    expect(tags).not.toContain('indexing');
  });

  it('discounts thin concepts — a gap the app cannot teach is not ROI', () => {
    const thinCatalog = Array.from({ length: 6 }, (_, i) =>
      concept({
        id: `t${i}`,
        tags: ['agent-systems'],
        mentalModel: i < 4 ? 'too short' : undefined,
      })
    );
    const [row] = rankDomains(thinCatalog, { rated: {} });
    expect(row).toMatchObject({ unknown: 6, thin: 6, score: 0 });
  });

  it('falls as concepts are marked Known', () => {
    const rated = { db0: 'known', db1: 'known', db2: 'known' } as const;
    const row = rankDomains(catalog, { rated }).find((r) => r.tag === 'databases');
    expect(row).toMatchObject({ unknown: 3, score: 3, swept: true });
  });

  it('reports swept:false before any triage so the UI can avoid faking a recommendation', () => {
    expect(rankDomains(catalog, { rated: {} }).every((r) => !r.swept)).toBe(true);
  });
});

describe('against the real catalog', () => {
  it('ships a non-trivial hub index', () => {
    expect(SOURCE_HUBS.length).toBeGreaterThanOrEqual(30);
    for (const hub of SOURCE_HUBS) {
      expect(hub.conceptIds.length).toBeGreaterThanOrEqual(3);
      expect(hub.url).toMatch(/^https?:\/\//);
      // A bare hostname means the label heuristic fell through and nobody
      // curated it — the recommendation would read "go read cp-algorithms.com".
      expect(hub.label).not.toMatch(/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/);
    }
  });

  it('links to a landing page, not one chapter of the work it names', () => {
    // The URL is derived as the shortest link in the group, which is only right
    // when the group cites a root. It usually does not, so "Algorithms (Jeff
    // Erickson)" pointed at chapter 7 and "Google SRE Book" at Being On-Call.
    // A chapter-shaped URL means HUB_URLS needs an entry.
    const chapterish = SOURCE_HUBS.filter(
      (h) => /\.pdf(\?|#|$)/i.test(h.url) || /\/\d{4}\/\d{2}\//.test(h.url)
    ).filter((h) => !/amsbook|dist-sys-notes/.test(h.url)); // whole-book PDFs are fine
    expect(chapterish.map((h) => `${h.label} -> ${h.url}`)).toEqual([]);
  });

  it('every hub concept id resolves to a real concept', () => {
    const ids = new Set(CONCEPTS.map((c) => c.id));
    for (const hub of SOURCE_HUBS) {
      for (const id of hub.conceptIds) expect(ids.has(id)).toBe(true);
    }
  });

  it('names a real outside source for the databases gap', () => {
    const row = rankDomains(CONCEPTS, { rated: {} }).find((r) => r.tag === 'databases');
    expect(row?.hub?.covers).toBeGreaterThanOrEqual(MIN_HUB_COVERAGE);
  });
});
