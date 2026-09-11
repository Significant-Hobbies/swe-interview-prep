import { describe, expect, it } from 'vitest';
import { Runtime } from './runtime';
import { freshCompany, parseSave, traffic, WORKLOADS, type Workload, type Upgrade } from './model';
import {
  advanceEvent,
  campaignOutage,
  freshCampaign,
  reviewEvent,
  startEvent,
  validCampaign,
} from './campaign';
import { challengeComplete, targetUsers } from './challenge';

const advance = (r: Runtime, hours: number) => {
  for (let i = 0; i < hours * 10; i++) r.step(100);
};
function deploy(r: Runtime, kind: Upgrade) {
  r.command({ type: 'project', kind });
  if (r.company.project?.kind !== kind) throw new Error(`Could not start ${kind}`);
  advance(r, r.company.project!.remaining + 0.2);
}

describe('campaign choices and recovery', () => {
  it('requires an explicit choice, preserves it on reload, and isolates Sandbox', () => {
    const r = new Runtime();
    r.command({ type: 'launch' });
    expect(r.company.campaign?.phase).toBe('offer');
    expect(r.company.paused).toBe(true);
    advance(r, 30);
    expect(r.company.campaign?.elapsed).toBe(0);
    const reloaded = new Runtime(parseSave(JSON.stringify(r.company)));
    const before = structuredClone(reloaded.company);
    reloaded.command({ type: 'sandbox' });
    reloaded.command({ type: 'event-start', approach: 'bold' });
    advance(reloaded, 30);
    expect(reloaded.company).toEqual(before);
    reloaded.command({ type: 'return' });
    reloaded.command({ type: 'event-start', approach: 'bold' });
    expect(traffic(reloaded.company)).toBeCloseTo(traffic(before) * 2);
    reloaded.command({ type: 'event-mitigate' });
    expect(traffic(reloaded.company)).toBeCloseTo(traffic(before));
  });
  it('pays measured rewards only once and retries retain the architecture', () => {
    const c = freshCompany();
    c.campaign!.phase = 'offer';
    const cash = c.cash;
    startEvent(c, 'bold');
    advanceEvent(c, false, 24);
    expect(c.campaign?.passed).toBe(false);
    expect(c.cash).toBe(cash);
    const a = c.architecture;
    reviewEvent(c);
    expect(c.architecture).toBe(a);
    expect(c.campaign?.stage).toBe(0);
    startEvent(c, 'bold');
    c.campaign!.mitigated = true;
    advanceEvent(c, true, 24);
    expect(c.cash).toBe(cash + 113);
    advanceEvent(c, true, 24);
    expect(c.cash).toBe(cash + 113);
    reviewEvent(c);
    expect(c.campaign?.stage).toBe(1);
  });
  it('restores maintenance failures and lets rollback trade reward for recovery', () => {
    const c = freshCompany();
    c.launched = true;
    c.campaign = { ...freshCampaign(), stage: 1, phase: 'offer' };
    const r = new Runtime(c);
    r.command({ type: 'event-start', approach: 'bold' });
    advance(r, 1);
    const restored = new Runtime(parseSave(JSON.stringify(r.company)));
    expect(campaignOutage(restored.company)).toBe(true);
    expect(restored.view().snapshot.activeFailures.some((f) => f.nodeId === 'app')).toBe(true);
    restored.command({ type: 'event-mitigate' });
    expect(restored.view().snapshot.activeFailures).toHaveLength(0);
    expect(restored.company.campaign?.mitigated).toBe(true);
  });
  it('sustained failures lose customers without dropping below the original audience', () => {
    const c = freshCompany('analytics');
    c.launched = true;
    c.users = 4000;
    c.growth = false;
    const r = new Runtime(c);
    advance(r, 20);
    expect(r.company.users).toBeLessThan(4000);
    expect(r.company.users).toBeGreaterThanOrEqual(450);
    expect(r.company.campaign!.lostUsers).toBeGreaterThan(0);
  });
  it('rejects malformed campaign saves and preserves legacy completion rules', () => {
    expect(parseSave(JSON.stringify(freshCompany('saas', false)))?.campaign).toBeUndefined();
    for (const campaign of [
      null,
      {},
      { ...freshCampaign(), elapsed: Infinity },
      { ...freshCampaign(), stage: 2 },
      { ...freshCampaign(), healthyHours: 30 },
    ]) {
      expect(validCampaign(campaign)).toBe(false);
      expect(parseSave(JSON.stringify({ ...freshCompany(), campaign }))).toBeNull();
    }
  });
  for (const profile of Object.keys(WORKLOADS) as Workload[])
    it(`can recover, clear both events and finish ${profile}`, () => {
      const r = new Runtime(freshCompany(profile));
      r.command({ type: 'growth' });
      for (let i = 0; i < 3; i++) deploy(r, 'database');
      if (profile !== 'analytics') deploy(r, 'index');
      deploy(r, 'app');
      deploy(r, 'app');
      if (profile === 'social' || profile === 'inference') deploy(r, 'app');
      if (profile === 'inference') deploy(r, 'horizontal');
      r.command({ type: 'launch' });
      r.command({ type: 'event-start', approach: 'steady' });
      advance(r, 24.2);
      expect(r.company.campaign?.passed, JSON.stringify(r.company.campaign)).toBe(true);
      r.command({ type: 'event-review' });
      r.command({ type: 'event-start', approach: 'bold' });
      advance(r, 1);
      r.command({ type: 'event-mitigate' });
      advance(r, 23.2);
      expect(r.company.campaign?.passed, JSON.stringify(r.company.campaign)).toBe(true);
      r.command({ type: 'event-review' });
      r.command({ type: 'growth' });
      for (let i = 0; i < 6000 && !r.company.paused; i++) {
        if (r.company.users >= targetUsers(r.company) && r.company.growth)
          r.command({ type: 'growth' });
        r.step(100);
      }
      expect(
        challengeComplete(r.company),
        JSON.stringify({ campaign: r.company.campaign, users: r.company.users, run: r.company.run })
      ).toBe(true);
      expect(r.company.cash).toBeGreaterThan(0);
    });
});
