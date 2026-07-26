#!/usr/bin/env node
/**
 * Derive the source-hub index from concept-packs.json.
 *
 * A "hub" is one coherent body of work — a course, a book, a single author's
 * site — that covers several concepts at once. Hubs are what make an outward
 * recommendation possible: "you have 15 unknown database concepts, CMU 15-445
 * covers 10 of them" is actionable in a way that fifteen separate lecture PDFs
 * are not.
 *
 * Grouping is by host, with two corrections found by inspecting the real data:
 *
 *  1. PUBLISHERS ARE NOT SOURCES. arxiv.org covers 95 concepts and doi.org 20,
 *     but "go read arxiv" is noise — the host says nothing about the content.
 *     Same for research.google (individual papers) and youtube.com (one video
 *     per concept, so no aggregation exists to find).
 *  2. SOME HOSTS CARRY MANY INDEPENDENT WORKS. ocw.mit.edu spans dozens of
 *     unrelated courses; the hub is `/courses/<course>/`, not the host. Those
 *     hosts are grouped by a path prefix instead.
 *
 * Both lists are hand-curated on purpose — same posture as scripts/source-tier.mjs.
 * Nothing here is inferred or generated; the index is a set intersection over
 * URLs that verify-sources.mjs has already checked.
 *
 *   node scripts/build-source-hubs.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Aggregators. The host tells you nothing about what you'd be reading. */
const PUBLISHERS = [
  /^arxiv\.org$/i,
  /^doi\.org$/i,
  /^dl\.acm\.org$/i,
  /^(www\.)?usenix\.org$/i,
  /^ieeexplore\.ieee\.org$/i,
  /^research\.google$/i,
  /^(www\.)?youtube\.com$/i,
  /^youtu\.be$/i,
  /^(www\.)?semanticscholar\.org$/i,
  /^papers\.nips\.cc$/i,
  /^proceedings\.mlr\.press$/i,
  /^(www\.)?jstor\.org$/i,
  /^psycnet\.apa\.org$/i,
  /^(www\.)?ssrn\.com$/i,
  /^(www\.)?nature\.com$/i,
  /^(www\.)?sciencedirect\.com$/i,
  /^(www\.)?springer\.com$/i,
  /^link\.springer\.com$/i,
  /^(www\.)?wikipedia\.org$/i,
  /^en\.wikipedia\.org$/i,
  /^(www\.)?medium\.com$/i,
  /^(www\.)?microsoft\.com$/i, // /en-us/research/publication/... — a paper index
  // 8 unrelated articles by 8 authors spanning 1999-2017. Fails this list's own
  // test — the host says nothing about the content — and it was winning the
  // whole `behavioral` domain with "go read Harvard Business Review".
  /^(www\.)?hbr\.org$/i,
  /^papers\.ssrn\.com$/i,
  /^(www\.)?vldb\.org$/i,
  // Standards bodies. Real references, but nobody levels up by "reading W3C".
  /^(www\.)?w3\.org$/i,
  /^(www\.)?rfc-editor\.org$/i,
];

/** Hosts carrying many unrelated works — group by this many path segments. */
const PATH_SCOPED = {
  'ocw.mit.edu': 2, // /courses/<course-slug>/
  'github.com': 2, // /<org>/<repo>
  'gitlab.com': 2,
  'people.csail.mit.edu': 2,
  'cs.cmu.edu': 2,
  // Three unrelated books live here: ~jurafsky/slp3, class/cs224n, ~boyd/cvxbook.
  'web.stanford.edu': 2,
};

/**
 * Display names for hubs, because the catalog titles the same source several
 * ways — Manning's IR book appears as "Introduction to Information Retrieval
 * (Manning et al.)", "Stanford IR", and "Stanford IR Book", so no prefix
 * heuristic can recover one name. Hand-written, like scripts/source-tier.mjs.
 * Unlisted hubs fall back to the derived label.
 */
