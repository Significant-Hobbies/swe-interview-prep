import { ArrowLeft, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  buildDailyLearningSession,
  LEARNING_SOURCES,
  rateLearningItem,
  type LearningItem,
} from '../data/learning-sources';
import { useReaderLearning } from '../hooks/useReaderLearning';
import { recordSessionActivity } from '../lib/session';

type Phase = 'study' | 'questions' | 'done';

export default function DailyLearningSession() {
  const { date = new Date().toISOString().slice(0, 10), sessionId = '1' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sourceId = searchParams.get('source') || undefined;
  const reader = useReaderLearning();
  const plan = useMemo(
    () => buildDailyLearningSession(`${date}:${sessionId}`, reader.items, sourceId),
    [date, sessionId, reader.items, sourceId]
  );
  const sources = useMemo(() => {
    const dynamic = reader.source ? [reader.source] : [];
    return [
      ...LEARNING_SOURCES.sources.filter((source) => source.id !== 'reader'),
      ...dynamic,
    ].filter((source) => source.itemCount > 0 && source.kind !== 'native');
  }, [reader.source]);
  const assessments = plan.items.flatMap((item) =>
    (item.assessments || []).map((assessment) => ({ item, assessment }))
  );
  const [phase, setPhase] = useState<Phase>('study');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reflection, setReflection] = useState('');

  const correct = assessments.filter(
    ({ assessment }) => answers[assessment.id] === assessment.correctIndex
  ).length;
  const score = assessments.length ? correct / assessments.length : 0;

  function finish() {
    const rating =
      score === 1 && reflection.trim().length >= 30 ? 'good' : score >= 0.5 ? 'hard' : 'again';
    for (const item of plan.items) rateLearningItem(item.id, rating);
    recordSessionActivity('external_learning_session');
    setPhase('done');
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/today"
          className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Today
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
          <Clock className="h-3.5 w-3.5" /> 30 minute session · {date}
        </span>
      </div>

      <header className="mt-10 border-b border-white/10 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky-300/70">
          Daily learning session
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Learn, recall, schedule.
        </h1>
        <div className="mt-6 max-w-md">
          <label className="mb-2 block text-xs text-white/40">Choose what you want today</label>
          <select
            value={sourceId || ''}
            onChange={(event) =>
              navigate(
                `/session/${date}/${sessionId}${event.target.value ? `?source=${encodeURIComponent(event.target.value)}` : ''}`
              )
            }
            className="h-11 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white/70 outline-none focus:border-sky-400/50"
          >
            <option value="">Balanced: High Signal + due learning</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label} · {source.itemCount} items
              </option>
            ))}
          </select>
        </div>
      </header>

      {phase === 'study' && (
        <StudyPhase
          items={plan.items}
          minutes={plan.studyMinutes}
          onContinue={() => setPhase('questions')}
        />
      )}
      {phase === 'questions' && (
        <section className="py-10">
          <div className="mb-8">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">
              Final {plan.reviewMinutes} minutes
            </span>
            <h2 className="mt-2 text-2xl font-semibold text-white">Questions before scheduling</h2>
          </div>
          <div className="space-y-8">
            {assessments.map(({ assessment }) => (
              <div key={assessment.id} className="border-b border-white/10 pb-8">
                <p className="text-base font-medium leading-7 text-white">{assessment.question}</p>
                <div className="mt-4 grid gap-2">
                  {assessment.options.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAnswers((current) => ({ ...current, [assessment.id]: index }))
                      }
                      className={`rounded-md border px-4 py-3 text-left text-sm leading-6 ${answers[assessment.id] === index ? 'border-sky-400/50 bg-sky-400/10 text-white' : 'border-white/10 text-white/55 hover:border-white/25'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <label className="block">
              <span className="text-base font-medium text-white">
                What will you remember or apply from this session?
              </span>
              <textarea
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                rows={5}
                className="mt-4 w-full rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white outline-none focus:border-sky-400/50"
                placeholder="Explain it in your own words…"
              />
            </label>
          </div>
          <button
            type="button"
            disabled={
              (assessments.length > 0 && Object.keys(answers).length < assessments.length) ||
              reflection.trim().length < 10
            }
            onClick={finish}
            className="mt-8 h-11 rounded-md bg-sky-400 px-5 text-sm font-semibold text-black disabled:opacity-40"
          >
            Finish and schedule reviews
          </button>
        </section>
      )}
      {phase === 'done' && (
        <section className="py-20 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
          <h2 className="mt-5 text-3xl font-bold text-white">Session complete</h2>
          <p className="mt-3 text-sm text-white/50">
            {score === 1
              ? 'Strong recall. FSRS will wait longer before resurfacing this.'
              : score >= 0.5
                ? 'Partial recall. These items will return sooner.'
                : 'Weak recall. These items are back in the near-term queue.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={`/session/${date}/${Date.now()}${sourceId ? `?source=${encodeURIComponent(sourceId)}` : ''}`}
              className="inline-flex h-11 items-center rounded-md bg-white px-5 text-sm font-semibold text-black"
            >
              Start another session
            </Link>
            <Link
              to="/today"
              className="inline-flex h-11 items-center rounded-md border border-white/15 px-5 text-sm text-white hover:bg-white/5"
            >
              Back to Today
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

function StudyPhase({
  items,
  minutes,
  onContinue,
}: {
  items: LearningItem[];
  minutes: number;
  onContinue: () => void;
}) {
  return (
    <section className="py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Study</h2>
        <span className="font-mono text-xs text-white/35">{minutes} minutes</span>
      </div>
      <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="flex min-h-56 flex-col bg-black p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
              {item.project || item.collection || item.sourceKind}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/50">{item.summary}</p>
            <a
              href={item.canonicalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-sky-300 hover:text-sky-200"
            >
              Open source <ExternalLink className="h-4 w-4" />
            </a>
          </article>
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-8 h-11 rounded-md bg-white px-5 text-sm font-semibold text-black"
      >
        I studied these · ask me questions
      </button>
    </section>
  );
}
