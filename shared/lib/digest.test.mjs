import { describe, expect, it } from 'vitest';
import { buildDigestMessage, countDueFromMastery, digestEnabled } from './digest.mjs';

describe('digest', () => {
  it('countDueFromMastery counts past-due rows', () => {
    const now = new Date('2026-06-21T12:00:00Z');
    const n = countDueFromMastery(
      [{ due: '2026-06-20T00:00:00Z' }, { due: '2026-06-22T00:00:00Z' }, { due: null }],
      now
    );
    expect(n).toBe(2);
  });

  it('buildDigestMessage includes review count', () => {
    const msg = buildDigestMessage({ name: 'Sam', dueReviews: 5 });
    expect(msg.subject).toContain('5');
    expect(msg.text).toContain('Sam');
  });

  it('digestEnabled respects flags', () => {
    expect(digestEnabled({ digestEmail: true })).toBe(true);
    expect(digestEnabled({ pushEnabled: true })).toBe(true);
    expect(digestEnabled({})).toBe(false);
  });
});
