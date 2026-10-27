import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { onRequest } from '../functions/_middleware';
import { identity, robots } from './public-readability.mjs';
const root = fileURLToPath(new URL('../public/', import.meta.url));
const catalog = JSON.parse(readFileSync(join(root, 'api/md/_catalog'), 'utf8'));
const ASSETS = {
  async fetch(request) {
    const path = new URL(request.url).pathname;
    const file = join(root, path);
    if (!existsSync(file) || path.endsWith('/'))
      return new Response('<html><head></head><body>Public shell</body></html>', {
        headers: { 'content-type': 'text/html' },
      });
    return new Response(readFileSync(file), {
      headers: {
        'content-type': path.endsWith('.md')
          ? 'text/markdown'
          : path.startsWith('/api/md/')
            ? 'application/json'
            : 'text/plain',
      },
    });
  },
};
const request = (path, init = {}) =>
  onRequest({
    request: new Request(identity.url + path, init),
    env: { ASSETS },
    next: async () =>
      new Response('<html><head></head><body>Public shell</body></html>', {
        headers: { 'content-type': 'text/html' },
      }),
  });
describe('source-backed public readability', () => {
  it('fails when a public HTML or SPA content route lacks a renderer or explicit stateful-app exclusion', () => {
    const registered = new Set(catalog.map((row) => row.path));
    function visit(directory, prefix = '') {
      for (const file of readdirSync(directory, { withFileTypes: true })) {
        const relative = prefix + file.name;
        if (file.isDirectory()) visit(join(directory, file.name), relative + '/');
        else if (file.name.endsWith('.html')) {
          const route = '/' + (file.name === 'index.html' ? prefix : relative.slice(0, -5));
          expect(registered.has(route), route).toBe(true);
        }
      }
    }
    visit(root);
    const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
    const stateful = new Set(identity.excludedPaths.map((path) => path.slice(1)));
    // These aliases redirect to private/local learner workspaces.
    stateful.add('today');
    stateful.add('vibe-learning');
    for (const [, path] of app.matchAll(/<Route path="([^"]+)"/g)) {
      if (path === '*' || path === '/' || path === 'learning/:slug') continue;
      expect(
        registered.has('/' + path) || stateful.has(path.replace(/^\//, '').split('/')[0]),
        path
      ).toBe(true);
    }
  });
  it('covers all generated HTML and all authored learning docs without learner state', async () => {
    expect(new Set(catalog.map((row) => row.path)).size).toBe(catalog.length);
    for (const row of catalog) {
      const response = await request(row.md.slice(identity.url.length));
      expect(response.status, row.path).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/markdown');
      expect(response.headers.get('content-location')).toBe(identity.url + row.path);
      expect(response.headers.get('x-robots-tag')).toBe('noindex, follow');
      const body = await response.text();
      expect(body).toContain(`Canonical: ${identity.url}${row.path}`);
      expect(body).not.toMatch(/\{\{(?:counts|text|links)\./);
      expect(body).not.toMatch(/^\s*<!doctype/i);
    }
    for (const path of [
      '/about',
      '/privacy',
      '/learning',
      '/curriculum/',
      '/system-design/',
      '/articles/',
    ])
      expect(catalog.some((row) => row.path === path)).toBe(true);
  });
  it('retains shared homepage, About and Privacy copy and real links', () => {
    const normalize = (text) => text.replace(/\s+/g, ' ').trim();
    for (const page of ['about', 'privacy']) {
      const copy = JSON.parse(
        readFileSync(new URL(`../src/data/public-copy/${page}.json`, import.meta.url), 'utf8')
      );
      const body = normalize(readFileSync(join(root, `${page}.md`), 'utf8'));
      for (const text of copy.text) expect(body, `${page}: ${text}`).toContain(normalize(text));
      for (const href of copy.links) expect(body).toContain(new URL(href, identity.url).href);
    }
    const copy = JSON.parse(
      readFileSync(new URL('../src/data/public-copy/home.json', import.meta.url), 'utf8')
    );
    const body = normalize(readFileSync(join(root, 'index.md'), 'utf8'));
    for (const [group, values] of Object.entries(copy.blocks)) {
      if (group === 'Features') continue; // Decorative sequence numbering.
      for (const [index, text] of values.entries()) {
        if ((group === 'LoopVisual' && index === 0) || (group === 'Answers' && index === 1))
          continue; // SVG accessible description and disclosure glyph.
        expect(body, `${group}[${index}]`).toContain(normalize(text));
      }
    }
    for (const row of copy.answers) {
      expect(body).toContain(row.q);
      expect(body).toContain(row.a);
    }
  });
  it('keeps browser and wildcard requests HTML and honors quality values', async () => {
    for (const accept of [
      '',
      '*/*',
      'text/markdown;q=0',
      'text/markdown;q=0.2,text/html;q=0.8',
      'text/html,text/markdown',
    ]) {
      const response = await request('/', { headers: { accept } });
      expect(response.headers.get('content-type')).toContain('text/html');
    }
    for (const path of [
      '/',
      '/privacy',
      catalog.find((row) => row.path.startsWith('/curriculum/concepts/')).path,
    ]) {
      const response = await request(path, {
        headers: { accept: 'text/html;q=0.2,text/markdown;q=0.8' },
      });
      expect(response.headers.get('content-type')).toContain('text/markdown');
      expect(response.headers.get('content-location')).toBe(identity.url + path);
      const head = await request('/api/md' + (path === '/' ? '/' : path), { method: 'HEAD' });
      expect(head.status).toBe(200);
      expect(await head.text()).toBe('');
      expect(
        (await request(path + (path === '/' ? 'index.md' : '.md'), { method: 'OPTIONS' })).status
      ).toBe(204);
    }
  });
  it('rejects unregistered, account, learner-state, and draft mirrors', async () => {
    for (const path of [
      '/dashboard',
      '/progress',
      '/session/private',
      '/wars/results/private',
      '/admin/private',
      '/auth/private',
      '/dashboard/private',
      '/not-a-route',
      '/CLAUDE.local',
    ]) {
      for (const mirror of [path + '.md', '/api/md' + path]) {
        const response = await request(mirror);
        expect(response.status, mirror).toBe(404);
        expect(response.headers.get('content-type')).toContain('text/markdown');
        expect(response.headers.get('x-robots-tag')).toBe('noindex, follow');
        expect(Number(response.headers.get('x-markdown-tokens'))).toBeGreaterThan(0);
      }
    }
    expect(
      (await request('/api/auth/verify', { headers: { accept: 'text/markdown' } })).headers.get(
        'content-type'
      )
    ).toBe('text/html');
  });
  it('exports bounded content and public crawler policies', async () => {
    const full = await (await request('/llms-full.txt')).text();
    expect(full.length).toBeLessThanOrEqual(500000);
    expect(full).toContain('Full catalog:');
    expect(full).toContain('Generated:');
    for (const bot of [
      'GPTBot',
      'ClaudeBot',
      'Google-Extended',
      'Applebot-Extended',
      'CCBot',
      'Bytespider',
      'OAI-SearchBot',
      'Claude-User',
    ])
      expect(robots()).toContain(`User-agent: ${bot}\nAllow: /`);
    expect(robots()).toContain('Disallow: /learn$');
    expect(robots()).not.toContain('Disallow: /learn\n');
  });
});

it('unknown Markdown paths cannot advertise off-origin canonicals', async () => {
  const assert = (await import('node:assert/strict')).default;
  const { createAgentSurfaceManifest } = await import('./agent-surfaces/manifest.mjs');
  const { createAgentSurfaceHandler } = await import('./agent-surfaces/handler.mjs');
  const fixtureOrigin = 'https://public.example';
  const manifest = createAgentSurfaceManifest({
    name: 'Public fixture',
    url: fixtureOrigin,
    summary: 'Public fixture',
    pages: { '/': '# Public' },
  });
  const handler = createAgentSurfaceHandler({ manifest });
  for (const path of ['/api/md//evil.example/x', '//evil.example/x.md']) {
    const response = await handler(new Request(fixtureOrigin + path));
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('content-location'), fixtureOrigin + '//evil.example/x');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, follow');
    assert.ok(response.headers.get('link').includes(fixtureOrigin + '/llms.txt'));
  }
});
