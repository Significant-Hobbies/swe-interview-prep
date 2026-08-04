import { describe, expect, it } from 'vitest';

import { validateSystemDesignResponse } from './critique.mjs';

const rubric = { dimensions: [{ id: 'capacity' }, { id: 'reliability' }] };
const answers = {
  estimation: 'I would benchmark token throughput with 30 percent headroom.',
  failure: 'Use bounded queues and shed low-priority work.',
};

describe('system-design critique response boundary', () => {
  it('accepts declared dimensions with bounded scores and exact quotes', () => {
    expect(
      validateSystemDesignResponse(
        {
          dimensions: [
            {
              dimensionId: 'capacity',
              score: 2,
              evidence: ['benchmark token throughput'],
            },
            {
              dimensionId: 'reliability',
              score: 2,
              evidence: ['bounded queues'],
            },
          ],
          verdict: 'Sound evidence with room for deeper trade-offs.',
        },
        rubric,
        answers
      )
    ).not.toBeNull();
  });

  it('rejects invented dimensions, scores, and evidence', () => {
    expect(
      validateSystemDesignResponse(
        {
          dimensions: [
            { dimensionId: 'capacity', score: 4, evidence: ['benchmark token throughput'] },
            { dimensionId: 'invented', score: 2, evidence: ['not in the answer'] },
          ],
          verdict: 'Invalid.',
        },
        rubric,
        answers
      )
    ).toBeNull();
  });
});
