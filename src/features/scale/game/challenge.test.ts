import { describe, expect, it } from 'vitest';
import { challengeComplete, debrief, targetUsers } from './challenge';
import {
  freshCompany as createCompany,
  parseSave,
  WORKLOADS,
  type Upgrade,
  type Workload,
} from './model';
import { Runtime } from './runtime';

const freshCompany = (profile: Workload = 'saas') => createCompany(profile, false);

function advance(r: Runtime, hours: number) {
  for (let i = 0; i < hours * 10; i++) r.step(100);
}

function deploy(r: Runtime, kind: Upgrade) {
  r.command({ type: 'project', kind });
  if (r.company.project?.kind !== kind) throw new Error(`Could not start ${kind}`);
  advance(r, (r.company.project?.remaining ?? 0) + 0.2);
}

describe('finished challenges', () => {
  for (const profile of Object.keys(WORKLOADS) as Workload[]) {
    it(`can complete ${profile} through paid engineering and growth`, () => {
      const r = new Runtime(freshCompany(profile));
      r.command({ type: 'growth' });
      deploy(r, 'database');
      deploy(r, 'database');
      deploy(r, 'database');
      if (profile !== 'analytics') deploy(r, 'index');
      deploy(r, 'app');
      deploy(r, 'app');
      if (profile === 'social' || profile === 'inference') deploy(r, 'app');
      if (profile === 'inference') deploy(r, 'horizontal');
      r.command({ type: 'launch' });
      r.command({ type: 'growth' });
      for (let i = 0; i < 5000 && !r.company.paused; i++) {
        if (r.company.users >= targetUsers(r.company) && r.company.growth)
          r.command({ type: 'growth' });
        r.step(100);
      }
      expect(
        challengeComplete(r.company),
        JSON.stringify({
          users: r.company.users,
          run: r.company.run,
          system: r.view().snapshot.system,
        })
      ).toBe(true);
      expect(r.company.cash).toBeGreaterThan(0);
      const restored = new Runtime(parseSave(JSON.stringify(r.company)));
      const hours = restored.company.hours;
      restored.command({ type: 'pause' });
      advance(restored, 1);
      expect(restored.company.hours).toBe(hours);
      restored.command({ type: 'continue' });
      advance(restored, 1);
      expect(restored.company.hours).toBeGreaterThan(hours);
    }, 30000);
  }
  it('also completes SaaS with a cheaper query optimization strategy', () => {
    const r = new Runtime(freshCompany('saas'));
    r.command({ type: 'growth' });
    deploy(r, 'index');
    deploy(r, 'app');
    r.command({ type: 'launch' });
    r.command({ type: 'growth' });
    for (let i = 0; i < 3000 && !r.company.paused; i++) {
      if (r.company.users >= targetUsers(r.company) && r.company.growth)
        r.command({ type: 'growth' });
      r.step(100);
    }
    expect(challengeComplete(r.company)).toBe(true);
    expect(r.company.architecture.database).toBe(0);
    expect(r.company.cash).toBeGreaterThan(0);
  });
  it('does not award progress in sandbox and resets stability on missed targets', () => {
    const c = freshCompany();
    c.run = { stableHours: 12, continued: false };
    const r = new Runtime(c);
    r.command({ type: 'sandbox' });
    advance(r, 25);
    expect(r.company.run?.stableHours).toBe(12);
    r.command({ type: 'return' });
    advance(r, 0.1);
    expect(r.company.run?.stableHours).toBe(0);
  });
  it('reports current bankruptcy while retaining an earlier achievement', () => {
    const c = freshCompany();
    c.cash = 0;
    c.hours = 30;
    c.run = { stableHours: 24, completedAt: 24, continued: true };
    const r = new Runtime(c);
    advance(r, 1);
    expect(r.company.paused).toBe(true);
    expect(debrief(r.company, r.view().snapshot)).toContain('Outcome: Runway exhausted');
    expect(debrief(r.company, r.view().snapshot)).toContain('challenge completed at 24.0');
  });
  it('stops offline progress at completion and resets only the selected challenge', () => {
    const c = freshCompany('commerce');
    c.users = targetUsers(c);
    c.launched = true;
    c.growth = false;
    c.architecture = { app: 3, instances: 1, database: 3, indexed: true, cache: true };
    c.cacheAge = 8;
    c.run = { stableHours: 23.9, continued: false };
    c.savedAt = Date.now() - 60000;
    const r = new Runtime(c);
    expect(challengeComplete(r.company)).toBe(true);
    expect(r.company.hours).toBeLessThan(1);
    expect(r.company.paused).toBe(true);
    r.command({ type: 'reset-company' });
    expect(r.company.scenario).toBe('commerce');
    expect(challengeComplete(r.company)).toBe(false);
    expect(r.company.users).toBe(WORKLOADS.commerce.users);
  });
  it('accepts legacy saves and rejects malformed challenge progress', () => {
    const c = freshCompany();
    expect(parseSave(JSON.stringify(c))).not.toBeNull();
    for (const run of [
      null,
      { stableHours: 25, continued: false },
      { stableHours: 0, continued: true },
      { stableHours: 24, completedAt: -1, continued: false },
    ])
      expect(parseSave(JSON.stringify({ ...c, run }))).toBeNull();
  });
});
