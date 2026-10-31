// @vitest-environment happy-dom
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import { SiteHeader } from './SiteHeader';

it('retains a native menu opened before hydration and closes it on actual navigation', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  container.innerHTML = renderToString(
    <StaticRouter location="/">
      <SiteHeader />
    </StaticRouter>
  );
  document.body.append(container);
  const menu = [...container.querySelectorAll('details')].find((node) =>
    node.querySelector('nav[aria-label="Compact"]')
  )!;
  menu.open = true;
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(
        container,
        <MemoryRouter>
          <SiteHeader />
        </MemoryRouter>
      );
    });
    expect(menu.open).toBe(true);
    expect(container.contains(menu)).toBe(true);
    expect(error).not.toHaveBeenCalled();
    await act(async () => {
      (menu.querySelector('a[href="/learn"]') as HTMLAnchorElement).click();
    });
    expect(menu.open).toBe(false);
    expect(error).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    error.mockRestore();
    vi.unstubAllGlobals();
    container.remove();
  }
});
