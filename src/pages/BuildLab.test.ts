import { describe, expect, it } from 'vitest';

import { ratingForSolve, resolveBuildLabView, shouldCreditArtifact } from './BuildLab';

describe('BuildLab routing', () => {
  it('routes build to the artifact board', () => {
    expect(resolveBuildLabView()).toBe('artifact-board');
  });

  it('routes valid drills to the drill workspace', () => {
    expect(resolveBuildLabView('build-tokenizer')).toBe('drill-workspace');
  });

  it('shows not found for invalid drill ids', () => {
    expect(resolveBuildLabView('typo')).toBe('not-found');
  });
});

describe('ratingForSolve', () => {
  it('rewards a first-try auto-graded pass most', () => {
    expect(ratingForSolve('automated', 0)).toBe('easy');
  });

  it('downgrades as attempts pile up', () => {
    expect(ratingForSolve('automated', 2)).toBe('good');
    expect(ratingForSolve('automated', 5)).toBe('hard');
  });

  it('never treats an unverified claim as a clean pass', () => {
    expect(ratingForSolve('self-reported', 0)).toBe('hard');
    expect(ratingForSolve('outline-check', 0)).toBe('good');
  });
});

describe('artifact evidence credit', () => {
  const base = {
    status: 'shipped' as const,
    url: '',
    path: '',
    notes: '',
    criteria: [0],
  };

  it('credits evidence completed after an artifact was marked shipped', () => {
    expect(shouldCreditArtifact(1, base, { ...base, url: 'https://example.com/proof' })).toBe(true);
  });

  it('does not credit later edits after the evidence was already complete', () => {
    const evidenced = { ...base, url: 'https://example.com/proof' };
    expect(shouldCreditArtifact(1, evidenced, { ...evidenced, notes: 'edited' })).toBe(false);
  });
});
