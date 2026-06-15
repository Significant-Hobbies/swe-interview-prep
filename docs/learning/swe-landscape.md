# The Software Engineering Landscape (2026)

← [Learning OS index](./index.md)

A map of the systems software stack as it stands in 2026, organised by
domain. Each section answers three questions briefly — *what is this
domain?*, *what subtopics does it contain?*, *why does it matter?* — and
then hands off to curated external sources for depth.

The goal isn't depth in every domain. It's vocabulary across all of them
plus a sense of where to start digging when one becomes the next thing
you need. For depth in one, branch into a dedicated roadmap (see the
[DB roadmap](./db-roadmap.md) as the template). Last source audit:
**2026-06-15**.

---

## Scope — what's in, what's out

**In scope.** A one-page-per-domain map of systems software in 2026 — so
you have vocabulary and a "where to start" pointer for every major area,
even ones you'll never specialise in.

**Out of scope.** Depth in any one domain. Each section's *Further
reading* block is the entry point to that depth; the actual deep work
happens in a dedicated roadmap you write for yourself when a domain
becomes load-bearing. *Adjacent-but-not-here:* the product / business
side of software (positioning, distribution, monetisation, design), the
ML research frontier beyond LLMs (vision, robotics, RL), embedded /
firmware, and quantum. Add tracks for those when you need them.

**Who this is for.** Someone who wants the full breadth so they can pick
the next thing to specialise in — and not be surprised by which domain a
problem actually lives in.

---

## 1. LLMs and inference engines

**What it is.** How transformer models are trained and served. Training
spans tokenization, embeddings, attention, optimization, and scaling laws.
Inference spans KV-cache management, continuous batching, paged attention,
speculative decoding, and quantization — the path from "the model in a
file" to "tokens out the wire."

**Subtopics.** Tokenization · self-attention · multi-head attention ·
transformer block · sampling/decoding · RLHF and post-training · KV cache ·
continuous batching · paged attention · quantization · distillation ·
LoRA/PEFT · evals · interpretability · state-space models (Mamba) ·
inference engines (vLLM, SGLang, llama.cpp).

**Why it matters.** Most net-new software in 2025–2026 either uses or *is*
an LLM. The cost/latency/quality knobs (context length, batch size,
quantization, speculative decoding) now matter the way DB query plans used
to. Pretraining and serving are different specialisations — most engineers
need the serving lens.

### Further reading

