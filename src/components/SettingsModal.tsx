import { Loader2, Save, Settings as SettingsIcon, User, X } from 'lucide-react';
import { useState } from 'react';

import { ImportAndNotifySettings } from './ImportAndNotifySettings';
import { LearningProfileSettings } from './LearningProfileSettings';
import { type AIConfig, loadAIConfig, saveAIConfig } from '../hooks/useAI';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'profile' | 'import' | 'ai';

const PRESETS: { label: string; endpointUrl: string }[] = [
  { label: 'OpenAI', endpointUrl: 'https://api.openai.com/v1' },
  { label: 'Anthropic (via OpenAI-compat)', endpointUrl: 'https://api.anthropic.com/v1' },
  {
    label: 'Google Gemini',
    endpointUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  },
  { label: 'OpenRouter', endpointUrl: 'https://openrouter.ai/api/v1' },
  { label: 'Together', endpointUrl: 'https://api.together.xyz/v1' },
  { label: 'Groq', endpointUrl: 'https://api.groq.com/openai/v1' },
];

export default function SettingsModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('profile');
  const [config, setConfig] = useState<AIConfig>(loadAIConfig);
  const [models, setModels] = useState<string[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSaveAi = () => {
    saveAIConfig(config);
    onClose();
  };

  const update = (k: keyof AIConfig, v: string) => setConfig((prev) => ({ ...prev, [k]: v }));

  const fetchModels = async () => {
    if (!config.endpointUrl || !config.apiKey) {
      setError('Endpoint URL and API key required');
      return;
    }
    setError(null);
    setDiscovering(true);
    try {
      const url = `${config.endpointUrl.replace(/\/$/, '')}/models`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${config.apiKey}` } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      const ids = (data.data || data.models || [])
        .map((m: { id?: string; name?: string }) => m.id || m.name || m)
        .filter(Boolean)
        .sort();
      if (ids.length === 0) throw new Error('No models in response');
      setModels(ids);
    } catch (e: unknown) {
      setError(`Discovery failed: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setDiscovering(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4 text-sky-400" />
            <h2 className="text-base font-semibold text-slate-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-800 px-5 gap-4">
          <button
            type="button"
            onClick={() => setTab('profile')}
            className={`flex items-center gap-1.5 border-b-2 py-3 text-sm transition-colors ${
              tab === 'profile'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <User className="h-3.5 w-3.5" /> Learning
          </button>
          <button
            type="button"
            onClick={() => setTab('import')}
            className={`flex items-center gap-1.5 border-b-2 py-3 text-sm transition-colors ${
              tab === 'import'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <SettingsIcon className="h-3.5 w-3.5" /> Import
          </button>
          <button
            type="button"
            onClick={() => setTab('ai')}
            className={`flex items-center gap-1.5 border-b-2 py-3 text-sm transition-colors ${
              tab === 'ai'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <SettingsIcon className="h-3.5 w-3.5" /> AI (optional)
          </button>
        </div>

        <div className="p-5">
          {tab === 'profile' ? (
            <LearningProfileSettings />
          ) : tab === 'import' ? (
            <ImportAndNotifySettings />
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                BYOK only. Heuristic planning works without AI. Use for Companion, Feynman, and
                optional polish.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Provider preset
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
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
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={config.endpointUrl}
                  onChange={(e) => update('endpointUrl', e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => update('apiKey', e.target.value)}
                  placeholder="sk-…"
                  autoComplete="off"
                  className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40 font-mono"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-400">Model</label>
                  <button
                    type="button"
                    onClick={() => void fetchModels()}
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
                    onChange={(e) => update('model', e.target.value)}
                    className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                  >
                    <option value="">Select…</option>
                    {models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => update('model', e.target.value)}
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
                type="button"
                onClick={handleSaveAi}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400"
              >
                <Save className="h-4 w-4" />
                Save AI config
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
