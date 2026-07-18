# Product Surfaces

Inventory of user-facing routes and API endpoints. Implementation source of
truth is `src/App.tsx` (routes) and `functions/api/[[path]].js` + `handlers/`
(API). This page exists to give operators and agents a single map; if it
disagrees with code, code wins.

## Primary routes

| Route | Surface |
| --- | --- |
| `/` | Dashboard / study hub |
| `/learn` | Roadmap journey + concepts (8 tracks) |
| `/practice` | Drills + spaced-repetition reviews |
| `/playground` | Monaco + Excalidraw build sandbox |
| `/mock` | Timed mock interview |
| `/progress` | Mastery rollups + notes |
| `/build-lab` | Hands-on build exercises |
| `/library` | Embedded GitHub learning-library reader (owner-only) |
| `/sources` | Unified learning-sources index (owner-only) |
| `/session/:date/:sessionId` | Adaptive 30-minute learning session (owner-only) |
| `/learning/:slug` | In-product learning roadmap markdown (served from `docs/learning/`) |
| `/concepts/:id` | Concept detail |
| `/roadmaps/:id` | Roadmap detail |
| `/projects/:id` | Project detail |
| `/drills/:id` | Drill detail |
| `/login`, `/about`, `/privacy` | Static |

### Legacy redirects

`/today`, `/dashboard`, `/roadmaps`, `/concepts` → `/learn`; `/drills`,
`/reviews`, `/review` → `/practice`; `/build`, `/vibe-learning` →
`/playground`; `/projects`, `/notes` → `/progress`. Listed in `src/App.tsx`.

## API surface (Pages Functions)

All `/api/*` routes are served in production by `functions/api/[[path]].js`,
which routes to the handlers in `handlers/` and `api/`. Local dev uses the
in-process Vite AI bridge for `/api/chat` plus in-memory stubs (see
[`../development/setup.md`](../development/setup.md)).

| Endpoint | Purpose | Auth |
| --- | --- | --- |
| `POST /api/auth/google` | Verify Google credential, issue httpOnly JWT cookie | — |
| `GET /api/auth/verify` | Verify JWT | JWT |
| `POST /api/chat` | Streaming multi-provider AI hints (Socratic) | Required |
| `GET/POST/DELETE /api/chats` | Per-problem chat history | JWT |
| `GET/POST /api/notes` | Per-problem notes | JWT |
| `GET/POST /api/problems` | Imported (LeetCode) problems | JWT |
| `GET /api/progress` | Progress rollups | JWT |
| `GET/POST /api/learning` | Multi-action: `artifacts`, `drills`, `projects`, `notes`, `concepts`, `gaps` | JWT (owner-only for some actions) |
| `POST /api/go-run` | Go WASM code execution proxy | Required |
| `POST /api/tag` | AI auto-tagging of stable Playground code | JWT |
| `GET /api/ai` | Public agent catalog (JSON) | — |
| `/api/learning/reader` | Private Reader adapter proxy | Owner |

The `/api/learning?action=…` consolidation keeps the serverless API surface
small. Actions: `artifacts`, `drills`, `projects`, `notes`, `concepts`,
`gaps`, plus the owner-only learning-source and session actions.

## Machine / agent surfaces

These exist so crawlers and coding agents can read the product without JS:

| URL | Format |
| --- | --- |
| `/llms.txt` | LLM index (curated) |
| `/llms-full.txt` | Full LLM index |
| `/index.md` | Homepage as markdown |
| `/api/ai` | JSON inventory of public surfaces |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | Sitemap |

Source: `public/llms.txt`, `public/llms-full.txt`, `public/index.md`,
`public/api-ai.json`, `public/robots.txt`, `public/sitemap.xml`.

## Owner-only surfaces

`/sources`, `/session/:date/:sessionId`, `/library`, and the Reader adapter
require the configured owner Google account. This is a personal-use product;
these surfaces are not advertised publicly.
