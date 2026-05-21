export interface FoundationConcept {
  name: string;
  why: string;
  drill: string;
}

export interface RuntimeLayer {
  name: string;
  questions: string[];
  learn: string[];
  build: string;
  prove: string;
}

export interface RuntimeRoadmap {
  id: 'javascript' | 'python' | 'go' | 'rust';
  name: string;
  philosophy: string;
  runtimeModel: string;
  memoryModel: string;
  concurrencyModel: string;
  packaging: string;
  deployment: string;
  mustUnderstand: string[];
  thenLearn: string[];
  builds: string[];
  checklist: string[];
  traps: string[];
  layerPlan: RuntimeLayer[];
}

export interface PersonalRoadmapNode {
  title: string;
  whyForYou: string;
  learn: string[];
  proof: string;
  lane:
    | 'foundation'
    | 'typescript'
    | 'python'
    | 'go'
    | 'rust'
    | 'production'
    | 'database'
    | 'data'
    | 'infra'
    | 'devops';
  status: 'now' | 'next' | 'later' | 'defer';
  prompt: string;
}

export interface PersonalRoadmapPhase {
  id: string;
  title: string;
  goal: string;
  nodes: PersonalRoadmapNode[];
}

export const PERSONAL_RUNTIME_TRACK: PersonalRoadmapPhase[] = [
  {
    id: 'runtime-basics',
    title: '0. Runtime Foundations',
    goal: 'Stop memorizing framework behavior; predict why code blocks, leaks, crashes, or scales.',
    nodes: [
      {
        title: 'Process, thread, task, worker',
        whyForYou:
          'You bounce between Vite apps, Workers, local AI proxies, and backend scripts. This is the base model for every debugging session.',
        learn: ['process lifecycle', 'threads vs tasks', 'signals', 'worker isolation'],
        proof: 'Run one CPU-bound and one I/O-bound workload in JS, Python, and Go; write when each blocks.',
        lane: 'foundation',
        status: 'now',
        prompt:
          'Create a comparison note for process vs thread vs task vs worker using JS, Python, and Go examples. Include one blocking and one non-blocking workload.',
      },
      {
        title: 'Blocking I/O, async, and backpressure',
        whyForYou:
          'Most fleet bugs are not syntax problems; they are stale fetches, slow APIs, stuck streams, retries, or overloaded clients.',
        learn: ['event loop', 'async I/O', 'timeouts', 'stream backpressure'],
        proof: 'Build a URL fetcher with bounded concurrency, cancellation, and slow-response handling.',
        lane: 'foundation',
        status: 'now',
        prompt:
          'Build a bounded-concurrency URL fetcher with timeout, cancellation, retry policy, and slow-response logging. Explain backpressure.',
      },
      {
        title: 'Memory and allocation model',
        whyForYou:
          'This is what separates “works locally” from diagnosing Worker limits, browser leaks, large JSON payloads, and Rust ownership.',
        learn: ['stack vs heap', 'GC roots', 'retained references', 'escape analysis', 'ownership'],
        proof: 'Create a memory leak in a browser component, a Python script, and a Go service; fix each one.',
        lane: 'foundation',
        status: 'next',
        prompt:
          'Design three tiny memory-retention bugs: browser listener leak, Python shared mutable object, Go slice retention. Show fixes and explanations.',
      },
      {
        title: 'Production observability loop',
        whyForYou:
          'Your work needs proof: logs, metrics, smoke checks, screenshots, and mature outcome scoring instead of vibes.',
        learn: ['structured logs', 'metrics', 'traces', 'profiles', 'smoke tests'],
        proof: 'Add logs, metrics, one profile, and a smoke test to a toy service; debug a forced failure.',
        lane: 'production',
        status: 'now',
        prompt:
          'Add structured logs, latency metrics, one CPU profile, and a browser/API smoke check to a toy service. Force a failure and write the debug path.',
      },
    ],
  },
  {
    id: 'ship-web-ai-products',
    title: '1. Ship Web + AI Products',
    goal: 'Use TypeScript and Python as the default product loop: UI, APIs, AI calls, data jobs, and verification.',
    nodes: [
      {
        title: 'TypeScript platform mastery',
        whyForYou:
          'Your fleet is full of React/Vite/Workers surfaces. TS is the highest-leverage daily runtime for product polish and deploy safety.',
        learn: ['browser vs Node vs Worker APIs', 'ESM', 'fetch/streams', 'React state boundaries', 'type contracts'],
        proof: 'Build one feature that runs in browser, Node, and Cloudflare Worker with explicit platform boundaries.',
        lane: 'typescript',
        status: 'now',
        prompt:
          'Build a TypeScript feature with shared types, a browser UI, a Node/local endpoint, and a Cloudflare Worker-compatible function. Mark platform-only APIs.',
      },
      {
        title: 'Python leverage stack',
        whyForYou:
          'High Signal-style ingest, scoring, local scripts, data wrangling, and AI evals are Python-shaped problems.',
        learn: ['uv/venv', 'pyproject', 'asyncio', 'FastAPI', 'pytest', 'typing', 'native wheels'],
        proof: 'Build a typed FastAPI ingest/scoring service with a CLI backfill and tests.',
        lane: 'python',
        status: 'now',
        prompt:
          'Build a typed Python FastAPI ingest/scoring service with uv, pyproject.toml, async HTTP fetching, pytest tests, and a CLI backfill command.',
      },
      {
        title: 'AI adapter and failure discipline',
        whyForYou:
          'Your products use multiple AI paths. The skill is not calling an API; it is fallback, cost control, observability, and user-safe failure.',
        learn: ['OpenAI-compatible adapters', 'timeouts', 'retries', 'schema validation', 'cost logging'],
        proof: 'Create one AI feature with model config, schema validation, fallback, and captured failure states.',
        lane: 'production',
        status: 'next',
        prompt:
          'Implement an AI adapter with endpoint/model config, timeout, retry, schema validation, fallback result, and cost/failure logging.',
      },
      {
        title: 'End-to-end product verification',
        whyForYou:
          'You care whether the behavior is real. Every feature should have the smallest proof: unit, API, browser, or production smoke.',
        learn: ['Vitest', 'Playwright', 'MSW/page.route', 'API smoke checks', 'screenshots'],
        proof: 'Ship one UI workflow with create/edit/delete or input/output proof, not only render checks.',
        lane: 'production',
        status: 'now',
        prompt:
          'Add a Playwright workflow test that proves a real user path, including state change and visible result. Keep it scoped and stable.',
      },
    ],
  },
  {
    id: 'backend-infra-depth',
    title: '2. Backend Infrastructure Depth',
    goal: 'Add Go where services, concurrency, binaries, and operational simplicity matter.',
    nodes: [
      {
        title: 'Go service core',
        whyForYou:
          'Go is the right boring tool for crawlers, webhooks, reverse proxies, metrics exporters, and small reliable services.',
        learn: ['net/http', 'context', 'errors', 'goroutines', 'worker pools', 'graceful shutdown'],
        proof: 'Build the URL monitor in Go with REST, workers, cancellation, and graceful shutdown.',
        lane: 'go',
        status: 'next',
        prompt:
          'Build the URL monitoring service in Go with net/http, bounded workers, context cancellation, graceful shutdown, SQLite/Postgres persistence, and tests.',
      },
      {
        title: 'Go production diagnostics',
        whyForYou:
          'For backend incidents, pprof, race detector, and clean logs beat framework intuition.',
        learn: ['race detector', 'pprof', 'benchmarks', 'connection pooling', 'rate limiting'],
        proof: 'Introduce a race and a slow handler, catch both with Go tooling, then fix them.',
        lane: 'go',
        status: 'next',
        prompt:
          'Create a Go service with an intentional data race and slow handler. Catch them with race detector and pprof, then fix and explain.',
      },
      {
        title: 'Protocol and worker architecture',
        whyForYou:
          'Useful for SaaS Maker/fleet orchestration: queues, job runners, webhooks, and internal APIs.',
        learn: ['queues', 'gRPC basics', 'idempotency', 'retries', 'dead-letter handling'],
        proof: 'Build a webhook worker that is idempotent, retries safely, and records failure state.',
        lane: 'production',
        status: 'later',
        prompt:
          'Build an idempotent webhook worker with retry policy, dead-letter state, structured logs, and a replay command.',
      },
    ],
  },
  {
    id: 'systems-control',
    title: '3. Systems Control',
    goal: 'Use Rust selectively for correctness, parsers, CLIs, WASM, and performance-critical internals.',
    nodes: [
      {
        title: 'Rust ownership before async',
        whyForYou:
          'Rust is valuable if it changes how you think about correctness. Async Rust before ownership will waste time.',
        learn: ['ownership', 'borrowing', 'lifetimes', 'Result/Option', 'traits', 'Copy vs Clone'],
        proof: 'Build a parser that returns borrowed slices, then refactor it to owned output.',
        lane: 'rust',
        status: 'later',
        prompt:
          'Build a Rust parser that returns borrowed string slices, then refactor to owned output. Explain every lifetime and clone.',
      },
      {
        title: 'Rust CLI or WASM utility',
        whyForYou:
          'Best fit for personal tools: fast local analyzers, parsers, diff tools, or browser-side WASM modules.',
        learn: ['Cargo', 'clap', 'serde', 'WASM', 'error modeling'],
        proof: 'Build a CLI that parses repo output and returns structured JSON for another app to consume.',
        lane: 'rust',
        status: 'later',
        prompt:
          'Build a Rust CLI that parses git or test output into structured JSON, with serde, typed errors, and integration tests.',
      },
      {
        title: 'Async Rust only after proof',
        whyForYou:
          'Tokio is worth it only when you already understand ownership and have a real networking/performance reason.',
        learn: ['futures', 'Tokio', 'Send/Sync', 'Arc<Mutex<T>>', 'channels'],
        proof: 'Port the Go URL monitor worker core to Rust/Tokio and compare complexity.',
        lane: 'rust',
        status: 'defer',
        prompt:
          'Port a bounded URL monitor worker core from Go to Rust/Tokio. Compare cancellation, shared state, error handling, and code complexity.',
      },
    ],
  },
];

