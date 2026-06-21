import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROADMAPS } from '../data/learning-os';
import { saveActiveRoadmapId } from '../lib/recommend';
import { STORE_KEYS, saveLocal } from '../lib/userStore';

const PATHS = [
  {
    id: 'ai-search-infra-90-day',
    title: 'AI Search & RAG',
    subtitle: 'BM25 → vectors → hybrid → evals → production RAG',
    emoji: '🔍',
  },
  {
    id: 'prob-stats-30d',
    title: 'Probability & Statistics',
    subtitle: 'Active math gym — hypothesis testing before evals',
    emoji: '📊',
  },
  {
    id: 'math-stack-12w',
    title: 'Math Stack (12 weeks)',
    subtitle: 'Prob/stats → linear algebra → quant bridge',
    emoji: '🧮',
  },
  {
    id: 'reset-9-day',
    title: '9-Day Reset',
    subtitle: 'Short sprint — ship one BM25 artifact fast',
    emoji: '⚡',
  },
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<string>(PATHS[0].id);

  function finish() {
    const exists = ROADMAPS.some(r => r.id === picked);
    saveActiveRoadmapId(exists ? picked : 'ai-search-infra-90-day');
    saveLocal(STORE_KEYS.onboarding, { done: true, roadmapId: picked, at: new Date().toISOString() });
    navigate('/today', { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Welcome</p>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">Pick your path.</h1>
      <p className="mt-3 text-sm text-white/50">
        Like roadmap.sh — one role, one graph, one &quot;what next&quot;. You can switch any time.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {PATHS.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPicked(p.id)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              picked === p.id
                ? 'border-white/30 bg-white/[0.06]'
                : 'border-white/[0.08] bg-black hover:border-white/15'
            }`}
          >
            <div className="text-lg">{p.emoji}</div>
            <div className="mt-2 text-sm font-semibold text-white">{p.title}</div>
            <div className="mt-1 text-xs text-white/50">{p.subtitle}</div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={finish}
        className="mt-10 w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-white/90 sm:w-auto sm:px-10"
      >
        Start today&apos;s plan
      </button>
    </div>
  );
}