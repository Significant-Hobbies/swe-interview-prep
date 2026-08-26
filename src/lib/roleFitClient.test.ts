import { describe, expect, it } from 'vitest';

import { readRoleFitSse } from './roleFitClient';

describe('local role-fit SSE reader', () => {
  it('joins streamed JSON text and ignores the done marker', async () => {
    const response = new Response(
      [
        `data: ${JSON.stringify({ text: '{"roleTitle":' })}\n\n`,
        `data: ${JSON.stringify({ text: '"Backend Engineer"}' })}\n\n`,
        'data: [DONE]\n\n',
      ].join('')
    );
    await expect(readRoleFitSse(response)).resolves.toBe('{"roleTitle":"Backend Engineer"}');
  });

  it('surfaces an in-band local provider error', async () => {
    const response = new Response(`data: ${JSON.stringify({ error: 'CLI unavailable' })}\n\n`);
    await expect(readRoleFitSse(response)).rejects.toThrow('CLI unavailable');
  });
});
