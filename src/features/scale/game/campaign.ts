import type { Company } from './model';

export interface Campaign {
  stage: number;
  phase: 'waiting' | 'offer' | 'active' | 'review' | 'done';
  approach: 'steady' | 'bold';
  elapsed: number;
  healthyHours: number;
  mitigated: boolean;
  passed: boolean;
  reward: number;
  earned: number;
  lostUsers: number;
  attempts: number;
}
export const freshCampaign = (): Campaign => ({
  stage: 0,
  phase: 'waiting',
  approach: 'steady',
  elapsed: 0,
  healthyHours: 0,
  mitigated: false,
  passed: false,
  reward: 0,
  earned: 0,
  lostUsers: 0,
  attempts: 0,
});
export const CAMPAIGN_EVENTS = [
  {
    title: 'Your launch gets noticed',
    detail:
      'A launch partner wants to feature your product. Choose how much traffic to welcome, then serve it reliably.',
    lesson: 'capacity-estimation',
    steady: 'Stagger the rollout',
    bold: 'Take the spotlight',
  },
  {
    title: 'Maintenance during business hours',
    detail:
      'Your primary app host needs maintenance. Choose a short window or accept a longer window for a larger service credit. Shared data services stay live.',
    lesson: 'reliability-fault-tolerance',
    steady: 'Short maintenance window',
    bold: 'Take the longer window',
  },
] as const;
export const eventTerms = (stage: number, approach: Campaign['approach']) => ({
  load: stage === 0 ? (approach === 'bold' ? 2 : 1.25) : 1,
  outage: stage === 1 ? (approach === 'bold' ? 8 : 4) : 0,
  reward: approach === 'bold' ? 450 : 180,
  duration: 24,
  required: 14,
});
export const campaignLoad = (c: Company) =>
  c.campaign?.phase === 'active' && !c.campaign.mitigated
    ? eventTerms(c.campaign.stage, c.campaign.approach).load
    : 1;
export const campaignOutage = (c: Company) =>
  !!(
    c.campaign?.phase === 'active' &&
    c.campaign.stage === 1 &&
    !c.campaign.mitigated &&
    c.campaign.elapsed < eventTerms(1, c.campaign.approach).outage
  );
export const campaignReady = (c: Company) => !c.campaign || c.campaign.phase === 'done';
export const campaignAwaiting = (c: Company) =>
  c.campaign?.phase === 'offer' || c.campaign?.phase === 'review';

export function startEvent(c: Company, approach: Campaign['approach']) {
  const p = c.campaign;
  if (!p || p.phase !== 'offer') return false;
  Object.assign(p, {
    phase: 'active',
    approach,
    elapsed: 0,
    healthyHours: 0,
    mitigated: false,
    passed: false,
    reward: 0,
    attempts: p.attempts + 1,
  });
  c.paused = false;
  return true;
}
export function reviewEvent(c: Company) {
  const p = c.campaign;
  if (!p || p.phase !== 'review') return;
  if (p.passed) p.stage++;
  p.phase = p.stage === 2 ? 'done' : 'offer';
  c.paused = p.phase !== 'done';
}
export function advanceEvent(c: Company, healthy: boolean, hours: number) {
  const p = c.campaign;
  if (!p || p.phase !== 'active') return false;
  const terms = eventTerms(p.stage, p.approach);
  const dt = Math.min(hours, terms.duration - p.elapsed);
  p.elapsed += dt;
  if (healthy) p.healthyHours += dt;
  if (p.elapsed < terms.duration - 0.00001) return false;
  p.elapsed = terms.duration;
  p.passed = p.healthyHours + 0.00001 >= terms.required;
  p.reward = p.passed
    ? Math.round(
        terms.reward * (p.mitigated ? 0.25 : 1) * Math.min(1, p.healthyHours / terms.duration)
      )
    : 0;
  p.earned += p.reward;
  c.cash += p.reward;
  p.phase = 'review';
  c.paused = true;
  return true;
}
export function validCampaign(value: unknown): boolean {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object') return false;
  const p = value as Campaign;
  return (
    [0, 1, 2].includes(p.stage) &&
    ['waiting', 'offer', 'active', 'review', 'done'].includes(p.phase) &&
    ['steady', 'bold'].includes(p.approach) &&
    [p.elapsed, p.healthyHours, p.reward, p.earned, p.lostUsers, p.attempts].every(
      (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0
    ) &&
    p.elapsed <= 24 &&
    p.healthyHours <= p.elapsed &&
    p.reward <= 450 &&
    p.earned >= p.reward &&
    p.earned <= 900 &&
    (p.phase !== 'waiting' || p.stage === 0) &&
    Number.isInteger(p.attempts) &&
    typeof p.mitigated === 'boolean' &&
    typeof p.passed === 'boolean' &&
    (p.stage === 2 ? p.phase === 'done' : p.phase !== 'done') &&
    (p.phase !== 'review' || p.elapsed === 24)
  );
}
