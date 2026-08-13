# Product Surfaces

Inventory of user-facing routes and API endpoints. Implementation source of
truth is `src/App.tsx` (routes) and `functions/api/[[path]].js` + `handlers/`
(API). This page exists to give operators and agents a single map; if it
disagrees with code, code wins.

## Primary routes

| Route | Surface |
| --- | --- |
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Resume hub: recent destinations, current/next learning and practice, paths, and supporting progress |
| `/today` | Legacy redirect to `/dashboard` |
| `/learn`, `/learn/all` | Searchable high-level learning entry plus the complete concept catalogue |
| `/explore` | Concept/roadmap explorer |
| `/sweep`, `/sweep?domain=<tag>` | Breadth triage — rate every concept Known/Fuzzy/New; ROI ranking + domain muting. Reachable from `/learn`, deliberately not in `SITE_NAV_ITEMS`; open follow-up lives in [GitHub Issues](https://github.com/Significant-Hobbies/swe-interview-prep/issues) |
| `/practice` | Playground workspace with a selector over the complete canonical problem inventory |
| `/practice/all` | Complete drill catalogue and spaced-repetition reviews |
| `/playground` | Stable alias for the same Playground workspace |
| `/mock` | Timed mock interview |
| `/wars` | Play-first Software Wars hub; ratings, launch status, leaderboard, and history are progressively disclosed |
| `/wars/blitz` | Timed objective battle setup, match, result, and remediation |
| `/wars/tradeoff`, `/wars/tradeoff/:matchId` | Tradeoff preview or authenticated live workbench |
| `/wars/challenge/:token` | Sanitized public challenge preview |
| `/wars/results/:slug` | Sanitized public match result |
| `/progress`, `/progress/all` | Mastery rollups + notes |
| `/build`, `/drills/:id` | BuildLab (hands-on build/drill workspace) |
| `/labs`, `/labs/:labId` | Systems Lab catalog + configuration workshop + deterministic scenario runner |
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

## Navigation and focus

The shared primary hierarchy is **Dashboard, Learn, Practice, Wars**.
Dashboard resumes the learning loop, Learn provides search plus high-level path
discovery, Practice is the existing Playground with a full problem selector,
and Wars presents the one-minute and thirty-minute competitive formats.
Progress, Mock, Build Lab, Systems Labs, the public curriculum, complete
catalogues, sources, projects, and notes retain their existing URLs and remain
visible through contextual links or Browse.

The entry surfaces may be concise, but canonical inventory may not become
search-only, hidden, or coupled to a particular presentation. Stable detail
links, browse-all routes, generated catalogues, and public curriculum output
are part of the product contract.

Active `/practice`, `/playground`, `/drills/:id`, `/labs/:labId`, `/wars/blitz*`, and
`/wars/tradeoff*` routes use the focused shell. It retains product identity,
settings/account access, keyboard navigation, and a visible exit, while hiding
the digest, setup/storage strips, and feedback trigger until the learner exits
the session.

## Access

**Every route above is open.** A visitor with no session is placed into guest
mode and lands on `/dashboard`; nothing asks them to sign in first. Signing in buys
durable learning and competitive state — so it appears as an
upgrade in the header, and as a strip that surfaces only once a guest has
progress worth losing.

Guest state is localStorage-only and namespaced per account, so signing in
adopts a guest pass rather than discarding it.

Systems Lab attempts are also account-scoped in localStorage. A guest may
repair the bounded infrastructure configuration, predict, run, inspect
evidence, retry, and draft an explanation. The attempt stays labeled
mastery-pending until the configuration passes and an authenticated Feynman
grade is accepted; clicking through or guessing never writes FSRS credit. The
configuration validator and simulation make no API request.

**Guests make no authenticated API calls.** Every `AUTH_ACTIONS` request goes
through `src/lib/learningApi.ts`, which skips the call and resolves `null` when
there is no session — such a request could only ever 401, and its result is
discarded anyway. The client reads the auth/public split from
`shared/api/learning-registry.mjs`, the same list the server enforces, so
adding an action gates the client automatically.

The only request a guest makes is one `GET /api/auth/verify` on their first
load, which is how the app discovers there is no session. It is not repeated.

Software Wars is the exception to that older learning-only request rule.
Guests may read public launch status, leaderboards, challenge previews, and
public results. Guest battles are local unranked previews and do not write Elo
or FSRS state. Ranked matches, history, ratings, challenge writes, Tradeoff
artifacts, media credentials, consent, and reports require authentication.

### Legacy redirects

Listed in `src/App.tsx`: `/today` → `/dashboard`; `/roadmaps` → `/learn`;
`/concepts` → `/learn/all`; `/drills` → `/practice/all`; `/reviews`, `/review` →
`/practice/all?tab=reviews`; `/projects` → `/progress/all`; `/notes` →
`/progress/all?tab=notes`; `/vibe-learning` → `/playground`. Unknown paths
(`*`) fall back to `/dashboard`.

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
| `GET /api/wars/status` | Launch gates and validated content counts | — |
| `GET /api/wars/leaderboard/:mode` | Sanitized mode leaderboard | — |
| `GET /api/wars/results/:slug` | Sanitized public result | — |
| `GET /api/wars/challenges/:token` | Sanitized challenge preview | — |
| `GET /api/wars/ratings`, `GET /api/wars/history` | Private competitive profile | JWT |
| `/api/wars/blitz/matches/*` | Create, resume, answer, finalize, report, and share Blitz matches | JWT |
| `/api/wars/tradeoff/matches/*` | Schedule, check in, save/reveal artifacts, issue media credentials, record consent, vote, report, and read/share participant results | JWT |
| `POST /api/wars/challenges` | Create an opaque challenge link | JWT |
| `POST /api/wars/provider/realtimekit/webhook` | Provider lifecycle events | RealtimeKit signature |

`/api/learning?action=…` actions (`shared/api/learning-registry.mjs`):
public (no user auth) `gaps`, `critique`, `understanding`, `tag`;
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

Wars local UI work uses the explicit browser-only unranked preview when the
Pages API is unavailable. API verification uses `pnpm dev:pages` with isolated
local D1; the separate realtime Worker uses `pnpm dev:wars-worker`. Preview
questions are not used in ranked matches.

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
