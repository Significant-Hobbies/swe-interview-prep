import { ArrowRight, BookOpen, Map, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  CONCEPTS,
  ROADMAP_BY_ID,
  ROADMAPS,
  roadmapConceptIds,
  type Roadmap,
} from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { useProfile } from '../hooks/useProfile';
import { deriveConceptStatus, rollupMastery } from '../lib/conceptState';
import { ROADMAP_GROUPS } from '../lib/roadmapGroups';
import { pickNextConceptInRoadmap } from '../lib/recommend';
import { useGateContext } from '../hooks/useGates';

type SearchResult =
  | { kind: 'concept'; id: string; title: string; detail: string; href: string }
  | { kind: 'path'; id: string; title: string; detail: string; href: string };

export default function Learn() {
  const [query, setQuery] = useState('');
  const { mastery } = useConceptMastery();
  const { activeRoadmapId } = useProfile();
  const gateCtx = useGateContext();
  const activeRoadmap = ROADMAP_BY_ID[activeRoadmapId] ?? ROADMAPS[0];
  const activeIds = roadmapConceptIds(activeRoadmap);
  const activeProgress = rollupMastery(activeIds, mastery);
  const nextConcept = pickNextConceptInRoadmap(activeRoadmap, mastery, gateCtx);

  const searchResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const concepts: SearchResult[] = CONCEPTS.filter((concept) =>
      [concept.name, concept.description, ...concept.tags].join(' ').toLowerCase().includes(needle)
    ).map((concept) => ({
      kind: 'concept',
      id: concept.id,
      title: concept.name,
      detail: concept.description,
      href: `/concepts/${concept.id}`,
    }));

    const paths: SearchResult[] = ROADMAPS.filter((roadmap) =>
      [roadmap.title, roadmap.goal, ...roadmap.tracks].join(' ').toLowerCase().includes(needle)
    ).map((roadmap) => ({
      kind: 'path',
      id: roadmap.id,
      title: roadmap.title,
      detail: roadmap.goal,
      href: `/roadmaps/${roadmap.id}`,
    }));

    return [...paths, ...concepts];
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">
      <header className="max-w-3xl">
        <p className="text-sm text-white/55">Learn</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Understand the system.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
          Follow one path or search the complete library when you need something specific.
        </p>
      </header>

      <section className="mt-10" aria-labelledby="learn-search-label">
        <label id="learn-search-label" htmlFor="learn-search" className="sr-only">
          Search all concepts and learning paths
        </label>
        <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/15 bg-white/[0.025] px-4 focus-within:border-white/30">
          <Search className="h-4 w-4 shrink-0 text-white/45" />
          <input
            id="learn-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${CONCEPTS.length} concepts and ${ROADMAPS.length} paths`}
            className="min-w-0 flex-1 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/40"
          />
          <Link
            to="/learn/all"
            className="hidden min-h-11 shrink-0 items-center text-sm text-white/55 hover:text-white sm:inline-flex"
          >
            Browse all
          </Link>
        </div>

        {query.trim() && (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.1] bg-black">
            <div className="flex min-h-11 items-center justify-between border-b border-white/[0.08] px-4 text-xs text-white/50">
              <span>{searchResults.length} matches across the complete catalogue</span>
              <Link to="/learn/all" className="text-white/65 hover:text-white">
                Browse all concepts
              </Link>
            </div>
            {searchResults.length > 0 ? (
              <div className="max-h-[28rem] divide-y divide-white/[0.08] overflow-y-auto">
                {searchResults.slice(0, 20).map((result) => (
                  <Link
                    key={`${result.kind}-${result.id}`}
                    to={result.href}
                    className="flex min-h-20 items-center justify-between gap-5 px-4 py-3 transition-colors hover:bg-white/[0.035]"
                  >
                    <span className="min-w-0">
                      <span className="text-xs text-white/45">
                        {result.kind === 'path' ? 'Path' : 'Concept'}
                      </span>
                      <span className="mt-1 block font-medium text-white">{result.title}</span>
                      <span className="mt-1 block truncate text-sm text-white/50">
                        {result.detail}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/40" />
                  </Link>
                ))}
                {searchResults.length > 20 && (
                  <Link
                    to={`/learn/all?q=${encodeURIComponent(query.trim())}`}
                    className="flex min-h-12 items-center justify-center text-sm text-white/65 hover:text-white"
                  >
                    Show all {searchResults.length} matches
                  </Link>
                )}
              </div>
            ) : (
              <div className="px-4 py-8 text-sm text-white/50">
                No direct match. Browse the complete catalogue or try a broader system name.
              </div>
            )}
          </div>
        )}
        <Link
          to="/learn/all"
          className="mt-2 inline-flex min-h-11 items-center text-sm text-white/55 hover:text-white sm:hidden"
        >
          Browse the complete catalogue
        </Link>
      </section>

      <section className="mt-14 border-t border-white/[0.08] pt-8" aria-labelledby="active-path">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm text-white/55">Active path</p>
            <h2 id="active-path" className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {activeRoadmap.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{activeRoadmap.goal}</p>
          </div>
          <div className="text-right text-sm text-white/50">
            <p className="text-xl font-semibold text-white">
              {activeProgress.mastered}/{activeIds.length}
            </p>
            <p>concepts mastered</p>
          </div>
        </div>

        {nextConcept ? (
          <div className="mt-7 flex flex-col justify-between gap-5 rounded-xl border border-white/[0.1] bg-white/[0.025] p-6 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs text-white/50">Continue learning</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{nextConcept.name}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
                {nextConcept.description}
              </p>
            </div>
            <Link
              to={`/concepts/${nextConcept.id}`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-medium text-black hover:bg-white/90"
            >
              Open concept <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <p className="mt-6 text-sm text-emerald-300">This path is complete.</p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          <Link
            to={`/roadmaps/${activeRoadmap.id}`}
            className="inline-flex min-h-11 items-center gap-2 text-white/65 hover:text-white"
          >
            View active path <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/explore"
            className="inline-flex min-h-11 items-center gap-2 text-white/50 hover:text-white"
          >
            Change path
          </Link>
        </div>
      </section>

      <section className="mt-12 border-t border-white/[0.08] pt-8" aria-labelledby="learn-domains">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-white/55">Browse by domain</p>
            <h2
              id="learn-domains"
              className="mt-2 text-2xl font-semibold tracking-tight text-white"
            >
              Six doors into the library.
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            Complete path catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {ROADMAP_GROUPS.map((group) => (
            <Link
              key={group.id}
              to={`/explore#${group.id}`}
              className="grid min-h-20 gap-2 py-4 transition-colors hover:text-white sm:grid-cols-[12rem_1fr_auto] sm:items-center sm:gap-5"
            >
              <span className="flex items-center gap-2 font-medium text-white/85">
                {group.id === 'software-building' ? (
                  <BookOpen className="h-4 w-4 text-white/40" />
                ) : (
                  <Map className="h-4 w-4 text-white/40" />
                )}
                {group.title}
              </span>
              <span className="text-sm text-white/50">{group.subtitle}</span>
              <span className="text-xs text-white/40">
                {group.roadmapIds.length} path{group.roadmapIds.length === 1 ? '' : 's'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-10 flex flex-wrap gap-x-6 gap-y-1 border-t border-white/[0.08] pt-5 text-sm text-white/55">
        <Link to="/learn/all" className="inline-flex min-h-11 items-center hover:text-white">
          All {CONCEPTS.length} concepts
        </Link>
        <Link to="/explore" className="inline-flex min-h-11 items-center hover:text-white">
          All {ROADMAPS.length} paths
        </Link>
        <Link
          to="/curriculum/"
          reloadDocument
          className="inline-flex min-h-11 items-center hover:text-white"
        >
          Public curriculum
        </Link>
      </footer>
    </div>
  );
}

export function catalogueSearchCount(query: string): { concepts: number; paths: number } {
  const needle = query.trim().toLowerCase();
  if (!needle) return { concepts: 0, paths: 0 };
  return {
    concepts: CONCEPTS.filter((concept) =>
      [concept.name, concept.description, ...concept.tags].join(' ').toLowerCase().includes(needle)
    ).length,
    paths: ROADMAPS.filter((roadmap: Roadmap) =>
      [roadmap.title, roadmap.goal, ...roadmap.tracks].join(' ').toLowerCase().includes(needle)
    ).length,
  };
}
