import { describe, expect, it } from 'vitest';

import { CONCEPT_PACKS, CONCEPTS } from '../data/learning-os';
import type { TopicPack } from './topicPack';
import { catalogPackStats, packFilledCount, packIsFull, packItemCount, packSlotFilled } from './packStats';

describe('packStats', () => {
  const full: TopicPack = {
    items: [
      { category: 'video', title: 'V', url: 'https://example.com/v' },
      { category: 'paper', title: 'P', url: 'https://example.com/p.pdf' },
      { category: 'blog', title: 'B', url: 'https://blog.example.com' },
      { category: 'book', title: 'Bk', url: 'https://book.example.com' },
      { category: 'problem', title: 'Drill', url: '/drills/d1' },
      { category: 'write', title: 'Explain back', url: '', body: 'Explain it.' },
    ],
  };

  it('detects filled categories', () => {
    expect(packSlotFilled(full, 'video')).toBe(true);
    expect(packSlotFilled(full, 'problem')).toBe(true);
    expect(packSlotFilled(undefined, 'write')).toBe(false);
    expect(packItemCount(full)).toBe(6);
  });

  it('counts completeness', () => {
    expect(packFilledCount(full)).toBe(6);
    expect(packIsFull(full)).toBe(true);
    expect(packIsFull({ items: [{ category: 'write', title: 'x', url: '' }] })).toBe(false);
  });

  it('aggregates catalog stats', () => {
    const stats = catalogPackStats({
      a: full,
      b: { items: [{ category: 'write', title: 'x', url: '' }] },
    });
    expect(stats.total).toBe(2);
    expect(stats.full).toBe(1);
    expect(stats.averageFilled).toBe(3.5);
    expect(stats.bySlot.write).toBe(2);
    expect(stats.bySlot.video).toBe(1);
    expect(stats.byCategory.more).toBe(0);
  });

  it('generated packs use items schema with S-tier fills', () => {
    const stats = catalogPackStats(CONCEPT_PACKS);
    expect(stats.total).toBe(CONCEPTS.length);
    expect(stats.averageFilled).toBeGreaterThan(4);
    expect(stats.averageItems).toBeGreaterThan(4);
    expect(stats.byCategory.more).toBeLessThan(500);
  });
});