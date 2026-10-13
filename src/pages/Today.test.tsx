// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CONCEPT_BY_ID, EDITORIAL_DRILLS, ROADMAPS } from '../data/learning-os';
import { DEFAULT_PROFILE } from '../lib/profile';
import type { SessionPlan } from '../lib/planner';
import type { DrillEntry } from '../hooks/useUserStore';
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
let authLoading = false;
let drills: Record<string, DrillEntry> = {};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isGuest: true, loading: authLoading }),
}));
vi.mock('../hooks/useSessionPlan', () => ({ useSessionPlan: () => fakePlan }));
vi.mock('../hooks/useConcepts', () => ({
  useConceptMastery: () => ({ mastery: {}, loading: masteryLoading }),
}));
vi.mock('../hooks/useUserStore', () => ({
  useDrillStore: () => ({ drills }),
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
    authLoading = false;
    drills = {};
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it('answers what to learn before optional history and paths', async () => {
    drills = { [drill.id]: { attempts: 1, status: 'solved', lastCode: '' } };
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      );
    });
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toBe(
      'Model inference capacity and identify the first declared constraint.'
    );
    expect(container.querySelector('a[href="/labs/decision/inference-capacity"]')).toBeTruthy();
    expect(container.textContent).toContain('Why this wins today');
    expect(container.textContent).toContain('Evidence required');
    expect(container.textContent).toContain('45 min');
    expect(container.textContent!.indexOf('Why this wins today')).toBeLessThan(
      container.textContent!.indexOf('Available paths')
    );
    expect(container.querySelector('#learning-now')).toBeTruthy();
    expect(container.querySelector('#practice-now')).toBeTruthy();
    expect(container.textContent).toContain('Last practised');
    expect(container.textContent).toContain('1 attempt · solved');
    expect(container.querySelector('a[href="/explore"]')).toBeTruthy();
    expect(container.querySelector('a[href="/progress"]')).toBeTruthy();
  });

  it.each([true, false])('keeps a new learner focused with online=%s', async (online) => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      );
    });
    expect(container.querySelector('h1')?.textContent).toContain('Inference Engines');
    expect(container.textContent).toContain('Evidence required');
    expect(container.textContent).toContain('Supporting session map');
    expect(
      container.querySelector('a[href="/study/concept/inference-engines"]')?.textContent
    ).toContain('Start focused study');
    for (const block of fakePlan.blocks) {
      expect(container.querySelector(`a[href="${block.href}"]`)).toBeTruthy();
    }
    expect(container.querySelector('#product-intro')).toBeNull();
    expect(container.querySelector('#learning-now')).toBeNull();
    expect(container.querySelector('#practice-now')).toBeNull();
    expect(container.querySelector('#available-paths')).toBeNull();
    expect(container.textContent).not.toContain('Recently visited');
    expect(container.textContent).not.toContain('No practice yet');
    expect(container.querySelector('a[href="/progress"]')).toBeNull();
    if (!online) expect(container.textContent).toContain('offline local');
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
    expect(container.querySelector('#session-map')).toBeNull();
    expect(container.querySelector('#learning-now')).toBeNull();
    expect(container.querySelector('a[href="/study/concept/inference-engines"]')).toBeNull();
  });

  it('keeps the initial auth loading state truthful', async () => {
    authLoading = true;
    await act(async () => {
      root.render(
        <MemoryRouter>
          <Today />
        </MemoryRouter>
      );
    });
    expect(container.querySelector('h1')?.textContent).toContain('Building today’s priority');
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(container.querySelector('#learning-now')).toBeNull();
  });
});
