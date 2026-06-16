// Shared UI primitives for the SWE Learning OS. Dark theme, Tailwind v4.
import { Link } from 'react-router-dom';

import type { ConceptStatus } from '../data/learning-os';

// --- Color tokens -----------------------------------------------------------
// Tailwind v4 needs static class strings, so colors are an explicit record.

interface ColorSet {
  text: string;
  bg: string;
  border: string;
  solid: string;
  ring: string;
}

export const COLORS: Record<string, ColorSet> = {
  purple: { text: 'text-purple-300', bg: 'bg-purple-500/10', border: 'border-purple-500/30', solid: 'bg-purple-500', ring: 'ring-purple-500/40' },
  fuchsia: { text: 'text-fuchsia-300', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', solid: 'bg-fuchsia-500', ring: 'ring-fuchsia-500/40' },
  cyan: { text: 'text-cyan-300', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', solid: 'bg-cyan-500', ring: 'ring-cyan-500/40' },
  emerald: { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', solid: 'bg-emerald-500', ring: 'ring-emerald-500/40' },
  amber: { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30', solid: 'bg-amber-500', ring: 'ring-amber-500/40' },
  orange: { text: 'text-orange-300', bg: 'bg-orange-500/10', border: 'border-orange-500/30', solid: 'bg-orange-500', ring: 'ring-orange-500/40' },
  blue: { text: 'text-blue-300', bg: 'bg-blue-500/10', border: 'border-blue-500/30', solid: 'bg-blue-500', ring: 'ring-blue-500/40' },
  rose: { text: 'text-rose-300', bg: 'bg-rose-500/10', border: 'border-rose-500/30', solid: 'bg-rose-500', ring: 'ring-rose-500/40' },
  gray: { text: 'text-gray-300', bg: 'bg-gray-500/10', border: 'border-gray-700', solid: 'bg-gray-500', ring: 'ring-gray-500/40' },
};

export function color(name: string): ColorSet {
  return COLORS[name] || COLORS.gray;
}

export const DIFFICULTY_COLOR: Record<string, string> = {
  intro: 'emerald',
  core: 'amber',
  advanced: 'rose',
};

export const STATUS_META: Record<ConceptStatus, { label: string; color: string }> = {
  'not-started': { label: 'Not started', color: 'gray' },
  learning: { label: 'Learning', color: 'blue' },
  drilling: { label: 'Drilling', color: 'amber' },
  building: { label: 'Building', color: 'purple' },
  review: { label: 'Review', color: 'cyan' },
  mastered: { label: 'Mastered', color: 'emerald' },
};

// --- Layout primitives ------------------------------------------------------

export function PageShell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-purple-400">{eyebrow}</div>
        )}
        <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-400">{subtitle}</p>}
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
  const base = `rounded-xl border border-gray-800 bg-gray-900/40 ${className}`;
  if (as === 'link' && to) {
    return (
      <Link to={to} className={`${base} block transition-colors hover:border-gray-700 hover:bg-gray-900/70`}>
        {children}
      </Link>
    );
  }
  if (as === 'button') {
    return (
      <button onClick={onClick} className={`${base} text-left transition-colors hover:border-gray-700 hover:bg-gray-900/70`}>
        {children}
      </button>
    );
  }
  return <div className={base}>{children}</div>;
}

export function Badge({ children, tone = 'gray' }: { children: React.ReactNode; tone?: string }) {
  const c = color(tone);
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${c.bg} ${c.border} ${c.text}`}>
      {children}
    </span>
  );
}

export function StatTile({ label, value, hint, tone = 'gray' }: { label: string; value: React.ReactNode; hint?: string; tone?: string }) {
  const c = color(tone);
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${c.text}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'purple' }: { value: number; tone?: string }) {
  const c = color(tone);
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
      <div className={`h-full rounded-full ${c.solid} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: React.ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 px-6 py-12 text-center">
      {icon && <div className="mb-3 text-gray-600">{icon}</div>}
      <div className="text-sm font-medium text-gray-300">{title}</div>
      {hint && <div className="mt-1 max-w-sm text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{children}</h2>
      {action}
    </div>
  );
}

const BUTTON_TONES: Record<string, string> = {
  primary: 'bg-purple-600 text-white hover:bg-purple-500',
  ghost: 'border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white',
  subtle: 'bg-gray-800 text-gray-200 hover:bg-gray-700',
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
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_TONES[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

// --- Tabs & collapsible panels (Learn / Practice / Progress) ---------------

export function TabGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex rounded-lg border border-gray-800 p-0.5 sm:w-fit ${className}`} role="tablist">
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
      className={`flex-1 rounded-md px-4 py-1.5 text-xs font-medium transition-colors sm:flex-none ${
        active ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children ?? (
        <>
          {label}
          {count != null && <span className="ml-1.5 text-gray-600">{count}</span>}
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
    <div className="rounded-2xl border border-gray-800 bg-gray-900/30">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle && <div className="text-[11px] text-gray-500">{subtitle}</div>}
        </div>
        <span className="text-gray-500" aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
      </button>
      {open && <div className="border-t border-gray-800 px-5 pb-5 pt-4">{children}</div>}
    </div>
  );
}

export function FilterPill({
  children,
  active,
  tone = 'purple',
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  tone?: string;
  onClick: () => void;
}) {
  const c = color(tone);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
        active ? `${c.bg} ${c.border} ${c.text}` : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-200'
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
          className="rounded-lg border border-gray-800 bg-gray-900/40 px-3 py-2 sm:min-w-[120px]"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{item.label}</div>
          <div className="text-lg font-bold text-white">{item.value}</div>
          {item.hint && <div className="text-[10px] text-gray-600">{item.hint}</div>}
        </div>
      ))}
    </div>
  );
}
