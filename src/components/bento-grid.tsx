// Aceternity BentoGrid (free component), ported to slate+sky + react-router.
// Restrained variant: no decorative shadows, no gradient, just asymmetric
// tile sizing with subtle hover and an optional motion.div for the entrance
// stagger (respects prefers-reduced-motion).
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';

import { cn } from '../lib/utils';

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[10rem] lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  to?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  index?: number;
}

export function BentoGridItem({
  className,
  to,
  title,
  description,
  header,
  icon,
  index = 0,
}: BentoGridItemProps) {
  const reduce = useReducedMotion();

  const inner = (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
        delay: reduce ? 0 : Math.min(index, 12) * 0.04,
      }}
      className={cn(
        'flex h-full flex-col justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 ' +
          'transition-colors duration-150 hover:border-slate-700 hover:bg-slate-900/70',
        className
      )}
    >
      {header && <div className="overflow-hidden rounded-lg">{header}</div>}
      <div className="flex flex-col gap-1">
        {icon && <div className="mb-1 text-slate-400">{icon}</div>}
        {title && <div className="text-sm font-semibold text-slate-100">{title}</div>}
        {description && <div className="text-xs text-slate-400">{description}</div>}
      </div>
    </motion.div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-xl"
      >
        {inner}
      </Link>
    );
  }
  return inner;
}
