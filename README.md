# SWE Interview Prep

A comprehensive interview preparation platform for mastering DSA, Low-Level Design, System Design, and Behavioral interviews.

## Problem

Technical interview preparation is fragmented across multiple tools: LeetCode for coding, Excalidraw for diagrams, ChatGPT for hints, and Anki for spaced repetition. Switching between tools breaks flow and makes it hard to track progress holistically.

SWE Interview Prep consolidates everything into a single platform with integrated code execution, diagram drawing, AI assistance, and spaced repetition review.

## Deployment & External Services

| Concern | Service |
|---------|---------|
| Hosting | Cloudflare Pages (`swe-interview-prep`) + Pages Functions backend (`functions/api/[[path]].js`) |
| Database | Turso (libSQL) |
| Auth | Google One Tap (JWT cookie) |
| File storage | Cloudflare R2 (`swe-interview-prep-assets`) — hosts the Go WASM interpreter |
| Analytics | PostHog (via `local posthog-js wrapper`) |
| AI | Multi-provider via Vercel AI SDK — Anthropic, Google Gemini, OpenAI/DeepSeek |
| CI/CD | GitHub Actions — auto-deploy on push to `main` |

## Features

- **Interactive Code Editor** - Write and run TypeScript code with Monaco Editor (VS Code engine)
- **Visual Design Tool** - Draw system architecture diagrams with Excalidraw integration
- **Multi-Provider AI Hints** - Get Socratic guidance without spoilers from OpenAI, Anthropic, Google Gemini, DeepSeek, or local AI tools
- **Spaced Repetition System** - Review concepts using Anki-style flashcards with SM-2 algorithm
- **LeetCode Import** - Fetch problems directly via LeetCode API
- **Progress Tracking** - Monitor completion rates across DSA, LLD, HLD, and Behavioral categories
- **Pattern-Based Learning** - Group problems by algorithmic patterns (sliding window, two pointers, etc.)

## Architecture

```mermaid
graph TB
    subgraph "Frontend - React 19 + Vite"
        A[React Router] --> B[Pages]
        B --> C[Dashboard]
        B --> D[ProblemView]
        B --> E[AnkiReview]
        B --> F[ImportProblem]

        D --> G[Monaco Editor]
        D --> H[Excalidraw]
        D --> I[AI Chat]

        J[Hooks Layer] --> K[useAI]
        J --> L[useCodeExecution]
        J --> M[useSpacedRepetition]
        J --> N[useProgress]

        O[Contexts] --> P[AuthContext]
        O --> Q[CategoryContext]
    end

    subgraph "Dev AI bridge - in-process (Vite plugin)"
        R[/api/chat] --> S[claude CLI]
        R --> T[codex CLI]
        R --> U[gemini CLI]
    end

    subgraph "Cloudflare Pages Functions + Turso"
        V[Turso libSQL] --> W[problems]
        V --> X[progress]
        V --> Y[notes]
        V --> Z[spaced_repetition]
        AA[Google One Tap] --> AB[JWT Cookie]
    end

    subgraph "External APIs"
        AC[LeetCode API] --> AD[Problem Import]
        AE[OpenAI API]
        AF[Anthropic API]
        AG[Google Gemini API]
    end

    K --> R
    K --> AE
    K --> AF
    K --> AG

    L --> V
    M --> V
    N --> V
    P --> AA

    F --> AC

    style R fill:#f9f,stroke:#333,stroke-width:2px
    style V fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
    style H fill:#bfb,stroke:#333,stroke-width:2px
```

**Key Components:**

- **Frontend**: React 19 SPA with TailwindCSS, Monaco Editor for code, Excalidraw for diagrams
- **Dev AI bridge**: in-process Vite plugin (`vite-plugin-local-ai.js`) streams the claude/codex/gemini CLIs at `/api/chat` so local dev needs no API keys; ships nothing to prod
- **Backend**: Cloudflare Pages Functions handle auth, progress, notes, spaced repetition, and AI endpoints
- **Database**: Turso/libSQL stores problems, user progress, notes, and spaced repetition schedules
- **Auth**: Google One Tap posts credentials to `/api/auth/google`; the server issues an httpOnly JWT cookie
- **External Integrations**: LeetCode API for problem import, multiple AI providers for hints

