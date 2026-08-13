import { Bot, KeyRound, ShieldCheck } from 'lucide-react';

import type { SoloTradeoffAIConfig } from '../lib/soloTradeoffAI';
import { soloTradeoffAIConfigured } from '../lib/soloTradeoffAI';
import { Button, Card } from './ui';

export function SoloTradeoffSetup({
  config,
  onChange,
  onStart,
  busy,
  error,
}: {
  config: SoloTradeoffAIConfig;
  onChange: (config: SoloTradeoffAIConfig) => void;
  onStart: () => void;
  busy: boolean;
  error?: string;
}) {
  const update = (key: keyof SoloTradeoffAIConfig, value: string) =>
    onChange({ ...config, [key]: value });

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Bot className="h-5 w-5 text-sky-300" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
          Unranked · 30:00
        </span>
      </div>
      <h2 className="mt-4 font-medium text-white">Take it solo with AI</h2>
      <p className="mt-2 text-sm leading-6 text-white/50">
        Your opponent independently solves the brief, absorbs the same twist, then debates and
        reviews the frozen designs.
      </p>

      <div className="mt-5 grid gap-3">
        <label className="grid gap-1.5 text-xs text-white/55">
          OpenAI-compatible endpoint
          <input
            type="url"
            value={config.endpointUrl}
            onChange={(event) => update('endpointUrl', event.target.value)}
            placeholder="https://openrouter.ai/api/v1"
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-sky-300/40"
          />
        </label>
        <label className="grid gap-1.5 text-xs text-white/55">
          Model
          <input
            value={config.model}
            onChange={(event) => update('model', event.target.value)}
            placeholder="openai/gpt-4.1-mini"
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 rounded-md border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-sky-300/40"
          />
        </label>
        <label className="grid gap-1.5 text-xs text-white/55">
          API key
          <span className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={config.apiKey}
              onChange={(event) => update('apiKey', event.target.value)}
              placeholder="Stored only until this tab reloads"
              autoComplete="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              className="min-h-11 w-full rounded-md border border-white/10 bg-black py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-sky-300/40"
            />
          </span>
        </label>
      </div>

      <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-white/40">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300/70" />
        The key goes directly from this browser to that endpoint. SWE Prep does not receive or save
        it. Reloading clears the AI session.
      </div>
      {error && (
        <p role="alert" className="mt-3 text-xs leading-5 text-amber-200/80">
          {error}
        </p>
      )}
      <Button
        onClick={onStart}
        disabled={busy || !soloTradeoffAIConfigured(config)}
        className="mt-5 w-full"
      >
        {busy ? 'Preparing an independent opponent…' : 'Start solo session'}
      </Button>
    </Card>
  );
}
