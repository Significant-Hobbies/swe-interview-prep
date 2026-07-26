import { ArrowRight, BookOpen, Clock, Newspaper } from 'lucide-react';
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
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-white">Across your learning sources</h2>
        <div className="flex items-center gap-4">
          <Link
            to={`/session/${new Date().toISOString().slice(0, 10)}/${Date.now()}`}
            className="text-xs font-medium text-sky-300 hover:text-sky-200"
          >
            Start 30-minute session
          </Link>
          <Link to="/sources" className="text-xs text-white/40 hover:text-white">
            Browse all
          </Link>
        </div>
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
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/45">{item.summary}</p>
      <div className="mt-auto flex items-center justify-between gap-4 pt-5">
        <span className="inline-flex items-center gap-1 text-xs text-white/30">
          <Clock className="h-3.5 w-3.5" /> {item.estimatedMinutes} min
        </span>
        <Link
          to={`/sources/${encodeURIComponent(item.id)}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200"
        >
          Start <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
