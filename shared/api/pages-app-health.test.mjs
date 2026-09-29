import { afterEach, describe, expect, it, vi } from 'vitest';

import { onRequest } from '../../functions/api/[[path]].js';

afterEach(() => vi.unstubAllGlobals());

describe('Pages API App Health telemetry', () => {
  it('records a normalized endpoint summary through waitUntil', async () => {
    const ingest = vi.fn(async (_url, init) => {
      const batch = JSON.parse(init.body);
      expect(batch.events).toHaveLength(1);
      expect(batch.events[0]).toMatchObject({
        method: 'POST',
        route: '/api/auth/logout',
        status_code: 200,
      });
      expect(JSON.stringify(batch)).not.toContain('private-query-value');
      return Response.json({ accepted: 1 });
    });
    vi.stubGlobal('fetch', ingest);

    const pending = [];
    const response = await onRequest({
      request: new Request(
        'https://learn.significanthobbies.com/api/auth/logout?token=private-query-value',
        {
          method: 'POST',
        }
      ),
      env: { APP_HEALTH_INGEST_KEY: 'test-ingest-key' },
      params: { path: ['auth', 'logout'] },
      next: vi.fn(),
      waitUntil: (promise) => pending.push(promise),
    });

    expect(response.status).toBe(200);
    expect(pending).toHaveLength(1);
    await Promise.all(pending);
    expect(ingest).toHaveBeenCalledOnce();
  });

  it('leaves collection disabled when the optional key is missing', async () => {
    const ingest = vi.fn();
    vi.stubGlobal('fetch', ingest);
    const waitUntil = vi.fn();

    const response = await onRequest({
      request: new Request('https://learn.significanthobbies.com/api/auth/logout', {
        method: 'POST',
      }),
      env: {},
      params: { path: ['auth', 'logout'] },
      next: vi.fn(),
      waitUntil,
    });

    expect(response.status).toBe(200);
    expect(waitUntil).not.toHaveBeenCalled();
    expect(ingest).not.toHaveBeenCalled();
  });

  it('does not report unknown API routes', async () => {
    const ingest = vi.fn();
    vi.stubGlobal('fetch', ingest);
    const waitUntil = vi.fn();

    const response = await onRequest({
      request: new Request('https://learn.significanthobbies.com/api/unknown/private-id'),
      env: { APP_HEALTH_INGEST_KEY: 'test-ingest-key' },
      params: { path: ['unknown', 'private-id'] },
      next: vi.fn(),
      waitUntil,
    });

    expect(response.status).toBe(404);
    expect(waitUntil).not.toHaveBeenCalled();
    expect(ingest).not.toHaveBeenCalled();
  });
});
