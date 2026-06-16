// Shared UI primitives for the SWE Learning OS. Dark theme, slate + sky tokens.
// Discrete shadcn primitives live in src/components/ui/* — this file is the
// product-level layout shell (PageShell, PageHeader, Card, etc.) and a thin
// compatibility surface for the legacy COLORS / STATUS_META data exports.
import { Link } from 'react-router-dom';

import type { ConceptStatus } from '../data/learning-os';

// --- Color tokens -----------------------------------------------------------
// Track colors stay (used inside viz.tsx where 8 hues distinguish 8 tracks).
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
  slate: { text: 'text-slate-300', bg: 'bg-slate-800/40', border: 'border-slate-800', solid: 'bg-slate-500', ring: 'ring-slate-500/40' },
  sky: { text: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-sky-500/30', solid: 'bg-sky-500', ring: 'ring-sky-500/40' },
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-700/60', solid: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
  amber: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-700/60', solid: 'bg-amber-500', ring: 'ring-amber-500/40' },
  rose: { text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-700/60', solid: 'bg-rose-500', ring: 'ring-rose-500/40' },
  // Track / viz colors — used inside viz.tsx, not in chrome.
  purple: { text: 'text-violet-300', bg: 'bg-violet-500/10', border: 'border-violet-700/60', solid: 'bg-violet-500', ring: 'ring-violet-500/40' },
  fuchsia: { text: 'text-sky-300', bg: 'bg-sky-500/10', border: 'border-fuchsia-700/60', solid: 'bg-fuchsia-500', ring: 'ring-fuchsia-500/40' },
  cyan: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-700/60', solid: 'bg-cyan-500', ring: 'ring-cyan-500/40' },
  orange: { text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-700/60', solid: 'bg-orange-500', ring: 'ring-orange-500/40' },
  blue: { text: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-700/60', solid: 'bg-blue-500', ring: 'ring-blue-500/40' },
  // Back-compat alias — old code that asked for `gray` now gets slate.
  gray: { text: 'text-slate-300', bg: 'bg-slate-800/40', border: 'border-slate-800', solid: 'bg-slate-500', ring: 'ring-slate-500/40' },
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
    <div className={`mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
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
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-medium text-sky-400">{eyebrow}</div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-slate-400">{subtitle}</p>}
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
  const base = `rounded-xl border border-slate-800 bg-slate-900/40 ${className}`;
  if (as === 'link' && to) {
    return (
      <Link to={to} className={`${base} block transition-colors duration-150 hover:border-slate-700 hover:bg-slate-900/70`}>
        {children}
      </Link>
    );
  }
  if (as === 'button') {
    return (
      <button onClick={onClick} className={`${base} text-left transition-colors duration-150 hover:border-slate-700 hover:bg-slate-900/70`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: string }) {
  // Single quiet chip. Tone only shifts the text color slightly to carry
  // semantic meaning (success/warning/danger/info); decorative bg is gone.
  const TONE_TEXT: Record<string, string> = {
    default: 'text-slate-300 border-slate-700',
    slate: 'text-slate-300 border-slate-700',
    gray: 'text-slate-300 border-slate-700',
    sky: 'text-sky-300 border-sky-900/60',
    emerald: 'text-emerald-300 border-emerald-900/60',
    amber: 'text-amber-300 border-amber-900/60',
    rose: 'text-rose-300 border-rose-900/60',
    // Track-coded badges still render but as plain text-only chips.
    purple: 'text-violet-300 border-violet-900/60',
    fuchsia: 'text-sky-300 border-fuchsia-900/60',
    cyan: 'text-cyan-300 border-cyan-900/60',
    orange: 'text-orange-300 border-orange-900/60',
    blue: 'text-blue-300 border-blue-900/60',
  };
  const cls = TONE_TEXT[tone] ?? TONE_TEXT.default;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${cls}`}>
      {children}
    </span>
  );
}

export function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
      <div className="text-xs font-medium text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-50">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'sky' }: { value: number; tone?: string }) {
  const TONE_BAR: Record<string, string> = {
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    // Old tone names → sky (default).
    purple: 'bg-sky-500',
    fuchsia: 'bg-sky-500',
    cyan: 'bg-sky-500',
    blue: 'bg-sky-500',
    gray: 'bg-slate-400',
  };
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const fill = TONE_BAR[tone] ?? TONE_BAR.sky;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full transition-[width] duration-300 ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-slate-600">{icon}</div>}
      <div className="text-sm font-medium text-slate-200">{title}</div>
      {hint && <div className="mt-1 max-w-sm text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-slate-200">{children}</h2>
      {action}
    </div>
  );
}

const BUTTON_TONES: Record<string, string> = {
  primary: 'bg-sky-500 text-slate-950 hover:bg-sky-400',
  ghost: 'border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-100',
  subtle: 'bg-slate-900 text-slate-200 hover:bg-slate-800',
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${BUTTON_TONES[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

// --- Tabs & collapsible panels (Learn / Practice / Progress) ---------------

export function TabGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-4 border-b border-slate-800 ${className}`} role="tablist">
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
      className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-0.5 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none ${
        active
          ? 'border-sky-400 text-slate-50'
          : 'border-transparent text-slate-400 hover:text-slate-200'
      }`}
    >
      {children ?? (
        <>
          {label}
          {count != null && <span className="ml-1 text-slate-500">{count}</span>}
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
    <div className="rounded-xl border border-slate-800 bg-slate-900/30">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-900/60"
      >
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          {subtitle && <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>}
        </div>
        <span className="text-slate-500" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && <div className="border-t border-slate-800 px-5 pb-5 pt-4">{children}</div>}
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
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 ${
        active
          ? 'border-sky-500/40 bg-sky-500/10 text-sky-300'
          : 'border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
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
      {items.map(item => (
        <div
          key={item.label}
          className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2 sm:min-w-[120px]"
        >
          <div className="text-xs font-medium text-slate-400">{item.label}</div>
          <div className="mt-0.5 text-lg font-semibold text-slate-50">{item.value}</div>
          {item.hint && <div className="text-[10px] text-slate-500">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}