export const PERSONAL_DATABASE_TRACK: PersonalRoadmapPhase[] = [
  {
    id: 'db-core-model',
    title: '0. SQL + Data Modeling',
    goal: 'Design tables that make product behavior correct before worrying about scale.',
    nodes: [
      {
        title: 'Relational modeling',
        whyForYou:
          'High Signal scoring, SaaS Maker tasks, reviews, feedback, and product analytics all depend on clean entities and relationships.',
        learn: ['entities', 'relationships', 'constraints', 'foreign keys', 'normalization'],
        proof: 'Model users, tasks, events, scores, and feedback with constraints that prevent invalid state.',
        lane: 'database',
        status: 'now',
        prompt:
          'Design a relational schema for users, tasks, events, scores, and feedback. Include keys, constraints, invalid states prevented, and example queries.',
      },
      {
        title: 'SQL beyond CRUD',
        whyForYou:
          'Most product questions are joins, groups, time windows, ranks, and filtered aggregates, not simple selects.',
        learn: ['joins', 'CTEs', 'aggregates', 'window functions', 'upserts'],
        proof: 'Answer activation, retention, stale-feed, and hit-rate questions from raw rows using SQL only.',
        lane: 'database',
        status: 'now',
        prompt:
          'Write SQL queries for activation, D1/D7 retention, stale-feed detection, and mature hit-rate from raw product event and score tables.',
      },
      {
        title: 'Schema evolution',
        whyForYou:
          'You keep shipping live products. Bad migrations create production-only bugs and painful repair scripts.',
        learn: ['migrations', 'backfills', 'expand/contract', 'defaults', 'rollback planning'],
        proof: 'Add a non-null column to a live table safely with a backfill and compatibility window.',
        lane: 'database',
        status: 'next',
        prompt:
          'Plan a safe migration that adds a non-null derived field to a live table. Include expand/contract steps, backfill, verification query, and rollback.',
      },
    ],
  },
  {
    id: 'db-performance-correctness',
    title: '1. Performance + Correctness',
    goal: 'Know why a query is slow, why a transaction is wrong, and when a cache lies.',
    nodes: [
      {
        title: 'Indexes and query plans',
        whyForYou:
          'Dashboards and feed pages die from missing indexes, wrong sort order, or accidental full scans.',
        learn: ['B-tree indexes', 'composite indexes', 'EXPLAIN', 'covering indexes', 'selectivity'],
        proof: 'Make a dashboard query slow, add the right index, and explain the plan change.',
        lane: 'database',
        status: 'now',
        prompt:
          'Create a slow dashboard query, read the EXPLAIN plan, add a composite index, and explain why the new plan is faster.',
      },
      {
        title: 'Transactions and isolation',
        whyForYou:
          'Task claiming, scoring, inventory-like updates, and webhook replay all need correct concurrent behavior.',
        learn: ['ACID', 'isolation levels', 'lost updates', 'locks', 'idempotency keys'],
        proof: 'Reproduce a lost update, then fix it with a transaction or idempotent write pattern.',
        lane: 'database',
        status: 'next',
        prompt:
          'Show a lost-update bug for two concurrent workers claiming the same job, then fix it with transactions, locks, or idempotency.',
      },
      {
        title: 'Caching and invalidation',
        whyForYou:
          'You have seen stale public feeds and tiny cached artifacts. Cache correctness is product correctness.',
        learn: ['TTL', 'cache keys', 'stale-while-revalidate', 'negative caching', 'cache busting'],
        proof: 'Build a cache that goes stale, then add validation and fallback behavior.',
        lane: 'data',
        status: 'next',
        prompt:
          'Design a cache strategy for a public feed that avoids stale or tiny artifacts. Include TTLs, validation, fallback, and observability.',
      },
    ],
  },
  {
    id: 'db-product-data',
    title: '2. Product Data Systems',
    goal: 'Separate operational truth from analytics truth and make backfills boring.',
    nodes: [
      {
        title: 'OLTP vs analytics tables',
        whyForYou:
          'Product actions need normalized correctness; dashboards need queryable event and rollup shapes.',
        learn: ['event tables', 'rollups', 'materialized views', 'denormalization', 'late data'],
        proof: 'Design source tables plus daily rollups for signup, activation, core action, returned.',
        lane: 'data',
        status: 'now',
        prompt:
          'Design OLTP and analytics tables for signup, activated, core_action, and returned across multiple products. Include daily rollups and late-event handling.',
      },
      {
        title: 'Backfills and repair scripts',
        whyForYou:
          'A lot of real product work is repairing old rows without corrupting new ones.',
        learn: ['idempotent scripts', 'dry runs', 'batching', 'audit logs', 'verification queries'],
        proof: 'Write a dry-run backfill plan with before/after counts and a replay-safe repair script.',
        lane: 'data',
        status: 'next',
        prompt:
          'Write a backfill plan and script outline that repairs stale score rows safely. Include dry run, batching, audit log, verification, and rerun behavior.',
      },
      {
        title: 'Backup, restore, and data drills',
        whyForYou:
          'If you cannot restore, you do not really have data durability.',
        learn: ['backups', 'point-in-time restore', 'export/import', 'seed data', 'restore verification'],
        proof: 'Create a local restore drill for a product DB and verify row counts plus key queries.',
        lane: 'database',
        status: 'later',
        prompt:
          'Design a backup and restore drill for a small product database. Include export, restore, verification queries, and what failures to simulate.',
      },
    ],
  },
];

