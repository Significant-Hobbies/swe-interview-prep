import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { generateText, streamText } from 'ai';

/** Thrown when no BYOK config and no server-side AI credentials are available. */
export class AIConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AIConfigError';
  }
}

export const AI_CONFIG_MISSING_MESSAGE =
  'AI is not configured. Add your own endpoint URL, API key, and model in Settings, or set AI_ENDPOINT_URL / AI_API_KEY / AI_MODEL on the deployment.';

/**
 * Resolve the provider config from an explicit (BYOK) config, falling back to
 * environment defaults. `env` lets Cloudflare Workers pass their bindings in,
 * since `process.env` is not the source of truth there.
 */
export function resolveAIConfig({ endpointUrl, apiKey, model } = {}, env = undefined) {
  const source = env || (typeof process !== 'undefined' ? process.env : undefined) || {};
  const hasExplicitConfig = Boolean(endpointUrl || apiKey || model);
  const eu = hasExplicitConfig ? endpointUrl : source.AI_ENDPOINT_URL;
  const key = hasExplicitConfig ? apiKey : source.AI_API_KEY;
  const m = hasExplicitConfig ? model : source.AI_MODEL;
  if (!eu || !key || !m) throw new AIConfigError(AI_CONFIG_MISSING_MESSAGE);
  return { endpointUrl: eu, apiKey: key, model: m };
}

function buildProvider({ endpointUrl, apiKey }) {
  return createOpenAICompatible({
    baseURL: endpointUrl,
    apiKey,
    name: 'custom',
    headers: { 'x-gateway-project-id': 'swe-interview-prep' },
  });
}

/**
 * Server-side AI text generation using user-provided or env-default config.
 * Returns string. Throws on failure.
 */
export async function generate({
  endpointUrl,
  apiKey,
  model,
  system,
  prompt,
  messages,
  maxTokens = 1500,
  env,
}) {
  const resolved = resolveAIConfig({ endpointUrl, apiKey, model }, env);
  const provider = buildProvider(resolved);
  try {
    const result = await generateText({
      model: provider(resolved.model),
      system,
      messages: messages || [{ role: 'user', content: prompt }],
      maxOutputTokens: maxTokens,
    });
    return result.text;
  } catch (e) {
    // Surface upstream API error body when present
    const upstream = e?.responseBody || e?.data?.error?.message || e?.cause?.message;
    const msg = upstream
      ? `${e.message} — ${typeof upstream === 'string' ? upstream.slice(0, 400) : JSON.stringify(upstream).slice(0, 400)}`
      : e.message;
    const wrapped = new Error(msg);
    wrapped.cause = e;
    throw wrapped;
  }
}

/**
 * Streaming counterpart to `generate`. Returns an async iterable of text
 * deltas. Throws `AIConfigError` when neither BYOK nor env credentials exist.
 */
export function generateStream({
  endpointUrl,
  apiKey,
  model,
  system,
  messages,
  maxTokens = 1500,
  env,
}) {
  const resolved = resolveAIConfig({ endpointUrl, apiKey, model }, env);
  const provider = buildProvider(resolved);
  const result = streamText({
    model: provider(resolved.model),
    system: system || undefined,
    messages,
    maxOutputTokens: maxTokens,
  });
  return result.textStream;
}

/**
 * Strip ```json fences and parse. Tolerates missing closing fence and
 * extracts the first JSON object/array if surrounded by prose.
 * Throws on parse failure.
 */
export function parseJSON(text) {
  let t = String(text || '').trim();

  // 1. Closed fence: ```json ... ```
  const closed = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (closed) t = closed[1].trim();
  else {
    // 2. Open fence (no closing): ```json ... <eof>
    const open = t.match(/```(?:json)?\s*([\s\S]*)$/);
    if (open) t = open[1].trim();
  }

  // 3. Extract first balanced { ... } or [ ... ] if there's leading/trailing prose
  try {
    return JSON.parse(t);
  } catch (e) {
    const start = t.search(/[{[]/);
    if (start === -1) throw e;
    const open = t[start];
    const close = open === '{' ? '}' : ']';
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = start; i < t.length; i++) {
      const ch = t[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') {
        inStr = true;
        continue;
      }
      if (ch === open) depth++;
      else if (ch === close) {
        depth--;
        if (depth === 0) {
          return JSON.parse(t.slice(start, i + 1));
        }
      }
    }
    throw e;
  }
}
