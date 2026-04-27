import { describe, expect,it } from 'vitest';

import data from './concepts.json';

const concepts = (data as any).concepts;
const ids = new Set(concepts.map((c: any) => c.id));

describe('concept taxonomy', () => {
  it('has at least 50 concepts', () => {
    expect(concepts.length).toBeGreaterThanOrEqual(50);
  });

  it('all ids unique', () => {
    expect(ids.size).toBe(concepts.length);
  });

  it('every concept has required fields', () => {
    for (const c of concepts) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(['dsa', 'lld', 'hld', 'behavioral']).toContain(c.category);
      expect(Array.isArray(c.prereqs)).toBe(true);
      expect(c.description).toBeTruthy();
    }
  });

  it('all prereqs reference existing concept ids', () => {
    const broken: string[] = [];
    for (const c of concepts) {
      for (const p of c.prereqs) {
        if (!ids.has(p)) broken.push(`${c.id}→${p}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('no concept self-references', () => {
    for (const c of concepts) {
      expect(c.prereqs).not.toContain(c.id);
    }
  });

  it('prereq DAG has no cycles', () => {
    const map = Object.fromEntries(concepts.map((c: any) => [c.id, c.prereqs]));
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color: Record<string, number> = {};
    for (const id of ids) color[id as string] = WHITE;
    const cycles: string[] = [];

    function dfs(id: string, path: string[]) {
      if (color[id] === GRAY) {
        cycles.push([...path, id].join('→'));
        return;
      }
      if (color[id] === BLACK) return;
      color[id] = GRAY;
      for (const p of map[id] || []) dfs(p, [...path, id]);
      color[id] = BLACK;
    }
    for (const id of ids) dfs(id as string, []);
    expect(cycles).toEqual([]);
  });

  it('every category has at least 5 concepts', () => {
    const counts: Record<string, number> = {};
    for (const c of concepts) counts[c.category] = (counts[c.category] || 0) + 1;
    expect(counts.dsa).toBeGreaterThanOrEqual(5);
    expect(counts.lld).toBeGreaterThanOrEqual(5);
    expect(counts.hld).toBeGreaterThanOrEqual(5);
    expect(counts.behavioral).toBeGreaterThanOrEqual(5);
  });
});
