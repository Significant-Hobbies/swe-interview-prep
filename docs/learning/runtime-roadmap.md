# Runtime Roadmap — What every runtime has to do

← [Learning OS index](./index.md)

Link hub for understanding language runtimes, AI inference runtimes, and
edge/serverless runtimes as instances of one shape. Last source audit:
**2026-06-16**.

**Thesis.** Every runtime — V8, JVM, HotSpot, Go runtime, BEAM, .NET CLR,
vLLM, SGLang, llama.cpp, Cloudflare Workers, Deno, wasmtime — does the
same five jobs. They just trade them off differently.

```
              Execute  ─────────  Allocate
                |                    |
                |     Runtime        |
                |                    |
              Observe ─── Schedule ──┘
                          Isolate
```

For every runtime, answer: how does it **execute** code, **allocate**
memory, **schedule** work, **isolate** tenants, **observe** itself? What
does it sacrifice for what?

---

## Scope — what's in, what's out, why

**In scope.** A cross-cutting view of runtimes that holds for language
runtimes, AI inference engines, and edge sandboxes. Mechanism-first, with
each phase pointing at canonical implementations across all three families.

**Out of scope.** Operating-system kernels (those are the
[OS section of the SE Landscape](./swe-landscape.md#8-operating-systems-and-kernels)),
compilers as a separate craft (covered in the
[Compilers section](./swe-landscape.md#7-compilers-and-language-runtimes) —
this roadmap picks up after codegen), and specific *language* design.

**Why this is its own roadmap.** The duality is the insight: V8 managing
isolates for many tenants and vLLM managing KV-cache pages for many
requests are the same problem. Treating runtimes as one thing makes that
duality visible.

---

## Single best starting points

- **The five-job mental model** — [The internals of an LLM inference engine (Pierre Lienhart)](https://medium.com/@plienhar/llm-inference-series-5-dissecting-model-performance-6144aa93168f) + [Kenton Varda — Cloud Computing without Containers](https://blog.cloudflare.com/cloud-computing-without-containers/) — read these back-to-back; the shape is identical.
- **Cross-cutting reading list** — [Aleksey Shipilev — JVM Anatomy Quarks](https://shipilev.net/jvm/anatomy-quarks/) · [V8 blog](https://v8.dev/blog) · [Andy Wingo — wingolog](https://wingolog.org/archives/)
- **Course-grade material** — [CMU 15-411 Compiler Design](https://www.cs.cmu.edu/~410-f25/) covers backend / runtime crossover · [Stanford CS343 Adv OS](https://web.stanford.edu/class/cs343/) for the OS-side of runtime hosting
- **Practitioner blogs** — [Cliff Click](https://www.cliffc.org/blog/) (HotSpot) · [Russ Cox](https://research.swtch.com/) (Go) · [Joe Armstrong / Robert Virding](https://joearms.github.io/) (BEAM, historical) · [Kenton Varda](https://blog.cloudflare.com/author/kenton/) (Workers)

---

## Phase 0 — The five-job model

Frame the rest. Before any specific runtime, list the five jobs and write
one sentence on what makes each one hard.

- [Kenton Varda — Cloud Computing without Containers (Cloudflare, 2018)](https://blog.cloudflare.com/cloud-computing-without-containers/) — the cleanest articulation of "what is a runtime *for*"
- [vLLM — PagedAttention paper (SOSP 2023)](https://arxiv.org/abs/2309.06180) §2-3 — same shape, applied to LLM serving
- [Bryan Cantrill — Falling in love with Rust (2018 talk)](https://www.youtube.com/watch?v=HgtRAbE1nBM) — the "what's a runtime" framing, half-joking but accurate

## Phase 1 — Execution strategies

Interpreter → AOT → baseline JIT → optimising JIT → deoptimisation. The
tier ladder is the same across V8, HotSpot, GraalVM, .NET CLR.

- [V8 — Launching Ignition and TurboFan (2017)](https://v8.dev/blog/launching-ignition-and-turbofan) · [Sparkplug (2021)](https://v8.dev/blog/sparkplug) · [Maglev (2023)](https://v8.dev/blog/maglev) · [Holiday Season 2023 — 4-tier recap](https://v8.dev/blog/holiday-season-2023) ★ canonical tier-ladder explainer
- [Mathias Bynens — shapes & inline caches](https://mathiasbynens.be/notes/shapes-ics)
- [Aleksey Shipilev — JVM Anatomy Quark #21: Interpreter, Compilers, and Deopt](https://shipilev.net/jvm/anatomy-quarks/) · [Quark #20: FFI cost](https://shipilev.net/jvm/anatomy-quarks/20-fastest-ffi/)
- [HotSpot tiered compilation (Oracle)](https://docs.oracle.com/en/java/javase/21/vm/hotspot-virtual-machine-garbage-collection-tuning-guide.pdf)
- [Cliff Click — Sea of Nodes paper](https://www.oracle.com/technetwork/java/javase/tech/c2-ir95-150110.pdf) (HotSpot C2's IR) · [Simple — teaching codebase](https://github.com/SeaOfNodes/Simple)
- [GraalVM — Truffle: A Self-Optimizing Runtime System](https://chrisseaton.com/truffleruby/specialization.pdf) — modern polyglot tier ladder

## Phase 2 — Memory & garbage collection

Allocation, escape analysis, generational/concurrent/parallel GC,
read/write barriers, pauseless collectors.

- [V8 Orinoco — Concurrent marking and scavenging (V8 blog tag)](https://v8.dev/tags/internals) — start with [Trash talk (2019)](https://v8.dev/blog/trash-talk)
- [Go GC pacer — Austin Clements design doc (2021)](https://go.dev/blog/ismmkeynote) + [Getting to Go: scheduler/GC (2019)](https://blog.golang.org/ismmkeynote)
- [Aleksey Shipilev — JVM Anatomy Quark #4: TLAB allocation](https://shipilev.net/jvm/anatomy-quarks/4-tlab-allocation/) · [Quark #5: TLABs and Heap Parsability](https://shipilev.net/jvm/anatomy-quarks/5-tlabs-and-heap-parsability/)
- [Aleksey Shipilev — One Stop Page on G1, Shenandoah, ZGC](https://shipilev.net/jvm/anatomy-quarks/19-cooperative-jit/) · [ZGC wiki](https://wiki.openjdk.org/display/zgc/Main)
- [Andy Wingo — Whippet GC series](https://wingolog.org/tags/whippet) — modern small-runtime GC engineering, 2023-26
- [Felix Klock — Rust Polonius and ownership (talks)](https://blog.pnkfx.org/) — borrow-checker-as-region-inference
- [The Memory Management Reference](https://www.memorymanagement.org/) — glossary + classic articles

## Phase 3 — Scheduling

Cooperative vs preemptive; async runtimes; fibers; work-stealing;
goroutine scheduler; BEAM scheduler; CFS / EEVDF / sched_ext on the OS
side.

- [Dmitry Vyukov — Scalable Go scheduler design (2012)](https://docs.google.com/document/d/1TTj4T2JO42uD5ID9e89oa0sLKhJYD0Y_kqxDv3I3XMw/edit) ★ still canonical
- [Ardan Labs — Go Scheduler series](https://www.ardanlabs.com/blog/2018/08/scheduling-in-go-part1.html) — 3-part deep dive
- [Tokio — Making the Tokio scheduler 10x faster (2019)](https://tokio.rs/blog/2019-10-scheduler)
- [Withoutboats — Notes on a smaller Rust async runtime](https://without.boats/blog/) (multiple posts)
- [Lukas Bergdoll — async cancellation as poison](https://www.ralfj.de/blog/) (Ralf Jung's broader runtime posts)
- [Joe Armstrong — Erlang OTP scheduling (BEAM Book ch. 5)](https://blog.stenmans.org/theBeamBook/#CH-Scheduling)
- [BEAM Book — full free book](https://blog.stenmans.org/theBeamBook/)
- [Linux sched_ext docs](https://www.kernel.org/doc/html/next/scheduler/sched-ext.html) — BPF-based pluggable scheduling (2024)
- [Marc Brooker — Don't Try to Sanitize Input. Escape Output. (queueing intuition)](https://brooker.co.za/blog/) and [Surprising Economics of Load-Balanced Systems](https://brooker.co.za/blog/2020/08/06/erlang.html)

## Phase 4 — Isolation models

Process, thread, V8 isolate, Wasm sandbox, NaCl, gVisor, Firecracker.
Resource limits and tenant boundaries.

- [Kenton Varda — Cloud Computing without Containers (Cloudflare)](https://blog.cloudflare.com/cloud-computing-without-containers/) ★ canonical isolates explainer
- [Kenton Varda — Workers Architecture talk slides](https://www.infoq.com/presentations/cloudflare-workers/) — V8 isolates as multi-tenant runtime
- [Firecracker — Lightweight virtualization for serverless (NSDI 2020)](https://www.usenix.org/conference/nsdi20/presentation/agache)
- [gVisor architecture (Google)](https://gvisor.dev/docs/architecture_guide/) — userspace kernel as syscall sandbox
- [wasmtime — architecture overview (Bytecode Alliance)](https://docs.wasmtime.dev/contributing-architecture.html)
- [WASI — WebAssembly System Interface explainer](https://hacks.mozilla.org/2019/03/standardizing-wasi-a-webassembly-system-interface/) (Lin Clark)
- [Wasmer — vs other Wasm runtimes (perf comparison)](https://wasmer.io/posts/wasmer-vs-wasmtime-vs-wamr) (sponsored, but data is real)
- [SPECTRE: V8 sandbox post — Pointer compression and the heap sandbox](https://v8.dev/blog/sandbox) — V8's own answer to side-channel isolation

## Phase 5 — Observability & control

Sampling profilers, JFR / async-profiler, eBPF runtime hooks, V8
inspector, Go pprof, Java Flight Recorder, runtime tracing.

- [Brendan Gregg — Linux Performance landing page](https://www.brendangregg.com/linuxperf.html) · [Flame Graphs](https://www.brendangregg.com/flamegraphs.html)
- [Brendan Gregg — Java in Flames (mixed-mode FlameGraphs)](https://netflixtechblog.com/java-in-flames-e763b3d32166)
- [Aleksey Shipilev — async-profiler practical guide](https://krzysztofslusarski.github.io/2022/12/12/async-manual.html) (Krzysztof Slusarski's deep dive)
- [Java Flight Recorder + JMC (OpenJDK)](https://docs.oracle.com/javacomponents/jmc-5-4/jfr-runtime-guide/about.htm)
- [Go pprof (official)](https://pkg.go.dev/net/http/pprof) · [Russ Cox — Profiling Go programs (2011, still relevant)](https://go.dev/blog/pprof)
- [Andrii Nakryiko — BPF CO-RE reference](https://nakryiko.com/posts/bpf-core-reference-guide/) · [BPF Performance Tools (Gregg, book) chapter excerpts](https://www.brendangregg.com/bpf-performance-tools-book.html)
- [Datadog — Continuous Profiler engineering posts](https://www.datadoghq.com/blog/engineering/) — production-grade runtime observability

## Phase 6 — Language runtimes deep-dive

Pick at least one outside your comfort zone.

### JVM (HotSpot)
- [Aleksey Shipilev — JVM Anatomy Quarks (full index)](https://shipilev.net/jvm/anatomy-quarks/) ★ best applied JVM blog
- [Cliff Click — blog](https://www.cliffc.org/blog/) — C2 compiler, lock-free, NonBlockingHashMap
- [OpenJDK wiki](https://wiki.openjdk.org/) — JEP archives, GC pages

### Go
- [Russ Cox — research.swtch.com](https://research.swtch.com/) — design + history posts
- [Go runtime — official docs](https://pkg.go.dev/runtime) · [Garbage collector guide (2022)](https://go.dev/doc/gc-guide)
- [Dmitry Vyukov — Go scheduler design (linked Phase 3)](https://docs.google.com/document/d/1TTj4T2JO42uD5ID9e89oa0sLKhJYD0Y_kqxDv3I3XMw/edit)

### BEAM (Erlang / Elixir)
- [The BEAM Book (Stenman et al., free online)](https://blog.stenmans.org/theBeamBook/) — chapter-by-chapter
- [Saša Jurić — Elixir in Action runtime chapter excerpts](https://www.theerlangelist.com/)
- [Lukas Larsson talks on BEAM internals](https://www.youtube.com/results?search_query=lukas+larsson+beam)

### V8 / JavaScriptCore
- [V8 blog](https://v8.dev/blog) — full post archive
- [JavaScriptCore — Apple's "Speculation in JavaScriptCore"](https://webkit.org/blog/10308/speculation-in-javascriptcore/) — Filip Pizlo

### .NET CLR
- [Konrad Kokosa — Pro .NET Memory Management blog](https://konradkokosa.pl/) (book companion posts)
- [.NET Runtime Architecture (Microsoft, Stephen Toub's deep dives)](https://devblogs.microsoft.com/dotnet/performance-improvements-in-net-9/) — annual performance posts are the canonical CLR internals tour

## Phase 7 — AI inference runtimes

LLM serving as a runtime problem: schedule requests, allocate KV cache,
execute kernels, isolate tenants, observe per-request cost.

- [vLLM PagedAttention paper (SOSP 2023)](https://arxiv.org/abs/2309.06180) — paged virtual memory for KV cache
- [vLLM blog](https://blog.vllm.ai/) — engineering posts on continuous batching, prefix caching, distributed inference
- [SGLang — RadixAttention paper](https://arxiv.org/abs/2312.07104) · [LMSYS blog post](https://lmsys.org/blog/2024-01-17-sglang/)
- [Sarathi-Serve — chunked prefill (OSDI 2024)](https://www.usenix.org/conference/osdi24/presentation/agrawal) — now default in vLLM V1
- [vAttention paper](https://arxiv.org/abs/2405.04437) — paged-attention critique
- [llama.cpp — Architecture wiki](https://github.com/ggerganov/llama.cpp/wiki) · [GGUF format spec](https://github.com/ggerganov/ggml/blob/master/docs/gguf.md)
- [TensorRT-LLM — best practices guide](https://docs.nvidia.com/deeplearning/tensorrt-llm/best-practices/best-practices.html)
- [HuggingFace — Inference Endpoints engineering blog](https://huggingface.co/blog) (search "inference")
- [Anyscale — How continuous batching enables 23x throughput](https://www.anyscale.com/blog/continuous-batching-llm-inference) — load-bearing intro to batching
- [Lilian Weng — LLM Inference Optimization (2024)](https://lilianweng.github.io/posts/2023-01-10-inference-optimization/) — survey

## Phase 8 — Edge & serverless runtimes

Cold start, isolate startup, multi-tenant scheduling, the long tail.

- [Kenton Varda — Cloud Computing without Containers (Cloudflare)](https://blog.cloudflare.com/cloud-computing-without-containers/) (linked again — it's that canonical)
- [Kenton Varda — Workers KV / Durable Objects design](https://blog.cloudflare.com/workers-durable-objects-beta/)
- [Deno — Internals docs](https://docs.deno.com/runtime/contributing/architecture/) · [Deno blog](https://deno.com/blog) (Bartek Iwańczuk's runtime posts)
- [Bun — Internals (architecture reference)](https://bun.com/docs/runtime/architecture)
- [Vercel Edge Functions architecture](https://vercel.com/blog/edge-functions-generally-available) — V8 isolates on a CDN
- [Firecracker — NSDI 2020 paper (linked Phase 4)](https://www.usenix.org/conference/nsdi20/presentation/agache)
- [Fly.io — Replays and isolation (engineering blog)](https://fly.io/blog/) — V8-isolates-meets-VMs angle
- [wasmtime — architecture (linked Phase 4)](https://docs.wasmtime.dev/contributing-architecture.html) · [Wasmer reactor model](https://wasmer.io/posts/wasmer-vs-wasi-vs-wasix)

## Phase 9 — Synthesis project

Pick one. Don't pick all four.

- **Cross-runtime benchmark suite** — same workload (e.g. JSON parsing,
  hash table lookups, async fan-out) across V8 / Go / JVM / vLLM /
  llama.cpp. Measure: throughput, p99 latency, peak RSS, cold start.
  Output: a blog post with one paragraph per runtime explaining what its
  scheduler/allocator/JIT chose to do.
- **Tiny tier-up JIT** — a single-pass interpreter for a toy language,
  a baseline JIT, an optimising JIT with one inlining pass. Goal: feel
  the deopt path firsthand.
- **Mini paged KV-cache** — implement vLLM's PagedAttention idea from
  the paper without the rest of vLLM. Output: a small server that
  accepts requests, pages KV cache, evicts under pressure.
- **Isolate sandbox** — embed V8 or wasmtime in a host, expose a tiny
  capability API, measure per-tenant memory limit + CPU quota
  enforcement. Output: a multi-tenant evaluator runnable in one binary.

---

## Cross-runtime cheat sheet

| Job | V8 / Workers | JVM HotSpot | Go runtime | BEAM | vLLM |
|---|---|---|---|---|---|
| Execute | Ignition → Sparkplug → Maglev → TurboFan | Interpreter → C1 → C2 / Graal | Compiler (AOT) | BEAM interpreter / HiPE / JIT | CUDA/CPU kernels via PyTorch / Triton |
| Allocate | Orinoco GC (concurrent, generational) | G1 / ZGC / Shenandoah | Concurrent mark-sweep with pacer | Per-process heap, copying GC | PagedAttention pages (KV) + tensor pools |
| Schedule | Microtasks + isolates; libuv on Node | OS threads (kernel-scheduled) | M:N goroutine scheduler | M:N preemptive BEAM scheduler | Continuous batching + chunked prefill |
| Isolate | V8 isolates (lightweight) | OS processes (or class-loader) | OS processes | Erlang process model | Per-request KV cache + token budgets |
| Observe | Chrome DevTools / V8 inspector / async hooks | JFR / async-profiler / mixed-mode FlameGraphs | pprof + tracing | Erlang :observer + recon | nvidia-smi + nsys + vLLM metrics |

**Cross-cutting tradeoff vocabulary.** Tail latency · throughput · RSS ·
cold start · tier-up cost · escape rate · contention · oversubscription ·
fairness · noisy-neighbour · admission control · backpressure.

---

## References (heavier reads)

- *The Garbage Collection Handbook, 2nd ed* — Jones, Hosking, Moss — [site](https://gchandbook.org/)
- *Crafting Interpreters* — Bob Nystrom — [free online](https://craftinginterpreters.com/)
- *Pro .NET Memory Management* — Konrad Kokosa
- *The BEAM Book* — Stenman et al. — [free online](https://blog.stenmans.org/theBeamBook/)
- *Engineering a Compiler, 3rd ed* — Cooper & Torczon (the backend chapters apply)
- *Programming Pearls* — Bentley, for the runtime-shape intuition exercises

## Maintenance notes

- V8 blog URLs are stable but tier names rotate (Ignition → Sparkplug →
  Maglev → TurboFan as of 2023-2026). Re-audit annually.
- vLLM moved from `vllm.ai` to `blog.vllm.ai` — re-pin if needed.
- BEAM Book hosts at `blog.stenmans.org/theBeamBook/` — sometimes
  slow; mirror via the [GitHub repo](https://github.com/happi/theBeamBook).
- Brendan Gregg's blog URL conventions changed in 2023 — the
  `/blog/2024-...` pattern is current.

Last update: 2026-06-16.