export const PERSONAL_INFRA_TRACK: PersonalRoadmapPhase[] = [
  {
    id: 'infra-local-to-prod',
    title: '0. Local to Production',
    goal: 'Make every app explainable from local dev through deployment artifact.',
    nodes: [
      {
        title: 'Linux and process lifecycle',
        whyForYou:
          'Ports, signals, logs, file permissions, and stuck local servers show up in nearly every repo.',
        learn: ['processes', 'signals', 'ports', 'permissions', 'system logs'],
        proof: 'Start, inspect, terminate, and restart a service while preserving logs and explaining state.',
        lane: 'infra',
        status: 'now',
        prompt:
          'Create a Linux/process lifecycle drill: start a local server, inspect port/process, send SIGTERM, verify shutdown, and explain logs.',
      },
      {
        title: 'Docker and runtime config',
        whyForYou:
          'Containers force clean boundaries: env vars, ports, volumes, image layers, and startup commands.',
        learn: ['Dockerfile', 'image layers', 'volumes', 'env vars', 'health checks'],
        proof: 'Containerize a small API with no local-only assumptions and a working health check.',
        lane: 'infra',
        status: 'now',
        prompt:
          'Containerize a small API. Include Dockerfile, env-only config, healthcheck, volume decision, and commands to run and debug it.',
      },
      {
        title: 'Secrets and config discipline',
        whyForYou:
          'Your fleet often fails from missing or empty env/config, not broken application code.',
        learn: ['env validation', 'secret scopes', 'repo variables', 'runtime vs build-time config'],
        proof: 'Add validation that catches missing, empty, or wrong-scope deploy config before runtime.',
        lane: 'devops',
        status: 'now',
        prompt:
          'Design env/config validation for a Cloudflare/Vite app that catches missing, empty, or wrong-scope variables before deploy.',
      },
    ],
  },
  {
    id: 'infra-ci-cd',
    title: '1. CI/CD + Deploys',
    goal: 'Turn pushes into predictable previews, checks, deploys, and rollbacks.',
    nodes: [
      {
        title: 'GitHub Actions pipeline',
        whyForYou:
          'You need fast signal: typecheck, lint, unit, e2e, build, and deploy guards with clear failure logs.',
        learn: ['workflow triggers', 'caching', 'matrix jobs', 'artifacts', 'log inspection'],
        proof: 'Create a pipeline that fails clearly for env, test, build, and deploy mistakes.',
        lane: 'devops',
        status: 'now',
        prompt:
          'Design a GitHub Actions pipeline for a Vite/Cloudflare app with typecheck, lint, unit, e2e, build, env validation, and readable failure logs.',
      },
      {
        title: 'Cloudflare Pages + Workers',
        whyForYou:
          'Your products deploy heavily through Cloudflare, so runtime limits and bindings matter more than generic cloud theory.',
        learn: ['Pages', 'Workers', 'bindings', 'D1/KV/R2', 'wrangler', 'preview deploys'],
        proof: 'Deploy a small Pages app with a Worker/API binding and a production smoke check.',
        lane: 'infra',
        status: 'next',
        prompt:
          'Plan a Cloudflare Pages + Workers deployment with bindings, preview deploys, production smoke checks, and rollback notes.',
      },
      {
        title: 'Release and rollback discipline',
        whyForYou:
          'A green deploy is not proof. You need smoke checks, artifact checks, and a known rollback path.',
        learn: ['release checklist', 'smoke tests', 'artifact verification', 'rollback', 'changelog'],
        proof: 'Ship a change, verify production behavior, and document exact rollback steps.',
        lane: 'devops',
        status: 'next',
        prompt:
          'Create a release checklist for a small product: preflight, deploy, production smoke, artifact verification, changelog, rollback.',
      },
    ],
  },
  {
    id: 'infra-ops-reliability',
    title: '2. Operations + Reliability',
    goal: 'Debug production from symptoms to root cause without guessing.',
    nodes: [
      {
        title: 'Logs, metrics, traces',
        whyForYou:
          'Fleet status should be evidence-backed: what failed, where, for whom, and since when.',
        learn: ['structured logs', 'metrics', 'tracing', 'correlation ids', 'dashboards'],
        proof: 'Add correlation IDs and latency/error metrics to a request path, then debug a forced failure.',
        lane: 'production',
        status: 'now',
        prompt:
          'Add correlation IDs, structured logs, latency metrics, and error metrics to a request path. Force a failure and write the debug path.',
      },
      {
        title: 'Jobs, cron, and queues',
        whyForYou:
          'Ingest, scoring, audits, weekly refreshes, and notifications are background reliability problems.',
        learn: ['cron', 'queues', 'retries', 'dead letters', 'idempotency', 'replay'],
        proof: 'Build a scheduled job with retries, idempotent writes, failure state, and replay command.',
        lane: 'production',
        status: 'next',
        prompt:
          'Build a scheduled job system with idempotent writes, retries, failure records, dead-letter state, and a replay command.',
      },
      {
        title: 'Incident drills',
        whyForYou:
          'The skill is not never breaking prod; it is narrowing the cause fast and communicating accurately.',
        learn: ['triage', 'blast radius', 'timeline', 'mitigation', 'postmortem'],
        proof: 'Simulate stale feed, missing env var, and slow query incidents; write concise postmortems.',
        lane: 'devops',
        status: 'later',
        prompt:
          'Run three incident drills: stale feed, missing env var, slow query. For each, write symptom, evidence, root cause, mitigation, and prevention.',
      },
    ],
  },
];

