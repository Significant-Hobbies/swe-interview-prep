import { describe, expect, it } from 'vitest';

import {
  SYSTEM_DESIGN_STAGE_IDS,
  type SystemDesignCase,
  validateSystemDesignCase,
  validateSystemDesignCatalog,
} from './system-design-case-schema';

function validCase(): SystemDesignCase {
  const anchors = ([0, 1, 2, 3] as const).map((score) => ({
    score,
    description: `Evidence level ${score}`,
  }));
  return {
    id: 'example-case',
    version: '1.0.0',
    title: 'Example case',
    category: 'infrastructure-storage',
    pattern: 'example request routing',
    criticalPath: 'request through durable state',
    durationMinutes: 45,
    prompt: 'Design an example service.',
    difficulty: 'core',
    hiddenAssumptions: ['Peak traffic is twice the average.'],
    stages: SYSTEM_DESIGN_STAGE_IDS.map((id) => ({
      id,
      title: id,
      prompt: `Answer the ${id} stage.`,
      interviewerNote: `Probe ${id} reasoning.`,
    })),
    calculationAnchors: [
      {
        id: 'throughput',
        label: 'Throughput',
        formula: 'requests / second',
        unit: 'requests/s',
        expectedTerms: ['requests', 'second'],
      },
    ],
    rubricDimensions: ['scope', 'capacity', 'architecture', 'reliability'].map((id) => ({
      id,
      label: id,
      weight: 0.25,
      stageIds: ['scoping'],
      evidenceSignals: [id],
      misconceptionSignals: [],
      anchors,
      conceptIds: ['known-concept'],
      drillIds: ['known-drill'],
    })),
    followUps: [
      {
        id: 'queue-branch',
        stageId: 'deep-dive',
        matchAny: ['queue'],
        prompt: 'How is the queue bounded?',
      },
    ],
    failureInjections: [
      {
        id: 'region-loss',
        title: 'Region loss',
        prompt: 'The primary region fails.',
        expectedSignals: ['failover', 'recovery'],
      },
    ],
    conceptIds: ['known-concept'],
    drillIds: ['known-drill'],
    commonMistakes: ['Skipping the workload assumptions.'],
    strongerAnswer: 'Clarify, estimate, design, and validate the critical path.',
    sources: [
      { title: 'Official source', url: 'https://example.com/one', kind: 'official-doc' },
      { title: 'Primary paper', url: 'https://example.com/two', kind: 'paper' },
    ],
    publication: { state: 'practice-only' },
  };
}

describe('system-design case validation', () => {
  it('accepts a complete practice case', () => {
    expect(
      validateSystemDesignCase(validCase(), {
        conceptIds: new Set(['known-concept']),
        drillIds: new Set(['known-drill']),
      })
    ).toEqual([]);
  });

  it('rejects unordered stages and incomplete scoring anchors', () => {
    const candidate = validCase();
    candidate.stages = [...candidate.stages].reverse();
    candidate.rubricDimensions[0].anchors = candidate.rubricDimensions[0].anchors.slice(1);
    expect(validateSystemDesignCase(candidate)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('stages must be ordered'),
        expect.stringContaining('must define score anchors 0,1,2,3'),
      ])
    );
  });

  it('rejects dangling remediation references', () => {
    expect(
      validateSystemDesignCase(validCase(), {
        conceptIds: new Set(),
        drillIds: new Set(),
      })
    ).toEqual(
      expect.arrayContaining([
        'example-case: unknown concept known-concept',
        'example-case: unknown drill known-drill',
      ])
    );
  });

  it('rejects approved cases without a substantive guide', () => {
    const candidate = validCase();
    candidate.publication = { state: 'approved' };
    expect(validateSystemDesignCase(candidate)).toContain(
      'example-case: approved publication requires a guide'
    );
  });

  it('rejects duplicate catalog IDs', () => {
    expect(validateSystemDesignCatalog([validCase(), validCase()])).toContain(
      'catalog: duplicate case id example-case'
    );
  });
});
