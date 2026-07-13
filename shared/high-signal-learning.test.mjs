import { describe, expect, it, vi } from 'vitest';
import { mapHighSignalFeed, syncHighSignalFeed } from '../scripts/lib/high-signal-learning.mjs';

const feed = {
  schema: 'high-signal.learning-brief.v1',
  generatedAt: '2026-07-13T10:00:00.000Z',
  items: [
    {
      id: 'trend:local-first:2026-07-13',
      title: 'Local-first workflows',
      summary: 'Operators are choosing local control.',
      canonicalUrl: 'https://highsignal.app/brief#trends',
      publishedAt: '2026-07-13T09:00:00.000Z',
      tracks: ['technology', 'technology', 'startups'],
      citations: [{ url: 'https://example.com/source', source: 'Example' }],
    },
  ],
};

describe('High Signal learning adapter', () => {
  it('maps a supported feed with provenance and stable fingerprints', () => {
    const result = mapHighSignalFeed(feed);
    expect(result.source).toMatchObject({ syncStatus: 'fresh', itemCount: 1 });
    expect(result.items[0]).toMatchObject({
      id: 'briefing:high-signal:trend:local-first:2026-07-13',
      sourceId: 'high-signal',
      tracks: ['technology', 'startups'],
      resources: [{ title: 'Example', url: 'https://example.com/source', type: 'source' }],
    });
    expect(result.items[0].fingerprint).toMatch(/^[a-f0-9]{16}$/);
  });

  it('rejects unsupported schemas instead of publishing them as fresh', () => {
    expect(() => mapHighSignalFeed({ ...feed, schema: 'future.v2' })).toThrow(
      'Unsupported High Signal learning feed'
    );
  });

  it('retains the last good items and marks them stale when sync fails', async () => {
    const previousItem = mapHighSignalFeed(feed).items[0];
    const result = await syncHighSignalFeed({
      fetchImpl: vi.fn().mockRejectedValue(new Error('offline')),
      url: 'https://example.com/feed',
      previousSnapshot: { items: [previousItem, { id: 'other', sourceId: 'reader' }] },
    });
    expect(result.source).toMatchObject({ syncStatus: 'stale', itemCount: 1 });
    expect(result.items).toEqual([previousItem]);
    expect(result.warning).toBe('offline');
  });
});
