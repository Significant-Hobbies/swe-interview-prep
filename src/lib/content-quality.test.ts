import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import artifactsData from '../data/artifacts.json';
import conceptsData from '../data/concepts.json';
import drillsData from '../data/drills.json';
import reviewQuestionsData from '../data/review-questions.json';
import { type Artifact, type Drill, DRILLS, type ReviewQuestion } from '../data/learning-os';
import reviewQuestionsIngestedData from '../data/review-questions-ingested.json';
import {
  isEditorialArtifact,
  isEditorialDrill,
  isMetadataDrill,
  isFormulaicReviewQuestion,
  isIngestedReviewQuestion,
  isSchedulableReviewQuestion,
  isStubPlaygroundCode,
} from './contentQuality';

const concepts = conceptsData.concepts;
const artifacts = artifactsData.artifacts;

describe('content quality bar', () => {
  it('editorial drills are a majority of catalog', () => {
    const editorial = DRILLS.filter(isEditorialDrill);
    expect(editorial.length).toBeGreaterThanOrEqual(80);
  });

  it('leetcode metadata stubs are excluded from editorial drills', () => {
    const metadata = DRILLS.filter(isMetadataDrill);
    expect(metadata.length).toBeGreaterThan(0);
    expect(metadata.every((d) => d.externalUrl?.includes('leetcode.com'))).toBe(true);
    expect(DRILLS.filter(isEditorialDrill).some((d) => isMetadataDrill(d))).toBe(false);
  });

  it('spine concepts use editorial drills only', () => {
    const spine = [
      'tokenization',
      'bm25',
      'hybrid-search',
      'search-evals',
      'hnsw',
      'rag',
      'hypothesis-testing',
      'probability-fundamentals',
      'returns-volatility',
    ];
    for (const id of spine) {
      const c = concepts.find((x: { id: string }) => x.id === id);
      const drillIds: string[] = c?.drills ?? [];
      const bad = drillIds.filter((did) => {
        const d = drillsData.drills.find((x: { id: string }) => x.id === did) as Drill | undefined;
        return d && !isEditorialDrill(d);
      });
      expect(bad, id).toEqual([]);
    }
  });

  it('hand-authored artifacts are not bootstrap scaffolds', () => {
    const hand = artifacts.filter((a: { id: string }) => !a.id.startsWith('build-')) as Artifact[];
    expect(hand.every(isEditorialArtifact)).toBe(true);
  });

  it('formulaic review questions are quarantined from spine', () => {
    const formulaic = reviewQuestionsData.reviewQuestions.filter((q: { id: string }) =>
      isFormulaicReviewQuestion(q.id)
    );
    expect(formulaic.length).toBeGreaterThan(0);
    const spineRqs = concepts
      .filter((c: { id: string }) => ['bm25', 'hypothesis-testing'].includes(c.id))
      .flatMap((c: { reviewQuestions?: string[] }) => c.reviewQuestions ?? []);
    const bad = spineRqs.filter(isFormulaicReviewQuestion);
    expect(bad).toEqual([]);
  });

  it('ingested library review questions pass schedulability bar', () => {
    const ingested = reviewQuestionsIngestedData.reviewQuestions ?? [];
    expect(ingested.length).toBeGreaterThan(0);
    expect(ingested.every((q: { id: string }) => isIngestedReviewQuestion(q.id))).toBe(true);
    expect((ingested as ReviewQuestion[]).every((q) => isSchedulableReviewQuestion(q))).toBe(true);
  });

  it('spine playground templates are not stubs', () => {
    const src = readFileSync(resolve(__dirname, '../data/playground-templates.ts'), 'utf8');
    const spineArtifacts = [
      'simulate-random-processes',
      'implement-bm25-highsignal',
      'search-eval-harness',
      'impl-ols-from-scratch',
    ];
    for (const id of spineArtifacts) {
      const block = src.match(
        new RegExp(`artifactId: '${id}'[\\s\\S]*?code: \\\`([\\s\\S]*?)\\\``)
      );
      expect(block, id).toBeTruthy();
      expect(isStubPlaygroundCode(block?.[1] ?? ''), id).toBe(false);
    }
  });
});