export const FOUNDATION_CONCEPTS: FoundationConcept[] = [
  {
    name: 'Process vs thread',
    why: 'Explains Node workers, Python GIL limits, Go scheduling, and Rust OS threads.',
    drill: 'Run two CPU-bound tasks and two I/O-bound tasks; measure single process, threads, and processes.',
  },
  {
    name: 'Heap vs stack',
    why: 'Shows why allocation, escape analysis, borrowing, object lifetimes, and GC pressure matter.',
    drill: 'Trace where a request object, local variable, closure, and returned pointer live in each runtime.',
  },
  {
    name: 'Garbage collection',
    why: 'JS, Python, and Go pause or reclaim differently; Rust makes lifetime costs explicit.',
    drill: 'Create many short-lived objects, watch memory, then remove references and explain when memory returns.',
  },
  {
    name: 'Blocking vs non-blocking I/O',
    why: 'Determines whether async, threads, workers, goroutines, or processes are the right tool.',
    drill: 'Build a slow HTTP client and compare sequential, concurrent async, threaded, and worker versions.',
  },
  {
    name: 'Concurrency vs parallelism',
    why: 'Concurrency is structure; parallelism is execution. Confusing them causes bad architecture.',
    drill: 'Explain why 1,000 pending HTTP requests can be concurrent without 1,000 CPU cores.',
  },
  {
    name: 'CPU-bound vs I/O-bound work',
    why: 'CPU work wants parallel compute; I/O work wants waiting to be cheap.',
    drill: 'Benchmark JSON parsing vs fetching 100 URLs, then choose async, threads, processes, or workers.',
  },
  {
    name: 'HTTP/TCP/WebSockets',
    why: 'Every backend and browser runtime sits on request/response, streams, sockets, and failure modes.',
    drill: 'Write an HTTP server, a streaming response, and a WebSocket echo in one language.',
  },
  {
    name: 'Serialization',
    why: 'JSON is not free; binary protocols, schema drift, and compatibility show up in production.',
    drill: 'Encode the same payload as JSON and a binary format; compare size, parse cost, and versioning.',
  },
  {
    name: 'Databases',
    why: 'Connection pooling, transactions, isolation, and migrations shape real service behavior.',
    drill: 'Create a table, write two concurrent updates, and explain the transaction result.',
  },
  {
    name: 'Containers',
    why: 'Deployment is runtime behavior: env vars, image layers, ports, volumes, and process signals.',
    drill: 'Containerize a tiny API and make config work only through environment variables.',
  },
  {
    name: 'Linux basics',
    why: 'Files, permissions, signals, process lifecycle, and syscalls are where services actually run.',
    drill: 'Start a server, send SIGTERM, inspect open ports, read logs, and explain shutdown.',
  },
  {
    name: 'Observability',
    why: 'Without logs, metrics, traces, and profiling, performance and reliability claims are guesses.',
    drill: 'Add structured logs, request latency metrics, and one CPU or allocation profile to a toy service.',
  },
];

