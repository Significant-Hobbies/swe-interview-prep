import { afterEach, describe, expect, it, vi } from 'vitest';
import chat from '../../api/ai/chat';
import models from '../../api/ai/models';

vi.mock('@ai-sdk/openai-compatible', () => ({ createOpenAICompatible: () => () => 'model' }));
vi.mock('ai', () => ({
  streamText: () => ({
    textStream: (async function* () {
      yield 'hello';
    })(),
  }),
}));

function response() {
  const res = { headersSent: false };
  for (const name of ['status', 'json', 'setHeader', 'write', 'end']) {
    res[name] = vi.fn(() => res);
  }
  return res;
}

afterEach(() => vi.unstubAllGlobals());

describe('legacy Node AI route compatibility', () => {
  it.each([chat, models])(
    'rejects unsupported methods and missing credentials',
    async (handler) => {
      const res = response();
      await handler({ method: 'GET', body: {} }, res);
      expect(res.status).toHaveBeenLastCalledWith(405);
      await handler({ method: 'POST', body: {} }, res);
      expect(res.status).toHaveBeenLastCalledWith(400);
    }
  );

  it('preserves model discovery without calling a real provider', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ data: [{ id: 'example' }] })));
    const res = response();
    await models(
      { method: 'POST', body: { endpointUrl: 'https://example.test/v1', apiKey: 'test' } },
      res
    );
    expect(res.status).toHaveBeenLastCalledWith(200);
    expect(res.json).toHaveBeenLastCalledWith({ models: [{ id: 'example', name: 'example' }] });
  });

  it('preserves streaming response methods and completion framing', async () => {
    const res = response();
    await chat(
      {
        method: 'POST',
        body: {
          endpointUrl: 'https://example.test/v1',
          apiKey: 'test',
          model: 'example',
          messages: [{ role: 'user', content: 'example' }],
        },
      },
      res
    );
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(res.write).toHaveBeenCalledWith('data: {"text":"hello"}\n\n');
    expect(res.write).toHaveBeenLastCalledWith('data: [DONE]\n\n');
    expect(res.end).toHaveBeenCalledOnce();
  });
});
