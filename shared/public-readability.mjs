export { wantsMarkdown, markdownResponse } from './agent-surfaces/http.mjs';
import {
  createStaticAssetHandler,
  advertiseMarkdown,
} from './agent-surfaces/adapters/static-assets.mjs';

export const identity = {
  name: 'SWE Interview Prep',
  url: 'https://learn.significanthobbies.com',
  summary:
    'A personal learning OS that turns software-engineering interview study into retained, artifact-backed understanding.',
  openapi: 'https://learn.significanthobbies.com/openapi.json',
  sitemap: 'https://learn.significanthobbies.com/sitemap.xml',
  trainingAllowed: true,
  updatedAt: '2026-10-26',
  excludedPaths: [
    '/api',
    '/admin',
    '/auth',
    '/dashboard',
    '/login',
    '/onboarding',
    '/progress',
    '/notes',
    '/session',
    '/share',
    '/wars',
    '/play',
    '/mock',
    '/practice',
    '/playground',
    '/study',
    '/sources',
    '/library',
    '/learn',
    '/concepts',
    '/roadmaps',
    '/projects',
    '/build',
    '/labs',
    '/drills',
    '/review',
    '/reviews',
    '/today',
    '/vibe-learning',
    '/explore',
    '/sweep',
  ],
};
function privatePath(path) {
  return identity.excludedPaths.some(
    (prefix) => path === prefix || path.startsWith(prefix + '/') || path === prefix + '.md'
  );
}
export const handlePublicReadability = createStaticAssetHandler({
  identity,
  prebuiltFullPath: '/llms-full.txt',
  preserveMarkdownPaths: ['/pricing.md', '/agents.md', '/skill.md', '/curriculum/catalog.md'],
});
export function robots() {
  const bots = [
    '*',
    'GPTBot',
    'ClaudeBot',
    'Google-Extended',
    'Applebot-Extended',
    'CCBot',
    'Bytespider',
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
  ];
  return (
    bots
      .map(
        (bot) =>
          `User-agent: ${bot}\nAllow: /\n${identity.excludedPaths.map((path) => `Disallow: ${path}$\nDisallow: ${path}/`).join('\n')}\nAllow: /api/ai$\nAllow: /api/md$\nAllow: /api/md/`
      )
      .join('\n\n') + `\n\nSitemap: ${identity.sitemap}\n# Keep in sync with ai.txt and llms.txt.\n`
  );
}

const catalogs = new WeakMap();
export async function advertisePublic(request, response, assets) {
  if (!assets || !response.ok || !response.headers.get('content-type')?.includes('text/html'))
    return response;
  const pathname = new URL(request.url).pathname;
  if (privatePath(pathname) || pathname.startsWith('/api/')) return response;
  let pending = catalogs.get(assets);
  if (!pending) {
    pending = assets
      .fetch(new Request(`${identity.url}/api/md/_catalog`))
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalog unavailable');
        const rows = await response.json();
        if (!Array.isArray(rows)) throw new Error('Invalid catalog');
        return rows;
      });
    catalogs.set(assets, pending);
  }
  try {
    const rows = await pending;
    const row = rows.find(
      (entry) => entry.path === pathname || entry.path.replace(/\/$/, '') === pathname
    );
    if (!row) return response;
    const advertised = advertiseMarkdown(response, identity.url, row.assetPath);
    if (typeof globalThis.HTMLRewriter === 'undefined') return advertised;
    const escape = (value) =>
      String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
    return new globalThis.HTMLRewriter()
      .on(
        'meta[name="ai-summary"], link[rel="alternate"][type="text/markdown"], link[rel="canonical"]',
        {
          element(element) {
            element.remove();
          },
        }
      )
      .on('head', {
        element(element) {
          element.append(
            `<link rel="canonical" href="${escape(identity.url + row.path)}"><meta name="ai-summary" content="${escape(row.description)}"><link rel="alternate" type="text/markdown" href="${escape(identity.url + row.assetPath)}">`,
            { html: true }
          );
        },
      })
      .transform(advertised);
  } catch {
    catalogs.delete(assets);
    return response;
  }
}
