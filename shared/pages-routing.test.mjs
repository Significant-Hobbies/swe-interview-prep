import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../functions/_middleware';

describe('Pages SPA routing', () => {
  it.each(['/play', '/play/scale', '/play/scale?project=inference', '/wars'])(
    'serves the SPA for direct navigation to %s',
    async (path) => {
      const next = vi.fn(
        async () =>
          new Response('<html>Learning OS</html>', {
            headers: { 'content-type': 'text/html' },
          })
      );
      const response = await onRequest({
        request: new Request(`https://learn.significanthobbies.com${path}`),
        env: {},
        next,
      });
      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalledOnce();
      expect(await response.text()).toContain('Learning OS');
    }
  );

  it('retains a real 404 for an unknown route', async () => {
    const next = vi.fn();
    const response = await onRequest({
      request: new Request('https://learn.significanthobbies.com/not-a-route'),
      env: {},
      next,
    });
    expect(response.status).toBe(404);
    expect(next).not.toHaveBeenCalled();
  });
});
