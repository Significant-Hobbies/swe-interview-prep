import { useEffect, useState } from 'react';
import { Brain, X, Loader2 } from 'lucide-react';
import MarkdownViewer from './MarkdownViewer';
import { getAuthToken } from '../contexts/AuthContext';
import { loadAIConfig } from '../hooks/useAI';

interface Props {
  open: boolean;
  onClose: () => void;
  code: string;
  language: string;
  problem: string;
  conceptIds?: string[];
  problemId?: string;
}

interface GradeResult {
  grade: number;
  feedback: string;
  gaps: { concept_id: string; weakness: string }[];
  ratings: { concept_id: string; rating: string }[];
}

export default function FeynmanGate({ open, onClose, code, language, problem, conceptIds, problemId }: Props) {
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setExplanation('');
      setResult(null);
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (explanation.trim().length < 30) {
      alert('Explain in at least 30 chars. Be honest.');
      return;
    }
    setSubmitting(true);
    const token = getAuthToken();
    const config = loadAIConfig();
    try {
      const res = await fetch('/api/feynman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          explanation, code, language, problem, problemId, conceptIds, aiConfig: config,
        }),
      });
      if (!res.ok) throw new Error(`Grade failed: ${res.status}`);
      const data = await res.json();
      setResult(data);

      // Apply ratings to concept mastery
      if (data.ratings?.length && token) {
        await fetch('/api/concepts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            updates: data.ratings.map((r: any) => ({ conceptId: r.concept_id, rating: r.rating })),
          }),
        });
      }
      // Activity log
      if (token) {
        fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            kind: 'feynman',
            problemId, conceptIds,
            payload: { grade: data.grade, gaps: data.gaps },
          }),
        }).catch(() => {});
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => {
    const token = getAuthToken();
    if (token) {
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ kind: 'feynman_skip', problemId, conceptIds }),
      }).catch(() => {});
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-purple-900/50 bg-gray-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <h2 className="text-base font-semibold text-gray-100">Feynman Gate</h2>
            <span className="text-xs text-gray-600">{elapsed}s</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!result ? (
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              Explain in plain English what you just built — the core idea, the tradeoffs, complexity.
              No code. Pretend you're teaching a junior.
            </p>
            <textarea
              autoFocus
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              placeholder="The approach is… The key insight is… Time complexity is… Edge cases I handle…"
              rows={10}
              className="w-full resize-none rounded-md border border-gray-800 bg-gray-900 p-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            />
            <div className="flex items-center justify-between">
              <button
                onClick={skip}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Skip (logged)
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Grade me
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-bold ${
                result.grade >= 90 ? 'text-green-400' :
                result.grade >= 70 ? 'text-yellow-400' :
                result.grade >= 50 ? 'text-orange-400' : 'text-red-400'
              }`}>{result.grade}</span>
              <span className="text-xs text-gray-500">/ 100</span>
            </div>
            <div className="rounded-md border border-gray-800 bg-gray-900/50 p-3 text-sm text-gray-200">
              <MarkdownViewer content={result.feedback} />
            </div>
            {result.gaps?.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Gaps</h3>
                <ul className="space-y-1.5">
                  {result.gaps.map((g, i) => (
                    <li key={i} className="rounded-md border border-orange-900/30 bg-orange-950/20 px-3 py-2 text-xs">
                      <span className="font-mono text-orange-400">{g.concept_id}</span>
                      <span className="ml-2 text-gray-300">{g.weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
