#!/usr/bin/env node
/**
 * Fill learning-loop gaps: every concept gets drill + RQ;
 * roadmap milestone concepts get a scaffold artifact when missing.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../src/data');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
}
function save(name, data) {
  fs.writeFileSync(path.join(dataDir, name), `${JSON.stringify(data, null, 2)}\n`);
}

const conceptsData = load('concepts.json');
const drillsData = load('drills.json');
const rqsData = load('review-questions.json');
const artifactsData = load('artifacts.json');
const roadmapsData = load('roadmaps.json');

const concepts = conceptsData.concepts;
const drills = drillsData.drills;
const reviewQuestions = rqsData.reviewQuestions;
const artifacts = artifactsData.artifacts;

const conceptById = Object.fromEntries(concepts.map(c => [c.id, c]));
const drillIds = new Set(drills.map(d => d.id));
const rqIds = new Set(reviewQuestions.map(q => q.id));
const artifactIds = new Set(artifacts.map(a => a.id));

const drilledConcepts = new Set(drills.map(d => d.conceptId));
const rqConcepts = new Set(reviewQuestions.map(q => q.conceptId));
const artifactConcepts = new Set(artifacts.flatMap(a => a.concepts));

const milestoneConcepts = new Set();
for (const r of roadmapsData.roadmaps) {
  for (const m of r.milestones) {
    for (const cid of m.concepts) milestoneConcepts.add(cid);
  }
}

const DRILL_TYPES = {
  dsa: 'coding-problem',
  'system-design': 'design-exercise',
  product: 'design-exercise',
  default: 'implementation-task',
};

function drillType(concept) {
  const tag = concept.tags[0];
  return DRILL_TYPES[tag] || DRILL_TYPES.default;
}

function pickProject(concept) {
  if (concept.projectApplications?.length) return concept.projectApplications[0];
  const tag = concept.tags[0];
  const map = {
    'search-ir': 'highsignal',
    'vector-db': 'tiny-vector-db',
    mathematics: 'quant-lab',
    'ai-systems': 'codevetter',
    backend: 'sassmaker',
    databases: 'tiny-search-engine',
    dsa: 'highsignal',
    product: 'sassmaker',
    'system-design': 'highsignal',
  };
  return map[tag] || 'quant-lab';
}

let addedDrills = 0;
let addedRqs = 0;
let addedArtifacts = 0;

for (const concept of concepts) {
  if (!drilledConcepts.has(concept.id)) {
    const id = `drill-${concept.id}`;
    if (!drillIds.has(id)) {
      const mistakes = concept.commonMistakes?.slice(0, 2) ?? [];
      drills.push({
        id,
        title: `Apply ${concept.name}`,
        conceptId: concept.id,
        type: drillType(concept),
        difficulty: concept.difficulty,
        prompt: [
          `**${concept.name}** — ${concept.description}`,
          '',
          concept.mentalModel ? `Mental model: ${concept.mentalModel}` : '',
          '',
          'Task: Implement the core mechanism in TypeScript (or pseudocode with tests). Start from the smallest example that exercises the idea.',
        ].filter(Boolean).join('\n'),
        expectedOutput: 'Runnable code or a worked derivation that demonstrates the mechanism — not a summary.',
        hints: mistakes.length
          ? mistakes.map(m => `Avoid: ${m}`)
          : ['Re-read the mental model.', 'Write the invariant before the code.'],
        solutionNotes: concept.realWorldUsage || concept.mentalModel?.slice(0, 200) || concept.description,
      });
      drillIds.add(id);
      drilledConcepts.add(concept.id);
      addedDrills++;
    }
  }

  if (!rqConcepts.has(concept.id)) {
    const id = `rq-${concept.id}-core`;
    if (!rqIds.has(id)) {
      const mistake = concept.commonMistakes?.[0];
      reviewQuestions.push({
        id,
        conceptId: concept.id,
        type: 'explain',
        difficulty: concept.difficulty,
        question: mistake
          ? `Explain ${concept.name} and name one common mistake: "${mistake.slice(0, 80)}…"`
          : `Explain ${concept.name} in your own words. What problem does it solve and where is it used?`,
        answer: concept.mentalModel || concept.description,
      });
      rqIds.add(id);
      rqConcepts.add(concept.id);
      addedRqs++;
    }
  }

  const hasArtifact =
    (concept.artifacts?.length ?? 0) > 0 || artifactConcepts.has(concept.id);

  if (milestoneConcepts.has(concept.id) && !hasArtifact) {
    const id = `build-${concept.id}`;
    if (!artifactIds.has(id)) {
      const project = pickProject(concept);
      artifacts.push({
        id,
        title: `Build: ${concept.name}`,
        type: concept.tags[0] === 'system-design' ? 'design-doc' : 'code-implementation',
        difficulty: concept.difficulty,
        concepts: [concept.id],
        projects: project ? [project] : [],
        description: `Ship a small artifact proving you understand ${concept.name}. Active implementation — no passive consumption.`,
        successCriteria: [
          'Runnable code, benchmark, or design doc with diagram',
          'Demonstrates the core mechanism from the mental model',
          'Documents one tradeoff you considered',
        ],
        deliverables: ['Playground code or commit link', 'Short writeup (≥150 words)'],
      });
      artifactIds.add(id);
      artifactConcepts.add(concept.id);
      addedArtifacts++;
    }
  }
}

// Sync concept.artifacts / drills / reviewQuestions arrays from reverse indexes
const drillsByConcept = {};
const rqsByConcept = {};
const artifactsByConcept = {};
for (const d of drills) {
  (drillsByConcept[d.conceptId] ??= []).push(d.id);
}
for (const q of reviewQuestions) {
  (rqsByConcept[q.conceptId] ??= []).push(q.id);
}
for (const a of artifacts) {
  for (const cid of a.concepts) {
    (artifactsByConcept[cid] ??= []).push(a.id);
  }
}

for (const concept of concepts) {
  concept.drills = [...new Set([...(concept.drills || []), ...(drillsByConcept[concept.id] || [])])];
  concept.reviewQuestions = [
    ...new Set([...(concept.reviewQuestions || []), ...(rqsByConcept[concept.id] || [])]),
  ];
  concept.artifacts = [
    ...new Set([...(concept.artifacts || []), ...(artifactsByConcept[concept.id] || [])]),
  ];
}

drillsData.drills = drills;
rqsData.reviewQuestions = reviewQuestions;
artifactsData.artifacts = artifacts;
conceptsData.concepts = concepts;

save('drills.json', drillsData);
save('review-questions.json', rqsData);
save('artifacts.json', artifactsData);
save('concepts.json', conceptsData);

console.log(JSON.stringify({
  addedDrills,
  addedRqs,
  addedArtifacts,
  totals: {
    drills: drills.length,
    reviewQuestions: reviewQuestions.length,
    artifacts: artifacts.length,
    concepts: concepts.length,
  },
}, null, 2));