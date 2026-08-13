import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createSoloOpponentArtifact,
  reviseSoloOpponentArtifact,
  type SoloTradeoffAIConfig,
} from './soloTradeoffAI';

const config: SoloTradeoffAIConfig = {
  endpointUrl: 'https://provider.example/v1',
  apiKey: 'secret-key-that-must-not-leak',
  model: 'provider/model-small',
};

const problem = {
  title: 'Delivery platform',
  prompt: 'Design a reliable multi-tenant delivery platform.',
  twist: 'Each tenant now requires regional data residency.',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('soloTradeoffAI', () => {
  it('calls the selected provider directly with an OpenAI-compatible request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: 'Independent architecture' } }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(createSoloOpponentArtifact(config, problem)).resolves.toBe(
      'Independent architecture'
    );

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://provider.example/v1/chat/completions');
    expect(init.headers).toEqual({
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    });
    expect(JSON.parse(String(init.body))).toMatchObject({
      model: config.model,
      messages: [
        { role: 'system' },
        { role: 'user', content: expect.stringContaining(problem.prompt) },
      ],
    });
  });

  it('revises only the AI artifact and shared twist', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: 'Revised design' } }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await reviseSoloOpponentArtifact(config, problem, 'AI INITIAL ARTIFACT');

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const request = JSON.parse(String(init.body));
    const prompt = request.messages[1].content as string;
    expect(prompt).toContain('AI INITIAL ARTIFACT');
    expect(prompt).toContain(problem.twist);
    expect(prompt).not.toContain('learner artifact');
  });

  it('returns a sanitized provider error without echoing credentials or response bodies', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(`invalid token ${config.apiKey}`, {
          status: 401,
          headers: { 'Content-Type': 'text/plain' },
        })
      )
    );

    const error = await createSoloOpponentArtifact(config, problem).catch((reason) => reason);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('(401)');
    expect(error.message).not.toContain(config.apiKey);
    expect(error.message).not.toContain('invalid token');
  });

  it('rejects insecure or credential-bearing endpoints before any request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createSoloOpponentArtifact({ ...config, endpointUrl: 'http://provider.example/v1' }, problem)
    ).rejects.toThrow('must use HTTPS');
    await expect(
      createSoloOpponentArtifact(
        { ...config, endpointUrl: 'https://user:password@provider.example/v1' },
        problem
      )
    ).rejects.toThrow('without credentials');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
