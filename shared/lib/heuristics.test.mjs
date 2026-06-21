import { describe, it, expect } from 'vitest';
import { pickDailyConcept, tagConcepts, buildWeeklyReport } from './heuristics.mjs';

const CONCEPTS = [
  { id: 'a', name: 'A', category: 'dsa', prereqs: [] },
  { id: 'b', name: 'B', category: 'dsa', prereqs: ['a'] },
  { id: 'c', name: 'C', category: 'lld', prereqs: [] },
];

describe('pickDailyConcept', () => {
  it('returns null when concepts empty', () => {
    expect(pickDailyConcept([], [])).toBe(null);
  });

  it('picks untouched concept when no mastery exists', () => {
    const plan = pickDailyConcept(CONCEPTS, []);
    expect(plan).not.toBeNull();
    expect(['a', 'b', 'c']).toContain(plan.concept_id);
    expect(plan.generator).toBe('heuristic');
    expect(plan.roadmap_track).toBeTruthy();
    expect(plan.exit_criteria.length).toBeGreaterThan(0);
    expect(plan.artifacts.length).toBeGreaterThan(0);
    expect(plan.task_prompt).toContain('Roadmap proof contract');
  });

  it('picks lowest-confidence concept', () => {
    const masteryRows = [
      { concept_id: 'a', stability: 100, last_review: new Date().toISOString(), reps: 5, lapses: 0 },
      { concept_id: 'c', stability: 1, last_review: new Date(Date.now() - 30 * 86400000).toISOString(), reps: 1, lapses: 2 },
    ];
    const plan = pickDailyConcept(CONCEPTS, masteryRows);
    expect(plan.concept_id).toBe('c'); // c is rotting hardest
  });

  it('respects prereqs (does not pick b if a has 0 confidence)', () => {
    const masteryRows = [
      { concept_id: 'a', stability: 0.01, last_review: new Date(Date.now() - 100 * 86400000).toISOString(), reps: 1, lapses: 5 },
    ];
    const plan = pickDailyConcept(CONCEPTS, masteryRows);
    // b prereq a is failed (conf < 0.4), so b is excluded; a or c picked
    expect(['a', 'c']).toContain(plan.concept_id);
  });
});

describe('tagConcepts', () => {
  it('returns empty for short code', () => {
    expect(tagConcepts('x', 'js')).toEqual([]);
  });

  it('detects hashmap usage', () => {
    const code = `
      const map = new Map();
      for (const x of arr) map.set(x, (map.get(x) || 0) + 1);
      const set = new Set([1,2,3]);
    `;
    const tags = tagConcepts(code, 'js');
    const ids = tags.map(t => t.concept_id);
    expect(ids).toContain('array-hashing');
  });

  it('detects sliding window', () => {
    const code = `// sliding window approach\nlet left = 0, right = 0;\nwhile (right < n) { right++; }`;
    const tags = tagConcepts(code, 'js');
    expect(tags.map(t => t.concept_id)).toContain('sliding-window');
  });

  it('detects multiple concepts ranked by frequency', () => {
    const code = `
      function dfs(node) {
        if (!node) return;
        dfs(node.left);
        dfs(node.right);
      }
      const stack = [];
    `;
    const tags = tagConcepts(code, 'js');
    expect(tags.length).toBeGreaterThan(0);
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  it('depth scales with match count', () => {
    const codeDeep = 'cache cache cache cache LRU LRU eviction TTL';
    const tags = tagConcepts(codeDeep, 'js');
    const cacheTag = tags.find(t => t.concept_id === 'caching');
    expect(cacheTag.depth).toBe('deep');
  });
});

describe('buildWeeklyReport', () => {
  it('produces a report with required sections', () => {
    const out = buildWeeklyReport({
      activity: [{ duration_ms: 600000, concept_ids: ['a'] }],
      mastery: [{ concept_id: 'a', stability: 5, reps: 3, lapses: 0, last_review: new Date().toISOString() }],
      feynman: [{ grade: 75 }],
      concepts: CONCEPTS,
    });
    expect(out.reportMd).toContain('## Reality Check');
    expect(out.reportMd).toContain("## What's Rotting");
    expect(out.reportMd).toContain('## What You Avoided');
    expect(out.reportMd).toContain('## Wins');
    expect(out.reportMd).toContain("## Next Week's Bet");
    expect(out.stats.activityCount).toBe(1);
    expect(out.stats.totalMinutes).toBe(10);
    expect(out.stats.avgGrade).toBe(75);
  });

  it('handles empty data gracefully', () => {
    const out = buildWeeklyReport({ activity: [], mastery: [], feynman: [], concepts: CONCEPTS });
    expect(out.stats.activityCount).toBe(0);
    expect(out.stats.avgGrade).toBe(null);
    expect(out.reportMd).toContain('Reality Check');
  });

  it('flags avoided categories', () => {
    const out = buildWeeklyReport({
      activity: [{ duration_ms: 0, concept_ids: ['a'] }],
      mastery: [], feynman: [],
      concepts: CONCEPTS,
    });
    expect(out.reportMd).toMatch(/LLD|HLD|BEHAVIORAL/);
  });

  it('surfaces mock interview activity in stats and report', () => {
    const out = buildWeeklyReport({
      activity: [
        { kind: 'mock_start', duration_ms: 0, concept_ids: ['array-hashing'] },
        { kind: 'mock_complete', duration_ms: 0, concept_ids: ['array-hashing'], payload: { rating: 'good' } },
        { kind: 'drill_solve', duration_ms: 120000, concept_ids: ['array-hashing'] },
      ],
      mastery: [], feynman: [],
      concepts: CONCEPTS,
    });
    expect(out.stats.mockStarted).toBe(1);
    expect(out.stats.mockCompleted).toBe(1);
    expect(out.reportMd).toContain('Mock interviews: 1 completed');
    expect(out.reportMd).toContain('ratings: good');
  });
});
