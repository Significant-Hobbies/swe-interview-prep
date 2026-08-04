## Why

The learning OS exposes strong individual system-design concepts, but its mock prompts are flat checklists and its inference-serving material is fragmented across several drills. A learner can recognize the vocabulary without proving that they can clarify an ambiguous prompt, perform capacity math, defend an architecture, survive a failure injection, and retain the weak concepts afterward.

The public curriculum is technically search-ready—the live homepage, curriculum hub, and inference-engine page pass the current on-page SEO audit—but it does not own the high-intent “system design interview” queries represented by these cases. The same reviewed case definitions should therefore power both deliberate practice and substantive, indexable study guides without duplicating claims or creating thin SEO pages.

## What Changes

- Replace the flat `MockPrompt` model for system design with versioned case definitions containing requirements, stages, calculation anchors, rubric dimensions, deterministic follow-ups, failure injections, concept mappings, sources, and remediation targets.
- Ship a first high-quality library of eight common cases:
  - LLM inference serving at 10,000 requests/second
  - production RAG over a large document corpus
  - multi-tenant LLM API gateway
  - real-time recommendation system
  - URL shortener
  - distributed rate limiter
  - real-time chat
  - ranked news feed
- Add a deterministic interview-session reducer covering scoping, estimation, high-level design, deep dive, failure injection, and review. The LLM may phrase or grade responses, but cannot invent requirements, scoring anchors, or canonical facts.
- Replace binary rubric self-checks with evidence-backed dimension scores and expose the existing stronger-answer and follow-up output.
- Map missed rubric dimensions to individual concept mastery and targeted drills instead of updating every concept attached to the case equally.
- Generate a public case-library hub and substantive study guides from the same canonical definitions. The first publication slice includes the flagship 10,000-RPS LLM inference guide; later case guides require their own source-backed content preview rather than shipping thin templated pages. Published guides include a worked approach, calculations, architecture reasoning, common mistakes, failure scenarios, primary sources, internal links, and structured data.
- Add the hub and guides to sitemap, Markdown/agent surfaces, canonical navigation, and public-curriculum integrity checks while keeping their search intent distinct from concept pages.
- Preserve the existing Socratic no-direct-solutions constraint inside active practice; complete reference answers appear only after submission or explicit review.

## Capabilities

### New Capabilities

- `structured-system-design-practice`: Versioned common interview cases, deterministic staged attempts, evidence-backed grading, failure injection, and concept-level remediation.
- `system-design-study-guides`: Source-backed public guides generated from canonical case definitions with unique worked examples and non-overlapping search intent.

### Modified Capabilities

- `public-curriculum-discovery`: Extend public discovery, sitemap, structured data, and agent-readable catalogs to cover system-design case hubs and guides.

## Impact

- Affected data and UI: `src/data/mock-prompts.ts` or its replacement, `src/pages/MockInterview.tsx`, recommendation/mastery mapping, and focused tests.
- Affected AI boundary: `handlers/critique.mjs` response schema and Mock rendering; existing BYOK/provider infrastructure remains unchanged.
- Affected public generation: `scripts/generate-public-curriculum.mjs`, sitemap, public Markdown/JSON catalogs, and static HTML pages.
- Persistence: local versioned attempts in the first slice; no D1 migration or new production dependency is required. Cross-device persistence remains a separately reviewed additive change.
- SEO: no deployment is part of this change. Publishing remains subject to content-preview approval, build validation, and the existing manual deploy boundary.
