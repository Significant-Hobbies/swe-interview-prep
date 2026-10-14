// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
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
