import { createHash } from 'node:crypto';
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
import { SITE_NAV_ITEMS } from './site-navigation';

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

  it('renders purpose-matched root and login shells before client-side route work', () => {
    const homepage = readFileSync(resolve(root, 'index.html'), 'utf8');
    const shell = homepage.match(/<div id="public-entry-shell"[\s\S]*?<\/div>\s*<script>/)?.[0];

    expect(shell).toBeTruthy();
    expect(shell).toContain(
      'Prepare for software-engineering interviews by building understanding you can prove'
    );
    expect(shell).toContain('personal learning OS');
    expect(shell).toContain('font-size:clamp(2.25rem,8vw,3rem)');
    expect(shell).not.toContain('margin-top:100vh');
    expect(homepage).toContain('const initialPath = window.location.pathname');
    expect(homepage).toContain("initialPath !== '/'");
    expect(homepage).toContain("initialPath === '/login'");
    expect(homepage).toContain('id="login-entry-template"');
    expect(homepage).toContain('Turn interview prep into engineering you can prove.');
  });

  it('keeps the purpose inside the single public-shell h1', () => {
    const homepage = readFileSync(resolve(root, 'index.html'), 'utf8');
    const heading = homepage.match(/<h1[\s\S]*?<\/h1>/)?.[0];

    expect(heading).toBeTruthy();
    expect(heading).toContain('software-engineering interviews');
    expect(heading).toContain('understanding you can prove');
  });

  it('advertises every public developer surface in llms.txt', () => {
    // These three are served by functions/_middleware.ts and the sitemap
    // writer, not by this generator, so nothing else fails when the generator
    // forgets them — they just quietly stop being discoverable.
    const llms = readFileSync(resolve(root, 'public/llms.txt'), 'utf8');

    expect(llms).toContain('## Developer docs');
    for (const path of ['/openapi.json', '/sitemap.xml', '/api/ai']) {
      expect(llms).toContain(path);
    }
  });

  it('pins the shell styles the async stylesheet would otherwise reflow', () => {
    // The app stylesheet loads asynchronously, so the shell paints under UA
    // defaults first. Every value Tailwind's preflight would change afterwards
    // has to be pinned in the head, or the shell reflows on arrival — that is
    // the 0.117 desktop CLS from #42. Selectors are `#lcp-shell <tag>` so they
    // outrank preflight regardless of load order.
    const homepage = readFileSync(resolve(root, 'index.html'), 'utf8');
    const head = homepage.slice(0, homepage.indexOf('</head>'));

    for (const rule of [
      '#lcp-shell *::after',
      'box-sizing: border-box',
      'font-family',
      'line-height: 1.5',
      '#lcp-shell p',
      '#lcp-shell h2',
      '#lcp-shell ul',
    ]) {
      expect(head).toContain(rule);
    }
  });

  it('includes every generated page exactly once in the sitemap', () => {
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    for (const path of manifest.htmlPaths) {
      const url = `https://learn.significanthobbies.com${path}`;
      expect(sitemap.split(`<loc>${url}</loc>`)).toHaveLength(2);
    }
    expect(sitemap).not.toContain('/api/ai');
    expect(sitemap).not.toContain('.json</loc>');
    expect(sitemap).not.toContain('.md</loc>');
    expect(sitemap).not.toContain('.txt</loc>');
    expect(sitemap).not.toContain('.html</loc>');
  });

  it('does not rewrite real static pages through the SPA shell', () => {
    const redirects = readFileSync(resolve(root, 'public/_redirects'), 'utf8');
    expect(redirects).not.toMatch(/^\/\*\s+\/index\.html\s+200$/m);
    expect(redirects).toContain('/api/ai /api-ai.json 200');
  });

  it('publishes a Markdown mirror for every public sitemap route', () => {
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    const paths = [
      ...sitemap.matchAll(/<loc>https:\/\/learn\.significanthobbies\.com([^<]*)<\/loc>/g),
    ].map((match) => match[1]);
    const markdownPath = (path: string) => {
      if (path === '/') return '/index.md';
      if (path.endsWith('/')) return `${path}index.md`;
      if (path.endsWith('.html')) return `${path.slice(0, -5)}.md`;
      return `${path}.md`;
    };

    for (const path of paths) {
      const markdown = readFileSync(resolve(root, `public${markdownPath(path)}`), 'utf8');
      expect(markdown, path).toMatch(/^(?:---[\s\S]*?---\s*)?#\s+\S/);
    }
  });

  it('advertises public curriculum surfaces to agents', () => {
    expect(apiCatalog.curriculum.counts).toEqual(manifest.counts);
    expect(apiCatalog.curriculum.html).toBe('https://learn.significanthobbies.com/curriculum/');
    expect(apiCatalog.markdown).toEqual({ suffix: '.md', negotiation: true });
    expect(apiCatalog.pricing).toBe('https://learn.significanthobbies.com/pricing.md');
    expect(apiCatalog.instructions).toBe('https://learn.significanthobbies.com/agents.md');
    expect(apiCatalog.surfaces.map((surface) => surface.id)).toEqual([
      'home',
      'changelog',
      'curriculum',
      'system-design',
    ]);
    expect(apiCatalog.surfaces.every((surface) => 'md' in surface)).toBe(true);
    expect(apiCatalog.dataResources.map((resource) => resource.id)).toEqual([
      'curriculum-json',
      'system-design-json',
    ]);
  });

  it('publishes a digest-verified learning-plan skill and truthful social card', () => {
    const skill = readFileSync(resolve(root, 'public/skill.md'), 'utf8');
    const installedSkill = readFileSync(
      resolve(root, 'public/.well-known/agent-skills/swe-interview-learning-plan/SKILL.md'),
      'utf8'
    );
    const skillIndex = JSON.parse(
      readFileSync(resolve(root, 'public/.well-known/agent-skills/index.json'), 'utf8')
    );
    const digest = createHash('sha256').update(skill).digest('hex');
    const socialCard = readFileSync(resolve(root, 'public/og-image.svg'), 'utf8');
    const homepage = readFileSync(resolve(root, 'index.html'), 'utf8');

    expect(installedSkill).toBe(skill);
    expect(skillIndex.skills[0].digest).toBe(`sha256:${digest}`);
    expect(skill).toContain('does not prove mastery');
    expect(skill).toContain('no paid tier');
    expect(socialCard).toContain('SWE INTERVIEW PREP');
    expect(socialCard).toContain('Explain it back.');
    expect(socialCard).not.toContain('DSA Prep Studio');
    expect(homepage).toContain('https://learn.significanthobbies.com/og-image.png');
  });

  it('emits complete on-page metadata and one h1 per HTML page', () => {
    for (const path of manifest.htmlPaths) {
      const file =
        path === '/curriculum/'
          ? resolve(root, 'public/curriculum/index.html')
          : resolve(root, `public${path}.html`);
      const html = readFileSync(file, 'utf8');
      expect(html.match(/<h1(?:\s[^>]*)?>/g)).toHaveLength(1);
      expect(html).toContain('<meta name="description"');
      expect(html).toContain('<link rel="canonical"');
      expect(html).toContain(
        `<link rel="canonical" href="https://learn.significanthobbies.com${path}">`
      );
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

  it('serves the sitemap changelog as a canonical static page', () => {
    const changelog = readFileSync(resolve(root, 'public/changelog.html'), 'utf8');
    expect(changelog).toContain(
      '<link rel="canonical" href="https://learn.significanthobbies.com/changelog">'
    );
    expect(changelog).toContain('<h1>What changed in SWE Interview Prep</h1>');
  });

  // Regression for issue #69: the live sitemap must list only final direct
  // routes (no .html that Cloudflare 308-redirects) and every listed URL must
  // resolve to a static HTML page whose self-canonical matches the sitemap URL
  // exactly — so crawlers never take a redirect and never see a canonical
  // mismatch (e.g. /changelog inheriting the homepage canonical).
  it('keeps every sitemap URL in parity with a matching self-canonical static page', () => {
    const origin = 'https://learn.significanthobbies.com';
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8');
    const paths = [
      ...sitemap.matchAll(/<loc>https:\/\/learn\.significanthobbies\.com([^<]*)<\/loc>/g),
    ].map((match) => match[1]);

    expect(paths.length).toBeGreaterThan(0);
    // No duplicate URLs in the sitemap.
    expect(new Set(paths).size).toBe(paths.length);

    const htmlFile = (path: string) => {
      if (path === '/') return resolve(root, 'index.html');
      if (path === '/curriculum/') return resolve(root, 'public/curriculum/index.html');
      if (path === '/system-design/') return resolve(root, 'public/system-design/index.html');
      if (path === '/changelog') return resolve(root, 'public/changelog.html');
      return resolve(root, `public${path}.html`);
    };

    // The homepage canonical is the bare origin (no trailing slash) per
    // index.html; every other route canonicalises to its exact sitemap path.
    const expectedCanonical = (path: string) => (path === '/' ? origin : `${origin}${path}`);
    // index.html uses an XHTML self-closing tag; generated pages do not. Match
    // both forms so the assertion is shape-strict, not formatter-strict.
    const canonicalPattern = (url: string) =>
      new RegExp(
        `<link rel="canonical" href="${url.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*/?>`
      );

    for (const path of paths) {
      // Sitemap must list final direct routes — never a .html Cloudflare redirects.
      expect(path, path).not.toMatch(/\.html$/);
      const html = readFileSync(htmlFile(path), 'utf8');
      expect(html, path).toMatch(canonicalPattern(expectedCanonical(path)));
    }
  });

  it('renders the canonical navigation model on every generated page', () => {
    for (const path of manifest.htmlPaths) {
      const file =
        path === '/curriculum/'
          ? resolve(root, 'public/curriculum/index.html')
          : resolve(root, `public${path}.html`);
      const html = readFileSync(file, 'utf8');
      expect(html).toContain('<nav class="desktop-nav" aria-label="Primary">');
      expect(html).toContain('<nav aria-label="Compact">');
      const header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
      expect(header, `${path}: site header`).toBeTruthy();
      for (const item of SITE_NAV_ITEMS) {
        const link = `href="${item.to}">${item.label}</a>`;
        const expectedOccurrences = 'blurb' in item && !('menu' in item && item.menu) ? 1 : 3;
        expect(header?.split(link), `${path}: ${item.label}`).toHaveLength(expectedOccurrences);
      }
    }
  });
});
