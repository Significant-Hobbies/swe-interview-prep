import { describe, expect, it } from 'vitest';

import {
  buildDailyLearningSession,
  LEARNING_SOURCES,
  saveLearningProgress,
} from './learning-sources';

const memory = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
  },
});

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
    expect(LEARNING_SOURCES.items.some((item) => item.sourceKind === 'reader')).toBe(false);
  });

  it('builds repeatable 30-minute sessions for a chosen source', () => {
    memory.clear();
    const first = buildDailyLearningSession('2026-07-12:1', [], 'project:posttrainllm');
    const now = new Date().toISOString();
    saveLearningProgress(
      Object.fromEntries(
        first.items.map((item) => [
          item.id,
          {
            status: 'completed' as const,
            startedAt: now,
            completedAt: now,
            attempts: 1,
            correctAnswers: 1,
          },
        ])
      )
    );
    const next = buildDailyLearningSession('2026-07-12:2', [], 'project:posttrainllm');

    expect(first.totalMinutes).toBe(30);
    expect(first.items.length).toBeGreaterThan(0);
    expect(first.items.every((item) => item.sourceId === 'project:posttrainllm')).toBe(true);
    expect(next.items.map((item) => item.id)).not.toEqual(first.items.map((item) => item.id));
    expect(first.items[0].hierarchy).toMatchObject({
      track: 'posttrainllm',
      module: '1. Language model foundations',
      topicOrder: 1,
    });
    memory.clear();
  });

  it('accounts for every active Fleet project and labels PostTrainLLM', () => {
    const expected = [
      'saas-maker',
      'free-ai',
      'reel-pipeline',
      'drank',
      'codevetter',
      'starboard',
      'high-signal',
      'aliveville',
      'pace',
      'posttrainllm',
      'significanthobbies',
      'reader',
      'anime-list',
      'swe-interview-prep',
      'email-manager',
      'looptv',
      'rolepatch',
      'karte',
      'research-papers',
    ];
    const sourceIds = new Set(LEARNING_SOURCES.sources.map((source) => source.id));
    for (const project of expected) expect(sourceIds.has(`project:${project}`)).toBe(true);
    expect(sourceIds.has('project:knowledge-base')).toBe(false);
    expect(
      LEARNING_SOURCES.sources.find((source) => source.id === 'project:posttrainllm')
    ).toMatchObject({
      label: 'posttrainllm',
      syncStatus: 'fresh',
    });
    expect(LEARNING_SOURCES.items.some((item) => item.id.startsWith('project:posttrainllm:'))).toBe(
      true
    );
    expect(
      JSON.stringify({
        sources: LEARNING_SOURCES.sources.map(({ id, label, description }) => ({
          id,
          label,
          description,
        })),
        items: LEARNING_SOURCES.items.map(({ id, sourceId, project, tracks }) => ({
          id,
          sourceId,
          project,
          tracks,
        })),
      }).toLowerCase()
    ).not.toContain('tinygpt');
  });
});
