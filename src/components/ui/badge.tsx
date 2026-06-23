import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
  {
    variants: {
      tone: {
        default: 'border-slate-700 text-slate-300',
        muted: 'border-slate-800 text-slate-400',
        success: 'border-emerald-800/60 text-emerald-300',
        warning: 'border-amber-800/60 text-amber-300',
        danger: 'border-rose-800/60 text-rose-300',
        info: 'border-sky-800/60 text-sky-300',
      },
    },
    defaultVariants: { tone: 'default' },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, className }))} {...props} />;
}
