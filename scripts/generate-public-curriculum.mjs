import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const publicDir = join(repoRoot, 'public');
const outputDir = join(publicDir, 'curriculum');
const systemDesignOutputDir = join(publicDir, 'system-design');
const origin = 'https://learn.significanthobbies.com';

const vite = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true },
  appType: 'custom',
});

let learning;
let navigation;
let changelog;
let systemDesign;
try {
  [learning, navigation, changelog, systemDesign] = await Promise.all([
    vite.ssrLoadModule('/src/data/learning-os.ts'),
    vite.ssrLoadModule('/src/data/site-navigation.ts'),
    vite.ssrLoadModule('/src/data/changelog.ts'),
    vite.ssrLoadModule('/src/data/system-design-cases.ts'),
  ]);
} finally {
  await vite.close();
}

const { TRACKS, CONCEPTS, ROADMAPS, DRILLS, REVIEW_QUESTIONS, ARTIFACTS } = learning;
const { PRIMARY_NAV_ITEMS, BROWSE_NAV_ITEMS } = navigation;
const { CHANGELOG_RELEASES, CHANGELOG_REPOSITORY } = changelog;
const { SYSTEM_DESIGN_CASES, SYSTEM_DESIGN_CASE_GROUPS } = systemDesign;
const APPROVED_SYSTEM_DESIGN_CASES = SYSTEM_DESIGN_CASES.filter(
  (caseDefinition) => caseDefinition.publication.state === 'approved'
);
const coverage = JSON.parse(
  readFileSync(join(repoRoot, 'src/data/curriculum-coverage.json'), 'utf8')
);

const byId = (items) => new Map(items.map((item) => [item.id, item]));
const conceptsById = byId(CONCEPTS);
const tracksById = byId(TRACKS);
const drillsById = byId(DRILLS);
const reviewsById = byId(REVIEW_QUESTIONS);
const artifactsById = byId(ARTIFACTS);

const conceptUrl = (id) => `/curriculum/concepts/${id}.html`;
const trackUrl = (id) => `/curriculum/tracks/${id}.html`;
const roadmapUrl = (id) => `/curriculum/roadmaps/${id}.html`;
const systemDesignGuideUrl = (caseDefinition) =>
  `/system-design/${caseDefinition.publication.guide.slug}`;
