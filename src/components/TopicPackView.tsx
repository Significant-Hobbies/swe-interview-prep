import {
  BookOpen,
  Copy,
  Dumbbell,
  ExternalLink,
  FileText,
  Newspaper,
  PenLine,
  PlayCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Concept } from '../data/learning-os';
import { packCompleteness, PACK_SLOT_LABEL, PACK_SLOT_ORDER, type PackMediaSlot, type TopicPack } from '../lib/topicPack';

const SLOT_ICON: Record<PackMediaSlot, typeof PlayCircle> = {
  video: PlayCircle,
  paper: FileText,
  blog: Newspaper,
  book: BookOpen,
};

interface TopicPackViewProps {
  concept: Concept;
  pack: TopicPack;
}

export default function TopicPackView({ concept, pack }: TopicPackViewProps) {
  const [copied, setCopied] = useState(false);
  const { filled, total, missing } = packCompleteness(pack);

  async function copyWritePrompt() {
    try {
      await navigator.clipboard?.writeText(pack.write.prompt);
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
            Six paths per topic — video, paper, blog, book, a problem, and something to write. Pick what fits your pace; we link out, we don&apos;t re-teach.
          </p>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-white/35">
          {filled}/{total} slots
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PACK_SLOT_ORDER.map(slot => (
          <MediaSlot key={slot} slot={slot} link={pack[slot]} />
        ))}
        <ProblemSlot problem={pack.problem} />
        <WriteSlot prompt={pack.write.prompt} copied={copied} onCopy={() => void copyWritePrompt()} conceptId={concept.id} />
      </div>

      {missing.length > 0 && (
        <p className="mt-3 text-[11px] text-white/35">
          Gaps: {missing.join(' · ')} — more sources welcome in notes.
        </p>
      )}

      {pack.more.length > 0 && (
        <details className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <summary className="cursor-pointer text-xs font-medium text-white/60">
            More sources ({pack.more.length})
          </summary>
          <ul className="mt-3 space-y-2">
            {pack.more.map(link => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
                >
                  {link.title}
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function MediaSlot({ slot, link }: { slot: PackMediaSlot; link?: { title: string; url: string } }) {
  const Icon = SLOT_ICON[slot];
  const label = PACK_SLOT_LABEL[slot];

  if (!link) {
    return (
      <div className="flex flex-col rounded-xl border border-dashed border-white/[0.1] bg-black/40 px-3.5 py-3">
        <div className="flex items-center gap-2 text-white/30">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="mt-2 text-[11px] text-white/25">Not curated yet</p>
      </div>
    );
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-white/45 group-hover:text-white/70" />
        <span className="text-xs font-medium text-white/50">{label}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white">{link.title}</p>
      <ExternalLink className="mt-2 h-3 w-3 text-white/30 group-hover:text-white/50" />
    </a>
  );
}

function ProblemSlot({ problem }: { problem?: { drillId: string; title: string } }) {
  if (!problem) {
    return (
      <div className="flex flex-col rounded-xl border border-dashed border-white/[0.1] bg-black/40 px-3.5 py-3">
        <div className="flex items-center gap-2 text-white/30">
          <Dumbbell className="h-4 w-4 shrink-0" />
          <span className="text-xs font-medium">Problem</span>
        </div>
        <p className="mt-2 text-[11px] text-white/25">No drill linked yet</p>
      </div>
    );
  }

  return (
    <Link
      to={`/drills/${problem.drillId}`}
      className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
    >
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 shrink-0 text-white/45 group-hover:text-white/70" />
        <span className="text-xs font-medium text-white/50">Problem</span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white">{problem.title}</p>
    </Link>
  );
}

function WriteSlot({
  prompt,
  copied,
  onCopy,
  conceptId,
}: {
  prompt: string;
  copied: boolean;
  onCopy: () => void;
  conceptId: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PenLine className="h-4 w-4 shrink-0 text-white/45" />
          <span className="text-xs font-medium text-white/50">Write</span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 font-mono text-[10px] text-white/40 hover:text-white/70"
        >
          <Copy className="h-3 w-3" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-snug text-white/75">{prompt}</p>
      <Link
        to={`/progress/all?tab=notes&concept=${conceptId}`}
        className="mt-2 text-[11px] text-white/40 hover:text-white/65"
      >
        Draft in notes →
      </Link>
    </div>
  );
}