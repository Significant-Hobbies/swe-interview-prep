import {
  buildPreviewWarsCurriculum,
  type WarsCurriculumManifest,
} from '../data/software-wars-curriculum';

export interface WarsStatus {
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

export interface WarRating {
  mode: 'blitz' | 'tradeoff';
  rating: number;
  rankedMatches: number;
  wins: number;
  draws: number;
  losses: number;
  provisional: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  rating: number;
  rankedMatches: number;
  provisional: boolean;
  wins: number;
  draws: number;
  losses: number;
}

export const PREVIEW_STATUS: WarsStatus = {
  enabled: true,
  blitzPreviewEnabled: true,
  blitzRankedEnabled: false,
  tradeoffPreviewEnabled: true,
  tradeoffRankedEnabled: false,
  mediaConfigured: false,
  content: {
    authoredCandidateBlitzQuestions: 1200,
    activeBlitzQuestions: 200,
    activeBlitzQuestionVersions: 200,
    distinctAuthoredBlitzQuestions: 200,
    activeTradeoffProblems: 20,
    blitzLaunchMinimum: 1200,
    tradeoffLaunchMinimum: 20,
  },
};

const PREVIEW_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    displayName: 'Nova',
    rating: 1816,
    rankedMatches: 42,
    provisional: false,
    wins: 29,
    draws: 4,
    losses: 9,
  },
  {
    rank: 2,
    displayName: 'Kernel Panic',
    rating: 1764,
    rankedMatches: 31,
    provisional: false,
    wins: 20,
    draws: 3,
    losses: 8,
  },
  {
    rank: 3,
    displayName: 'Ada',
    rating: 1712,
    rankedMatches: 18,
    provisional: false,
    wins: 11,
    draws: 2,
    losses: 5,
  },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/wars${path}`, {
    credentials: 'include',
    ...init,
    headers: init?.body ? { 'content-type': 'application/json', ...init.headers } : init?.headers,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.error?.message || 'Software Wars is temporarily unavailable');
    Object.assign(error, { code: payload?.error?.code, status: response.status });
    throw error;
  }
  return payload.data as T;
}

export async function getWarsStatus(): Promise<WarsStatus> {
  try {
    return await request<WarsStatus>('/status');
  } catch {
    return PREVIEW_STATUS;
  }
}

export async function getWarsCurriculum(): Promise<WarsCurriculumManifest> {
  const local = buildPreviewWarsCurriculum();
  try {
    const remote = await request<WarsCurriculumManifest>('/curriculum');
    const mergeSection = (
      remoteItems: WarsCurriculumManifest['concepts'],
      localItems: WarsCurriculumManifest['concepts']
    ) => {
      const localById = new Map(localItems.map((item) => [item.id, item]));
      return remoteItems.map((item) => ({ ...localById.get(item.id), ...item }));
    };
    return {
      ...remote,
      tracks: mergeSection(remote.tracks, local.tracks),
      roadmaps: mergeSection(remote.roadmaps, local.roadmaps),
      concepts: mergeSection(remote.concepts, local.concepts),
    };
  } catch {
    return local;
  }
}

export async function getLeaderboard(mode: 'blitz' | 'tradeoff'): Promise<LeaderboardEntry[]> {
  try {
    return await request<LeaderboardEntry[]>(`/leaderboard/${mode}?limit=5`);
  } catch {
    return mode === 'blitz' ? PREVIEW_LEADERBOARD : [];
  }
}

export async function getRatings(): Promise<{ blitz: WarRating; tradeoff: WarRating }> {
  return request('/ratings');
}

export interface WarHistoryEntry {
  id: string;
  mode: 'blitz' | 'tradeoff';
  ranked: boolean;
  status: string;
  outcome?: 'win' | 'draw' | 'loss';
  opponent: { displayName: string; participantType: string };
  startedAt: string;
  completedAt?: string;
  ratingDelta?: number;
}

export async function getWarHistory(): Promise<WarHistoryEntry[]> {
  return request('/history?limit=5');
}

export async function createBlitzMatch(input: Record<string, unknown>) {
  return request<Record<string, unknown>>('/blitz/matches', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getBlitzMatch(matchId: string) {
  return request<Record<string, unknown>>(`/blitz/matches/${encodeURIComponent(matchId)}`);
}

export async function submitBlitzAnswer(
  matchId: string,
  input: { questionId: string; optionId: string; idempotencyKey: string }
) {
  return request<Record<string, unknown>>(`/blitz/matches/${matchId}/answers`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function finalizeBlitzMatch(matchId: string) {
  return request<Record<string, unknown>>(`/blitz/matches/${matchId}/finalize`, { method: 'POST' });
}

export async function shareBlitzResult(matchId: string) {
  return request<{ visibility: string; shareSlug: string }>(
    `/blitz/matches/${encodeURIComponent(matchId)}/share`,
    { method: 'POST', body: JSON.stringify({ visibility: 'result' }) }
  );
}

export async function createChallenge(input: Record<string, unknown>) {
  return request<{ token: string; expiresAt: string }>('/challenges', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getChallengePreview(token: string) {
  return request<{
    id: string;
    mode: 'blitz' | 'tradeoff';
    status: string;
    expiresAt: string;
    challenger: { displayName: string };
    rules: Record<string, unknown>;
  }>(`/challenges/${encodeURIComponent(token)}`);
}

export async function acceptWarChallenge(token: string) {
  return request<Record<string, unknown>>(`/challenges/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    body: JSON.stringify({ idempotencyKey: warOperationId('challenge-accept') }),
  });
}

