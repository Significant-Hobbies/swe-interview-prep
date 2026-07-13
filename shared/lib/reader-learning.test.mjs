import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

import { buildReaderLearningSnapshot, syncReaderLearningFeed } from './reader-learning.mjs';

const fixture = JSON.parse(
  readFileSync(fileURLToPath(new URL('../fixtures/reader-export.v1.json', import.meta.url)), 'utf8')
);

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

  it('authenticates the versioned Reader fixture and maps it deterministically', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(fixture),
    });
    const signal = new AbortController().signal;

    const first = await syncReaderLearningFeed({
      fetchImpl,
      url: 'https://reader.example.test/api/data-export',
      token: 'fixture-token',
      signal,
    });
    const second = await syncReaderLearningFeed({
      fetchImpl,
      url: 'https://reader.example.test/api/data-export',
      token: 'fixture-token',
      signal,
    });

    expect(fetchImpl).toHaveBeenNthCalledWith(1, 'https://reader.example.test/api/data-export', {
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer fixture-token',
      },
      signal,
    });
    expect(first).toEqual(second);
    expect(first.source).toMatchObject({ syncStatus: 'fresh', itemCount: 3 });
    expect(first.items[0].assessments[0]).toMatchObject({
      sourceFingerprint: first.items[0].fingerprint,
      generator: 'reader-export-v1',
    });
    expect(JSON.stringify(first)).not.toContain('fixture-only private article body');
  });

  it('retains the last good Reader items as stale when authenticated sync fails', async () => {
    const previous = buildReaderLearningSnapshot(fixture);
    const otherItem = { id: 'other', sourceId: 'high-signal' };
    const result = await syncReaderLearningFeed({
      fetchImpl: vi.fn().mockResolvedValue({ ok: false, status: 401 }),
      url: 'https://reader.example.test/api/data-export',
      token: 'expired-fixture-token',
      previousSnapshot: { items: [...previous.items, otherItem] },
      signal: new AbortController().signal,
    });

    expect(result.source).toMatchObject({ syncStatus: 'stale', itemCount: 3 });
    expect(result.items).toEqual(previous.items);
    expect(result.items).not.toContain(otherItem);
    expect(result.warning).toBe('Reader export returned 401');
  });

  it('fails stale on unsupported Reader export schemas', async () => {
    const result = await syncReaderLearningFeed({
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ ...fixture, formatVersion: 2 }),
      }),
      url: 'https://reader.example.test/api/data-export',
      token: 'fixture-token',
      previousSnapshot: { items: [] },
      signal: new AbortController().signal,
    });

    expect(result).toMatchObject({
      source: { syncStatus: 'stale', itemCount: 0 },
      items: [],
      warning: 'Unsupported Reader export',
    });
  });
});
