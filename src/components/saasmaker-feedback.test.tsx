// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchFeedbackProjectKey, SaaSMakerFeedback } from './saasmaker-feedback';

const { TEST_KEY } = vi.hoisted(() => ({ TEST_KEY: 'pk_testfixture123' }));

vi.mock('@saas-maker/feedback', async () => {
  const React = await import('react');
  return {
    FeedbackWidget: ({ projectId }: { projectId: string }) =>
      React.createElement('div', {
        'data-testid': 'feedback-widget',
        'data-project-bound': String(projectId === TEST_KEY),
      }),
  };
});

describe('SaaS Maker feedback binding', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('mounts the existing widget only with the catalog-bound publishable key', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ api_key: TEST_KEY }),
    } as Response);

    await act(async () => root.render(<SaaSMakerFeedback />));
    for (
      let attempt = 0;
      attempt < 5 && !container.querySelector('[data-testid="feedback-widget"]');
      attempt += 1
    ) {
      await act(async () => new Promise((resolve) => setTimeout(resolve, 0)));
    }

    expect(fetch).toHaveBeenCalledWith(
      'https://api.sassmaker.com/v1/capture-config/swe-interview-prep',
      expect.objectContaining({ headers: { accept: 'application/json' } })
    );
    expect(container.querySelector('[data-project-bound="true"]')).not.toBeNull();
  });

  it.each([
    ['invalid key shape', { ok: true, json: async () => ({ api_key: 'wrong-project' }) }],
    ['invented publishable suffix', { ok: true, json: async () => ({ api_key: 'pk_testfixture123_publishable' }) }],
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
        requestSignal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      });
    });

    await act(async () => root.render(<SaaSMakerFeedback />));
    expect(requestSignal?.aborted).toBe(false);
    await act(async () => root.render(null));
    expect(requestSignal?.aborted).toBe(true);
  });
});
