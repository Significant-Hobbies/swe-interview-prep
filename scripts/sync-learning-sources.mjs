#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = join(HERE, '..');
const FLEET_ROOT = process.env.FLEET_ROOT || join(APP_ROOT, '..');
const OUTPUT = join(APP_ROOT, 'src', 'data', 'learning-sources.json');
const EXCLUDED_PROJECTS = new Set([
  'knowledge-base',
  'open-historia',
  'today-little-log',
  'truehire',
  'verified-bases',
  'companion-robot',
  'device-net-test',
  'forecast-lab',
  'elves-hq',
  'saas-maker-ci-fix',
]);
const ACTIVE_PROJECTS = [
  'saas-maker',
  'free-ai',
  'reel-pipeline',
  'drank',
  'codevetter',
  'starboard',
  'high-signal',
  'aliveville',
  'pace',
  'tinygpt',
  'significanthobbies',
  'reader',
  'anime-list',
  'swe-interview-prep',
  'email-manager',
  'looptv',
  'rolepatch',
  'karte',
  'research-papers',
];
const PROJECT_LABELS = {
  'saas-maker': 'SaaS Maker',
  'free-ai': 'Free AI',
  'reel-pipeline': 'Reel Pipeline',
  drank: 'dRank',
  codevetter: 'CodeVetter',
  starboard: 'Starboard',
  'high-signal': 'High Signal',
  aliveville: 'Aliveville',
  pace: 'Pace',
  tinygpt: 'posttrainllm',
  significanthobbies: 'Significant Hobbies',
  reader: 'Reader',
  'anime-list': 'MAL Explorer',
  'swe-interview-prep': 'SWE Interview Prep',
  'email-manager': 'Email Manager',
  looptv: 'LoopTV',
  rolepatch: 'Rolepatch',
  karte: 'Karte',
  'research-papers': 'Research Papers',
};
const POSTTRAIN_PHASES = [
  {
    title: '0. Prerequisites',
    concepts: [
      'vectors-and-spaces',
      'matrices-and-transformations',
      'probability-fundamentals',
      'descriptive-statistics',
      'derivatives-and-gradients',
    ],
  },
  {
    title: '1. Core ML foundations',
    concepts: ['ml-math', 'ml-gradient-descent', 'ml-backprop', 'ml-softmax-xent', 'ml-adamw'],
  },
  {
    title: '2. Language modeling basics',
    concepts: ['ml-tokenization', 'ml-language-modeling', 'ml-sampling'],
  },
  {
    title: '3. Transformer internals',
    concepts: ['ml-embeddings', 'ml-self-attention', 'ml-multi-head', 'ml-transformer-block'],
  },
  { title: '4. Training and debugging', concepts: ['ml-training', 'ml-checkpointing'] },
  { title: '5. LoRA and adaptation', concepts: ['ml-lora', 'ml-data-engineering'] },
  { title: '6. Browser systems', concepts: ['ml-browser-runtime'] },
  { title: '7. WebGPU acceleration', concepts: ['ml-webgpu'] },
  { title: '8. Evaluation and alignment', concepts: ['ml-evaluation', 'ml-rl-alignment'] },
];
const POSTTRAIN_DOCS_BASE = 'https://github.com/sarthak-fleet/tinygpt/blob/main/docs';

function posttrainDocs(moduleIndex) {
  const shared = [
    {
      title: 'PostTrainLLM guided learning path',
      url: `${POSTTRAIN_DOCS_BASE}/learn.md`,
      type: 'guide',
    },
    {
      title: 'PostTrainLLM 9-phase roadmap',
      url: `${POSTTRAIN_DOCS_BASE}/learning_roadmap.md`,
      type: 'roadmap',
    },
  ];
  if (moduleIndex <= 4) {
    shared.push({
      title: 'Build the model from scratch',
      url: `${POSTTRAIN_DOCS_BASE}/model_guide.md`,
      type: 'guide',
    });
  }
  if (moduleIndex === 5) {
    shared.push({
      title: 'LoRA implementation guide',
      url: `${POSTTRAIN_DOCS_BASE}/lora_guide.md`,
      type: 'guide',
    });
  }
  if (moduleIndex === 6 || moduleIndex === 7) {
    shared.push({
      title: 'Browser, WASM, Workers, and WebGPU notes',
      url: `${POSTTRAIN_DOCS_BASE}/browser_notes.md`,
      type: 'guide',
    });
  }
  if (moduleIndex >= 4) {
    shared.push({
      title: 'PostTrainLLM engineering study guide',
      url: `${POSTTRAIN_DOCS_BASE}/study_guide.md`,
      type: 'guide',
    });
  }
  return shared;
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function lineValue(section, label) {
  return section.match(new RegExp(`^-\\s*${label}:\\s*(.+)$`, 'im'))?.[1]?.trim() || '';
}

function firstUrl(value) {
  return value.match(/https?:\/\/[^\s—)]+/)?.[0] || '';
}

