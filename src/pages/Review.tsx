import { useEffect, useState } from 'react';
import { Brain, RefreshCw, Loader2 } from 'lucide-react';
import { getAuthToken } from '../contexts/AuthContext';
import { loadAIConfig } from '../hooks/useAI';
import MarkdownViewer from '../components/MarkdownViewer';

interface ReviewData {
  reportMd: string;
  stats: { activityCount: number; totalMinutes: number; avgGrade: number | null; feynmanCount: number };
  createdAt: string;
}

export default function Review() {
  const [review, setReview] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { setLoading(false); return; }
    fetch('/api/learning?action=weekly', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setReview(d.review); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    const token = getAuthToken();
    const config = loadAIConfig();
    if (!token) { setError('Sign in required'); setGenerating(false); return; }
    if (!config.model) { setError('Configure AI first'); setGenerating(false); return; }
    try {
      const res = await fetch('/api/learning?action=weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aiConfig: config }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReview(data.review);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-100">
            <Brain className="h-6 w-6 text-purple-400" /> Weekly Review
          </h1>
          <p className="mt-1 text-sm text-gray-500">Brutal but useful.</p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {review ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {error && <div className="mb-4 rounded border border-red-800 bg-red-950/30 p-3 text-sm text-red-400">{error}</div>}

      {!review ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-8 text-center text-gray-500">
          No review yet. Generate one once you've logged some sessions.
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Sessions" value={review.stats.activityCount} />
            <Stat label="Minutes" value={review.stats.totalMinutes} />
            <Stat label="Feynmans" value={review.stats.feynmanCount} />
            <Stat label="Avg Grade" value={review.stats.avgGrade ?? '—'} />
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <MarkdownViewer content={review.reportMd} />
          </div>
          <p className="mt-3 text-xs text-gray-600">Generated {new Date(review.createdAt).toLocaleString()}</p>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="text-xl font-bold text-gray-100">{value}</div>
    </div>
  );
}
