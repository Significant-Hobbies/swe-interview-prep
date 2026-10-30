// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearMasteryCache,
  masteryCacheGeneration,
  readMasteryCache,
  writeMasteryCache,
} from '../lib/masteryCache';
import { AuthProvider, useAuth } from './AuthContext';

const profile = { id: 'public-fixture', name: 'Fixture learner', email: 'fixture@example.invalid' };
let root: Root;
let container: HTMLDivElement;
let auth: ReturnType<typeof useAuth>;
function State() {
  auth = useAuth();
  const { user, loading } = useAuth();
  return <p>{loading ? 'loading' : user ? user.name : 'signed out'}</p>;
}
beforeEach(() => {
  clearMasteryCache();
  localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function render(initialPublicGuest = false) {
  await act(async () => {
    root.render(
      <AuthProvider initialPublicGuest={initialPublicGuest}>
        <State />
      </AuthProvider>
    );
  });
}
describe('session verification boundary', () => {
  it('starts a prerendered blank guest without verification and persists the usual guest marker', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await render(true);
    expect(auth.isGuest).toBe(true);
    expect(auth.loading).toBe(false);
    expect(localStorage.getItem('dsa-prep-guest')).toBe('1');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('never lets a public hint replace a cached profile or skip cookie verification', async () => {
    localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: profile })));
    vi.stubGlobal('fetch', fetch);
    await render(true);
    expect(auth.user).toEqual(profile);
    expect(auth.isGuest).toBe(false);
    expect(fetch).toHaveBeenCalledWith('/api/auth/verify', { credentials: 'include' });
    expect(localStorage.getItem('dsa-prep-guest')).toBeNull();
  });
  it('settles a signed-out visitor without requesting protected auth verification', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    localStorage.setItem('dsa-prep-auth', 'legacy-public-fixture');
    await render();
    expect(fetch).not.toHaveBeenCalled();
    expect(container.textContent).toBe('signed out');
    expect(localStorage.getItem('dsa-prep-auth')).toBeNull();
  });
  it('leaves guest mode free of verification requests', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    localStorage.setItem('dsa-prep-guest', '1');
    await render();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('still verifies a cached signed-in profile using the cookie', async () => {
    localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ user: profile })));
    vi.stubGlobal('fetch', fetch);
    await render();
    expect(fetch).toHaveBeenCalledWith('/api/auth/verify', { credentials: 'include' });
    expect(container.textContent).toBe(profile.name);
  });
  it('still clears stale cached profiles after server rejection', async () => {
    writeMasteryCache(profile.id, {}, masteryCacheGeneration());
    localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    await render();
    expect(localStorage.getItem('dsa-prep-profile')).toBeNull();
    expect(container.textContent).toBe('signed out');
    expect(readMasteryCache(profile.id)).toBeUndefined();
  });
  it('clears account mastery before attempting a best-effort logout', async () => {
    localStorage.setItem('dsa-prep-profile', JSON.stringify(profile));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ user: profile })))
        .mockRejectedValueOnce(new TypeError('offline'))
    );
    await render();
    writeMasteryCache(profile.id, {}, masteryCacheGeneration());
    expect(readMasteryCache(profile.id)).toEqual({});
    await act(async () => auth.signOut());
    expect(readMasteryCache(profile.id)).toBeUndefined();
    expect(container.textContent).toBe('signed out');
  });
});
