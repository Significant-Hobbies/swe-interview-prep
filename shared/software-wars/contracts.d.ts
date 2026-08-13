export type Brand<Value, Name extends string> = Value & { readonly __brand: Name };

export type MatchId = Brand<string, 'MatchId'>;
export type ParticipantId = Brand<string, 'ParticipantId'>;
export type AttemptId = Brand<string, 'AttemptId'>;
export type ChallengeId = Brand<string, 'ChallengeId'>;
export type ContentVersionId = Brand<string, 'ContentVersionId'>;
export type AiOpponentId = Brand<string, 'AiOpponentId'>;

export type WarMode = 'blitz' | 'tradeoff';
export type BlitzQueueType =
  | 'ranked_mix'
  | 'topic'
  | 'track'
  | 'roadmap'
  | 'concept'
  | 'ai'
  | 'ghost'
  | 'challenge'
  | 'rematch';
export type WarVisibility = 'private' | 'result' | 'excerpt';
export type WarOutcome = 'win' | 'loss' | 'draw';
export type TradeoffVote = 'win' | 'loss' | 'draw';
export type ArtifactType = 'text' | 'code' | 'schema' | 'pseudocode' | 'diagram';
export type WarMatchStatus =
  | 'scheduled'
  | 'check_in'
  | 'active'
  | 'twist'
  | 'revision'
  | 'reveal'
  | 'debate'
  | 'voting'
  | 'adjudicating'
  | 'review_required'
  | 'complete'
  | 'cancelled'
  | 'abandoned';
export type TradeoffPhase =
  | 'scheduled'
  | 'check_in'
  | 'initial_solution'
  | 'twist'
  | 'revision'
  | 'reveal'
  | 'debate'
  | 'voting'
  | 'adjudicating'
  | 'complete'
  | 'review_required'
  | 'cancelled';

export interface ApiSuccess<Data, Meta = never> {
  ok: true;
  data: Data;
  meta?: Meta;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiEnvelope<Data, Meta = never> = ApiSuccess<Data, Meta> | ApiFailure;

export interface PublicWarIdentity {
  displayName: string;
  avatarUrl?: string;
  participantType: 'human' | 'ai' | 'ghost';
}

export interface SafeBlitzOption {
  id: string;
  label: string;
}

export interface SafeBlitzQuestion {
  id: ContentVersionId;
  position: number;
  stem: string;
  options: SafeBlitzOption[];
  topic: string;
  difficulty: 'foundation' | 'intermediate' | 'advanced';
  primaryConcept: { id: string; name: string; learnPath: string };
}

export interface BlitzAttemptView {
  matchId: MatchId;
  attemptId: AttemptId;
  status: 'pending' | 'active' | 'complete' | 'expired' | 'abandoned';
  ranked: boolean;
  queueType: BlitzQueueType;
  serverNow: string;
  deadlineAt: string;
  answeredQuestionIds: ContentVersionId[];
  questions: SafeBlitzQuestion[];
  opponent: PublicWarIdentity;
}

export interface RatingView {
  mode: WarMode;
  rating: number;
  rankedMatches: number;
  provisional: boolean;
  wins: number;
  draws: number;
  losses: number;
}

export interface WarMatchSummary {
  id: MatchId;
  mode: WarMode;
  ranked: boolean;
  status: WarMatchStatus;
  outcome?: WarOutcome;
  opponent: PublicWarIdentity;
  startedAt?: string;
  completedAt?: string;
  ratingDelta?: number;
}

export interface TradeoffRealtimeView {
  matchId: MatchId;
  phase: TradeoffPhase;
  phaseEndsAt?: string;
  stateVersion: number;
  serverNow: string;
  eventCursor: number;
}

export interface LaunchStatus {
  enabled: boolean;
  blitzPreviewEnabled: boolean;
  blitzRankedEnabled: boolean;
  tradeoffPreviewEnabled: boolean;
  tradeoffRankedEnabled: boolean;
  mediaConfigured: boolean;
  content: {
    authoredCandidateBlitzQuestions: number;
    activeBlitzQuestions: number;
    activeBlitzQuestionVersions: number;
    distinctAuthoredBlitzQuestions: number;
    activeTradeoffProblems: number;
    blitzLaunchMinimum: number;
    tradeoffLaunchMinimum: number;
  };
}

export const WAR_MODES: readonly WarMode[];
export const BLITZ_QUEUE_TYPES: readonly BlitzQueueType[];
export const WAR_MATCH_STATUSES: readonly WarMatchStatus[];
export const TRADEOFF_PHASES: readonly TradeoffPhase[];
export const WAR_VISIBILITIES: readonly WarVisibility[];
export const WAR_OUTCOMES: readonly WarOutcome[];
export const TRADEOFF_VOTES: readonly TradeoffVote[];
export const ARTIFACT_TYPES: readonly ArtifactType[];
export const WAR_LIMITS: Readonly<{
  blitzMinSeconds: number;
  blitzMaxSeconds: number;
  blitzMinQuestions: number;
  blitzMaxQuestions: number;
  artifactInlineBytes: number;
  artifactMaximumBytes: number;
  publicArtifactExcerptCharacters: number;
  reportDetailsCharacters: number;
  idempotencyKeyCharacters: number;
  realtimeTokenSeconds: number;
}>;
export const WAR_RULES_VERSION: 'wars-rules-v1';
export const ELO_ALGORITHM_VERSION: 'elo-v1';

export function isWarMode(value: unknown): value is WarMode;
export function isTradeoffPhase(value: unknown): value is TradeoffPhase;
export function success<Data, Meta = never>(data: Data, meta?: Meta): ApiSuccess<Data, Meta>;
export function failure(code: string, message: string, details?: unknown): ApiFailure;