export async function getPublicWarResult(slug: string) {
  return request<{
    mode: 'blitz' | 'tradeoff';
    ranked: boolean;
    status: string;
    result: string;
    questionCount: number;
    participants: {
      side: 'side_a' | 'side_b';
      displayName: string;
      participantType: string;
      correct?: number;
      score?: number;
    }[];
    finalizedAt: string;
  }>(`/results/${encodeURIComponent(slug)}`);
}

export async function getTradeoffMediaToken(matchId: string) {
  return request<
    | { available: false; provider: 'disabled'; reason: string }
    | { available: true; provider: 'realtimekit'; authToken: string; meetingId: string }
  >(`/tradeoff/matches/${matchId}/media-token`, { method: 'POST' });
}

export async function setTranscriptConsent(matchId: string, consent: boolean) {
  return request(`/tradeoff/matches/${matchId}/transcript-consent`, {
    method: 'POST',
    body: JSON.stringify({ consent }),
  });
}

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
  | 'review_required';

export interface TradeoffRoom {
  matchId: string;
  status: string;
  phase: TradeoffPhase;
  phaseEndsAt: string | null;
  stateVersion: number;
  ranked: boolean;
  scheduledFor: string;
  participant: { id: string; side: 'side_a' | 'side_b'; status: string };
  opponent: { displayName: string; participantType: 'human' };
  problem: {
    id: string;
    title: string;
    prompt: string | null;
    hiddenTwist: string | null;
    allowedTools: string[];
    allowedArtifacts: string[];
  };
  media: {
    provider: 'realtimekit' | 'disabled';
    status: string;
    transcriptConsent: { sideA: boolean; sideB: boolean };
  };
  serverNow: string;
}

export interface TradeoffState {
  matchId: string;
  phase: TradeoffPhase;
  phaseStartedAt: number;
  phaseEndsAt: number | null;
  stateVersion: number;
  serverNow: number;
  prompt: string | null;
  hiddenTwist: string | null;
  ready: { side_a: boolean; side_b: boolean };
  transcriptConsent: { side_a: boolean; side_b: boolean };
  ownVote: 'win' | 'draw' | 'loss' | null;
  result: 'side_a' | 'side_b' | 'draw' | null;
  noShowClaimAvailableTo: 'side_a' | 'side_b' | null;
}

export async function getTradeoffRoom(matchId: string) {
  return request<TradeoffRoom>(`/tradeoff/matches/${encodeURIComponent(matchId)}`);
}

export async function checkInTradeoff(matchId: string) {
  return request<{
    room: TradeoffRoom;
    realtime: { token: string; url: string; expiresInSeconds: number };
  }>(`/tradeoff/matches/${encodeURIComponent(matchId)}/check-in`, { method: 'POST' });
}

export async function saveTradeoffArtifact(
  matchId: string,
  input: { artifactType: string; content: string; idempotencyKey: string }
) {
  return request<{ id: string; version: number; contentHash: string; sizeBytes: number }>(
    `/tradeoff/matches/${encodeURIComponent(matchId)}/artifacts`,
    { method: 'POST', body: JSON.stringify(input) }
  );
}

export interface TradeoffArtifactView {
  id: string;
  side: 'side_a' | 'side_b';
  artifactType: string;
  phase: string;
  version: number;
  status: string;
  content: string | null;
  contentHash: string;
  sizeBytes: number;
  editable: boolean;
}

export async function getTradeoffArtifacts(matchId: string) {
  return request<{ revealed: boolean; artifacts: TradeoffArtifactView[] }>(
    `/tradeoff/matches/${encodeURIComponent(matchId)}/artifacts`
  );
}

export async function getTradeoffResult(matchId: string) {
  return request<{
    matchId: string;
    status: string;
    phase: TradeoffPhase;
    ranked: boolean;
    result: 'side_a' | 'side_b' | 'draw' | null;
    outcome: 'win' | 'draw' | 'loss' | null;
    opponent: { displayName: string; participantType: 'human' };
    evaluation: null | {
      type: string;
      status: string;
      winner: 'side_a' | 'side_b' | 'draw' | null;
      reasoning: string | null;
      rubricScores: Array<{
        criterionId: string;
        sideAScore: number;
        sideBScore: number;
        evidence: string;
      }>;
      lastErrorCode: string | null;
    };
    rating: null | { before: number; after: number; delta: number };
    weaknesses: Array<{
      conceptId: string;
      reviewRating: string;
      learnPath: string;
      drillPath: string;
    }>;
    artifacts: { revealed: boolean; artifacts: TradeoffArtifactView[] };
    transcript: { status: string; retainedUntil: string | null };
    shareSlug: string;
    completedAt: string | null;
  }>(`/tradeoff/matches/${encodeURIComponent(matchId)}/result`);
}

export async function shareTradeoffResult(matchId: string) {
  return request<{ visibility: string; shareSlug: string }>(
    `/tradeoff/matches/${encodeURIComponent(matchId)}/share`,
    { method: 'POST', body: JSON.stringify({ visibility: 'result' }) }
  );
}

export async function reportTradeoffProblem(matchId: string, contentVersionId: string) {
  return request<{ accepted: true }>(`/tradeoff/matches/${encodeURIComponent(matchId)}/reports`, {
    method: 'POST',
    body: JSON.stringify({
      contentVersionId,
      reasonCode: 'other',
      details: 'Reported from the Tradeoff result surface for operator review.',
      idempotencyKey: warOperationId('tradeoff-report'),
    }),
  });
}

export function warOperationId(prefix: string) {
  return `${prefix}:${crypto.randomUUID()}`;
}