export const RUNTIME_LAYERS: RuntimeLayer[] = [
  {
    name: 'Runtime model',
    questions: [
      'Who executes the code?',
      'What happens at startup?',
      'What happens when I import a file?',
      'What happens when I await or block?',
    ],
    learn: [
      'VM/interpreter/compiler boundary',
      'module loading',
      'startup cost',
      'event loop or scheduler',
    ],
    build: 'Print startup order across multiple modules, then add one async/blocking operation.',
    prove: 'Explain what runs before main/user code and what can block the process.',
  },
  {
    name: 'Memory model',
    questions: [
      'What allocates on stack vs heap?',
      'Who owns this value?',
      'When is memory reclaimed?',
      'Can references outlive the data?',
    ],
    learn: ['stack', 'heap', 'references', 'copy vs move', 'GC/RAII', 'leaks'],
    build: 'Write a cache that intentionally leaks, fix it, then explain retention.',
    prove: 'Use a memory/profile tool or compiler explanation to show where allocation happens.',
  },
  {
    name: 'Type system',
    questions: [
      'What does the compiler protect?',
      'What fails only at runtime?',
      'How are interfaces/traits/protocols expressed?',
    ],
    learn: ['dynamic vs static', 'gradual typing', 'generics', 'interfaces/traits', 'nullability'],
    build: 'Model success/failure for a small API without using vague any/object maps.',
    prove: 'Break the contract and show whether compiler, type checker, or runtime catches it.',
  },
  {
    name: 'Concurrency model',
    questions: [
      'What is a task?',
      'What runs in parallel?',
      'How do I cancel work?',
      'How does backpressure appear?',
    ],
    learn: ['async I/O', 'threads', 'workers', 'channels/queues', 'cancellation', 'backpressure'],
    build: 'Fetch 100 URLs with cancellation, timeout, and bounded concurrency.',
    prove: 'Show what happens when one task hangs and how the rest are protected.',
  },
  {
    name: 'Package/build system',
    questions: [
      'How are dependencies locked?',
      'How are native dependencies built?',
      'What artifact ships?',
    ],
    learn: ['lockfiles', 'modules', 'native extensions', 'workspaces', 'release artifact'],
    build: 'Create a tiny package/CLI and install it into a fresh project.',
    prove: 'Delete caches, reinstall from lockfile, and explain why the build is reproducible.',
  },
  {
    name: 'I/O and networking',
    questions: [
      'How does the HTTP server accept work?',
      'How are streams represented?',
      'Where do timeouts live?',
    ],
    learn: ['HTTP server/client', 'streams', 'uploads', 'WebSockets', 'database I/O'],
    build: 'Implement REST, WebSocket live updates, file upload, and a database-backed endpoint.',
    prove: 'Simulate slow clients and failed upstreams; explain resource cleanup.',
  },
  {
    name: 'Error handling',
    questions: [
      'Are errors values or exceptions?',
      'Can failures be ignored?',
      'How do async failures propagate?',
    ],
    learn: ['exceptions', 'Result/Option', 'error returns', 'retries', 'panic/crash policy'],
    build: 'Wrap a flaky upstream call with timeout, retry, typed error, and user-safe message.',
    prove: 'Force network, validation, and programmer errors; show the different paths.',
  },
  {
    name: 'Testing/debugging/profiling',
    questions: [
      'How do I test units, integration, and concurrency?',
      'How do I inspect CPU and memory?',
      'How do I reproduce production bugs?',
    ],
    learn: ['unit tests', 'integration tests', 'race tools', 'debuggers', 'profilers', 'benchmarks'],
    build: 'Add tests, one benchmark, and one profile for a deliberately slow endpoint.',
    prove: 'Use profiling output to remove a real bottleneck instead of guessing.',
  },
  {
    name: 'Deployment model',
    questions: [
      'What exact artifact ships?',
      'How is config injected?',
      'How does shutdown work?',
      'How do upgrades happen safely?',
    ],
    learn: ['static assets', 'single binary', 'containers', 'serverless', 'signals', 'rollbacks'],
    build: 'Dockerize and run the service with only env vars, health checks, and graceful shutdown.',
    prove: 'Kill and restart it while requests are in flight; explain what is preserved or lost.',
  },
];

