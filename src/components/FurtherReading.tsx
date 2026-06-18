import { BookOpen, ExternalLink, FileText, Link2, PlayCircle } from 'lucide-react';

import {
  type ExternalResource,
  externalResourcesForTags,
} from '../data/learning-os';

const KIND_ICON: Record<ExternalResource['kind'], typeof PlayCircle> = {
  video: PlayCircle,
  course: BookOpen,
  paper: FileText,
  link: Link2,
};

const KIND_LABEL: Record<ExternalResource['kind'], string> = {
  video: 'Video',
  course: 'Course',
  paper: 'Paper',
  link: 'Link',
};

interface Props {
  /** Tag ids to draw resources from, in priority order. */
  tags: string[];
  /** Max items to render. */
  limit?: number;
  /** Section eyebrow — overrides default "Further reading". */
  eyebrow?: string;
}

export function FurtherReading({ tags, limit = 12, eyebrow }: Props) {
  const resources = externalResourcesForTags(tags).slice(0, limit);
  if (resources.length === 0) return null;

  return (
    <section className="section-rule mt-10 pt-8">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          {eyebrow ?? 'Further reading'}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
          {resources.length} curated
        </span>
      </div>

      <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]">
        {resources.map(r => {
          const Icon = KIND_ICON[r.kind] ?? Link2;
          return (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/40 group-hover:text-white/70" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white/80 group-hover:text-white">
                    {r.title}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
                    {KIND_LABEL[r.kind]} · {r.source}
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover:text-white/60" />
              </a>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
        Curated from Developer-Y · attribution preserved per link
      </p>
    </section>
  );
}
