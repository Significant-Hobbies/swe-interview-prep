import { ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Attributed canonical voices — credits + entry points, not anonymous link dumps. */
const PRIMERS = [
  {
    author: 'Percy Liang et al.',
    title: 'CS336 — Language Modeling from Scratch',
    href: '/concepts/ml-language-modeling',
    credit: 'Stanford Spring 2025',
  },
  {
    author: 'Murali',
    title: 'GRPO & RL alignment',
    href: '/concepts/ml-rl-alignment',
    credit: 'Policy optimization primer',
  },
  {
    author: 'Hamish Ivison',
    title: 'Policy gradients',
    href: '/concepts/ml-rl-alignment',
    credit: 'Hands-on RLHF path',
  },
  {
    author: 'Alisa (Wuffles)',
    title: 'Book of LLMs + math notes',
    href: '/concepts/ml-language-modeling',
    credit: 'Illustrated LM foundations',
  },
  {
    author: 'Manning et al.',
    title: 'Introduction to Information Retrieval',
    href: '/concepts/bm25',
    credit: 'Search & ranking spine',
  },
  {
    author: 'Karpathy',
    title: 'Illustrated GPT-2 / LM internals',
    href: '/concepts/ml-language-modeling',
    credit: 'Build mental models',
  },
];

interface CanonicalPrimersProps {
  className?: string;
  limit?: number;
}

export default function CanonicalPrimers({ className = '', limit }: CanonicalPrimersProps) {
  const items = limit ? PRIMERS.slice(0, limit) : PRIMERS;

  return (
    <section aria-label="Canonical primers" className={className}>
      <div>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Canonical voices
        </h2>
        <p className="mt-1 max-w-prose text-xs text-white/45">
          S-tier voices only — Stanford, Karpathy, Kleppmann, Manning, attributed curators. Each links into an optional concept pack.
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p => (
          <Link
            key={`${p.author}-${p.title}`}
            to={p.href}
            className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/30 group-hover:text-white/50" />
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-white/70">{p.author}</span>
                <p className="mt-0.5 text-sm font-semibold tracking-tight text-white">{p.title}</p>
                <p className="mt-1 text-[11px] text-white/40">{p.credit}</p>
              </div>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] text-white/35 group-hover:text-white/55">
              Open concept <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}