## Run Steps

### Prerequisites

- Node.js 22+
- pnpm
- Cloudflare account for production deploys
- Turso database for production runtime data

### Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/Significant-Hobbies/swe-interview-prep.git
   cd swe-interview-prep
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```

   Required build-time value:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

   Required runtime values for Cloudflare Pages Functions:
   ```bash
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   JWT_SECRET=your_jwt_secret
   TURSO_DATABASE_URL=libsql://...
   TURSO_AUTH_TOKEN=...
   ```

   Optional AI/provider values can be supplied through the UI per request or via server env fallbacks such as `AI_ENDPOINT_URL`, `AI_API_KEY`, and `AI_MODEL`.

3. **Validate local env**
   ```bash
   pnpm validate:env:build
   pnpm validate:env:runtime
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

   Opens at `http://localhost:5173`. The dev AI bridge runs in-process (no separate server); `/api/chat` streams your logged-in claude/codex/gemini CLIs.

### Production Build

```bash
pnpm build
pnpm preview
```

Production deploys through Cloudflare Pages:

```bash
pnpm deploy
```

The deploy path validates env, builds `dist/`, and runs `wrangler pages deploy dist/ --project-name=swe-interview-prep`. GitHub Actions also validates Cloudflare Pages runtime secret names before deploying.

---

**Tech Stack**: React 19, TypeScript, TailwindCSS, Vite, Cloudflare Pages Functions, Turso/libSQL
**License**: MIT

<!-- ACTIVE-AI-TASK-LOG:START -->
## Active AI Task Log

This section is maintained by the SaaS Maker Active-AI product/design loop so future agents do not reopen duplicate UI tasks.

- Business lane: P0 Can make money
- Rule: do not create another broad "improve the UI" task unless the acceptance criteria differ materially from the tasks listed here.
- Source of truth for task status: SaaS Maker task board. README entries are durable context only.

| Task | Status | Priority | Last known note |
| --- | --- | --- | --- |
| `f6544982` swe-interview-prep: show interview outcome proof in hero | done | medium | 2026-05-27 — updated hero to focus on interview prep, added compact mock interview result |
| `5261150e` swe-interview-prep: make value + proof obvious above the fold | done | high | 2026-05-25 18:52:42 |
| `6b17627a` [fleet-smoke] swe-interview-prep/web analytics endpoint 404 | done | medium | 2026-05-25 17:25:17 |
| `bc1219df` swe-interview-prep: add one-click mock interview proof | done | high | 2026-05-26 — added sample question + feedback preview cards + primary "Start a mock interview" CTA to Login page |
| `6bf51c84` swe-interview-prep: add post-answer feedback sample | done | high | 2026-05-26 — added SampleFeedbackPanel on Mock setup screen (example prompt + answer + 4 rubric score bars + missed patterns); renamed CTA to "Start practice" |
| `d585ad1e` swe-interview-prep: add interview readiness score explainer | done | high | 2026-05-26 — added ScoreExplainerPanel showing per-dimension raises/lowers tips (Clarity, Correctness, Tradeoffs, Communication); shown on setup screen and results screen |
| `97949bda` swe-interview-prep: add weak-topic next-step card | done | medium | 2026-05-26 — added NextStepCard component; shown statically (Tradeoffs/68) in SampleFeedbackPanel and dynamically (lowest-avg dimension) in completed session view; directs user to Practice → Drills |
| `f66caa8c` swe-interview-prep: add role-specific practice picker proof | done | medium | 2026-05-26 — added Login role picker (Frontend / Backend / System design tabs) on landing; each tab swaps a sample question card (prompt + kind + tags); defaults to Backend, no auth required |
| `10c4e62c` swe-interview-prep: add paid mock-interview outcome preview | done | high | 2026-05-26 — added PaidMockPackPreview component on Mock setup screen: hiring signal verdict (Strong Yes / L4–L5), overall readiness score bar, blurred written analysis teaser, pattern gaps list, personalized drill roadmap preview; one full-width CTA button ("Get my mock pack") with click-to-confirm state; no backend/auth/data changes |
<!-- ACTIVE-AI-TASK-LOG:END -->
