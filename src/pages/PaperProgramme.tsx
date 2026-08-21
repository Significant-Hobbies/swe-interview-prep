import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PaperLearningCard } from '../components/PaperLearningCard';
import { PAPER_CONTRACTS } from '../data/paper-contracts';
import { selectRotatingPaper } from '../lib/paperRotation';

export default function PaperProgramme() {
  const selection = selectRotatingPaper(PAPER_CONTRACTS);
  const remaining = PAPER_CONTRACTS.filter((paper) => paper.id !== selection?.paper.id).sort(
    (a, b) => a.title.localeCompare(b.title)
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">
      <Link
        to="/learn"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>
      <header className="mt-5 max-w-3xl">
        <p className="text-sm text-white/55">Paper programme</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          One source. One retrieval. One application.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
          The rotation is deterministic, source-first, and subordinate to due reviews or
          misconception recovery on Today.
        </p>
      </header>

      {selection && (
        <section className="mt-10" aria-labelledby="today-paper">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-amber-100/65">
                Today’s source
              </p>
              <h2 id="today-paper" className="mt-2 text-2xl font-semibold text-white">
                Read with a contract
              </h2>
            </div>
            <p className="text-xs text-white/60">{selection.reason}</p>
          </div>
          <div className="mt-4 rounded-xl border border-white/[0.1]">
            <PaperLearningCard paper={selection.paper} />
          </div>
        </section>
      )}

      <section className="mt-12 border-t border-white/[0.08] pt-8" aria-labelledby="paper-queue">
        <h2 id="paper-queue" className="text-2xl font-semibold text-white">
          Programme queue
        </h2>
        <div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {remaining.map((paper) => (
            <Link
              key={paper.id}
              to={`/study/paper/${paper.id}`}
              className="grid min-h-20 gap-2 py-4 hover:text-white sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <span>
                <span className="block font-medium text-white/85">{paper.title}</span>
                <span className="mt-1 block text-xs text-white/60">
                  {paper.venue} · {paper.estimatedMinutes} min · {paper.difficulty}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-white/55">
                Study <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