const HUB_LABELS = {
  'jeffe.cs.illinois.edu': 'Algorithms (Jeff Erickson)',
  'usaco.guide': 'USACO Guide',
  '3blue1brown.com': '3Blue1Brown',
  'cp-algorithms.com': 'cp-algorithms',
  // Not just Fowler: 4 of the 12 concepts cite Unmesh Joshi's Patterns of
  // Distributed Systems, which is hosted here. "Martin Fowler" misattributed it.
  'martinfowler.com': 'martinfowler.com — pattern catalogs',
  'nlp.stanford.edu': 'Introduction to Information Retrieval (Manning et al.)',
  'anthropic.com': 'Anthropic engineering & research', // spans /engineering/, /news/, /research/
  'sre.google': 'Google SRE Book',
  '15445.courses.cs.cmu.edu': 'CMU 15-445 — Database Systems',
  'cs336.stanford.edu': 'Stanford CS336 — Language Modeling from Scratch',
  'cs231n.github.io': 'Stanford CS231n',
  'developer.mozilla.org': 'MDN Web Docs',
  'hbr.org': 'Harvard Business Review',
  'jalammar.github.io': 'Jay Alammar — Illustrated series',
  'postgresql.org': 'PostgreSQL documentation',
  'abseil.io': 'Software Engineering at Google',
  // Majority of the cited URLs are Search Labs blog posts, not reference docs.
  'elastic.co': 'Elastic docs & Search Labs blog',
  'gameprogrammingpatterns.com': 'Game Programming Patterns (Nystrom)',
  'martin.kleppmann.com': 'Martin Kleppmann',
  'rework.withgoogle.com': 'Google re:Work',
  'seeing-theory.brown.edu': 'Seeing Theory (Brown)',
  'chance.dartmouth.edu': 'Introduction to Probability (Grinstead & Snell)',
  'eugeneyan.com': 'Eugene Yan',
  'pearson.com': 'Design Patterns (Gamma, Helm, Johnson, Vlissides)',
  'setosa.io': 'Explained Visually (Setosa)',
  'svpg.com': 'Silicon Valley Product Group (Cagan)',
  'blog.cloudflare.com': 'Cloudflare Blog',
  'deeplearningbook.org': 'Deep Learning (Goodfellow, Bengio, Courville)',
  'hamel.dev': 'Hamel Husain',
  'karpathy.ai': 'Andrej Karpathy',
  'karpathy.github.io': 'Andrej Karpathy — blog',
  'openintro-ims.netlify.app': 'OpenIntro — Introduction to Modern Statistics',
  'pages.cs.wisc.edu': 'Operating Systems: Three Easy Pieces (OSTEP)',
  'projects.iq.harvard.edu': 'Harvard Stat 110',
  'statlearning.com': 'An Introduction to Statistical Learning',
  'aws.amazon.com': "AWS Builders' Library",
  'dataintensive.net': 'Designing Data-Intensive Applications (Kleppmann)',
  'kubernetes.io': 'Kubernetes documentation',
  'lmsys.org': 'LMSYS blog',
  'nlp.seas.harvard.edu': 'The Annotated Transformer',
  'otexts.com': 'Forecasting: Principles and Practice (Hyndman)',
  'stripe.com': 'Stripe engineering blog', // both cited URLs are /blog/ posts
  'testing.googleblog.com': 'Google Testing Blog',
  'ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016':
    'MIT 18.650 — Statistics for Applications',
  'ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020':
    'MIT 6.006 — Introduction to Algorithms',
  'ocw.mit.edu/courses/18-06-linear-algebra-spring-2010': 'MIT 18.06 — Linear Algebra (Strang)',
  'ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015':
    'MIT 6.046J — Design and Analysis of Algorithms',
  'ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013':
    'MIT 18.S096 — Mathematics with Applications in Finance',
  'ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013':
    'MIT 6.041SC — Probabilistic Systems Analysis',
  'web.stanford.edu/~boyd/cvxbook': 'Convex Optimization (Boyd & Vandenberghe)',
  'web.stanford.edu/~jurafsky/slp3': 'Speech and Language Processing (Jurafsky & Martin)',
  'web.stanford.edu/class/cs224n': 'Stanford CS224n',
};

/**
 * Landing pages, where the cited URLs do not contain one.
 *
 * `labelFor` derives the URL as the shortest link in the group, which is only
 * right when the group happens to cite a root. Usually it does not: every
 * Erickson citation is a chapter PDF, so the hub labelled "Algorithms (Jeff
 * Erickson)" linked to Chapter 7 on minimum spanning trees. The worst case was
 * sre.google, where the group DOES contain the table of contents and it lost
 * to /being-on-call/ by four characters.
 *
 * Curating the label without the URL fixed the wrong half — the ROI card names
 * a book and then opens one arbitrary chapter of it. A fewest-path-segments
 * heuristic was tried first and moved 1 of 50, because the landing page is
 * usually not cited anywhere.
 *
 * Every URL here was fetched and confirmed 200 before being added.
 */
const HUB_URLS = {
  'nlp.stanford.edu': 'https://nlp.stanford.edu/IR-book/',
  'jeffe.cs.illinois.edu': 'https://jeffe.cs.illinois.edu/teaching/algorithms/',
  'sre.google': 'https://sre.google/sre-book/table-of-contents/',
  'abseil.io': 'https://abseil.io/resources/swe-book',
  'cs231n.github.io': 'https://cs231n.github.io/',
  'anthropic.com': 'https://www.anthropic.com/engineering',
  'lmsys.org': 'https://www.lmsys.org/blog/', // /blog/ 301s to www
  'martinfowler.com': 'https://martinfowler.com/',
  'usaco.guide': 'https://usaco.guide/',
  'cp-algorithms.com': 'https://cp-algorithms.com/',
  'pages.cs.wisc.edu': 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
  'hamel.dev': 'https://hamel.dev/',
  'web.stanford.edu/class/cs224n': 'https://web.stanford.edu/class/cs224n/',
  // The full book PDF rather than the single chapter that happened to be cited.
  'chance.dartmouth.edu':
    'https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/amsbook.mac.pdf',
  'postgresql.org': 'https://www.postgresql.org/docs/current/',
  'gameprogrammingpatterns.com': 'https://gameprogrammingpatterns.com/contents.html',
  'seeing-theory.brown.edu': 'https://seeing-theory.brown.edu/',
  'openintro-ims.netlify.app': 'https://openintro-ims.netlify.app/',
  'testing.googleblog.com': 'https://testing.googleblog.com/',
};

