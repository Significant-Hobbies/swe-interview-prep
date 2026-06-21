import { Calendar, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Card } from './ui';
import { loadAIConfig } from '../hooks/useAI';
import { aiConfigured } from '../lib/aiClient';
import MarkdownViewer from './MarkdownViewer';

interface WeeklyData {
  reportMd: string;
  stats: { activityCount?: number; totalMinutes?: number; avgGrade?: number | null; feynmanCount?: number } | null;
  createdAt?: string;
}

export function WeeklyReport() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetch('/api/learning?action=weekly', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setData(d.review))
      .catch(() => {});
  }, []);

  async function regenerate(useAi: boolean) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/learning?action=weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(useAi ? { aiConfig: loadAIConfig() } : {}),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = await res.json();
      setData(json.review);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Weekly report failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-sky-400" />
          <div>
            <div className="text-sm font-semibold text-white">Weekly reality check</div>
            <div className="text-[11px] text-white/40">Heuristic by default · AI optional</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button tone="ghost" onClick={() => void regenerate(false)} disabled={loading}>
            {loading ? 'Generating…' : 'Refresh'}
          </Button>
          {aiConfigured() && (
            <Button tone="ghost" onClick={() => void regenerate(true)} disabled={loading}>
              <Sparkles className="h-3.5 w-3.5" /> AI polish
            </Button>
          )}
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      {data?.stats && (
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-4">
          <Stat label="Sessions" value={data.stats.activityCount ?? 0} />
          <Stat label="Minutes" value={data.stats.totalMinutes ?? 0} />
          <Stat label="Feynman" value={data.stats.feynmanCount ?? 0} />
        </div>
      )}

      {data?.reportMd ? (
        <div className="prose-invert mt-4 max-w-none text-sm text-white/70">
          <MarkdownViewer content={data.reportMd} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-white/45">
          Sign in and study for a few sessions — your first weekly report will appear here.
        </p>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-white">{value}</div>
    </div>
  );
}