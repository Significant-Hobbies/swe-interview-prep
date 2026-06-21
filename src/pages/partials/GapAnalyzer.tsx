import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Card } from '../../components/ui';
import { ARTIFACT_BY_ID } from '../../data/learning-os';
import { CONCEPT_BY_ID, useConceptMastery } from '../../hooks/useConcepts';
import { aiConfigured, analyzeGaps, type GapAnalysis } from '../../lib/aiClient';
import { analyzeGapsHeuristic } from '../../lib/heuristicGaps';

export function GapAnalyzer() {
  const { mastery } = useConceptMastery();
  const heuristic = useMemo(() => analyzeGapsHeuristic(mastery), [mastery]);
  const [aiResult, setAiResult] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const result = aiResult ?? heuristic;

  async function runAi() {
    if (!aiConfigured()) return;
    setLoading(true);
    setError('');
    try {
      const profile = {
        weakConcepts: heuristic.nextConcepts.map(n => ({
          id: n.conceptId,
          name: CONCEPT_BY_ID[n.conceptId]?.name ?? n.conceptId,
          confidence: Math.round((mastery[n.conceptId]?.confidence ?? 0) * 100),
        })),
      };
      const data = await analyzeGaps(profile);
      setAiResult({ ...data, generator: 'ai' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI analysis failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4 text-sky-400" /> Your gaps
          </div>
          <p className="mt-1 text-[11px] text-white/40">
            {result.generator === 'ai' ? 'AI synthesis' : 'Personalized from your mastery — no AI needed'}
          </p>
        </div>
        {aiConfigured() && (
          <Button tone="ghost" onClick={() => void runAi()} disabled={loading}>
            {loading ? 'Synthesizing…' : 'Deepen with AI'}
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      <p className="mt-4 text-sm leading-relaxed text-white/70">{result.summary}</p>

      {result.weakAreas?.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">Weak areas</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {result.weakAreas.map((w, i) => (
              <span key={i} className="rounded-md border border-rose-500/25 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-200">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.nextConcepts?.length > 0 && (
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">Study next</div>
          <div className="mt-2 space-y-2">
            {result.nextConcepts.map((n, i) => {
              const c = CONCEPT_BY_ID[n.conceptId];
              return (
                <Link
                  key={i}
                  to={c ? `/concepts/${n.conceptId}` : '/concepts'}
                  className="block rounded-lg border border-white/[0.08] bg-black/40 p-3 transition-colors hover:border-white/15"
                >
                  <div className="text-sm font-medium text-white">{c?.name || n.conceptId}</div>
                  <div className="text-xs text-white/45">{n.why}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {result.recommendedArtifact?.artifactId && (
        <div className="mt-4">
          <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">Build this</div>
          <Link
            to={`/playground?artifact=${result.recommendedArtifact.artifactId}`}
            className="mt-2 block rounded-lg border border-sky-500/25 bg-sky-500/10 p-3 transition-colors hover:border-sky-500/40"
          >
            <div className="text-sm font-medium text-sky-200">
              {ARTIFACT_BY_ID[result.recommendedArtifact.artifactId]?.title || result.recommendedArtifact.artifactId}
            </div>
            <div className="text-xs text-white/45">{result.recommendedArtifact.why}</div>
          </Link>
        </div>
      )}
    </Card>
  );
}