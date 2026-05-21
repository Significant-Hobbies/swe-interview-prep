export interface RuntimeRoadmap {
  id: 'javascript' | 'python' | 'go' | 'rust';
  name: string;
  philosophy: string;
  runtimeModel: string;
  memoryModel: string;
  concurrencyModel: string;
  packaging: string;
  deployment: string;
  builds: string[];
  checklist: string[];
  traps: string[];
}

export const FOUNDATION_CONCEPTS = [
  'Process vs thread',
  'Heap vs stack',
  'Garbage collection',
  'Blocking vs non-blocking I/O',
  'Concurrency vs parallelism',
  'CPU-bound vs I/O-bound work',
  'HTTP/TCP/WebSockets',
  'Serialization',
  'Database transactions and pooling',
  'Containers',
  'Linux process lifecycle',
  'Observability',
];

export const RUNTIME_LAYERS = [
  'Runtime model',
  'Memory model',
  'Type system',
  'Concurrency model',
  'Package/build system',
  'I/O and networking',
  'Error handling',
  'Testing, debugging, profiling',
  'Deployment model',
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
    builds: [
      'CLI tool',
      'REST API',
      'WebSocket chat',
      'React frontend',
      'Cloudflare Worker',
    ],
    checklist: [
      'Why Promise.then runs before setTimeout',
      'ESM vs CommonJS',
      'Node APIs vs browser APIs',
      'Streams and backpressure',
      'What TypeScript is actually checking',
      'What runs in an edge worker',
    ],
    traps: [
      'Thinking JS is only frontend',
      'Avoiding TypeScript',
      'Confusing async with parallel',
      'Depending blindly on npm packages',
    ],
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
    builds: [
      'FastAPI service',
      'CLI tool',
      'Async scraper',
      'Background worker',
      'Data pipeline',
    ],
    checklist: [
      'What the GIL does',
      'When threads help',
      'When processes help',
      'What a wheel is',
      'Why virtual environments exist',
      'CPython vs PyPy vs Pyodide',
    ],
    traps: [
      'Treating Python as only scripting',
      'Ignoring packaging',
      'Using threads for CPU-heavy Python bytecode',
      'Writing untyped production Python forever',
    ],
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
    builds: [
      'HTTP API',
      'gRPC service',
      'Concurrent crawler',
      'Worker queue',
      'Metrics exporter',
    ],
    checklist: [
      'What a goroutine is',
      'What channels are actually for',
      'How context cancellation works',
      'How graceful shutdown works',
      'What the race detector catches',
      'What pprof and escape analysis show',
    ],
    traps: [
      'Thinking simple means shallow',
      'Overusing channels',
      'Ignoring context',
      'Skipping graceful shutdown and pprof',
    ],
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
    builds: [
      'CLI tool',
      'Axum/Actix HTTP service',
      'Parser',
      'WebSocket server',
      'WASM module',
    ],
    checklist: [
      'Ownership and borrowing',
      'What a lifetime is',
      'Send vs Sync',
      'Box vs Rc vs Arc',
      'Result vs panic',
      'Why async Rust needs a runtime',
    ],
    traps: [
      'Learning async before ownership is solid',
      'Using clone to avoid design questions',
      'Avoiding lifetimes',
      'Thinking Rust is only systems programming',
    ],
  },
];

export const COMPARATIVE_PROJECT = {
  name: 'URL monitoring service',
  prompt:
    'Build a URL monitoring service with submitted URLs, periodic checks, status history, failure webhooks, REST API, WebSocket live updates, CLI client, background workers, metrics, tests, and Docker deployment notes.',
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
