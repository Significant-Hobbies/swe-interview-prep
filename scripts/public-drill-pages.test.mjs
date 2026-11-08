import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const { drills } = JSON.parse(read('src/data/drills.json'));
const { concepts } = JSON.parse(read('src/data/concepts.json'));
const origin = 'https://learn.significanthobbies.com';
const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

test('authored practice prompts have discoverable public HTML and text without solutions', () => {
  const index = read('public/curriculum/drills/index.html');
  const sitemap = read('public/sitemap.xml');
  const catalog = JSON.parse(read('public/curriculum/catalog.json'));
  const manifest = JSON.parse(read('public/curriculum/manifest.json'));
  assert.equal(catalog.drills.length, drills.length);
  assert.ok(read('public/curriculum/index.html').includes('href="/curriculum/drills/"'));

  for (const drill of drills) {
    const path = `/curriculum/drills/${drill.id}`;
    const concept = concepts.find((item) => item.id === drill.conceptId);
    assert.ok(concept, `Known concept for ${drill.id}`);
    const html = read(`public${path}.html`);
    const markdown = read(`public${path}.md`);
    const record = catalog.drills.find((item) => item.id === drill.id);
    assert.ok(index.includes(`href="${path}"`), `Catalog links to ${drill.id}`);
    assert.ok(html.includes(`<h1>${escapeHtml(drill.title)}</h1>`));
    assert.ok(html.includes(escapeHtml(drill.prompt)), `Visible authored prompt for ${drill.id}`);
    assert.ok(html.includes(escapeHtml(drill.expectedOutput)), `Success evidence for ${drill.id}`);
    assert.ok(html.includes(`href="/curriculum/concepts/${concept.id}"`));
    assert.ok(html.includes(`href="/drills/${drill.id}"`));
    assert.ok(html.includes(`<link rel="canonical" href="${origin}${path}">`));
    assert.ok(html.includes('application/ld+json'));
    assert.ok(markdown.includes(drill.prompt));
    assert.ok(!html.includes('noindex'));
    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0];
    assert.ok(main?.includes(escapeHtml(drill.prompt)));
    assert.doesNotMatch(main, /<[^>]+\shidden(?:\s|=|>)/);
    assert.ok(!main.includes('style="display:none'));
    assert.equal(sitemap.split(`<loc>${origin}${path}</loc>`).length, 2);
    assert.ok(manifest.htmlPaths.includes(path));
    assert.equal(record.url, `${origin}${path}`);
    assert.equal(record.practiceUrl, `${origin}/drills/${drill.id}`);
    for (const field of ['referenceSolution', 'solutionNotes', 'testCases']) {
      assert.ok(!(field in record), `No ${field} in public drill projection`);
    }
  }
});

test('public practice pages keep reference implementations out of HTML and Markdown', () => {
  const drill = drills.find((item) => item.id === 'build-tokenizer');
  assert.ok(drill.referenceSolution.length > 80);
  for (const extension of ['html', 'md']) {
    const text = read(`public/curriculum/drills/${drill.id}.${extension}`);
    assert.ok(!text.includes(drill.referenceSolution));
    assert.ok(!text.includes(escapeHtml(drill.referenceSolution)));
  }
});
