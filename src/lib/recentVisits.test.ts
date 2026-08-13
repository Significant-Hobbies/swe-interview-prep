import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loadRecentVisits, recordRecentVisit, visitLabel } from './recentVisits';

describe('recent visits', () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it('keeps a bounded deduplicated navigation trail', () => {
    recordRecentVisit('/concepts/idempotency');
    recordRecentVisit('/learn');
    recordRecentVisit('/concepts/idempotency');

    expect(loadRecentVisits()).toHaveLength(2);
    expect(loadRecentVisits()[0]).toMatchObject({
      href: '/concepts/idempotency',
      label: 'Idempotency',
    });
  });

  it('does not record dashboard aliases', () => {
    recordRecentVisit('/dashboard');
    recordRecentVisit('/today');
    expect(loadRecentVisits()).toEqual([]);
  });

  it('gives catalogue and workspace routes useful names', () => {
    expect(visitLabel('/practice')).toBe('Practice workspace');
    expect(visitLabel('/practice/all')).toBe('Complete problem catalogue');
  });
});
