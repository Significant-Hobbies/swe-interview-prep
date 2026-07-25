import { BookOpen, ChevronDown, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  type LibrarySection,
  loadSectionContent,
  useAmbientSections,
} from '../hooks/useAmbientLibrary';
import MarkdownViewer from './MarkdownViewer';
import { Card, SectionTitle } from './ui';

/**
 * Surfaces the embedded repository library on the concept page. The corpus was
 * previously reachable only from one optional Playground panel, so the concept
 * page — the natural place to go deeper — never showed any of it.
 */
export default function ConceptLibrary({ conceptId }: { conceptId: string }) {
  const sections = useAmbientSections([conceptId]);
  if (sections.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>From the library</SectionTitle>
        <Link to="/library" className="text-[11px] text-white/40 hover:text-white">
          Browse all
        </Link>
      </div>
      <p className="mt-1 text-xs text-white/45">
        Matching sections from the embedded open-source repositories.
      </p>
      <div className="mt-3 space-y-1.5">
        {sections.map((section) => (
          <LibraryRow key={`${section.repoId}/${section.sectionId}`} section={section} />
        ))}
      </div>
    </Card>
  );
}

function LibraryRow({ section }: { section: LibrarySection }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || content) return;
    setLoading(true);
    loadSectionContent(section.repoId, section.sectionId)
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, content, section.repoId, section.sectionId]);

  return (
    <div className="rounded-md border border-white/[0.08]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
      >
        {open ? (
          <ChevronDown className="mt-0.5 h-3 w-3 shrink-0 text-white/35" />
        ) : (
          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-white/35" />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium text-white/85">{section.title}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40">
            <BookOpen className="h-2.5 w-2.5" /> {section.repoName}
          </span>
          {!open && section.snippet && (
            <span className="mt-1 line-clamp-2 text-[10px] leading-snug text-white/40">
              {section.snippet}
            </span>
          )}
        </span>
      </button>
      {open && (
        <div className="border-t border-white/[0.08] p-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </div>
          ) : content ? (
            <>
              <div className="prose-sm prose-invert max-w-none text-xs">
                <MarkdownViewer content={content.slice(0, 6000)} />
              </div>
              <Link
                to={`/library/${section.repoId}?section=${encodeURIComponent(section.sectionId)}`}
                className="mt-3 inline-flex items-center gap-1 text-[11px] text-sky-300 hover:text-sky-200"
              >
                Open in reader <ExternalLink className="h-3 w-3" />
              </Link>
            </>
          ) : (
            <div className="text-xs text-white/40">No content available.</div>
          )}
        </div>
      )}
    </div>
  );
}
