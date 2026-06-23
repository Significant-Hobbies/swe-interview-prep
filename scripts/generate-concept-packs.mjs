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
import { sTierSlotsForConcept } from './s-tier-catalog.mjs';

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

for (const c of concepts) {
  const pack = buildPack(c);
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