const systemDesignPracticeUrl = (caseDefinition) => `/mock?prompt=${caseDefinition.id}&from=guide`;
const markdownUrl = (path) => {
  if (path === '/') return '/index.md';
  if (path.endsWith('/')) return `${path}index.md`;
  if (path.endsWith('.html')) return `${path.slice(0, -5)}.md`;
  return `${path}.md`;
};
const absolute = (path) => `${origin}${path}`;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function plainText(value) {
  return String(value ?? '')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

function truncate(value, max) {
  const text = plainText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

function seoTitle(subject) {
  return truncate(`${subject} | SWE Prep`, 60);
}

function seoDescription(value, fallback) {
  let text = plainText(value || fallback);
  if (text.length < 70) {
    text = `${text} Learn the mechanism through focused drills, review prompts, and build evidence.`;
  }
  return truncate(text, 158);
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

function linkList(items, href, label = (item) => item.title ?? item.name) {
  if (!items.length) return '<p class="muted">None assigned yet.</p>';
  return `<ul class="link-list">${items
    .map((item) => `<li><a href="${escapeHtml(href(item))}">${escapeHtml(label(item))}</a></li>`)
    .join('')}</ul>`;
}

function navLink(item) {
  return `<a href="${escapeHtml(item.to)}">${escapeHtml(item.label)}</a>`;
}

function siteHeader() {
  const primaryLinks = PRIMARY_NAV_ITEMS.map(navLink).join('');
  const browseLinks = BROWSE_NAV_ITEMS.map(navLink).join('');
  return `<a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
      <div class="site-header-inner">
        <a class="brand" href="/"><strong>SWE Prep</strong><span>/ Learning OS</span></a>
        <nav class="desktop-nav" aria-label="Primary">
          ${primaryLinks}
          <details class="browse-menu">
            <summary>Browse <span aria-hidden="true">▾</span></summary>
            <div class="browse-panel">${browseLinks}</div>
          </details>
        </nav>
        <details class="compact-menu">
          <summary>Menu <span aria-hidden="true">▾</span></summary>
          <nav aria-label="Compact">
            <p>Learn</p>
            ${primaryLinks}
            <hr>
            <p>Browse</p>
            ${browseLinks}
          </nav>
        </details>
      </div>
    </header>`;
}

function page({
  title,
  description,
  path,
  type,
  body,
  breadcrumbs = [],
  breadcrumbRoot = { label: 'Curriculum', href: '/curriculum/' },
  schema,
}) {
  const canonical = absolute(path);
  const metaTitle = seoTitle(title);
  const metaDescription = seoDescription(description, title);
  const breadcrumbHtml = [breadcrumbRoot, ...breadcrumbs]
    .map((item) => `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`)
    .join('<span aria-hidden="true">/</span>');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(metaTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <meta property="og:type" content="${type === 'concept' ? 'article' : 'website'}">
    <meta property="og:site_name" content="SWE Interview Prep">
    <meta property="og:title" content="${escapeHtml(metaTitle)}">
    <meta property="og:description" content="${escapeHtml(metaDescription)}">
    <meta property="og:url" content="${escapeHtml(canonical)}">
    <meta property="og:image" content="${origin}/og-image.svg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(metaTitle)}">
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
    <meta name="twitter:image" content="${origin}/og-image.svg">
    <link rel="stylesheet" href="/curriculum/styles.css">
    <script type="application/ld+json">${jsonLd(schema)}</script>
  </head>
  <body>
    ${siteHeader()}
    <main id="main-content">
      <nav class="breadcrumbs" aria-label="Breadcrumb">${breadcrumbHtml}</nav>
      ${body}
    </main>
    <footer>
      <p>Built for active learning: Concept → Drill → Build → Review → Apply.</p>
      <p><a href="/about">About</a> · <a href="/privacy">Privacy</a> · <a href="/llms.txt">AI index</a></p>
    </footer>
  </body>
</html>
`;
}

function tagPills(values) {
  return `<div class="pills">${values
    .map((value) => `<span>${escapeHtml(value)}</span>`)
    .join('')}</div>`;
}

function conceptPage(concept) {
  const tracks = concept.tags.map((id) => tracksById.get(id)).filter(Boolean);
  const roadmaps = concept.roadmaps
    .map((id) => ROADMAPS.find((item) => item.id === id))
    .filter(Boolean);
  const drills = (concept.drills ?? []).map((id) => drillsById.get(id)).filter(Boolean);
  const reviews = (concept.reviewQuestions ?? []).map((id) => reviewsById.get(id)).filter(Boolean);
  const prerequisites = concept.prerequisites.map((id) => conceptsById.get(id)).filter(Boolean);
  const related = concept.related.map((id) => conceptsById.get(id)).filter(Boolean);
  const artifacts = (concept.artifacts ?? []).map((id) => artifactsById.get(id)).filter(Boolean);
  const resources = concept.resources ?? [];
  const primaryTrack = tracks[0];
  const relatedNames = related.slice(0, 4).map((item) => item.name);
  const drillNames = drills.slice(0, 3).map((item) => item.title);
  const resourceNames = resources.slice(0, 3).map((item) => item.title);

  const body = `<article>
    <p class="eyebrow">${escapeHtml(primaryTrack?.title ?? 'Software engineering')} · ${escapeHtml(concept.difficulty)}</p>
    <h1>${escapeHtml(concept.name)}</h1>
    <p class="lede">${escapeHtml(concept.description)}</p>
    ${tagPills(concept.tags)}

    <section>
      <h2>Mental model</h2>
      <p>${escapeHtml(concept.mentalModel ?? concept.description)}</p>
    </section>

    <section>
      <h2>How to study ${escapeHtml(concept.name)}</h2>
      <p>Begin by restating the mental model in your own words, then connect it to a concrete system you have built or operated. Name the mechanism, the constraint it addresses, and the trade-off it introduces. Use ${escapeHtml(
        resourceNames.length
          ? resourceNames.join(', ')
          : 'the linked roadmap and primary implementation references'
      )} to check details, but close the source before writing your explanation. Retrieval is the learning step; rereading is only preparation.</p>
      <p>Next, compare ${escapeHtml(concept.name)} with ${
        relatedNames.length
          ? escapeHtml(relatedNames.join(', '))
          : 'the neighboring concepts in its roadmap'
      }. Ask what changes in correctness, latency, resource use, operability, and failure recovery. ${
        drillNames.length
          ? `Complete ${escapeHtml(drillNames.join(', '))} and preserve the command, input, output, and one failed attempt as evidence.`
          : 'Use the roadmap milestone to create a small executable example and record what falsified your first design.'
      } Finish by explaining the idea without jargon to someone who has not studied the track.</p>
    </section>

    <section>
      <h2>Proof of understanding</h2>
      <ul>
        <li>Explain the mechanism from first principles and identify the state it reads or changes.</li>
        <li>Give one situation where the concept is the right choice and one where it is not.</li>
        <li>Predict a realistic failure mode before running the drill, then compare the prediction with evidence.</li>
        <li>Connect the result to a roadmap or build artifact instead of treating the concept as isolated trivia.</li>
      </ul>
    </section>

    ${
      concept.realWorldUsage
        ? `<section><h2>Where it matters</h2><p>${escapeHtml(concept.realWorldUsage)}</p></section>`
        : ''
    }

    ${
      concept.commonMistakes?.length
        ? `<section><h2>Common mistakes</h2><ul>${concept.commonMistakes
            .map((mistake) => `<li>${escapeHtml(mistake)}</li>`)
            .join('')}</ul></section>`
        : ''
    }

    <section>
      <h2>Learn from primary sources</h2>
      ${
        resources.length
          ? `<ul class="resource-list">${resources
              .map(
                (resource) =>
                  `<li><a href="${escapeHtml(resource.url)}" rel="noreferrer">${escapeHtml(
                    resource.title
                  )}</a> <span class="muted">(${escapeHtml(resource.type)})</span></li>`
              )
              .join('')}</ul>`
          : '<p class="muted">Use the linked roadmap context and practice prompt.</p>'
      }
    </section>

    <section>
      <h2>Practice and explain it back</h2>
      ${
        drills.length
          ? drills
              .map(
                (drill) => `<div class="practice-card">
          <h3>${escapeHtml(drill.title)}</h3>
          <p>${escapeHtml(drill.prompt)}</p>
          <p><strong>Expected evidence:</strong> ${escapeHtml(drill.expectedOutput)}</p>
          <a href="/drills/${escapeHtml(drill.id)}">Open the interactive drill →</a>
        </div>`
              )
              .join('')
          : '<p class="muted">Practice through the roadmap milestone.</p>'
      }
      ${
        reviews.length
          ? `<h3>Review prompts</h3><ul>${reviews
              .map((review) => `<li>${escapeHtml(review.question)}</li>`)
              .join('')}</ul>`
          : ''
      }
    </section>

    <section>
      <h2>Build evidence</h2>
      ${
        artifacts.length
          ? artifacts
              .map(
                (artifact) => `<div class="practice-card">
          <h3>${escapeHtml(artifact.title)}</h3>
          <p>${escapeHtml(artifact.description)}</p>
          <ul>${artifact.successCriteria
            .map((criterion) => `<li>${escapeHtml(criterion)}</li>`)
            .join('')}</ul>
        </div>`
              )
              .join('')
          : '<p class="muted">Use a roadmap capstone to turn this concept into working evidence.</p>'
      }
    </section>

    <section class="grid two">
      <div><h2>Prerequisites</h2>${linkList(
        prerequisites,
        (item) => conceptUrl(item.id),
        (item) => item.name
      )}</div>
      <div><h2>Related concepts</h2>${linkList(
        related,
        (item) => conceptUrl(item.id),
        (item) => item.name
      )}</div>
    </section>

    <section>
      <h2>Learning paths</h2>
      ${linkList(roadmaps, (item) => roadmapUrl(item.id))}
    </section>
  </article>`;

  return page({
    title: concept.name,
    description: concept.description,
    path: conceptUrl(concept.id),
    type: 'concept',
    body,
    breadcrumbs: primaryTrack
      ? [{ label: primaryTrack.title, href: trackUrl(primaryTrack.id) }]
      : [],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: concept.name,
      description: concept.description,
      url: absolute(conceptUrl(concept.id)),
      educationalLevel: concept.difficulty,
      learningResourceType: ['Concept guide', 'Practice prompt', 'Review prompt'],
      teaches: concept.name,
      isPartOf: {
        '@type': 'CollectionPage',
        name: 'SWE Prep Curriculum',
        url: absolute('/curriculum/'),
      },
    },
  });
}

function trackPage(track) {
  const concepts = CONCEPTS.filter((concept) => concept.tags.includes(track.id));
  const roadmaps = ROADMAPS.filter((roadmap) => roadmap.tracks.includes(track.id));
  const introductory = concepts.filter((concept) => concept.difficulty === 'intro');
  const advanced = concepts.filter((concept) => concept.difficulty === 'advanced');
  const body = `<article>
    <p class="eyebrow">Learning track · ${concepts.length} concepts</p>
    <h1>${escapeHtml(track.title)}</h1>
    <p class="lede">${escapeHtml(track.description)}</p>
    <section>
      <h2>What mastery looks like</h2>
      <p>This track contains ${concepts.length} connected concepts rather than an unordered reading list. Mastery means you can move from vocabulary to mechanisms, predict how the system behaves under pressure, and support a design decision with code, measurements, or a failure-recovery exercise. For ${escapeHtml(
        track.title
      )}, use the track description as the boundary: learn enough detail to reason clearly about ${escapeHtml(
        track.description.toLowerCase()
      )}</p>
      <p>A useful explanation names the state involved, the operation that changes it, the resource or safety constraint, and the observable signal that tells you whether the mechanism works. Avoid stopping at product names. Compare at least two approaches, state what each optimizes, and identify what breaks first as scale, concurrency, latency, or uncertainty increases.</p>
    </section>
    <section>
      <h2>Suggested study sequence</h2>
      <p>${
        introductory.length
          ? `Start with ${escapeHtml(
              introductory
                .slice(0, 4)
                .map((concept) => concept.name)
                .join(', ')
            )} to establish the basic vocabulary.`
          : `Start with the core concepts at the top of the list and write a one-paragraph mechanism note for each.`
      } Continue through the core concepts by alternating explanation with an executable drill. ${
        advanced.length
          ? `Treat ${escapeHtml(
              advanced
                .slice(0, 4)
                .map((concept) => concept.name)
                .join(', ')
            )} as integration work: they should combine earlier mechanisms rather than introduce disconnected facts.`
          : 'Use the related concepts and roadmap milestones to integrate the pieces into a complete system.'
      }</p>
      <p>At the end of each session, record one decision you can now make, one failure mode you can now predict, and one unanswered question. Revisit that question through the linked primary sources, then prove the answer in the Playground or a real repository. The track is complete when you can transfer the reasoning to an unfamiliar system, not when every page has been opened.</p>
    </section>
    <section>
      <h2>Roadmaps</h2>
      ${linkList(roadmaps, (item) => roadmapUrl(item.id))}
    </section>
    <section>
      <h2>Concepts in this track</h2>
      <div class="card-grid">${concepts
        .map(
          (concept) => `<article class="card">
        <p class="eyebrow">${escapeHtml(concept.difficulty)}</p>
        <h3><a href="${conceptUrl(concept.id)}">${escapeHtml(concept.name)}</a></h3>
        <p>${escapeHtml(concept.description)}</p>
      </article>`
        )
        .join('')}</div>
    </section>
  </article>`;

  return page({
    title: track.title,
    description: track.description,
    path: trackUrl(track.id),
    type: 'track',
    body,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: track.title,
      description: track.description,
      url: absolute(trackUrl(track.id)),
      numberOfItems: concepts.length,
      hasPart: concepts.map((concept) => ({
        '@type': 'LearningResource',
        name: concept.name,
        url: absolute(conceptUrl(concept.id)),
      })),
    },
  });
}

function roadmapPage(roadmap) {
  const tracks = roadmap.tracks.map((id) => tracksById.get(id)).filter(Boolean);
  const body = `<article>
    <p class="eyebrow">${escapeHtml(roadmap.horizon)} roadmap · ${roadmap.milestones.length} milestones</p>
    <h1>${escapeHtml(roadmap.title)}</h1>
    <p class="lede">${escapeHtml(roadmap.description)}</p>
    <p><strong>Outcome:</strong> ${escapeHtml(roadmap.goal)}</p>
    ${tagPills(tracks.map((track) => track.title))}
    <section>
      <h2>How to work this roadmap</h2>
      <p>Treat each milestone as a claim that must be supported by evidence. Before reading, write what you think the mechanism does and where it will fail. After studying the linked concepts, run the drills without copying an answer, preserve the output, and revise the explanation. Move forward when you can connect the milestone goal to a working implementation, benchmark, architecture decision, or reviewable design artifact.</p>
      <p>The ${escapeHtml(roadmap.horizon)} horizon is a sequencing aid, not a completion badge. Spend more time where your prediction and the observed behavior disagree. Keep a short decision log containing the mechanism selected, alternatives rejected, expected failure mode, measurement used, and remaining uncertainty. Review that log with FSRS prompts so the roadmap produces durable system judgment rather than a temporary tour of terminology.</p>
      <p>At the end, explain ${escapeHtml(
        roadmap.goal
      )} from first principles to a reader outside the domain. A strong explanation should survive follow-up questions about correctness, cost, latency, resource use, security, recovery, and operational visibility. If it cannot, return to the milestone that contains the missing mechanism and build a smaller falsifiable example.</p>
    </section>
    <section>
      <h2>Milestones</h2>
      ${roadmap.milestones
        .map((milestone, index) => {
          const concepts = milestone.concepts.map((id) => conceptsById.get(id)).filter(Boolean);
          const artifacts = milestone.artifacts.map((id) => artifactsById.get(id)).filter(Boolean);
          return `<article class="milestone">
          <p class="eyebrow">Milestone ${index + 1}</p>
          <h3>${escapeHtml(milestone.title)}</h3>
          <p>${escapeHtml(milestone.goal)}</p>
          <h4>Concepts</h4>
          ${linkList(
            concepts,
            (item) => conceptUrl(item.id),
            (item) => item.name
          )}
          ${
            artifacts.length
              ? `<h4>Build evidence</h4><ul>${artifacts
                  .map(
                    (artifact) =>
                      `<li><strong>${escapeHtml(artifact.title)}</strong> — ${escapeHtml(
                        artifact.description
                      )}</li>`
                  )
                  .join('')}</ul>`
              : ''
          }
        </article>`;
        })
        .join('')}
    </section>
    <p class="cta"><a href="/roadmaps/${escapeHtml(roadmap.id)}">Start this roadmap in the interactive app →</a></p>
  </article>`;

  return page({
    title: roadmap.title,
    description: roadmap.description,
    path: roadmapUrl(roadmap.id),
    type: 'roadmap',
    body,
    breadcrumbs: tracks[0] ? [{ label: tracks[0].title, href: trackUrl(tracks[0].id) }] : [],
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: roadmap.title,
      description: roadmap.description,
      url: absolute(roadmapUrl(roadmap.id)),
      provider: {
        '@type': 'Organization',
        name: 'SWE Interview Prep',
        url: origin,
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: roadmap.horizon,
      },
    },
  });
}

function hubPage() {
  const body = `<article>
    <p class="eyebrow">Public curriculum · ${TRACKS.length} tracks · ${CONCEPTS.length} concepts · ${ROADMAPS.length} roadmaps</p>
    <h1>Software engineering curriculum</h1>
    <p class="lede">A mechanism-first learning system for software engineers: systems foundations, infrastructure, distributed systems, databases, AI model training, inference, agents, reliability, developer tools, application engineering, multimodal systems, DSA, system design, mathematics, search, and product engineering.</p>
    <section>
      <h2>How to use this curriculum</h2>
      <p>Start with a track when you need a domain map, choose a roadmap when you want an ordered path, and open a concept when you need a focused mental model. Every concept connects reading to active work through a drill, an explain-back review prompt, and a build artifact. The interactive app adds FSRS spaced repetition, Monaco code execution, Excalidraw system diagrams, and Socratic feedback.</p>
      <p>The public pages are useful without an account or JavaScript. They deliberately expose learning structure and primary sources, while private progress, notes, saved reading, and review answers remain inside the personal learning workspace.</p>
    </section>
    <section>
      <h2>Browse all tracks</h2>
      <div class="card-grid">${TRACKS.map((track) => {
        const count = CONCEPTS.filter((concept) => concept.tags.includes(track.id)).length;
        return `<article class="card">
          <p class="eyebrow">${count} concepts</p>
          <h3><a href="${trackUrl(track.id)}">${escapeHtml(track.title)}</a></h3>
          <p>${escapeHtml(track.description)}</p>
        </article>`;
      }).join('')}</div>
    </section>
    <section>
      <h2>Choose a sequenced roadmap</h2>
      <div class="card-grid">${ROADMAPS.map(
        (roadmap) => `<article class="card">
          <p class="eyebrow">${escapeHtml(roadmap.horizon)}</p>
          <h3><a href="${roadmapUrl(roadmap.id)}">${escapeHtml(roadmap.title)}</a></h3>
          <p>${escapeHtml(roadmap.goal)}</p>
        </article>`
      ).join('')}</div>
    </section>
    <section>
      <h2>Requested domain coverage</h2>
      <p>The expanded taxonomy maps ${coverage.categories.length} broad domains and ${coverage.categories.reduce(
        (sum, category) => sum + category.topics.length,
        0
      )} named subtopics to stable concepts. This is a breadth and navigation contract: depth comes from completing the linked drills, roadmaps, and artifacts.</p>
      <ul>${coverage.categories
        .map(
          (category) =>
            `<li><strong>${escapeHtml(category.title)}</strong>: ${escapeHtml(
              category.topics.map((topic) => topic.name).join(', ')
            )}</li>`
        )
        .join('')}</ul>
    </section>
  </article>`;

  return page({
    title: 'Software Engineering Curriculum',
    description: `${CONCEPTS.length} concepts across ${TRACKS.length} software engineering tracks, with ${ROADMAPS.length} sequenced roadmaps, active drills, review prompts, and build artifacts.`,
    path: '/curriculum/',
    type: 'collection',
    body,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'SWE Prep Software Engineering Curriculum',
      description:
        'A mechanism-first software engineering curriculum with concepts, roadmaps, drills, reviews, and build artifacts.',
      url: absolute('/curriculum/'),
      numberOfItems: CONCEPTS.length,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: TRACKS.length,
        itemListElement: TRACKS.map((track, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: track.title,
          url: absolute(trackUrl(track.id)),
        })),
      },
    },
  });
}

const styles = `:root{color-scheme:dark;--bg:#09090b;--panel:#141418;--text:#f7f7f8;--muted:#a1a1aa;--line:#29292f;--accent:#67e8f9}
*{box-sizing:border-box}
html{font-family:"Geist",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--bg);color:var(--text);line-height:1.65}
body{margin:0}
a{color:var(--accent);text-decoration-thickness:1px;text-underline-offset:3px}
.skip-link{position:fixed;left:16px;top:12px;z-index:60;transform:translateY(-64px);border-radius:6px;background:white;color:black;padding:8px 12px;font-size:.875rem;font-weight:600;text-decoration:none;transition:transform 150ms}
.skip-link:focus{transform:translateY(0)}
.site-header{position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(255,255,255,.08);background:#000}
.site-header-inner{position:relative;display:flex;align-items:center;gap:12px;width:100%;max-width:1400px;height:64px;margin:auto;padding:0 24px}
.brand{display:flex;align-items:center;gap:8px;flex-shrink:0;color:white;text-decoration:none}
.brand strong{font-size:1rem;letter-spacing:-.01em}
.brand span{color:rgba(255,255,255,.3);font-size:.75rem}
.desktop-nav{position:absolute;left:50%;display:flex;min-width:0;align-items:center;justify-content:center;gap:clamp(16px,1.8vw,24px);transform:translateX(-50%)}
.desktop-nav>a,.browse-menu>summary{display:inline-flex;height:64px;align-items:center;white-space:nowrap;padding:0 4px;color:rgba(255,255,255,.55);font-size:.875rem;text-decoration:none;transition:color 150ms}
.desktop-nav>a:hover,.browse-menu>summary:hover{color:white}
.browse-menu,.compact-menu{position:relative}
.browse-menu>summary,.compact-menu>summary{cursor:pointer;list-style:none}
.browse-menu>summary::-webkit-details-marker,.compact-menu>summary::-webkit-details-marker{display:none}
.browse-menu>summary span,.compact-menu>summary span{margin-left:4px;font-size:.625rem;transition:transform 150ms}
.browse-menu[open]>summary span,.compact-menu[open]>summary span{transform:rotate(180deg)}
.browse-panel{position:absolute;left:50%;top:calc(100% + 4px);display:grid;width:448px;grid-template-columns:1fr 1fr;gap:4px;transform:translateX(-50%);border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#000;padding:8px}
.browse-panel a,.compact-menu nav a{display:block;border-radius:6px;color:rgba(255,255,255,.65);padding:8px 12px;font-size:.875rem;text-decoration:none;transition:background 150ms,color 150ms}
.browse-panel a:hover,.compact-menu nav a:hover{background:rgba(255,255,255,.05);color:white}
.compact-menu{display:none;margin-left:auto}
.compact-menu>summary{display:flex;height:36px;align-items:center;border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:0 12px;color:white;font-size:.75rem;font-weight:600}
.compact-menu nav{position:absolute;right:0;top:calc(100% + 8px);width:min(352px,calc(100vw - 32px));max-height:calc(100vh - 80px);overflow-y:auto;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#000;padding:8px}
.compact-menu nav p{margin:0;padding:8px 12px 4px;color:rgba(255,255,255,.38);font-size:.6875rem;font-weight:600}
.compact-menu nav hr{margin:8px 12px;border:0;border-top:1px solid rgba(255,255,255,.08)}
main,footer{width:min(1120px,calc(100% - 32px));margin:auto}
main{padding:48px 0 80px}
.breadcrumbs{display:flex;gap:10px;flex-wrap:wrap;color:#71717a;font-size:.82rem;margin-bottom:28px}
.breadcrumbs a{color:var(--muted);text-decoration:none}
.breadcrumbs a:hover{color:white}
article{max-width:920px}
h1{font-size:clamp(2.6rem,7vw,5rem);line-height:1.02;letter-spacing:-.04em;margin:.2em 0 .35em}
h2{font-size:1.55rem;letter-spacing:-.02em;margin-top:2.2em}
h3{font-size:1.08rem}
h4{color:#d4d4d8}
.lede{font-size:clamp(1.08rem,2vw,1.35rem);color:#d4d4d8;max-width:780px}
.eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.72rem;color:#71717a}
.muted{color:var(--muted)}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}
.pills span{border:1px solid var(--line);border-radius:999px;padding:4px 10px;color:#d4d4d8;font-size:.78rem}
.grid{display:grid;gap:20px}
.grid.two{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.card,.practice-card,.milestone{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px;margin:14px 0}
.card h3,.practice-card h3,.milestone h3{margin:.25em 0}
.card p:last-child{color:var(--muted)}
.link-list,.resource-list{padding-left:20px}
.link-list li,.resource-list li{margin:.45em 0}
.cta{margin-top:36px;font-weight:700}
footer{border-top:1px solid var(--line);padding:28px 0 48px;color:var(--muted);font-size:.86rem}
@media(max-width:1023px){.site-header-inner{padding:0 16px}.desktop-nav{display:none}.compact-menu{display:block}}
@media(max-width:520px){.brand span{display:none}main{padding-top:32px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto;transition-duration:.001ms!important}}`;

function inlineRichText(value) {
  return escapeHtml(value).replaceAll(/`([^`]+)`/g, '<code>$1</code>');
}

function richText(value) {
  return String(value)
    .trim()
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block.split('\n').map((line) => line.trim());
      if (lines.every((line) => line.startsWith('- '))) {
        return `<ul>${lines
          .map((line) => `<li>${inlineRichText(line.slice(2))}</li>`)
          .join('')}</ul>`;
      }
      return `<p>${inlineRichText(lines.join(' '))}</p>`;
    })
    .join('');
}

function systemDesignHubPage() {
  const body = `<article>
    <p class="eyebrow">Interview practice · ${SYSTEM_DESIGN_CASES.length} complete cases</p>
    <h1>System design interview questions you can actually practice</h1>
    <p class="lede">Move beyond prompt lists. Scope requirements, calculate capacity, defend an architecture, survive a failure injection, and repair the exact concept your answer missed.</p>
    <section>
      <h2>Practice the whole interview, not a memorized diagram</h2>
      <p>Most system-design question lists stop at the prompt. Knowing that “design a rate limiter” is common does not prove that you can clarify its contract, estimate load, choose a consistency model, defend the hot path, or respond when the interviewer changes one constraint. These cases turn each question into a repeatable interview with observable evidence.</p>
      <p>Every case follows six stages: scope the problem, estimate capacity, draw the high-level design, defend one critical path, respond to a failure, and review the result. The reference answer stays hidden during closed-book practice. After submission, scores cite your own words, missing dimensions link to focused concepts and drills, and already-demonstrated dimensions are not penalized by an unrelated gap.</p>
      <p>If the topic is new, learn the linked mechanisms first and study an approved worked guide. Then wait before attempting the case without notes. If an interview is close, begin closed-book and use the review as diagnosis. A strong answer is not one remembered picture; it is a chain of explicit assumptions, unit-carrying calculations, named trade-offs, and operational responses.</p>
    </section>
    ${SYSTEM_DESIGN_CASE_GROUPS.map(
      (group) => `<section>
      <h2>${escapeHtml(group.label)}</h2>
      <div class="card-grid">${group.cases
        .map((caseDefinition) => {
          const guide = caseDefinition.publication.guide;
          return `<article class="card">
          <p class="eyebrow">${escapeHtml(caseDefinition.difficulty)} · ${caseDefinition.durationMinutes} minutes</p>
          <h3>${
            guide
              ? `<a href="${systemDesignGuideUrl(caseDefinition)}">${escapeHtml(caseDefinition.title)}</a>`
              : escapeHtml(caseDefinition.title)
          }</h3>
          <p>${escapeHtml(caseDefinition.prompt)}</p>
          <p><a href="${escapeHtml(systemDesignPracticeUrl(caseDefinition))}">Start closed-book practice →</a>${
            guide
              ? ` · <a href="${systemDesignGuideUrl(caseDefinition)}">Read the worked guide</a>`
              : ''
          }</p>
        </article>`;
        })
        .join('')}</div>
    </section>`
    ).join('')}
    <section>
      <h2>What the review measures</h2>
      <p>Cases score requirements, capacity, architecture, critical-path judgment, and reliability as separate dimensions. The deterministic rubric looks for declared evidence and remains available without an AI provider. When optional AI critique is configured, it can judge phrasing against fixed anchors, but it cannot add requirements, dimensions, facts, or out-of-range scores.</p>
      <p>${APPROVED_SYSTEM_DESIGN_CASES.length} source-reviewed worked guides are public. Practice-only cases receive guides only after their calculations, primary sources, and editorial explanations pass the same review. That prevents generic, templated pages from diluting the curriculum.</p>
    </section>
  </article>`;

  return page({
    title: 'System Design Interview Questions',
    description:
      'Practice common system design interview questions with staged prompts, capacity math, failure drills, worked guides, and targeted concept review.',
    path: '/system-design/',
    type: 'collection',
    body,
    breadcrumbRoot: { label: 'Home', href: '/' },
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: 'System Design Interview Questions',
          description:
            'Staged system-design interview cases with worked guides and targeted remediation.',
          url: absolute('/system-design/'),
          numberOfItems: SYSTEM_DESIGN_CASES.length,
          hasPart: APPROVED_SYSTEM_DESIGN_CASES.map((caseDefinition) => ({
            '@type': 'Article',
            headline: caseDefinition.publication.guide.title,
            url: absolute(systemDesignGuideUrl(caseDefinition)),
          })),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'System design cases',
              item: absolute('/system-design/'),
            },
          ],
        },
      ],
    },
  });
}

function systemDesignGuidePage(caseDefinition) {
  const guide = caseDefinition.publication.guide;
  if (!guide) throw new Error(`Approved case ${caseDefinition.id} is missing guide content`);
  const concepts = caseDefinition.conceptIds.map((id) => conceptsById.get(id)).filter(Boolean);
  const drills = caseDefinition.drillIds.map((id) => drillsById.get(id)).filter(Boolean);
  const body = `<article>
    <p class="eyebrow">System design interview guide · ${caseDefinition.durationMinutes} minutes</p>
    <h1>${escapeHtml(caseDefinition.title)}</h1>
    <p class="lede">${escapeHtml(guide.description)}</p>
    <p><a href="${escapeHtml(systemDesignPracticeUrl(caseDefinition))}">Start the closed-book case →</a></p>
    ${guide.sections
      .map(
        (section, index) => `<section>
      <h2>${index + 1}. ${escapeHtml(section.heading)}</h2>
      ${richText(section.body)}
    </section>`
      )
      .join('')}
    <section><h2>Answer outline</h2><p>${escapeHtml(guide.finalAnswer)}</p></section>
    <section>
      <h2>Primary sources</h2>
      <ul class="resource-list">${caseDefinition.sources
        .map(
          (source) =>
            `<li><a href="${escapeHtml(source.url)}" rel="noreferrer">${escapeHtml(source.title)}</a> <span class="muted">(${escapeHtml(source.kind)})</span></li>`
        )
        .join('')}</ul>
    </section>
    <section class="grid two">
      <div><h2>Repair the mechanisms</h2>${linkList(
        concepts,
        (concept) => conceptUrl(concept.id),
        (concept) => concept.name
      )}</div>
      <div><h2>Practice drills</h2>${linkList(
        drills,
        (drill) => `/drills/${drill.id}`,
        (drill) => drill.title
      )}</div>
    </section>
    <p class="cta"><a href="${escapeHtml(systemDesignPracticeUrl(caseDefinition))}">Close the guide and attempt the interview →</a></p>
  </article>`;

  return page({
    title: guide.title,
    description: guide.description,
    path: systemDesignGuideUrl(caseDefinition),
    type: 'concept',
    body,
    breadcrumbRoot: { label: 'System design cases', href: '/system-design/' },
    schema: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: guide.title,
          description: guide.description,
          url: absolute(systemDesignGuideUrl(caseDefinition)),
          datePublished: guide.publishedAt,
          dateModified: guide.updatedAt,
          author: { '@type': 'Organization', name: 'SWE Interview Prep', url: origin },
          publisher: { '@type': 'Organization', name: 'SWE Interview Prep', url: origin },
          about: caseDefinition.conceptIds.map((id) => conceptsById.get(id)?.name ?? id),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'System design cases',
              item: absolute('/system-design/'),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: caseDefinition.title,
              item: absolute(systemDesignGuideUrl(caseDefinition)),
            },
          ],
        },
      ],
    },
  });
}

