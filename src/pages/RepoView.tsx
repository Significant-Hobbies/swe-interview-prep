import { ArrowLeft, BookOpen, Dumbbell, ExternalLink, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function RepoView() {
  const { repoSlug = '' } = useParams();
  const { getRepo } = useLibrary();
  const repo = getRepo(repoSlug);
  const { content, loading, error } = useRepoContent(repoSlug);
  const [active, setActive] = useState<Section | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<'read' | 'practice'>('read');

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
      <header className="flex min-h-14 items-center justify-between gap-4 border-b border-white/10 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/library"
            aria-label="Back to Library"
            className="text-white/45 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="truncate text-sm font-semibold text-white">{repo.name}</h1>
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
              <aside
                className={`${sidebarOpen ? 'flex' : 'hidden'} absolute inset-y-0 left-0 z-30 w-72 flex-col border-r border-white/10 bg-black md:static md:flex`}
              >
                <div className="border-b border-white/10 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                  Repository sections
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  <SectionTree
                    sections={content.sections}
                    activeSectionId={active?.id || null}
                    onSelect={(section) => {
                      setActive(section);
                      setSidebarOpen(false);
                    }}
                  />
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
