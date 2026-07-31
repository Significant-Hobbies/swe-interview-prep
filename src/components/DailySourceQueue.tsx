import { ArrowRight, BookOpen, ChevronDown, Clock, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  nextDurableLearningItem,
  todayBriefing,
  type LearningItem,
} from '../data/learning-sources';

export function DailySourceQueue() {
  const briefing = todayBriefing();
  const next = nextDurableLearningItem();
  if (!briefing && !next) return null;

  return (
    <section className="my-8">
      <details className="group rounded-xl border border-white/[0.08] bg-white/[0.02]">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-xl py-3 pl-4 pr-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black lg:pr-4">
          <span>
            <span className="block text-sm font-semibold text-white">Go deeper with sources</span>
            <span className="mt-1 block text-xs text-white/60">
              Optional reading after today&apos;s evidence-backed plan.
            </span>
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-white/50 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-white/[0.08] p-4">
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              to={`/session/${new Date().toISOString().slice(0, 10)}/${Date.now()}`}
              className="inline-flex min-h-11 items-center text-xs font-medium text-sky-300 hover:text-sky-200"
            >
              Start 30-minute session
            </Link>
            <Link
              to="/sources"
              className="inline-flex min-h-11 items-center text-xs text-white/60 hover:text-white"
            >
              Browse all
            </Link>
          </div>
          {/* Two columns only when both cards exist — the briefing is dropped once
              the feed goes stale, and a lone card in a 2-col grid leaves a visibly
              empty half. The survivor also drops the min-height it needed to match
              a sibling, so it sizes to its own content instead of a tall empty box. */}
          <div
            className={`grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 ${
              briefing && next ? 'md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {briefing && (
              <QueueCard
                item={briefing}
                label="Start with the news"
                icon={Newspaper}
                matchHeight={Boolean(next)}
              />
            )}
            {next && (
              <QueueCard
                item={next}
                label="Then go deeper"
                icon={BookOpen}
                matchHeight={Boolean(briefing)}
              />
            )}
          </div>
        </div>
      </details>
    </section>
  );
}

function QueueCard({
  item,
  label,
  icon: Icon,
  matchHeight,
}: {
  item: LearningItem;
  label: string;
  icon: typeof Newspaper;
  /** Only worth a floor when there is a sibling card to line up with. */
  matchHeight: boolean;
}) {
  return (
    <article className={`flex flex-col bg-black p-5 ${matchHeight ? 'min-h-52' : ''}`}>
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-sky-300/60">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      {/* Clamped: feed titles are sometimes a full summary sentence, which
          otherwise runs to four lines and swallows the page. */}
      <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-snug text-white">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/60">{item.summary}</p>
      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
        <span className="inline-flex items-center gap-1 text-xs text-white/60">
          <Clock className="h-3.5 w-3.5" /> {item.estimatedMinutes} min
        </span>
        <Link
          to={`/sources/${encodeURIComponent(item.id)}`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200"
        >
          Start <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
