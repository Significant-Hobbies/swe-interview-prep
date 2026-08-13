import { describe, expect, it } from 'vitest';

import { catalogueSearchCount } from './Learn';

describe('Learn catalogue search', () => {
  it('finds canonical concepts by name and metadata', () => {
    expect(catalogueSearchCount('idempotency').concepts).toBeGreaterThan(0);
    expect(catalogueSearchCount('backend').concepts).toBeGreaterThan(0);
  });

  it('finds canonical paths without requiring an exact title', () => {
    expect(catalogueSearchCount('distributed').paths).toBeGreaterThan(0);
  });

  it('does not turn an empty query into an implicit catalogue result', () => {
    expect(catalogueSearchCount('   ')).toEqual({ concepts: 0, paths: 0 });
  });
});
