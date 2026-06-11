import { describe, expect, it } from 'vitest';

import { PROJECT_STATUS_OPTIONS } from './ProjectDetail';

describe('ProjectDetail status options', () => {
  it('includes every project status used by the data model', () => {
    expect(PROJECT_STATUS_OPTIONS.map(option => option.value)).toEqual([
      'planned',
      'active',
      'guided',
      'AI-managed',
      'paused',
      'done',
      'archived',
    ]);
  });
});
