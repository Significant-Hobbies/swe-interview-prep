import { describe, expect, it } from 'vitest';

import artifactsData from './artifacts.json';
import conceptsData from './concepts.json';
import drillsData from './drills.json';
import { TRACKS } from './learning-os';
import projectsData from './projects.json';
import externalResourcesData from './external-resources.json';
import reviewQuestionsData from './review-questions.json';
import roadmapsData from './roadmaps.json';
import { isMetadataDrill } from '../lib/contentQuality';

const concepts = (conceptsData as any).concepts;
const tracks = TRACKS;
const artifacts = (artifactsData as any).artifacts;
const drills = (drillsData as any).drills;
const projects = (projectsData as any).projects;
const reviewQuestions = (reviewQuestionsData as any).reviewQuestions;
const roadmaps = (roadmapsData as any).roadmaps;

const conceptIds = new Set(concepts.map((c: any) => c.id));
const trackIds = new Set(tracks.map((t: any) => t.id));
const artifactIds = new Set(artifacts.map((a: any) => a.id));
const drillIds = new Set(drills.map((d: any) => d.id));
const projectIds = new Set(projects.map((p: any) => p.id));
const reviewQuestionIds = new Set(reviewQuestions.map((q: any) => q.id));

const DIFFICULTIES = ['intro', 'core', 'advanced'];

