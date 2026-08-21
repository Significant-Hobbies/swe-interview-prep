import { PAPER_CONTRACTS } from '../data/paper-contracts';
import type { LearnerProfile } from './profile';
import type { DrillEntry } from '../hooks/useUserStore';
import type { MasteryEntry } from '../hooks/useConcepts';
import type { SessionPlan, SessionSelectionReason } from './planner';
import type { DecisionLabId, DecisionReceiptV1, PaperLearningAttemptV1 } from './learningEvidence';
import type { FocusedStudyDraftV1 } from './learningContinuity';
import { selectRotatingPaper } from './paperRotation';

type DailyPriorityReason =
  | SessionSelectionReason
  | 'new-learner'
  | 'caught-up'
  | 'source-unavailable';

type DailyPriorityActionKind =
  | 'review'
  | 'concept'
  | 'drill'
  | 'decision-lab'
  | 'paper'
  | 'artifact';

export interface DailyLearningPriority {
  conceptId: string | null;
  roadmapId: string | null;
  reason: DailyPriorityReason;
  objective: string;
  rationale: string;
  evidence: string;
  completionPredicate: {
    kind:
      | 'reviewed'
      | 'drill-solved'
      | 'receipt-verified'
      | 'paper-retrieved'
      | 'concept-explained';
    refId: string;
  };
  action: { kind: DailyPriorityActionKind; label: string; href: string };
  supportingActions: Array<{ label: string; href: string; minutes: number }>;
  minutes: number;
  unlocks: string;
  freshness: { selectedAt: string; evidenceFingerprint: string };
  state: 'ready' | 'new-learner' | 'caught-up' | 'offline-local' | 'source-unavailable';
}

const DECISION_LABS: Record<
  DecisionLabId,
  { title: string; minutes: number; conceptIds: string[] }
> = {
  'inference-capacity': {
    title: 'Model inference capacity',
    minutes: 25,
    conceptIds: [
      'inference-engines',
      'kv-cache-paged-attention',
      'gpu-utilization',
      'inference-hardware',
    ],
  },
  'capacity-planning': {
    title: 'Make a capacity decision',
    minutes: 20,
    conceptIds: ['capacity-estimation', 'reliability-fault-tolerance'],
  },
  'evaluation-confidence': {
    title: 'Test evaluation confidence',
    minutes: 20,
    conceptIds: ['llm-evals', 'ml-evaluation', 'search-evals', 'quality-cost-latency-measurement'],
  },
  'model-routing': {
    title: 'Test a model routing policy',
    minutes: 20,
    conceptIds: ['inference-engines', 'quality-cost-latency-measurement'],
  },
  'rag-readiness': {
    title: 'Audit RAG readiness',
    minutes: 20,
    conceptIds: ['rag', 'ml-embeddings', 'search-evals'],
  },
  'inference-benchmarking': {
    title: 'Interpret an inference benchmark',
    minutes: 20,
    conceptIds: ['inference-cost-latency', 'gpu-utilization', 'quality-cost-latency-measurement'],
  },
};

export function decisionLabForConcept(conceptId: string) {
  return Object.entries(DECISION_LABS).find(([, lab]) => lab.conceptIds.includes(conceptId)) as
    | [DecisionLabId, (typeof DECISION_LABS)[DecisionLabId]]
    | undefined;
}

function fingerprint(
  receipts: DecisionReceiptV1[],
  papers: PaperLearningAttemptV1[],
  focusedStudies: FocusedStudyDraftV1[]
): string {
  return [
    ...receipts.map((item) => `${item.id}:${item.evidenceState}`),
    ...papers.map((item) => `${item.id}:${item.evidenceState}`),
    ...focusedStudies.map(
      (item) => `${item.focusKind}:${item.focusId}:${item.completedAt ?? item.updatedAt}`
    ),
  ]
    .sort()
    .join('|');
}

interface DailyPriorityInput {
  plan: SessionPlan | null;
  profile: LearnerProfile;
  mastery: Record<string, MasteryEntry>;
  drillState: Record<string, DrillEntry>;
  decisionReceipts?: DecisionReceiptV1[];
  paperAttempts?: PaperLearningAttemptV1[];
  focusedStudyDrafts?: FocusedStudyDraftV1[];
  masteryAvailable?: boolean;
  online?: boolean;
  now?: Date;
}

interface PriorityContext {
  args: DailyPriorityInput;
  plan: SessionPlan;
  reason: DailyPriorityReason;
  rationale: string;
  supportingActions: DailyLearningPriority['supportingActions'];
  freshness: DailyLearningPriority['freshness'];
  state: DailyLearningPriority['state'];
  decisionReceipts: DecisionReceiptV1[];
  paperAttempts: PaperLearningAttemptV1[];
  now: Date;
}