function productId(project) {
  return project === 'tinygpt' ? 'posttrainllm' : project;
}

function hierarchyFor(project, fallbackOrder) {
  const track = PROJECT_LABELS[project] || productId(project);
  return { track, module: 'Project learning', moduleOrder: 1, topicOrder: fallbackOrder + 1 };
}

function nativePosttrainItems() {
  const concepts = JSON.parse(
    readFileSync(join(APP_ROOT, 'src', 'data', 'concepts.json'), 'utf8')
  ).concepts;
  const reviewQuestions = JSON.parse(
    readFileSync(join(APP_ROOT, 'src', 'data', 'review-questions.json'), 'utf8')
  ).reviewQuestions;
  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));
  const reviewById = new Map(reviewQuestions.map((question) => [question.id, question]));

  return POSTTRAIN_PHASES.flatMap((phase, moduleIndex) =>
    phase.concepts.map((conceptId, topicIndex) => {
      const concept = conceptById.get(conceptId);
      if (!concept) throw new Error(`Missing native posttrainllm concept: ${conceptId}`);
      const questions = (concept.reviewQuestions || [])
        .map((id) => reviewById.get(id))
        .filter(Boolean)
        .map(({ id, question, answer, difficulty, type }) => ({
          id,
          question,
          answer,
          difficulty,
          type,
        }));
      return {
        id: `project:posttrainllm:${concept.id}`,
        sourceId: 'project:posttrainllm',
        sourceKind: 'project',
        project: 'posttrainllm',
        title: concept.name,
        summary: concept.mentalModel || concept.description,
        canonicalUrl: `/concepts/${concept.id}`,
        repositoryPath: 'docs/TINYGPT_LEARNING_PATH.md',
        tracks: ['posttrainllm', ...concept.tags],
        hierarchy: {
          track: 'posttrainllm',
          module: phase.title,
          moduleOrder: moduleIndex,
          topicOrder: topicIndex + 1,
        },
        prerequisites: concept.prerequisites || [],
        resources: [...(concept.resources || []), ...posttrainDocs(moduleIndex)],
        reviewQuestions: questions,
        learningNotes: [],
        format: 'native-concept',
        estimatedMinutes: 12,
        fingerprint: hash(JSON.stringify(concept)),
      };
    })
  );
}

function projectItems(project, body, repositoryPath) {
  const publicId = productId(project);
  const label = PROJECT_LABELS[project] || publicId;
  return body
    .split(/^##\s+/m)
    .slice(1)
    .flatMap((chunk, topicIndex) => {
      const title = chunk.split('\n')[0].trim();
      const what = lineValue(chunk, 'What');
      if (!title || !what) return [];
      const gotcha = lineValue(chunk, 'Gotcha \\(from code\\)');
      const source = lineValue(chunk, 'Source');
      const id = `project:${publicId}:${slugify(title)}`;
      return [
        {
          id,
          sourceId: `project:${publicId}`,
          sourceKind: 'project',
          project: label,
          title,
          summary: what,
          canonicalUrl:
            firstUrl(source) ||
            `https://github.com/sarthak-fleet/${project}/blob/main/docs/learning/new-things.md#${slugify(title)}`,
          repositoryPath,
          tracks: [publicId],
          hierarchy: hierarchyFor(project, topicIndex),
          learningNotes: gotcha ? [gotcha] : [],
          format: 'project-note',
          estimatedMinutes: 12,
          fingerprint: hash(`${title}\n${what}\n${gotcha}\n${source}`),
          assessmentSeed: { answer: what, explanation: gotcha || source },
        },
      ];
    });
}

async function loadProjectLearning(project) {
  const learningPath = join(FLEET_ROOT, project, 'docs', 'learning', 'new-things.md');
  if (existsSync(learningPath)) {
    return {
      body: readFileSync(learningPath, 'utf8'),
      repositoryPath: relative(FLEET_ROOT, learningPath),
    };
  }
  const repo = project === 'aliveville' ? 'alive-ville' : project;
  const url = `https://raw.githubusercontent.com/sarthak-fleet/${repo}/main/docs/learning/new-things.md`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return {
      body: await response.text(),
      repositoryPath: `${project}/docs/learning/new-things.md`,
    };
  } catch {
    return null;
  }
}

