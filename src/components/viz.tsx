// SVG-based visualization primitives. No external chart deps — everything is
// hand-rolled SVG so we keep the bundle small and the styling consistent with
// the rest of the app.
import { Link } from 'react-router-dom';

// Hex matches Tailwind's *-500 swatch so SVG ↔ utility-class palettes line up.
export const PALETTE: Record<string, string> = {
  purple: '#a855f7',
  fuchsia: '#d946ef',
  cyan: '#06b6d4',
  emerald: '#10b981',
  amber: '#f59e0b',
  orange: '#f97316',
  blue: '#3b82f6',
  rose: '#f43f5e',
  gray: '#4b5563',
};

export function hex(name: string): string {
  return PALETTE[name] || PALETTE.gray;
}

// --- Ring ------------------------------------------------------------------
// Single radial progress ring with an optional label inside.

export function Ring({
  value,
  size = 64,
  stroke = 6,
  tone = 'purple',
  label,
  sublabel,
}: {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  tone?: string;
  label?: string;
  sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const offset = c * (1 - pct);
  const color = hex(tone);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1f2937" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
          {label && <span className="text-sm font-bold text-white">{label}</span>}
          {sublabel && <span className="text-[9px] uppercase tracking-wider text-gray-500">{sublabel}</span>}
        </div>
      )}
    </div>
  );
}

// --- Mastery donut ---------------------------------------------------------
// Composite donut: one ring segment per track, sized by track concept count,
// filled by per-track mastery share. Center shows overall %.

export interface DonutSegment {
  id: string;
  label: string;
  total: number;
  mastered: number;
  tone: string;
}

export function MasteryDonut({
  segments,
  size = 200,
  thickness = 18,
}: {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
}) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const totalAll = segments.reduce((s, x) => s + x.total, 0) || 1;
  const overallMastered = segments.reduce((s, x) => s + x.mastered, 0);
  const overallPct = Math.round((overallMastered / totalAll) * 100);

  // Build segment arcs in a single reduce so the running cursor stays inside
  // the accumulator (React Compiler dislikes `let` reassignment in render).
  const startAngle = -Math.PI / 2; // 12 o'clock
  const arcs = segments.reduce<Array<DonutSegment & { start: number; end: number; filledStart: number; filledEnd: number; span: number }>>(
    (acc, seg) => {
      const cursor = acc.length ? acc[acc.length - 1].end : startAngle;
      const span = (seg.total / totalAll) * Math.PI * 2;
      const filledSpan = seg.total ? (seg.mastered / seg.total) * span : 0;
      acc.push({
        ...seg,
        start: cursor,
        end: cursor + span,
        filledStart: cursor,
        filledEnd: cursor + filledSpan,
        span,
      });
      return acc;
    },
    [],
  );

  function arcPath(start: number, end: number) {
    if (end - start < 1e-4) return '';
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <svg width={size} height={size}>
      {/* Track background slices */}
      {arcs.map(a => (
        <path
          key={`bg-${a.id}`}
          d={arcPath(a.start + 0.01, a.end - 0.01)}
          stroke="#1f2937"
          strokeWidth={thickness}
          strokeLinecap="butt"
          fill="none"
        />
      ))}
      {/* Filled (mastered) portion per track */}
      {arcs.map(a => (
        <path
          key={`fg-${a.id}`}
          d={arcPath(a.filledStart + 0.01, a.filledEnd - 0.005)}
          stroke={hex(a.tone)}
          strokeWidth={thickness}
          strokeLinecap="butt"
          fill="none"
        />
      ))}
      {/* Center text */}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white" fontSize="28" fontWeight="700">
        {overallPct}%
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#6b7280" fontSize="10" letterSpacing="1">
        OVERALL
      </text>
    </svg>
  );
}

// --- Stacked progress bar --------------------------------------------------
// Horizontal bar split into mastered / active / due / untouched segments.

export interface StackSegment {
  count: number;
  tone: string;
  label: string;
}

