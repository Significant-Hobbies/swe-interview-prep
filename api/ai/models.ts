import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpointUrl, apiKey } = req.body;

  if (!endpointUrl || !apiKey) {
    return res.status(400).json({ models: [] });
  }

  try {
    // Strip trailing /chat/completions or similar paths to get base URL for /models
    const baseUrl = endpointUrl.replace(/\/chat\/completions\/?$/, '').replace(/\/$/, '');
    // If baseUrl doesn't end with /v1, try appending it for common providers
    const modelsUrl = `${baseUrl}/models`;

    const response = await fetch(modelsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(200).json({ models: [] });
    }

    const data = await response.json();

    // Handle OpenAI-style response: { data: [{ id, ... }] }
    const models = (data.data || data.models || []).map((m: any) => ({
      id: m.id || m.name,
      name: m.name || m.id,
    }));

    return res.status(200).json({ models });
  } catch {
    return res.status(200).json({ models: [] });
  }
}
