export type RoleFitImportance = 'must' | 'preferred' | 'context';

export interface RoleFitRequirement {
  id: string;
  label: string;
  importance: RoleFitImportance;
  sourcePhrase: string;
  conceptIds: string[];
  confidence: number;
  rationale: string;
}

export interface UnsupportedRoleFitRequirement {
  label: string;
  importance: RoleFitImportance;
  sourcePhrase: string;
  rationale: string;
}

export interface RoleFitAnalysis {
  roleTitle: string;
  summary: string;
  requirements: RoleFitRequirement[];
  unsupported: UnsupportedRoleFitRequirement[];
}

export const ROLE_FIT_MIN_JOB_DESCRIPTION_CHARS: number;
export const ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS: number;
export const ROLE_FIT_SYSTEM: string;

export class RoleFitValidationError extends Error {}

export function validateRoleFitAnalysis(raw: unknown, jobDescription: string): RoleFitAnalysis;
export function validateRoleFitInput(jobDescription: unknown): string;
export function buildRoleFitPrompt(input: {
  jobDescription: string;
  roleTitle?: string;
  interviewHorizonDays?: number | null;
}): string;
export function fingerprintRoleFitSource(jobDescription: string): string;
export function parseRoleFitModelText(text: string): unknown;
