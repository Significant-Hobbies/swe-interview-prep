// Lightweight per-track ELO math for adaptive drill selection.
// Problem ratings are derived from the existing `difficulty` field and stay
// static; only the user's per-track ELO updates. Picking a static prior
// avoids the circularity of single-user self-rating.

import type { Difficulty } from '../data/learning-os';

export const DEFAULT_USER_ELO = 1500;

const DIFFICULTY_ELO: Record<Difficulty, number> = {
  intro: 1200,
  core: 1600,
  advanced: 2000,
};

export function difficultyToElo(difficulty: Difficulty): number {
  return DIFFICULTY_ELO[difficulty] ?? DEFAULT_USER_ELO;
}

export function expectedScore(playerElo: number, problemElo: number): number {
  return 1 / (1 + 10 ** ((problemElo - playerElo) / 400));
}

// Higher K during the provisional window (first ~10 solves per track) for
// faster convergence; settles to a stable K after.
export function kFactor(solveCount: number): number {
  return solveCount < 10 ? 40 : 24;
}

/**
 * Standard Elo update. Score: 1 = solved, 0 = failed, 0.5 = partial.
 * Returns the new player ELO (problem ELO is static, so unchanged).
 */
export function updatePlayerElo(
  playerElo: number,
  problemElo: number,
  score: number,
  solveCount: number
): number {
  const expected = expectedScore(playerElo, problemElo);
  const k = kFactor(solveCount);
  return Math.round(playerElo + k * (score - expected));
}