async function projectSources() {
  const sources = [];
  const items = [];
  for (const project of ACTIVE_PROJECTS) {
    if (EXCLUDED_PROJECTS.has(project)) continue;
    const learning = await loadProjectLearning(project);
    const repo = project === 'aliveville' ? 'alive-ville' : project;
    const publicId = productId(project);
    const next =
      project === 'tinygpt'
        ? nativePosttrainItems()
        : learning
          ? projectItems(project, learning.body, learning.repositoryPath)
          : [];
    items.push(...next);
    sources.push({
      id: `project:${publicId}`,
      kind: 'project',
      label: PROJECT_LABELS[project] || project,
      description:
        next.length > 0
          ? `Learning queue from ${PROJECT_LABELS[project] || project}`
          : `No learning track published yet for ${project}`,
      canonicalUrl:
        project === 'tinygpt'
          ? `https://github.com/sarthak-fleet/${repo}/blob/main/docs/learn.md`
          : `https://github.com/sarthak-fleet/${repo}/blob/main/docs/learning/new-things.md`,
      itemCount: next.length,
      syncStatus: next.length > 0 ? 'fresh' : 'pending',
    });
  }
  return { sources, items };
}

async function researchSources() {
  const path = join(FLEET_ROOT, 'research-papers', 'web', 'src', 'data', 'reading-paths.ts');
  if (!existsSync(path)) return { sources: [], items: [] };
  const { readingPaths = [] } = await import(`${pathToFileURL(path).href}?v=${Date.now()}`);
  const items = readingPaths.flatMap((readingPath) =>
    readingPath.papers.map((paper) => ({
      id: `research:${readingPath.id}:${paper.id}`,
      sourceId: `research:${readingPath.id}`,
      sourceKind: 'research',
      title: paper.title,
      summary: paper.brief,
      canonicalUrl: paper.url,
      repositoryPath: relative(FLEET_ROOT, path),
      tracks: [...readingPath.tracks, ...readingPath.tags],
      collection: readingPath.title,
      format: paper.kind || 'paper',
      estimatedMinutes: paper.kind === 'paper' ? 35 : 20,
      publishedAt: paper.year ? `${paper.year}-01-01` : undefined,
      fingerprint: hash(JSON.stringify(paper)),
      assessmentSeed: { answer: paper.focus, explanation: paper.relation },
    }))
  );
  return {
    sources: readingPaths.map((entry) => ({
      id: `research:${entry.id}`,
      kind: 'research',
      label: entry.title,
      description: entry.outcome,
      canonicalUrl: 'https://research-papers.pages.dev/paths',
      itemCount: entry.papers.length,
      syncStatus: 'fresh',
    })),
    items,
  };
}

function nativeSource() {
  const concepts = JSON.parse(readFileSync(join(APP_ROOT, 'src', 'data', 'concepts.json'), 'utf8'));
  return {
    id: 'swe-native',
    kind: 'native',
    label: 'SWE Interview Prep',
    description: 'Native concepts, roadmaps, drills, builds, and spaced repetition.',
    canonicalUrl: '/learn',
    itemCount: concepts.concepts?.length || 0,
    syncStatus: 'fresh',
  };
}

