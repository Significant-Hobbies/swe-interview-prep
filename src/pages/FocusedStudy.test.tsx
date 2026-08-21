// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import FocusedStudy from './FocusedStudy';

const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
});

vi.mock('../hooks/useLearningEvidence', () => ({
  useLearningEvidence: () => ({ accountScope: 'guest' }),
}));
vi.mock('../components/FeynmanGate', () => ({ default: () => null }));

function click(element: Element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('focused study evidence flow', () => {
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

  it('does not present visited stages as complete and diagnoses missing evidence', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/study/concept/inference-engines']}>
          <Routes>
            <Route path="/study/:focusKind/:focusId" element={<FocusedStudy />} />
          </Routes>
        </MemoryRouter>
      );
    });
    const explain = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('4. Explain')
    )!;
    await act(async () => click(explain));

    const learn = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('1. Learn')
    )!;
    expect(learn.getAttribute('aria-label')).toBe('Learn');
    expect(container.textContent).toContain('Evidence required');
    expect(container.textContent).toContain('Retrieval response');
    expect(container.textContent).toContain('Concrete application');
    expect(container.textContent).toContain('Causal explain-back');
    expect(
      [...container.querySelectorAll('button')]
        .find((button) => button.textContent?.includes('Complete study evidence'))
        ?.hasAttribute('disabled')
    ).toBe(true);
  });
});
