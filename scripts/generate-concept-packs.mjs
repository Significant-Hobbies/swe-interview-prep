#!/usr/bin/env node
/**
 * Build concept-packs.json — optional items per concept:
 * { category, title, url, body? }[]
 *
 * Filled external links must be S-tier (catalog + concept.resources).
 *
 * Run: pnpm sync:concept-packs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isSTierSource } from './source-tier.mjs';
import { CONCEPT_LIBRARY_LINKS, sTierSlotsForConcept } from './s-tier-catalog.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const concepts = JSON.parse(readFileSync(join(root, 'src/data/concepts.json'), 'utf8')).concepts;
const drills = JSON.parse(readFileSync(join(root, 'src/data/drills.json'), 'utf8')).drills;

const drillById = Object.fromEntries(drills.map((d) => [d.id, d]));
const MEDIA_SLOTS = ['video', 'paper', 'blog', 'book'];
const MORE_CAP = 3;

function writePrompt(c) {
  const anchor = (c.mentalModel?.split(/[.!?]/)[0] ?? c.description).trim();
  return `Explain "${c.name}" in three sentences a junior engineer would understand — no jargon you can't define. Cover: ${anchor}`;
}

function buildPack(concept) {
  const items = [];
  const seen = new Set();
  const filledMedia = new Set();
  let moreCount = 0;

  function itemKey(category, url, title) {
    if (url) return `${category}:${url}`;
    return `${category}:${title}`;
  }

  function add(category, title, url, slotForTier, body) {
    const k = itemKey(category, url, title);
    if (seen.has(k)) return false;
    if (url && (MEDIA_SLOTS.includes(category) || category === 'more')) {
      if (!isSTierSource(title, url, slotForTier ?? category)) return false;
    }
    const item = { category, title, url };
    if (body) item.body = body;
    items.push(item);
    seen.add(k);
    if (MEDIA_SLOTS.includes(category)) filledMedia.add(category);
    if (category === 'more') moreCount++;
    return true;
  }

  const catalogSlots = sTierSlotsForConcept(concept);
  for (const slot of MEDIA_SLOTS) {
    const link = catalogSlots[slot];
    if (link?.url) add(slot, link.title, link.url, slot);
  }

  // Vendored-repo sections, before external `more` links. The 27 repos under
  // src/data/library/ are the owner's preferred resource layer but reached the
  // concept page only through a separate panel; these put them on the card.
  for (const link of CONCEPT_LIBRARY_LINKS[concept.id] ?? []) {
    add('more', link.title, link.url);
  }

  for (const r of concept.resources ?? []) {
    let placed = false;
    for (const slot of MEDIA_SLOTS) {
      if (filledMedia.has(slot)) continue;
      if (isSTierSource(r.title, r.url, slot)) {
        if (add(slot, r.title, r.url, slot)) {
          placed = true;
          break;
        }
      }
    }
    if (
      !placed &&
      moreCount < MORE_CAP &&
      ![...MEDIA_SLOTS].some((s) => items.some((i) => i.category === s && i.url === r.url))
    ) {
      add('more', r.title, r.url);
    }
  }

  const primaryUrls = new Set(
    items.filter((i) => MEDIA_SLOTS.includes(i.category)).map((i) => i.url)
  );
  const pack = {
    items: items.filter((i) => i.category !== 'more' || !primaryUrls.has(i.url)),
  };

  const drillId = concept.drills?.[0];
  if (drillId && drillById[drillId]) {
    pack.items.push({
      category: 'problem',
      title: drillById[drillId].title,
      url: `/drills/${drillId}`,
    });
  }

  pack.items.push({
    category: 'write',
    title: 'Explain back',
    url: '',
    body: writePrompt(concept),
  });

  return pack;
}

const packs = {};
const stats = { video: 0, paper: 0, blog: 0, book: 0, problem: 0, write: 0, more: 0, items: 0 };
const violations = [];

/**
 * Pack items already checked in that this run would not reproduce.
 *
 * The catalog in s-tier-catalog.mjs is hand-maintained and always incomplete,
 * so people curate links straight into concept-packs.json. Regenerating used to
 * silently delete every one of them: a sync run dropped 27 verified links
 * (RouteLLM, the PAIR guidebook, the NIST AI RMF PDF, and 24 per-concept
 * sources added for concepts that previously had none) and reinstated the
 * track-anchor blog in their place.
 *
 * So: the catalog owns the default slots, a human's extra link is kept. Kept
 * items still pass the same S-tier gate as generated ones — nothing skips
 * review by virtue of being hand-added.
 *
 * The catch is telling a human's link apart from a PREVIOUS generator run's
 * output. Naively keeping everything unreproduced meant that retiring a catalog
 * entry never took effect: reordering TAG_PRIORITY so the Gang-of-Four concepts
 * got the GoF book instead of Designing Data-Intensive Applications left both
 * on the card. So anything the catalog is capable of emitting — for any concept
 * — is treated as generator output and dropped when this run does not re-emit
 * it. Only URLs the catalog has never heard of count as curated.
 */
let existingPacks = {};
try {
  existingPacks = JSON.parse(readFileSync(join(root, 'src/data/concept-packs.json'), 'utf8')).packs;
} catch {
  existingPacks = {};
}

/** Every URL the catalog can produce, across all concepts. */
const catalogUrls = new Set();
for (const concept of concepts) {
  for (const link of Object.values(sTierSlotsForConcept(concept))) {
    if (link?.url) catalogUrls.add(link.url);
  }
}

function preserveCurated(conceptId, pack) {
  const previous = existingPacks[conceptId]?.items ?? [];
  const generated = new Set(pack.items.map((i) => i.url).filter(Boolean));
  for (const item of previous) {
    if (!item.url || generated.has(item.url)) continue;
    // Superseded catalog output, not a human's link.
    if (catalogUrls.has(item.url)) continue;
    if (
      !isSTierSource(
        item.title,
        item.url,
        MEDIA_SLOTS.includes(item.category) ? item.category : undefined
      )
    ) {
      continue;
    }
    pack.items.push(item);
  }
  return pack;
}

for (const c of concepts) {
  const pack = preserveCurated(c.id, buildPack(c));
  packs[c.id] = pack;

  for (const item of pack.items) {
    stats[item.category] = (stats[item.category] ?? 0) + 1;
    stats.items++;
    if (MEDIA_SLOTS.includes(item.category) && item.url) {
      if (!isSTierSource(item.title, item.url, item.category)) {
        violations.push({ id: c.id, category: item.category, title: item.title, url: item.url });
      }
    }
    if (item.category === 'more' && item.url) {
      if (!isSTierSource(item.title, item.url)) {
        violations.push({ id: c.id, category: 'more', title: item.title, url: item.url });
      }
    }
  }
}

const out = {
  version: 3,
  generatedAt: new Date().toISOString().slice(0, 10),
  _meta: {
    tier: 'S',
    optional: true,
    schema: 'items',
    stats,
  },
  packs,
};

writeFileSync(join(root, 'src/data/concept-packs.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log('Wrote concept-packs.json (items schema)', stats);

if (violations.length) {
  console.error('S-tier violations:', violations.length);
  violations.slice(0, 20).forEach((v) => console.error(`  ${v.id} ${v.category}: ${v.title}`));
  process.exitCode = 1;
}