function systemDesignHubMarkdown() {
  return `# System design interview questions you can actually practice

Move beyond prompt lists. Every case covers scoping, capacity estimation, high-level design,
a critical-path deep dive, failure injection, and evidence-backed review. Reference answers stay
hidden during closed-book practice.

${SYSTEM_DESIGN_CASE_GROUPS.map(
  (group) => `## ${group.label}

${group.cases
  .map((caseDefinition) => {
    const guide = caseDefinition.publication.guide;
    return `### ${caseDefinition.title}

${caseDefinition.prompt}

- [Start closed-book practice](${absolute(systemDesignPracticeUrl(caseDefinition))})${
      guide ? `\n- [Read the worked guide](${absolute(systemDesignGuideUrl(caseDefinition))})` : ''
    }`;
  })
  .join('\n\n')}`
).join('\n\n')}

## How scoring works

The fixed case rubric scores requirements, capacity, architecture, critical-path judgment, and
reliability separately. Missed dimensions link to targeted concepts and drills. Practice-only cases
do not emit placeholder public guides.
`;
}

function systemDesignGuideMarkdown(caseDefinition) {
  const guide = caseDefinition.publication.guide;
  if (!guide) throw new Error(`Approved case ${caseDefinition.id} is missing guide content`);
  return `# ${caseDefinition.title}

${guide.description}

- [Start the closed-book case](${absolute(systemDesignPracticeUrl(caseDefinition))})
- [Browse all system-design cases](${absolute('/system-design/')})

${guide.sections.map((section, index) => `## ${index + 1}. ${section.heading}\n\n${section.body}`).join('\n\n')}

## Answer outline

${guide.finalAnswer}

## Primary sources

${caseDefinition.sources.map((source) => `- [${source.title}](${source.url}) (${source.kind})`).join('\n')}

## Repair the mechanisms

${caseDefinition.conceptIds
  .map((id) => conceptsById.get(id))
  .filter(Boolean)
  .map((concept) => `- [${concept.name}](${absolute(conceptUrl(concept.id))})`)
  .join('\n')}
`;
}

function catalogData() {
  return {
    name: 'SWE Prep Curriculum',
    version: 1,
    generatedFrom: [
      'src/data/learning-os.ts',
      'src/data/concepts.json',
      'src/data/roadmaps.json',
      'src/data/curriculum-coverage.json',
      'src/data/system-design-cases.ts',
    ],
    counts: {
      tracks: TRACKS.length,
      concepts: CONCEPTS.length,
      roadmaps: ROADMAPS.length,
      drills: DRILLS.length,
      reviewQuestions: REVIEW_QUESTIONS.length,
      artifacts: ARTIFACTS.length,
      systemDesignCases: SYSTEM_DESIGN_CASES.length,
      systemDesignGuides: APPROVED_SYSTEM_DESIGN_CASES.length,
      coverageCategories: coverage.categories.length,
      coverageTopics: coverage.categories.reduce(
        (sum, category) => sum + category.topics.length,
        0
      ),
    },
    tracks: TRACKS.map((track) => ({
      id: track.id,
      title: track.title,
      description: track.description,
      url: absolute(trackUrl(track.id)),
      conceptIds: CONCEPTS.filter((concept) => concept.tags.includes(track.id)).map(
        (concept) => concept.id
      ),
      roadmapIds: ROADMAPS.filter((roadmap) => roadmap.tracks.includes(track.id)).map(
        (roadmap) => roadmap.id
      ),
    })),
    roadmaps: ROADMAPS.map((roadmap) => ({
      id: roadmap.id,
      title: roadmap.title,
      horizon: roadmap.horizon,
      goal: roadmap.goal,
      url: absolute(roadmapUrl(roadmap.id)),
      conceptIds: [...new Set(roadmap.milestones.flatMap((milestone) => milestone.concepts))],
    })),
    concepts: CONCEPTS.map((concept) => ({
      id: concept.id,
      name: concept.name,
      description: concept.description,
      difficulty: concept.difficulty,
      tags: concept.tags,
      url: absolute(conceptUrl(concept.id)),
      roadmapIds: concept.roadmaps,
    })),
    systemDesignCases: SYSTEM_DESIGN_CASES.map((caseDefinition) => ({
      id: caseDefinition.id,
      version: caseDefinition.version,
      title: caseDefinition.title,
      prompt: caseDefinition.prompt,
      category: caseDefinition.category,
      pattern: caseDefinition.pattern,
      criticalPath: caseDefinition.criticalPath,
      difficulty: caseDefinition.difficulty,
      practiceUrl: absolute(systemDesignPracticeUrl(caseDefinition)),
      guideUrl: caseDefinition.publication.guide
        ? absolute(systemDesignGuideUrl(caseDefinition))
        : null,
      conceptIds: caseDefinition.conceptIds,
      drillIds: caseDefinition.drillIds,
    })),
    coverage: coverage.categories,
  };
}

function catalogMarkdown(catalog) {
  const tracks = catalog.tracks
    .map(
      (track) => `## ${track.title}

${track.description}

- Public page: ${track.url}
- Concepts: ${track.conceptIds.length}
- Roadmaps: ${track.roadmapIds.length}

${track.conceptIds
  .map((id) => {
    const concept = conceptsById.get(id);
    return `- [${concept.name}](${absolute(conceptUrl(id))}) — ${plainText(concept.description)}`;
  })
  .join('\n')}`
    )
    .join('\n\n');

  const roadmaps = catalog.roadmaps
    .map(
      (roadmap) =>
        `- [${roadmap.title}](${roadmap.url}) (${roadmap.horizon}) — ${plainText(roadmap.goal)}`
    )
    .join('\n');

  return `# SWE Prep Curriculum Catalog

A public, JavaScript-free index of ${catalog.counts.concepts} concepts across
${catalog.counts.tracks} tracks and ${catalog.counts.roadmaps} sequenced roadmaps.
The active learning loop is Concept → Drill → Build → Review → Apply.

- Human curriculum hub: ${absolute('/curriculum/')}
- System-design case library: ${absolute('/system-design/')}
- Structured JSON catalog: ${absolute('/curriculum/catalog.json')}
- Interactive learning app: ${absolute('/learn')}

# Roadmaps

${roadmaps}

# System-design interview cases

${catalog.systemDesignCases
  .map(
    (caseDefinition) =>
      `- [${caseDefinition.title}](${caseDefinition.guideUrl ?? caseDefinition.practiceUrl}) — ${caseDefinition.prompt}`
  )
  .join('\n')}

# Tracks and concepts

${tracks}
`;
}

function trackMarkdown(track) {
  const concepts = CONCEPTS.filter((concept) => concept.tags.includes(track.id));
  const roadmaps = ROADMAPS.filter((roadmap) => roadmap.tracks.includes(track.id));
  return `# ${track.title}

${plainText(track.description)}

This track contains ${concepts.length} connected concepts. Mastery means explaining each
mechanism, predicting its failure modes, and supporting decisions with code,
measurements, or a reviewable design artifact.

## Roadmaps

${roadmaps.length ? roadmaps.map((roadmap) => `- [${roadmap.title}](${absolute(roadmapUrl(roadmap.id))}) — ${plainText(roadmap.goal)}`).join('\n') : '- No dedicated roadmap is assigned yet.'}

## Concepts

${concepts.map((concept) => `- [${concept.name}](${absolute(conceptUrl(concept.id))}) (${concept.difficulty}) — ${plainText(concept.description)}`).join('\n')}
`;
}

function roadmapMarkdown(roadmap) {
  const tracks = roadmap.tracks.map((id) => tracksById.get(id)).filter(Boolean);
  const milestones = roadmap.milestones
    .map((milestone, index) => {
      const concepts = milestone.concepts.map((id) => conceptsById.get(id)).filter(Boolean);
      const artifacts = milestone.artifacts.map((id) => artifactsById.get(id)).filter(Boolean);
      return `## Milestone ${index + 1}: ${milestone.title}

${plainText(milestone.goal)}

### Concepts

${concepts.map((concept) => `- [${concept.name}](${absolute(conceptUrl(concept.id))}) — ${plainText(concept.description)}`).join('\n')}

${artifacts.length ? `### Build evidence\n\n${artifacts.map((artifact) => `- **${artifact.title}** — ${plainText(artifact.description)}`).join('\n')}` : ''}`;
    })
    .join('\n\n');

  return `# ${roadmap.title}

${plainText(roadmap.description)}

- Horizon: ${roadmap.horizon}
- Outcome: ${plainText(roadmap.goal)}
- Tracks: ${tracks.map((track) => track.title).join(', ')}

Work each milestone as a claim that needs evidence. Predict the mechanism and
failure mode first, study the linked concepts, complete the drills without
copying an answer, and preserve the resulting code, measurements, or design.

${milestones}
`;
}

function conceptMarkdown(concept) {
  const tracks = concept.tags.map((id) => tracksById.get(id)).filter(Boolean);
  const roadmaps = concept.roadmaps
    .map((id) => ROADMAPS.find((item) => item.id === id))
    .filter(Boolean);
  const drills = (concept.drills ?? []).map((id) => drillsById.get(id)).filter(Boolean);
  const reviews = (concept.reviewQuestions ?? []).map((id) => reviewsById.get(id)).filter(Boolean);
  const prerequisites = concept.prerequisites.map((id) => conceptsById.get(id)).filter(Boolean);
  const related = concept.related.map((id) => conceptsById.get(id)).filter(Boolean);
  const artifacts = (concept.artifacts ?? []).map((id) => artifactsById.get(id)).filter(Boolean);
  const resources = concept.resources ?? [];

  return `# ${concept.name}

${plainText(concept.description)}

- Difficulty: ${concept.difficulty}
- Tracks: ${tracks.map((track) => track.title).join(', ')}

## Mental model

${plainText(concept.mentalModel ?? concept.description)}

${concept.realWorldUsage ? `## Where it matters\n\n${plainText(concept.realWorldUsage)}\n` : ''}
${concept.commonMistakes?.length ? `## Common mistakes\n\n${concept.commonMistakes.map((mistake) => `- ${plainText(mistake)}`).join('\n')}\n` : ''}
## Primary sources

${resources.length ? resources.map((resource) => `- [${resource.title}](${resource.url}) (${resource.type})`).join('\n') : '- Use the linked roadmap context and practice prompt.'}

## Practice

${drills.length ? drills.map((drill) => `### ${drill.title}\n\n${plainText(drill.prompt)}\n\n**Expected evidence:** ${plainText(drill.expectedOutput)}`).join('\n\n') : 'Practice through the roadmap milestone and preserve the evidence.'}

${reviews.length ? `## Review prompts\n\n${reviews.map((review) => `- ${plainText(review.question)}`).join('\n')}\n` : ''}
${artifacts.length ? `## Build evidence\n\n${artifacts.map((artifact) => `- **${artifact.title}** — ${plainText(artifact.description)}`).join('\n')}\n` : ''}
## Prerequisites

${prerequisites.length ? prerequisites.map((item) => `- [${item.name}](${absolute(conceptUrl(item.id))})`).join('\n') : '- None assigned.'}

## Related concepts

${related.length ? related.map((item) => `- [${item.name}](${absolute(conceptUrl(item.id))})`).join('\n') : '- None assigned.'}

## Learning paths

${roadmaps.length ? roadmaps.map((roadmap) => `- [${roadmap.title}](${absolute(roadmapUrl(roadmap.id))})`).join('\n') : '- No roadmap is assigned yet.'}
`;
}

function changelogMarkdown() {
  return `# SWE Interview Prep changelog

Meaningful improvements to the curriculum, practice loop, and personal learning system.

- [Roadmap](${CHANGELOG_REPOSITORY}/issues)
- [Source](${CHANGELOG_REPOSITORY})

${CHANGELOG_RELEASES.map(
  (release) => `## ${release.date} — ${release.title}

${release.outcomes.map((outcome) => `- ${outcome}`).join('\n')}`
).join('\n\n')}
`;
}

const catalog = catalogData();
writeFileSync(
  join(repoRoot, 'src/data/public-curriculum-summary.json'),
  `${JSON.stringify(
    {
      counts: catalog.counts,
      tracks: TRACKS.map((track) => ({
        id: track.id,
        title: track.title,
        description: track.description,
      })),
    },
    null,
    2
  )}\n`
);
const htmlPaths = [
  '/curriculum/',
  ...TRACKS.map((track) => trackUrl(track.id)),
  ...ROADMAPS.map((roadmap) => roadmapUrl(roadmap.id)),
  ...CONCEPTS.map((concept) => conceptUrl(concept.id)),
];
const systemDesignHtmlPaths = [
  '/system-design/',
  ...APPROVED_SYSTEM_DESIGN_CASES.map(systemDesignGuideUrl),
];

const expectedOutputRoot = join(repoRoot, 'public', 'curriculum');
if (outputDir !== expectedOutputRoot) {
  throw new Error(`Refusing to replace unexpected output directory: ${outputDir}`);
}
const expectedSystemDesignRoot = join(repoRoot, 'public', 'system-design');
if (systemDesignOutputDir !== expectedSystemDesignRoot) {
  throw new Error(
    `Refusing to replace unexpected system-design output directory: ${systemDesignOutputDir}`
  );
}
const cleanGeneratedText = (value) => value.replace(/[ \t]+$/gm, '');
const cleanMarkdown = (value) => `${value.trimEnd()}\n`;
rmSync(outputDir, { recursive: true, force: true });
rmSync(systemDesignOutputDir, { recursive: true, force: true });
mkdirSync(join(outputDir, 'tracks'), { recursive: true });
mkdirSync(join(outputDir, 'roadmaps'), { recursive: true });
mkdirSync(join(outputDir, 'concepts'), { recursive: true });
mkdirSync(systemDesignOutputDir, { recursive: true });

writeFileSync(join(outputDir, 'styles.css'), styles);
writeFileSync(join(outputDir, 'index.html'), cleanGeneratedText(hubPage()));
writeFileSync(join(outputDir, 'index.md'), cleanMarkdown(catalogMarkdown(catalog)));
for (const track of TRACKS) {
  writeFileSync(
    join(outputDir, 'tracks', `${track.id}.html`),
    cleanGeneratedText(trackPage(track))
  );
  writeFileSync(join(outputDir, 'tracks', `${track.id}.md`), cleanMarkdown(trackMarkdown(track)));
}
for (const roadmap of ROADMAPS) {
  writeFileSync(
    join(outputDir, 'roadmaps', `${roadmap.id}.html`),
    cleanGeneratedText(roadmapPage(roadmap))
  );
  writeFileSync(
    join(outputDir, 'roadmaps', `${roadmap.id}.md`),
    cleanMarkdown(roadmapMarkdown(roadmap))
  );
}
for (const concept of CONCEPTS) {
  writeFileSync(
    join(outputDir, 'concepts', `${concept.id}.html`),
    cleanGeneratedText(conceptPage(concept))
  );
  writeFileSync(
    join(outputDir, 'concepts', `${concept.id}.md`),
    cleanMarkdown(conceptMarkdown(concept))
  );
}
writeFileSync(join(outputDir, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
writeFileSync(join(outputDir, 'catalog.md'), catalogMarkdown(catalog));
writeFileSync(
  join(outputDir, 'manifest.json'),
  `${JSON.stringify(
    {
      generated: true,
      counts: catalog.counts,
      htmlPaths,
      markdownPaths: htmlPaths.map(markdownUrl),
    },
    null,
    2
  )}\n`
);

writeFileSync(join(systemDesignOutputDir, 'index.html'), cleanGeneratedText(systemDesignHubPage()));
writeFileSync(join(systemDesignOutputDir, 'index.md'), cleanMarkdown(systemDesignHubMarkdown()));
for (const caseDefinition of APPROVED_SYSTEM_DESIGN_CASES) {
  const guide = caseDefinition.publication.guide;
  writeFileSync(
    join(systemDesignOutputDir, `${guide.slug}.html`),
    cleanGeneratedText(systemDesignGuidePage(caseDefinition))
  );
  writeFileSync(
    join(systemDesignOutputDir, `${guide.slug}.md`),
    cleanMarkdown(systemDesignGuideMarkdown(caseDefinition))
  );
}
writeFileSync(
  join(systemDesignOutputDir, 'catalog.json'),
  `${JSON.stringify(
    {
      generated: true,
      counts: {
        cases: SYSTEM_DESIGN_CASES.length,
        approvedGuides: APPROVED_SYSTEM_DESIGN_CASES.length,
      },
      cases: catalog.systemDesignCases,
    },
    null,
    2
  )}\n`
);
writeFileSync(
  join(systemDesignOutputDir, 'manifest.json'),
  `${JSON.stringify(
    {
      generated: true,
      source: 'src/data/system-design-cases.ts',
      htmlPaths: systemDesignHtmlPaths,
      markdownPaths: systemDesignHtmlPaths.map(markdownUrl),
      approvedCaseIds: APPROVED_SYSTEM_DESIGN_CASES.map((caseDefinition) => caseDefinition.id),
    },
    null,
    2
  )}\n`
);

const baseSitemapPaths = ['/', '/changelog'];
const sitemapPaths = [...new Set([...baseSitemapPaths, ...htmlPaths, ...systemDesignHtmlPaths])];
writeFileSync(
  join(publicDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((path) => `  <url><loc>${escapeHtml(absolute(path))}</loc></url>`).join('\n')}
</urlset>
`
);

