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

function projectItems(project, body, repositoryPath) {
  return body
    .split(/^##\s+/m)
    .slice(1)
    .flatMap((chunk) => {
      const title = chunk.split('\n')[0].trim();
      const what = lineValue(chunk, 'What');
      if (!title || !what) return [];
      const gotcha = lineValue(chunk, 'Gotcha \\(from code\\)');
      const source = lineValue(chunk, 'Source');
      const id = `project:${project}:${slugify(title)}`;
      return [
        {
          id,
          sourceId: `project:${project}`,
          sourceKind: 'project',
          project,
          title,
          summary: what,
          canonicalUrl:
            firstUrl(source) ||
            `https://github.com/sarthak-fleet/${project}/blob/main/docs/learning/new-things.md#${slugify(title)}`,
          repositoryPath,
          tracks: project === 'tinygpt' ? ['posttrainllm', 'tinygpt'] : [project],
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
    const next = learning ? projectItems(project, learning.body, learning.repositoryPath) : [];
    items.push(...next);
    sources.push({
      id: `project:${project}`,
      kind: 'project',
      label: PROJECT_LABELS[project] || project,
      description:
        next.length > 0
          ? `Learning queue from ${PROJECT_LABELS[project] || project}`
          : `No learning track published yet for ${project}`,
      canonicalUrl: `https://github.com/sarthak-fleet/${repo}/blob/main/docs/learning/new-things.md`,
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
