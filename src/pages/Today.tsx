import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, RefreshCw, FlaskConical, Brain, Loader2, Network } from 'lucide-react';
import { getAuthToken } from '../contexts/AuthContext';
import { loadAIConfig } from '../hooks/useAI';
import { CONCEPT_BY_ID } from '../hooks/useConcepts';
import MarkdownViewer from '../components/MarkdownViewer';

interface DailyPlan {
  headline: string;
  concept_id: string;
  concept_name: string;
  task_type: 'build' | 'review' | 'read' | 'explain';
  task_prompt: string;
  minutes: number;
  rationale: string;
}

interface WeeklyReview {
  reportMd: string;
  stats: any;
  createdAt: string;
}

export default function Today() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekly, setWeekly] = useState<WeeklyReview | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) { setLoading(false); return; }
    fetch('/api/daily', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setPlan(d.plan); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/weekly', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setWeekly(d.review))
      .catch(() => {});
  }, []);

  const generate = async (force = false) => {
    setGenerating(true);
    setError(null);
    const token = getAuthToken();
    const config = loadAIConfig();
    if (!token) { setError('Sign in required'); setGenerating(false); return; }
    if (!config.model) { setError('Configure AI first'); setGenerating(false); return; }
    try {
      const res = await fetch('/api/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ aiConfig: config, force }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPlan(data.plan);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const startTask = () => {
    if (!plan) return;
    const params = new URLSearchParams({
      concept: plan.concept_id,
      task: plan.task_type,
      prompt: plan.task_prompt,
    });
    navigate(`/playground?${params}`);
  };

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-600" /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Today</h1>
          <p className="mt-1 text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link
          to="/concepts"
          className="flex items-center gap-1.5 rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-900 hover:text-gray-200"
        >
          <Network className="h-3.5 w-3.5" /> Concept Graph
        </Link>
      </div>

      {!plan ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8 text-center">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-purple-400" />
          <h2 className="mb-2 text-lg font-medium text-gray-200">No plan yet for today</h2>
          <p className="mb-5 text-sm text-gray-500">Generate one based on your weakest concepts.</p>
          <button
            onClick={() => generate()}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate today's plan
          </button>
          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-br from-purple-950/30 to-gray-950 p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-400">
              <Sparkles className="h-3 w-3" />
              {plan.task_type} · {plan.minutes}min
            </div>
            <button
              onClick={() => generate(true)}
              disabled={generating}
              className="text-gray-500 hover:text-gray-300 disabled:opacity-30"
              title="Regenerate"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-100 sm:text-2xl">{plan.headline}</h2>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-700/30 bg-purple-900/20 px-3 py-1 text-xs text-purple-300">
            <span className="font-medium">{plan.concept_name || CONCEPT_BY_ID[plan.concept_id]?.name || plan.concept_id}</span>
          </div>
          <div className="mt-5 rounded-lg border border-gray-800 bg-black/30 p-4 text-sm text-gray-200">
            <MarkdownViewer content={plan.task_prompt} />
          </div>
          <p className="mt-3 text-xs italic text-gray-500">{plan.rationale}</p>
          <div className="mt-6 flex gap-2">
            <button
              onClick={startTask}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-sm font-medium text-white hover:bg-purple-700"
            >
              <FlaskConical className="h-4 w-4" /> Start in Playground
            </button>
            <Link
              to="/review"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-800 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-900 hover:text-gray-200"
            >
              <Brain className="h-4 w-4" /> Weekly Review
            </Link>
          </div>
        </div>
      )}

      {weekly && (
        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900/40 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-200">Last weekly review</h3>
            <span className="text-xs text-gray-500">{new Date(weekly.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="prose prose-sm prose-invert max-w-none text-sm text-gray-300">
            <MarkdownViewer content={weekly.reportMd.split('\n').slice(0, 6).join('\n')} />
          </div>
          <Link to="/review" className="mt-2 inline-block text-xs text-purple-400 hover:underline">Read full review →</Link>
        </div>
      )}
    </div>
  );
}
