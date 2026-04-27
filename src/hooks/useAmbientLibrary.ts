import { useMemo } from 'react';

import indexData from '../data/library/concept-index.json';

export interface LibrarySection {
  repoId: string;
  repoName: string;
  sectionId: string;
  title: string;
  snippet: string;
}

const INDEX: Record<string, LibrarySection[]> = indexData as any;

/** Returns sections for the given concept ids, deduped by sectionId, capped at 6. */
export function useAmbientSections(conceptIds: string[]): LibrarySection[] {
  return useMemo(() => {
    const seen = new Set<string>();
    const out: LibrarySection[] = [];
    for (const cid of conceptIds) {
      const sections = INDEX[cid];
      if (!sections) continue;
      for (const s of sections) {
        const key = `${s.repoId}/${s.sectionId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(s);
        if (out.length >= 6) return out;
      }
    }
    return out;
  }, [conceptIds]);
}

// Vite glob: lazy-load each content.json on demand. Returns map of importer fns.
const CONTENT_LOADERS = import.meta.glob('../data/library/*/content.json');

export async function loadSectionContent(repoId: string, sectionId: string): Promise<string> {
  const key = `../data/library/${repoId}/content.json`;
  const loader = (CONTENT_LOADERS as any)[key];
  if (!loader) return '';
  try {
    const mod = await loader();
    const data = mod.default || mod;
    const section = (data.sections || []).find((s: any) => s.id === sectionId);
    return section?.content || '';
  } catch {
    return '';
  }
}
