// Client wrappers for the BYOK AI endpoints (Gap Analyzer, Review Critic).
import { ARTIFACTS } from '../data/learning-os';
import { loadAIConfig } from '../hooks/useAI';
import { ALL_CONCEPTS } from '../hooks/useConcepts';
import type { SystemDesignCase } from '../data/system-design-case-schema';
import type { SystemDesignAttempt } from './systemDesignSession';

/** True when a complete BYOK provider (endpoint + key + model) is configured. */
export function aiConfigured(): boolean {
  const c = loadAIConfig();
  return !!(c.endpointUrl && c.apiKey && c.model);
}

export interface GapAnalysis {
  summary: string;
  weakAreas: string[];
  nextConcepts: { conceptId: string; why: string }[];
  recommendedArtifact: { artifactId: string; why: string };
  generator?: 'heuristic' | 'ai';
}

export interface Critique {
  score: number;
  verdict: string;
  missing: string[];
  strongerAnswer: string;
  followUps: string[];
}

async function postAI<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`/api/learning?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ...body, aiConfig: loadAIConfig() }),
  });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    throw new Error('AI service returned an invalid response.');
  }
  if (!res.ok) throw new Error(data.error || `AI request failed (${res.status}).`);
  return data as T;
}

export function analyzeGaps(profile: Record<string, unknown>): Promise<GapAnalysis> {
  return postAI<GapAnalysis>('gaps', {
    profile,
    catalog: {
      concepts: ALL_CONCEPTS.map((c) => ({ id: c.id, name: c.name, tags: c.tags })),
      artifacts: ARTIFACTS.map((a) => ({ id: a.id, title: a.title })),
    },
  });
}

export function critiqueAnswer(
  question: string,
  answer: string,
  expected: string
): Promise<Critique> {
  return postAI<Critique>('critique', { question, answer, expected });
}

export function critiqueSystemDesignAttempt(
  caseDefinition: SystemDesignCase,
  attempt: SystemDesignAttempt
): Promise<unknown> {
  return postAI<unknown>('critique', {
    systemDesignCase: {
      id: caseDefinition.id,
      version: caseDefinition.version,
      prompt: caseDefinition.prompt,
      hiddenAssumptions: caseDefinition.hiddenAssumptions,
      calculationAnchors: caseDefinition.calculationAnchors,
      dimensions: caseDefinition.rubricDimensions.map((dimension) => ({
        id: dimension.id,
        label: dimension.label,
        evidenceSignals: dimension.evidenceSignals,
        misconceptionSignals: dimension.misconceptionSignals,
        anchors: dimension.anchors,
      })),
    },
    stageAnswers: Object.fromEntries(
      Object.entries(attempt.answers).map(([stageId, submission]) => [
        stageId,
        submission?.answer ?? '',
      ])
    ),
  });
}
