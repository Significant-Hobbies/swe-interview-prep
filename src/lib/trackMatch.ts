/**
 * Maps free-form content tags onto `TRACKS[].id`.
 *
 * Library repos and learning-source items were tagged independently of the
 * track taxonomy, so a profile's `trackIds` cannot be compared to them
 * directly. This is the one place that reconciles the two vocabularies.
 */

/** Extra tags that count as belonging to a track, beyond the track id itself. */
const TRACK_ALIASES: Record<string, string[]> = {
  'search-ir': ['search', 'information-retrieval', 'retrieval', 'rag'],
  mathematics: ['math', 'linear-algebra', 'probability', 'statistics', 'calculus'],
  'vector-db': ['vector', 'embeddings', 'ann'],
  'ai-systems': ['ai', 'llm', 'llms', 'machine-learning', 'transformers', 'language-modeling'],
  backend: ['api', 'http', 'server', 'full-stack'],
  databases: ['database', 'storage', 'sql'],
  'system-design': [
    'architecture',
    'scalability',
    'lld',
    'oop',
    'design-patterns',
    'uml',
    'design',
  ],
  dsa: ['algorithms', 'data-structures', 'coding', 'patterns', 'leetcode'],
  product: ['startups', 'markets', 'career', 'behavioral'],
  'systems-foundations': ['linux', 'operating-systems', 'networking'],
  'infrastructure-platforms': ['devops', 'docker', 'kubernetes', 'cloud', 'platform'],
  'distributed-systems': ['distributed', 'consensus', 'replication'],
  'inference-serving': ['inference', 'serving', 'runtime', 'quantization'],
  'agent-systems': ['agents', 'agent', 'tools', 'mcp'],
  'ai-reliability': ['evals', 'safety', 'ai-safety', 'alignment', 'robustness'],
  'developer-tools': ['tooling', 'ide', 'cli', 'testing'],
  'application-engineering': [
    'frontend',
    'javascript',
    'typescript',
    'react',
    'html',
    'css',
    'web',
    'mobile',
    'projects',
    'programming',
  ],
  'multimodal-spatial': ['vision', 'multimodal', 'audio', 'robotics', '3d'],
};

function normalize(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

/** Track ids implied by a set of free-form tags. */
function tracksForTags(tags: readonly string[]): Set<string> {
  const normalized = new Set(tags.map(normalize));
  const out = new Set<string>();
  for (const [trackId, aliases] of Object.entries(TRACK_ALIASES)) {
    if (normalized.has(trackId) || aliases.some((a) => normalized.has(a))) out.add(trackId);
  }
  // A tag that IS a track id counts even without an alias entry.
  for (const tag of normalized) {
    if (Object.hasOwn(TRACK_ALIASES, tag)) out.add(tag);
  }
  return out;
}

/**
 * True when the learner has not narrowed tracks (`filter === null`) or these
 * tags belong to at least one selected track.
 */
export function tagsMatchTracks(tags: readonly string[], filter: Set<string> | null): boolean {
  if (!filter) return true;
  const tracks = tracksForTags(tags);
  for (const trackId of tracks) if (filter.has(trackId)) return true;
  return false;
}
