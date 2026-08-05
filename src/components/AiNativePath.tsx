import { ArrowDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AI_NATIVE_PATH_STAGES, type AiNativePathStage } from '../data/ai-native-path';

interface AiNativePathProps {
  className?: string;
}

function StageCard({ stage }: { stage: AiNativePathStage }) {
  const isStart = stage.kind === 'foundation';

  return (
    <article
      className={`flex min-w-0 flex-col rounded-xl border bg-white/[0.02] transition-colors hover:bg-white/[0.04] ${
        isStart ? 'border-sky-500/40' : 'border-white/[0.08] hover:border-white/15'
      }`}
      data-stage={stage.id}
      data-emphasis={stage.signal ? 'evaluation-judgment' : undefined}
    >
      <Link
        to={`/roadmaps/${stage.roadmapId}`}
        className="group flex flex-1 flex-col px-4 py-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/70"
      >
        <div className="flex items-center justify-between gap-3">
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.16em] ${
              isStart ? 'text-sky-500' : 'text-white/55'
            }`}
          >
            {stage.step === '1' ? 'Start · 1' : `Stage ${stage.step}`}
          </span>
          <span className="font-mono text-[10px] tabular-nums text-white/50">{stage.horizon}</span>
        </div>

        <h3 className="mt-3 text-base font-semibold tracking-tight text-white">{stage.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-white/60">{stage.summary}</p>

        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-white/55">
          {stage.topics.map((topic) => (
            <li key={topic} className="flex min-w-0 items-start gap-1.5">
              <span className="mt-[0.45rem] h-px w-2 shrink-0 bg-white/25" aria-hidden="true" />
              <span>{topic}</span>
            </li>
          ))}
        </ul>

        {stage.signal && (
          <p className="mt-4 border-t border-white/[0.08] pt-3 text-[11px] leading-relaxed text-white/70">
            <strong className="font-semibold text-white">Evaluation judgment:</strong>{' '}
            {stage.signal.replace(/^Evaluation judgment is the differentiator:\s*/i, '')}
          </p>
        )}

        <span className="mt-4 inline-flex min-h-11 items-center gap-1.5 self-start font-mono text-[10px] text-white/55 transition-colors group-hover:text-white">
          Open roadmap <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </span>
      </Link>

      {stage.secondary && (
        <Link
          to={stage.secondary.to}
          className="inline-flex min-h-11 items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2 font-mono text-[10px] text-white/55 transition-colors hover:bg-white/[0.03] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/70"
        >
          {stage.secondary.label}
          <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}

function Connector({ label }: { label: string }) {
  return (
    <div
      className="flex min-h-11 items-center justify-center gap-2 py-1 text-white/50 lg:min-h-0 lg:flex-col lg:py-0"
      aria-hidden="true"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] lg:[writing-mode:vertical-rl]">
        {label}
      </span>
      <ArrowDown className="h-3.5 w-3.5 lg:hidden" />
      <ArrowRight className="hidden h-3.5 w-3.5 lg:block" />
    </div>
  );
}

export default function AiNativePath({ className = '' }: AiNativePathProps) {
  const foundation = AI_NATIVE_PATH_STAGES.find((stage) => stage.id === 'foundations');
  const parallel = AI_NATIVE_PATH_STAGES.filter((stage) => stage.kind === 'parallel');
  const synthesis = AI_NATIVE_PATH_STAGES.find((stage) => stage.id === 'system-design');

  if (!foundation || parallel.length !== 2 || !synthesis) return null;

  return (
    <section
      aria-labelledby="ai-native-path-heading"
      className={`rounded-xl border border-white/[0.08] bg-black/30 p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
            AI-native SWE orientation
          </p>
          <h2
            id="ai-native-path-heading"
            className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl"
          >
            One sequence. Four deep paths.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
            Learn the machine first. Run algorithms and AI engineering in parallel. Then defend the
            combined system under interview pressure.
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
          Orientation, not another roadmap
        </span>
      </div>

      <div className="mt-5 grid gap-0 lg:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1.8fr)_2.5rem_minmax(0,1fr)] lg:items-stretch">
        <StageCard stage={foundation} />
        <Connector label="then both" />

        <section
          aria-label="Parallel tracks: study both"
          className="grid min-w-0 gap-2 sm:grid-cols-2"
        >
          {parallel.map((stage) => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </section>

        <Connector label="then synthesize" />
        <StageCard stage={synthesis} />
      </div>
    </section>
  );
}
