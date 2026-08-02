import { ArrowRight, BookOpen, Clock, Hammer, RotateCcw, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { SessionPlan } from '../lib/planner';
import type { BlockKind } from '../lib/planner';

const BLOCK_META: Record<BlockKind, { icon: typeof Target; accent: string; action: string }> = {
  review: {
    icon: RotateCcw,
    accent: 'text-cyan-300 border-cyan-500/25 bg-cyan-500/8',
    action: 'Start reviews',
  },
  learn: {
    icon: BookOpen,
    accent: 'text-white border-white/15 bg-white/[0.03]',
    action: 'Open concept',
  },
  drill: {
    icon: Target,
    accent: 'text-amber-200 border-amber-500/25 bg-amber-500/8',
    action: 'Solve drill',
  },
  build: {
    icon: Hammer,
    accent: 'text-sky-200 border-sky-500/30 bg-sky-500/10',
    action: 'Open Playground',
  },
};

interface Props {
  plan: SessionPlan;
  showRationale?: boolean;
}

export function SessionPlanView({ plan, showRationale = true }: Props) {
  const nextBlockIndex = plan.blocks.findIndex((block) => !block.done);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-white/60">
          <Clock className="h-3.5 w-3.5" />
          {plan.totalMinutes} min session
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
          {plan.roadmap.title}
        </span>
      </div>

      <div>
        <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {plan.headline}
        </h1>
        {showRationale && (
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/55 sm:text-base">
            {plan.rationale}
          </p>
        )}
        <p className="mt-3 max-w-prose text-sm text-white/60">{plan.concept.description}</p>
      </div>

      <ol className="space-y-3">
        {plan.blocks.map((block, i) => {
          const meta = BLOCK_META[block.kind];
          const Icon = meta.icon;
          const isNext = i === nextBlockIndex;
          return (
            <li
              key={`${block.kind}-${i}`}
              aria-current={isNext ? 'step' : undefined}
              className={`group flex gap-4 rounded-xl border p-4 transition-colors duration-150 ${
                isNext ? 'border-white/30' : 'hover:border-white/20'
              } ${meta.accent}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-sm font-semibold text-white/80">
                {block.done ? '✓' : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Icon className="h-4 w-4 opacity-70" />
                  <span className="text-sm font-medium text-white">{block.title}</span>
                  <span className="font-mono text-[10px] text-white/60">{block.minutes}m</span>
                </div>
                {block.subtitle && <p className="mt-1 text-xs text-white/60">{block.subtitle}</p>}
                <Link
                  to={block.href}
                  className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-all duration-150 ${
                    isNext
                      ? 'border-white bg-white text-black hover:bg-white/90'
                      : 'border-white/15 bg-black/20 text-white hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  {isNext ? `Continue · ${meta.action}` : meta.action}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