function caughtUpPriority(
  args: DailyPriorityInput,
  freshness: DailyLearningPriority['freshness']
): DailyLearningPriority {
  return {
    conceptId: null,
    roadmapId: null,
    reason: 'caught-up',
    objective: 'Synthesize one mechanism you can now explain without notes.',
    rationale: 'No due, failed, or reachable unfinished concept remains in the selected scope.',
    evidence: 'Write a causal explanation and one counterexample in Playground.',
    completionPredicate: { kind: 'concept-explained', refId: 'synthesis' },
    action: { kind: 'artifact', label: 'Start a synthesis note', href: '/playground' },
    supportingActions: [],
    minutes: args.profile.minutesPerDay,
    unlocks: 'A broader path or a fresh profile focus.',
    freshness,
    state: 'caught-up',
  };
}

function priorityRationale(
  args: DailyPriorityInput,
  plan: SessionPlan,
  reason: DailyPriorityReason,
  completedFocusedStudy: boolean
): string {
  const concept = plan.concept;
  let rationale: string;
  if (reason === 'recovery') {
    const attempts = plan.drill ? (args.drillState[plan.drill.id]?.attempts ?? 0) : 0;
    rationale = `${attempts} unsuccessful practice attempts expose a live misconception. Recovery outranks new material.`;
  } else if (reason === 'retention') {
    const confidence = Math.round((args.mastery[concept.id]?.confidence ?? 0) * 100);
    rationale = `${plan.reviewsDue} review${plan.reviewsDue === 1 ? '' : 's'} are due; ${concept.name} is the weakest reachable item at ${confidence}% confidence.`;
  } else if (reason === 'new-learner') {
    rationale = `You have no learning evidence yet. This is the first reachable concept in ${plan.roadmap.title}, based on your profile—not an inferred weakness.`;
  } else if (completedFocusedStudy) {
    rationale = `You completed focused-study evidence for ${concept.name}, but its mastery explain-back remains pending. Keep the same concept active until that causal model holds.`;
  } else {
    rationale = `${concept.name} is the next reachable concept in ${plan.roadmap.title}; its prerequisites are ready and no recovery or due work outranks it.`;
  }
  if (args.masteryAvailable === false) {
    rationale += ' Mastery was unavailable, so this uses local practice and roadmap state.';
  }
  return rationale;
}

function recoveryPriority(context: PriorityContext): DailyLearningPriority | null {
  const { plan, reason, rationale, supportingActions, freshness, state } = context;
  if (reason !== 'recovery' || !plan.drill) return null;
  return {
    conceptId: plan.concept.id,
    roadmapId: plan.roadmap.id,
    reason,
    objective: `Repair the misconception blocking ${plan.concept.name}.`,
    rationale,
    evidence: `Solve “${plan.drill.title}” and explain why the failed approach breaks.`,
    completionPredicate: { kind: 'drill-solved', refId: plan.drill.id },
    action: { kind: 'drill', label: 'Retry the failed drill', href: `/drills/${plan.drill.id}` },
    supportingActions,
    minutes: plan.totalMinutes,
    unlocks: 'A clean explain-back and the next roadmap concept.',
    freshness,
    state,
  };
}

function retentionPriority(context: PriorityContext): DailyLearningPriority | null {
  const { plan, reason, rationale, supportingActions, freshness, state } = context;
  const review = plan.reviewQueue[0];
  if (reason !== 'retention' || !review) return null;
  return {
    conceptId: plan.concept.id,
    roadmapId: plan.roadmap.id,
    reason,
    objective: `Retrieve ${plan.concept.name} before its memory trace weakens further.`,
    rationale,
    evidence: `Answer the due review, then explain the causal mechanism without opening the source.`,
    completionPredicate: { kind: 'reviewed', refId: review.id },
    action: { kind: 'review', label: 'Start due retrieval', href: '/practice/all?tab=reviews' },
    supportingActions,
    minutes: plan.totalMinutes,
    unlocks: 'A refreshed review interval and the next weakest concept.',
    freshness,
    state,
  };
}

function decisionLabPriority(context: PriorityContext): DailyLearningPriority | null {
  const { plan, reason, rationale, supportingActions, freshness, state, decisionReceipts } =
    context;
  const labMatch = reason !== 'new-learner' ? decisionLabForConcept(plan.concept.id) : undefined;
  if (!labMatch || labMatch[1].minutes > plan.totalMinutes) return null;
  const [labId, lab] = labMatch;
  const verified = decisionReceipts.some(
    (receipt) => receipt.labId === labId && receipt.evidenceState === 'verified'
  );
  if (verified) return null;
  return {
    conceptId: plan.concept.id,
    roadmapId: plan.roadmap.id,
    reason,
    objective: `${lab.title} and identify the first declared constraint.`,
    rationale,
    evidence:
      'Freeze a prediction, calculate the result, record a mitigation and verification metric, then explain causality.',
    completionPredicate: { kind: 'receipt-verified', refId: labId },
    action: {
      kind: 'decision-lab',
      label: 'Start the decision lab',
      href: `/labs/decision/${labId}`,
    },
    supportingActions,
    minutes: plan.totalMinutes,
    unlocks: 'Verified decision evidence and the next roadmap action.',
    freshness,
    state,
  };
}

