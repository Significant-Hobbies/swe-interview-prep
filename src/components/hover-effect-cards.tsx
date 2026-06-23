// Aceternity HoverEffect (free component), ported to slate+sky + react-router.
// A grid of cards with a subtle shared layout-id sky tint that follows the
// pointer. Restrained: no decorative rings, no scale, no glow.
import { AnimatePresence, motion } from 'motion/react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '../lib/utils';

export interface HoverEffectItem {
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  to: string;
}

export function HoverEffectCards({
  items,
  className,
  columns,
}: {
  items: HoverEffectItem[];
  className?: string;
  columns?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const layoutId = useId();

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2',
        columns ?? 'lg:grid-cols-3',
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          key={item.to}
          to={item.to}
          onMouseEnter={() => setHovered(idx)}
          onMouseLeave={() => setHovered(null)}
          className="group relative block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <AnimatePresence>
            {hovered === idx && (
              <motion.span
                className="absolute inset-0 block rounded-xl bg-slate-800/60"
                layoutId={layoutId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
              />
            )}
          </AnimatePresence>
          <div className="relative rounded-xl border border-slate-800 bg-slate-900/30 p-4 transition-colors duration-150 group-hover:border-slate-700">
            <div className="text-sm font-semibold text-slate-100">{item.title}</div>
            {item.description && (
              <div className="mt-1 text-xs text-slate-400">{item.description}</div>
            )}
            {item.meta && <div className="mt-3 text-xs text-slate-500">{item.meta}</div>}
          </div>
        </Link>
      ))}
    </div>
  );
}
