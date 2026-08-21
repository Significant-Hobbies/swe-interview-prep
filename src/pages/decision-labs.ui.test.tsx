// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DecisionLab, { decisionLabDefinitions } from './DecisionLab';
import { DecisionLabShell } from '../components/DecisionLabShell';
import { loadLearningEvidence } from '../lib/learningEvidence';
import { saveDecisionLabDraft } from '../lib/learningContinuity';

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, value),
  },
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, isGuest: true, loading: false }),
}));

vi.mock('../components/FeynmanGate', () => ({ default: () => null }));

function click(element: Element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function enterValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('decision lab interaction', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    storage.clear();
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('exposes all six bounded decision labs', () => {
    expect(decisionLabDefinitions.map((definition) => definition.id)).toEqual([
      'inference-capacity',
      'capacity-planning',
      'evaluation-confidence',
      'model-routing',
      'rag-readiness',
      'inference-benchmarking',
    ]);
  });

  it('restores a version-matched mutable draft', async () => {
    const definition = decisionLabDefinitions.find(
      (candidate) => candidate.id === 'model-routing'
    )!;
    saveDecisionLabDraft('guest', {
      schemaVersion: 1,
      labId: definition.id,
      definitionVersion: definition.version,
      values: Object.fromEntries(definition.fields.map((field) => [field.id, field.initial])),
      prediction: 'The declared deep-model capacity will bind before the other gates.',
      derived: null,
      conclusion: '',
      mitigation: '',
      counterfactual: '',
      verificationMetric: '',
      updatedAt: '2026-08-20T10:00:00.000Z',
    });
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DecisionLabShell definition={definition} />
        </MemoryRouter>
      );
    });
    expect(container.textContent).toContain('Draft restored');
    expect(container.querySelector('textarea')?.value).toContain('deep-model capacity');
  });

  it('freezes prediction and inputs until the learner explicitly starts a new attempt', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DecisionLabShell definition={decisionLabDefinitions[0]} />
        </MemoryRouter>
      );
    });
    const reveal = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Freeze and reveal')
    )!;
    await act(async () => click(reveal));
    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(/concrete prediction/i);

    const prediction = container.querySelector('textarea')!;
    await act(async () =>
      enterValue(prediction, 'KV cache will exceed the declared memory budget.')
    );
    const ladderBeforeReveal = [...container.querySelectorAll('li')].find((item) =>
      item.textContent?.includes('Prediction frozen')
    );
    expect(ladderBeforeReveal?.querySelector('svg')).toBeNull();
    expect(prediction.getAttribute('aria-labelledby')).toBe('prediction');
    await act(async () => click(reveal));
    expect(container.textContent).toContain('Calculated evidence');
    expect(prediction.disabled).toBe(true);
    const ladderAfterReveal = [...container.querySelectorAll('li')].find((item) =>
      item.textContent?.includes('Prediction frozen')
    );
    expect(ladderAfterReveal?.querySelector('svg')).not.toBeNull();

    const firstInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    expect(firstInput.disabled).toBe(true);
    const restart = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Change inputs')
    )!;
    await act(async () => click(restart));
    expect(container.textContent).not.toContain('Calculated evidence');
    expect(prediction.value).toBe('');
    expect(firstInput.disabled).toBe(false);
  });

  it('stores a pending immutable receipt and never grants mastery for calculation', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <DecisionLabShell definition={decisionLabDefinitions[1]} />
        </MemoryRouter>
      );
    });
    const textareas = () => [...container.querySelectorAll('textarea')];
    await act(async () =>
      enterValue(textareas()[0], 'Throughput will bind before retained storage.')
    );
    const reveal = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Freeze and reveal')
    )!;
    await act(async () => click(reveal));

    for (const textarea of textareas().slice(1)) {
      await act(async () =>
        enterValue(
          textarea,
          'A concrete engineering statement long enough to preserve as evidence.'
        )
      );
    }
    const save = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Save immutable receipt')
    )!;
    await act(async () => click(save));

    expect(container.textContent).toContain('Evidence saved; mastery still pending');
    expect(loadLearningEvidence('guest').decisionReceipts[0]).toMatchObject({
      evidenceState: 'explanation-pending',
      masteryStatus: 'pending',
      definitionVersion: 1,
    });
  });

  it('renders an honest not-found route state', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/labs/decision/not-real']}>
          <DecisionLab />
        </MemoryRouter>
      );
    });
    expect(container.textContent).toContain('Decision lab not found');
  });
});
