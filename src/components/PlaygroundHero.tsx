import { ArrowRight, Code2, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaygroundHeroProps {
  className?: string;
  compact?: boolean;
}

export default function PlaygroundHero({ className = '', compact = false }: PlaygroundHeroProps) {
  if (compact) {
    return (
      <Link
        to="/playground"
        className={`group flex items-center justify-between gap-4 rounded-xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-transparent to-violet-500/10 px-4 py-3 transition-colors hover:border-sky-500/35 ${className}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Code2 className="h-5 w-5 shrink-0 text-sky-400" />
          <div>
            <span className="text-sm font-semibold text-white">Playground</span>
            <p className="text-[11px] text-white/45">No learning without an artifact — build here.</p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70" />
      </Link>
    );
  }

  return (
    <section
      aria-label="Playground"
      className={`overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/12 via-black to-violet-500/10 ${className}`}
    >
      <div className="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-sky-400/80">
            <PenTool className="h-3.5 w-3.5" />
            Build wedge
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ship artifacts in the Playground.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Monaco, Excalidraw, Socratic AI, and Feynman grading — every concept maps to something you build.
            Start blank or load a scaffold from any roadmap.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            to="/playground"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90"
          >
            Open Playground
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/build"
            className="font-mono text-[11px] text-white/40 transition-colors hover:text-white/65"
          >
            Browse Build Lab scaffolds →
          </Link>
        </div>
      </div>
    </section>
  );
}