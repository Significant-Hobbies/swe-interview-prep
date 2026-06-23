import {
  BookOpen,
  Copy,
  Dumbbell,
  ExternalLink,
  FileText,
  Link2,
  Newspaper,
  PenLine,
  PlayCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Concept } from '../data/learning-os';
import {
  PACK_CATEGORY_LABEL,
  packCompleteness,
  packItemText,
  type PackCategory,
  type PackItem,
  type TopicPack,
} from '../lib/topicPack';

const CATEGORY_ICON: Record<PackCategory, typeof PlayCircle> = {
  video: PlayCircle,
  paper: FileText,
  blog: Newspaper,
  book: BookOpen,
  problem: Dumbbell,
  write: PenLine,
  more: Link2,
};

const PRIMARY_ORDER: PackCategory[] = ['video', 'paper', 'blog', 'book', 'problem', 'write'];

interface TopicPackViewProps {
  concept: Concept;
  pack: TopicPack;
}

export default function TopicPackView({ concept, pack }: TopicPackViewProps) {
  const [copied, setCopied] = useState(false);
  const { filled, total, missing } = packCompleteness(pack);
  const primaryItems = pack.items.filter((i) => i.category !== 'more');
  const moreItems = pack.items.filter((i) => i.category === 'more');
  const grouped = Object.fromEntries(
    PRIMARY_ORDER.map((category) => [category, primaryItems.filter((i) => i.category === category)])
  ) as Record<PackCategory, PackItem[]>;

  async function copyWritePrompt(text: string) {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <section aria-label="Learn your way">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Learn your way
          </h2>
          <p className="mt-1 max-w-prose text-xs text-white/45">
            Curated resources — category, title, url. Optional items; use what fits.
          </p>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-white/35">
          {filled}/{total} primary
          {moreItems.length > 0 ? ` · +${moreItems.length} more` : ''}
        </span>
      </div>

      <div className="space-y-4">
        {PRIMARY_ORDER.map((category) => {
          const items = grouped[category];
          if (!items.length) return null;
          return (
            <div key={category}>
              <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                {PACK_CATEGORY_LABEL[category]}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <PackItemCard
                    key={`${item.category}-${item.url || item.title}`}
                    item={item}
                    conceptId={concept.id}
                    copied={copied}
                    onCopyWrite={() => void copyWritePrompt(packItemText(item))}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {moreItems.length > 0 && (
        <details className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <summary className="cursor-pointer text-xs font-medium text-white/60">
            {PACK_CATEGORY_LABEL.more} ({moreItems.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {moreItems.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
                >
                  {item.title}
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      {pack.items.length === 0 && (
        <p className="mt-3 text-[11px] text-white/35">No curated items yet.</p>
      )}

      {missing.length > 0 && (
        <p className="mt-3 text-[11px] text-white/35">Not curated yet: {missing.join(' · ')}</p>
      )}
    </section>
  );
}

function PackItemCard({
  item,
  conceptId,
  copied,
  onCopyWrite,
}: {
  item: PackItem;
  conceptId: string;
  copied: boolean;
  onCopyWrite: () => void;
}) {
  const Icon = CATEGORY_ICON[item.category];
  const displayText = packItemText(item);

  if (item.category === 'write') {
    return (
      <div className="flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 shrink-0 text-white/45" />
            <span className="text-xs font-medium text-white/50">{item.title}</span>
          </div>
          <button
            type="button"
            onClick={onCopyWrite}
            className="inline-flex items-center gap-1 font-mono text-[10px] text-white/40 hover:text-white/70"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-snug text-white/75">{displayText}</p>
        <Link
          to={`/progress/all?tab=notes&concept=${conceptId}`}
          className="mt-2 text-[11px] text-white/40 hover:text-white/65"
        >
          Draft in notes →
        </Link>
      </div>
    );
  }

  if (item.category === 'problem' && item.url.startsWith('/')) {
    return (
      <Link
        to={item.url}
        className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-white/45 group-hover:text-white/70" />
          <span className="text-xs font-medium text-white/50">{PACK_CATEGORY_LABEL.problem}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white">
          {item.title}
        </p>
      </Link>
    );
  }

  if (!item.url) {
    return (
      <div className="flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-white/45" />
          <span className="text-xs font-medium text-white/50">
            {PACK_CATEGORY_LABEL[item.category]}
          </span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white">
          {item.title}
        </p>
      </div>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-white/45 group-hover:text-white/70" />
        <span className="text-xs font-medium text-white/50">
          {PACK_CATEGORY_LABEL[item.category]}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white">{item.title}</p>
      <ExternalLink className="mt-2 h-3 w-3 text-white/30 group-hover:text-white/50" />
    </a>
  );
}