writeFileSync(
  join(publicDir, 'llms.txt'),
  `# SWE Interview Prep

> A software engineering learning OS with ${TRACKS.length} tracks, ${CONCEPTS.length} concepts, ${ROADMAPS.length} roadmaps, active drills, build artifacts, and FSRS review.

## Start here

- [Public curriculum](https://learn.significanthobbies.com/curriculum/): Crawlable track, roadmap, and concept pages
- [System-design cases](https://learn.significanthobbies.com/system-design/): Staged interview prompts and approved worked guides
- [10K RPS LLM inference guide](https://learn.significanthobbies.com/system-design/llm-inference-10k-rps): Capacity math, serving architecture, overload, and follow-ups
- [Curriculum catalog](https://learn.significanthobbies.com/curriculum/catalog.md): Complete Markdown inventory
- [Structured curriculum](https://learn.significanthobbies.com/curriculum/catalog.json): JSON inventory with stable IDs
- [Product brief](https://learn.significanthobbies.com/index.md): Product and learning-loop overview
- [Full agent brief](https://learn.significanthobbies.com/llms-full.txt): Tracks and roadmap links
- [Agent catalog](https://learn.significanthobbies.com/api/ai): JSON inventory of public surfaces

## Interactive product

- [Learning app](https://learn.significanthobbies.com/learn): FSRS, drills, Playground, Socratic feedback, and progress
`
);