const jsLayerPlan: RuntimeLayer[] = [
  {
    name: 'Runtime model',
    questions: ['Browser or Node?', 'Which APIs are platform APIs?', 'What enters the microtask queue?'],
    learn: ['V8', 'event loop', 'tasks vs microtasks', 'ESM/CJS loading', 'Web APIs'],
    build: 'Create a script that logs sync code, Promise.then, queueMicrotask, setTimeout, fetch, and worker messages.',
    prove: 'Explain the exact printed order and why Promise callbacks beat timers.',
  },
  {
    name: 'Memory model',
    questions: ['Which closures retain data?', 'How do objects and arrays share references?'],
    learn: ['GC roots', 'closures', 'WeakMap/WeakRef', 'Buffer memory', 'DOM leaks'],
    build: 'Create and fix a retained-listener leak in a small browser component.',
    prove: 'Show why removing a DOM node is not enough if a closure still references it.',
  },
  {
    name: 'Concurrency model',
    questions: ['What is non-blocking?', 'When do workers matter?', 'What is backpressure?'],
    learn: ['promises', 'async/await', 'AbortController', 'streams', 'worker_threads/Web Workers'],
    build: 'Build a streaming HTTP proxy with cancellation and a CPU-heavy transform moved to a worker.',
    prove: 'Show the main thread stays responsive while the worker runs.',
  },
];

const pythonLayerPlan: RuntimeLayer[] = [
  {
    name: 'Runtime model',
    questions: ['What is CPython doing?', 'What happens on import?', 'Where does venv isolation happen?'],
    learn: ['CPython', 'bytecode', 'import system', 'venv', 'native wheels'],
    build: 'Make a package with two modules, inspect import side effects, and run it in a fresh venv.',
    prove: 'Explain why import-time work can slow startup or break serverless cold starts.',
  },
  {
    name: 'Memory model',
    questions: ['What does refcounting reclaim immediately?', 'When does cyclic GC matter?'],
    learn: ['object identity', 'mutability', 'reference counting', 'cyclic GC', 'native extension memory'],
    build: 'Create shared mutable default state, fix it, then inspect object ids and references.',
    prove: 'Explain why two variables can mutate the same list.',
  },
  {
    name: 'Concurrency model',
    questions: ['When do threads help?', 'When does the GIL block CPU parallelism?', 'When use processes?'],
    learn: ['asyncio', 'threading', 'multiprocessing', 'queues', 'Celery/RQ/Dramatiq'],
    build: 'Write the same URL checker with asyncio, threads, and multiprocessing for CPU parsing.',
    prove: 'Explain which version wins for I/O and which for CPU-heavy Python bytecode.',
  },
];

const goLayerPlan: RuntimeLayer[] = [
  {
    name: 'Runtime model',
    questions: ['What is inside a Go binary?', 'What does the scheduler do?', 'How does startup differ from Node/Python?'],
    learn: ['go build', 'static binaries', 'runtime scheduler', 'GC', 'cross-compilation'],
    build: 'Compile one HTTP server for local architecture and Linux, then run both in containers.',
    prove: 'Explain why deploying a Go service can be a single binary copy.',
  },
  {
    name: 'Memory model',
    questions: ['Did this value escape?', 'Is this slice sharing an array?', 'What does GC scan?'],
    learn: ['pointers', 'slices/maps internals', 'escape analysis', 'stack growth', 'GC tuning'],
    build: 'Write a slice-sharing bug, fix it, and inspect escape analysis output.',
    prove: 'Explain why appending to a slice can mutate or detach from the original array.',
  },
  {
    name: 'Concurrency model',
    questions: ['Who owns cancellation?', 'Should this be a channel or a mutex?', 'How does shutdown drain?'],
    learn: ['goroutines', 'channels', 'select', 'context', 'worker pools', 'race detector'],
    build: 'Build a bounded crawler with context cancellation, rate limits, and graceful shutdown.',
    prove: 'Run the race detector and explain what it catches and what it does not.',
  },
];

