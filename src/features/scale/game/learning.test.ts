import { diagnosis } from './challenge';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import concepts from '../../../data/concepts.json';
import { DECISIONS, freshCompany } from './model';
import { Runtime } from './runtime';
import { FAILURE_LEARNING, LESSONS, TOOL_LEARNING, lessonHref, observedFailures } from './learning';

describe('Scale learning coverage', () => {
  it('maps every intervention to mechanism and failure resources that exist in the curriculum', () => {
    expect(Object.keys(TOOL_LEARNING).sort()).toEqual(DECISIONS.map((d) => d.id).sort());
    for (const [key, [slug, title]] of Object.entries(LESSONS)) {
      expect(concepts.concepts.find((c) => c.id === slug)?.name).toBe(title);
      const html = readFileSync(`public${lessonHref(key as keyof typeof LESSONS)}`, 'utf8');
      expect(html).toContain('<h1');
      expect(html).not.toContain('Page not found');
    }
    for (const item of Object.values(TOOL_LEARNING)) {
      expect(LESSONS[item.mechanism]).toBeDefined();
      expect(LESSONS[item.failure]).toBeDefined();
      expect(item.question.endsWith('?')).toBe(true);
    }
    for (const item of Object.values(FAILURE_LEARNING)) expect(LESSONS[item.lesson]).toBeDefined();
  });

  it('distinguishes meaningful backlog from one harmless pending job', () => {
    const c = freshCompany();
    const s = new Runtime(c).view().snapshot;
    s.system.errorRate = 0;
    s.system.p99 = 50;
    const base = { ...s.nodes.db, queued: 0, utilization: 0.1, staleReadRate: 0 };
    s.nodes = { workers: { ...base, throughput: 10, inFlight: 1 }, queue: { ...base } };
    expect(observedFailures(c, s)).toEqual([]);
    s.nodes.search = { ...base, staleReadRate: 0.1 };
    expect(diagnosis(c, s)).toContain('Reads are fast but stale');
    delete s.nodes.search;
    s.nodes.queue.queued = 100;
    expect(observedFailures(c, s)).toContain('backlog');
    s.nodes.workers.throughput = 0;
    expect(observedFailures(c, s)).toContain('backlog');
  });

  it('covers every modeled failure family from independent snapshot evidence', () => {
    const c = freshCompany('analytics');
    c.cash = 0;
    const s = new Runtime(c).view().snapshot;
    const base = { ...s.nodes.db, queued: 0, utilization: 0.1, staleReadRate: 0 };
    s.nodes = {
      'db-0': { ...base, utilization: 1, queued: 64 },
      'db-1': { ...base, utilization: 0.1, staleReadRate: 0.1 },
      stream: { ...base, consumerLag: 100, retentionDropRate: 1 },
      workers: { ...base, throughput: 1, errorRate: 0.1 },
      pool: { ...base, bulkheadRejectedRate: 2 },
      cache: { ...base, hitRate: 0.1 },
    };
    // Use the engine's real failure shape rather than assuming its metadata.
    const r = new Runtime(c);
    r.command({ type: 'sandbox' });
    r.command({ type: 'fault', node: 'app', active: true });
    s.activeFailures = r.view().snapshot.activeFailures;
    expect(diagnosis(c, s)).toContain('A component is unavailable');
    s.system.errorRate = 0.2;
    expect(observedFailures(c, s).sort()).toEqual(
      Object.keys(FAILURE_LEARNING)
        .filter((id) => id !== 'slo')
        .sort()
    );
    c.cash = 100;
    s.activeFailures = [];
    s.nodes = { app: base };
    expect(observedFailures(c, s)).toEqual(['slo']);
  });
});
