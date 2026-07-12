import { describe, expect, it } from 'vitest';

import { buildReaderLearningSnapshot } from './reader-learning.mjs';

describe('Reader learning export', () => {
  it('keeps only learning metadata and builds fingerprint-bound MCQs', () => {
    const articles = Array.from({ length: 4 }, (_, index) => ({
      id: `article-${index}`,
      title: `Article ${index}`,
      url: `https://example.com/${index}`,
      content: `private body ${index}`,
      tags: JSON.stringify(['systems']),
      summary: JSON.stringify({ short: `Summary ${index}` }),
      keyPoints: JSON.stringify([`Takeaway ${index}`]),
      updatedAt: 1_700_000_000_000 + index,
    }));
    const snapshot = buildReaderLearningSnapshot({ tables: { articles } });
    expect(snapshot.source.itemCount).toBe(4);
    expect(JSON.stringify(snapshot)).not.toContain('private body');
    expect(snapshot.items[0].assessments[0]).toMatchObject({
      type: 'mcq',
      sourceFingerprint: snapshot.items[0].fingerprint,
    });
    expect(snapshot.items[0].assessments[0].options).toHaveLength(4);
  });
});
