// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BlitzWar from './BlitzWar';
import TradeoffWar from './TradeoffWar';

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

vi.mock('../components/TradeoffMedia', () => ({
  TradeoffMedia: () => <div>Connected media</div>,
  MediaUnavailable: ({ reason }: { reason: string }) => <div>{reason}</div>,
}));

function click(element: Element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('Software Wars client safety and phase visibility', () => {
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

  it('keeps preview answer explanations hidden during an active Blitz question', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <BlitzWar />
        </MemoryRouter>
      );
    });
    const start = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Start preview')
    );
    expect(start).toBeTruthy();
    await act(async () => click(start!));

    expect(container.textContent).toContain('A client retries a timed-out POST');
    expect(container.textContent).not.toContain('A durable idempotency key binds retries');
    expect(container.querySelector('[role="radiogroup"]')).toBeTruthy();
    expect(container.querySelector('button.min-h-14')).toBeTruthy();
    expect(container.querySelector('a[href="/concepts/idempotency"]')?.textContent).toContain(
      'Idempotency'
    );
  });

  it('keeps the complete curriculum searchable from the Blitz queue', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <BlitzWar />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('19 tracks · 25 roadmaps · 252 concepts');
    const concepts = [...container.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Concepts'
    );
    await act(async () => click(concepts!));

    const showAll = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Show all 252 concepts')
    );
    await act(async () => click(showAll!));

    expect(container.querySelector('a[href="/concepts/idempotency"]')).toBeTruthy();
    expect(container.textContent).toContain('Idempotency');
  });

  it('reveals the Tradeoff twist only after the phase advances', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <TradeoffWar />
        </MemoryRouter>
      );
    });
    const open = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Open workbench')
    );
    await act(async () => click(open!));
    expect(container.textContent).not.toContain('regional data residency');

    const reveal = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Reveal twist')
    );
    await act(async () => click(reveal!));
    expect(container.textContent).toContain('regional data residency');
    expect(container.querySelector('[aria-label="Battle phases"]')).toBeTruthy();
  });
});
