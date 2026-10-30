import { describe, expect, it } from 'vitest';

import {
  hasLearnerProgress,
  hasStoredContent,
  initialEntryScript,
  readInitialEntry,
} from './learnerState';

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

describe('public prerender eligibility', () => {
  it('allows only a blank root, without changing returning learner decisions', () => {
    expect(readInitialEntry('/', storage({}))).toEqual({ returning: false, prerender: true });
    for (const key of [
      'dsa-prep-profile',
      'swe-os:mastery',
      'swe-os:artifacts',
      'swe-os:active-roadmap',
    ]) {
      expect(readInitialEntry('/', storage({ [key]: { record: 1 } }))).toEqual({
        returning: true,
        prerender: false,
      });
    }
    for (const path of ['/login', '/learn', '/playground', '/drill/editor', '/project/draft']) {
      expect(readInitialEntry(path, storage({}))).toEqual({ returning: false, prerender: false });
    }
  });

  it('keeps presentation-only, corrupt and inaccessible stores on client rendering', () => {
    expect(readInitialEntry('/', storage({ 'swe-os:mastery': { schemaVersion: 1 } }))).toEqual({
      returning: false,
      prerender: false,
    });
    expect(readInitialEntry('/', { getItem: () => '{invalid' }).prerender).toBe(false);
    expect(
      readInitialEntry('/', {
        getItem() {
          throw new Error('blocked');
        },
      }).prerender
    ).toBe(false);
    expect(readInitialEntry('/', null).prerender).toBe(false);
    expect(
      readInitialEntry('/', storage({ 'swe-os:recent-visits-v1': [{ href: '/learn' }] })).prerender
    ).toBe(true);
  });

  it('runs the generated prepaint decision with the same real predicate', () => {
    const run = new Function(
      'window',
      'document',
      'location',
      'localStorage',
      initialEntryScript(true)
    );
    const browser: { __sweEntry?: { returning: boolean; prerender: boolean } } = {};
    const page = { documentElement: { dataset: {} }, addEventListener() {} };
    for (const entries of [
      {},
      { 'swe-os:mastery': { concept: { state: 2 } } },
      { 'swe-os:mastery': { schemaVersion: 1 } },
    ]) {
      const state = storage(entries);
      run(browser, page, { pathname: '/' }, state);
      expect(browser.__sweEntry).toMatchObject(readInitialEntry('/', state));
    }
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
