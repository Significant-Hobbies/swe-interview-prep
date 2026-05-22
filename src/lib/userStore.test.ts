// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';

import { loadLocal, mergeNotes, mergeRecords, saveLocal } from './userStore';

describe('userStore local persistence', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a value through localStorage', () => {
    saveLocal('k', { a: 1, b: 'x' });
    expect(loadLocal('k', null)).toEqual({ a: 1, b: 'x' });
  });

  it('returns the fallback when the key is missing', () => {
    expect(loadLocal('missing', { default: true })).toEqual({ default: true });
  });

  it('returns the fallback on corrupt JSON', () => {
    localStorage.setItem('bad', '{not json');
    expect(loadLocal('bad', [])).toEqual([]);
  });
});

describe('mergeRecords', () => {
  it('lets DB records win and local records fill gaps', () => {
    const local = { a: { v: 1 }, b: { v: 2 } };
    const remote = { b: { v: 99 }, c: { v: 3 } };
    expect(mergeRecords(local, remote)).toEqual({
      a: { v: 1 },
      b: { v: 99 },
      c: { v: 3 },
    });
  });

  it('returns local unchanged when remote is empty', () => {
    const local = { a: { v: 1 } };
    expect(mergeRecords(local, {})).toEqual(local);
  });
});

describe('mergeNotes', () => {
  it('keeps notes unique to either side', () => {
    const merged = mergeNotes(
      [{ id: 'l', updatedAt: '2026-01-01' }],
      [{ id: 'r', updatedAt: '2026-01-02' }],
    );
    expect(merged.map(n => n.id).sort()).toEqual(['l', 'r']);
  });

  it('keeps the newer note on an id conflict', () => {
    const merged = mergeNotes(
      [{ id: 'x', updatedAt: '2026-01-01' }],
      [{ id: 'x', updatedAt: '2026-06-01' }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].updatedAt).toBe('2026-06-01');
  });

  it('sorts results newest first', () => {
    const merged = mergeNotes(
      [{ id: 'old', updatedAt: '2026-01-01' }],
      [{ id: 'new', updatedAt: '2026-12-01' }],
    );
    expect(merged[0].id).toBe('new');
  });
});
