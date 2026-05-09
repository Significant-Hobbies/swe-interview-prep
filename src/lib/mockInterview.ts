import type { InterviewCategory } from '../types';

export type MockInterviewType = InterviewCategory | 'mixed';

export interface MockInterviewConfig {
  role: string;
  minutes: number;
  mix: MockInterviewType[];
}

export interface MockTurn {
  id: string;
  type: InterviewCategory;
  prompt: string;
  answer?: string;
  code?: string;
  diagramText?: string;
  followUp?: string;
  rubric?: RubricScore;
}

export interface RubricScore {
  clarity: number;
  correctness: number;
  tradeoffs: number;
  communication: number;
  overall: number;
  missedPatterns: string[];
}

export interface ReviewCard {
  id: string;
  front: string;
  back: string;
  sourceTurnId: string;
  rating: 'again' | 'hard' | 'good';
}

export interface MockInterviewSession {
  id: string;
  role: string;
  minutes: number;
  startedAt: string;
  status: 'setup' | 'running' | 'complete';
  currentTurn: number;
  turns: MockTurn[];
  transcript: Array<{ speaker: 'interviewer' | 'candidate'; text: string }>;
  reviewCards: ReviewCard[];
}

const PROMPTS: Record<InterviewCategory, string[]> = {
  dsa: [
    'Implement a function that returns the shortest path length in an unweighted graph. Explain complexity and edge cases.',
    'Design an algorithm for a stream of integers that returns the current median after each insert.',
  ],
  lld: [
    'Design a rate limiter for an API gateway. Explain the objects, boundaries, and failure cases.',
    'Design a parking-lot model with payment, spot assignment, and extension points.',
  ],
  hld: [
    'Design a real-time collaborative document editor. Cover sync, conflict handling, storage, and observability.',
    'Design a notification platform that supports email, push, retries, preferences, and rate limits.',
  ],
  behavioral: [
    'Tell me about a time you disagreed with a technical direction. What did you do and what changed?',
    'Describe a project that failed or slipped. How did you recover and what did you learn?',
  ],
};

const PATTERNS: Record<InterviewCategory, string[]> = {
  dsa: ['edge cases', 'complexity analysis', 'test cases'],
  lld: ['interfaces', 'state ownership', 'extension points'],
  hld: ['scale bottlenecks', 'data consistency', 'operability'],
  behavioral: ['specific situation', 'measured result', 'reflection'],
};

const INTERVIEW_CATEGORIES: InterviewCategory[] = ['dsa', 'lld', 'hld', 'behavioral'];

export function startMockInterview(config: MockInterviewConfig): MockInterviewSession {
  const mix: MockInterviewType[] = config.mix.length > 0 ? config.mix : ['dsa', 'hld', 'behavioral'];
  const turns: MockTurn[] = mix.slice(0, 6).map((type, index) => {
    const category = type === 'mixed' ? INTERVIEW_CATEGORIES[index % INTERVIEW_CATEGORIES.length] : type;
    const prompts = PROMPTS[category];
    return {
      id: `turn-${index + 1}`,
      type: category,
      prompt: prompts[index % prompts.length],
    };
  });

  return {
    id: `mock-${Date.now()}`,
    role: config.role.trim() || 'Software Engineer',
    minutes: Math.max(15, Math.min(120, config.minutes || 45)),
    startedAt: new Date().toISOString(),
    status: 'running',
    currentTurn: 0,
    turns,
    transcript: turns[0]
      ? [{ speaker: 'interviewer', text: turns[0].prompt }]
      : [],
    reviewCards: [],
  };
}

export function submitMockTurn(
  session: MockInterviewSession,
  input: { answer: string; code?: string; diagramText?: string },
): MockInterviewSession {
  if (session.status !== 'running') return session;
  const turn = session.turns[session.currentTurn];
  if (!turn) return finishMockInterview(session);

  const rubric = scoreTurn(turn.type, input);
  const followUp = buildFollowUp(turn.type, rubric);
  const nextTurns = session.turns.map((row, index) =>
    index === session.currentTurn
      ? { ...row, ...input, rubric, followUp }
      : row,
  );
  const transcript = [
    ...session.transcript,
    { speaker: 'candidate' as const, text: input.answer },
    { speaker: 'interviewer' as const, text: followUp },
  ];
  const nextIndex = session.currentTurn + 1;

  if (nextIndex >= nextTurns.length) {
    return finishMockInterview({
      ...session,
      turns: nextTurns,
      transcript,
      currentTurn: nextIndex,
    });
  }

  return {
    ...session,
    turns: nextTurns,
    transcript: [...transcript, { speaker: 'interviewer', text: nextTurns[nextIndex].prompt }],
    currentTurn: nextIndex,
  };
}

