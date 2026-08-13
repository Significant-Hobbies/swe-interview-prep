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

vi.mock('../components/CodeEditor', () => ({
  default: ({ code, onChange, readOnly }: any) => (
    <textarea
      aria-label="Code artifact editor"
      value={code}
      disabled={readOnly}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

vi.mock('../components/DiagramEditor', () => ({
  default: ({ readOnly }: any) => (
    <div aria-label="Diagram editor" data-readonly={readOnly ? 'true' : 'false'} />
  ),
}));

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
    vi.unstubAllGlobals();
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
      button.textContent?.includes('Play unranked')
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

  it('offers a complete guest battle without presenting signup as the primary action', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <BlitzWar />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('No signup required');
    expect(container.textContent).toContain('Play unranked');
    expect(container.textContent).toContain('Sign in only to keep Elo');
  });

  it('keeps the complete curriculum searchable from the Blitz queue', async () => {
    await act(async () => {
      root.render(
        <MemoryRouter>
          <BlitzWar />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('19 tracks · 26 roadmaps · 259 concepts');
    expect(
      [...container.querySelectorAll('h3')].filter(
        (heading) => heading.textContent?.trim() === 'Mixed battle'
      )
    ).toHaveLength(1);
    const concepts = [...container.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Concepts'
    );
    await act(async () => click(concepts!));

    const showAll = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Show all 259 concepts')
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

  it('uses the shared code and diagram workspace and freezes every artifact', async () => {
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

    expect(container.querySelector('[aria-label="Code artifact editor"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Diagram editor"]')).toBeTruthy();

    const reveal = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Reveal twist')
    );
    await act(async () => click(reveal!));
    const freeze = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Freeze & debate')
    );
    await act(async () => click(freeze!));

    expect(
      (container.querySelector('textarea[aria-label="Text artifact"]') as HTMLTextAreaElement)
        .disabled
    ).toBe(true);
    expect(
      (
        container.querySelector(
          'textarea[aria-label="Code artifact editor"]'
        ) as HTMLTextAreaElement
      ).disabled
    ).toBe(true);
    expect(
      container.querySelector('[aria-label="Diagram editor"]')?.getAttribute('data-readonly')
    ).toBe('true');
  });

  it('runs Solo Tradeoff with a tab-only key and keeps the learner draft out of twist revision', async () => {
    const privateKey = 'sk-user-private-test-key';
    const privateDraft = 'LEARNER PRIVATE DRAFT BEFORE REVEAL';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: 'AI initial artifact' } }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ choices: [{ message: { content: 'AI revised artifact' } }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    vi.stubGlobal('fetch', fetchMock);

    await act(async () => {
      root.render(
        <MemoryRouter>
          <TradeoffWar />
        </MemoryRouter>
      );
    });

    expect(container.textContent).toContain('Take it solo with AI');
    const start = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Start solo session')
    ) as HTMLButtonElement;
    expect(start.disabled).toBe(true);

    const model = [...container.querySelectorAll('input')].find(
      (input) => input.previousSibling?.textContent?.trim() === 'Model'
    ) as HTMLInputElement | undefined;
    const key = container.querySelector('input[type="password"]') as HTMLInputElement | null;
    expect(model).toBeTruthy();
    expect(key).toBeTruthy();
    await act(async () => {
      enterValue(model!, 'provider/model-small');
      enterValue(key!, privateKey);
    });

    expect(start.disabled).toBe(false);
    await act(async () => {
      click(start);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Solo AI room · unranked');
    expect(container.textContent).not.toContain(privateKey);
    expect([...storage.values()].join('\n')).not.toContain(privateKey);

    const learnerEditor = container.querySelector(
      'textarea[aria-label="Text artifact"]'
    ) as HTMLTextAreaElement;
    await act(async () => enterValue(learnerEditor, privateDraft));
    const reveal = [...container.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Reveal twist')
    );
    await act(async () => {
      click(reveal!);
      await Promise.resolve();
      await Promise.resolve();
    });

    const revisionRequest = JSON.stringify(fetchMock.mock.calls[1]);
    expect(revisionRequest).toContain('AI initial artifact');
    expect(revisionRequest).toContain('regional data residency');
    expect(revisionRequest).not.toContain(privateDraft);
    expect(container.textContent).toContain('regional data residency');

    await act(async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 550));
    });
    const persistedDraft = [...storage.values()].join('\n');
    expect(persistedDraft).toContain(privateDraft);
    expect(persistedDraft).not.toContain(privateKey);
    expect(persistedDraft).not.toContain('provider/model-small');
    expect(persistedDraft).not.toContain('AI initial artifact');
    expect(persistedDraft).not.toContain('AI revised artifact');
  });
});
