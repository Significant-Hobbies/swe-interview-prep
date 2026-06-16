import { Loader2,Save, Settings as SettingsIcon, X } from 'lucide-react';
import { useState } from 'react';

import { type AIConfig,loadAIConfig, saveAIConfig } from '../hooks/useAI';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PRESETS: { label: string; endpointUrl: string }[] = [
  { label: 'OpenAI', endpointUrl: 'https://api.openai.com/v1' },
  { label: 'Anthropic (via OpenAI-compat)', endpointUrl: 'https://api.anthropic.com/v1' },
  { label: 'Google Gemini', endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/openai' },
  { label: 'OpenRouter', endpointUrl: 'https://openrouter.ai/api/v1' },
  { label: 'Together', endpointUrl: 'https://api.together.xyz/v1' },
  { label: 'Groq', endpointUrl: 'https://api.groq.com/openai/v1' },
];

export default function SettingsModal({ open, onClose }: Props) {
  const [config, setConfig] = useState<AIConfig>(loadAIConfig);
  const [models, setModels] = useState<string[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = () => {
    saveAIConfig(config);
    onClose();
  };

  const update = (k: keyof AIConfig, v: string) => setConfig(prev => ({ ...prev, [k]: v }));

  const fetchModels = async () => {
    if (!config.endpointUrl || !config.apiKey) {
      setError('Endpoint URL and API key required');
      return;
    }
    setError(null);
    setDiscovering(true);
    try {
      const url = config.endpointUrl.replace(/\/$/, '') + '/models';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${config.apiKey}` } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      const ids = (data.data || data.models || [])
        .map((m: any) => m.id || m.name || m)
        .filter(Boolean)
        .sort();
      if (ids.length === 0) throw new Error('No models in response');
      setModels(ids);
    } catch (e: any) {
      setError(`Discovery failed: ${e.message}`);
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-sky-400" />
            <h2 className="text-base font-semibold text-slate-100">AI Configuration</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500">
            OpenAI-compatible endpoint. Used for Companion, Tagger, Feynman, Today plan, Weekly review.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Provider preset</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => update('endpointUrl', p.endpointUrl)}
                  className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                    config.endpointUrl === p.endpointUrl
                      ? 'bg-sky-500/15 text-sky-300'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Endpoint URL</label>
            <input
              type="url"
              value={config.endpointUrl}
              onChange={e => update('endpointUrl', e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={e => update('apiKey', e.target.value)}
              placeholder="sk-…"
              autoComplete="off"
              className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40 font-mono"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-400">Model</label>
              <button
                onClick={fetchModels}
                disabled={discovering}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 disabled:opacity-50"
              >
                {discovering ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {discovering ? 'Fetching…' : 'Discover models'}
              </button>
            </div>
            {models.length > 0 ? (
              <select
                value={config.model}
                onChange={e => update('model', e.target.value)}
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
              >
                <option value="">Select…</option>
                {models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={config.model}
                onChange={e => update('model', e.target.value)}
                placeholder="gpt-4o-mini"
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40 font-mono"
              />
            )}
          </div>

          {error && (
            <div className="rounded-md border border-red-900 bg-red-950/30 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
