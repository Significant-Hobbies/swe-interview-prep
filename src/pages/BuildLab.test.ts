import { describe, expect, it } from 'vitest';

import { ratingForSolve, resolveBuildLabView } from './BuildLab';

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
