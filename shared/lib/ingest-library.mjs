/**
 * Library section → review-question stubs. Pure functions — no I/O.
 * Used by scripts/ingest-library-rqs.mjs at build/content refresh time.
 */

const SKIP_TITLE_RE = /^(overview|table of contents|readme|index|introduction)$/i;
const MIN_ANSWER_CHARS = 80;
const MAX_ANSWER_CHARS = 480;

export function stripHtml(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function flattenSections(sections, out = []) {
  for (const s of sections || []) {
    out.push(s);
    if (s.children?.length) flattenSections(s.children, out);
  }
  return out;
}

export function extractAnswerSnippet(text) {
  const clean = stripHtml(text);
  if (clean.length < MIN_ANSWER_CHARS) return '';
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  let answer = '';
  for (const s of sentences) {
    const next = (answer + s).trim();
    if (next.length > MAX_ANSWER_CHARS) break;
    answer = next;
    if (answer.length >= MIN_ANSWER_CHARS) break;
  }
  if (answer.length < MIN_ANSWER_CHARS) {
    answer = clean.slice(0, MAX_ANSWER_CHARS).trim();
  }
  return answer.length >= MIN_ANSWER_CHARS ? answer : '';
}

export function ingestedReviewId(repoId, sectionId) {
  const safe = `${repoId}-${sectionId}`.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 120);
  return `rq-lib-${safe}`;
}

/**
 * @param {object} opts
 * @param {Record<string, Array<{repoId:string,repoName:string,sectionId:string,title:string}>>} opts.conceptIndex
 * @param {Record<string, {sections: object[]}>} opts.repoContent — repoId → parsed content.json
 * @param {Set<string>} [opts.existingIds] — editorial + prior ingested ids
 * @param {number} [opts.maxPerConcept]
 */
export function buildIngestedReviewQuestions(opts) {
  const {
    conceptIndex,
    repoContent,
    existingIds = new Set(),
    maxPerConcept = 3,
  } = opts;

  const byId = new Map();
  const sectionCache = new Map();

  function sectionFor(repoId, sectionId) {
    const key = `${repoId}/${sectionId}`;
    if (sectionCache.has(key)) return sectionCache.get(key);
    const content = repoContent[repoId];
    if (!content) {
      sectionCache.set(key, null);
      return null;
    }
    const flat = flattenSections(content.sections || []);
    const hit = flat.find(s => s.id === sectionId) || null;
    sectionCache.set(key, hit);
    return hit;
  }

  for (const [conceptId, sections] of Object.entries(conceptIndex || {})) {
    let added = 0;
    for (const ref of sections || []) {
      if (added >= maxPerConcept) break;
      const { repoId, repoName, sectionId, title } = ref;
      const id = ingestedReviewId(repoId, sectionId);
      if (existingIds.has(id) || byId.has(id)) continue;

      const section = sectionFor(repoId, sectionId);
      if (!section) continue;

      const sectionTitle = (title || section.title || '').trim();
      if (!sectionTitle || SKIP_TITLE_RE.test(sectionTitle)) continue;

      const answer = extractAnswerSnippet(section.content || '');
      if (!answer) continue;

      byId.set(id, {
        id,
        conceptId,
        type: 'explain',
        difficulty: /overview|intro|what is/i.test(sectionTitle) ? 'intro' : 'core',
        question: `${repoName}: ${sectionTitle} — explain the core idea in your own words.`,
        answer,
        source: 'library',
        libraryRef: { repoId, sectionId, title: sectionTitle },
      });
      added += 1;
    }
  }

  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}