describe('concept taxonomy', () => {
  it('has at least 100 concepts', () => {
    expect(concepts.length).toBeGreaterThanOrEqual(100);
  });

  it('all ids unique', () => {
    expect(conceptIds.size).toBe(concepts.length);
  });

  it('every concept has required fields', () => {
    for (const c of concepts) {
      expect(c.id, `${c.id} id`).toBeTruthy();
      expect(c.name, `${c.id} name`).toBeTruthy();
      expect(DIFFICULTIES, `${c.id} difficulty`).toContain(c.difficulty);
      expect(c.priority, `${c.id} priority`).toBeGreaterThanOrEqual(1);
      expect(c.priority, `${c.id} priority`).toBeLessThanOrEqual(5);
      expect(Array.isArray(c.prerequisites), `${c.id} prerequisites`).toBe(true);
      expect(Array.isArray(c.related), `${c.id} related`).toBe(true);
      expect(c.description, `${c.id} description`).toBeTruthy();
    }
  });

  it('all prerequisites and related reference existing concept ids', () => {
    const broken: string[] = [];
    for (const c of concepts) {
      for (const p of c.prerequisites) if (!conceptIds.has(p)) broken.push(`${c.id} prereq→${p}`);
      for (const r of c.related) if (!conceptIds.has(r)) broken.push(`${c.id} related→${r}`);
    }
    expect(broken).toEqual([]);
  });

  it('no concept self-references', () => {
    for (const c of concepts) {
      expect(c.prerequisites, c.id).not.toContain(c.id);
    }
  });

  it('prereq DAG has no cycles', () => {
    const map = Object.fromEntries(concepts.map((c: any) => [c.id, c.prerequisites]));
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color: Record<string, number> = {};
    for (const id of conceptIds) color[id as string] = WHITE;
    const cycles: string[] = [];

    function dfs(id: string, path: string[]) {
      if (color[id] === GRAY) {
        cycles.push([...path, id].join('→'));
        return;
      }
      if (color[id] === BLACK) return;
      color[id] = GRAY;
      for (const p of map[id] || []) dfs(p, [...path, id]);
      color[id] = BLACK;
    }
    for (const id of conceptIds) dfs(id as string, []);
    expect(cycles).toEqual([]);
  });

  it('every concept has tags[] with the primary group first', () => {
    for (const c of concepts) {
      expect(Array.isArray(c.tags), `${c.id} tags`).toBe(true);
      expect(c.tags.length, `${c.id} tags non-empty`).toBeGreaterThanOrEqual(1);
      expect(trackIds.has(c.tags[0]), `${c.id} tags[0]=${c.tags[0]} is a known group`).toBe(true);
    }
  });

  it('every concept has roadmaps[] (may be empty)', () => {
    for (const c of concepts) {
      expect(Array.isArray(c.roadmaps), `${c.id} roadmaps`).toBe(true);
    }
  });

  it('every known group has at least 3 concepts', () => {
    const counts: Record<string, number> = {};
    for (const c of concepts) {
      const grp = c.tags?.[0];
      if (grp) counts[grp] = (counts[grp] || 0) + 1;
    }
    for (const t of tracks) {
      expect(counts[t.id] || 0, `group ${t.id}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('preserves all 79 legacy concept ids', () => {
    const legacy = [
      'array-hashing', 'two-pointers', 'sliding-window', 'stack', 'binary-search',
      'linked-list', 'trees', 'tries', 'heap', 'backtracking', 'graphs', 'shortest-path',
      'union-find', 'dp-1d', 'dp-2d', 'greedy', 'intervals', 'math-geometry', 'bit-manipulation',
      'object-modeling', 'state-management', 'strategy-pattern', 'observer-pattern',
      'factory-creational', 'decorator-structural', 'concurrency-design', 'command-chain',
      'booking-inventory', 'game-design', 'load-balancing', 'caching', 'consistent-hashing',
      'sharding', 'replication', 'consensus', 'cap-theorem', 'message-queues', 'rate-limiting',
      'storage-retrieval', 'search-discovery', 'social-media', 'messaging-realtime',
      'streaming-media', 'distributed-infra', 'location-transport', 'ecommerce-payments',
      'collaboration-productivity', 'monitoring-analytics', 'api-design', 'auth-systems',
      'ml-math', 'ml-gradient-descent', 'ml-backprop', 'ml-softmax-xent', 'ml-adamw',
      'ml-tokenization', 'ml-language-modeling', 'ml-sampling', 'ml-embeddings',
      'ml-self-attention', 'ml-multi-head', 'ml-transformer-block', 'ml-training',
      'ml-checkpointing', 'ml-lora', 'ml-data-engineering', 'ml-browser-runtime',
      'ml-webgpu', 'ml-evaluation', 'leadership-and-influence', 'conflict-resolution',
      'problem-solving-and-decision-making', 'teamwork-and-collaboration',
      'failure-and-learning', 'communication', 'time-management-and-prioritization',
      'innovation-and-creativity', 'customer-obsession', 'ownership-and-accountability',
    ];
    const missing = legacy.filter(id => !conceptIds.has(id));
    expect(missing).toEqual([]);
  });
});

describe('cross-file integrity', () => {
  it('concept references resolve to artifacts/drills/review-questions', () => {
    const broken: string[] = [];
    for (const c of concepts) {
      for (const a of c.artifacts || []) if (!artifactIds.has(a)) broken.push(`${c.id} artifact→${a}`);
      for (const d of c.drills || []) if (!drillIds.has(d)) broken.push(`${c.id} drill→${d}`);
      for (const q of c.reviewQuestions || []) if (!reviewQuestionIds.has(q)) broken.push(`${c.id} rq→${q}`);
      for (const p of c.projectApplications || []) if (!projectIds.has(p)) broken.push(`${c.id} project→${p}`);
    }
    expect(broken).toEqual([]);
  });

  it('drills reference existing concepts', () => {
    const broken = drills.filter((d: any) => !conceptIds.has(d.conceptId)).map((d: any) => d.id);
    expect(broken).toEqual([]);
  });

  it('every in-app drill has at least one testCase', () => {
    const missing = drills
      .filter((d: { id: string; testCases?: unknown[] }) => !isMetadataDrill(d as any) && !d.testCases?.length)
      .map((d: { id: string }) => d.id);
    expect(missing).toEqual([]);
  });

  it('concepts link at least one catalog drill when drills exist for conceptId', () => {
    const byConcept = Object.groupBy(
      drills as { id: string; conceptId: string }[],
      d => d.conceptId,
    );
    const unlinked = concepts
      .filter((c: { id: string; drills?: string[] }) => {
        const catalog = byConcept[c.id] ?? [];
        if (!catalog.length) return false;
        const linked = new Set(c.drills ?? []);
        return !catalog.some(d => linked.has(d.id));
      })
      .map((c: { id: string }) => c.id);
    expect(unlinked).toEqual([]);
  });

  it('review questions reference existing concepts', () => {
    const broken = reviewQuestions.filter((q: any) => !conceptIds.has(q.conceptId)).map((q: any) => q.id);
    expect(broken).toEqual([]);
  });

  it('artifacts reference existing concepts and projects', () => {
    const broken: string[] = [];
    for (const a of artifacts) {
      for (const c of a.concepts) if (!conceptIds.has(c)) broken.push(`${a.id} concept→${c}`);
      for (const p of a.projects) if (!projectIds.has(p)) broken.push(`${a.id} project→${p}`);
    }
    expect(broken).toEqual([]);
  });

  it('roadmaps reference existing concepts, drills, artifacts, and tracks', () => {
    const broken: string[] = [];
    for (const r of roadmaps) {
      for (const t of r.tracks) if (!trackIds.has(t)) broken.push(`${r.id} track→${t}`);
      for (const m of r.milestones) {
        for (const c of m.concepts) if (!conceptIds.has(c)) broken.push(`${r.id} concept→${c}`);
        for (const d of m.drills) if (!drillIds.has(d)) broken.push(`${r.id} drill→${d}`);
        for (const a of m.artifacts) if (!artifactIds.has(a)) broken.push(`${r.id} artifact→${a}`);
      }
    }
    expect(broken).toEqual([]);
  });
});

describe('learning loop coverage (roadmap.sh parity bar)', () => {
  const spine = [
    'tokenization', 'bm25', 'ranking-metrics', 'search-evals', 'hybrid-search', 'hnsw', 'rag',
    'hypothesis-testing', 'probability-fundamentals', 'returns-volatility', 'momentum-backtest',
  ];

  it('spine concepts have editorial drills linked', () => {
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const missing: string[] = [];
    for (const id of spine) {
      const c = concepts.find((x: { id: string }) => x.id === id);
      const linked = (c?.drills ?? []).some((did: string) => {
        const d = drillById[did];
        return d && !did.startsWith('drill-');
      });
      if (!linked) missing.push(id);
    }
    expect(missing).toEqual([]);
  });

  it('spine concepts have editorial artifacts linked', () => {
    const missing = spine.filter(id => {
      const c = concepts.find((x: { id: string }) => x.id === id);
      return !(c?.artifacts ?? []).some((aid: string) => !aid.startsWith('build-'));
    });
    expect(missing).toEqual([]);
  });

  it('every concept has at least one review question', () => {
    const missing = concepts.filter((c: { reviewQuestions?: string[] }) => !(c.reviewQuestions?.length));
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('ml-* concepts have editorial drills linked', () => {
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const ml = concepts.filter((c: { id: string }) => c.id.startsWith('ml-'));
    const missing = ml.filter((c: { drills?: string[] }) =>
      !(c.drills ?? []).some((did: string) => {
        const d = drillById[did];
        return d && !did.startsWith('drill-');
      }),
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('catalog has no bootstrap drill-* placeholders', () => {
    const bootstrap = drills.filter((d: { id: string }) => d.id.startsWith('drill-'));
    expect(bootstrap).toEqual([]);
    expect(drills.length).toBeGreaterThanOrEqual(120);
  });

  it('every concept has a drill or review question for practice', () => {
    const missing = concepts.filter(
      (c: { drills?: string[]; reviewQuestions?: string[] }) =>
        !(c.drills?.length) && !(c.reviewQuestions?.length),
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('every concept has at least one editorial drill linked', () => {
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const missing = concepts.filter((c: { id: string; drills?: string[] }) =>
      !(c.drills ?? []).some((did: string) => drillById[did] && !did.startsWith('drill-')),
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('dsa track concepts have editorial drills linked', () => {
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const track = concepts.filter((c: { tags: string[] }) => c.tags.includes('dsa'));
    const missing = track.filter((c: { drills?: string[] }) =>
      !(c.drills ?? []).some((did: string) => {
        const d = drillById[did];
        return d && !did.startsWith('drill-');
      }),
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('dsa and product tracks have editorial drills on priority concepts', () => {
    const priority = [
      'array-hashing', 'two-pointers', 'graphs',
      'leadership-and-influence', 'conflict-resolution',
      'rate-limiting', 'idempotency',
    ];
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const missing = priority.filter(id => {
      const c = concepts.find((x: { id: string }) => x.id === id);
      return !(c?.drills ?? []).some((did: string) => drillById[did] && !did.startsWith('drill-'));
    });
    expect(missing).toEqual([]);
  });

  it('priority external tags have at least 15 curated links', () => {
    const ext = externalResourcesData as { byTag: Record<string, unknown[]> };
    for (const tag of ['mathematics', 'probability', 'statistics', 'quant', 'search-ir', 'vector-db']) {
      expect((ext.byTag[tag] ?? []).length, tag).toBeGreaterThanOrEqual(15);
    }
  });
});
