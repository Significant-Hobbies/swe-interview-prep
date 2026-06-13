import { describe, expect, it } from 'vitest';

import { resolveBuildLabView } from './BuildLab';

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