writeFileSync(
  join(publicDir, 'llms-full.txt'),
  `# SWE Interview Prep — full agent brief

SWE Interview Prep is a mechanism-first learning OS. Its ${CONCEPTS.length} concepts span ${TRACKS.length} tracks and feed ${ROADMAPS.length} sequenced roadmaps. Learning follows Concept → Drill → Build → Review → Apply; private mastery state is not exposed.

## Public machine surfaces

- ${absolute('/llms.txt')}
- ${absolute('/index.md')}
- ${absolute('/curriculum/')}
- ${absolute('/curriculum/catalog.md')}
- ${absolute('/curriculum/catalog.json')}
- ${absolute('/system-design/')}
- ${absolute('/system-design/index.md')}
- ${absolute('/system-design/catalog.json')}
- ${absolute('/api/ai')}
- ${absolute('/sitemap.xml')}
- ${absolute('/robots.txt')}

## Tracks

${TRACKS.map((track) => `- [${track.title}](${absolute(trackUrl(track.id))}) — ${track.description}`).join('\n')}

## Roadmaps

${ROADMAPS.map((roadmap) => `- [${roadmap.title}](${absolute(roadmapUrl(roadmap.id))}) (${roadmap.horizon}) — ${roadmap.goal}`).join('\n')}

## System-design interview cases

${SYSTEM_DESIGN_CASES.map(
  (caseDefinition) =>
    `- [${caseDefinition.title}](${absolute(
      caseDefinition.publication.guide
        ? systemDesignGuideUrl(caseDefinition)
        : systemDesignPracticeUrl(caseDefinition)
    )}) — ${caseDefinition.prompt}`
).join('\n')}

## Product boundary

Public curriculum pages contain editorial explanations, primary resources, practice prompts, and review questions. Progress, notes, saved Reader material, authentication data, and review answers remain private.

## Contact / fleet

- Fleet: https://sassmaker.com
- Agent email for directory verification: sarthakagrawal@agentmail.to
`
);

