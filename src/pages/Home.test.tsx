// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import Home from './Home';
let signedIn = false;
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: signedIn ? { id: 'fixture' } : null }),
}));
vi.mock('../lib/learnerState', () => ({ hasLearnerProgress: () => false }));
afterEach(() => {
  signedIn = false;
});
it('routes signed-out Start Learning CTAs to the existing Learn page', async () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  });
  const links = [...container.querySelectorAll('a')].filter((link) =>
    link.textContent?.includes('Start learning')
  );
  expect(links).toHaveLength(2);
  expect(links.every((link) => link.getAttribute('href') === '/learn')).toBe(true);
  await act(async () => root.unmount());
});
it('preserves the signed-in dashboard redirect', async () => {
  signedIn = true;
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<p>Existing dashboard</p>} />
        </Routes>
      </MemoryRouter>
    );
  });
  expect(container.textContent).toBe('Existing dashboard');
  await act(async () => root.unmount());
});
