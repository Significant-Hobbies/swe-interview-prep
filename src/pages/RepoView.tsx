import { ArrowLeft, BookOpen, Dumbbell, ExternalLink, Menu, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import type { Section } from '../adapters/types';
import ExerciseRunner from '../components/ExerciseRunner';
import MarkdownViewer from '../components/MarkdownViewer';
import SectionTree from '../components/SectionTree';
import { useLibrary, useRepoContent } from '../hooks/useLibrary';

const SKIP_TITLES =
  /^(contribut|code.of.conduct|license|changelog|security|funding|sponsors|table.of.contents)/i;

function firstReadableSection(sections: Section[]): Section | null {
  for (const section of sections) {
    if (section.content?.length >= 200 && !SKIP_TITLES.test(section.title)) return section;
    const child = section.children ? firstReadableSection(section.children) : null;
    if (child) return child;
  }
  return null;
}

function filterSections(sections: Section[], query: string): Section[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return sections;
  return sections.flatMap((section) => {
    const children = section.children ? filterSections(section.children, query) : [];
    const matches =
      section.title.toLowerCase().includes(normalized) ||
      section.content.toLowerCase().includes(normalized);
    return matches || children.length > 0 ? [{ ...section, children }] : [];
  });
}

export default function RepoView() {
  const { repoSlug = '' } = useParams();
  const { getRepo } = useLibrary();
  const repo = getRepo(repoSlug);
  const { content, loading, error } = useRepoContent(repoSlug);
  const [active, setActive] = useState<Section | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<'read' | 'practice'>('read');
  const [sectionQuery, setSectionQuery] = useState('');
  const visibleSections = useMemo(
    () => filterSections(content.sections, sectionQuery),
    [content.sections, sectionQuery]
  );

  useEffect(() => {
    setActive(null);
    setSectionQuery('');
  }, [repoSlug]);

  useEffect(() => {
    if (!loading && !active) setActive(firstReadableSection(content.sections));
  }, [active, content.sections, loading]);

  if (!repo) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-bold text-white">Repository not found</h1>
        <Link to="/library" className="mt-6 inline-flex text-sky-300">
          Back to Library
        </Link>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100vh-4rem)] flex-col">
      <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/library"
            aria-label="Back to Library"
            className="text-white/45 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-white">{repo.name}</h1>
            <p className="hidden truncate text-[11px] text-white/35 lg:block">{repo.bestFor}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {content.exercises.length > 0 && (
            <div className="flex rounded-md border border-white/10 bg-white/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => setMode('read')}
                aria-label="Read repository"
                className={`rounded px-2.5 py-1 text-xs ${mode === 'read' ? 'bg-white text-black' : 'text-white/45 hover:text-white'}`}
              >
                <BookOpen className="h-3.5 w-3.5 sm:hidden" />
                <span className="hidden sm:inline">Read</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('practice')}
                aria-label="Practice repository exercises"
                className={`rounded px-2.5 py-1 text-xs ${mode === 'practice' ? 'bg-white text-black' : 'text-white/45 hover:text-white'}`}
              >
                <Dumbbell className="h-3.5 w-3.5 sm:hidden" />
                <span className="hidden sm:inline">Practice</span>
              </button>
            </div>
          )}
          <a
            href={repo.source}
            target="_blank"
            rel="noreferrer"
            aria-label="Open repository on GitHub"
            className="text-white/45 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label="Toggle sections"
            className="text-white/45 md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-white/45">
          Loading repository…
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-rose-300">{error}</div>
      ) : (
        <div className="relative flex min-h-0 flex-1">
          {mode === 'practice' ? (
            <section className="min-w-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
              <ExerciseRunner exercises={content.exercises} repoName={repo.name} />
            </section>
          ) : (
            <>
              {sidebarOpen && (
                <button
                  type="button"
                  aria-label="Close sections"
                  onClick={() => setSidebarOpen(false)}
                  className="absolute inset-0 z-20 bg-black/70 md:hidden"
                />
              )}
              <aside
                className={`${sidebarOpen ? 'flex' : 'hidden'} absolute inset-y-0 left-0 z-30 w-[min(22rem,calc(100vw-3rem))] flex-col border-r border-white/10 bg-black md:static md:flex md:w-80`}
              >
                <div className="border-b border-white/10 p-3">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                    <input
                      value={sectionQuery}
                      onChange={(event) => setSectionQuery(event.target.value)}
                      placeholder="Find a topic"
                      className="h-9 w-full rounded-md border border-white/10 bg-white/[0.04] pl-8 pr-3 text-xs text-white outline-none placeholder:text-white/30 focus:border-sky-400/50"
                    />
                  </label>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  {visibleSections.length > 0 ? (
                    <SectionTree
                      sections={visibleSections}
                      activeSectionId={active?.id || null}
                      onSelect={(section) => {
                        setActive(section);
                        setSidebarOpen(false);
                      }}
                    />
                  ) : (
                    <p className="px-3 py-8 text-center text-xs text-white/35">No matching topic</p>
                  )}
                </div>
              </aside>
              <article className="min-w-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8 lg:px-12">
                {active?.content ? (
                  <MarkdownViewer content={active.content} sourceBaseUrl={repo.sourceBaseUrl} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-white/40">
                    <BookOpen className="mb-3 h-7 w-7" />
                    Select a section to start reading
                  </div>
                )}
              </article>
            </>
          )}
        </div>
      )}
    </main>
  );
}