writeFileSync(
  join(publicDir, 'index.md'),
  `# SWE Interview Prep

Software engineering learning OS with ${TRACKS.length} tracks, ${CONCEPTS.length} concepts, ${ROADMAPS.length} roadmaps, active practice, build artifacts, and FSRS spaced repetition.

## Learning loop

Concept → Drill → Build → Review → Apply. Each concept connects a concise mental model and primary source to executable practice, an explain-back prompt, and evidence you build.

## Curriculum scope

${TRACKS.map((track) => `- [${track.title}](${absolute(trackUrl(track.id))}) — ${track.description}`).join('\n')}

## Browse without JavaScript

- [Curriculum hub](${absolute('/curriculum/')})
- [System-design case library](${absolute('/system-design/')})
- [LLM inference at 10K RPS](${absolute('/system-design/llm-inference-10k-rps')})
- [Complete Markdown catalog](${absolute('/curriculum/catalog.md')})
- [Structured JSON catalog](${absolute('/curriculum/catalog.json')})
- [Agent entrypoint](${absolute('/llms.txt')})

Private progress, notes, review answers, and saved learning sources are intentionally excluded from public surfaces.
`
);

writeFileSync(join(publicDir, 'changelog.md'), cleanMarkdown(changelogMarkdown()));

writeFileSync(
  join(publicDir, 'api-ai.json'),
  `${JSON.stringify(
    {
      name: 'SWE Interview Prep',
      version: '2',
      url: origin,
      llms: absolute('/llms.txt'),
      llmsFull: absolute('/llms-full.txt'),
      sitemap: absolute('/sitemap.xml'),
      robots: absolute('/robots.txt'),
      markdown: { suffix: '.md', negotiation: false },
      curriculum: {
        counts: catalog.counts,
        html: absolute('/curriculum/'),
        markdown: absolute('/curriculum/catalog.md'),
        json: absolute('/curriculum/catalog.json'),
      },
      surfaces: [
        {
          id: 'home',
          url: `${origin}/`,
          md: absolute('/index.md'),
          kind: 'spa',
          description: 'Product home and learning-loop overview',
        },
        {
          id: 'changelog',
          url: absolute('/changelog'),
          md: absolute('/changelog.md'),
          kind: 'static',
          description: 'Verified product releases and outcomes',
        },
        {
          id: 'curriculum',
          url: absolute('/curriculum/'),
          md: absolute('/curriculum/index.md'),
          kind: 'collection',
          description: `${TRACKS.length} tracks, ${CONCEPTS.length} concepts, and ${ROADMAPS.length} roadmaps as static public pages`,
        },
        {
          id: 'system-design',
          url: absolute('/system-design/'),
          md: absolute('/system-design/index.md'),
          kind: 'collection',
          description: `${SYSTEM_DESIGN_CASES.length} staged interview cases and ${APPROVED_SYSTEM_DESIGN_CASES.length} approved worked guide`,
        },
      ],
      dataResources: [
        {
          id: 'curriculum-json',
          url: absolute('/curriculum/catalog.json'),
          description: 'Stable IDs, counts, relationships, and public curriculum URLs',
        },
        {
          id: 'system-design-json',
          url: absolute('/system-design/catalog.json'),
          description:
            'Versioned interview case IDs, practice URLs, guide approvals, and concept mappings',
        },
      ],
      auth: {
        public: true,
        notes:
          'Public curriculum is agent-indexed. Progress, notes, Reader saves, and review answers remain private.',
      },
    },
    null,
    2
  )}\n`
);