- [Karpathy — Intro to LLMs (1hr, no code)](https://www.youtube.com/watch?v=zjkBMFhNj_g) ★ best non-code mental model
- [Karpathy — Let's build GPT from scratch](https://www.youtube.com/watch?v=kCc8FmEb1nY) · [nanoGPT](https://github.com/karpathy/nanoGPT) · [Zero to Hero playlist](https://karpathy.ai/zero-to-hero.html)
- [Karpathy — Let's build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE) — BPE is the source of half of LLM weirdness
- [Karpathy — Let's reproduce GPT-2 (124M)](https://www.youtube.com/watch?v=l8pRSuU81PU) — 4hr end-to-end pretraining + perf engineering
- [3Blue1Brown — Attention, visually explained](https://www.3blue1brown.com/lessons/attention)
- [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) · [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [Attention Is All You Need (2017)](https://arxiv.org/abs/1706.03762) · [LLaMA paper](https://arxiv.org/abs/2302.13971) · [Chinchilla](https://arxiv.org/abs/2203.15556)
- [Lilian Weng — The Transformer Family v2.0](https://lilianweng.github.io/posts/2023-01-27-the-transformer-family-v2/) · [Why we think (2025)](https://lilianweng.github.io/posts/2025-05-01-thinking/) · [Extrinsic hallucinations (2024)](https://lilianweng.github.io/posts/2024-07-07-hallucination/)
- [Mamba](https://arxiv.org/abs/2312.00752) · [Mamba-2 / SSD duality](https://arxiv.org/abs/2405.21060)
- [vLLM PagedAttention](https://arxiv.org/abs/2309.06180) · [Sarathi-Serve (OSDI 2024)](https://www.usenix.org/conference/osdi24/presentation/agrawal) · [SGLang](https://arxiv.org/abs/2312.07104)
- [FlashAttention](https://arxiv.org/abs/2205.14135) · [Tri Dao's posts](https://tridao.me/) · [llama.cpp](https://github.com/ggerganov/llama.cpp) · [llm.c](https://github.com/karpathy/llm.c)
- [Anthropic — Transformer Circuits (interpretability)](https://transformer-circuits.pub/)
- [HuggingFace — Ultra-Scale Playbook (2025)](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook) — real pretraining + parallelism recipes
- [Sebastian Raschka — LLMs from scratch (repo)](https://github.com/rasbt/LLMs-from-scratch)

## 2. Databases and storage engines

**What it is.** How durable, queryable data is stored and retrieved. Inside
a single node: pages, buffer pools, B-trees, LSM trees, WAL, MVCC,
columnar formats, vectorised execution. Across nodes: replication,
partitioning, consensus, isolation models.

**Subtopics.** Storage engines (row vs column) · indexes (B-tree, LSM,
inverted, vector) · WAL & recovery · MVCC · transactions & isolation levels ·
query optimization · replication · sharding · cloud warehouses · search
engines · vector databases.

**Why it matters.** Every backend ultimately bottoms out at storage.
Knowing why a DB makes a given choice predicts how it'll fail, and
how much RAM/SSD/CPU/network it'll spend doing so.

### Further reading

- → [Disk-first DB roadmap](./db-roadmap.md) — the dedicated link hub
- Best starting article: [Architecture of a Database System (Hellerstein et al.)](https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf)
- Best survey talk: [What Goes Around Comes Around (Stonebraker & Hellerstein)](https://15721.courses.cs.cmu.edu/spring2024/papers/01-history/whatgoesaround-stonebraker.pdf)
- Best course: [CMU 15-445 Fall 2025](https://15445.courses.cs.cmu.edu/fall2025/schedule.html)

## 3. Streaming and event systems

**What it is.** Event-driven data plane. Logs are first-class storage
(Kafka, Pulsar), with consumers reading at their own pace. On top: stream
processors (Flink, Materialize, RisingWave, Feldera) that maintain stateful
queries with watermarks and exactly-once semantics.

**Subtopics.** Append-only logs · partitions · consumer groups · watermarks ·
event-time vs processing-time · stateful operators · exactly-once · change
data capture · backpressure · differential / incremental view maintenance ·
Iceberg-Kafka convergence (Tableflow).

**Why it matters.** Any system above pure batch — analytics, alerting,
fraud, payments, agents — sits on this. The Kafka log model reframes a lot
of backend architecture as "what's the source of truth?" The Akidau
watermark vocabulary now shows up in every data pipeline.

### Further reading

- [Jay Kreps — The Log: What every software engineer should know](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying)
- [Kafka 2011 paper](https://notes.stephenholiday.com/Kafka.pdf) · [KRaft consensus protocol](https://developers.redhat.com/articles/kraft-apache-kafkas-new-consensus-protocol)
- [Akidau — Streaming 101](https://www.oreilly.com/radar/the-world-beyond-batch-streaming-101/) · [Streaming 102](https://www.oreilly.com/radar/the-world-beyond-batch-streaming-102/)
- [Dataflow Model paper (VLDB 2015)](https://research.google/pubs/pub43864/)
- [Apache Flink 2.0 announcement (Mar 2025)](https://flink.apache.org/2025/03/24/apache-flink-2.0.0-a-new-era-of-real-time-data-processing/) · [Disaggregated state in Flink 2.0 (VLDB 2025)](https://dl.acm.org/doi/10.14778/3750601.3750609)
- [Materialize — differential dataflow](https://materialize.com/blog/differential-dataflow/) · [Naiad / Timely (SOSP 2013)](https://www.microsoft.com/en-us/research/wp-content/uploads/2013/11/naiad_sosp2013.pdf)
- [DBSP (Feldera, VLDB 2023)](https://www.vldb.org/pvldb/vol16/p1601-budiu.pdf) · [RisingWave architecture](https://docs.risingwave.com/docs/current/architecture/) · [WarpStream blog](https://www.warpstream.com/blog)
- [Frank McSherry — COST paper (HotOS 2015)](https://www.usenix.org/system/files/conference/hotos15/hotos15-paper-mcsherry.pdf) · [Jack Vanlightly blog](https://jack-vanlightly.com/)
- [Confluent — Tableflow (Iceberg ↔ Kafka)](https://www.confluent.io/blog/introducing-tableflow/)

## 4. Game engines and real-time graphics

**What it is.** Simulation and rendering under a hard real-time budget
(16.6 ms at 60 fps). Engines combine a fixed-step game loop, an
entity-component system for game state, scene graphs for transforms, a
render pipeline that feeds GPU command buffers, plus physics, animation,
audio, and asset pipelines.

**Subtopics.** Fixed-step loop · ECS · scene graphs · render pipeline ·
GPU command buffers · shaders · physics integration · animation systems ·
audio · asset pipelines · data-oriented design · profiling at frame
granularity.

**Why it matters.** The frame budget forces data-oriented design,
cache-friendly memory layouts, and explicit allocation strategies that most
servers never need. The lessons reach back into any latency-sensitive
system — perception engines, market-data plumbing, agent runtimes.

### Further reading

- [Game Programming Patterns (Nystrom)](https://gameprogrammingpatterns.com/contents.html) — free book by chapter
- [Richard Fabian — Data-Oriented Design](https://www.dataorienteddesign.com/dodbook/) — foundational for ECS intuition
- [Mike Acton — Data-Oriented Design (CppCon 2014)](https://www.youtube.com/watch?v=rX0ItVEVjHc)
- [Casey Muratori — Handmade Hero](https://hero.handmade.network/) — full engine from scratch in C
- [LearnOpenGL](https://learnopengl.com/) · [LearnWebGPU](https://eliemichel.github.io/LearnWebGPU/) · [Vulkan tutorial](https://vulkan-tutorial.com/)
- [Bevy book](https://bevy.org/learn/quick-start/introduction/) · [Bevy 0.14 → 0.15 migration](https://bevy.org/learn/migration-guides/0-14-to-0-15/) · [This Week in Bevy](https://thisweekinbevy.com/)
- [Godot — Internal Rendering Architecture](https://docs.godotengine.org/en/stable/engine_details/architecture/internal_rendering_architecture.html) · [Rendering Priorities (Sep 2024)](https://godotengine.org/article/rendering-priorities-september-2024/)
- [Steven Wittens — Acko.net](https://acko.net/blog/) — best modern WebGPU/reactive-render writing
- [Our Machinery blog archive](https://ruby0x1.github.io/machinery_blog_archive/) · [Ryg blog (Fabian Giesen)](https://fgiesen.wordpress.com/)
- [GDC Vault — free talks](https://www.gdcvault.com/free/free-vault)

## 5. Containers and orchestration

**What it is.** Process isolation built from Linux primitives (namespaces,
cgroups, overlay filesystems) plus an OCI runtime (runc) that turns
container images into running processes. Kubernetes is policy on top: a
declarative API server, a scheduler, and controllers that drive desired
state.

**Subtopics.** Namespaces (mount, PID, net, user, IPC, UTS, cgroup) · cgroups
v2 · OCI image + runtime specs · containerd · runc · overlay FS · K8s API
server / controller manager / scheduler · sidecars · in-place pod resize ·
admission webhooks · CRDs / operators · CNI / CSI.

**Why it matters.** Containers are the universal deploy substrate. Once
you write 100 lines of Go that runs a process in a namespace, the rest of
Kubernetes makes sense as policy on top of that primitive. The pattern —
*isolation primitives plus a control loop* — recurs in service meshes,
serverless platforms, and CI runners.

### Further reading

- [Liz Rice — Containers From Scratch (talk video)](https://www.youtube.com/watch?v=8fi7uSYlOdc) · [repo](https://github.com/lizrice/containers-from-scratch)
- [Julia Evans — How containers work zine](https://wizardzines.com/zines/containers/) · [containers tag](https://jvns.ca/categories/containers/)
- [Ivan Velichko — iximiuz container series](https://iximiuz.com/en/series/working-with-containers/) · [iximiuz Labs playgrounds](https://labs.iximiuz.com/)
- [runc source](https://github.com/opencontainers/runc) · [OCI runtime spec](https://github.com/opencontainers/runtime-spec) · [containerd architecture](https://github.com/containerd/containerd/blob/main/design/architecture.md)
- [Linux namespaces (man7)](https://man7.org/linux/man-pages/man7/namespaces.7.html) · [cgroups v2 (man7)](https://man7.org/linux/man-pages/man7/cgroups.7.html)
- [Borg paper (EuroSys 2015)](https://research.google/pubs/pub43438/) · [Kubernetes architecture](https://kubernetes.io/docs/concepts/architecture/) · [Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)
- [KEP-1287 In-place Pod Resize](https://github.com/kubernetes/enhancements/blob/master/keps/sig-node/1287-in-place-update-pod-resources/README.md) · [v1.35 GA blog](https://kubernetes.io/blog/2025/12/19/kubernetes-v1-35-in-place-pod-resize-ga)
- [KEP-753 Sidecar Containers (GA v1.33)](https://github.com/kubernetes/enhancements/tree/master/keps/sig-node/753-sidecar-containers)

## 6. Browsers (Chromium, Firefox, Servo)

**What it is.** A multi-process operating-system-on-an-OS that downloads,
parses, lays out, paints, and composites web content while sandboxing
untrusted code and running JavaScript / WebAssembly. Each tab is one or
more processes; site isolation puts each origin in its own process for
Spectre-class defenses.

**Subtopics.** HTML / CSS parsing · DOM · style resolution · layout
(RenderingNG / BlinkNG) · paint · compositor · GPU process · multi-tier JIT
(Sparkplug → Maglev → TurboFan) · garbage collection · site isolation /
OOPIFs · WebAssembly · WebGPU · service workers · IPC between processes.

**Why it matters.** The browser is the most complex piece of consumer
software shipped, and its render pipeline (parse → style → layout → paint →
composite) is the canonical visualization architecture. The JS engine tier
strategy (cheap baseline → optimised tier with deopt) shows up in every JIT.

### Further reading

- [Tali Garsiel — How browsers work (classic)](https://web.dev/articles/howbrowserswork)
- [Mariko Kosaka — Inside look at modern web browsers (4-part)](https://developer.chrome.com/blog/inside-browser-part1)
- [Life of a Pixel — Chromium rendering pipeline talk](https://bit.ly/lifeofapixel) ★ canonical talk
- [Chromium — RenderingNG architecture](https://developer.chrome.com/docs/chromium/renderingng-architecture) · [BlinkNG deep-dive](https://developer.chrome.com/docs/chromium/blinkng)
- [Chromium — Site Isolation](https://www.chromium.org/developers/design-documents/site-isolation/) · [OOPIFs](https://www.chromium.org/developers/design-documents/oop-iframes/)
- [V8 blog](https://v8.dev/blog) · [Ignition + TurboFan](https://v8.dev/blog/launching-ignition-and-turbofan) · [Maglev](https://v8.dev/blog/maglev) · [Holiday Season 2023 (4-tier recap)](https://v8.dev/blog/holiday-season-2023)
- [Mathias Bynens — shapes & inline caches](https://mathiasbynens.be/notes/shapes-ics)
- [Lin Clark — A cartoon intro to WebAssembly](https://hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly/) · [Inside Quantum CSS](https://hacks.mozilla.org/2017/08/inside-a-super-fast-css-engine-quantum-css-aka-stylo/)
- [The Servo Book](https://book.servo.org/) · [Servo Revival 2023-24 (Igalia)](https://blogs.igalia.com/mrego/servo-revival-2023-2024/) · [This month in Servo](https://servo.org/blog/)
- [WebAssembly spec](https://webassembly.github.io/spec/core/) · [wasmtime](https://github.com/bytecodealliance/wasmtime)
- [Surma — Things to know about browser internals](https://surma.dev/things/)

## 7. Compilers and language runtimes

**What it is.** Source code → tokens → AST → IR (often multiple — AST →
HIR → MIR → LLVM IR → machine code) → optimisation passes → codegen.
Runtimes add GC, JIT tiering, dynamic dispatch, async schedulers, and (in
Rust's case) borrow checking.

**Subtopics.** Lexer · parser · AST · IR (SSA, sea-of-nodes, MLIR) ·
optimization passes (inlining, LICM, vectorization) · register allocation ·
codegen · GC algorithms (mark/sweep, generational, concurrent, Whippet) ·
JIT tiering · type inference · borrow checking · effect systems · MLIR for
ML compilers.

**Why it matters.** Compilers are the most "textbook actually maps to the
code" subfield. The vocabulary (SSA, dominator trees, escape analysis,
tier-up) carries over directly into JIT engines, query optimizers,
ML compilers (XLA, Triton, MLIR), and shader compilers.

**For the runtime side specifically** — JIT tiering, GC, scheduling,
isolation, observability across V8 / JVM / Go / BEAM / vLLM / Workers as
one unified shape — see the dedicated [Runtime roadmap](./runtime-roadmap.md).

### Further reading

- [Crafting Interpreters (Nystrom)](https://craftinginterpreters.com/contents.html) — free book by chapter; start here
- [LLVM Kaleidoscope tutorial](https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html) · [LLVM Language Reference](https://llvm.org/docs/LangRef.html)
- [MLIR Toy Tutorial](https://mlir.llvm.org/docs/Tutorials/Toy/) — modern "Kaleidoscope" for multi-level IR
- [Chris Lattner — Democratizing AI Compute (14-part 2025 series)](https://www.modular.com/democratizing-ai-compute) — GPU compilers, CUDA, Triton, MLIR
- [Cranelift IR ref](https://github.com/bytecodealliance/wasmtime/blob/main/cranelift/docs/ir.md) · [Cranelift docs](https://cranelift.dev/)
- [Cliff Click — Sea of Nodes paper](https://www.oracle.com/technetwork/java/javase/tech/c2-ir95-150110.pdf) · [Simple teaching codebase](https://github.com/SeaOfNodes/Simple)
- [Niko Matsakis — babysteps](https://smallcultfollowing.com/babysteps/) · [Polonius 2026 project goal](https://rust-lang.github.io/rust-project-goals/2026/polonius.html)
- [Rust Project Goals blog](https://blog.rust-lang.org/) · [Carbon language design docs](https://github.com/carbon-language/carbon-lang/tree/trunk/docs/design)
- [Andy Wingo — wingolog (Whippet GC series)](https://wingolog.org/tags/whippet) · [Memory Management Reference](https://www.memorymanagement.org/)
- [Eli Bendersky — compilers-internals tag](https://eli.thegreenplace.net/tag/compilers-internals)

## 8. Operating systems and kernels

**What it is.** The contracts every layer above relies on: processes and
threads, virtual memory, schedulers, filesystems, syscalls, drivers. Modern
Linux adds eBPF as a safe, in-kernel extension mechanism — sandboxed
programs attached to tracepoints, kprobes, and (now) the scheduler.

**Subtopics.** Processes & threads · virtual memory & page tables ·
schedulers (CFS, EEVDF, sched_ext) · syscalls & ABI · VFS · page cache ·
block layer & io_uring · drivers · namespaces & cgroups · eBPF · BPF CO-RE ·
Rust for Linux · kernel/userspace boundary · interrupts & softirqs.

**Why it matters.** Every layer above relies on these abstractions; once
you read xv6 the "magic" turns into mechanism. The eBPF model in
particular has eaten observability and is moving into scheduling and
networking — kernel extensibility is now a thing application engineers
ship.

### Further reading

- [Operating Systems: Three Easy Pieces (OSTEP)](https://pages.cs.wisc.edu/~remzi/OSTEP/) — free, by chapter PDF
- [MIT 6.1810 Fall 2025 — xv6](https://pdos.csail.mit.edu/6.1810/2025/) · [xv6 book PDF](https://pdos.csail.mit.edu/6.1810/2025/xv6/book-riscv-rev4.pdf)
- [LWN Kernel Index](https://lwn.net/Kernel/Index/) · [LWN weekly](https://lwn.net/)
- [Kerrisk — man pages](https://man7.org/linux/man-pages/) · [Kerrisk articles (historical, ~2016)](https://man7.org/articles/)
- [Brendan Gregg — blog](https://www.brendangregg.com/blog/) · [Linux perf tools](https://www.brendangregg.com/linuxperf.html) · [Linux Crisis Tools (2024)](https://www.brendangregg.com/blog/2024-03-17/linux-crisis-tools.html)
- [Andrii Nakryiko — BPF CO-RE reference](https://nakryiko.com/posts/bpf-core-reference-guide/) · [BPF category](https://nakryiko.com/categories/bpf/)
- [ebpf.io docs](https://ebpf.io/) · [sched_ext kernel docs](https://www.kernel.org/doc/html/next/scheduler/sched-ext.html) · [Rust for Linux](https://rust-for-linux.com/)
- [Linux Plumbers 2025 — eBPF track](https://lpc.events/event/19/sessions/235/)
- [Julia Evans — kernel posts](https://jvns.ca/categories/kernel/) · [Phil Opp — Writing an OS in Rust](https://os.phil-opp.com/)

## 9. Networking and protocols

**What it is.** Moving bytes across machines reliably and securely. The
classic stack: IP at L3, TCP/UDP at L4, TLS for security, HTTP for
application semantics. The 2020s addition: QUIC (UDP-based, integrated TLS,
no head-of-line blocking) and HTTP/3 on top of it, redesigning what was
TCP+TLS+HTTP/2 as one protocol.

**Subtopics.** TCP · congestion control (CUBIC, BBR) · UDP · TLS 1.3
handshake · HTTP/1.1 → /2 → /3 · QUIC streams & connection migration · HTTP
priorities · BGP and RPKI · NAT traversal · WebRTC · DNS over HTTPS.

**Why it matters.** Every distributed system inherits networking's failure
modes. Reading the QUIC RFC after years of HTTP/2 is the cleanest
demonstration of why a protocol redesign matters: connection migration,
zero-RTT resumption, and getting head-of-line blocking out of L4 all flow
from one decision.

### Further reading

- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/) — free, by section
- [Ilya Grigorik — High Performance Browser Networking](https://hpbn.co/) — free, by chapter
- [Cloudflare networking tag](https://blog.cloudflare.com/tag/networking/)
- [Cloudflare — HTTP/3: past, present, future](https://blog.cloudflare.com/http3-the-past-present-and-future/)
- [Cloudflare — Async QUIC and HTTP/3 with tokio-quiche (2025)](https://blog.cloudflare.com/async-quic-and-http-3-made-easy-tokio-quiche-is-now-open-source/)
- [Cloudflare — Is BGP Safe Yet? (RPKI)](https://blog.cloudflare.com/is-bgp-safe-yet-rpki-routing-security-initiative/) · [Route leak detection](https://blog.cloudflare.com/route-leak-detection-with-cloudflare-radar/)
- [RFC 9000 — QUIC](https://www.rfc-editor.org/rfc/rfc9000.html) · [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html) · [RFC 9113 — HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html) · [RFC 9218 — HTTP Priorities](https://www.rfc-editor.org/rfc/rfc9218.html)
- [The Illustrated TLS 1.3](https://tls13.xargs.org/) · [Illustrated QUIC](https://quic.xargs.org/)
- [Stanford CS144 — build a TCP](https://cs144.github.io/)
- [Tailscale — How NAT traversal works](https://tailscale.com/blog/how-nat-traversal-works) · [How Tailscale works](https://tailscale.com/blog/how-tailscale-works)
- [Julia Evans — networking posts](https://jvns.ca/categories/networking/)

## 10. Distributed systems

**What it is.** Multiple machines cooperating under failure. The core
primitives: consensus (Raft, Paxos, Viewstamped Replication) for agreement
on a sequence; replication for durability and read scaling; 2PC and
saga-style coordination for cross-shard transactions; gossip + vector
clocks for weakly-consistent state.

**Subtopics.** Consensus (Raft, Paxos, VR, Egalitarian Paxos) · log
replication · MVCC across nodes · isolation/consistency models (linearisable,
serialisable, snapshot isolation) · 2PC · sagas · CRDTs · gossip · vector
clocks · clock uncertainty (TrueTime) · metastability · failure detectors ·
chaos engineering & Jepsen.

**Why it matters.** Every backend above a few machines is a distributed
system whether the author admits it or not. Most production outages live
in this domain — partial failures, asymmetric partitions, hot ranges,
metastable convergence loops.

### Further reading

- [MIT 6.5840 — papers + lecture videos](https://pdos.csail.mit.edu/6.824/) · [playlist](https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB)
- [Heidi Howard — Distributed Consensus Reading List](https://heidihoward.github.io/distributed-consensus-reading-list/) — curated map of Paxos/Raft variants
- [Mikito Takada — Distributed Systems for Fun and Profit](http://book.mixu.net/distsys/) — free, by chapter
- [Murat Demirbas — Metadata blog](http://muratbuffalo.blogspot.com/)
- [Marc Brooker](https://brooker.co.za/blog/) · [Metastability post](https://brooker.co.za/blog/2021/05/24/metastable.html) · [Consensus is Harder Than It Looks](https://brooker.co.za/blog/2020/10/05/consensus.html) · [Aurora DSQL Vignettes](https://brooker.co.za/blog/2024/12/03/aurora-dsql.html)
- [Aphyr — Jepsen analyses](https://jepsen.io/analyses) · ["Call me maybe" series](https://aphyr.com/tags/jepsen) · [Strong consistency models](https://aphyr.com/posts/313-strong-consistency-models)
- [AWS Builders' Library](https://aws.amazon.com/builders-library/) · [Jeff Dean — LADIS 2009 keynote](https://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf)
- [Inkandswitch / Kleppmann — Local-first software](https://www.inkandswitch.com/essay/local-first/)
- [Raft paper](https://raft.github.io/raft.pdf) · [Raft visualizer](https://raft.github.io/) · [Paxos Made Simple](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)
- [Lamport — Time, Clocks, and the Ordering of Events](https://lamport.azurewebsites.net/pubs/time-clocks.pdf) · [TLA+ video course](https://lamport.azurewebsites.net/video/videos.html)
- [Awesome Distributed Systems](https://github.com/theanalyst/awesome-distributed-systems)

## 11. Build systems and developer tooling

**What it is.** The plumbing that turns source into running software fast.
Modern build systems (Bazel, Buck2, Pants) are *content-addressed
incremental graph engines* with remote execution and caching. Language
servers (LSP) decouple editor UI from language intelligence; tree-sitter
gives every editor incremental parsing.

**Subtopics.** Incremental compilation · content-addressed caches ·
hermeticity · remote execution · monorepo tooling · Bazel / Bzlmod · Buck2 ·
Pants · Ninja · Nix and flakes · LSP · tree-sitter · build graph debugging ·
test selection · CI caching.

**Why it matters.** Tooling is leverage. A 30-second build vs a 30-minute
build changes how you architect everything else — what's a microservice,
what's a module, how often you refactor. The same content-addressed cache
ideas now show up in CI pipelines, ML training, and inference.

### Further reading

- [Build Systems à la Carte (Mokhov, Mitchell, Peyton Jones)](https://www.microsoft.com/en-us/research/uploads/prod/2018/03/build-systems.pdf)
- [Bazel concepts](https://bazel.build/concepts/build-ref) · [Hermeticity](https://bazel.build/basics/hermeticity) · [Bzlmod migration guide](https://bazel.build/external/migration)
- [What's new with Bzlmod? (Bazel blog)](https://blog.bazel.build/2023/07/24/whats-new-with-bzlmod.html) · [EngFlow Bzlmod posts](https://blog.engflow.com/2024/06/27/migrating-to-bazel-modules-aka-bzlmod---the-easy-parts/)
- [Tweag — How to keep a Bazel project hermetic](https://www.tweag.io/blog/2022-09-15-hermetic-bazel/)
- [Ninja design notes](https://ninja-build.org/manual.html#_design)
- [nix.dev](https://nix.dev/) · [Nix manual](https://nixos.org/manual/nix/stable/) · [Dolstra Nix LISA 2004 paper](https://edolstra.github.io/pubs/nspfssd-lisa2004-final.pdf) · [Flakes RFC 0049](https://github.com/NixOS/rfcs/pull/49)
- [LSP index](https://microsoft.github.io/language-server-protocol/) · [3.18 spec](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.18/specification/)
- [tree-sitter docs](https://tree-sitter.github.io/tree-sitter/) · [playground](https://tree-sitter.github.io/tree-sitter/playground)
- [Buck2 — Open-sourcing (Meta engineering, 2023)](https://engineering.fb.com/2023/04/06/open-source/buck2-open-source-large-scale-build-system/) · [5 things you didn't know](https://engineering.fb.com/2023/10/23/developer-tools/5-things-you-didnt-know-about-buck2/) · [Buck2 docs](https://buck2.build/docs/) · [Neil Mitchell — Accelerating Builds with Buck2 (DPE 2025)](https://dpe.org/sessions/neil-mitchell/accelerating-builds-with-buck2/) · [awesome-buck2](https://github.com/sluongng/awesome-buck2)
- [Pants v2 intro](https://www.pantsbuild.org/blog/2020/10/27/introducing-pants-v2) · [Apple — Introducing Pkl](https://pkl-lang.org/blog/introducing-pkl.html)

## 12. Cryptography (applied)

**What it is.** Using cryptographic primitives correctly without rolling
your own. The 2024–2025 story is dominated by **post-quantum migration**:
NIST finalised ML-KEM (key encapsulation), ML-DSA (signatures), and
SLH-DSA (hash-based signatures); Signal shipped PQXDH and SPQR; TLS/SSH
hybrids are in production.

**Subtopics.** Symmetric & asymmetric primitives · hashes · AEAD (AES-GCM,
ChaCha20-Poly1305) · KDF (HKDF, Argon2) · signatures · TLS 1.3 handshake ·
PAKE · MLS (group messaging) · post-quantum (ML-KEM, ML-DSA, SLH-DSA) ·
hybrid KEMs · ZKPs (SNARK / STARK) · side channels · constant-time
implementations.

**Why it matters.** You don't roll your own crypto, but you choose
primitives, defend against misuse, and now plan a post-quantum migration.
Knowing how primitives compose lets you spot misuse: padding oracles, ECB
modes, AES-GCM nonce reuse, hash-truncation forgeries.

### Further reading

- [Cryptopals challenges (sets 1–8)](https://cryptopals.com/) — hands-on
- [Matthew Green — Cryptographic Engineering blog](https://blog.cryptographyengineering.com/) ★ best applied-crypto blog
- [latacora — Cryptographic Right Answers (2018)](https://www.latacora.com/blog/2018/04/03/cryptographic-right-answers/) · [Post-Quantum Edition (Aug 2024)](https://www.latacora.com/blog/post-quantum-cryptographic-right-answers/)
- [latacora blog](https://www.latacora.com/blog/) · [Filippo Valsorda — words.filippo.io](https://words.filippo.io/)
- [The Illustrated TLS 1.3 Connection](https://tls13.xargs.org/)
- [Trail of Bits — cryptography category](https://blog.trailofbits.com/categories/cryptography/)
- [NIST — First 3 Finalized PQC Standards (Aug 2024)](https://www.nist.gov/news-events/news/2024/08/nist-releases-first-3-finalized-post-quantum-encryption-standards) — FIPS 203/204/205
- [Signal — PQXDH (2023)](https://signal.org/blog/pqxdh/) · [SPQR / Triple Ratchet (2025)](https://signal.org/blog/spqr/)
- [RFC 9420 — MLS](https://datatracker.ietf.org/doc/rfc9420/) · [Phoenix — RFC 9420 / MLS overview](https://blog.phnx.im/rfc-9420-mls/)
- [Real World Crypto 2025 program](https://rwc.iacr.org/2025/program.php) · [IACR YouTube playlists](https://www.youtube.com/@TheIACR/playlists)
- [Vitalik Buterin — How does a SNARK work?](https://vitalik.eth.limo/general/2021/01/26/snarks.html) · [Ethereum quantum-resistance roadmap](https://ethereum.org/roadmap/future-proofing/quantum-resistance/)

---

## How to use this map

1. **Read every domain's intro** so you have the vocabulary even for
   domains you won't specialise in.
2. **Pick 2–3 to go deep on.** Coherent combos:
   - DB + LLMs + Streaming = "AI infra" track
   - OS + Compilers + Networking = "low-level systems" track
   - Browsers + Game Engines + Crypto = "client / shipping software" track
3. **For each deep domain, branch a dedicated roadmap** in the
   [DB roadmap](./db-roadmap.md) shape: phases, deliverables, drills,
   one synthesis project.
4. **Don't read passively.** Each deep domain should produce at least one
   piece of code or written explainer that survives after the reading does.

---

## References

Heavier reads — books and full courses. Don't block the map on these.

**Cross-domain craft**
- *A Philosophy of Software Design* — John Ousterhout — [site](https://web.stanford.edu/~ouster/cgi-bin/book.php)
- *The Art of Unix Programming* — Eric Raymond — [free online](http://www.catb.org/~esr/writings/taoup/html/)
- *Programming Pearls* — Jon Bentley
- *Hacker's Delight* — Henry Warren — [site](https://www.hackersdelight.org/)
- *Working Effectively with Legacy Code* — Michael Feathers
- *Computer Systems: A Programmer's Perspective (CS:APP)* — [site](https://csapp.cs.cmu.edu/)
- *Systems Performance, 2nd ed* — Brendan Gregg — [site](https://www.brendangregg.com/systems-performance-2nd-edition-book.html)

**By domain**
- *Designing Data-Intensive Applications* — Kleppmann — [site](https://dataintensive.net/) (DBs, distributed, streaming)
- *Database Internals* — Petrov — [site](https://www.databass.dev/)
- *Streaming Systems* — Akidau et al. (O'Reilly)
- *Game Engine Architecture, 3rd ed* — Jason Gregory — [site](https://www.gameenginebook.com/)
- *Real-Time Rendering, 4th ed* — [site](https://www.realtimerendering.com/)
- *Physically Based Rendering, 4th ed* — Pharr, Jakob, Humphreys — [free online](https://pbr-book.org/)
- *Engineering a Compiler, 3rd ed* — Cooper & Torczon
- *The Garbage Collection Handbook* — Jones, Hosking, Moss — [site](https://gchandbook.org/)
- *OSTEP* — Arpaci-Dusseau — [free online](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- *The Linux Programming Interface* — Kerrisk — [site](https://man7.org/tlpi/)
- *Computer Networking: A Top-Down Approach* — Kurose & Ross — [site](https://gaia.cs.umass.edu/kurose_ross/index.html)
- *HTTP/3 Explained* — Daniel Stenberg — [free booklet](https://http3-explained.haxx.se/)
- *Real-World Cryptography* — David Wong
- *A Graduate Course in Applied Cryptography* — Boneh & Shoup — [free online](https://toc.cryptobook.us/)

**Courses**
- [CMU 15-445 / 15-721](https://15445.courses.cs.cmu.edu/) (databases)
- [MIT 6.5840](https://pdos.csail.mit.edu/6.824/) (distributed systems)
- [MIT 6.1810](https://pdos.csail.mit.edu/6.1810/2025/) (OS)
- [Stanford CS143](https://web.stanford.edu/class/cs143/) (compilers)
- [Stanford CS144](https://cs144.github.io/) (networking)
- [Stanford CS336](https://stanford-cs336.github.io/spring2024/) (LLMs from scratch)

---

## Maintenance notes

- URLs that rotate yearly: CMU 15-445, MIT 6.1810, Lucene codec, Stanford
  CS336. Re-pin annually.
- *The Morning Paper* (acolyer.org) is **inactive since Feb 2021** —
  Heidi Howard's reading list, Murat Demirbas, and Marc Brooker are the
  living substitutes for "annotated paper of the day."
- For broken URLs: try the Wayback Machine before deleting.
