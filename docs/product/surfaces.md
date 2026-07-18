# Product Surfaces

Inventory of user-facing routes and API endpoints. Implementation source of
truth is `src/App.tsx` (routes) and `functions/api/[[path]].js` + `handlers/`
(API). This page exists to give operators and agents a single map; if it
disagrees with code, code wins.

## Primary routes

| Route | Surface |
| --- | --- |
| `/` | Redirects to `/today` |
| `/today` | Home / daily session hub |
| `/learn`, `/learn/all` | Roadmap journey + concepts (9 tracks) |
| `/explore` | Concept/roadmap explorer |
| `/practice`, `/practice/all` | Drills + spaced-repetition reviews |
| `/playground` | Monaco + Excalidraw build sandbox |
| `/mock` | Timed mock interview |
| `/progress`, `/progress/all` | Mastery rollups + notes |
| `/build`, `/drills/:id` | BuildLab (hands-on build/drill workspace) |
| `/library`, `/library/:repoSlug` | Embedded GitHub learning-library reader (owner-only) |
| `/sources`, `/sources/:id` | Unified learning-sources index (owner-only) |
| `/session/:date`, `/session/:date/:sessionId` | Adaptive learning session (owner-only) |
| `/learning`, `/learning/:slug` | In-product learning roadmap markdown (served from `docs/learning/`) |
| `/concepts/:id`, `/learn/:id` | Concept detail |
| `/roadmaps/:id` | Roadmap detail |
| `/projects/:id` | Project detail |
| `/share/roadmaps/:id` | Public shared roadmap |
| `/onboarding`, `/about`, `/privacy` | Static |

There is no `/login` or `/build-lab` route.

### Legacy redirects

Listed in `src/App.tsx`: `/dashboard` → `/today`; `/roadmaps` → `/learn`;
`/concepts` → `/learn/all`; `/drills` → `/practice`; `/reviews`, `/review` →
`/practice/all?tab=reviews`; `/projects` → `/progress/all`; `/notes` →
`/progress/all?tab=notes`; `/vibe-learning` → `/playground`. Unknown paths
(`*`) fall back to `/today`.

## API surface

### Production (Pages Functions)

The production Pages Function `functions/api/[[path]].js` serves only this
route set (anything else returns `404 API route not found`):

| Endpoint | Purpose | Auth |
| --- | --- | --- |
| `POST /api/auth/google` | Verify Google credential, issue httpOnly JWT cookie | — |
| `POST /api/auth/logout` | Clear the auth cookie | — |
| `GET /api/auth/verify` | Verify JWT | JWT |
| `GET /api/progress` | Progress rollups | JWT |
| `GET/POST /api/learning?action=…` | Consolidated learning API (see actions below) | JWT for auth actions |
| `GET /api/learning/reader` | Private Reader adapter proxy | Owner |
| `GET /api/ai` | Public agent catalog (JSON) | — |

`/api/learning?action=…` actions (`shared/api/learning-registry.mjs`):
public (no Turso auth) `gaps`, `critique`, `understanding`, `tag`;
auth-required `activity`, `concepts`, `feynman`, `weekly`, `artifacts`,
`drills`, `projects`, `notes`, `profile`, `review-mastery`, `elo`,
`imported-reviews`.

### Dev / legacy handlers (`api/*.mjs`)

The Vercel-style `api/*.mjs` handlers (`chat`, `chats`, `notes`, `problems`,
`go-run`, `progress`, `learning`, `auth/*`) are **not** deployed by the
Cloudflare Pages Function. They exist for local-dev parity; in dev the Vite
bridge (`vite-plugin-local-ai.js`) serves `/api/chat`, `/api/chats`,
`/api/notes`, `/api/progress`, `/api/auth/*` and `/api/health` as stubs. The
client still calls `/api/chat`, `/api/go-run`, and `/api/ai/chat`; in
production those paths are not backed by the Pages Function (Go still runs
because it falls back to the client-side WASM interpreter). See
[`../development/setup.md`](../development/setup.md).

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
