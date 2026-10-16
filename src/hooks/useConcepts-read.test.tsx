// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { clearMasteryCache } from '../lib/masteryCache';
import { useConceptMastery } from './useConcepts';

const user = vi.hoisted(() => ({
  id: 'mastery-fixture',
  name: 'Synthetic learner',
  email: 'audit@example.invalid',
}));
vi.mock('../contexts/AuthContext', () => ({ useAuth: () => ({ user }) }));
let root: Root;
let node: HTMLDivElement;
let state: ReturnType<typeof useConceptMastery>;
function Snapshot() {
  state = useConceptMastery();
  return <p>{state.loading ? 'pending' : state.error || Object.keys(state.mastery).length}</p>;
}
beforeEach(() => {
  clearMasteryCache();
  user.id = 'mastery-fixture';
  localStorage.clear();
  node = document.createElement('div');
  document.body.append(node);
  root = createRoot(node);
});
afterEach(async () => {
  await act(async () => root.unmount());
  node.remove();
  vi.unstubAllGlobals();
});
it('keeps a failed read distinct from empty mastery and retries without replacing local progress', async () => {
  localStorage.setItem('swe-os:mastery', JSON.stringify({ retained: { reps: 1 } }));
  const before = localStorage.getItem('swe-os:mastery');
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));
  vi.stubGlobal('fetch', fetch);
  await act(async () => root.render(<Snapshot />));
  expect(state.error).toBe('Could not load concept mastery (503).');
  expect(localStorage.getItem('swe-os:mastery')).toBe(before);
  fetch.mockResolvedValue(new Response(JSON.stringify({ mastery: {} })));
  await act(async () => state.refresh());
  expect(state.error).toBeNull();
  expect(state.loading).toBe(false);
  expect(fetch).toHaveBeenCalledTimes(2);
});
it('reports pending until the synthetic account response arrives', async () => {
  let release!: (response: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        })
    )
  );
  await act(async () => root.render(<Snapshot />));
  expect(state.loading).toBe(true);
  expect(node.textContent).toBe('pending');
  await act(async () => release(new Response(JSON.stringify({ mastery: {} }))));
  expect(state.loading).toBe(false);
  expect(state.error).toBeNull();
});

const reviewed = {
  stability: 1,
  difficulty: 5,
  reps: 1,
  lapses: 0,
  state: 1,
  confidence: 1,
  lastReview: '2026-10-16T10:00:00Z',
  due: '2026-10-17T10:00:00Z',
};

it('shows verified mastery immediately on a route revisit while revalidating', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify({ mastery: { tokenization: reviewed } })));
  vi.stubGlobal('fetch', fetch);
  await act(async () => root.render(<Snapshot key="first" />));
  let release!: (response: Response) => void;
  fetch.mockImplementation(
    () =>
      new Promise<Response>((resolve) => {
        release = resolve;
      })
  );
  await act(async () => root.render(<Snapshot key="revisit" />));
  expect(state.loading).toBe(false);
  expect(state.mastery.tokenization.reps).toBe(1);
  expect(node.textContent).toBe('1');
  expect(fetch).toHaveBeenCalledTimes(2);
  await act(async () => release(new Response(null, { status: 503 })));
  expect(state.error).toBe('Could not load concept mastery (503).');
});

it('caches a verified empty account without making another account look empty', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ mastery: {} })));
  vi.stubGlobal('fetch', fetch);
  await act(async () => root.render(<Snapshot key="first" />));
  fetch.mockImplementation(() => new Promise<Response>(() => {}));
  await act(async () => root.render(<Snapshot key="same-account" />));
  expect(state.loading).toBe(false);
  user.id = 'another-account';
  await act(async () => root.render(<Snapshot key="other-account" />));
  expect(state.loading).toBe(true);
  expect(node.textContent).toBe('pending');
});

it('cannot refill the session cache with a read that finishes after sign-out', async () => {
  let release!: (response: Response) => void;
  const fetch = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        release = resolve;
      })
  );
  vi.stubGlobal('fetch', fetch);
  await act(async () => root.render(<Snapshot key="before-signout" />));
  clearMasteryCache();
  await act(async () =>
    release(new Response(JSON.stringify({ mastery: { tokenization: reviewed } })))
  );
  expect(localStorage.getItem('swe-os:mastery')).toBeNull();
  await act(async () => root.render(<Snapshot key="new-session" />));
  expect(state.loading).toBe(true);
  expect(state.mastery).toEqual({});
  await act(async () => release(new Response(JSON.stringify({ mastery: {} }))));
});

it('retains a successful rating on the next route without waiting for its read', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ mastery: {} })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ mastery: reviewed })));
  vi.stubGlobal('fetch', fetch);
  await act(async () => root.render(<Snapshot key="rating" />));
  await act(async () => {
    expect(await state.review('tokenization', 'good')).toBe(true);
  });
  fetch.mockImplementation(() => new Promise<Response>(() => {}));
  await act(async () => root.render(<Snapshot key="after-rating" />));
  expect(state.loading).toBe(false);
  expect(state.mastery.tokenization.reps).toBe(1);
});
