import drillsData from '../data/drills.json';
import type { Concept, Resource } from '../data/learning-os';

const DRILL_BY_ID = Object.fromEntries(
  ((drillsData as { drills: { id: string; title: string }[] }).drills ?? []).map(d => [d.id, d]),
);

export type PackMediaSlot = 'video' | 'paper' | 'blog' | 'book';

export interface PackLink {
  title: string;
  url: string;
}

export interface PackProblem {
  drillId: string;
  title: string;
}

export interface PackWrite {
  /** Feynman-style explain-back prompt for this topic. */
  prompt: string;
}

export interface TopicPack {
  video?: PackLink;
  paper?: PackLink;
  blog?: PackLink;
  book?: PackLink;
  problem?: PackProblem;
  write: PackWrite;
  /** Additional curated links beyond the four media slots. */
  more: PackLink[];
}

export const PACK_SLOT_ORDER: PackMediaSlot[] = ['video', 'paper', 'blog', 'book'];

export const PACK_SLOT_LABEL: Record<PackMediaSlot, string> = {
  video: 'Video',
  paper: 'Paper',
  blog: 'Blog',
  book: 'Book',
};

const BOOK_HINT =
  /book|ostep|dataintensive|cvxbook|ir-book|craftinginterpreters|db-book|sre\.google\/books|use-the-index/i;
const PAPER_HINT = /arxiv\.org|\.pdf(\?|#|$)|acm\.org|usenix\.org|openreview|doi\.org/i;
const VIDEO_HINT = /youtube\.com|youtu\.be|vimeo\.com|3blue1brown\.com\/lessons/i;
const BLOG_HINT = /blog\.|\.io\/learn|\.io\/posts|lilianweng|karpathy\.github|jalammar|eugeneyan|jvns\.ca|martinfowler/i;

export function classifyResource(r: Resource): PackMediaSlot | null {
  if (r.type === 'video') return 'video';
  if (r.type === 'paper') return 'paper';
  if (r.type === 'article') return 'blog';
  if (r.type === 'course') {
    if (VIDEO_HINT.test(r.url)) return 'video';
    return 'book';
  }
  if (r.type === 'doc') {
    if (PAPER_HINT.test(r.url)) return 'paper';
    if (VIDEO_HINT.test(r.url)) return 'video';
    if (BOOK_HINT.test(r.url)) return 'book';
    if (BLOG_HINT.test(r.url)) return 'blog';
    if (/wikipedia\.org|docs\.|guide|tutorial|handbook/i.test(r.url)) return 'blog';
    return 'book';
  }
  return null;
}

export function classifyLooseUrl(title: string, url: string, kind?: string): PackMediaSlot | null {
  return classifyResource({
    title,
    url,
    type: (kind === 'video' || kind === 'course' || kind === 'paper' || kind === 'article' || kind === 'doc'
      ? kind
      : 'doc') as Resource['type'],
  });
}

export function writePromptForConcept(concept: Concept): string {
  const anchor = concept.mentalModel?.split(/[.!?]/)[0]?.trim() ?? concept.description;
  return `Explain "${concept.name}" in three sentences a junior engineer would understand — no jargon you can't define. Cover: ${anchor}`;
}

export function buildTopicPack(concept: Concept, extraLinks: PackLink[] = []): TopicPack {
  const pack: TopicPack = {
    write: { prompt: writePromptForConcept(concept) },
    more: [],
  };

  const seen = new Set<string>();
  function take(slot: PackMediaSlot, link: PackLink) {
    if (pack[slot] || seen.has(link.url)) return;
    pack[slot] = link;
    seen.add(link.url);
  }

  for (const r of concept.resources ?? []) {
    const slot = classifyResource(r);
    if (slot) take(slot, { title: r.title, url: r.url });
    else pack.more.push({ title: r.title, url: r.url });
  }

  for (const link of extraLinks) {
    const slot = classifyLooseUrl(link.title, link.url);
    if (slot) take(slot, link);
    else if (!seen.has(link.url)) {
      pack.more.push(link);
      seen.add(link.url);
    }
  }

  const drillId = concept.drills?.[0];
  if (drillId) {
    const drill = DRILL_BY_ID[drillId];
    pack.problem = { drillId, title: drill?.title ?? drillId };
  }

  pack.more = pack.more.filter(l => !seen.has(l.url));
  return pack;
}

export function packCompleteness(pack: TopicPack): { filled: number; total: number; missing: string[] } {
  const missing: string[] = [];
  let filled = 0;
  const total = 6;

  for (const slot of PACK_SLOT_ORDER) {
    if (pack[slot]) filled++;
    else missing.push(PACK_SLOT_LABEL[slot]);
  }
  if (pack.problem) filled++;
  else missing.push('Problem');
  if (pack.write?.prompt) filled++;
  else missing.push('Write');

  return { filled, total, missing };
}