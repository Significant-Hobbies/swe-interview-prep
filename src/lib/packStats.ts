import type { PackCategory, TopicPack } from './topicPack';
import { PACK_CATEGORIES, packHasCategory } from './topicPack';

export const PACK_SLOTS = ['video', 'paper', 'blog', 'book', 'problem', 'write'] as const;
export type PackSlot = (typeof PACK_SLOTS)[number];

export const PACK_SLOT_LABEL: Record<PackSlot, string> = {
  video: 'Video',
  paper: 'Paper',
  blog: 'Blog',
  book: 'Book',
  problem: 'Problem',
  write: 'Write',
};

export function packSlotFilled(pack: TopicPack | undefined, slot: PackSlot): boolean {
  return packHasCategory(pack, slot);
}

export function packFilledCount(pack: TopicPack | undefined): number {
  return PACK_SLOTS.filter(s => packSlotFilled(pack, s)).length;
}

export function packIsFull(pack: TopicPack | undefined): boolean {
  return packFilledCount(pack) === PACK_SLOTS.length;
}

export function packItemCount(pack: TopicPack | undefined): number {
  return pack?.items.length ?? 0;
}

export interface PackCatalogStats {
  total: number;
  full: number;
  averageFilled: number;
  averageItems: number;
  bySlot: Record<PackSlot, number>;
  byCategory: Record<PackCategory, number>;
}

export function catalogPackStats(packs: Record<string, TopicPack>): PackCatalogStats {
  const bySlot = Object.fromEntries(PACK_SLOTS.map(s => [s, 0])) as Record<PackSlot, number>;
  const byCategory = Object.fromEntries(PACK_CATEGORIES.map(c => [c, 0])) as Record<PackCategory, number>;
  let full = 0;
  let filledSum = 0;
  let itemSum = 0;
  const entries = Object.values(packs);

  for (const pack of entries) {
    const n = packFilledCount(pack);
    filledSum += n;
    itemSum += pack.items.length;
    if (packIsFull(pack)) full += 1;
    for (const slot of PACK_SLOTS) {
      if (packSlotFilled(pack, slot)) bySlot[slot] += 1;
    }
    for (const item of pack.items) {
      byCategory[item.category] = (byCategory[item.category] ?? 0) + 1;
    }
  }

  const total = entries.length;
  return {
    total,
    full,
    averageFilled: total ? filledSum / total : 0,
    averageItems: total ? itemSum / total : 0,
    bySlot,
    byCategory,
  };
}