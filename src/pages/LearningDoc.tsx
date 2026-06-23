import { ArrowLeft, BookOpen, FileText, Hammer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import BrowseLinks from '../components/BrowseLinks';
import FeaturedPaths from '../components/FeaturedPaths';
import MarkdownViewer from '../components/MarkdownViewer';
import { Card, PageShell, SectionTitle } from '../components/ui';
import UnderstandingCheck from '../components/UnderstandingCheck';

// Vite eager-loads every markdown file under docs/learning/ as a raw string.
// The glob path is relative to this file: src/pages → ../../docs/learning.
const docModules = import.meta.glob('../../docs/learning/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// Index by slug (filename without extension) → raw markdown content.
const docs: Record<string, string> = Object.fromEntries(
  Object.entries(docModules).map(([path, content]) => {
    const slug = path.split('/').pop()?.replace(/\.md$/, '');
    return [slug, content];
  })
);

const DEFAULT_SLUG = 'index';

interface DocMeta {
  title: string;
  blurb: string;
  companionRoadmapId?: string;
}

const DOC_META: Record<string, DocMeta> = {
  index: {
    title: 'Learning OS — Start Here',
    blurb: 'Curated roadmaps for systems software. Pick where to start.',
  },
  'db-roadmap': {
    title: 'Disk-First Databases & RAM',
    blurb: 'A mechanism-first internals roadmap distilled from the disk-first DB PDF.',
    companionRoadmapId: 'db-disk-first',
  },
  'runtime-roadmap': {
    title: 'Runtime — what every runtime has to do',
    blurb: 'Cross-cutting view of V8, JVM, Go, BEAM, vLLM, Workers — all do the same five jobs.',
    companionRoadmapId: 'runtime',
  },
  'swe-landscape': {
    title: 'The Software Engineering Landscape (2026)',
    blurb: 'One page per major systems-software domain. Vocabulary first, depth on demand.',
    companionRoadmapId: 'swe-landscape',
  },
  'system-design': {
    title: 'System design — LLD + HLD',
    blurb:
      'Design patterns + classic "design X" problems, in one place. The two halves of system design interviews and real engineering.',
  },
  'interview-prep': {
    title: 'Interview prep — topic checklist',
    blurb:
      'Breadth-first audit of what SWE interviews test — map gaps to in-app roadmaps and drills.',
  },
  'ml-case-studies': {
    title: 'ML system design case studies',
    blurb: '450 real production ML write-ups from company engineering blogs, grouped by category.',
  },
};

// Rewrite intra-doc markdown links so they resolve at /learning/* on the web.
//
//   [foo](./db-roadmap.md)              → [foo](/learning/db-roadmap)
//   [foo](./db-roadmap.md#anchor)       → [foo](/learning/db-roadmap#anchor)
//   [foo](./index.md)                   → [foo](/learning)
function rewriteIntraDocLinks(content: string): string {
  return content
    .replace(/\]\(\.\/index\.md\)/g, '](/learning)')
    .replace(/\]\(\.\/([\w-]+)\.md(#[^)]*)?\)/g, '](/learning/$1$2)');
}

export default function LearningDoc() {
  const { slug } = useParams<{ slug?: string }>();
  const activeSlug = slug || DEFAULT_SLUG;
  const raw = docs[activeSlug];
  const meta = DOC_META[activeSlug];

  if (!raw) {
    return (
      <PageShell>
        <Link
          to="/learning"
          className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Learning OS
        </Link>
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-400">Document not found.</p>
          <p className="mt-1 text-xs text-slate-500">
            Looked for slug: <code>{activeSlug}</code>
          </p>
        </Card>
      </PageShell>
    );
  }

  const content = rewriteIntraDocLinks(raw);
  const allDocs = Object.keys(docs)
    .filter((s) => s !== activeSlug)
    .sort();

  return (
    <PageShell>
      {activeSlug !== DEFAULT_SLUG && (
        <Link
          to="/learning"
          className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Learning OS index
        </Link>
      )}

      {meta?.companionRoadmapId && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <Hammer className="h-4 w-4 text-sky-400" />
            <div>
              <div className="text-sm font-medium text-white">Companion roadmap in /learn</div>
              <div className="text-xs text-slate-500">
                Track your progress through this material with FSRS.
              </div>
            </div>
          </div>
          <Link
            to={`/roadmaps/${meta.companionRoadmapId}`}
            className="shrink-0 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-500/15"
          >
            Open roadmap →
          </Link>
        </div>
      )}

      {activeSlug === DEFAULT_SLUG && (
        <div className="mb-8 space-y-10">
          <FeaturedPaths variant="link" />
          <BrowseLinks />
        </div>
      )}

      <Card className="p-6 sm:p-8 md:p-10">
        <MarkdownViewer content={content} />
      </Card>

      {activeSlug !== DEFAULT_SLUG && (
        <UnderstandingCheck
          docTitle={meta?.title ?? activeSlug}
          docContent={raw}
          docSlug={activeSlug}
        />
      )}

      {activeSlug !== DEFAULT_SLUG && allDocs.length > 0 && (
        <div className="mt-8">
          <SectionTitle>Other docs in the Learning OS</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            {allDocs.map((s) => {
              const m = DOC_META[s];
              const title = m?.title ?? s;
              const blurb = m?.blurb;
              const isIndex = s === DEFAULT_SLUG;
              return (
                <Link
                  key={s}
                  to={isIndex ? '/learning' : `/learning/${s}`}
                  className="group flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900/70"
                >
                  {isIndex ? (
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                  ) : (
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500 group-hover:text-slate-300" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{title}</span>
                      {isIndex && (
                        <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-300">
                          Start here
                        </span>
                      )}
                    </div>
                    {blurb && <div className="mt-0.5 text-xs text-slate-500">{blurb}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </PageShell>
  );
}
