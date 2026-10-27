import { homeMarkdown } from './home-markdown.mjs';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { identity, robots } from '../shared/public-readability.mjs';
import { absoluteMarkdownLinks } from '../shared/agent-surfaces/format.mjs';
import { createAgentSurfaceManifest } from '../shared/agent-surfaces/manifest.mjs';
import { createAgentSurfaceHandler } from '../shared/agent-surfaces/handler.mjs';

export async function writeReadability({ repoRoot, publicDir, pages }) {
  const home = {
    path: '/',
    title: identity.name,
    description: identity.summary,
    assetPath: '/index.md',
  };
  const routes = [home, ...pages];
  const bodies = new Map();
  const homeCopy = JSON.parse(
    await readFile(join(repoRoot, 'src/data/public-copy/home.json'), 'utf8')
  );
  const curriculum = JSON.parse(
    await readFile(join(repoRoot, 'src/data/public-curriculum-summary.json'), 'utf8')
  );
  home.title = homeCopy.blocks.Hero.slice(1, 5).join('');
  bodies.set('/', homeMarkdown(homeCopy, curriculum));
  for (const file of ['about', 'privacy']) {
    const copy = JSON.parse(
      await readFile(join(repoRoot, 'src/data/public-copy', file + '.json'), 'utf8')
    );
    const body = copy.markdown.replace(
      /\{\{(text|links)\.(\d+)\}\}/g,
      (_, kind, index) => copy[kind][Number(index)]
    );
    const description =
      file === 'privacy'
        ? 'How SWE Interview Prep handles identity, learning state, AI providers, analytics, and deletion.'
        : 'The learning model, tools, research basis, and design principles behind SWE Interview Prep.';
    routes.splice(1, 0, {
      path: copy.path,
      title: copy.title,
      description,
      assetPath: copy.path + '.md',
    });
    bodies.set(copy.path, body);
  }
  for (const name of await readdir(join(repoRoot, 'docs/learning'))) {
    if (!name.endsWith('.md')) continue;
    const slug = name.slice(0, -3);
    const path = slug === 'index' ? '/learning' : `/learning/${slug}`;
    const body = (await readFile(join(repoRoot, 'docs/learning', name), 'utf8')).trimEnd() + '\n';
    const title = body.match(/^# (.+)$/m)?.[1] || slug;
    const row = { path, title, description: title, assetPath: `${path}.md` };
    routes.push(row);
    bodies.set(
      path,
      absoluteMarkdownLinks(body, `${identity.url}/learning/${slug}`, {
        resolveLink: (href) =>
          href.startsWith('./') && /\.md(?:#|$)/.test(href)
            ? identity.url +
              '/learning' +
              href
                .slice(1)
                .replace(/\/index\.md/, '')
                .replace(/\.md(?=#|$)/, '')
            : undefined,
      })
    );
  }
  // Prioritize product/legal facts and authored docs before the large curriculum.
  const rank = (row) =>
    ['/', '/about', '/privacy'].includes(row.path)
      ? 0
      : row.path.startsWith('/learning')
        ? 1
        : row.path.endsWith('/')
          ? 2
          : 3;
  routes.sort((left, right) => rank(left) - rank(right));
  for (const row of routes) {
    let body = bodies.get(row.path) ?? (await readFile(join(publicDir, row.assetPath), 'utf8'));
    const updated = body.match(/^updated:\s*["']?(\d{4}-\d{2}-\d{2})/m)?.[1];
    if (updated) row.lastModified = updated;
    body = absoluteMarkdownLinks(body, identity.url + row.path);
    body = `# ${row.title}\n\n> ${row.description}\n\nCanonical: ${identity.url}${row.path}\n${row.lastModified ? `Last updated: ${row.lastModified}\n` : ''}\n${body.replace(/^---\n[\s\S]*?\n---\n*/, '').replace(/^# ([^\n]+)\n*/, (heading, title) => (title === row.title ? '' : heading))}`;
    bodies.set(row.path, body);
    row.url = identity.url + row.path;
    row.md = identity.url + (row.path === '/' ? '/index.md' : row.path.replace(/\/$/, '') + '.md');
    row.aliases = [row.assetPath];
    await mkdir(join(publicDir, row.assetPath, '..'), { recursive: true });
    await writeFile(join(publicDir, row.assetPath), body);
  }
  const manifest = createAgentSurfaceManifest({ ...identity, pages: {} });
  const handle = createAgentSurfaceHandler({
    manifest,
    listMarkdownRoutes: () => routes,
    loadMarkdown: (path) => bodies.get(path),
  });
  await mkdir(join(publicDir, 'api/md'), { recursive: true });
  await writeFile(join(publicDir, 'api/md/_catalog'), JSON.stringify(routes));
  await writeFile(join(publicDir, 'api/md/_identity'), JSON.stringify(identity));
  for (const file of ['llms.txt', 'llms-full.txt', 'ai.txt']) {
    const response = await handle(new Request(`${identity.url}/${file}`));
    if (!response.ok) throw new Error(`Cannot generate ${file}`);
    await writeFile(join(publicDir, file), await response.text());
  }
  await writeFile(join(publicDir, 'robots.txt'), robots());
  await writeFile(
    join(publicDir, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((row) => `<url><loc>${row.url}</loc></url>`).join('')}</urlset>\n`
  );
  console.log(`Registered ${routes.length} public Markdown routes; learner state is excluded.`);
}