export function finishMockInterview(session: MockInterviewSession): MockInterviewSession {
  const reviewCards = generateReviewCards(session.turns);
  return {
    ...session,
    status: 'complete',
    reviewCards,
  };
}

export function summarizeMockInterview(session: MockInterviewSession) {
  const scored = session.turns.filter((turn) => turn.rubric);
  const avg = scored.length
    ? Math.round(scored.reduce((sum, turn) => sum + (turn.rubric?.overall ?? 0), 0) / scored.length)
    : 0;
  const missedPatterns = Array.from(
    new Set(scored.flatMap((turn) => turn.rubric?.missedPatterns ?? [])),
  );
  return {
    overall: avg,
    turnsCompleted: scored.length,
    missedPatterns,
    replayableTranscript: session.transcript,
    reviewCards: session.reviewCards,
  };
}

export function validateRubric(rubric: RubricScore): RubricScore {
  const clarity = clamp(rubric.clarity);
  const correctness = clamp(rubric.correctness);
  const tradeoffs = clamp(rubric.tradeoffs);
  const communication = clamp(rubric.communication);
  return {
    clarity,
    correctness,
    tradeoffs,
    communication,
    overall: Math.round((clarity + correctness + tradeoffs + communication) / 4),
    missedPatterns: rubric.missedPatterns,
  };
}

export function generateReviewCards(turns: MockTurn[]): ReviewCard[] {
  return turns
    .filter((turn) => turn.rubric && turn.rubric.missedPatterns.length > 0)
    .flatMap((turn) =>
      turn.rubric!.missedPatterns.slice(0, 2).map((pattern) => ({
        id: `${turn.id}-${slug(pattern)}`,
        sourceTurnId: turn.id,
        front: `In a ${turn.type.toUpperCase()} interview, how do you cover ${pattern}?`,
        back: `Revisit: ${turn.prompt}\n\nAdd explicit coverage for ${pattern} before moving on.`,
        rating: turn.rubric!.overall < 45 ? 'again' : turn.rubric!.overall < 70 ? 'hard' : 'good',
      })),
    );
}

function scoreTurn(type: InterviewCategory, input: { answer: string; code?: string; diagramText?: string }): RubricScore {
  const answer = input.answer.trim();
  const lower = answer.toLowerCase();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const hasTradeoffs = /trade.?off|latency|memory|cost|consistency|risk|edge/i.test(answer);
  const hasComplexity = /o\(|complexity|time|space/i.test(answer);
  const hasExamples = /example|case|scenario|metric|result/i.test(answer);
  const codeSignal = input.code && input.code.trim().length > 80 ? 18 : 0;
  const diagramSignal = input.diagramText && input.diagramText.trim().length > 40 ? 18 : 0;

  const correctnessBase = type === 'dsa' ? (hasComplexity ? 32 : 18) + codeSignal : type === 'hld' || type === 'lld' ? 26 + diagramSignal : 28;
  const rubric = validateRubric({
    clarity: Math.min(100, 25 + wordCount * 2 + (hasExamples ? 12 : 0)),
    correctness: Math.min(100, correctnessBase + (lower.includes('test') ? 10 : 0)),
    tradeoffs: hasTradeoffs ? 78 : 32,
    communication: Math.min(100, 35 + wordCount + (answer.includes('\n') ? 8 : 0)),
    overall: 0,
    missedPatterns: PATTERNS[type].filter((pattern) => !lower.includes(pattern.split(' ')[0])),
  });
  return rubric;
}

function buildFollowUp(type: InterviewCategory, rubric: RubricScore) {
  const missing = rubric.missedPatterns[0] ?? PATTERNS[type][0];
  if (rubric.overall >= 75) {
    return `Good. Now tighten it: what is the hardest failure mode for ${missing}, and how would you prove your approach works?`;
  }
  return `Let's go one layer deeper without jumping to a solution: walk me through ${missing} for your answer.`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
