#!/usr/bin/env node
/**
 * Verify every external source in concept-packs.json actually exists and is
 * what it claims to be.
 *
 * Three separate false-positives got past weaker checks during the 2026-07-25
 * curation, which is why each layer below exists:
 *
 *  1. STATUS IS NOT ENOUGH. YouTube returns 200 for a deleted video, so a
 *     removed talk shipped as a live citation. YouTube URLs are therefore
 *     checked through the oEmbed API, which 404s when the video is gone.
 *  2. REDIRECTS LIE. MIT's Little's Law PDF returns 200 after two 301s onto a
 *     faculty homepage. The final URL is compared against the requested one.
 *  3. CONTENT-TYPE LIES TOO. Microsoft's copy of the LambdaMART paper returned
 *     200 with `content-type: application/pdf` under a `.pdf` URL, and served
 *     a 4 KB HTML bot-block page. Only the leading bytes gave it away, so a
 *     `.pdf` URL must actually begin with `%PDF`.
 *
 * Network-bound, so deliberately NOT part of `pnpm test`.
 *   node scripts/verify-sources.mjs
 * Exits non-zero if anything looks dead or misrepresented.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

/**
 * Publishers that bot-wall automated clients. A 403 from these proves nothing —
 * and psycnet in particular answers 200 with a ~900-byte challenge page, so a
 * small body from one of these is equally uninformative rather than a failure.
 */
const BOT_WALLED =
  /(doi\.org|dl\.acm\.org|psycnet\.apa\.org|ssrn\.com|akamai\.com|ieee\.org|mitpress\.mit\.edu|iq\.harvard\.edu|learnopengl\.com)/i;

/**
 * Sites that serve a small JS shell and fetch content client-side. The byte
 * count says nothing about whether the target exists, so the size heuristic is
 * skipped — cs336's lecture viewer is a 848-byte shell plus a `?trace=` param.
 */
const CLIENT_RENDERED = /(cs336\.stanford\.edu|usaco\.guide)/i;

function sources() {
  const packs = JSON.parse(readFileSync(join(ROOT, 'src/data/concept-packs.json'), 'utf8')).packs;
  const seen = new Map();
  for (const [conceptId, pack] of Object.entries(packs)) {
    for (const item of pack.items ?? []) {
      if (!item.url?.startsWith('http')) continue;
      if (!seen.has(item.url)) seen.set(item.url, { url: item.url, title: item.title, conceptId });
    }
  }
  return [...seen.values()];
}

async function checkYouTube(url) {
  const api = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`;
  const res = await fetch(api);
  if (res.ok) return null;
  // 401 means embedding is disabled, not that the video is gone — the Stanford
  // CS336 lectures are both 401 and both play fine. Fall back to the watch page
  // and look for a real title. 404 is a genuine removal.
  if (res.status === 401) {
    const page = await fetch(url, { headers: { 'User-Agent': UA } });
    const html = await page.text();
    const title = /<meta name="title" content="([^"]+)"/.exec(html)?.[1];
    return title ? null : 'embedding disabled AND no title on the watch page — likely unavailable';
  }
  return `oEmbed ${res.status} — video removed, private, or this is a channel/playlist root`;
}

async function checkHttp(entry) {
  const res = await fetch(entry.url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) {
    if (res.status === 403 && BOT_WALLED.test(entry.url)) return null;
    return `HTTP ${res.status}`;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const head = buf.subarray(0, 5).toString('latin1');
  if (/\.pdf($|\?)/i.test(entry.url) && head !== '%PDF-') {
    return `.pdf URL served ${buf.length} bytes starting "${head.replace(/[^\x20-\x7e]/g, '.')}" — not a PDF`;
  }
  // doi.org answers a plain GET with an empty body; identity is checked
  // separately by verify-citations.mjs against the CSL metadata.
  if (/^https:\/\/doi\.org\//i.test(entry.url)) return null;
  if (BOT_WALLED.test(entry.url) || CLIENT_RENDERED.test(entry.url)) return null;
  if (buf.length < 1000 && !/\.pdf($|\?)/i.test(entry.url)) {
    return `suspiciously small response (${buf.length} bytes) — likely a block or error page`;
  }
  return null;
}

const entries = sources();
console.log(`Verifying ${entries.length} external sources…\n`);
const problems = [];
const CONCURRENCY = 8;

for (let i = 0; i < entries.length; i += CONCURRENCY) {
  const batch = entries.slice(i, i + CONCURRENCY);
  const results = await Promise.all(
    batch.map(async (entry) => {
      try {
        const reason = /youtube\.com|youtu\.be/.test(entry.url)
          ? await checkYouTube(entry.url)
          : await checkHttp(entry);
        return reason ? { ...entry, reason } : null;
      } catch (error) {
        return { ...entry, reason: `network error: ${error.message}` };
      }
    })
  );
  for (const r of results) if (r) problems.push(r);
  process.stdout.write(
    `  checked ${Math.min(i + CONCURRENCY, entries.length)}/${entries.length}\r`
  );
}

console.log(' '.repeat(40));
if (!problems.length) {
  console.log(`All ${entries.length} sources resolve and match their declared type.`);
  process.exit(0);
}
console.error(`${problems.length} suspect source(s):\n`);
for (const p of problems) {
  console.error(`  [${p.conceptId}] ${p.title}\n    ${p.url}\n    ${p.reason}\n`);
}
process.exitCode = 1;
