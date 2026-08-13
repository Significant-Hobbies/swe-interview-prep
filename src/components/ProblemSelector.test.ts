import { describe, expect, it } from 'vitest';

import { PRACTICE_DRILLS } from '../data/learning-os';
import { filterPracticeProblems } from './ProblemSelector';

describe('ProblemSelector catalogue', () => {
  it('exposes the complete canonical practice inventory with no query', () => {
    expect(filterPracticeProblems('')).toHaveLength(PRACTICE_DRILLS.length);
    expect(new Set(filterPracticeProblems('').map((drill) => drill.id)).size).toBe(
      PRACTICE_DRILLS.length
    );
  });

  it('searches titles, prompts, concepts, and metadata', () => {
    expect(filterPracticeProblems('tokenizer').length).toBeGreaterThan(0);
    expect(filterPracticeProblems('hard').length).toBeGreaterThan(0);
  });
});
