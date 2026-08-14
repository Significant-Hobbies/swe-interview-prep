import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import apiCatalog from '../../public/api-ai.json';
import publicCases from '../../public/system-design/catalog.json';
import manifest from '../../public/system-design/manifest.json';
import { SYSTEM_DESIGN_CASES } from './system-design-cases';

const root = resolve(__dirname, '../..');
const origin = 'https://learn.significanthobbies.com';

describe('system-design public publication', () => {
  it('publishes the hub and only owner-approved guides', () => {
    const approved = SYSTEM_DESIGN_CASES.filter(
      (caseDefinition) => caseDefinition.publication.state === 'approved'
    );
    expect(manifest.approvedCaseIds).toEqual(approved.map((caseDefinition) => caseDefinition.id));
    expect(manifest.htmlPaths).toEqual([
      '/system-design/',
      ...approved.map(
        (caseDefinition) => `/system-design/${caseDefinition.publication.guide?.slug}`
      ),
    ]);
    expect(publicCases.counts).toEqual({ cases: 33, approvedGuides: 7 });

    const generatedHtml = readdirSync(resolve(root, 'public/system-design')).filter((file) =>
      file.endsWith('.html')
    );
    expect(generatedHtml.sort()).toEqual(
      [
        'index.html',
        ...approved.map((caseDefinition) => `${caseDefinition.publication.guide?.slug}.html`),
      ].sort()
    );
    for (const caseDefinition of SYSTEM_DESIGN_CASES.filter(
      (candidate) => candidate.publication.state === 'practice-only'
    )) {
      expect(existsSync(resolve(root, `public/system-design/${caseDefinition.id}.html`))).toBe(
        false
      );
    }
  });

  it('lists every practice case on the hub and in the agent catalog', () => {
    const html = readFileSync(resolve(root, 'public/system-design/index.html'), 'utf8');
    for (const caseDefinition of SYSTEM_DESIGN_CASES) {
      expect(html).toContain(caseDefinition.title);
      expect(html).toContain(`/mock?prompt=${caseDefinition.id}&amp;from=guide`);
    }
    expect(apiCatalog.surfaces.find((surface) => surface.id === 'system-design')).toMatchObject({
      url: `${origin}/system-design/`,
      md: `${origin}/system-design/index.md`,
    });
    expect(
      apiCatalog.dataResources.find((resource) => resource.id === 'system-design-json')
    ).toBeDefined();
  });

  it('emits substantive unique canonical articles with both required schemas', () => {
    const approved = SYSTEM_DESIGN_CASES.filter(
      (caseDefinition) => caseDefinition.publication.state === 'approved'
    );
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const caseDefinition of approved) {
      const guide = caseDefinition.publication.guide;
      expect(guide).toBeDefined();
      const html = readFileSync(resolve(root, `public/system-design/${guide?.slug}.html`), 'utf8');
      expect(html).toContain(`<h1>${caseDefinition.title}</h1>`);
      expect(html).toContain(
        `<link rel="canonical" href="${origin}/system-design/${guide?.slug}">`
      );
      expect(html).toContain('"@type":"Article"');
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain(`/mock?prompt=${caseDefinition.id}&amp;from=guide`);
      for (const conceptId of caseDefinition.conceptIds) {
        expect(html).toContain(`/curriculum/concepts/${conceptId}`);
      }

      const visibleText = html
        .replaceAll(/<script[\s\S]*?<\/script>/gi, ' ')
        .replaceAll(/<style[\s\S]*?<\/style>/gi, ' ')
        .replaceAll(/<[^>]*>/g, ' ')
        .replaceAll(/&[a-z#0-9]+;/gi, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim();
      expect(
        visibleText.split(' ').filter(Boolean).length,
        caseDefinition.id
      ).toBeGreaterThanOrEqual(1400);
      titles.add(guide?.title ?? '');
      descriptions.add(guide?.description ?? '');
    }
    expect(titles.size).toBe(approved.length);
    expect(descriptions.size).toBe(approved.length);
  });

  it('includes every canonical source, Markdown mirror, and sitemap URL exactly once', () => {
    for (const caseDefinition of SYSTEM_DESIGN_CASES.filter(
      (candidate) => candidate.publication.state === 'approved'
    )) {
      const guide = caseDefinition.publication.guide;
      const html = readFileSync(resolve(root, `public/system-design/${guide?.slug}.html`), 'utf8');
      for (const source of caseDefinition.sources) expect(html).toContain(source.url);

      const markdown = readFileSync(
        resolve(root, `public/system-design/${guide?.slug}.md`),
        'utf8'
      );
      expect(markdown).toContain(`# ${caseDefinition.title}`);
      expect(markdown).toContain('## Answer outline');
      expect(markdown).toContain('## Primary sources');
    }
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    for (const route of manifest.htmlPaths) {
      expect(sitemap.split(`<loc>${origin}${route}</loc>`)).toHaveLength(2);
    }
  });
});
