import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, color, EmptyState, PageHeader, PageShell, StatTile } from '../components/ui';
import { CONCEPT_BY_ID, REVIEW_QUESTIONS, type ReviewQuestion } from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
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
  const [done, setDone] = useState<Set<string>>(new Set());

  // Questions due now = parent concept's spaced-repetition is due.
  const due = useMemo(
    () => REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId]) && !done.has(q.id)),
    [mastery, done],
  );
  const current: ReviewQuestion | undefined = due[0];
  const touched = Object.keys(mastery).length;

  function rate(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!current) return;
    review(current.conceptId, rating);
    setDone(prev => new Set(prev).add(current.id));
    setRevealed(false);
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Reviews"
        title="Spaced Repetition"
        subtitle="Recall, don't reread. Answer in your head before revealing — then rate yourself honestly."
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile label="Due now" value={due.length} tone={due.length ? 'amber' : 'emerald'} />
        <StatTile label="Reviewed today" value={done.size} tone="cyan" />
        <StatTile label="Concepts tracked" value={touched} tone="purple" />
      </div>

      {!current ? (
        <EmptyState
          icon={<CheckCircle2 className="h-8 w-8 text-emerald-400" />}
          title={due.length === 0 && done.size > 0 ? 'All caught up — nice run.' : 'Nothing due for review'}
          hint="Reviews appear here once you start rating concepts. Open a concept and log a self-review to seed the schedule."
        />
      ) : (
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <Badge tone="cyan">{current.type}</Badge>
            <Link to={`/concepts/${current.conceptId}`} className="text-xs text-gray-500 hover:text-gray-300">
              {CONCEPT_BY_ID[current.conceptId]?.name}
            </Link>
          </div>
          <h2 className="text-lg font-semibold text-white">{current.question}</h2>

          {revealed ? (
            <div className="mt-4">
              <div className="rounded-lg border border-gray-800 bg-gray-950 p-4 text-sm leading-relaxed text-gray-300">
                {current.answer}
              </div>
              <div className="mt-4">
                <div className="mb-2 text-xs text-gray-500">How well did you recall it?</div>
                <div className="flex flex-wrap gap-2">
                  {RATINGS.map(r => (
                    <button
                      key={r.id}
                      onClick={() => rate(r.id)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium ${color(r.tone).bg} ${color(r.tone).border} ${color(r.tone).text}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5">
              <Button onClick={() => setRevealed(true)}>
                <RotateCcw className="h-4 w-4" /> Reveal answer
              </Button>
            </div>
          )}
        </Card>
      )}

      {current && due.length > 1 && (
        <p className="mt-4 text-center text-xs text-gray-600">{due.length - 1} more in the queue</p>
      )}
    </PageShell>
  );
}
