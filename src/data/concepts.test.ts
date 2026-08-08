import { describe, expect, it } from 'vitest';

import artifactsData from './artifacts.json';
import conceptsData from './concepts.json';
import curriculumCoverageData from './curriculum-coverage.json';
import drillsData from './drills.json';
import { TRACKS } from './learning-os';
import projectsData from './projects.json';
import externalResourcesData from './external-resources.json';
import reviewQuestionsData from './review-questions.json';
import roadmapsData from './roadmaps.json';
import { isMetadataDrill } from '../lib/contentQuality';
import { ROADMAP_GROUPS } from '../lib/roadmapGroups';

const concepts = (conceptsData as any).concepts;
const tracks = TRACKS;
const artifacts = (artifactsData as any).artifacts;
const drills = (drillsData as any).drills;
const projects = (projectsData as any).projects;
const reviewQuestions = (reviewQuestionsData as any).reviewQuestions;
const roadmaps = (roadmapsData as any).roadmaps;
const curriculumCoverage = curriculumCoverageData as {
  categories: { id: string; topics: { name: string; concepts: string[] }[] }[];
  preservedConceptIds: string[];
};

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
    const WHITE = 0,
      GRAY = 1,
      BLACK = 2;
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
      'array-hashing',
      'two-pointers',
      'sliding-window',
      'stack',
      'binary-search',
      'linked-list',
      'trees',
      'tries',
      'heap',
      'backtracking',
      'graphs',
      'shortest-path',
      'union-find',
      'dp-1d',
      'dp-2d',
      'greedy',
      'intervals',
      'math-geometry',
      'bit-manipulation',
      'object-modeling',
      'state-management',
      'strategy-pattern',
      'observer-pattern',
      'factory-creational',
      'decorator-structural',
      'concurrency-design',
      'command-chain',
      'booking-inventory',
      'game-design',
      'load-balancing',
      'caching',
      'consistent-hashing',
      'sharding',
      'replication',
      'consensus',
      'cap-theorem',
      'message-queues',
      'rate-limiting',
      'storage-retrieval',
      'search-discovery',
      'social-media',
      'messaging-realtime',
      'streaming-media',
      'distributed-infra',
      'location-transport',
      'ecommerce-payments',
      'collaboration-productivity',
      'monitoring-analytics',
      'api-design',
      'auth-systems',
      'ml-math',
      'ml-gradient-descent',
      'ml-backprop',
      'ml-softmax-xent',
      'ml-adamw',
      'ml-tokenization',
      'ml-language-modeling',
      'ml-sampling',
      'ml-embeddings',
      'ml-self-attention',
      'ml-multi-head',
      'ml-transformer-block',
      'ml-training',
      'ml-checkpointing',
      'ml-lora',
      'ml-data-engineering',
      'ml-browser-runtime',
      'ml-webgpu',
      'ml-evaluation',
      'leadership-and-influence',
      'conflict-resolution',
      'problem-solving-and-decision-making',
      'teamwork-and-collaboration',
      'failure-and-learning',
      'communication',
      'time-management-and-prioritization',
      'innovation-and-creativity',
      'customer-obsession',
      'ownership-and-accountability',
    ];
    const missing = legacy.filter((id) => !conceptIds.has(id));
    expect(missing).toEqual([]);
  });

  // The point of this test is that the domain expansion never DROPS a
  // hand-authored concept. It used to assert an exact count of 152, which also
  // blocked adding one — `complexity-analysis`, `sorting`, `capacity-estimation`
  // and `requirements-scoping` all tripped it. A floor plus the
  // nothing-went-missing check preserves the guarantee without freezing the
  // catalog.
  it('preserves every concept id that existed before the domain expansion', () => {
    expect(curriculumCoverage.preservedConceptIds.length).toBeGreaterThanOrEqual(152);
    const missing = curriculumCoverage.preservedConceptIds.filter((id) => !conceptIds.has(id));
    expect(missing).toEqual([]);
  });
});

