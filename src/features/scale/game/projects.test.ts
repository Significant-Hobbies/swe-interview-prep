import { describe, expect, it } from 'vitest';
import { freshCompany, parseSave, topology, WORKLOADS, type Workload } from './model';
import { Runtime } from './runtime';
import { Engine } from '../vendor/breakscale/engine';
import { scaleSaveKey } from '../storage';

function measure(workload: Workload) {
  const e = new Engine(topology(freshCompany().architecture, 70, workload), 42);
  for (let i = 0; i < 200; i++) e.advance(50);
  return e.snapshot();
}

describe('project difficulty', () => {
  it('makes AI requests consume more app capacity under identical offered traffic', () => {
    expect(measure('inference').nodes.app.utilization).toBeGreaterThan(
      measure('saas').nodes.app.utilization * 2
    );
  });
  it('starts every profile in a recoverable operating range', () => {
    for (const id of Object.keys(WORKLOADS) as Workload[]) {
      const runtime = new Runtime(freshCompany(id));
      expect(runtime.view().snapshot.system.errorRate, id).toBeLessThan(0.02);
      expect(runtime.company.cash, id).toBeGreaterThan(0);
    }
  });
  it('preserves the selected project on reset and save reload', () => {
    const runtime = new Runtime(freshCompany('social'));
    runtime.command({ type: 'reset-company' });
    expect(parseSave(JSON.stringify(runtime.company))?.scenario).toBe('social');
    expect(runtime.company.workload).toBe('social');
  });
  it('keeps old SaaS saves readable and rejects invalid profile identifiers', () => {
    const old = freshCompany();
    delete old.scenario;
    expect(parseSave(JSON.stringify(old))).not.toBeNull();
    expect(parseSave(JSON.stringify({ ...old, scenario: 'toString' }))).toBeNull();
  });
  it('keeps five independent companies per account without changing the legacy SaaS key', () => {
    const keys = Object.keys(WORKLOADS).map((id) => scaleSaveKey('a', id as Workload));
    expect(new Set(keys).size).toBe(5);
    expect(scaleSaveKey('a', 'saas')).toBe('swe:scale:company:v1:account:a');
    expect(scaleSaveKey('a', 'social')).not.toBe(scaleSaveKey('b', 'social'));
  });
});
