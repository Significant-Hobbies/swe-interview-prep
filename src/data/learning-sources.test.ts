import { describe, expect, it } from 'vitest';

import { LEARNING_SOURCES } from './learning-sources';

describe('unified learning sources', () => {
  it('indexes approved source kinds without knowledge-base', () => {
    expect(LEARNING_SOURCES.items.length).toBeGreaterThan(100);
    expect(LEARNING_SOURCES.items.some((item) => item.sourceKind === 'project')).toBe(true);
    expect(LEARNING_SOURCES.items.some((item) => item.sourceKind === 'research')).toBe(true);
    expect(LEARNING_SOURCES.items.some((item) => item.sourceKind === 'briefing')).toBe(true);
    expect(JSON.stringify(LEARNING_SOURCES).toLowerCase()).not.toContain('knowledge-base');
  });

  it('uses stable unique item ids with provenance', () => {
    const ids = LEARNING_SOURCES.items.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of LEARNING_SOURCES.items) {
      expect(item.sourceId).toBeTruthy();
      expect(item.canonicalUrl).toMatch(/^(https?:\/\/|\/)/);
      expect(item.fingerprint).toMatch(/^[a-f0-9]{16}$/);
    }
  });

  it('only publishes structurally valid fingerprint-bound MCQs', () => {
    const assessments = LEARNING_SOURCES.items.flatMap((item) => item.assessments || []);
    expect(assessments.length).toBeGreaterThan(100);
    for (const assessment of assessments) {
      expect(assessment.options.length).toBeGreaterThanOrEqual(3);
      expect(new Set(assessment.options).size).toBe(assessment.options.length);
      expect(assessment.correctIndex).toBeGreaterThanOrEqual(0);
      expect(assessment.correctIndex).toBeLessThan(assessment.options.length);
      expect(assessment.sourceFingerprint).toMatch(/^[a-f0-9]{16}$/);
      expect(assessment.explanation).toBeTruthy();
    }
  });

  it('keeps Reader visible even when the local API token is not configured', () => {
    const reader = LEARNING_SOURCES.sources.find((source) => source.id === 'reader');
    expect(reader).toMatchObject({ kind: 'reader', syncStatus: 'pending', itemCount: 0 });
  });
});
