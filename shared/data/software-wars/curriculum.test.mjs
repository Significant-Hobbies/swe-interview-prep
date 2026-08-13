import { describe, expect, it } from 'vitest';
import { blitzQuestions } from './authored-banks.mjs';
import { buildWarsCurriculumManifest, resolveWarsQueueConceptIds } from './curriculum.mjs';

describe('Software Wars canonical curriculum projection', () => {
  it('keeps every canonical track, roadmap, and concept visible with honest coverage', () => {
    const manifest = buildWarsCurriculumManifest(blitzQuestions);
    expect(manifest.totals).toEqual({ tracks: 19, roadmaps: 26, concepts: 259 });
    expect(manifest.concepts.find(({ id }) => id === 'idempotency')).toMatchObject({
      name: 'Idempotency',
      learnPath: '/concepts/idempotency',
    });
    expect(manifest.concepts.some(({ candidateCount }) => candidateCount === 0)).toBe(true);
  });

  it('resolves scoped queues only from canonical curriculum relationships', () => {
    expect(resolveWarsQueueConceptIds('concept', 'idempotency')).toEqual(new Set(['idempotency']));
    expect(resolveWarsQueueConceptIds('roadmap', 'distributed-systems-12w')).toContain(
      'idempotency'
    );
    expect(resolveWarsQueueConceptIds('track', 'backend')).toContain('idempotency');
    expect(resolveWarsQueueConceptIds('concept', 'not-real')).toBeNull();
  });
});
