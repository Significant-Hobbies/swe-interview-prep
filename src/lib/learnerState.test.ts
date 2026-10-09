import { describe, expect, it } from 'vitest';

import { hasLearnerProgress, hasStoredContent } from './learnerState';

function storage(entries: Record<string, unknown>) {
  return {
    getItem: (key: string) => (key in entries ? JSON.stringify(entries[key]) : null),
  };
}

describe('hasStoredContent', () => {
  it('ignores empty containers and schema-only envelopes', () => {
    expect(hasStoredContent({})).toBe(false);
    expect(hasStoredContent([])).toBe(false);
    expect(hasStoredContent({ schemaVersion: 1, accounts: {} })).toBe(false);
    expect(hasStoredContent({ done: false })).toBe(false);
  });

  it('detects real records', () => {
    expect(hasStoredContent({ tokenization: { state: 2 } })).toBe(true);
    expect(hasStoredContent({ schemaVersion: 1, accounts: { guest: { receipts: [1] } } })).toBe(
      true
    );
    expect(hasStoredContent({ done: true })).toBe(true);
  });
});

describe('hasLearnerProgress', () => {
  it('is false for a first-time visitor, even after opening pages', () => {
    expect(hasLearnerProgress(storage({}))).toBe(false);
    expect(
      hasLearnerProgress(
        storage({
          'swe-os:daily-sessions': [{ date: '2026-10-09', kinds: ['session_start'] }],
          'swe-os:recent-visits-v1': [{ href: '/learn' }],
        })
      )
    ).toBe(false);
  });

  it('is true once a concept has mastery state', () => {
    expect(hasLearnerProgress(storage({ 'swe-os:mastery': { tokenization: { state: 2 } } }))).toBe(
      true
    );
  });

  it('survives malformed JSON and missing storage', () => {
    expect(hasLearnerProgress({ getItem: () => '{not json' })).toBe(false);
    expect(hasLearnerProgress(null)).toBe(false);
  });
});
