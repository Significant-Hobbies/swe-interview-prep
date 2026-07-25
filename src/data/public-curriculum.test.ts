import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import apiCatalog from '../../public/api-ai.json';
import catalog from '../../public/curriculum/catalog.json';
import manifest from '../../public/curriculum/manifest.json';
import conceptsData from './concepts.json';
import roadmapsData from './roadmaps.json';
import curriculumSummary from './public-curriculum-summary.json';
import { TRACKS } from './learning-os';

const root = resolve(__dirname, '../..');
const concepts = (conceptsData as { concepts: { id: string }[] }).concepts;
const roadmaps = (roadmapsData as { roadmaps: { id: string }[] }).roadmaps;

describe('public curriculum publication', () => {
  it('publishes every canonical track, roadmap, and concept', () => {
    expect(manifest.counts.tracks).toBe(TRACKS.length);
    expect(manifest.counts.roadmaps).toBe(roadmaps.length);
    expect(manifest.counts.concepts).toBe(concepts.length);
    expect(manifest.htmlPaths).toHaveLength(1 + TRACKS.length + roadmaps.length + concepts.length);

    for (const track of TRACKS) {
      const escapedTitle = track.title.replaceAll('&', '&amp;');
      expect(
        readFileSync(resolve(root, `public/curriculum/tracks/${track.id}.html`), 'utf8')
      ).toContain(`<h1>${escapedTitle}</h1>`);
    }
    for (const roadmap of roadmaps) {
      expect(
        readFileSync(resolve(root, `public/curriculum/roadmaps/${roadmap.id}.html`), 'utf8')
      ).toContain('application/ld+json');
    }
    for (const concept of concepts) {
      expect(
        readFileSync(resolve(root, `public/curriculum/concepts/${concept.id}.html`), 'utf8')
      ).toContain('application/ld+json');
    }
  });

  it('keeps catalog and homepage summary counts aligned', () => {
    expect(catalog.counts).toEqual(manifest.counts);
    expect(curriculumSummary.counts).toEqual(manifest.counts);
    expect(catalog.tracks).toHaveLength(TRACKS.length);
    expect(catalog.roadmaps).toHaveLength(roadmaps.length);
    expect(catalog.concepts).toHaveLength(concepts.length);
  });

  it('includes every generated page exactly once in the sitemap', () => {
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    for (const path of manifest.htmlPaths) {
      const url = `https://learn.significanthobbies.com${path}`;
      expect(sitemap.split(`<loc>${url}</loc>`)).toHaveLength(2);
    }
  });

  it('advertises public curriculum surfaces to agents', () => {
    expect(apiCatalog.curriculum.counts).toEqual(manifest.counts);
    expect(apiCatalog.curriculum.html).toBe('https://learn.significanthobbies.com/curriculum/');
    expect(apiCatalog.surfaces.map((surface) => surface.id)).toEqual([
      'home',
      'curriculum',
      'curriculum-json',
    ]);
  });

  it('emits complete on-page metadata and one h1 per HTML page', () => {
    for (const path of manifest.htmlPaths) {
      const file =
        path === '/curriculum/'
          ? resolve(root, 'public/curriculum/index.html')
          : resolve(root, `public${path}`);
      const html = readFileSync(file, 'utf8');
      expect(html.match(/<h1(?:\s[^>]*)?>/g)).toHaveLength(1);
      expect(html).toContain('<meta name="description"');
      expect(html).toContain('<link rel="canonical"');
      expect(html).toContain('<meta property="og:title"');
      expect(html).toContain('<script type="application/ld+json">');
      const visibleText = html
        .replaceAll(/<script[\s\S]*?<\/script>/gi, ' ')
        .replaceAll(/<style[\s\S]*?<\/style>/gi, ' ')
        .replaceAll(/<[^>]*>/g, ' ')
        .replaceAll(/&[a-z#0-9]+;/gi, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim();
      expect(visibleText.split(' ').filter(Boolean).length, path).toBeGreaterThanOrEqual(300);
    }
  });
});
