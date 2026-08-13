import { ArrowRight, BookOpen, Check, Clock, Hammer, RotateCcw, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { SessionPlan } from '../lib/planner';
import type { BlockKind } from '../lib/planner';

const BLOCK_META: Record<BlockKind, { icon: typeof Target; action: string }> = {
  review: {
    icon: RotateCcw,
    action: 'Start reviews',
  },
  learn: {
    icon: BookOpen,
    action: 'Open concept',
  },
  drill: {
    icon: Target,
    action: 'Solve drill',
  },
  build: {
    icon: Hammer,
    action: 'Open Playground',
  },
};

interface Props {
  plan: SessionPlan;
  showRationale?: boolean;
}

export function SessionPlanView({ plan, showRationale = true }: Props) {
  const nextBlockIndex = plan.blocks.findIndex((block) => !block.done);
  const nextBlock = nextBlockIndex >= 0 ? plan.blocks[nextBlockIndex] : null;
  const nextMeta = nextBlock ? BLOCK_META[nextBlock.kind] : null;
  const completedBlocks = plan.blocks.filter((block) => block.done).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-white/50">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {plan.totalMinutes} min session
        </span>
        <span aria-hidden="true">·</span>
        <span>{plan.roadmap.title}</span>
        <span aria-hidden="true">·</span>
        <span>
          {plan.blocks.length} steps · {completedBlocks} complete
        </span>
      </div>

      <h1 className="mt-5 max-w-3xl text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {plan.headline}
      </h1>
      {showRationale && (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
          {plan.rationale}
        </p>
      )}

      {nextBlock && nextMeta ? (
        <div className="mt-9 border-t border-white/[0.08] pt-6">
          <p className="text-sm font-medium text-white">{nextBlock.title}</p>
          {nextBlock.subtitle && <p className="mt-1 text-sm text-white/50">{nextBlock.subtitle}</p>}
          <Link
            to={nextBlock.href}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            {nextMeta.action}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-9 flex items-center gap-2 border-t border-white/[0.08] pt-6 text-sm text-emerald-300">
          <Check className="h-4 w-4" /> Today&apos;s evidence loop is complete.
        </div>
      )}

      <details className="group mt-8 border-t border-white/[0.08] pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md text-sm text-white/55 hover:text-white">
          View the full session · {plan.blocks.length} steps
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <ol className="pb-2">
          {plan.blocks.map((block, i) => {
            const meta = BLOCK_META[block.kind];
            const Icon = meta.icon;
            return (
              <li
                key={`${block.kind}-${i}`}
                className="flex items-center gap-3 border-t border-white/[0.06] py-3"
              >
                <Icon className="h-4 w-4 shrink-0 text-white/50" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white/75">{block.title}</p>
                  <p className="font-mono text-[10px] text-white/50">{block.minutes} min</p>
                </div>
                {block.done ? (
                  <Check className="h-4 w-4 text-emerald-300" aria-label="Complete" />
                ) : (
                  <Link
                    to={block.href}
                    className="inline-flex min-h-11 items-center px-2 text-sm text-white/55 hover:text-white"
                  >
                    Open
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </details>
    </div>
  );
}
