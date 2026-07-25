import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import artifactsData from '../data/artifacts.json';
import conceptPacksData from '../data/concept-packs.json';
import conceptsData from '../data/concepts.json';
import drillsData from '../data/drills.json';
import reviewQuestionsData from '../data/review-questions.json';
import {
  type Artifact,
  type Drill,
  DRILLS,
  REVIEW_QUESTIONS,
  type ReviewQuestion,
} from '../data/learning-os';
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

interface PackShape {
  items: { category: string; title: string; url?: string }[];
}

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

  it('no editorial review question uses a formulaic template stem', () => {
    const formulaic = (reviewQuestionsData.reviewQuestions as ReviewQuestion[]).filter(
      isFormulaicReviewQuestion
    );
    expect(formulaic.map((q) => q.id)).toEqual([]);
  });

  // A card whose answer is the concept's own mentalModel re-shows the sentence
  // the learner just read on the concept page. It cannot test recall, and it
  // silently inflates FSRS mastery. 153 of 239 cards were in this state before
  // the 2026-07-25 rewrite; this gate keeps them from coming back.
  it('no scheduled review answer merely repeats the concept mental model', () => {
    const mentalModelById = new Map(
      (concepts as { id: string; mentalModel?: string }[]).map((c) => [
        c.id,
        (c.mentalModel ?? '').trim(),
      ])
    );
    const leaked = REVIEW_QUESTIONS.filter((q) => {
      const mm = mentalModelById.get(q.conceptId);
      return Boolean(mm) && (q.answer ?? '').trim() === mm;
    });
    expect(leaked.map((q) => q.id)).toEqual([]);
  });

  // The `rq-*-core` ids were quarantined wholesale by an id-suffix rule. Their
  // answers are hand-written now, so they must actually reach the FSRS queue.
  it('hand-written rq-*-core questions are schedulable', () => {
    const core = (reviewQuestionsData.reviewQuestions as ReviewQuestion[]).filter(
      (q) => q.id.startsWith('rq-') && q.id.endsWith('-core')
    );
    expect(core.length).toBeGreaterThan(0);
    expect(core.every(isSchedulableReviewQuestion)).toBe(true);
    expect(REVIEW_QUESTIONS.some((q) => q.id.endsWith('-core'))).toBe(true);
  });

  it('ingested library review questions are quarantined from scheduling', () => {
    const ingested = reviewQuestionsIngestedData.reviewQuestions ?? [];
    expect(ingested.length).toBeGreaterThan(0);
    expect(ingested.every((q: { id: string }) => isIngestedReviewQuestion(q.id))).toBe(true);
    // They are template questions with scraped answers and near-random concept
    // mapping, so none of them may reach the FSRS queue.
    expect((ingested as ReviewQuestion[]).some((q) => isSchedulableReviewQuestion(q))).toBe(false);
    expect(REVIEW_QUESTIONS.some((q) => isIngestedReviewQuestion(q.id))).toBe(false);
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

describe('source titles', () => {
  // One URL, one title.
  //
  // Titles used to be written per concept over a shared URL, so
  // martin.kleppmann.com — a homepage — appeared under 8 different titles
  // ("— CAP & consistency", "— fan-out architectures", "— transactions"),
  // each promising an article that does not exist there. The MIT 18.650 course
  // page carried 7, and one YouTube id was cited as both a Kohavi talk and a
  // Marty Cagan talk (it turned out to be a removed video). A URL describing
  // itself differently on every card is the tell for an invented description.
  it('no URL is described by more than one title', () => {
    const byUrl = new Map<string, Set<string>>();
    for (const pack of Object.values(conceptPacksData.packs as Record<string, PackShape>)) {
      for (const item of pack.items) {
        if (!item.url?.startsWith('http')) continue;
        if (!byUrl.has(item.url)) byUrl.set(item.url, new Set());
        byUrl.get(item.url)?.add(item.title);
      }
    }
    const conflicting = [...byUrl.entries()]
      .filter(([, titles]) => titles.size > 1)
      .map(([url, titles]) => `${url}\n    ${[...titles].join('\n    ')}`);
    expect(
      conflicting,
      `a URL must have one canonical title:\n  ${conflicting.join('\n  ')}`
    ).toEqual([]);
  });
});
