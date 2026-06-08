# Project Recommendation Context

Generated: 2026-06-06T21:14:19.627Z

This file is a CodeVetter Repo Unpacked-inspired audit written for Starboard recommendations. It is intentionally local, evidence-oriented, and safe to commit: it records product context, feature areas, stack inventory, and recommendation guidance without secrets or environment values.

## Project Identity

- Slug: `swe-interview-prep`
- Registry description: Interview Coder — Software engineering interview prep.
- Product grouping: `public-ready`
- Source path: `swe-interview-prep`

## Product Context

Interview Coder — Software engineering interview prep.

Interview Coder is an interview-prep app for DSA, low-level design, system design, and behavioral preparation. It combines a code editor, diagramming, AI hints, spaced repetition, LeetCode import, and progress tracking.

Interview Coder A comprehensive interview preparation platform for mastering DSA, Low-Level Design, System Design, and Behavioral interviews. Problem Technical interview preparation is fragmented across multiple tools: LeetCode for coding, Excalidraw for diagrams, ChatGPT for hints, and Anki for spaced repetition. Switching between tools breaks flow and makes it hard to track progress holistically. Interview Coder consolidates everything into a single platform with integrated code execution, diagram drawing, AI assistance, and spaced repetition review. Deployment & External Services Concern Service --------- --------- Hosting Cloudflare Pages swe-interview-prep + Pages Functions backend func

## Feature Map

- **UI workflows**: Dashboards, tables, forms, component systems, charts, and user workflows. Keywords: ui, ux, dashboard, table, component, react, next, tailwind.
- **Cloudflare and deploy**: Workers, Pages, edge runtime, queues, storage, and deploy automation. Keywords: cloudflare, worker, workers, pages, edge, deploy, wrangler, queue.
- **AI agents**: Agents, tool use, workflows, orchestration, RAG, evals, and model integration. Keywords: ai, agent, agents, llm, rag, embedding, eval, model.
- **Database and storage**: SQL, document storage, migrations, cache, queues, vectors, and persistence. Keywords: database, db, sql, sqlite, postgres, turso, libsql, drizzle.
- **Testing and quality**: Unit tests, browser tests, evals, CI quality gates, and regression checks. Keywords: test, testing, quality, vitest, playwright, ci, eval, benchmark.
- **Content and media**: Content production, video, reels, documents, markdown, and publishing workflows. Keywords: content, media, video, reel, markdown, document, publish, editor.
- **Auth and identity**: Auth, OAuth, sessions, users, permissions, and account flows. Keywords: auth, oauth, identity, session, user, permission, login, nextauth.

## Runtime Surfaces and Entrypoints

- `src/App.tsx`
- `src/main.tsx`
- `src/pages/About.tsx`
- `src/pages/BuildLab.tsx`
- `src/pages/ConceptDetail.tsx`
- `src/pages/Learn.tsx`
- `src/pages/Login.tsx`
- `src/pages/MockInterview.tsx`
- `src/pages/Playground.tsx`
- `src/pages/Practice.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Progress.tsx`
- `src/pages/ProjectDetail.tsx`
- `src/pages/RoadmapDetail.tsx`
- `src/pages/partials/ConceptNotes.tsx`
- `src/pages/partials/GapAnalyzer.tsx`

## Current Stack

- Languages: `TypeScript`
- Frameworks/tools: `Cloudflare Workers`, `Playwright`, `React`, `Tailwind CSS`, `Vitest`
- Config files:
- `playwright.config.ts`
- `vite.config.js`
- `vitest.config.ts`
- `wrangler.toml`

## OSS Already In Use

Direct dependencies:
- `@ai-sdk/anthropic`
- `@ai-sdk/google`
- `@ai-sdk/openai`
- `@ai-sdk/openai-compatible`
- `@excalidraw/excalidraw`
- `@libsql/client`
- `@monaco-editor/react`
- `@saas-maker/changelog-widget`
- `@saas-maker/feedback`
- `@saas-maker/testimonials`
- `ai`
- `cors`
- `express`
- `google-auth-library`
- `highlight.js`
- `jsonwebtoken`
- `lucide-react`
- `lz-string`
- `posthog-js`
- `prettier`
- `react`
- `react-dom`
- `react-markdown`
- `react-resizable-panels`
- `react-router-dom`
- `rehype-highlight`
- `remark-gfm`
- `sucrase`
- `ts-fsrs`