const rustLayerPlan: RuntimeLayer[] = [
  {
    name: 'Runtime model',
    questions: ['What code runs without a GC?', 'What does Cargo produce?', 'Where does async execution come from?'],
    learn: ['LLVM', 'Cargo', 'panic unwind/abort', 'Tokio executors', 'WASM', 'FFI'],
    build: 'Create a CLI, then add an async HTTP command behind Tokio.',
    prove: 'Explain why async Rust needs a runtime even though Rust itself has no default async executor.',
  },
  {
    name: 'Memory model',
    questions: ['Who owns the value?', 'Who borrows it?', 'How long is the borrow valid?'],
    learn: ['ownership', 'borrowing', 'lifetimes', 'Copy vs Clone', 'RAII', 'Box/Rc/Arc'],
    build: 'Write a parser that returns borrowed slices, then refactor it to owned output.',
    prove: 'Explain why the borrowed result cannot outlive the source string.',
  },
  {
    name: 'Concurrency model',
    questions: ['Is this type Send?', 'Is shared state Sync?', 'Should this use Arc<Mutex<T>>?'],
    learn: ['threads', 'channels', 'Send/Sync', 'Mutex/RwLock', 'async futures', 'pinning basics'],
    build: 'Build a concurrent worker pool and then the same shape with Tokio tasks.',
    prove: 'Explain why the compiler rejects unsafe sharing before runtime.',
  },
];

