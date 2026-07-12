import { ArrowLeft, ArrowRight, CheckCircle2, Clock, ExternalLink, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import {
  LEARNING_ITEM_BY_ID,
  LEARNING_SOURCES,
  loadLearningProgress,
  saveLearningProgress,
} from '../data/learning-sources';
import { recordSessionActivity } from '../lib/session';
import { useReaderLearning } from '../hooks/useReaderLearning';

export default function LearningSourceDetail() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const sprint = searchParams.get('mode') === 'sprint';
  const reader = useReaderLearning();
  const allItems = useMemo(() => [...LEARNING_SOURCES.items, ...reader.items], [reader.items]);
  const item = LEARNING_ITEM_BY_ID[id] || reader.items.find((candidate) => candidate.id === id);
  const assessment = item?.assessments?.[0];
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const initialProgress = useMemo(() => loadLearningProgress()[id], [id]);
  const [completed, setCompleted] = useState(initialProgress?.status === 'completed');

  if (!item && reader.loading)
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-white/50">Loading learning session…</main>
    );
  if (!item)
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-bold text-white">Learning item not found</h1>
        <Link to="/sources" className="mt-6 inline-flex text-sky-300">
          Back to all sources
        </Link>
      </main>
    );
  const correct = assessment && selected === assessment.correctIndex;
  const sameSource = allItems.filter((candidate) => candidate.sourceId === item.sourceId);
  const itemIndex = sameSource.findIndex((candidate) => candidate.id === item.id);
  const next = sameSource[itemIndex + 1];

  function markComplete() {
    const progress = loadLearningProgress();
    const now = new Date().toISOString();
    progress[item.id] = {
      status: 'completed',
      startedAt: progress[item.id]?.startedAt || now,
      completedAt: now,
      attempts: (progress[item.id]?.attempts || 0) + (submitted ? 1 : 0),
      correctAnswers: (progress[item.id]?.correctAnswers || 0) + (correct ? 1 : 0),
    };
    saveLearningProgress(progress);
    recordSessionActivity('external_learning');
    setCompleted(true);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/sources"
          className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All learning sources
        </Link>
        {sprint && (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-400/25 bg-sky-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-sky-300">
            <Zap className="h-3.5 w-3.5" /> Sprint mode · {itemIndex + 1}/{sameSource.length}
          </span>
        )}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            <span>{item.project || item.collection || item.sourceKind}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {item.estimatedMinutes} min
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">{item.summary}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {item.tracks.map((track) => (
              <span
                key={track}
                className="rounded-sm border border-white/10 px-2 py-1 text-xs text-white/40"
              >
                {track}
              </span>
            ))}
          </div>

          <section className="mt-12 border-t border-white/10 pt-10">
            <h2 className="text-xl font-semibold text-white">1. Study the source</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              The original remains canonical. Read it there, then return for active recall.
            </p>
            <a
              href={item.canonicalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-white/90"
            >
              Open original source <ExternalLink className="h-4 w-4" />
            </a>
          </section>

          <section className="mt-12 border-t border-white/10 pt-10">
            <h2 className="text-xl font-semibold text-white">2. Check recall</h2>
            {assessment ? (
              <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.025] p-5 sm:p-6">
                <p className="text-base font-medium leading-7 text-white">{assessment.question}</p>
                <div className="mt-5 grid gap-2">
                  {assessment.options.map((option, index) => {
                    const showCorrect = submitted && index === assessment.correctIndex;
                    const showWrong = submitted && index === selected && !correct;
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={submitted}
                        onClick={() => setSelected(index)}
                        className={`min-h-12 rounded-md border px-4 py-3 text-left text-sm leading-6 transition-colors ${showCorrect ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-100' : showWrong ? 'border-rose-400/50 bg-rose-400/10 text-rose-100' : selected === index ? 'border-sky-400/50 bg-sky-400/10 text-white' : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {!submitted ? (
                  <button
                    type="button"
                    disabled={selected === null}
                    onClick={() => setSubmitted(true)}
                    className="mt-5 h-10 rounded-md bg-sky-400 px-4 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Check answer
                  </button>
                ) : (
                  <div className="mt-5 border-l-2 border-white/15 pl-4">
                    <p
                      className={`text-sm font-semibold ${correct ? 'text-emerald-300' : 'text-amber-300'}`}
                    >
                      {correct ? 'Correct' : 'Review this once more'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/50">{assessment.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-md border border-white/10 p-4 text-sm text-white/45">
                No validated MCQ exists for this fresh item yet. Record one takeaway after reading
                it.
              </p>
            )}
          </section>
        </div>

        <aside className="h-fit border-t border-white/10 pt-6 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
            Session state
          </span>
          <div className="mt-4 flex items-center gap-3">
            <CheckCircle2
              className={`h-5 w-5 ${completed ? 'text-emerald-400' : 'text-white/20'}`}
            />
            <span className="text-sm text-white/65">{completed ? 'Completed' : 'In progress'}</span>
          </div>
          <button
            type="button"
            onClick={markComplete}
            className="mt-5 h-11 w-full rounded-md border border-white/15 px-4 text-sm font-medium text-white hover:border-white/30 hover:bg-white/5"
          >
            {completed ? 'Completed today' : 'Mark learning complete'}
          </button>
          {sprint && next ? (
            <Link
              to={`/sources/${encodeURIComponent(next.id)}?mode=sprint`}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-400 px-4 text-sm font-semibold text-black hover:bg-sky-300"
            >
              Next in source <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/playground"
              className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-white/10 px-4 text-sm text-white/55 hover:text-white"
            >
              Open Playground
            </Link>
          )}
          <p className="mt-5 text-xs leading-5 text-white/30">
            Progress is stored separately from the source and survives refreshes through this item’s
            stable ID.
          </p>
        </aside>
      </div>
    </main>
  );
}
