# SEO audit: system-design interview coverage

Audit date: 2026-08-04

## Outcome

The sampled live pages have excellent technical and on-page SEO. The current weakness is content strategy: the public site exposes a broad curriculum but has no dedicated page that answers a concrete, high-intent system-design interview prompt such as “design LLM inference for 10K requests per second.”

| Area | Assessment | Evidence |
| --- | --- | --- |
| Crawlability and indexability | 10/10 | Live robots, sitemap, canonical URLs, JavaScript-free public pages, and agent surfaces all passed the audit scripts. |
| Page metadata and semantics | 10/10 | Homepage, curriculum hub, and inference-engine concept page passed title, description, canonical, social metadata, JSON-LD, heading, and substantive-copy checks with no warnings. |
| Internal public corpus | 8/10 | The inventory contains hundreds of generated curriculum pages and strong concept coverage. Navigation is mechanism-first rather than interview-query-first. |
| High-intent system-design coverage | 4/10 | No case hub or dedicated worked guide currently targets the exact prompt, calculations, failure follow-ups, and answer structure searchers want. |
| Overall SEO readiness for this feature | 7/10 | The publishing foundation is strong; content-market fit is the missing layer. |

This score is not a claim about current rankings or organic traffic. Search Console and analytics data were not available in this audit, so performance in search results remains unverified.

## Sampled live results

- `/`: 18 checks passed; 0 failures; 0 warnings. The page had a 50-character title, 142-character description, canonical URL, social tags, JSON-LD, one H1, useful H2s, and roughly 725 words.
- `/curriculum/`: 15 checks passed; 0 failures; 0 warnings; roughly 1,481 words.
- `/curriculum/concepts/inference-engines`: 15 checks passed; 0 failures; 0 warnings; roughly 622 words.
- Content inventory: 693 public pages were detected, but 681 fell into the generic `other` archetype and no explicit interview-intent coverage set was detected.

## Search landscape

Current results already contain dedicated LLM system-design guides from System Design Interview, System Design Academy, CalibreOS, DesignGurus, and System Design Handbook. The opportunity is not an empty keyword; the page must win by being more concrete, more measurable, and connected to an actual deliberate-practice loop.

An exact version of the prompt also appears in a public interview-experience result. That is useful evidence that “10K requests/second” is a real interview formulation, not only an invented editorial keyword.

## Recommended content position

Do not publish another generic “LLM system design” summary. Publish a worked interview case that:

1. begins by challenging the ambiguity of RPS for autoregressive generation;
2. converts traffic into input tokens/second, output tokens/second, and concurrent sequences;
3. sizes capacity from a reproducible benchmark at the target SLO rather than a hard-coded GPU claim;
4. handles admission, continuous batching, KV-cache pressure, cancellation, overload, and regional failure;
5. ends with an answer outline, common mistakes, harder follow-ups, and a closed-book practice entrypoint.

That content has distinct intent from the existing inference-engine concept page: the concept page explains mechanisms, while the case guide demonstrates how to assemble and defend them under interview constraints.

## Post-implementation local verification

The generated production artifacts were served locally from `dist/` and audited on 2026-08-04 with the Fleet on-page SEO audit.

- `/system-design/`: 17 checks passed, 0 failures, and 1 intentional warning. The page has a 44-character title, 145-character description, production canonical URL, social metadata, CollectionPage and BreadcrumbList structured data, one H1, three H2s, and roughly 659 words.
- `/system-design/llm-inference-10k-rps.html`: 15 checks passed, 0 failures, and 0 warnings. The guide has a 42-character title, 136-character description, production canonical URL, social metadata, Article and BreadcrumbList structured data, one H1, twelve H2s, and roughly 1,730 words.
- The single warning is expected in local verification: the audit compared the temporary `127.0.0.1` URL to a sitemap containing production canonical URLs. Both production canonical URLs are present in the generated `public/sitemap.xml` and `dist/sitemap.xml`.
- Search ranking and traffic remain unverified until the pages are deployed and observed in Search Console and analytics.