function dailyBrief() {
  const date = new Date().toISOString().slice(0, 10);
  return {
    source: {
      id: 'high-signal',
      kind: 'briefing',
      label: 'High Signal',
      description: 'Fresh source-backed technology, startup, market, and product briefing.',
      canonicalUrl: 'https://highsignal.app/brief',
      itemCount: 1,
      syncStatus: 'fresh',
    },
    item: {
      id: `briefing:high-signal:${date}`,
      sourceId: 'high-signal',
      sourceKind: 'briefing',
      title: "Today's High Signal brief",
      summary:
        "Start with today's source-backed news briefing, then write one takeaway worth remembering.",
      canonicalUrl: 'https://highsignal.app/brief',
      tracks: ['news', 'technology', 'startups', 'markets'],
      format: 'daily-brief',
      estimatedMinutes: 10,
      publishedAt: date,
      fingerprint: hash(`high-signal:${date}`),
    },
  };
}

function addDerivedAssessments(items) {
  return items.map((item, index) => {
    if (!item.assessmentSeed?.answer) return item;
    const peers = items.filter(
      (candidate) =>
        candidate.id !== item.id &&
        candidate.sourceKind === item.sourceKind &&
        candidate.assessmentSeed?.answer
    );
    const distractors = [];
    for (let offset = 0; offset < peers.length && distractors.length < 3; offset += 1) {
      const answer = peers[(index + offset) % peers.length].assessmentSeed.answer;
      if (answer !== item.assessmentSeed.answer && !distractors.includes(answer))
        distractors.push(answer);
    }
    if (distractors.length < 2) return item;
    const options = [item.assessmentSeed.answer, ...distractors].slice(0, 4);
    const rotation = Number.parseInt(item.fingerprint.slice(0, 2), 16) % options.length;
    const rotated = [...options.slice(rotation), ...options.slice(0, rotation)];
    const { assessmentSeed, ...clean } = item;
    return {
      ...clean,
      assessments: [
        {
          id: `${item.id}:mcq:1`,
          type: 'mcq',
          question:
            item.sourceKind === 'research'
              ? `What is the recommended focus when studying “${item.title}”?`
              : item.sourceKind === 'reader'
                ? `Which takeaway belongs to the saved article “${item.title}”?`
                : `Which statement best describes “${item.title}” in ${item.project}?`,
          options: rotated,
          correctIndex: rotated.indexOf(assessmentSeed.answer),
          explanation: assessmentSeed.explanation || assessmentSeed.answer,
          sourceFingerprint: item.fingerprint,
          generator: 'deterministic-source-v1',
        },
      ],
    };
  });
}

const projects = await projectSources();
const research = await researchSources();
const brief = dailyBrief();
const snapshot = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sources: [
    nativeSource(),
    brief.source,
    ...projects.sources,
    ...research.sources,
    {
      id: 'reader',
      kind: 'reader',
      label: 'Reader',
      description: 'Private saved blogs and articles loaded after Google authentication.',
      canonicalUrl: 'https://reader.sarthakagrawal927.workers.dev',
      itemCount: 0,
      syncStatus: 'pending',
    },
  ],
  items: addDerivedAssessments([brief.item, ...projects.items, ...research.items]),
};

if (snapshot.items.some((item) => item.id.includes('knowledge-base')))
  throw new Error('knowledge-base leaked into registry');
const ids = snapshot.items.map((item) => item.id);
if (new Set(ids).size !== ids.length) throw new Error('duplicate learning item IDs');
if (existsSync(OUTPUT)) {
  const previous = JSON.parse(readFileSync(OUTPUT, 'utf8'));
  const previousContent = JSON.stringify({ sources: previous.sources, items: previous.items });
  const nextContent = JSON.stringify({ sources: snapshot.sources, items: snapshot.items });
  if (previousContent === nextContent) snapshot.generatedAt = previous.generatedAt;
}
writeFileSync(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`);
execFileSync('pnpm', ['exec', 'biome', 'format', '--write', OUTPUT], {
  cwd: APP_ROOT,
  stdio: 'ignore',
});
console.log(`Wrote ${OUTPUT}`);
console.log(`Sources: ${snapshot.sources.length}; items: ${snapshot.items.length}`);
