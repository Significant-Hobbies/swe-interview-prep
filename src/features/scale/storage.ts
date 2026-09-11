import type { Workload } from './game/model';
// Local game state is intentionally separate from mastery and cloud-synced records.
export function scaleSaveKey(accountId?: string, scenario: Workload = 'saas'): string {
  const base = accountId
    ? `swe:scale:company:v1:account:${encodeURIComponent(accountId)}`
    : 'swe:scale:company:v1:guest';
  return scenario === 'saas' ? base : `${base}:project:${scenario}`;
}
