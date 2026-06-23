// Concept access gates — proof of work (artifacts, solved drills) before advanced nodes.
import { ARTIFACT_BY_ID, CONCEPT_BY_ID, DRILLS, type Concept } from '../data/learning-os';
import type { MasteryEntry } from '../hooks/useConcepts';
import type { ArtifactEntry, DrillEntry } from '../hooks/useUserStore';
import { isEditorialDrill } from './contentQuality';
import { DEFAULT_USER_ELO } from './elo';

export interface GateContext {
  mastery: Record<string, MasteryEntry>;
  getElo: (roadmapId: string) => number;
  artifacts: Record<string, ArtifactEntry>;
  drills: Record<string, DrillEntry>;
}

export interface GateRequirement {
  label: string;
  href?: string;
  met: boolean;
}

export interface GateStatus {
  blocked: boolean;
  reason: string;
  requirements: GateRequirement[];
}

type ArtifactMinStatus = 'building' | 'shipped';

interface GateRule {
  conceptId: string;
  anyOf: (
    | { kind: 'drill-solved'; conceptId: string }
    | { kind: 'artifact'; artifactId: string; minStatus: ArtifactMinStatus }
    | { kind: 'elo'; roadmapId: string; min: number }
    | { kind: 'concept-open'; conceptId: string }
  )[];
}

const MATH_STACK = 'math-stack-12w';
const PROB_STATS = 'prob-stats-30d';

const GATE_RULES: GateRule[] = [
  {
    conceptId: 'search-evals',
    anyOf: [
      { kind: 'drill-solved', conceptId: 'hypothesis-testing' },
      { kind: 'artifact', artifactId: 'ab-test-analysis-report', minStatus: 'building' },
      { kind: 'artifact', artifactId: 'debunk-fake-trading-signal', minStatus: 'shipped' },
    ],
  },
  {
    conceptId: 'llm-evals',
    anyOf: [
      { kind: 'artifact', artifactId: 'ab-test-analysis-report', minStatus: 'shipped' },
      { kind: 'drill-solved', conceptId: 'hypothesis-testing' },
    ],
  },
  {
    conceptId: 'hnsw',
    anyOf: [
      { kind: 'elo', roadmapId: MATH_STACK, min: 1600 },
      { kind: 'elo', roadmapId: PROB_STATS, min: 1650 },
      { kind: 'drill-solved', conceptId: 'sampling-and-clt' },
    ],
  },
  {
    conceptId: 'ivf',
    anyOf: [
      { kind: 'elo', roadmapId: MATH_STACK, min: 1600 },
      { kind: 'drill-solved', conceptId: 'estimation-confidence' },
    ],
  },
  {
    conceptId: 'product-quantization',
    anyOf: [
      { kind: 'elo', roadmapId: MATH_STACK, min: 1650 },
      { kind: 'artifact', artifactId: 'impl-pca-from-scratch', minStatus: 'building' },
    ],
  },
  {
    conceptId: 'ml-gradient-descent',
    anyOf: [
      { kind: 'artifact', artifactId: 'impl-ols-from-scratch', minStatus: 'building' },
      { kind: 'drill-solved', conceptId: 'derivatives-and-gradients' },
    ],
  },
  {
    conceptId: 'momentum-backtest',
    anyOf: [
      { kind: 'artifact', artifactId: 'quant-risk-dashboard', minStatus: 'shipped' },
      { kind: 'drill-solved', conceptId: 'portfolio-risk-metrics' },
    ],
  },
];

const GATE_BY_CONCEPT = Object.fromEntries(GATE_RULES.map((r) => [r.conceptId, r]));

function drillSolved(ctx: GateContext, conceptId: string): boolean {
  const editorial = DRILLS.filter((d) => d.conceptId === conceptId && isEditorialDrill(d));
  if (!editorial.length) return false;
  return editorial.some((d) => ctx.drills[d.id]?.status === 'solved');
}

function artifactOk(ctx: GateContext, artifactId: string, minStatus: ArtifactMinStatus): boolean {
  const st = ctx.artifacts[artifactId]?.status ?? 'todo';
  if (minStatus === 'shipped') return st === 'shipped';
  return st === 'building' || st === 'shipped';
}

function eloOk(ctx: GateContext, roadmapId: string, min: number): boolean {
  return (ctx.getElo(roadmapId) || DEFAULT_USER_ELO) >= min;
}

function evalReq(req: GateRule['anyOf'][number], ctx: GateContext): GateRequirement {
  if (req.kind === 'drill-solved') {
    const c = CONCEPT_BY_ID[req.conceptId];
    const met = drillSolved(ctx, req.conceptId);
    return {
      label: `Solve a drill for ${c?.name ?? req.conceptId}`,
      href: `/practice/all?concept=${req.conceptId}`,
      met,
    };
  }
  if (req.kind === 'artifact') {
    const a = ARTIFACT_BY_ID[req.artifactId];
    const met = artifactOk(ctx, req.artifactId, req.minStatus);
    const verb = req.minStatus === 'shipped' ? 'Ship' : 'Start';
    return {
      label: `${verb} artifact: ${a?.title ?? req.artifactId}`,
      href: `/playground?artifact=${req.artifactId}`,
      met,
    };
  }
  if (req.kind === 'elo') {
    const current = ctx.getElo(req.roadmapId) || DEFAULT_USER_ELO;
    const met = eloOk(ctx, req.roadmapId, req.min);
    return {
      label: `${req.roadmapId} ELO ≥ ${req.min} (yours: ${current})`,
      href: '/practice',
      met,
    };
  }
  const met = !gateStatus(req.conceptId, ctx).blocked;
  return {
    label: `Unlock ${CONCEPT_BY_ID[req.conceptId]?.name ?? req.conceptId} first`,
    href: `/concepts/${req.conceptId}`,
    met,
  };
}

function parentBlock(conceptId: string, ctx: GateContext): GateStatus | null {
  if (conceptId !== 'llm-evals') return null;
  const parent = gateStatus('search-evals', ctx);
  if (!parent.blocked) return null;
  return {
    blocked: true,
    reason:
      'Search evals unlocks first — prove hypothesis-testing with a drill or shipped artifact.',
    requirements: parent.requirements,
  };
}

export function gateStatus(conceptId: string, ctx: GateContext): GateStatus {
  const parent = parentBlock(conceptId, ctx);
  if (parent) return parent;

  const rule = GATE_BY_CONCEPT[conceptId];
  if (!rule) return { blocked: false, reason: '', requirements: [] };

  const requirements = rule.anyOf.map((r) => evalReq(r, ctx));
  const blocked = !requirements.some((r) => r.met);
  const reason = blocked
    ? `Complete one unlock path for ${CONCEPT_BY_ID[conceptId]?.name ?? conceptId}.`
    : '';

  return { blocked, reason, requirements };
}

export function conceptAccessible(concept: Concept, ctx: GateContext): boolean {
  if (!prereqsMetForGate(concept, ctx)) return false;
  return !gateStatus(concept.id, ctx).blocked;
}

function prereqsMetForGate(concept: Concept, ctx: GateContext): boolean {
  return concept.prerequisites.every((p) => (ctx.mastery[p]?.confidence ?? 0) >= 0.4);
}

export function playgroundArtifactUrl(artifactId: string): string {
  return `/playground?artifact=${encodeURIComponent(artifactId)}`;
}
