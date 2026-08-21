import { describe, expect, it } from 'vitest';

import { CONCEPTS } from './learning-os';
import { FORMULAS, validateFormulaRegistry } from './formulas';
import { INFERENCE_PATH, INFERENCE_PATH_NODES, validateInferencePath } from './inference-path';
import { NOTATION, searchNotation, validateNotation } from './notation';
import { PAPER_CONTRACTS, validatePaperContracts } from './paper-contracts';
import { selectRotatingPaper } from '../lib/paperRotation';

describe('formula and paper learning contracts', () => {
  it('ships the bounded formula set with complete contextual metadata', () => {
    expect(FORMULAS.map((formula) => formula.id)).toEqual([
      'kv-cache-bytes',
      'model-weight-bytes',
      'serving-latency',
      'throughput',
      'roofline-bound',
      'wilson-interval',
      'attention-shapes',
      'collective-volume',
    ]);
    expect(validateFormulaRegistry()).toEqual([]);
  });

  it('keeps paper bodies canonical and every contract concept-linked', () => {
    const conceptIds = new Set(CONCEPTS.map((concept) => concept.id));
    expect(validatePaperContracts(conceptIds)).toEqual([]);
    expect(PAPER_CONTRACTS.every((paper) => paper.canonicalUrl.startsWith('https://'))).toBe(true);
    expect(
      PAPER_CONTRACTS.some((paper) => paper.canonicalUrl === 'https://learn-inference.com/')
    ).toBe(true);
  });

  it('maps all 42 Learn Inference nodes to concepts without copying chapter bodies', () => {
    const conceptIds = new Set(CONCEPTS.map((concept) => concept.id));
    expect(INFERENCE_PATH).toHaveLength(8);
    expect(INFERENCE_PATH_NODES).toHaveLength(42);
    expect(validateInferencePath(conceptIds)).toEqual([]);
    expect(
      INFERENCE_PATH_NODES.every((node) =>
        node.canonicalUrl.startsWith('https://learn-inference.com/')
      )
    ).toBe(true);
  });

  it('ships a searchable, concept-linked notation reference', () => {
    const conceptIds = new Set(CONCEPTS.map((concept) => concept.id));
    const formulaIds = new Set(FORMULAS.map((formula) => formula.id));
    expect(validateNotation(conceptIds, formulaIds)).toEqual([]);
    expect(searchNotation('latency').map((entry) => entry.id)).toContain('ttft');
    expect(searchNotation('∂').map((entry) => entry.id)).toContain('partial-derivative');
  });

  it('rotates deterministically over available papers', () => {
    const first = selectRotatingPaper(PAPER_CONTRACTS, { now: new Date('2026-08-20T23:00:00Z') });
    const sameDay = selectRotatingPaper(PAPER_CONTRACTS, {
      now: new Date('2026-08-20T00:01:00Z'),
    });
    const nextDay = selectRotatingPaper(PAPER_CONTRACTS, {
      now: new Date('2026-08-21T00:01:00Z'),
    });
    expect(first?.paper.id).toBe(sameDay?.paper.id);
    expect(nextDay?.index).toBe((first!.index + 1) % first!.poolSize);
  });
});
