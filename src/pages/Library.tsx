import { BookOpen, Dumbbell, ExternalLink, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useLibrary } from '../hooks/useLibrary';

export default function Library() {
  const { repos, search, generatedAt } = useLibrary();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => search(query), [query, search]);
  const totals = useMemo(
    () => ({
      sections: repos.reduce((sum, repo) => sum + repo.sectionCount, 0),
      exercises: repos.reduce((sum, repo) => sum + repo.exerciseCount, 0),
    }),
    [repos]
  );
  const refreshed = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(generatedAt));

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-6 md:py-16">
      <header className="border-b border-white/10 pb-8">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky-300/70">
          Embedded repository library
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          The best open learning repositories, made readable.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
          Original sources stay intact. Fleet adds consistent navigation, focused practice, and a
          reader that works on every screen.
        </p>
        <dl className="mt-6 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-4">
          <div className="bg-black px-4 py-3">
            <dt className="text-[10px] uppercase text-white/35">Sources</dt>
            <dd className="mt-1 text-lg font-semibold text-white">{repos.length}</dd>
          </div>
          <div className="bg-black px-4 py-3">
            <dt className="text-[10px] uppercase text-white/35">Topics</dt>
            <dd className="mt-1 text-lg font-semibold text-white">
              {totals.sections.toLocaleString()}
            </dd>
          </div>
          <div className="bg-black px-4 py-3">
            <dt className="text-[10px] uppercase text-white/35">Exercises</dt>
            <dd className="mt-1 text-lg font-semibold text-white">
              {totals.exercises.toLocaleString()}
            </dd>
          </div>
          <div className="bg-black px-4 py-3">
            <dt className="text-[10px] uppercase text-white/35">Refreshed</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/75">
              <RefreshCw className="h-3.5 w-3.5" /> {refreshed}
            </dd>
          </div>
        </dl>
      </header>
      <label className="relative my-6 block max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search repositories, topics, or technologies"
          className="h-11 w-full rounded-md border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-sky-400/50"
        />
      </label>
      <div className="mb-3 flex items-center justify-between text-xs text-white/35">
        <span>{filtered.length} repositories</span>
        {query && <span>Matching “{query}”</span>}
      </div>
      <section className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((repo) => (
          <article key={repo.id} className="flex min-h-80 flex-col bg-black p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-300" />
                <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase text-white/40">
                  {repo.format?.replace('-', ' ') || 'reference'}
                </span>
              </div>
              <a
                href={repo.source}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${repo.name} on GitHub`}
                className="text-white/35 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <h2 className="mt-5 text-lg font-semibold text-white">{repo.name}</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">{repo.description}</p>
            <p className="mt-4 border-l-2 border-emerald-400/40 pl-3 text-xs leading-5 text-white/65">
              <span className="font-medium text-white/85">Best for:</span> {repo.bestFor}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {repo.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-white/[0.06] px-2 py-1 text-[10px] text-white/40"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-white/35">
              <span>{repo.sectionCount.toLocaleString()} topics</span>
              {repo.exerciseCount > 0 && (
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" /> {repo.exerciseCount.toLocaleString()}
                </span>
              )}
            </div>
            <Link
              to={`/library/${repo.id}`}
              className="mt-auto pt-6 text-sm font-medium text-sky-300 hover:text-sky-200"
            >
              Browse repository
            </Link>
          </article>
        ))}
      </section>
      {filtered.length === 0 && (
        <div className="border-x border-b border-white/10 px-5 py-12 text-center text-sm text-white/45">
          No repository matches that search.
        </div>
      )}
    </main>
  );
}
