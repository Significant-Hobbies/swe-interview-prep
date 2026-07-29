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
| `/learn`, `/learn/all` | Roadmap journey + concepts (18 tracks) |
| `/explore` | Concept/roadmap explorer |
| `/sweep`, `/sweep?domain=<tag>` | Breadth triage — rate every concept Known/Fuzzy/New; ROI ranking + domain muting. Reachable from `/learn`, deliberately not in `SITE_NAV_ITEMS`; open follow-up lives in [GitHub Issues](https://github.com/Significant-Hobbies/swe-interview-prep/issues) |
| `/practice`, `/practice/all` | Drills + spaced-repetition reviews |
| `/playground` | Monaco + Excalidraw build sandbox |
| `/mock` | Timed mock interview |
| `/progress`, `/progress/all` | Mastery rollups + notes |
| `/build`, `/drills/:id` | BuildLab (hands-on build/drill workspace) |
| `/library`, `/library/:repoSlug` | Embedded GitHub learning-library reader |
| `/sources`, `/sources/:id` | Unified learning-sources index |
| `/session/:date`, `/session/:date/:sessionId` | Adaptive learning session |
| `/learning`, `/learning/:slug` | In-product learning roadmap markdown (served from `docs/learning/`) |
| `/concepts/:id`, `/learn/:id` | Concept detail |
| `/roadmaps/:id` | Roadmap detail |
| `/projects/:id` | Project detail |
| `/share/roadmaps/:id` | Public shared roadmap |
| `/onboarding`, `/about`, `/privacy` | Static |
| `/login` | Product pitch page. Reachable, but **not** a gate — see below |

There is no `/build-lab` route.

## Access

**Every route above is open.** A visitor with no session is placed into guest
mode and lands on `/today`; nothing asks them to sign in first. Signing in buys
exactly one thing — progress that outlives the browser — so it appears as an
upgrade in the header, and as a strip that surfaces only once a guest has
progress worth losing.

Guest state is localStorage-only and namespaced per account, so signing in
adopts a guest pass rather than discarding it.

**Guests make no authenticated API calls.** Every `AUTH_ACTIONS` request goes
through `src/lib/learningApi.ts`, which skips the call and resolves `null` when
there is no session — such a request could only ever 401, and its result is
discarded anyway. The client reads the auth/public split from
`shared/api/learning-registry.mjs`, the same list the server enforces, so
adding an action gates the client automatically.

The only request a guest makes is one `GET /api/auth/verify` on their first
load, which is how the app discovers there is no session. It is not repeated.

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
`progress`, `learning`, `auth/*`) are **not** deployed by the Cloudflare Pages
Function. They exist for local-dev parity; in dev the Vite bridge
(`vite-plugin-local-ai.js`) serves `/api/chat`, `/api/chats`, `/api/notes`,
`/api/progress`, `/api/auth/*` and `/api/health` as stubs.

`/api/ai/chat` is the exception in the other direction: it is served **only**
by the Pages Function, so in dev it falls through the bridge and 404s. See
[`../development/setup.md`](../development/setup.md).

## Machine / agent surfaces

These exist so crawlers and coding agents can read the product without JS:

| URL | Format |
| --- | --- |
| `/curriculum/` | Public HTML curriculum hub |
| `/curriculum/tracks/:id.html` | Crawlable track page |
| `/curriculum/roadmaps/:id.html` | Crawlable roadmap page |
| `/curriculum/concepts/:id.html` | Crawlable concept guide |
| `/curriculum/catalog.md` | Complete curriculum as Markdown |
| `/curriculum/catalog.json` | Structured curriculum inventory |
| `/llms.txt` | LLM index (curated) |
| `/llms-full.txt` | Full LLM index |
| `/index.md` | Homepage as markdown |
| `/api/ai` | JSON inventory of public surfaces |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | Sitemap |

Source: canonical curriculum data projected by
`scripts/generate-public-curriculum.mjs` into `public/curriculum/`,
`public/llms.txt`, `public/llms-full.txt`, `public/index.md`,
`public/api-ai.json`, `public/robots.txt`, and `public/sitemap.xml`.

## Owner-only surfaces

Only one remains: the Reader adapter (`GET /api/learning/reader`), which
proxies a private token and requires the configured owner Google account.

`/sources`, `/session/:date/:sessionId`, and `/library` used to sit behind the
same gate and no longer do. Nothing they render is personal — the sources feed
and library content are generated and vendored files committed to the repo, and
session progress is local until you sign in. Gating them only hid public
material behind a login.
