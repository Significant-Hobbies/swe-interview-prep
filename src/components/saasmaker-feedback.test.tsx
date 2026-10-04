// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeedbackProjectKey, SaaSMakerFeedback } from './saasmaker-feedback';

const { TEST_KEY } = vi.hoisted(() => ({ TEST_KEY: 'pk_testfixture123' }));

const launcher = () => ({
  mountSharedFooterFeedback: vi.fn<(node: HTMLElement, options: { apiKey: string }) => void>(),
  openSharedFooterFeedback: vi.fn<(node: HTMLElement, options: { apiKey: string }) => void>(),
  unmountSharedFooterFeedback: vi.fn<(node: HTMLElement) => void>(),
});

describe('SaaS Maker feedback binding', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    vi.stubGlobal('fetch', vi.fn());
    delete (window as Window & { SaasMakerFeedback?: unknown }).SaasMakerFeedback;
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    delete (window as Window & { SaasMakerFeedback?: unknown }).SaasMakerFeedback;
  });

  it('loads on intent, mounts with the catalog key, and reopens the same root', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ api_key: TEST_KEY }),
    } as Response);

    await act(async () => root.render(<SaaSMakerFeedback />));
    expect(
      document.querySelector('script[src="https://sassmaker.com/feedback-launcher.js"]')
    ).toBeNull();
    const button = container.querySelector('button')!;
    await act(async () => button.click());
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(document.activeElement).toBe(button);
    await act(async () => button.click());
    expect(
      document.querySelectorAll('script[src="https://sassmaker.com/feedback-launcher.js"]')
    ).toHaveLength(1);
    const api = launcher();
    (window as Window & { SaasMakerFeedback?: unknown }).SaasMakerFeedback = api;
    const script = document.querySelector(
      'script[src="https://sassmaker.com/feedback-launcher.js"]'
    )!;
    await act(async () => script.dispatchEvent(new Event('load')));

    expect(fetch).toHaveBeenCalledWith(
      'https://api.sassmaker.com/v1/capture-config/swe-interview-prep',
      expect.objectContaining({ headers: { accept: 'application/json' } })
    );
    expect(api.mountSharedFooterFeedback).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({ apiKey: TEST_KEY })
    );
    const mountNode = api.mountSharedFooterFeedback.mock.calls[0][0];
    expect(mountNode.children).toHaveLength(0);
    await act(async () => button.click());
    expect(api.mountSharedFooterFeedback).toHaveBeenCalledTimes(1);
    expect(api.openSharedFooterFeedback).toHaveBeenCalledWith(
      mountNode,
      expect.objectContaining({ apiKey: TEST_KEY })
    );
    await act(async () => root.render(null));
    expect(api.unmountSharedFooterFeedback).toHaveBeenCalledWith(mountNode);
    expect(mountNode.isConnected).toBe(false);
  });

  it('retries a failed module and rejects a loaded module without its API', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ api_key: TEST_KEY }),
    } as Response);
    await act(async () => root.render(<SaaSMakerFeedback />));
    const button = container.querySelector('button')!;
    await act(async () => button.click());
    const first = document.querySelector(
      'script[src="https://sassmaker.com/feedback-launcher.js"]'
    )!;
    await act(async () => first.dispatchEvent(new Event('error')));
    expect(container.textContent).toContain('Retry feedback');
    expect(first.isConnected).toBe(false);
    await act(async () => button.click());
    const second = document.querySelector(
      'script[src="https://sassmaker.com/feedback-launcher.js"]'
    )!;
    expect(second).not.toBe(first);
    await act(async () => second.dispatchEvent(new Event('load')));
    expect(container.textContent).toContain('Retry feedback');
    await act(async () => button.click());
    const api = launcher();
    (window as Window & { SaasMakerFeedback?: unknown }).SaasMakerFeedback = api;
    await act(async () =>
      document
        .querySelector('script[src="https://sassmaker.com/feedback-launcher.js"]')!
        .dispatchEvent(new Event('load'))
    );
    expect(api.mountSharedFooterFeedback).toHaveBeenCalledTimes(1);
  });

  it('ignores a late script load after unmount and uses a fresh node after remount', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ api_key: TEST_KEY }),
    } as Response);
    await act(async () => root.render(<SaaSMakerFeedback />));
    await act(async () => container.querySelector('button')!.click());
    const script = document.querySelector(
      'script[src="https://sassmaker.com/feedback-launcher.js"]'
    )!;
    await act(async () => root.render(null));
    const api = launcher();
    (window as Window & { SaasMakerFeedback?: unknown }).SaasMakerFeedback = api;
    await act(async () => script.dispatchEvent(new Event('load')));
    expect(api.mountSharedFooterFeedback).not.toHaveBeenCalled();
    await act(async () => root.render(<SaaSMakerFeedback />));
    await act(async () => container.querySelector('button')!.click());
    const first = api.mountSharedFooterFeedback.mock.calls[0][0];
    first.dataset.feedbackMounted = 'true';
    await act(async () => root.render(null));
    await act(async () => root.render(<SaaSMakerFeedback />));
    await act(async () => container.querySelector('button')!.click());
    const second = api.mountSharedFooterFeedback.mock.calls[1][0];
    expect(second).not.toBe(first);
    expect(second.dataset.feedbackMounted).toBeUndefined();
    expect(api.unmountSharedFooterFeedback).toHaveBeenCalledTimes(1);
  });

  it('times out a stalled module, ignores its late callback, and permits retry', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ api_key: TEST_KEY }),
    } as Response);
    await act(async () => root.render(<SaaSMakerFeedback />));
    const button = container.querySelector('button')!;
    await act(async () => button.click());
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://sassmaker.com/feedback-launcher.js"]'
    )!;
    const lateLoad = script.onload!;
    await act(async () => vi.advanceTimersByTime(8_000));
    expect(container.textContent).toContain('Retry feedback');
    expect(script.isConnected).toBe(false);
    const api = launcher();
    (window as Window & { SaasMakerFeedback?: unknown }).SaasMakerFeedback = api;
    await act(async () => lateLoad.call(script, new Event('load')));
    expect(api.mountSharedFooterFeedback).not.toHaveBeenCalled();
    await act(async () => button.click());
    expect(api.mountSharedFooterFeedback).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['invalid key shape', { ok: true, json: async () => ({ api_key: 'wrong-project' }) }],
    [
      'invented publishable suffix',
      {
        ok: true,
        json: async () => ({ api_key: 'pk_testfixture123_publishable' }),
      },
    ],
    ['unavailable binding', { ok: false, json: async () => ({}) }],
  ])('fails closed for %s', async (_case, response) => {
    vi.mocked(fetch).mockResolvedValue(response as Response);
    const key = await fetchFeedbackProjectKey(new AbortController().signal);
    expect(key).toBeNull();
  });

  it('fails closed when the public config request errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network unavailable'));
    const key = await fetchFeedbackProjectKey(new AbortController().signal);
    expect(key).toBeNull();
  });

  it('aborts the public config request when the existing widget unmounts', async () => {
    let requestSignal: AbortSignal | undefined;
    vi.mocked(fetch).mockImplementation((_input, init) => {
      requestSignal = init?.signal as AbortSignal;
      return new Promise((_resolve, reject) => {
        requestSignal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError'))
        );
      });
    });

    await act(async () => root.render(<SaaSMakerFeedback />));
    expect(requestSignal?.aborted).toBe(false);
    await act(async () => root.render(null));
    expect(requestSignal?.aborted).toBe(true);
  });
});