export const RUNTIME_ROADMAPS: RuntimeRoadmap[] = [
  {
    id: 'javascript',
    name: 'JavaScript + TypeScript',
    philosophy: 'event-loop + web/platform glue',
    runtimeModel: 'Browser, Node, Bun, Deno, edge isolates, V8, DOM/Web APIs.',
    memoryModel: 'Garbage collection, object references, closures, weak refs.',
    concurrencyModel: 'Event loop, tasks vs microtasks, promises, async/await, workers.',
    packaging: 'npm/pnpm/yarn, ESM vs CommonJS, bundlers, lockfiles.',
    deployment: 'Static frontend, Node server, serverless, edge workers.',
    mustUnderstand: [
      'Browser runtime vs Node runtime',
      'V8 and the event loop',
      'Tasks vs microtasks',
      'Promises and async/await',
      'DOM, Fetch, Web APIs, Workers',
      'ESM vs CommonJS',
      'TypeScript as a compile-time guardrail',
      'Streams, buffers, and backpressure',
    ],
    thenLearn: [
      'Node internals and process lifecycle',
      'EventEmitter and stream composition',
      'HTTP server model',
      'Worker threads and cluster/process managers',
      'Cloudflare Workers, Vercel Edge, Deno Deploy',
      'npm package publishing and supply-chain hygiene',
    ],
    builds: [
      'CLI tool',
      'REST API',
      'WebSocket chat',
      'React/Next frontend',
      'Node backend',
      'Cloudflare Worker',
      'Package published to npm',
    ],
    checklist: [
      'Why Promise.then runs before setTimeout',
      'ESM vs CommonJS',
      'Node APIs vs browser APIs',
      'Streams and backpressure',
      'What bundling changes',
      'What TypeScript is actually checking',
      'What runs in an edge worker',
    ],
    traps: [
      'Thinking JS is only frontend',
      'Avoiding TypeScript',
      'Not understanding the event loop',
      'Confusing async with parallel',
      'Depending blindly on npm packages',
    ],
    layerPlan: jsLayerPlan,
  },
  {
    id: 'python',
    name: 'Python',
    philosophy: 'interpreter + ecosystem + batteries + native extensions',
    runtimeModel: 'CPython, PyPy, Pyodide, venvs, bytecode, native wheels.',
    memoryModel: 'Reference counting plus cyclic GC, object model, mutability.',
    concurrencyModel: 'asyncio, threads, multiprocessing, task queues.',
    packaging: 'venv, pip, uv/poetry, pyproject.toml, wheels, native deps.',
    deployment: 'Containers, serverless Python, FastAPI/Django apps, notebooks, workers.',
    mustUnderstand: [
      'CPython and interpreter lifecycle',
      'Object identity, mutability, and reference counting',
      'Garbage collection and the GIL',
      'Virtual environments',
      'pip/uv, pyproject.toml, wheels',
      'Native extensions',
      'asyncio, threading, multiprocessing',
    ],
    thenLearn: [
      'FastAPI and Django basics',
      'SQLAlchemy and migrations',
      'Pydantic validation',
      'Celery/RQ/Dramatiq workers',
      'pytest and mypy/pyright',
      'NumPy/Pandas and Jupyter',
      'Pyodide and serverless/containerized Python',
    ],
    builds: [
      'FastAPI service',
      'CLI tool',
      'Web scraper',
      'Async HTTP client/server',
      'Background worker',
      'Data pipeline',
      'Small ML/data project',
      'Package published to PyPI',
    ],
    checklist: [
      'What the GIL does',
      'When threads help',
      'When processes help',
      'What a wheel is',
      'Why virtual environments exist',
      'asyncio vs threading',
      'CPython vs PyPy vs Pyodide',
    ],
    traps: [
      'Treating Python as only scripting',
      'Ignoring packaging',
      'Ignoring the GIL',
      'Using threads for CPU-heavy work',
      'Skipping dependency isolation',
      'Writing untyped Python forever',
    ],
    layerPlan: pythonLayerPlan,
  },
  {
    id: 'go',
    name: 'Go',
    philosophy: 'simple compiled services + goroutines + networking',
    runtimeModel: 'Go compiler, static binaries, Go runtime, scheduler, GC.',
    memoryModel: 'Garbage collection, pointers, escape analysis, growing goroutine stacks.',
    concurrencyModel: 'Goroutines, channels, select, context cancellation, scheduler.',
    packaging: 'Go modules, go build, go test, cross-compilation.',
    deployment: 'Single binary, containers, Kubernetes-style services, CLIs.',
    mustUnderstand: [
      'Go toolchain and modules',
      'Structs, interfaces, pointers',
      'Slices and maps internals',
      'Goroutines, channels, select',
      'context cancellation',
      'errors and defer',
      'GC, scheduler, race detector, pprof',
    ],
    thenLearn: [
      'net/http deeply',
      'gRPC',
      'Database access and connection pooling',
      'Worker pools and rate limiting',
      'Graceful shutdown',
      'Kubernetes-style service design',
      'Metrics exporters',
    ],
    builds: [
      'HTTP API',
      'gRPC service',
      'CLI tool',
      'Concurrent crawler',
      'Worker queue',
      'Reverse proxy',
      'Metrics exporter',
      'Small distributed service',
    ],
    checklist: [
      'What a goroutine is',
      'What channels are actually for',
      'How context cancellation works',
      'How graceful shutdown works',
      'What the race detector catches',
      'What pprof shows',
      'What escape analysis means',
    ],
    traps: [
      'Thinking simple means shallow',
      'Overusing channels',
      'Ignoring context',
      'Skipping graceful shutdown',
      'Not using pprof',
      'Writing Java-style Go',
    ],
    layerPlan: goLayerPlan,
  },
  {
    id: 'rust',
    name: 'Rust',
    philosophy: 'memory safety + zero-cost abstractions + systems control',
    runtimeModel:
      'Native binary, LLVM, Cargo, no default GC, async runtimes when needed.',
    memoryModel:
      'Ownership, borrowing, lifetimes, RAII, move semantics, smart pointers.',
    concurrencyModel: 'Threads, channels, Send/Sync, async futures, Tokio-style executors.',
    packaging: 'Cargo, crates.io, features, workspaces, lockfiles.',
    deployment:
      'Static/native binary, WASM, systems software, high-performance services.',
    mustUnderstand: [
      'Ownership, borrowing, lifetimes',
      'Move semantics, Copy vs Clone',
      'References and slices',
      'Enums and pattern matching',
      'Traits and generics',
      'Result, Option, and the question mark operator',
      'Cargo and crates',
    ],
    thenLearn: [
      'Box, Rc, Arc',
      'Cell, RefCell, Mutex, RwLock',
      'Threads, channels, Send/Sync',
      'Async Rust and Tokio',
      'Serde',
      'FFI and unsafe Rust',
      'WASM',
      'Systems and networking',
    ],
    builds: [
      'CLI tool',
      'Axum/Actix HTTP service',
      'Parser',
      'WebSocket server',
      'Concurrent worker system',
      'WASM module',
      'Small database/storage engine',
      'FFI wrapper',
    ],
    checklist: [
      'What ownership is',
      'What borrowing is',
      'What a lifetime is',
      'Send vs Sync',
      'Box vs Rc vs Arc',
      'Interior mutability',
      'Result vs panic',
      'Why async Rust needs a runtime',
      'What unsafe is actually for',
    ],
    traps: [
      'Learning async before ownership is solid',
      'Fighting the borrow checker instead of learning the model',
      'Using clone to avoid design questions',
      'Avoiding lifetimes',
      'Thinking Rust is only systems programming',
    ],
    layerPlan: rustLayerPlan,
  },
];

export const COMPARATIVE_PROJECT = {
  name: 'URL monitoring service',
  prompt:
    'Build a URL monitoring service with submitted URLs, periodic checks, status history, failure webhooks, REST API, WebSocket live updates, CLI client, background workers, metrics, tests, and Docker deployment notes.',
  features: [
    'User submits URLs',
    'Service checks them every N seconds',
    'Stores status history',
    'Sends webhook on failure',
    'Has REST API',
    'Has WebSocket live updates',
    'Has CLI client',
    'Has background workers',
    'Has metrics and tests',
    'Is deployable in Docker',
  ],
  sequence: [
    'OS/process/thread/networking basics',
    'JavaScript runtime + TypeScript',
    'Python runtime + packaging + async',
    'Go concurrency + backend services',
    'Rust ownership + systems thinking',
    'WASM and edge runtimes',
    'Containers/serverless/cloud deployment',
    'Profiling, observability, production debugging',
  ],
};
