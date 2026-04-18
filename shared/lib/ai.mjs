import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText } from 'ai';

/**
 * Server-side AI text generation using user-provided or env-default config.
 * Returns string. Throws on failure.
 */
export async function generate({ endpointUrl, apiKey, model, system, prompt, messages, maxTokens = 1500 }) {
  const eu = endpointUrl || process.env.AI_ENDPOINT_URL;
  const key = apiKey || process.env.AI_API_KEY;
  const m = model || process.env.AI_MODEL;
  if (!eu || !key || !m) {
    throw new Error('AI config missing: endpointUrl/apiKey/model required (or AI_ENDPOINT_URL/AI_API_KEY/AI_MODEL env vars)');
  }
  const provider = createOpenAICompatible({
    baseURL: eu,
    apiKey: key,
    name: 'custom',
    headers: { 'x-gateway-project-id': 'swe-interview-prep' },
  });
  try {
    const result = await generateText({
      model: provider(m),
      system,
      messages: messages || [{ role: 'user', content: prompt }],
      maxOutputTokens: maxTokens,
    });
    return result.text;
  } catch (e) {
    // Surface upstream API error body when present
    const upstream = e?.responseBody || e?.data?.error?.message || e?.cause?.message;
    const msg = upstream ? `${e.message} — ${typeof upstream === 'string' ? upstream.slice(0, 400) : JSON.stringify(upstream).slice(0, 400)}` : e.message;
    const wrapped = new Error(msg);
    wrapped.cause = e;
    throw wrapped;
  }
}

/**
 * Strip ```json fences and parse. Throws on parse failure.
 */
export function parseJSON(text) {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  return JSON.parse(t);
}
