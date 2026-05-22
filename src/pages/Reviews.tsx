import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, color, EmptyState, PageHeader, PageShell, StatTile } from '../components/ui';
import { CONCEPT_BY_ID, REVIEW_QUESTIONS, type ReviewQuestion } from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { aiConfigured, type Critique,critiqueAnswer } from '../lib/aiClient';
import { isDue } from '../lib/conceptState';

const RATINGS: { id: 'again' | 'hard' | 'good' | 'easy'; label: string; tone: string }[] = [
  { id: 'again', label: 'Again', tone: 'rose' },
  { id: 'hard', label: 'Hard', tone: 'amber' },
  { id: 'good', label: 'Good', tone: 'blue' },
  { id: 'easy', label: 'Easy', tone: 'emerald' },
];

export default function Reviews() {
  const { mastery, review } = useConceptMastery();
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [done, setDone] = useState<Set<string>>(new Set());
  const [critique, setCritique] = useState<Critique | null>(null);
  const [critiquing, setCritiquing] = useState(false);
  const [critiqueError, setCritiqueError] = useState('');

  // Due = the concept's spaced-repetition is due. Practice = concept touched
  // but not yet due — so the page is useful before reviews come around.
  const { queue, mode } = useMemo(() => {
    const due = REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId]) && !done.has(q.id));
    if (due.length) return { queue: due, mode: 'due' as const };
    const practice = REVIEW_QUESTIONS.filter(q => mastery[q.conceptId] && !done.has(q.id));
    return { queue: practice, mode: 'practice' as const };
  }, [mastery, done]);

  const current: ReviewQuestion | undefined = queue[0];
  const dueCount = REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId])).length;

  function next(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!current) return;
    void review(current.conceptId, rating);
    setDone(prev => new Set(prev).add(current.id));
    setRevealed(false);
    setAnswer('');
    setCritique(null);
    setCritiqueError('');
  }

  async function runCritique() {
    if (!current) return;
    setCritiquing(true);
    setCritiqueError('');
    try {
      setCritique(await critiqueAnswer(current.question, answer, current.answer));
    } catch (e) {
      setCritiqueError(e instanceof Error ? e.message : 'Critique failed.');
    } finally {
      setCritiquing(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reviews"
        title="Spaced Repetition"
        subtitle="Recall, don't reread. Write your answer first, then reveal — and let the AI critic grade it honestly."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile label="Due now" value={dueCount} tone={dueCount ? 'amber' : 'emerald'} />
        <StatTile label="Reviewed today" value={done.size} tone="cyan" />
        <StatTile label="Concepts tracked" value={Object.keys(mastery).length} tone="purple" />
      </div>

      {!current ? (
        <EmptyState
          icon={<CheckCircle2 className="h-8 w-8 text-emerald-400" />}
          title={done.size > 0 ? 'All caught up — nice run.' : 'No reviews yet'}
          hint="Reviews seed as you rate concepts, solve drills, and ship artifacts. Start a concept to get the schedule going."
        />
      ) : (
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Badge tone="cyan">{current.type}</Badge>
              {mode === 'practice' && <Badge tone="gray">practice</Badge>}
            </div>
            <Link to={`/concepts/${current.conceptId}`} className="text-xs text-gray-500 hover:text-gray-300">
              {CONCEPT_BY_ID[current.conceptId]?.name}
            </Link>
          </div>
          <h2 className="text-lg font-semibold text-white">{current.question}</h2>

          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write your answer from memory…"
            rows={4}
            disabled={revealed}
            className="mt-3 w-full resize-y rounded-md border border-gray-800 bg-gray-950 p-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none disabled:opacity-70"
          />

          {!revealed ? (
            <div className="mt-3">
              <Button onClick={() => setRevealed(true)}>
                <RotateCcw className="h-4 w-4" /> Reveal answer
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Reference answer</div>
                <p className="text-sm leading-relaxed text-gray-300">{current.answer}</p>
              </div>

              {answer.trim() && (
                <div>
                  {!critique && (
                    <Button tone="ghost" onClick={() => void runCritique()} disabled={critiquing}>
                      <Sparkles className="h-3.5 w-3.5" /> {critiquing ? 'Grading…' : 'AI critique my answer'}
                    </Button>
                  )}
                  {!aiConfigured() && !critique && (
                    <p className="mt-1.5 text-xs text-gray-600">
                      Add an AI provider in Settings to enable the critic.
                    </p>
                  )}
                  {critiqueError && <p className="mt-1.5 text-xs text-rose-400">{critiqueError}</p>}
                  {critique && <CritiquePanel critique={critique} />}
                </div>
              )}

              <div>
                <div className="mb-2 text-xs text-gray-500">How well did you recall it?</div>
                <div className="flex flex-wrap gap-2">
                  {RATINGS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => next(r.id)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium ${color(r.tone).bg} ${color(r.tone).border} ${color(r.tone).text}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {current && queue.length > 1 && (
        <p className="mt-4 text-center text-xs text-gray-600">{queue.length - 1} more in the queue</p>
      )}
    </PageShell>
  );
}

function CritiquePanel({ critique }: { critique: Critique }) {
  const tone = critique.score >= 80 ? 'emerald' : critique.score >= 55 ? 'amber' : 'rose';
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${color(tone).text}`}>{critique.score}</span>
        <span className="text-sm text-gray-300">{critique.verdict}</span>
      </div>
      {critique.missing && critique.missing.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">What you missed</div>
          <ul className="mt-1 space-y-1">
            {critique.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" /> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
      {critique.strongerAnswer && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Stronger answer</div>
          <p className="mt-1 text-xs leading-relaxed text-gray-300">{critique.strongerAnswer}</p>
        </div>
      )}
      {critique.followUps && critique.followUps.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Follow-ups</div>
          <ul className="mt-1 space-y-1">
            {critique.followUps.map((f, i) => (
              <li key={i} className="text-xs text-gray-400">{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
