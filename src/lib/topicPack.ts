import drillsData from '../data/drills.json';
import type { Concept, Resource } from '../data/learning-os';

const DRILL_BY_ID = Object.fromEntries(
  ((drillsData as { drills: { id: string; title: string }[] }).drills ?? []).map((d) => [d.id, d])
);

export const PACK_CATEGORIES = [
  'video',
  'paper',
  'blog',
  'book',
  'problem',
  'write',
  'more',
] as const;
export type PackCategory = (typeof PACK_CATEGORIES)[number];

export type PackMediaSlot = Extract<PackCategory, 'video' | 'paper' | 'blog' | 'book'>;

export interface PackItem {
  category: PackCategory;
  title: string;
  url: string;
  /** Long-form text (e.g. Feynman explain-back prompt for write items). */
  body?: string;
}

export interface TopicPack {
  items: PackItem[];
}

/** @deprecated Use PackItem — kept for resource classification helpers. */
export interface PackLink {
  title: string;
  url: string;
}

export const PACK_CATEGORY_LABEL: Record<PackCategory, string> = {
  video: 'Video',
  paper: 'Paper',
  blog: 'Blog',
  book: 'Book',
  problem: 'Problem',
  write: 'Write',
  more: 'Also worth reading',
};

const BOOK_HINT =
  /book|ostep|dataintensive|cvxbook|ir-book|craftinginterpreters|db-book|sre\.google\/books|use-the-index|mitpress\.mit\.edu|deeplearningbook|statlearning|inference\.org\.uk\/itprnn|oreilly\.com\/library|jeffe\.cs\.illinois\.edu\/teaching\/algorithms/i;
const PAPER_HINT =
  /arxiv\.org|\.pdf(\?|#|$)|acm\.org|usenix\.org|openreview|doi\.org|research\.google\/pubs|rfc-editor\.org\/rfc|papers\.ssrn\.com|lamport\.azurewebsites\.net|infoq\.com\/articles|sre\.google\/sre-book|plg\.uwaterloo\.ca|microsoft\.com\/en-us\/research/i;
const VIDEO_HINT = /youtube\.com|youtu\.be|vimeo\.com|3blue1brown\.com\/lessons/i;
const BLOG_HINT =
  /blog\.|\.io\/learn|\.io\/posts|lilianweng|karpathy\.github|jalammar|eugeneyan|jvns\.ca|martinfowler|engineering\.at|medium\.com|refactoring\.guru/i;

const MEDIA_SLOTS: PackMediaSlot[] = ['video', 'paper', 'blog', 'book'];
const PRIMARY_CATEGORIES: PackCategory[] = ['video', 'paper', 'blog', 'book', 'problem', 'write'];

export function classifyResource(r: Resource): PackMediaSlot | null {
  if (r.type === 'paper') return 'paper';
  if (r.type === 'video') return 'video';
  if (PAPER_HINT.test(r.url)) return 'paper';
  if (VIDEO_HINT.test(r.url)) return 'video';
  if (BOOK_HINT.test(r.url) || BOOK_HINT.test(r.title ?? '')) return 'book';
  if (BLOG_HINT.test(r.url)) return 'blog';
  if (r.type === 'article') return 'blog';
  if (r.type === 'course') {
    if (VIDEO_HINT.test(r.url)) return 'video';
    return 'book';
  }
  if (r.type === 'doc') {
    if (/wikipedia\.org|docs\.|guide|tutorial|handbook/i.test(r.url)) return 'blog';
    return 'book';
  }
  return null;
}

function classifyLooseUrl(title: string, url: string, kind?: string): PackMediaSlot | null {
  return classifyResource({
    title,
    url,
    type: (kind === 'video' ||
    kind === 'course' ||
    kind === 'paper' ||
    kind === 'article' ||
    kind === 'doc'
      ? kind
      : 'doc') as Resource['type'],
  });
}

export function writePromptForConcept(concept: Concept): string {
  const anchor = concept.mentalModel?.split(/[.!?]/)[0]?.trim() ?? concept.description;
  return `Explain "${concept.name}" in three sentences a junior engineer would understand — no jargon you can't define. Cover: ${anchor}`;
}

function packItem(category: PackCategory, title: string, url: string, body?: string): PackItem {
  return body ? { category, title, url, body } : { category, title, url };
}

export function packItemText(item: PackItem): string {
  return item.body ?? item.title;
}

export function packHasCategory(pack: TopicPack | undefined, category: PackCategory): boolean {
  return Boolean(pack?.items.some((i) => i.category === category));
}

export function buildTopicPack(concept: Concept, extraLinks: PackLink[] = []): TopicPack {
  const items: PackItem[] = [];
  const seen = new Set<string>();
  const filledMedia = new Set<PackMediaSlot>();

  function key(category: PackCategory, url: string, title: string) {
    return url || `${category}:${title}`;
  }

  let moreCount = 0;
  const MORE_CAP = 3;

  function add(category: PackCategory, title: string, url: string, body?: string) {
    const k = key(category, url, title);
    if (seen.has(k)) return;
    if (category === 'more' && moreCount >= MORE_CAP) return;
    items.push(packItem(category, title, url, body));
    seen.add(k);
    if (MEDIA_SLOTS.includes(category as PackMediaSlot)) {
      filledMedia.add(category as PackMediaSlot);
    }
    if (category === 'more') moreCount++;
  }

  function takeMedia(slot: PackMediaSlot, title: string, url: string) {
    if (filledMedia.has(slot)) {
      add('more', title, url);
      return;
    }
    add(slot, title, url);
  }

  for (const r of concept.resources ?? []) {
    const slot = classifyResource(r);
    if (slot) takeMedia(slot, r.title, r.url);
    else add('more', r.title, r.url);
  }

  for (const link of extraLinks) {
    const slot = classifyLooseUrl(link.title, link.url);
    if (slot) takeMedia(slot, link.title, link.url);
    else add('more', link.title, link.url);
  }

  const drillId = concept.drills?.[0];
  if (drillId) {
    const drill = DRILL_BY_ID[drillId];
    add('problem', drill?.title ?? drillId, `/drills/${drillId}`);
  }

  add('write', 'Explain back', '', writePromptForConcept(concept));

  return { items };
}

export function packCompleteness(pack: TopicPack): {
  filled: number;
  total: number;
  missing: string[];
} {
  const missing: string[] = [];
  let filled = 0;
  const total = PRIMARY_CATEGORIES.length;

  for (const category of PRIMARY_CATEGORIES) {
    if (packHasCategory(pack, category)) filled++;
    else missing.push(`${PACK_CATEGORY_LABEL[category]} (optional)`);
  }

  return { filled, total, missing };
}