/** A hub must cover at least this many concepts to be worth recommending. */
const MIN_CONCEPTS = 3;

function hubKey(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (PUBLISHERS.some((re) => re.test(host) || re.test(url.hostname))) return null;

  const scoped = PATH_SCOPED[host];
  if (scoped) {
    const parts = url.pathname.split('/').filter(Boolean).slice(0, scoped);
    if (parts.length < scoped) return null;
    return `${host}/${parts.join('/')}`;
  }
  return host;
}

const packs = JSON.parse(readFileSync(join(ROOT, 'src/data/concept-packs.json'), 'utf8')).packs;

const groups = new Map();
for (const [conceptId, pack] of Object.entries(packs)) {
  for (const item of pack.items ?? []) {
    if (!item.url?.startsWith('http')) continue;
    const key = hubKey(item.url);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, { key, conceptIds: new Set(), items: [] });
    const group = groups.get(key);
    group.conceptIds.add(conceptId);
    group.items.push({ title: item.title ?? '', url: item.url });
  }
}

/** Separators the catalog uses between a source's name and the specific piece. */
const TITLE_SPLIT = /\s+[—–|]\s+|:\s+|\s+§/;

function commonPrefix(strings) {
  if (!strings.length) return '';
  let prefix = strings[0];
  for (const s of strings.slice(1)) {
    let i = 0;
    while (i < prefix.length && i < s.length && prefix[i] === s[i]) i++;
    prefix = prefix.slice(0, i);
    if (!prefix) break;
  }
  return prefix;
}

/**
 * Name the hub, not one of its pages.
 *
 * Catalog titles are shaped `<source> — <specific piece>`, so the longest common
 * prefix across a group recovers the source name: eleven Erickson chapters share
 * "Algorithms (Erickson) — Chapter ", which trims to "Algorithms (Erickson)".
 * Falling back to the shortest URL's title instead would label that hub
 * "Algorithms (Erickson) — Chapter 7: Minimum Spanning Trees".
 */
function labelFor(group) {
  const root = [...group.items].sort((a, b) => a.url.length - b.url.length)[0];
  const clean = (s) =>
    s
      .replace(/\s*\((course|book|paper|docs?|site|textbook)\)\s*$/i, '')
      .replace(/[\s—–|:,(§-]+$/, '')
      .trim();

  // Everything before the separator is the source name; the rest is the piece.
  const segments = [
    ...new Set(
      group.items
        .map((i) => (i.title ?? '').split(TITLE_SPLIT)[0].trim())
        .filter((s) => s.length > 0)
    ),
  ];
  if (!segments.length) return { label: group.key, url: root.url };
  if (segments.length === 1) return { label: clean(segments[0]) || group.key, url: root.url };

  let prefix = commonPrefix(segments).trim();
  // Never end mid-word: "CMU 15-445/6" is not a source name.
  if (!segments.includes(prefix)) prefix = prefix.replace(/\s+\S*$/, '').trim();
  prefix = clean(prefix);

  // A prefix that throws away most of the shortest name is a coincidence, not a
  // source: jalammar hosts "The Illustrated Transformer" and "The Illustrated
  // Word2vec", whose shared "The Illustrated" names neither. Prefer the host.
  const shortest = Math.min(...segments.map((s) => s.length));
  if (prefix.length >= 6 && prefix.length / shortest >= 0.5) {
    return { label: prefix, url: root.url };
  }
  return { label: group.key, url: root.url };
}

const hubs = [...groups.values()]
  .filter((g) => g.conceptIds.size >= MIN_CONCEPTS)
  .map((g) => {
    const derived = labelFor(g);
    return {
      id: g.key,
      label: HUB_LABELS[g.key] ?? derived.label,
      url: HUB_URLS[g.key] ?? derived.url,
      conceptIds: [...g.conceptIds].sort(),
    };
  })
  .sort((a, b) => b.conceptIds.length - a.conceptIds.length || a.id.localeCompare(b.id));

const out = { version: 1, minConcepts: MIN_CONCEPTS, hubs };
writeFileSync(join(ROOT, 'src/data/source-hubs.json'), `${JSON.stringify(out, null, 2)}\n`);

console.log(`source-hubs — ${hubs.length} hubs covering >= ${MIN_CONCEPTS} concepts`);
for (const hub of hubs.slice(0, 12)) {
  console.log(`  ${String(hub.conceptIds.length).padStart(3)}  ${hub.label.slice(0, 60)}`);
}
