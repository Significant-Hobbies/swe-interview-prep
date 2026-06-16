import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  tone?: 'sky' | 'emerald' | 'amber' | 'slate';
  size?: 'xs' | 'sm' | 'md';
}

const TONE: Record<NonNullable<ProgressProps['tone']>, string> = {
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-400',
};

const SIZE: Record<NonNullable<ProgressProps['size']>, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, tone = 'sky', size = 'sm', ...props }, ref) => {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        className={cn('w-full overflow-hidden rounded-full bg-slate-800', SIZE[size], className)}
        {...props}
      >
        <div
          className={cn('h-full rounded-full transition-[width] duration-300', TONE[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = 'Progress';
