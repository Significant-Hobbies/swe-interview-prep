import { describe, expect, it } from 'vitest';

import type { ParsedRepo } from '../../adapters/types';
import manifest from './manifest.json';

const contentModules = import.meta.glob<{ default: ParsedRepo }>('./*/content.json', {
  eager: true,
});

function flattenSections(sections: ParsedRepo['sections']): ParsedRepo['sections'] {
  return sections.flatMap((section) => [section, ...flattenSections(section.children || [])]);
}

describe('embedded learning library', () => {
  it('keeps every configured source uniquely addressable and documented', () => {
    expect(manifest.repos).toHaveLength(14);
    expect(new Set(manifest.repos.map((repo) => repo.id)).size).toBe(manifest.repos.length);
    expect(new Set(manifest.repos.map((repo) => repo.source)).size).toBe(manifest.repos.length);

    for (const repo of manifest.repos) {
      expect(repo.source).toMatch(/^https:\/\/github\.com\/[^/]+\/[^/]+$/);
      expect(repo.description.length).toBeGreaterThan(20);
      expect(repo.bestFor.length).toBeGreaterThan(20);
      expect(repo.whyIncluded.length).toBeGreaterThan(30);
      expect(repo.tags.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('ships coherent generated content for every source', () => {
    for (const repo of manifest.repos) {
      const key = `./${repo.id}/content.json`;
      const content = contentModules[key]?.default;
      expect(content, `${repo.id} has generated content`).toBeDefined();
      expect(content.sections.length, `${repo.id} has readable sections`).toBeGreaterThan(0);

      const sections = flattenSections(content.sections);
      const readable = sections.filter((section) => section.content.trim().length >= 200);
      expect(readable.length, `${repo.id} has substantial readable content`).toBeGreaterThan(0);
      expect(
        sections.some((section) => /^readme[._-][a-z]{2}/i.test(section.title)),
        `${repo.id} excludes translated navigation duplicates`
      ).toBe(false);
    }
  });

  it('turns code-first repositories into useful learning indexes', () => {
    const coding = contentModules['./coding-interview-patterns/content.json'].default;
    const ood = contentModules['./ood-interview/content.json'].default;
    expect(flattenSections(coding.sections).length).toBeGreaterThanOrEqual(20);
    expect(flattenSections(ood.sections).length).toBeGreaterThanOrEqual(20);
    expect(coding.sections.some((section) => section.id === 'source-catalog')).toBe(true);
    expect(ood.sections.some((section) => section.id === 'source-catalog')).toBe(true);
  });
});
