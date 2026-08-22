// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CONCEPT_BY_ID, EDITORIAL_DRILLS, ROADMAPS } from '../data/learning-os';
import { DEFAULT_PROFILE } from '../lib/profile';
import type { SessionPlan } from '../lib/planner';
import Today from './Today';

const concept = CONCEPT_BY_ID['inference-engines'];
const drill = EDITORIAL_DRILLS.find((candidate) => candidate.conceptId === concept.id)!;
const fakePlan: SessionPlan = {
  roadmap: ROADMAPS.find((roadmap) =>
    roadmap.milestones.some((milestone) => milestone.concepts.includes(concept.id))
  )!,
  concept,
  headline: concept.name,
  rationale: 'test',
  totalMinutes: 45,
  blocks: [
    { kind: 'learn', minutes: 15, title: 'Learn the concept', href: `/concepts/${concept.id}` },
    { kind: 'drill', minutes: 30, title: drill.title, href: `/drills/${drill.id}` },
  ],
  reviewsDue: 0,
  reviewQueue: [],
  drill,
  artifact: null,
  selectionReason: 'progression',
  selectedAt: '2026-08-20T10:00:00.000Z',
};

let masteryLoading = false;

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isGuest: true, loading: false }),
}));
vi.mock('../hooks/useSessionPlan', () => ({ useSessionPlan: () => fakePlan }));
vi.mock('../hooks/useConcepts', () => ({
  useConceptMastery: () => ({ mastery: {}, loading: masteryLoading }),
}));
vi.mock('../hooks/useUserStore', () => ({
  useDrillStore: () => ({ drills: {} }),
}));
vi.mock('../hooks/useProfile', () => ({ useProfile: () => ({ profile: DEFAULT_PROFILE }) }));
vi.mock('../hooks/useLearningEvidence', () => ({
  useLearningEvidence: () => ({ decisionReceipts: [], paperAttempts: [] }),
}));

describe('Today daily priority', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    masteryLoading = false;
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('answers what to learn before optional history and paths', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      );
    });
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toContain('Inference Engines');
    expect(container.textContent).toContain('Why this wins today');
    expect(container.textContent).toContain('Evidence required');
    expect(container.textContent).toContain('45 min');
    expect(container.textContent!.indexOf('Why this wins today')).toBeLessThan(
      container.textContent!.indexOf('Available paths')
    );
  });

  it('shows a truthful loading state before personalized claims', async () => {
    masteryLoading = true;
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      );
    });
    expect(container.textContent).toContain('Building today’s priority');
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
  });
});
