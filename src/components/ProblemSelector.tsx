import { ArrowUpRight, Check, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { CONCEPT_BY_ID, type Drill, PRACTICE_DRILLS } from '../data/learning-os';

export function filterPracticeProblems(query: string): Drill[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return PRACTICE_DRILLS;
  return PRACTICE_DRILLS.filter((drill) => {
    const concept = CONCEPT_BY_ID[drill.conceptId];
    return [drill.title, drill.prompt, drill.type, drill.difficulty, concept?.name ?? '']
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });
}

export function ProblemSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (drill: Drill) => void;
}) {
  const [query, setQuery] = useState('');
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const results = useMemo(() => filterPracticeProblems(query), [query]);

  return (
    <details ref={detailsRef} className="group relative shrink-0">
      <summary
        aria-label={`Choose a practice problem. ${PRACTICE_DRILLS.length} available`}
        className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-white/[0.1] px-3 text-xs font-medium text-white/70 transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
      >
        <Search className="h-3.5 w-3.5" />
        Problems
        <span className="font-mono text-[10px] text-white/40">{PRACTICE_DRILLS.length}</span>
      </summary>
      <div className="fixed inset-x-3 top-[10.25rem] z-50 overflow-hidden rounded-xl border border-white/15 bg-black shadow-[0_18px_48px_rgba(0,0,0,0.55)] lg:absolute lg:inset-x-auto lg:left-0 lg:top-full lg:mt-2 lg:w-[32rem]">
        <div className="flex min-h-12 items-center gap-3 border-b border-white/[0.08] px-4">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search every practice problem"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
            aria-label="Search every practice problem"
          />
        </div>
        <div className="flex min-h-10 items-center justify-between border-b border-white/[0.08] px-4 text-xs text-white/45">
          <span>{results.length} problems</span>
          <Link
            to="/practice/all"
            className="inline-flex min-h-10 items-center gap-1 text-white/65 hover:text-white"
          >
            Browse complete catalogue <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="max-h-[min(31rem,calc(100vh-13rem))] divide-y divide-white/[0.08] overflow-y-auto">
          {results.slice(0, 40).map((drill) => {
            const external = Boolean(drill.externalUrl);
            const concept = CONCEPT_BY_ID[drill.conceptId];
            const content = (
              <>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white/85">
                    {drill.title}
                  </span>
                  <span className="mt-1 block truncate text-xs text-white/45">
                    {concept?.name ?? drill.conceptId} · {drill.difficulty}
                    {external ? ' · external' : ''}
                  </span>
                </span>
                {selectedId === drill.id ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-300" aria-label="Selected" />
                ) : external ? (
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35" />
                ) : null}
              </>
            );

            if (external && drill.externalUrl) {
              return (
                <a
                  key={drill.id}
                  href={drill.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-white/[0.035]"
                >
                  {content}
                </a>
              );
            }

            return (
              <button
                key={drill.id}
                type="button"
                onClick={() => {
                  onSelect(drill);
                  detailsRef.current?.removeAttribute('open');
                }}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-white/[0.035]"
              >
                {content}
              </button>
            );
          })}
          {results.length === 0 && (
            <p className="px-4 py-8 text-sm text-white/50">
              No match. Browse the complete catalogue to inspect every problem.
            </p>
          )}
          {results.length > 40 && (
            <Link
              to={`/practice/all?q=${encodeURIComponent(query.trim())}`}
              className="flex min-h-12 items-center justify-center text-sm text-white/65 hover:text-white"
            >
              Show all {results.length} results
            </Link>
          )}
        </div>
      </div>
    </details>
  );
}
