import { BookOpen, ChevronDown, ChevronRight, ExternalLink,Loader2 } from 'lucide-react';
import { useEffect,useState } from 'react';

import { type LibrarySection,loadSectionContent, useAmbientSections } from '../hooks/useAmbientLibrary';
import MarkdownViewer from './MarkdownViewer';

interface Props {
  conceptIds: string[];
}

export default function AmbientLibrary({ conceptIds }: Props) {
  const sections = useAmbientSections(conceptIds);

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex h-9 items-center justify-between border-b border-slate-800 px-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <BookOpen className="h-3 w-3 text-emerald-400" />
          Ambient Library
        </div>
        <span className="text-[10px] text-slate-500">{sections.length} pinned</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {conceptIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-500 px-4">
            <BookOpen className="h-6 w-6 mb-2 text-slate-600" />
            <p className="leading-relaxed">
              Sections auto-pin when the tagger detects a concept in your code.
            </p>
          </div>
        ) : sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-500 px-4">
            No matching library sections yet for: {conceptIds.join(', ')}
          </div>
        ) : (
          sections.map(s => <SectionRow key={`${s.repoId}/${s.sectionId}`} section={s} />)
        )}
      </div>
    </div>
  );
}

function SectionRow({ section }: { section: LibrarySection }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || content) return;
    setLoading(true);
    // eslint-disable-next-line promise/catch-or-return
    loadSectionContent(section.repoId, section.sectionId)
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, content, section.repoId, section.sectionId]);

  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/40">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-2 px-2.5 py-2 text-left transition-colors hover:bg-slate-900/80"
      >
        {open ? <ChevronDown className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-500" /> : <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-500" />}
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-slate-200">{section.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="truncate text-emerald-400/70">{section.repoName}</span>
          </div>
          {!open && section.snippet && (
            <div className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-500">
              {section.snippet}
            </div>
          )}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-800 p-3">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </div>
          ) : content ? (
            <div className="prose-sm prose-invert max-w-none text-xs">
              <MarkdownViewer content={content.slice(0, 8000)} />
              {content.length > 8000 && (
                <div className="mt-2 text-[10px] italic text-slate-500">
                  Truncated. Open repo for full content.
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500">No content available.</div>
          )}
        </div>
      )}
    </div>
  );
}
