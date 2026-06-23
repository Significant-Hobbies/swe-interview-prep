#!/usr/bin/env node
/**
 * Remove bootstrap drill-* placeholders and build-* scaffold artifacts.
 * Keeps editorial drills like build-tokenizer and hand-authored artifacts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const GENERIC_DRILL_MARKERS = [
  'Task: Implement the core mechanism in TypeScript',
  'Start from the smallest example that exercises the idea.',
];
const GENERIC_ARTIFACT_CRITERIA = 'Demonstrates the core mechanism from the mental model';

function isBootstrapDrill(d) {
  if (d.id.startsWith('drill-')) return true;
  return GENERIC_DRILL_MARKERS.every((m) => d.prompt?.includes(m));
}

function isBootstrapArtifact(a) {
  if (a.id.startsWith('build-')) return true;
  const criteria = a.successCriteria ?? [];
  if (criteria.some((c) => c.includes(GENERIC_ARTIFACT_CRITERIA))) return true;
  return false;
}

const ARTIFACT_REMAP = {
  'build-search-eval-harness': 'search-eval-harness',
  'build-brute-force-index': 'tiny-vector-db-brute-force',
  'build-rag-pipeline': 'rag-pipeline-v0',
  'build-chunker': 'rag-pipeline-v0',
  'build-wal': 'toy-wal',
  'build-memtable-sstable': 'toy-lsm',
  'build-tool-loop': 'llm-eval-harness',
  'build-llm-eval': 'llm-eval-harness',
  'build-tokenizer': null,
  'build-inverted-index': 'object-storage-index',
};

function remapArtifactId(id) {
  if (!id.startsWith('build-')) return id;
  return ARTIFACT_REMAP[id] ?? null;
}

function cleanDrillIds(ids, validDrillIds) {
  const out = [];
  const seen = new Set();
  for (const id of ids ?? []) {
    if (id.startsWith('drill-')) continue;
    if (!validDrillIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function cleanArtifactIds(ids, validArtifactIds) {
  const out = [];
  const seen = new Set();
  for (const id of ids ?? []) {
    let next = id;
    if (id.startsWith('build-')) {
      const mapped = remapArtifactId(id);
      if (!mapped) continue;
      next = mapped;
    }
    if (!validArtifactIds.has(next) || seen.has(next)) continue;
    seen.add(next);
    out.push(next);
  }
  return out;
}

const drillsPath = resolve(root, 'src/data/drills.json');
const artifactsPath = resolve(root, 'src/data/artifacts.json');
const conceptsPath = resolve(root, 'src/data/concepts.json');
const roadmapsPath = resolve(root, 'src/data/roadmaps.json');

const drillsFile = JSON.parse(readFileSync(drillsPath, 'utf8'));
const artifactsFile = JSON.parse(readFileSync(artifactsPath, 'utf8'));
const conceptsFile = JSON.parse(readFileSync(conceptsPath, 'utf8'));
const roadmapsFile = JSON.parse(readFileSync(roadmapsPath, 'utf8'));

const beforeDrills = drillsFile.drills.length;
const beforeArtifacts = artifactsFile.artifacts.length;

drillsFile.drills = drillsFile.drills.filter((d) => !isBootstrapDrill(d));
artifactsFile.artifacts = artifactsFile.artifacts.filter((a) => !isBootstrapArtifact(a));

const validDrillIds = new Set(drillsFile.drills.map((d) => d.id));
const validArtifactIds = new Set(artifactsFile.artifacts.map((a) => a.id));

for (const c of conceptsFile.concepts) {
  c.drills = cleanDrillIds(c.drills, validDrillIds);
  c.artifacts = cleanArtifactIds(c.artifacts, validArtifactIds);
}

for (const r of roadmapsFile.roadmaps) {
  for (const m of r.milestones) {
    m.drills = (m.drills ?? []).filter((id) => validDrillIds.has(id) && !id.startsWith('drill-'));
    const arts = [];
    const seen = new Set();
    for (const id of m.artifacts ?? []) {
      let next = id;
      if (id.startsWith('build-')) {
        const mapped = remapArtifactId(id);
        if (!mapped) continue;
        next = mapped;
      }
      if (!validArtifactIds.has(next) || seen.has(next)) continue;
      seen.add(next);
      arts.push(next);
    }
    m.artifacts = arts;
  }
}

writeFileSync(drillsPath, `${JSON.stringify(drillsFile, null, 2)}\n`);
writeFileSync(artifactsPath, `${JSON.stringify(artifactsFile, null, 2)}\n`);
writeFileSync(conceptsPath, `${JSON.stringify(conceptsFile, null, 2)}\n`);
writeFileSync(roadmapsPath, `${JSON.stringify(roadmapsFile, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      drillsRemoved: beforeDrills - drillsFile.drills.length,
      drillsRemaining: drillsFile.drills.length,
      artifactsRemoved: beforeArtifacts - artifactsFile.artifacts.length,
      artifactsRemaining: artifactsFile.artifacts.length,
    },
    null,
    2
  )
);
