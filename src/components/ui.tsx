// Shared UI primitives for the SWE Learning OS. Dark theme, slate + sky tokens.
// Discrete shadcn primitives live in src/components/ui/* — this file is the
// product-level layout shell (PageShell, PageHeader, Card, etc.) and a thin
// compatibility surface for the legacy COLORS / STATUS_META data exports.
import { Link } from 'react-router-dom';

import type { ConceptStatus } from '../data/learning-os';

// --- Color tokens -----------------------------------------------------------
// Track colors stay (used inside viz.tsx where hues distinguish tracks).
// Chrome (buttons, nav, cards, badges) is slate + sky only.

interface ColorSet {
  text: string;
  bg: string;
  border: string;
  solid: string;
  ring: string;
}

export const COLORS: Record<string, ColorSet> = {
  // Slate is the chrome default; everything that used to be "purple" or "gray"
  // for ornament now lands here.
  slate: {
    text: 'text-slate-300',
    bg: 'bg-slate-800/40',
    border: 'border-slate-800',
    solid: 'bg-slate-500',
    ring: 'ring-slate-500/40',
  },
  sky: {
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    solid: 'bg-sky-500',
    ring: 'ring-sky-500/40',
  },
  emerald: {
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-700/60',
    solid: 'bg-emerald-500',
    ring: 'ring-emerald-500/40',
  },
  amber: {
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-700/60',
    solid: 'bg-amber-500',
    ring: 'ring-amber-500/40',
  },
  rose: {
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-700/60',
    solid: 'bg-rose-500',
    ring: 'ring-rose-500/40',
  },
  // Track / viz colors — used inside viz.tsx, not in chrome.
  purple: {
    text: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-700/60',
    solid: 'bg-violet-500',
    ring: 'ring-violet-500/40',
  },
  fuchsia: {
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-fuchsia-700/60',
    solid: 'bg-fuchsia-500',
    ring: 'ring-fuchsia-500/40',
  },
  cyan: {
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-700/60',
    solid: 'bg-cyan-500',
    ring: 'ring-cyan-500/40',
  },
  orange: {
    text: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-700/60',
    solid: 'bg-orange-500',
    ring: 'ring-orange-500/40',
  },
  blue: {
    text: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-700/60',
    solid: 'bg-blue-500',
    ring: 'ring-blue-500/40',
  },
  indigo: {
    text: 'text-indigo-300',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-700/60',
    solid: 'bg-indigo-500',
    ring: 'ring-indigo-500/40',
  },
  // Back-compat alias — old code that asked for `gray` now gets slate.
  gray: {
    text: 'text-slate-300',
    bg: 'bg-slate-800/40',
    border: 'border-slate-800',
    solid: 'bg-slate-500',
    ring: 'ring-slate-500/40',
  },
};

export function color(name: string): ColorSet {
  return COLORS[name] || COLORS.slate;
}

export const DIFFICULTY_COLOR: Record<string, string> = {
  intro: 'emerald',
  core: 'amber',
  advanced: 'rose',
};

export const STATUS_META: Record<ConceptStatus, { label: string; color: string }> = {
  'not-started': { label: 'Not started', color: 'slate' },
  learning: { label: 'Learning', color: 'sky' },
  drilling: { label: 'Drilling', color: 'amber' },
  building: { label: 'Building', color: 'sky' },
  review: { label: 'Review', color: 'sky' },
  mastered: { label: 'Mastered', color: 'emerald' },
};

// --- Layout primitives ------------------------------------------------------

