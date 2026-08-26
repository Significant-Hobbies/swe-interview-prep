import { describe, expect, it } from 'vitest';

import { roleFitInputReady } from './RoleFit';

describe('role-fit input readiness', () => {
  it('waits for enough job-description evidence', () => {
    expect(roleFitInputReady('short')).toBe(false);
    expect(
      roleFitInputReady('A backend role requiring reliable APIs and distributed systems.')
    ).toBe(true);
  });

  it('rejects text beyond the server boundary', () => {
    expect(roleFitInputReady('x'.repeat(20_001))).toBe(false);
  });
});
