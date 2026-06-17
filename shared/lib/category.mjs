/**
 * Map a concept's tags[] to one of the legacy "category" buckets used by
 * roadmap-context.json and the weekly-report avoid-list. Pure derivation —
 * no DB, no config. Bridges the tags-only data model to the pre-existing
 * AI prompts and heuristics without restructuring them.
 */
export function categoryForConcept(c) {
  const tags = c?.tags || [];
  if (tags.includes('low-level-design')) return 'lld';
  if (tags.includes('behavioral')) return 'behavioral';
  if (tags[0] === 'ai-systems') return 'ml';
  if (tags[0] === 'system-design') return 'hld';
  return 'dsa';
}
