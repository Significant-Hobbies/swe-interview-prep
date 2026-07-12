import { BookOpen, ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useLibrary } from '../hooks/useLibrary';

export default function Library() {
  const { repos, search } = useLibrary();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => search(query), [query, search]);

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-6 md:py-16">
      <header className="border-b border-white/10 pb-10">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky-300/70">
          Embedded repository library
        </span>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Learn from the original repositories.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">
          {repos.length} curated GitHub repositories, indexed into readable sections with their
          original hierarchy and practice material intact.
        </p>
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
      <section className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((repo) => (
          <article key={repo.id} className="flex min-h-64 flex-col bg-black p-5">
            <div className="flex items-start justify-between gap-4">
              <BookOpen className="h-5 w-5 text-sky-300" />
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
            <div className="mt-4 text-xs text-white/35">
              {repo.sectionCount} sections · {repo.exerciseCount} exercises
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
    </main>
  );
}
