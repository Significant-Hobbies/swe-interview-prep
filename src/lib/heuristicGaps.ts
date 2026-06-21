// Deterministic gap analysis — no LLM. Powers Gap Analyzer by default.
import {
  ARTIFACT_BY_ID,
  type Artifact,
  CONCEPT_BY_ID,
  EDITORIAL_ARTIFACTS,
  type Concept,
  conceptsByTag,
  sortedTracks,
} from '../data/learning-os';
import type { MasteryEntry } from '../hooks/useConcepts';
import { rollupMastery } from './conceptState';
import { pickEditorialArtifactForConcept, weakConcepts } from './recommend';

export interface GapAnalysis {
  summary: string;
  weakAreas: string[];
  nextConcepts: { conceptId: string; why: string }[];
  recommendedArtifact: { artifactId: string; why: string };
  generator: 'heuristic' | 'ai';
}

export function analyzeGapsHeuristic(mastery: Record<string, MasteryEntry>): GapAnalysis {
  const weak = weakConcepts(mastery, 8);
  const groups = sortedTracks().map(t => {
    const ids = conceptsByTag(t.id).map(c => c.id);
    const roll = rollupMastery(ids, mastery);
    return {
      id: t.id,
      short: t.short,
      untouched: roll.untouched,
      mastered: roll.mastered,
      due: roll.due,
      total: roll.total,
    };
  });

  const weakAreas = weak.slice(0, 5).map(c => {
    const conf = Math.round((mastery[c.id]?.confidence ?? 0) * 100);
    return `${c.name} (${conf}%)`;
  });

  const neglected = groups
    .filter(g => g.untouched > g.total * 0.7)
    .map(g => g.short);

  const nextConcepts = weak.slice(0, 5).map(c => {
    const conf = mastery[c.id]?.confidence ?? 0;
    const lapses = mastery[c.id]?.lapses ?? 0;
    let why = 'Low confidence — needs another rep.';
    if (lapses >= 2) why = `${lapses} lapses — drill before more reading.`;
    else if (conf < 0.25) why = 'Decaying fast — rescue before it rots.';
    else if (conf < 0.5) why = 'Shaky — one verified drill will lock it in.';
    return { conceptId: c.id, why };
  });

  let artifact: Artifact | null = null;
  let artifactWhy = 'Ship proof-of-work to unlock advanced gates.';
  for (const c of weak) {
    const a = pickEditorialArtifactForConcept(c.id);
    if (a) {
      artifact = a;
      artifactWhy = `Build while ${c.name} is fresh in working memory.`;
      break;
    }
  }
  if (!artifact && EDITORIAL_ARTIFACTS.length) {
    artifact = EDITORIAL_ARTIFACTS[0];
  }

  const summaryParts: string[] = [];
  if (weak.length) {
    summaryParts.push(`Weakest link: ${weak[0].name} at ${Math.round((mastery[weak[0].id]?.confidence ?? 0) * 100)}% confidence.`);
  } else {
    summaryParts.push('No critical weak spots — push edge concepts or ship an artifact.');
  }
  if (neglected.length) {
    summaryParts.push(`Barely touched: ${neglected.join(', ')}.`);
  }
  const totalDue = groups.reduce((s, g) => s + g.due, 0);
  if (totalDue > 0) summaryParts.push(`${totalDue} concepts due for spaced review.`);

  return {
    summary: summaryParts.join(' '),
    weakAreas,
    nextConcepts,
    recommendedArtifact: {
      artifactId: artifact?.id ?? EDITORIAL_ARTIFACTS[0]?.id ?? '',
      why: artifactWhy,
    },
    generator: 'heuristic',
  };
}

export function conceptName(id: string): string {
  return CONCEPT_BY_ID[id]?.name ?? id;
}

export function artifactTitle(id: string): string {
  return ARTIFACT_BY_ID[id]?.title ?? id;
}