export function StackedBar({
  segments,
  height = 8,
  showLegend = false,
}: {
  segments: StackSegment[];
  height?: number;
  showLegend?: boolean;
}) {
  const total = segments.reduce((s, x) => s + x.count, 0) || 1;
  return (
    <div className="w-full">
      <div className="flex w-full overflow-hidden rounded-full" style={{ height }}>
        {segments.map((s, i) => {
          const pct = (s.count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={i}
              title={`${s.label}: ${s.count}`}
              style={{ width: `${pct}%`, backgroundColor: hex(s.tone) }}
            />
          );
        })}
      </div>
      {showLegend && (
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-500">
          {segments.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: hex(s.tone) }} />
              {s.label} <span className="text-gray-600">· {s.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Concept chain ---------------------------------------------------------
// Horizontal chain of concept dots in priority order. Hover to peek the name;
// click to deep-link. Color = lifecycle status; size = priority weight.

export interface ChainNode {
  id: string;
  name: string;
  tone: string;
  priority: number;
  href: string;
}

export function ConceptChain({ nodes }: { nodes: ChainNode[] }) {
  if (!nodes.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {nodes.map((n, i) => {
        const size = 8 + Math.min(4, Math.max(0, n.priority - 2));
        return (
          <div key={n.id} className="flex items-center gap-1.5">
            <Link
              to={n.href}
              title={n.name}
              aria-label={n.name}
              className="block rounded-full ring-offset-2 ring-offset-gray-950 transition-transform hover:scale-125 focus:outline-none focus:ring-2"
              style={{
                width: size,
                height: size,
                backgroundColor: hex(n.tone),
              }}
            />
            {i < nodes.length - 1 && <span className="h-px w-2 bg-gray-800" />}
          </div>
        );
      })}
    </div>
  );
}

// --- Milestone timeline ----------------------------------------------------
// Vertical (mobile) / horizontal (desktop) stepper of roadmap milestones.

export interface TimelineStep {
  id: string;
  title: string;
  sublabel: string;
  pct: number; // 0..1 — fraction mastered
  tone: string;
  active?: boolean;
}

export function MilestoneTimeline({ steps }: { steps: TimelineStep[] }) {
  if (!steps.length) return null;
  return (
    <div className="relative">
      {/* connecting line */}
      <div className="absolute left-3 top-3 bottom-3 w-px bg-gray-800 sm:left-0 sm:right-0 sm:top-3 sm:bottom-auto sm:h-px sm:w-auto sm:bg-gray-800" />
      <ol className="relative flex flex-col gap-4 sm:flex-row sm:gap-3">
        {steps.map(step => {
          const filled = step.pct >= 1;
          const started = step.pct > 0;
          return (
            <li key={step.id} className="flex items-start gap-3 sm:flex-1 sm:flex-col sm:items-stretch">
              <span
                className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 sm:mx-auto sm:mt-0"
                style={{
                  backgroundColor: filled ? hex(step.tone) : '#0a0a0a',
                  borderColor: started ? hex(step.tone) : '#374151',
                }}
              >
                {filled ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L5 9L10 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: started ? hex(step.tone) : '#4b5563' }} />
                )}
              </span>
              <div className="min-w-0 sm:mt-2 sm:text-center">
                <div className={`text-xs font-semibold ${step.active ? 'text-white' : 'text-gray-300'}`}>
                  {step.title}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500">{step.sublabel}</div>
                <div className="mt-1 text-[10px] text-gray-500">{Math.round(step.pct * 100)}% mastered</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// --- Sparkline -------------------------------------------------------------
// Tiny line chart for activity-over-time signals. Values must be normalized 0..1.

export function Sparkline({
  values,
  width = 120,
  height = 28,
  tone = 'purple',
}: {
  values: number[];
  width?: number;
  height?: number;
  tone?: string;
}) {
  if (!values.length) {
    return (
      <svg width={width} height={height}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#1f2937" strokeWidth={1} />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const step = width / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => `${i * step},${height - (v / max) * (height - 2) - 1}`)
    .join(' ');
  const color = hex(tone);
  return (
    <svg width={width} height={height}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Last-point dot */}
      <circle
        cx={(values.length - 1) * step}
        cy={height - (values[values.length - 1] / max) * (height - 2) - 1}
        r={2}
        fill={color}
      />
    </svg>
  );
}