function paperPriority(context: PriorityContext): DailyLearningPriority | null {
  const { plan, reason, rationale, supportingActions, freshness, state, paperAttempts, now } =
    context;
  const paperSelection = selectRotatingPaper(
    PAPER_CONTRACTS.filter((candidate) => candidate.estimatedMinutes <= plan.totalMinutes),
    { conceptId: plan.concept.id, now }
  );
  const paper = paperSelection?.paper;
  const retrievedPaper = paperAttempts.some(
    (attempt) => attempt.paperId === paper?.id && attempt.evidenceState !== 'opened'
  );
  if (!paper || retrievedPaper || reason === 'new-learner') return null;
  return {
    conceptId: plan.concept.id,
    roadmapId: plan.roadmap.id,
    reason,
    objective: `Extract the serving mechanism from “${paper.title}.”`,
    rationale,
    evidence: `Answer: “${paper.retrievalQuestion}” Then complete: ${paper.followUp.label}.`,
    completionPredicate: { kind: 'paper-retrieved', refId: paper.id },
    action: {
      kind: 'paper',
      label: 'Open the paper contract',
      href: `/concepts/${plan.concept.id}#papers`,
    },
    supportingActions,
    minutes: plan.totalMinutes,
    unlocks: 'A source-grounded decision or explain-back.',
    freshness,
    state,
  };
}

function conceptPriority(context: PriorityContext): DailyLearningPriority {
  const { plan, reason, rationale, supportingActions, freshness, state } = context;
  const concept = plan.concept;
  const drillAction = reason !== 'new-learner' ? plan.drill : null;
  const action = drillAction
    ? {
        kind: 'drill' as const,
        label: 'Learn, then run the drill',
        href: `/drills/${drillAction.id}`,
      }
    : {
        kind: 'concept' as const,
        label: 'Start focused study',
        href: `/study/concept/${concept.id}`,
      };
  return {
    conceptId: concept.id,
    roadmapId: plan.roadmap.id,
    reason,
    objective: `Build a causal model of ${concept.name}.`,
    rationale,
    evidence: drillAction
      ? `Complete “${drillAction.title}” and explain the mechanism in your own words.`
      : 'Write an explain-back with one example and one failure mode.',
    completionPredicate: drillAction
      ? { kind: 'drill-solved', refId: drillAction.id }
      : { kind: 'concept-explained', refId: concept.id },
    action,
    supportingActions,
    minutes: plan.totalMinutes,
    unlocks: 'The next reachable concept or a longer review interval.',
    freshness,
    state,
  };
}

export function buildDailyLearningPriority(args: DailyPriorityInput): DailyLearningPriority {
  const now = args.now ?? new Date();
  const decisionReceipts = args.decisionReceipts ?? [];
  const paperAttempts = args.paperAttempts ?? [];
  const focusedStudyDrafts = args.focusedStudyDrafts ?? [];
  const freshness = {
    selectedAt: now.toISOString(),
    evidenceFingerprint: fingerprint(decisionReceipts, paperAttempts, focusedStudyDrafts),
  };
  if (!args.plan) return caughtUpPriority(args, freshness);

  const { plan } = args;
  const completedFocusedStudy = focusedStudyDrafts.some(
    (draft) =>
      draft.focusKind === 'concept' &&
      draft.focusId === plan.concept.id &&
      Boolean(draft.completedAt)
  );
  const hasHistory =
    Object.keys(args.mastery).length > 0 ||
    Object.values(args.drillState).some((entry) => entry.attempts > 0) ||
    decisionReceipts.length > 0 ||
    paperAttempts.length > 0 ||
    focusedStudyDrafts.some((draft) => Boolean(draft.completedAt));
  const reason: DailyPriorityReason =
    plan.selectionReason === 'progression' && !hasHistory ? 'new-learner' : plan.selectionReason;
  const context: PriorityContext = {
    args,
    plan,
    reason,
    rationale: priorityRationale(args, plan, reason, completedFocusedStudy),
    supportingActions: plan.blocks.slice(1).map((block) => ({
      label: block.title,
      href: block.href,
      minutes: block.minutes,
    })),
    freshness,
    state: !args.online ? 'offline-local' : reason === 'new-learner' ? 'new-learner' : 'ready',
    decisionReceipts,
    paperAttempts,
    now,
  };
  return (
    recoveryPriority(context) ??
    retentionPriority(context) ??
    decisionLabPriority(context) ??
    paperPriority(context) ??
    conceptPriority(context)
  );
}