Development dependencies:
- `@eslint/js`
- `@playwright/test`
- `@saas-maker/eslint-config`
- `@saas-maker/prettier-config`
- `@saas-maker/test-config`
- `@saas-maker/tsconfig`
- `@tailwindcss/vite`
- `@types/lz-string`
- `@types/react`
- `@types/react-dom`
- `@vercel/node`
- `@vitejs/plugin-react`
- `@vitest/ui`
- `eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `happy-dom`
- `husky`
- `lightningcss`
- `tailwindcss`
- `typescript`
- `vite`
- `vitest`
- `wrangler`

Package scripts:
- `build`
- `build-concept-index`
- `deploy`
- `dev`
- `dev:frontend`
- `fetch-library`
- `lint`
- `prepare`
- `preview`
- `server`
- `server:ensure`
- `start`
- `test`
- `test:e2e`
- `test:watch`
- `typecheck`
- `validate:env:build`
- `validate:env:deploy`
- `validate:env:runtime`

## Testing and Quality Signals

- `playwright.config.ts`
- `shared/lib/ai.test.mjs`
- `shared/lib/heuristics.test.mjs`
- `src/data/concepts.test.ts`
- `src/lib/fsrs.test.ts`
- `src/lib/mockInterview.test.ts`
- `src/lib/userStore.test.ts`
- `tests/e2e/mobile.spec.ts`
- `tests/e2e/smoke.spec.ts`
- `vitest.config.ts`

## Recommendation Guidance

Good matches:
- Repos that strengthen ui workflows without replacing already-installed libraries.
- Repos that strengthen cloudflare and deploy without replacing already-installed libraries.
- Repos that strengthen ai agents without replacing already-installed libraries.
- Repos that strengthen database and storage without replacing already-installed libraries.
- Repos that strengthen testing and quality without replacing already-installed libraries.
- Repos that strengthen content and media without replacing already-installed libraries.
- Repos that strengthen auth and identity without replacing already-installed libraries.
- Tools with concrete support for pages, src, google, interview, api, cloudflare, swe-interview-prep, server.
- Implementation repos, SDKs, CLIs, testing utilities, adapters, and focused libraries are higher value than generic awesome lists.

Avoid recommending:
- Do not recommend packages already listed under direct or development dependencies unless the task is migration research.
- Do not recommend broad framework replacements unless the project context explicitly calls for a rewrite.
- Downrank curated lists, archived repos, stale demos, and generic UI kits that do not map to the feature catalog.

## Evidence Read

Primary docs and handoff files:
- `AGENTS.md`
- `PROJECT_STATUS.md`
- `README.md`
- `docs/AI_CODING_PROMPTS_TEMPLATES.md`
- `docs/AI_DEVELOPMENT_RECOMMENDATIONS.md`
- `docs/QUICK_REFERENCE_CHEATSHEET.md`
- `docs/README.md`
- `docs/README_START_HERE.md`
- `docs/RESEARCH_SUMMARY.md`
- `docs/TINYGPT_LEARNING_PATH.md`
- `docs/WEEK1_BUILD_PLAN.md`
- `docs/competitive-analysis.md`
- `docs/mock-interview-tts-research.md`
- `docs/resume-feature-research.md`

Package manifests:
- `package.json`
- `server/package.json`

Inventory notes:
- Files scanned: 231
- This pass uses deterministic repo inventory plus local documentation/source-path evidence. It does not claim a full manual line-by-line review of every source file.

## Confidence

Confidence: **high**

Why:
- PROJECT_STATUS.md present
- README.md present
- 16 entrypoint/runtime files identified
- package dependencies inventoried
- 10 test/quality files identified

Refresh command:

```bash
cd /Users/sarthak/Desktop/fleet/starboard
pnpm fleet:audit-recommendation-context
pnpm fleet:extract-projects
```
