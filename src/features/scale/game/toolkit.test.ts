import { describe, expect, it } from 'vitest';
import { Engine } from '../vendor/breakscale/engine';
import type { Topology } from '../vendor/breakscale/types';
import {
  available,
  cost,
  DECISIONS,
  freshCompany,
  parseSave,
  topology,
  upgrade,
  type Architecture,
  type Upgrade,
  type Workload,
} from './model';
import { pendingJobs, serviceHealthy } from './health';
import { complexity, prerequisite, projectHours } from './toolkit';
import { Runtime } from './runtime';

function measure(a: Architecture, rps = 500, workload: Workload = 'saas', seconds = 15) {
  const e = new Engine(topology(a, rps, workload), 42);
  for (let i = 0; i < seconds * 20; i++) e.advance(50);
  return e;
}
const base = () => freshCompany().architecture;
const strong = (): Architecture => ({ ...base(), app: 3, database: 3 });
function advance(r: Runtime, hours: number) {
  for (let i = 0; i < hours * 10; i++) r.step(100);
}
function connected(t: Topology): boolean {
  const seen = new Set(['users']);
  for (let i = 0; i < t.nodes.length; i++)
    for (const edge of t.edges) if (seen.has(edge.from)) seen.add(edge.to);
  return t.nodes.every((n) => seen.has(n.id));
}

