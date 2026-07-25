import { describe, expect, it, vi } from 'vitest';

import { onRequest } from '../../functions/api/[[path]].js';

describe('Pages agent catalog route', () => {
  it('serves the generated static manifest through the asset server', async () => {
    const next = vi.fn(async (request) => {
      expect(request).toBeInstanceOf(Request);
      expect(request.url).toBe('https://learn.significanthobbies.com/api-ai.json');
      return Response.json({ name: 'SWE Interview Prep' });
    });

    const response = await onRequest({
      request: new Request('https://learn.significanthobbies.com/api/ai'),
      env: {},
      params: { path: ['ai'] },
      next,
    });

    expect(next).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('server-timing')).toMatch(/^app;dur=\d+$/);
    await expect(response.json()).resolves.toEqual({ name: 'SWE Interview Prep' });
  });

  it('rejects mutation methods without invoking the asset server', async () => {
    const next = vi.fn();

    const response = await onRequest({
      request: new Request('https://learn.significanthobbies.com/api/ai', {
        method: 'POST',
      }),
      env: {},
      params: { path: ['ai'] },
      next,
    });

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toBe(405);
  });
});