export function PageShell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-6 py-12 lg:py-16 ${wide ? 'max-w-7xl' : 'max-w-5xl'}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm text-white/60">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = '',
  as,
  to,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'link' | 'button';
  to?: string;
  onClick?: () => void;
}) {
  const base = `rounded-xl border border-white/[0.08] bg-white/[0.02] ${className}`;
  if (as === 'link' && to) {
    return (
      <Link
        to={to}
        className={`${base} block transition-colors duration-150 hover:border-white/15 hover:bg-white/[0.04]`}
      >
        {children}
      </Link>
    );
  }
  if (as === 'button') {
    return (
      <button
        onClick={onClick}
        className={`${base} text-left transition-colors duration-150 hover:border-white/15 hover:bg-white/[0.04]`}
      >
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

export function Badge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  // Single quiet chip. White-on-black with subtle tone shifts for semantics.
  const TONE_TEXT: Record<string, string> = {
    default: 'text-white/70 border-white/15',
    slate: 'text-white/70 border-white/15',
    gray: 'text-white/70 border-white/15',
    sky: 'text-white border-white/20',
    emerald: 'text-emerald-200 border-emerald-200/20',
    amber: 'text-amber-200 border-amber-200/20',
    rose: 'text-rose-200 border-rose-200/20',
    // Track-coded badges render as quiet text-only chips.
    purple: 'text-white/70 border-white/15',
    fuchsia: 'text-white/70 border-white/15',
    cyan: 'text-white/70 border-white/15',
    orange: 'text-white/70 border-white/15',
    blue: 'text-white/70 border-white/15',
  };
  const cls = TONE_TEXT[tone] ?? TONE_TEXT.default;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] ${cls}`}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-white">{value}</div>
      {hint && <div className="mt-0.5 font-mono text-xs text-white/40">{hint}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'sky' }: { value: number; tone?: string }) {
  const TONE_BAR: Record<string, string> = {
    sky: 'bg-white',
    emerald: 'bg-emerald-300',
    amber: 'bg-amber-300',
    rose: 'bg-rose-300',
    slate: 'bg-white/60',
    purple: 'bg-white',
    fuchsia: 'bg-white',
    cyan: 'bg-white',
    blue: 'bg-white',
    gray: 'bg-white/60',
  };
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const fill = TONE_BAR[tone] ?? TONE_BAR.sky;
  return (
    <div className="h-px w-full overflow-hidden bg-white/10">
      <div
        className={`h-full transition-[width] duration-500 ${fill}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-white/30">{icon}</div>}
      <div className="text-sm font-medium text-white">{title}</div>
      {hint && <div className="mt-1 max-w-sm text-xs text-white/50">{hint}</div>}
    </div>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        {children}
      </h2>
      {action}
    </div>
  );
}

const BUTTON_TONES: Record<string, string> = {
  primary: 'bg-white text-black hover:bg-white/90',
  ghost: 'border border-white/15 text-white hover:border-white/30 hover:bg-white/5',
  subtle: 'bg-white/5 text-white hover:bg-white/10',
};

export function Button({
  children,
  onClick,
  tone = 'primary',
  type = 'button',
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: 'primary' | 'ghost' | 'subtle';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 ${BUTTON_TONES[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

// --- Tabs & collapsible panels (Learn / Practice / Progress) ---------------

export function TabGroup({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-6 border-b border-white/[0.08] ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  label,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-0.5 py-3 text-sm transition-colors duration-150 focus-visible:outline-none ${
        active ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white'
      }`}
    >
      {children ?? (
        <>
          {label}
          {count != null && <span className="ml-1 font-mono text-xs text-white/30">{count}</span>}
        </>
      )}
    </button>
  );
}

export function CollapsiblePanel({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
      >
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle && <div className="mt-0.5 font-mono text-xs text-white/40">{subtitle}</div>}
        </div>
        <span className="text-white/30" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && <div className="border-t border-white/[0.08] px-5 pb-5 pt-4">{children}</div>}
    </div>
  );
}

export function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  tone?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-none ${
        active
          ? 'border-white bg-white text-black'
          : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export function SessionStatBar({
  items,
}: {
  items: { label: string; value: React.ReactNode; hint?: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 sm:min-w-[120px]"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            {item.label}
          </div>
          <div className="mt-1 text-lg font-semibold tabular-nums text-white">{item.value}</div>
          {item.hint && (
            <div className="mt-0.5 font-mono text-[10px] text-white/40">{item.hint}</div>
          )}
        </div>
      ))}
    </div>
  );
}