describe('eleven-domain curriculum expansion', () => {
  const addedTrackIds = [
    'systems-foundations',
    'infrastructure-platforms',
    'distributed-systems',
    'inference-serving',
    'agent-systems',
    'ai-reliability',
    'developer-tools',
    'application-engineering',
    'multimodal-spatial',
  ];

  it('maps the requested taxonomy plus two machine-level foundation gaps', () => {
    expect(curriculumCoverage.categories).toHaveLength(11);
    const topics = curriculumCoverage.categories.flatMap((category) => category.topics);
    expect(topics).toHaveLength(98);

    const broken = topics.flatMap((topic) => {
      if (!topic.concepts.length) return [`${topic.name} has no concepts`];
      return topic.concepts.filter((id) => !conceptIds.has(id)).map((id) => `${topic.name}→${id}`);
    });
    expect(broken).toEqual([]);
  });

  it('sequences both machine-level foundation concepts before operating systems', () => {
    const roadmap = roadmaps.find((candidate: any) => candidate.id === 'systems-foundations-12w');
    const firstMilestone = roadmap?.milestones?.[0];
    const sequence = firstMilestone?.concepts ?? [];

    for (const id of ['data-representation', 'program-memory-model']) {
      const concept = concepts.find((candidate: any) => candidate.id === id);
      const drill = drills.find((candidate: any) => candidate.id === concept?.drills?.[0]);
      const review = reviewQuestions.find(
        (candidate: any) => candidate.id === concept?.reviewQuestions?.[0]
      );

      expect(concept?.mentalModel, `${id} mental model`).toBeTruthy();
      expect(concept?.resources?.[0]?.url, `${id} primary source`).toMatch(/^https:\/\//);
      expect(drill?.testCases?.length, `${id} executable drill`).toBeGreaterThan(0);
      expect(review?.question, `${id} explain-back`).toBeTruthy();
      expect(sequence.indexOf(id), `${id} is on the first milestone`).toBeGreaterThanOrEqual(0);
      expect(sequence.indexOf(id), `${id} precedes operating systems`).toBeLessThan(
        sequence.indexOf('operating-system-mechanics')
      );
    }

    expect(
      concepts.find((candidate: any) => candidate.id === 'operating-system-mechanics')
        ?.prerequisites
    ).toEqual(['data-representation', 'program-memory-model', 'compute-memory-storage-hierarchy']);
  });

  it('uses a raw-socket HTTP server as the Systems Foundations capstone', () => {
    const artifact = artifacts.find(
      (candidate: any) => candidate.id === 'synthesize-systems-foundations-12w'
    );
    const evidence = [
      artifact?.description,
      ...(artifact?.successCriteria ?? []),
      ...(artifact?.deliverables ?? []),
    ].join(' ');

    expect(evidence).toMatch(/raw TCP sockets/i);
    expect(evidence).toMatch(/HTTP\/1\.1/i);
    expect(evidence).toMatch(/partial reads and writes/i);
    expect(evidence).toMatch(/p50\/p95 latency/i);
    expect(evidence).toMatch(/failure|malformed|slow client/i);
    expect(artifact?.concepts).toEqual(
      expect.arrayContaining(['data-representation', 'program-memory-model'])
    );
  });

  it('keeps every added domain first-class and practice-backed', () => {
    for (const id of addedTrackIds) {
      expect(trackIds.has(id), `${id} is a known track`).toBe(true);
      const owned = concepts.filter((concept: any) => concept.tags?.[0] === id);
      expect(owned.length, `${id} owns concepts`).toBeGreaterThanOrEqual(3);
      for (const concept of owned) {
        expect(concept.drills?.length, `${concept.id} drills`).toBeGreaterThan(0);
        expect(concept.reviewQuestions?.length, `${concept.id} reviews`).toBeGreaterThan(0);
        expect(concept.roadmaps?.length, `${concept.id} roadmaps`).toBeGreaterThan(0);
      }
    }
  });

  it('gives every generated concept a source, drill, review, roadmap, and synthesis artifact', () => {
    const generated = concepts.filter(
      (concept: any) => concept.curriculumSource === 'learning-domain-expansion-v1'
    );
    // A floor, not an equality. The guarantee this test exists for is the
    // per-concept loop below — that nothing generated ships without a source,
    // a drill, a review card, a roadmap and an artifact. Pinning the exact
    // count also forbade RETIRING one, which is what merging the duplicate
    // observability and real-time concepts into their hand-authored
    // equivalents does.
    expect(generated.length).toBeGreaterThanOrEqual(60);
    for (const concept of generated) {
      expect(concept.resources?.length, `${concept.id} resources`).toBeGreaterThan(0);
      expect(concept.drills?.length, `${concept.id} drills`).toBeGreaterThan(0);
      expect(concept.reviewQuestions?.length, `${concept.id} reviews`).toBeGreaterThan(0);
      expect(concept.roadmaps?.length, `${concept.id} roadmaps`).toBeGreaterThan(0);
      expect(concept.artifacts?.length, `${concept.id} artifacts`).toBeGreaterThan(0);
    }
  });

  it('groups every roadmap exactly once', () => {
    const grouped = ROADMAP_GROUPS.flatMap((group) => group.roadmapIds);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect(new Set(grouped)).toEqual(new Set(roadmaps.map((roadmap: any) => roadmap.id)));
  });
});

describe('Trace a Tensor synthesis', () => {
  const lifecycle = [
    'data-representation',
    'ml-backprop',
    'compute-memory-storage-hierarchy',
    'runtime-performance-engineering',
    'inference-hardware',
    'gpu-utilization',
    'flashattention-kernels',
    'model-quantization',
    'inference-engines',
    'continuous-batching',
    'inference-cost-latency',
  ];

  it('orders the tensor lifecycle from representation to serving economics', () => {
    const roadmap = roadmaps.find((candidate: any) => candidate.id === 'trace-a-tensor');

    expect(roadmap?.horizon).toBe('30d');
    expect(roadmap?.milestones).toHaveLength(4);
    expect(roadmap?.milestones.flatMap((milestone: any) => milestone.concepts)).toEqual(lifecycle);
    expect(roadmap?.milestones.at(-1)?.artifacts).toEqual(['trace-a-tensor-capstone']);
  });

  it('reuses resolvable concepts and executable drills at every milestone', () => {
    const roadmap = roadmaps.find((candidate: any) => candidate.id === 'trace-a-tensor');
    const broken: string[] = [];

    for (const milestone of roadmap?.milestones ?? []) {
      if (!milestone.drills.length) broken.push(`${milestone.title} has no drills`);
      for (const id of milestone.concepts) {
        const concept = concepts.find((candidate: any) => candidate.id === id);
        if (!concept) broken.push(`missing concept ${id}`);
        if (!concept?.roadmaps?.includes('trace-a-tensor')) broken.push(`${id} missing roadmap`);
      }
      for (const id of milestone.drills) {
        const drill = drills.find((candidate: any) => candidate.id === id);
        if (!drill?.testCases?.length) broken.push(`${id} is not executable`);
      }
    }

    expect(broken).toEqual([]);
  });

  it('requires a measured bottleneck diagnosis and defended optimization', () => {
    const artifact = artifacts.find((candidate: any) => candidate.id === 'trace-a-tensor-capstone');
    const evidence = [
      artifact?.description,
      ...(artifact?.successCriteria ?? []),
      ...(artifact?.deliverables ?? []),
    ].join(' ');

    expect(artifact?.concepts).toEqual(lifecycle);
    expect(evidence).toMatch(/layer map/i);
    expect(evidence).toMatch(/reproducible workload|executable performance model/i);
    expect(evidence).toMatch(/before\/after/i);
    expect(evidence).toMatch(/bottleneck|constraint/i);
    expect(evidence).toMatch(/quality|numerical correctness/i);
    expect(evidence).toMatch(/trade-off|remaining risk/i);

    for (const id of lifecycle) {
      const concept = concepts.find((candidate: any) => candidate.id === id);
      expect(concept?.artifacts, id).toContain('trace-a-tensor-capstone');
    }
  });
});

describe('cross-file integrity', () => {
  it('concept references resolve to artifacts/drills/review-questions', () => {
    const broken: string[] = [];
    for (const c of concepts) {
      for (const a of c.artifacts || [])
        if (!artifactIds.has(a)) broken.push(`${c.id} artifact→${a}`);
      for (const d of c.drills || []) if (!drillIds.has(d)) broken.push(`${c.id} drill→${d}`);
      for (const q of c.reviewQuestions || [])
        if (!reviewQuestionIds.has(q)) broken.push(`${c.id} rq→${q}`);
      for (const p of c.projectApplications || [])
        if (!projectIds.has(p)) broken.push(`${c.id} project→${p}`);
    }
    expect(broken).toEqual([]);
  });

  it('drills reference existing concepts', () => {
    const broken = drills.filter((d: any) => !conceptIds.has(d.conceptId)).map((d: any) => d.id);
    expect(broken).toEqual([]);
  });

  it('every in-app drill has at least one testCase', () => {
    const missing = drills
      .filter(
        (d: { id: string; testCases?: unknown[] }) =>
          !isMetadataDrill(d as any) && !d.testCases?.length
      )
      .map((d: { id: string }) => d.id);
    expect(missing).toEqual([]);
  });

  it('concepts link at least one catalog drill when drills exist for conceptId', () => {
    const byConcept = Object.groupBy(
      drills as { id: string; conceptId: string }[],
      (d) => d.conceptId
    );
    const unlinked = concepts
      .filter((c: { id: string; drills?: string[] }) => {
        const catalog = byConcept[c.id] ?? [];
        if (!catalog.length) return false;
        const linked = new Set(c.drills ?? []);
        return !catalog.some((d) => linked.has(d.id));
      })
      .map((c: { id: string }) => c.id);
    expect(unlinked).toEqual([]);
  });

  it('review questions reference existing concepts', () => {
    const broken = reviewQuestions
      .filter((q: any) => !conceptIds.has(q.conceptId))
      .map((q: any) => q.id);
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
    'tokenization',
    'bm25',
    'ranking-metrics',
    'search-evals',
    'hybrid-search',
    'hnsw',
    'rag',
    'hypothesis-testing',
    'probability-fundamentals',
    'returns-volatility',
    'momentum-backtest',
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
    const missing = spine.filter((id) => {
      const c = concepts.find((x: { id: string }) => x.id === id);
      return !(c?.artifacts ?? []).some((aid: string) => !aid.startsWith('build-'));
    });
    expect(missing).toEqual([]);
  });

  it('every concept has at least one review question', () => {
    const missing = concepts.filter(
      (c: { reviewQuestions?: string[] }) => !c.reviewQuestions?.length
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('ml-* concepts have editorial drills linked', () => {
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const ml = concepts.filter((c: { id: string }) => c.id.startsWith('ml-'));
    const missing = ml.filter(
      (c: { drills?: string[] }) =>
        !(c.drills ?? []).some((did: string) => {
          const d = drillById[did];
          return d && !did.startsWith('drill-');
        })
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
        !c.drills?.length && !c.reviewQuestions?.length
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('every concept has at least one editorial drill linked', () => {
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const missing = concepts.filter(
      (c: { id: string; drills?: string[] }) =>
        !(c.drills ?? []).some((did: string) => drillById[did] && !did.startsWith('drill-'))
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('dsa track concepts have editorial drills linked', () => {
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const track = concepts.filter((c: { tags: string[] }) => c.tags.includes('dsa'));
    const missing = track.filter(
      (c: { drills?: string[] }) =>
        !(c.drills ?? []).some((did: string) => {
          const d = drillById[did];
          return d && !did.startsWith('drill-');
        })
    );
    expect(missing.map((c: { id: string }) => c.id)).toEqual([]);
  });

  it('dsa and product tracks have editorial drills on priority concepts', () => {
    const priority = [
      'array-hashing',
      'two-pointers',
      'graphs',
      'leadership-and-influence',
      'conflict-resolution',
      'rate-limiting',
      'idempotency',
    ];
    const drillById = Object.fromEntries(drills.map((d: { id: string }) => [d.id, d]));
    const missing = priority.filter((id) => {
      const c = concepts.find((x: { id: string }) => x.id === id);
      return !(c?.drills ?? []).some((did: string) => drillById[did] && !did.startsWith('drill-'));
    });
    expect(missing).toEqual([]);
  });

  it('priority external tags have at least 15 curated links', () => {
    const ext = externalResourcesData as { byTag: Record<string, unknown[]> };
    for (const tag of [
      'mathematics',
      'probability',
      'statistics',
      'quant',
      'search-ir',
      'vector-db',
    ]) {
      expect((ext.byTag[tag] ?? []).length, tag).toBeGreaterThanOrEqual(15);
    }
  });

  it('foundational ML concepts list multiple canonical sources', () => {
    const multiSource = [
      'ml-self-attention',
      'ml-gradient-descent',
      'ml-backprop',
      'ml-training',
      'derivatives-and-gradients',
    ];
    for (const id of multiSource) {
      const c = concepts.find((x: { id: string }) => x.id === id);
      expect(c?.resources?.length ?? 0, id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('scope boundaries', () => {
  // Several concepts overlap by design — six evaluation cards, three
  // reliability cards, three sandboxing cards. The audit's complaint was not
  // that they duplicate each other but that "a learner cannot tell which card
  // owns LLM-as-judge calibration". Each now carries a `Scope:` line naming
  // what it owns and pointing at its neighbours by id. A rename that leaves one
  // of those pointers dangling would silently send the reader nowhere.
  it('every concept id referenced in a scope line exists', () => {
    const ids = new Set(concepts.map((c: { id: string }) => c.id));
    const dangling: string[] = [];
    for (const concept of concepts as { id: string; mentalModel?: string }[]) {
      const scope = concept.mentalModel?.split('Scope: this card owns')[1];
      if (!scope) continue;
      for (const [, ref] of scope.matchAll(/`([a-z0-9-]+)`/g)) {
        if (!ids.has(ref)) dangling.push(`${concept.id} -> ${ref}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it('overlapping clusters all declare their scope', () => {
    const clustered = [
      'ml-evaluation',
      'llm-evals',
      'ai-regression-testing',
      'quality-cost-latency-measurement',
      'coding-agent-benchmarks',
      'tool-use-evaluations',
      'reliability-fault-tolerance',
      'distributed-failure-recovery',
      'retries-dlq',
      'security-isolation-boundaries',
      'sandbox-execution-environments',
      'agent-permissions-sandboxing',
      'ml-browser-runtime',
      'ml-webgpu',
      'local-on-device-inference',
    ];
    const byId = new Map(
      (concepts as { id: string; mentalModel?: string }[]).map((c) => [c.id, c])
    );
    const missing = clustered.filter(
      (id) => !byId.get(id)?.mentalModel?.includes('Scope: this card owns')
    );
    expect(missing).toEqual([]);
  });
});