writeFileSync(
  join(publicDir, 'robots.txt'),
  `User-agent: *
Allow: /
Allow: /curriculum/
Allow: /system-design/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /index.md
Allow: /api/ai

Sitemap: ${absolute('/sitemap.xml')}
`
);

const indexPath = join(repoRoot, 'index.html');
const indexHtml = readFileSync(indexPath, 'utf8');
const startMarker = '<!-- curriculum-static:start -->';
const endMarker = '<!-- curriculum-static:end -->';
if (!indexHtml.includes(startMarker) || !indexHtml.includes(endMarker)) {
  throw new Error('index.html is missing curriculum-static markers');
}
const trackSummary = TRACKS.map(
  (track) =>
    `<li><strong>${escapeHtml(track.title)}</strong> — ${escapeHtml(track.description)}</li>`
).join('');
const staticContent = `${startMarker}
          <section style="max-width:64rem;margin:0 auto;padding:1rem 1.5rem 5rem;">
            <h1 style="font-size:1.5rem;margin:0 0 1rem;">A complete software engineering learning map</h1>
            <p>Browse ${TRACKS.length} tracks, ${CONCEPTS.length} concepts, and ${ROADMAPS.length} sequenced roadmaps. The curriculum connects systems foundations, infrastructure, distributed systems, databases, search, DSA, AI training and inference, agent reliability, developer tools, applications, and multimodal computing to active practice.</p>
            <h2 style="font-size:1.5rem;margin:2rem 0 1rem;">Learn through evidence, not passive reading</h2>
            <p>Every concept is designed around the same loop: Concept → Drill → Build → Review → Apply. Start with a concise mental model and primary source, test it with an executable exercise, build a measurable artifact, explain the mechanism back, and let FSRS schedule the next review.</p>
            <h2 style="font-size:1.5rem;margin:2rem 0 1rem;">Explore the curriculum</h2>
            <ul>${trackSummary}</ul>
            <p><a href="/curriculum/" style="color:#67e8f9;">Browse the public curriculum</a>, <a href="/system-design/" style="color:#67e8f9;">practice system-design interview cases</a>, or continue as a guest for the interactive learning workspace.</p>
          </section>
          ${endMarker}`;
const updatedIndex = indexHtml.replace(
  new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`),
  staticContent
);
writeFileSync(indexPath, updatedIndex);

console.log('Generated public curriculum', {
  tracks: TRACKS.length,
  roadmaps: ROADMAPS.length,
  concepts: CONCEPTS.length,
  systemDesignCases: SYSTEM_DESIGN_CASES.length,
  systemDesignGuides: APPROVED_SYSTEM_DESIGN_CASES.length,
  htmlPages: htmlPaths.length,
  sitemapUrls: sitemapPaths.length,
});
