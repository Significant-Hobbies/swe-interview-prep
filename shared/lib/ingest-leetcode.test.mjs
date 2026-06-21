import { describe, expect, it } from 'vitest';
import {
  buildDrillStub,
  detectConceptId,
  mergeDrillStubs,
  slugToDrillId,
} from './ingest-leetcode.mjs';

describe('ingest-leetcode', () => {
  it('maps tags to concept ids', () => {
    expect(detectConceptId(['array', 'hash-table'])).toBe('array-hashing');
    expect(detectConceptId(['sliding-window', 'string'])).toBe('sliding-window');
    expect(detectConceptId([])).toBe('array-hashing');
  });

  it('builds drill stub with leetcode link', () => {
    const stub = buildDrillStub(
      {
        questionId: '1',
        title: 'Two Sum',
        difficulty: 'Easy',
        topicTags: [{ slug: 'array' }, { slug: 'hash-table' }],
      },
      'two-sum',
    );
    expect(stub.id).toBe(slugToDrillId('two-sum'));
    expect(stub.conceptId).toBe('array-hashing');
    expect(stub.difficulty).toBe('intro');
    expect(stub.externalUrl).toContain('two-sum');
  });

  it('mergeDrillStubs skips existing ids', () => {
    const existing = [{ id: 'lc-two-sum', title: 'Old' }];
    const stubs = [buildDrillStub({ questionId: '1', title: 'Two Sum', difficulty: 'Easy', topicTags: [] }, 'two-sum')];
    const { added, skipped } = mergeDrillStubs(existing, stubs);
    expect(added).toBe(0);
    expect(skipped).toBe(1);
  });
});