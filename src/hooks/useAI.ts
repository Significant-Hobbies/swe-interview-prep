export interface AIConfig {
  endpointUrl: string;
  apiKey: string;
  model: string;
}

// Local AI providers that don't need API keys (dev only)
export const LOCAL_PROVIDERS = new Set(['claude-code', 'codex', 'gemini-cli']);
export const IS_LOCAL = import.meta.env.DEV;

const STORAGE_KEY = 'dsa-prep-ai-config';

function readConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { endpointUrl: '', apiKey: '', model: '' };
    const parsed = JSON.parse(raw);
    return {
      endpointUrl: parsed.endpointUrl || '',
      apiKey: parsed.apiKey || '',
      model: parsed.model || '',
    };
  } catch {
    return { endpointUrl: '', apiKey: '', model: '' };
  }
}

export function loadAIConfig(): AIConfig {
  const config = readConfig();
  // If dev mode and config is empty, default to the local codex CLI.
  // The model MUST be a key in LOCAL_PROVIDERS or the dispatcher falls through
  // to the remote path (which has no endpoint and fails). 'codex' rides your
  // `codex login` (Sign in with ChatGPT) — no API key needed.
  if (IS_LOCAL && !config.endpointUrl && !config.apiKey && !config.model) {
    return { endpointUrl: '', apiKey: '', model: 'codex' };
  }
  return config;
}

export function saveAIConfig(config: AIConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
