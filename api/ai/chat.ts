import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpointUrl, apiKey, model, messages, systemPrompt } = req.body;

  if (!endpointUrl || !apiKey || !model) {
    return res.status(400).json({ error: 'endpointUrl, apiKey, and model are required' });
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const provider = createOpenAICompatible({
      baseURL: endpointUrl,
      apiKey,
      name: 'custom',
      headers: {
        'x-gateway-project-id': 'swe-interview-prep',
      },
    });

    const result = streamText({
      model: provider(model),
      system: systemPrompt || undefined,
      messages,
    });

    // Stream using SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result.textStream) {
      if (chunk) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: any) {
    // If headers already sent, write error as SSE event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
}
