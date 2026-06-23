import { Sparkles } from 'lucide-react';

import { aiConfigured, type Critique } from '../lib/aiClient';
import { Button, color } from './ui';

export const FSRS_RATINGS = [
  { id: 'again' as const, label: 'Again', tone: 'rose' },
  { id: 'hard' as const, label: 'Hard', tone: 'amber' },
  { id: 'good' as const, label: 'Good', tone: 'blue' },
  { id: 'easy' as const, label: 'Easy', tone: 'emerald' },
];

export function ReviewRatingButtons({
  onRate,
  compact,
}: {
  onRate: (rating: (typeof FSRS_RATINGS)[number]['id']) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 text-xs text-slate-500">How well did you recall it?</div>
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {FSRS_RATINGS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onRate(r.id)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${color(r.tone).bg} ${color(r.tone).border} ${color(r.tone).text} hover:brightness-110`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function AnswerCritiquePanel({
  critique,
  critiquing,
  critiqueError,
  onCritique,
  showTrigger,
}: {
  critique: Critique | null;
  critiquing: boolean;
  critiqueError: string;
  onCritique: () => void;
  showTrigger: boolean;
}) {
  if (!showTrigger && !critique && !critiqueError) return null;

  return (
    <div>
      {showTrigger && !critique && (
        <>
          <Button tone="ghost" onClick={onCritique} disabled={critiquing}>
            <Sparkles className="h-3.5 w-3.5" /> {critiquing ? 'Grading…' : 'AI critique my answer'}
          </Button>
          {!aiConfigured() && (
            <p className="mt-1.5 text-xs text-slate-500">
              Add an AI provider in Settings to enable the critic.
            </p>
          )}
        </>
      )}
      {critiqueError && <p className="mt-1.5 text-xs text-rose-400">{critiqueError}</p>}
      {critique && <CritiqueDetails critique={critique} />}
    </div>
  );
}

function CritiqueDetails({ critique }: { critique: Critique }) {
  const tone = critique.score >= 80 ? 'emerald' : critique.score >= 55 ? 'amber' : 'rose';
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${color(tone).text}`}>{critique.score}</span>
        <span className="text-sm text-slate-300">{critique.verdict}</span>
      </div>
      {critique.missing.length > 0 && (
        <div>
          <div className="text-[11px] font-medium text-slate-500">What you missed</div>
          <ul className="mt-1 space-y-1">
            {critique.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" /> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
      {critique.strongerAnswer && (
        <div>
          <div className="text-[11px] font-medium text-slate-500">Stronger answer</div>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">{critique.strongerAnswer}</p>
        </div>
      )}
      {critique.followUps.length > 0 && (
        <div>
          <div className="text-[11px] font-medium text-slate-500">Follow-ups</div>
          <ul className="mt-1 space-y-1">
            {critique.followUps.map((f, i) => (
              <li key={i} className="text-xs text-slate-400">
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