describe('expanded infrastructure', () => {
  it('keeps legacy architectures unchanged and rejects malformed extras', () => {
    const old = freshCompany();
    expect(parseSave(JSON.stringify(old))).toEqual(old);
    expect(topology(old.architecture, 70, 'saas').nodes.map((n) => n.id)).toEqual([
      'users',
      'app',
      'db',
    ]);
    for (const extra of [
      { shards: 0 },
      { workers: 1 },
      { failover: true },
      { cacheSize: 4 },
      { queue: true },
      { replicas: 100 },
      { stream: 3 },
    ])
      expect(
        parseSave(JSON.stringify({ ...old, architecture: { ...old.architecture, ...extra } }))
      ).toBeNull();
  });
  it('has 17 deployable options with explicit dependency checks and connected paths', () => {
    expect(DECISIONS).toHaveLength(17);
    expect(prerequisite(base(), 'workers')).toContain('queue');
    expect(available(base(), 'failover')).toBe(false);
    let a = base();
    const order: Upgrade[] = [
      'app',
      'horizontal',
      'database',
      'index',
      'cache',
      'pool',
      'replicas',
      'shards',
      'queue',
      'workers',
      'storage',
      'cdn',
      'search',
      'stream',
      'regions',
      'failover',
      'cache-scale',
    ];
    for (const id of order) {
      expect(available(a, id), id).toBe(true);
      a = upgrade(a, id);
      expect(connected(topology(a, 500, 'social')), id).toBe(true);
      expect(parseSave(JSON.stringify({ ...freshCompany(), architecture: a })), id).not.toBeNull();
    }
    expect(cost(a)).toBeGreaterThan(cost(base()) * 10);
    expect(projectHours(a, DECISIONS[0])).toBeGreaterThan(DECISIONS[0].hours);
    expect(complexity(a)).toBeGreaterThan(20);
  });
  it('replicas add read throughput and report stale reads', () => {
    const a = { ...base(), app: 3, replicas: 1 };
    const one = measure(a).snapshot();
    const four = measure({ ...a, replicas: 4 }).snapshot();
    expect(four.system.goodputRps).toBeGreaterThan(one.system.goodputRps * 1.5);
    expect(four.nodes.db.staleReadRate).toBeGreaterThanOrEqual(0);
  });
  it('extra replicas do not add write slots or remove primary contention', () => {
    const run = (replicas: number) => {
      const t = topology({ ...base(), app: 3, replicas }, 500, 'analytics');
      const db = t.nodes.find((n) => n.id === 'db')!;
      db.config.readFraction = 0;
      const e = new Engine(t, 42);
      for (let i = 0; i < 400; i++) e.advance(50);
      return e.snapshot().system.goodputRps;
    };
    expect(run(4)).toBeCloseTo(run(1), 5);
  });
  it('shards split write pressure while hot keys still overload one partition', () => {
    const a = { ...base(), app: 3 };
    const one = measure(a, 800, 'analytics').snapshot();
    const eight = measure({ ...a, shards: 8 }, 800, 'analytics');
    expect(eight.snapshot().system.goodputRps).toBeGreaterThan(one.system.goodputRps * 2);
    eight.updateNodeConfig('shards', { hotKeyFraction: 0.9 });
    for (let i = 0; i < 300; i++) eight.advance(50);
    expect(eight.snapshot().nodes.db.utilization).toBeGreaterThan(
      eight.snapshot().nodes['db-1'].utilization * 2
    );
    expect(eight.snapshot().system.errorRate).toBeGreaterThan(0.02);
  });
  it('queue acknowledgement does not falsely qualify a backed-up company', () => {
    const s = measure({ ...strong(), queue: true, workers: 1 }, 800, 'analytics', 3).snapshot();
    expect(s.system.errorRate).toBeLessThan(0.02);
    expect(pendingJobs(s)).toBeGreaterThan(500);
    expect(serviceHealthy(s)).toBe(false);
    const faster = measure(
      { ...strong(), queue: true, workers: 8 },
      800,
      'analytics',
      3
    ).snapshot();
    expect(pendingJobs(faster)).toBeLessThan(pendingJobs(s));
  });
  it('stream partitions bound consumption independently of worker count', () => {
    const a = { ...strong(), workers: 8, stream: 4 };
    const four = measure(a, 800, 'analytics', 3).snapshot();
    const sixteen = measure({ ...a, stream: 16 }, 800, 'analytics', 3).snapshot();
    expect(sixteen.nodes.stream.deliveryRate).toBeGreaterThan(four.nodes.stream.deliveryRate!);
    expect(sixteen.nodes.stream.consumerLag).toBeLessThan(four.nodes.stream.consumerLag!);
  });
  it('routes blobs and search away from MySQL and CDN hits away from origin', () => {
    const baseline = measure(strong(), 500, 'commerce').snapshot();
    const split = measure({ ...strong(), storage: true, search: true }, 500, 'commerce').snapshot();
    expect(split.nodes.storage.throughput).toBeGreaterThan(30);
    expect(split.nodes.search.throughput).toBeGreaterThan(30);
    expect(split.nodes.db.throughput).toBeLessThan(baseline.nodes.db.throughput * 0.85);
    const edge = measure({ ...strong(), cdn: true }, 500, 'commerce').snapshot();
    expect(edge.nodes.app.arrivalRate).toBeLessThan(baseline.nodes.app.arrivalRate * 0.9);
  });
  it('fails over to standby after the configured outage window', () => {
    const fast = measure({ ...strong(), regions: true, failover: true }, 100);
    const slow = measure({ ...strong(), regions: true }, 100);
    for (const e of [fast, slow]) {
      e.injectFailure('app', 'crash');
      for (let i = 0; i < 100; i++) e.advance(50);
    }
    expect(fast.snapshot().nodes.region.activeRegion).toBe(1);
    expect(fast.snapshot().system.errorRate).toBeLessThan(0.02);
    expect(slow.snapshot().system.errorRate).toBeGreaterThan(0.9);
  });
  it('sandbox preserves company backlog and faults never cross into the company', () => {
    const c = freshCompany('analytics');
    c.architecture = { ...strong(), queue: true, workers: 1 };
    c.users = 3500;
    const r = new Runtime(c);
    const engine = r.engine;
    const pending = pendingJobs(r.view().snapshot);
    r.command({ type: 'sandbox' });
    r.command({ type: 'fault', node: 'app', active: true });
    advance(r, 2);
    r.command({ type: 'return' });
    expect(r.engine).toBe(engine);
    expect(pendingJobs(r.view().snapshot)).toBe(pending);
    expect(r.view().snapshot.activeFailures).toHaveLength(0);
  });
  it('restores pending work on reload and pauses for review', () => {
    const c = freshCompany('analytics');
    c.architecture = { ...strong(), queue: true, workers: 1 };
    c.pendingJobs = 1000;
    const r = new Runtime(c);
    expect(r.company.paused).toBe(true);
    expect(pendingJobs(r.view().snapshot)).toBeGreaterThanOrEqual(1000);
    expect(r.offline).toContain('restored');
  });
  it('connection pooling bounds admission and cache scaling changes both cost and coverage', () => {
    const t = topology({ ...strong(), pool: true }, 1000, 'saas');
    expect(t.nodes.find((n) => n.id === 'pool')?.config.bulkheadMax).toBe(32);
    const bounded = measure({ ...base(), app: 3, pool: true }, 800).snapshot();
    expect(bounded.nodes.pool.bulkheadRejectedRate).toBeGreaterThan(0);
    expect(bounded.nodes.db.queued).toBeLessThanOrEqual(32);
    const a = { ...strong(), cache: true };
    const small = topology({ ...a, cacheSize: 1 }, 500, 'social');
    const large = topology({ ...a, cacheSize: 4 }, 500, 'social');
    expect(large.nodes.find((n) => n.id === 'cache')?.config.hitRate).toBeGreaterThan(
      small.nodes.find((n) => n.id === 'cache')!.config.hitRate
    );
    expect(cost({ ...a, cacheSize: 4 }) - cost(a)).toBe(540);
  });
  it('a scheduled game outage persists across reload and ends after twelve hours', () => {
    const c = freshCompany('saas', false);
    c.hours = 167.95;
    c.launched = true;
    c.growth = false;
    const r = new Runtime(c);
    advance(r, 0.1);
    expect(r.company.outageUntil).toBeGreaterThan(179);
    expect(r.view().snapshot.activeFailures.map((f) => f.nodeId)).toContain('app');
    const reloaded = new Runtime(parseSave(JSON.stringify(r.company)));
    expect(reloaded.view().snapshot.activeFailures.map((f) => f.nodeId)).toContain('app');
    advance(reloaded, 13);
    expect(reloaded.view().snapshot.activeFailures).toHaveLength(0);
  });
  it('preserves unfinished stream work when partitions are expanded', () => {
    const c = freshCompany('analytics');
    c.architecture = { ...strong(), stream: 4, workers: 1 };
    c.users = 3500;
    const r = new Runtime(c);
    const before = pendingJobs(r.view().snapshot);
    r.command({ type: 'project', kind: 'stream' });
    r.company.project!.remaining = 0.1;
    advance(r, 0.1);
    expect(pendingJobs(r.view().snapshot)).toBeGreaterThanOrEqual(before - 100);
    expect(r.company.pendingJobs).toBeGreaterThan(0);
  });
  it('charges the shown complexity-adjusted time and preserves queue work during stream migration', () => {
    const c = freshCompany('analytics');
    c.architecture = { ...strong(), queue: true, workers: 1 };
    c.users = 3500;
    const r = new Runtime(c);
    r.command({ type: 'project', kind: 'stream' });
    expect(r.company.project?.total).toBe(
      projectHours(c.architecture, DECISIONS.find((d) => d.id === 'stream')!)
    );
    r.company.project!.remaining = 0.1;
    const pending = pendingJobs(r.view().snapshot);
    advance(r, 0.1);
    expect(r.company.architecture.stream).toBe(4);
    expect(pendingJobs(r.view().snapshot)).toBeGreaterThanOrEqual(pending - 100);
  });
});
