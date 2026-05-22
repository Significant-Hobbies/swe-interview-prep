import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button, Card } from '../../components/ui';
import { ARTIFACT_BY_ID, conceptsByTrack, sortedTracks } from '../../data/learning-os';
import { CONCEPT_BY_ID, useConceptMastery } from '../../hooks/useConcepts';
import { aiConfigured, analyzeGaps, type GapAnalysis } from '../../lib/aiClient';
import { rollupMastery } from '../../lib/conceptState';
import { weakConcepts } from '../../lib/recommend';

/** AI Gap Analyzer — sends the mastery profile to the BYOK model. */
export function GapAnalyzer() {
  const { mastery } = useConceptMastery();
  const [result, setResult] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setLoading(true);
    setError('');
    try {
      const profile = {
        tracks: sortedTracks().map(t => {
          const ids = conceptsByTrack(t.id).map(c => c.id);
          const roll = rollupMastery(ids, mastery);
          return { track: t.id, total: ids.length, started: ids.length - roll.untouched, mastered: roll.mastered };
        }),
        weakConcepts: weakConcepts(mastery, 10).map(c => ({
          id: c.id,
          name: c.name,
          confidence: Math.round((mastery[c.id]?.confidence ?? 0) * 100),
        })),
      };
      setResult(await analyzeGaps(profile));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gap analysis failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-200">
          <Sparkles className="h-4 w-4" /> AI Gap Analyzer
        </div>
        <Button tone="ghost" onClick={() => void run()} disabled={loading}>
          {loading ? 'Analyzing…' : result ? 'Re-analyze' : 'Analyze my gaps'}
        </Button>
      </div>

      {!result && !error && (
        <p className="mt-2 text-xs text-gray-500">
          {aiConfigured()
            ? 'Sends your mastery profile to your AI provider and returns weak areas, the next concepts to study, and an artifact to build.'
            : 'Add an AI provider in Settings to enable the Gap Analyzer.'}
        </p>
      )}

      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

      {result && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-gray-300">{result.summary}</p>

          {result.weakAreas?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Weak areas</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {result.weakAreas.map((w, i) => (
                  <span key={i} className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] text-rose-300">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.nextConcepts?.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Study next</div>
              <div className="mt-1 space-y-1.5">
                {result.nextConcepts.map((n, i) => {
                  const c = CONCEPT_BY_ID[n.conceptId];
                  return (
                    <Link
                      key={i}
                      to={c ? `/concepts/${n.conceptId}` : '/concepts'}
                      className="block rounded-md border border-gray-800 bg-gray-950 p-2 hover:border-gray-700"
                    >
                      <div className="text-sm font-medium text-white">{c?.name || n.conceptId}</div>
                      <div className="text-xs text-gray-500">{n.why}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {result.recommendedArtifact?.artifactId && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Build this</div>
              <Link to="/build" className="mt-1 block rounded-md border border-purple-500/30 bg-purple-500/10 p-2">
                <div className="text-sm font-medium text-purple-200">
                  {ARTIFACT_BY_ID[result.recommendedArtifact.artifactId]?.title || result.recommendedArtifact.artifactId}
                </div>
                <div className="text-xs text-gray-400">{result.recommendedArtifact.why}</div>
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
