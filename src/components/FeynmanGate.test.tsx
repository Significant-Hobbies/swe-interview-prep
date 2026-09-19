// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import FeynmanGate from './FeynmanGate';

vi.mock('../hooks/useReviewMastery', () => ({ useReviewMastery: () => ({ review: vi.fn() }) }));
vi.mock('../hooks/useAI', () => ({ loadAIConfig: () => null }));
vi.mock('./MarkdownViewer', () => ({ default: () => null }));

const fetchMock = vi.hoisted(() => vi.fn());
const alerts = vi.hoisted(() => [] as string[]);

function typeText(element: HTMLTextAreaElement, value: string) {
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set?.call(
    element,
    value
  );
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const storage = new Map([['dsa-prep-profile', '{"id":"learner"}']]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
  alerts.length = 0;
  vi.stubGlobal('alert', (message: string) => alerts.push(message));
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it('reports grading unavailability and keeps the drafted explanation and gate open', async () => {
  fetchMock.mockResolvedValue(new Response('upstream unavailable', { status: 503 }));
  await act(async () =>
    root.render(
      <FeynmanGate open onClose={() => {}} problem="Explain the drill" problemId="synthetic" />
    )
  );
  const textarea = container.querySelector('textarea')!;
  const draft = 'The approach is a sliding window over tokens with a stop-word set.';
  await act(async () => typeText(textarea, draft));
  const grade = [...container.querySelectorAll('button')].find((b) =>
    b.textContent?.includes('Grade me')
  )!;
  await act(async () => grade.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  // Exactly one grading request was attempted; no mastery write followed it.
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(String(fetchMock.mock.calls[0][0])).toContain('action=feynman');
  expect(alerts.join()).toContain('Grade failed: 503');
  // The draft and the gate survive so the learner can retry instead of losing work.
  expect(textarea.value).toBe(draft);
  expect(container.textContent).toContain('Feynman Gate');
});
