#!/usr/bin/env node
/**
 * Idempotently apply the 2026 eleven-domain curriculum expansion.
 *
 * Source of truth for the requested-topic mapping:
 *   src/data/curriculum-coverage.json
 *
 * Run:
 *   pnpm expand:learning-domains
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src/data');
const source = 'learning-domain-expansion-v1';

const paths = {
  concepts: join(dataDir, 'concepts.json'),
  drills: join(dataDir, 'drills.json'),
  reviews: join(dataDir, 'review-questions.json'),
  artifacts: join(dataDir, 'artifacts.json'),
  roadmaps: join(dataDir, 'roadmaps.json'),
  coverage: join(dataDir, 'curriculum-coverage.json'),
};

function read(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function write(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Definition tuple:
 * id, name, primary track, topic tag, description, mental model,
 * canonical source title, canonical source URL, drill outline keys.
 */
const DEFINITIONS = [
  [
    'operating-system-mechanics',
    'Operating System Mechanics',
    'systems-foundations',
    'operating-systems',
    'Processes, threads, virtual memory, scheduling, filesystems, syscalls, and kernel boundaries.',
    'An operating system multiplexes hardware while enforcing isolation. Processes, virtual memory, schedulers, and filesystems are policies built on CPU, memory, and device mechanisms.',
    'Operating Systems: Three Easy Pieces',
    'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    ['processModel', 'memoryModel', 'ioPath'],
  ],
  [
    'network-protocol-engineering',
    'Network Protocol Engineering',
    'systems-foundations',
    'networking',
    'Packet flow across Ethernet, IP, TCP/QUIC, TLS, DNS, HTTP, load balancers, and application protocols.',
    'Networks are layered state machines under delay, loss, duplication, and reordering. Reliability comes from explicit framing, identity, timeouts, congestion control, and retry semantics.',
    'High Performance Browser Networking',
    'https://hpbn.co/',
    ['protocolLayers', 'failureHandling', 'latencyBudget'],
  ],
  [
    'compute-memory-storage-hierarchy',
    'Compute, Memory & Storage Hierarchy',
    'systems-foundations',
    'hardware',
    'CPU caches, NUMA, DRAM, GPU memory, NVMe, object storage, and the movement costs between them.',
    'Performance is usually data movement. Each level trades capacity and durability for latency and bandwidth, so placement decisions must follow the working set and access pattern.',
    'What Every Programmer Should Know About Memory',
    'https://akkadia.org/drepper/cpumemory.pdf',
    ['workingSet', 'dataMovement', 'bottleneck'],
  ],
  [
    'runtime-performance-engineering',
    'Runtime & Performance Engineering',
    'systems-foundations',
    'performance',
    'Profiling, allocation, JIT/AOT execution, garbage collection, scheduling, contention, and tail latency.',
    'Performance work starts with a workload and a profile. Optimize the dominant resource, preserve correctness, and measure throughput, tail latency, memory, and cost together.',
    'Brendan Gregg — Linux Performance',
    'https://www.brendangregg.com/linuxperf.html',
    ['workload', 'profile', 'measurement'],
  ],
  [
    'security-isolation-boundaries',
    'Security & Isolation Boundaries',
    'systems-foundations',
    'security',
    'Threat models, least privilege, capabilities, process and VM isolation, side channels, and secure defaults.',
    'Security is control over authority and information flow. Define the adversary, minimize ambient privilege, isolate tenants, validate boundaries, and fail closed.',
    'gVisor Architecture Guide',
    'https://gvisor.dev/docs/architecture_guide/',
    ['threatModel', 'trustBoundary', 'leastPrivilege'],
  ],
  [
    'cloud-infrastructure',
    'Cloud Infrastructure',
    'infrastructure-platforms',
    'cloud',
    'Regions, zones, networks, compute, managed storage, identity, load balancing, and control planes.',
    'Cloud systems are distributed resource managers with failure domains. Architecture should make placement, identity, state ownership, and regional recovery explicit.',
    'AWS Builders Library',
    'https://aws.amazon.com/builders-library/',
    ['failureDomains', 'statePlacement', 'recoveryPlan'],
  ],
  [
    'containers-kubernetes',
    'Containers & Kubernetes',
    'infrastructure-platforms',
    'containers',
    'Namespaces, cgroups, OCI images, container runtimes, Kubernetes scheduling, controllers, networking, and storage.',
    'A container is an isolated process; Kubernetes is a reconciliation system that continuously drives observed state toward declared state.',
    'Kubernetes Concepts',
    'https://kubernetes.io/docs/concepts/',
    ['isolationPrimitive', 'desiredState', 'reconciliation'],
  ],
  [
    'cicd-developer-environments',
    'CI/CD & Developer Environments',
    'infrastructure-platforms',
    'delivery',
    'Hermetic builds, reproducible environments, test gates, artifacts, previews, progressive delivery, and rollback.',
    'A delivery pipeline converts source into a traceable artifact through reproducible gates. Promotion should move the same artifact, not rebuild it differently in each environment.',
    'GitHub Actions Documentation',
    'https://docs.github.com/en/actions',
    ['reproducibleBuild', 'qualityGates', 'rollback'],
  ],
  [
    'platform-scheduling-orchestration',
    'Scheduling & Orchestration',
    'infrastructure-platforms',
    'orchestration',
    'Placement, queues, priorities, quotas, fairness, preemption, autoscaling, and reconciliation loops.',
    'Schedulers match constrained work to finite resources. Good orchestration separates desired state, placement policy, execution, observation, and correction.',
    'Large-scale cluster management at Google with Borg',
    'https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/',
    ['resourceModel', 'placementPolicy', 'fairness'],
  ],
  [
    'reliability-fault-tolerance',
    'Reliability & Fault Tolerance',
    'infrastructure-platforms',
    'reliability',
    'SLOs, error budgets, redundancy, graceful degradation, overload control, and failure-domain design.',
    'Reliability is a measurable product property. Define an SLO, budget failure, isolate fault domains, shed optional work, and test recovery before incidents.',
    'Google Site Reliability Engineering',
    'https://sre.google/sre-book/table-of-contents/',
    ['slo', 'failureDomain', 'degradationMode'],
  ],
  [
    'opentelemetry-observability',
    'Observability & OpenTelemetry',
    'infrastructure-platforms',
    'observability',
    'Metrics, logs, traces, context propagation, semantic conventions, sampling, collectors, and telemetry pipelines.',
    'Observability reconstructs a request across boundaries. OpenTelemetry standardizes signals and context so instrumentation is portable and correlations survive service hops.',
    'OpenTelemetry Documentation',
    'https://opentelemetry.io/docs/',
    ['signals', 'contextPropagation', 'sampling'],
  ],
  [
    'sandbox-execution-environments',
    'Sandboxes & Execution Environments',
    'infrastructure-platforms',
    'sandboxes',
    'Processes, containers, microVMs, V8 isolates, WebAssembly, capabilities, quotas, and untrusted-code execution.',
    'A sandbox is a capability boundary plus resource accounting. Isolation strength, startup cost, syscall surface, and density must match the threat model.',
    'Wasmtime Security',
    'https://docs.wasmtime.dev/security.html',
    ['threatModel', 'capabilities', 'resourceLimits'],
  ],
  [
    'infrastructure-automation',
    'Infrastructure Automation',
    'infrastructure-platforms',
    'infrastructure-as-code',
    'Declarative infrastructure, state, plans, drift detection, policy checks, secrets boundaries, and safe changes.',
    'Infrastructure automation is a convergent state machine. Desired configuration, observed state, diff, approval, and rollback must all be inspectable.',
    'Terraform Language Documentation',
    'https://developer.hashicorp.com/terraform/language',
    ['desiredState', 'driftDetection', 'changeSafety'],
  ],
  [
    'event-streaming-kafka',
    'Event Streaming & Kafka',
    'distributed-systems',
    'event-streaming',
    'Partitioned logs, producers, consumer groups, offsets, ordering, delivery semantics, backpressure, and stream processing.',
    'Kafka turns an append-only log into a coordination boundary. Ordering is per partition, progress is an offset, and consumers own replay and idempotency.',
    'Kafka: a Distributed Messaging System',
    'https://notes.stephenholiday.com/Kafka.pdf',
    ['partitioning', 'deliverySemantics', 'consumerRecovery'],
  ],
  [
    'distributed-workflows-temporal',
    'Distributed Workflows & Temporal',
    'distributed-systems',
    'durable-workflows',
    'Durable execution, event histories, deterministic replay, activities, retries, timers, and long-running workflows.',
    'A durable workflow persists decisions as history and replays deterministic code after failure. Side effects live in retryable activities with explicit idempotency.',
    'Temporal Documentation',
    'https://docs.temporal.io/',
    ['workflowHistory', 'deterministicReplay', 'activityIdempotency'],
  ],
  [
    'distributed-failure-recovery',
    'Distributed Failure Recovery',
    'distributed-systems',
    'failure-recovery',
    'Partial failure, timeouts, retries, deduplication, fencing, repair, anti-entropy, and disaster recovery.',
    'In a distributed system, failure is ambiguous. Recovery needs bounded retries, unique operation identity, stale-writer fencing, repair mechanisms, and tested restore objectives.',
    'Jepsen Analyses',
    'https://jepsen.io/analyses',
    ['failureDetection', 'duplicateControl', 'repairPath'],
  ],
  [
    'transaction-processing',
    'Transaction Processing',
    'databases',
    'transactions',
    'ACID, MVCC, isolation anomalies, locking, optimistic control, serializability, commit, and recovery.',
    'A transaction provides an illusion over concurrency and failure. Isolation defines which histories are legal; logging and commit protocols decide what survives.',
    'PostgreSQL Transaction Isolation',
    'https://www.postgresql.org/docs/current/transaction-iso.html',
    ['isolationLevel', 'concurrencyControl', 'commitRecovery'],
  ],
  [
    'query-execution-optimization',
    'Query Execution & Optimization',
    'databases',
    'query-planning',
    'Logical and physical plans, cardinality estimation, join ordering, indexes, vectorized execution, and spilling.',
    'A query optimizer searches physical plans using imperfect estimates. Execution quality depends on access paths, join order, memory budgets, and fallback under estimation error.',
    'Architecture of a Database System',
    'https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf',
    ['logicalPlan', 'costModel', 'physicalExecution'],
  ],
  [
    'warehouses-lakehouses',
    'Data Warehouses & Lakehouses',
    'databases',
    'analytics',
    'Columnar files, table formats, storage-compute separation, batch execution, metadata, governance, and lakehouse architecture.',
    'Warehouses optimize governed analytical execution; lakehouses place open table metadata over object storage. Both depend on pruning, columnar scans, and reliable metadata.',
    'Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores',
    'https://www.vldb.org/pvldb/vol13/p3411-armbrust.pdf',
    ['storageFormat', 'metadataLayer', 'queryExecution'],
  ],
  [
    'ml-pretraining',
    'Model Pre-training',
    'ai-systems',
    'training',
    'Data mixtures, next-token objectives, scaling laws, distributed training, checkpoints, and training stability.',
    'Pre-training converts data and compute into general capability. The core loop is data sampling, forward/backward passes, optimizer updates, checkpointing, and continuous loss/quality diagnosis.',
    'Stanford CS336 — Language Modeling from Scratch',
    'https://cs336.stanford.edu/',
    ['dataMixture', 'trainingLoop', 'scalingPlan'],
  ],
  [
    'model-quantization',
    'Model Quantization',
    'ai-systems',
    'compression',
    'Post-training and quantization-aware methods, integer and low-bit formats, calibration, kernels, and quality trade-offs.',
    'Quantization stores and computes approximate weights or activations with fewer bits. The serving win is real only when hardware kernels support the format and evals bound quality loss.',
    'Hugging Face Transformers — Quantization',
    'https://huggingface.co/docs/transformers/main/en/quantization/overview',
    ['numericFormat', 'calibration', 'qualityGate'],
  ],
  [
    'open-weight-models',
    'Open-Weight Models',
    'ai-systems',
    'open-models',
    'Model cards, licenses, weights, tokenizers, chat templates, adapters, provenance, and reproducible packaging.',
    'Open weights provide inspectable parameters, not automatically open data or unrestricted rights. Selection must include license, provenance, tokenizer, template, eval, and hardware fit.',
    'Hugging Face Model Cards',
    'https://huggingface.co/docs/hub/model-cards',
    ['license', 'provenance', 'runtimeFit'],
  ],
  [
    'inference-engines',
    'vLLM & Inference Engines',
    'inference-serving',
    'inference-engines',
    'Request scheduling, model execution, memory management, distributed serving, APIs, and engine architecture.',
    'An inference engine is a runtime: it schedules requests, owns model and KV memory, dispatches kernels, exposes metrics, and enforces admission control.',
    'vLLM Documentation',
    'https://docs.vllm.ai/',
    ['requestScheduler', 'memoryManager', 'executionBackend'],
  ],
  [
    'continuous-batching',
    'Continuous Batching',
    'inference-serving',
    'batching',
    'Iteration-level scheduling, dynamic admission, prefill/decode interleaving, chunked prefill, and fairness.',
    'Continuous batching changes the batch after each decoding step, filling freed slots without waiting for the slowest request. Throughput improves at the cost of scheduler complexity.',
    'vLLM: Easy, Fast, and Cheap LLM Serving',
    'https://blog.vllm.ai/2023/06/20/vllm.html',
    ['admissionPolicy', 'prefillDecode', 'fairness'],
  ],
  [
    'kv-cache-paged-attention',
    'KV Caching & PagedAttention',
    'inference-serving',
    'kv-cache',
    'Attention-state reuse, KV memory sizing, paging, fragmentation, prefix caching, eviction, and multi-tenant pressure.',
    'The KV cache trades memory for avoided recomputation. PagedAttention maps logical token blocks to non-contiguous physical pages so variable-length requests waste less memory.',
    'Efficient Memory Management for Large Language Model Serving with PagedAttention',
    'https://arxiv.org/abs/2309.06180',
    ['cacheSizing', 'pageMapping', 'evictionPolicy'],
  ],
  [
    'flashattention-kernels',
    'FlashAttention & Attention Kernels',
    'inference-serving',
    'gpu-kernels',
    'IO-aware tiling, fused kernels, SRAM/HBM movement, numerical stability, and hardware-aware attention.',
    'FlashAttention is exact attention reorganized around the memory hierarchy. Tiling and fusion reduce expensive HBM traffic without materializing the full attention matrix.',
    'FlashAttention',
    'https://arxiv.org/abs/2205.14135',
    ['memoryTraffic', 'tiling', 'numericalStability'],
  ],
  [
    'speculative-decoding',
    'Speculative Decoding',
    'inference-serving',
    'decoding',
    'Draft models, token verification, acceptance rates, tree speculation, latency, and quality preservation.',
    'A cheap draft proposes several tokens and the target model verifies them in parallel. Speedup depends on acceptance rate and verification cost while preserving the target distribution.',
    'Fast Inference from Transformers via Speculative Decoding',
    'https://arxiv.org/abs/2211.17192',
    ['draftStrategy', 'verification', 'acceptanceRate'],
  ],
  [
    'gpu-utilization',
    'GPU Utilization',
    'inference-serving',
    'gpu',
    'Compute occupancy, memory bandwidth, kernel launch overhead, tensor parallelism, profiling, and saturation.',
    'GPU utilization is not one percentage. Profile kernel occupancy, memory bandwidth, queue gaps, communication, and batch shape to find whether the workload is compute-, memory-, or launch-bound.',
    'NVIDIA Nsight Systems Documentation',
    'https://docs.nvidia.com/nsight-systems/',
    ['profile', 'bottleneckClass', 'saturationPlan'],
  ],
  [
    'inference-cost-latency',
    'Inference Cost & Latency Optimization',
    'inference-serving',
    'serving-economics',
    'Time to first token, inter-token latency, throughput, tail latency, utilization, quality, and cost per request.',
    'Serving optimization is a constrained frontier: quality, TTFT, token latency, throughput, availability, and cost must be measured on the same representative workload.',
    'Hugging Face — LLM Inference Optimization',
    'https://huggingface.co/docs/transformers/main/en/llm_optims',
    ['workload', 'latencyBreakdown', 'costModel'],
  ],
  [
    'local-on-device-inference',
    'Local & On-device Inference',
    'inference-serving',
    'on-device',
    'llama.cpp, WebGPU, mobile accelerators, model formats, privacy, offline operation, and constrained memory.',
    'On-device inference trades cloud elasticity for privacy, offline latency, and strict memory/energy budgets. Model format, quantization, kernels, and thermal limits become product constraints.',
    'llama.cpp',
    'https://github.com/ggml-org/llama.cpp',
    ['modelFormat', 'memoryBudget', 'deviceFallback'],
  ],
  [
    'inference-hardware',
    'Inference Hardware',
    'inference-serving',
    'hardware',
    'GPUs, TPUs, NPUs, CPUs, memory bandwidth, interconnects, topology, precision support, and deployment fit.',
    'Inference hardware is a memory-and-interconnect system around matrix engines. Choose by model fit, precision, bandwidth, topology, power, software support, and workload shape.',
    'NVIDIA Hopper Architecture',
    'https://resources.nvidia.com/en-us-tensor-core',
    ['modelFit', 'memoryBandwidth', 'topology'],
  ],
  [
    'agent-memory-context',
    'Agent Memory & Context Management',
    'agent-systems',
    'memory',
    'Working context, summaries, retrieval, episodic state, durable memory, compaction, provenance, and forgetting.',
    'Agent memory is a state architecture, not a larger prompt. Separate immediate working state, retrievable durable facts, event history, and summaries with provenance and expiry.',
    'Anthropic — Building Effective Agents',
    'https://www.anthropic.com/engineering/building-effective-agents',
    ['memoryLayers', 'retrievalPolicy', 'provenance'],
  ],
  [
    'mcp-integrations',
    'MCP & Integrations',
    'agent-systems',
    'mcp',
    'Model Context Protocol hosts, clients, servers, tools, resources, prompts, transports, capability negotiation, and trust.',
    'MCP standardizes how an AI host discovers and invokes external capabilities. The protocol boundary does not replace authentication, authorization, validation, or user approval.',
    'Model Context Protocol Specification',
    'https://modelcontextprotocol.io/specification/',
    ['capabilities', 'transport', 'trustBoundary'],
  ],
  [
    'multi-agent-coordination',
    'Multi-agent Coordination',
    'agent-systems',
    'multi-agent',
    'Delegation, specialization, shared state, handoffs, arbitration, budgets, and avoiding coordination overhead.',
    'Multiple agents help when work decomposes cleanly and results can be verified independently. Shared goals, bounded tasks, explicit handoffs, and conflict resolution matter more than agent count.',
    'AutoGen: Enabling Next-Gen LLM Applications',
    'https://arxiv.org/abs/2308.08155',
    ['taskDecomposition', 'sharedState', 'conflictResolution'],
  ],
  [
    'durable-agent-execution',
    'Durable Agent Execution',
    'agent-systems',
    'durability',
    'Checkpointed loops, resumable tools, idempotency, leases, event histories, retries, and crash recovery.',
    'A durable agent records decisions and side-effect identities so it can resume after interruption without repeating irreversible work.',
    'Temporal — Durable Execution',
    'https://docs.temporal.io/encyclopedia/durable-execution',
    ['checkpoint', 'idempotency', 'resumeProtocol'],
  ],
  [
    'agent-permissions-sandboxing',
    'Agent Permissions & Sandboxing',
    'agent-systems',
    'permissions',
    'Capability grants, read/write scopes, approval gates, secret isolation, network policy, quotas, and audit logs.',
    'Treat an agent as an untrusted principal. Grant the smallest capability for the shortest time, isolate execution, require approval for irreversible effects, and log authority use.',
    'OWASP Top 10 for LLM Applications',
    'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
    ['capabilityScope', 'approvalGate', 'auditTrail'],
  ],
  [
    'browser-computer-use-agents',
    'Browser & Computer-use Agents',
    'agent-systems',
    'computer-use',
    'DOM and accessibility-tree control, screenshots, visual grounding, action planning, waits, recovery, and confirmation.',
    'Computer use is closed-loop control: observe current state, choose one bounded action, execute, verify the resulting state, and recover from drift.',
    'Playwright Documentation',
    'https://playwright.dev/docs/intro',
    ['observation', 'boundedAction', 'stateVerification'],
  ],
  [
    'agent-communication-interfaces',
    'Agent Communication & Interfaces',
    'agent-systems',
    'interfaces',
    'Typed messages, events, artifacts, streaming updates, human checkpoints, agent-to-agent protocols, and UI status.',
    'Reliable agent interfaces exchange typed state and evidence, not vague prose. Messages need identity, intent, status, result, error, and provenance.',
    'Agent2Agent Protocol',
    'https://a2a-protocol.org/latest/',
    ['messageSchema', 'statusModel', 'provenance'],
  ],
  [
    'long-running-scheduled-agents',
    'Long-running & Scheduled Agents',
    'agent-systems',
    'scheduling',
    'Cron triggers, queues, leases, heartbeats, deadlines, cancellation, checkpoints, notifications, and cost budgets.',
    'Long-running agents are jobs with model decisions inside. They still need ownership, schedules, leases, cancellation, deadlines, observability, and bounded spend.',
    'Cloudflare Workers Cron Triggers',
    'https://developers.cloudflare.com/workers/configuration/cron-triggers/',
    ['trigger', 'leaseHeartbeat', 'budget'],
  ],
  [
    'coding-agent-benchmarks',
    'Coding-agent Benchmarks',
    'ai-reliability',
    'benchmarks',
    'Issue resolution tasks, repository setup, patch grading, test-based scoring, contamination, and benchmark validity.',
    'A coding benchmark is an environment plus task distribution and verifier. Scores are useful only when setup, contamination, flaky tests, and patch validity are controlled.',
    'SWE-bench',
    'https://www.swebench.com/',
    ['taskDistribution', 'environment', 'verifier'],
  ],
  [
    'tool-use-evaluations',
    'Tool-use Evaluations',
    'ai-reliability',
    'tool-evals',
    'Tool selection, argument correctness, sequencing, recovery, side-effect safety, and end-state verification.',
    'Tool-use evals grade the entire trajectory: correct tool, valid arguments, efficient sequence, safe handling of errors, and verified final state.',
    'τ-bench: A Benchmark for Tool-Agent-User Interaction',
    'https://arxiv.org/abs/2406.12045',
    ['toolChoice', 'trajectory', 'endState'],
  ],
  [
    'ai-regression-testing',
    'AI Regression Testing',
    'ai-reliability',
    'regression',
    'Frozen eval sets, golden cases, rubric versions, stochastic thresholds, canaries, and release gates.',
    'AI regression tests compare distributions and task outcomes, not exact strings. Freeze representative cases, version graders, repeat stochastic trials, and gate meaningful deltas.',
    'OpenAI Evals Documentation',
    'https://platform.openai.com/docs/guides/evals',
    ['evalSet', 'graderVersion', 'releaseThreshold'],
  ],
  [
    'hallucination-failure-detection',
    'Hallucination & Failure Detection',
    'ai-reliability',
    'failure-detection',
    'Unsupported claims, citations, abstention, tool errors, constraint violations, uncertainty, and escalation.',
    'Detect failures against evidence and task constraints. Require citations where possible, validate structured claims, calibrate abstention, and route uncertainty to tools or humans.',
    'NIST AI Risk Management Framework',
    'https://www.nist.gov/itl/ai-risk-management-framework',
    ['evidenceCheck', 'constraintCheck', 'escalation'],
  ],
  [
    'agent-observability',
    'Agent Observability',
    'ai-reliability',
    'observability',
    'Runs, steps, prompts, model calls, tool calls, tokens, costs, errors, state changes, and outcome metrics.',
    'Agent observability connects the final outcome to every decision and side effect. A run needs stable IDs, step spans, inputs, outputs, costs, errors, and redaction.',
    'OpenTelemetry GenAI Semantic Conventions',
    'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
    ['runIdentity', 'stepSpans', 'redaction'],
  ],
  [
    'tracing-replay',
    'Tracing & Replay',
    'ai-reliability',
    'replay',
    'Deterministic inputs, event logs, snapshots, prompt/model versions, tool fixtures, and counterfactual re-execution.',
    'Replay requires capturing every non-deterministic dependency: model and prompt version, context, tool results, random seeds where available, and state transitions.',
    'OpenTelemetry Traces',
    'https://opentelemetry.io/docs/concepts/signals/traces/',
    ['capturedInputs', 'versionPins', 'replayMode'],
  ],
  [
    'evidence-backed-verification',
    'Evidence-backed Verification',
    'ai-reliability',
    'verification',
    'Claims, source provenance, executable checks, screenshots, diffs, test outputs, and acceptance criteria.',
    'Verification turns an agent claim into inspectable evidence. Match each acceptance criterion to a source, command, artifact, or observed state and keep inference separate.',
    'Google Testing Blog',
    'https://testing.googleblog.com/',
    ['acceptanceCriteria', 'evidence', 'inferenceBoundary'],
  ],
  [
    'human-review-systems',
    'Human Review Systems',
    'ai-reliability',
    'human-review',
    'Review queues, risk routing, disagreement, calibration, escalation, auditability, and learning from corrections.',
    'Human review is a risk-control system. Route uncertain or high-impact cases, give reviewers evidence and clear rubrics, measure agreement, and feed corrections into evals.',
    'NIST Human-Centered AI',
    'https://www.nist.gov/artificial-intelligence',
    ['riskRouting', 'reviewRubric', 'feedbackLoop'],
  ],
  [
    'quality-cost-latency-measurement',
    'Quality, Cost & Latency Measurement',
    'ai-reliability',
    'measurement',
    'Task success, calibrated quality, token and tool cost, latency distributions, reliability, and Pareto frontiers.',
    'No AI metric stands alone. Compare candidate systems on the same workload and plot quality, cost, latency, and failure rate together.',
    'MLPerf Inference',
    'https://mlcommons.org/benchmarks/inference-datacenter/',
    ['qualityMetric', 'costMetric', 'latencyMetric'],
  ],
  [
    'code-review-systems',
    'Code Review Systems',
    'developer-tools',
    'code-review',
    'Diff understanding, intent, correctness, maintainability, risk ranking, review workflows, and actionable findings.',
    'Useful review connects a changed line to behavior and risk. Findings need evidence, severity, scope, and a concrete remediation—not generic style commentary.',
    'Google Engineering Practices — Code Review',
    'https://google.github.io/eng-practices/review/',
    ['changeIntent', 'riskFinding', 'actionableEvidence'],
  ],
  [
    'static-dynamic-analysis',
    'Static & Dynamic Analysis',
    'developer-tools',
    'program-analysis',
    'ASTs, control/data flow, abstract interpretation, symbolic execution, sanitizers, profiling, and runtime instrumentation.',
    'Static analysis reasons over possible executions; dynamic analysis observes actual executions. Combining them trades breadth for concrete evidence.',
    'CodeQL Documentation',
    'https://codeql.github.com/docs/',
    ['programModel', 'analysisRule', 'runtimeEvidence'],
  ],
  [
    'testing-infrastructure',
    'Testing Infrastructure',
    'developer-tools',
    'testing',
    'Unit, integration, contract, E2E, property, fuzz, hermetic environments, fixtures, sharding, and flaky-test control.',
    'Testing infrastructure makes failures reproducible and cheap to diagnose. Layer tests by boundary, isolate dependencies, record seeds, and treat flakiness as a product defect.',
    'Bazel Test Encyclopedia',
    'https://bazel.build/reference/test-encyclopedia',
    ['testBoundary', 'hermeticEnvironment', 'failureDiagnostics'],
  ],
  [
    'codebase-graphs',
    'Codebase Graphs',
    'developer-tools',
    'code-graphs',
    'Symbols, references, calls, imports, ownership, data flow, build targets, and graph queries over repositories.',
    'A codebase graph converts files into typed relationships. The value comes from stable symbol identity, precise edges, incremental updates, and queries tied to developer decisions.',
    'SCIP Code Intelligence Protocol',
    'https://github.com/sourcegraph/scip',
    ['nodeIdentity', 'edgeTypes', 'incrementalUpdate'],
  ],
  [
    'dependency-blast-radius',
    'Dependency & Blast-radius Analysis',
    'developer-tools',
    'dependencies',
    'Direct and transitive dependencies, affected targets, ownership, runtime consumers, schema impact, and change risk.',
    'Blast radius is the set of consumers whose behavior can change. Combine dependency graphs, runtime evidence, public contracts, ownership, and test selection.',
    'Bazel Query How-To',
    'https://bazel.build/query/guide',
    ['dependencyGraph', 'affectedSet', 'riskPrioritization'],
  ],
  [
    'ide-cli-tooling',
    'IDE & CLI Tooling',
    'developer-tools',
    'developer-experience',
    'Language servers, editor protocols, terminal UX, diagnostics, completions, commands, configuration, and automation.',
    'Good developer tools expose a stable core through both structured APIs and human interfaces. Fast feedback, composability, discoverability, and predictable exit behavior matter.',
    'Language Server Protocol Specification',
    'https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/',
    ['protocol', 'feedbackLoop', 'automationContract'],
  ],
  [
    'coding-agent-systems',
    'Coding Agent Systems',
    'developer-tools',
    'coding-agents',
    'Repository context, planning, file edits, tools, tests, sandboxes, review loops, and patch delivery.',
    'A coding agent is a repository-aware control loop. It needs scoped context, reversible edits, executable verification, and a clear handoff boundary.',
    'SWE-agent',
    'https://swe-agent.com/',
    ['repoContext', 'editLoop', 'verification'],
  ],
  [
    'repository-intelligence',
    'Repository Intelligence',
    'developer-tools',
    'repository-intelligence',
    'Structure, symbols, history, ownership, conventions, architecture, semantic search, and change-aware retrieval.',
    'Repository intelligence answers what exists, why it exists, who depends on it, and what changed. It combines indexed code, graphs, history, and local instructions.',
    'GitHub Code Search Syntax',
    'https://docs.github.com/en/search-github/github-code-search/understanding-github-code-search-syntax',
    ['index', 'retrieval', 'contextAssembly'],
  ],
  [
    'software-supply-chain-health',
    'Software Supply-chain Health',
    'developer-tools',
    'supply-chain',
    'Dependency provenance, lockfiles, SBOMs, signing, build integrity, vulnerabilities, update policy, and release attestations.',
    'Supply-chain security proves what entered a build and how the artifact was produced. Pin inputs, generate provenance, scan risk, and verify signatures at promotion boundaries.',
    'SLSA Specification',
    'https://slsa.dev/spec/v1.1/',
    ['provenance', 'dependencyPolicy', 'artifactVerification'],
  ],
  [
    'automated-debugging-remediation',
    'Automated Debugging & Remediation',
    'developer-tools',
    'debugging',
    'Failure reproduction, hypothesis generation, telemetry, fault localization, minimal patches, validation, rollback, and learning.',
    'Automated remediation should reproduce first, narrow the causal surface, make the smallest patch, verify the original failure and nearby behavior, then preserve evidence.',
    'Delta Debugging',
    'https://www.st.cs.uni-saarland.de/dd/',
    ['reproduction', 'faultLocalization', 'patchVerification'],
  ],
  [
    'web-mobile-engineering',
    'Web & Mobile Engineering',
    'application-engineering',
    'client-platforms',
    'Web and native lifecycles, rendering, navigation, state, networking, offline behavior, accessibility, and release constraints.',
    'Client engineering is lifecycle engineering. Model loading, interaction, backgrounding, connectivity, persistence, accessibility, and platform conventions explicitly.',
    'MDN Web Platform',
    'https://developer.mozilla.org/en-US/docs/Web',
    ['lifecycle', 'stateModel', 'offlineFallback'],
  ],
  [
    'ux-interface-design',
    'UX & Interface Design',
    'application-engineering',
    'ux',
    'User goals, information architecture, interaction states, feedback, accessibility, usability testing, and design systems.',
    'An interface is a state machine for human intent. Make the next action clear, expose system status, prevent errors, support recovery, and test with real tasks.',
    'W3C Web Content Accessibility Guidelines',
    'https://www.w3.org/WAI/standards-guidelines/wcag/',
    ['userGoal', 'interactionStates', 'accessibility'],
  ],
  [
    'real-time-application-engineering',
    'Real-time Application Engineering',
    'application-engineering',
    'real-time',
    'WebSockets, server-sent events, presence, synchronization, ordering, reconnects, optimistic UI, and conflict handling.',
    'Real-time apps maintain a local projection of remote state under disconnects and reordering. Protocols need identity, sequence, reconnect, reconciliation, and degraded modes.',
    'The WebSocket Protocol',
    'https://www.rfc-editor.org/rfc/rfc6455',
    ['connectionLifecycle', 'ordering', 'reconciliation'],
  ],
  [
    'interactive-2d-3d-systems',
    '2D/3D Interactive Systems',
    'application-engineering',
    'graphics',
    'Scene graphs, render loops, input, animation, physics, GPU pipelines, asset loading, and performance budgets.',
    'Interactive systems turn state into frames under a deadline. Separate simulation and rendering, budget CPU/GPU work, stream assets, and measure frame-time variance.',
    'WebGPU Specification',
    'https://www.w3.org/TR/webgpu/',
    ['sceneState', 'renderLoop', 'frameBudget'],
  ],
  [
    'multimodal-models',
    'Multimodal Models',
    'multimodal-spatial',
    'multimodal',
    'Joint text, image, audio, and video representations, encoders, projectors, fusion, generation, and cross-modal evaluation.',
    'Multimodal models align different signal spaces through shared or connected representations. Data alignment, modality-specific encoders, fusion, and cross-modal evals are central.',
    'CLIP: Learning Transferable Visual Models From Natural Language Supervision',
    'https://arxiv.org/abs/2103.00020',
    ['modalityEncoders', 'fusion', 'crossModalEval'],
  ],
  [
    'vision-models',
    'Vision Models',
    'multimodal-spatial',
    'computer-vision',
    'Classification, detection, segmentation, embeddings, vision transformers, data augmentation, and visual evaluation.',
    'Vision systems convert pixels into task-specific spatial representations. Architecture, labels, augmentations, resolution, and evaluation must match deployment conditions.',
    'Stanford CS231n',
    'https://cs231n.stanford.edu/',
    ['taskDefinition', 'representation', 'visualEval'],
  ],
  [
    'pose-motion-tracking',
    'Pose & Motion Tracking',
    'multimodal-spatial',
    'pose',
    'Landmarks, skeletons, optical flow, temporal smoothing, identity tracking, calibration, occlusion, and latency.',
    'Pose tracking is temporal estimation under ambiguity. Combine per-frame evidence with identity, motion priors, smoothing, and explicit confidence through occlusion.',
    'MediaPipe Pose Landmarker',
    'https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker',
    ['landmarks', 'temporalTracking', 'occlusionHandling'],
  ],
  [
    'voice-audio-systems',
    'Voice & Audio Systems',
    'multimodal-spatial',
    'audio',
    'Capture, codecs, streaming, speech recognition, synthesis, turn detection, noise handling, latency, and conversational UX.',
    'Voice systems are real-time pipelines. Audio framing, endpointing, ASR, reasoning, TTS, interruption, and playback each consume the latency budget.',
    'Web Audio API',
    'https://www.w3.org/TR/webaudio/',
    ['audioPipeline', 'turnDetection', 'latencyBudget'],
  ],
  [
    'image-video-generation',
    'Image & Video Generation',
    'multimodal-spatial',
    'generation',
    'Diffusion and transformer generation, conditioning, latent spaces, control, consistency, safety, and media evaluation.',
    'Generative media iteratively maps noise or tokens into structured outputs under conditioning. Quality requires prompt/control alignment, temporal consistency, safety, and perceptual evaluation.',
    'Denoising Diffusion Probabilistic Models',
    'https://arxiv.org/abs/2006.11239',
    ['conditioning', 'generationProcess', 'qualityEval'],
  ],
  [
    'robotics-systems',
    'Robotics Systems',
    'multimodal-spatial',
    'robotics',
    'Sensing, localization, mapping, planning, control, simulation, safety, real-time loops, and hardware interfaces.',
    'A robot closes the loop from sensing to state estimation to planning to control. Timing, uncertainty, physical safety, and simulation-to-real gaps dominate.',
    'ROS 2 Documentation',
    'https://docs.ros.org/en/rolling/',
    ['perception', 'planningControl', 'safety'],
  ],
  [
    'spatial-interfaces',
    'Spatial Interfaces',
    'multimodal-spatial',
    'spatial-computing',
    'Coordinate systems, anchors, tracking, depth, occlusion, hand/eye input, world understanding, and spatial UI.',
    'Spatial interfaces place persistent state in a changing coordinate system. Tracking confidence, scale, depth, occlusion, ergonomics, and recovery from lost anchors are core.',
    'WebXR Device API',
    'https://www.w3.org/TR/webxr/',
    ['coordinateSystem', 'tracking', 'spatialInteraction'],
  ],
  [
    'human-computer-interaction',
    'Human-Computer Interaction',
    'multimodal-spatial',
    'hci',
    'Human perception, cognition, motor control, interaction techniques, accessibility, evaluation, and responsible design.',
    'HCI treats system quality as human task performance and experience. Design from users and context, prototype interactions, and measure effectiveness, efficiency, errors, and trust.',
    'Interaction Design Foundation — HCI',
    'https://www.interaction-design.org/literature/topics/human-computer-interaction',
    ['userContext', 'interactionTechnique', 'evaluation'],
  ],
];

const RECLASSIFICATIONS = {
  'concurrency-design': 'systems-foundations',
  'monitoring-analytics': 'infrastructure-platforms',
  'retries-dlq': 'infrastructure-platforms',
  'background-jobs': 'infrastructure-platforms',
  consensus: 'distributed-systems',
  'distributed-infra': 'distributed-systems',
  'messaging-realtime': 'distributed-systems',
  sharding: 'distributed-systems',
  replication: 'distributed-systems',
  'cap-theorem': 'distributed-systems',
  'message-queues': 'distributed-systems',
  caching: 'distributed-systems',
  'model-routing': 'inference-serving',
  'ml-browser-runtime': 'inference-serving',
  'ml-webgpu': 'inference-serving',
  'tool-calling': 'agent-systems',
  'agent-loops': 'agent-systems',
  'llm-evals': 'ai-reliability',
  'prompt-versioning': 'ai-reliability',
  'ml-evaluation': 'ai-reliability',
  'game-design': 'application-engineering',
};

const ROADMAP_DEFINITIONS = [
  {
    id: 'systems-foundations-12w',
    title: '12-Week Systems Foundations',
    tracks: ['systems-foundations'],
    goal: 'Build a mechanism-first model from hardware and kernels through runtimes, networks, performance, and isolation.',
    groups: [
      ['operating-system-mechanics', 'compute-memory-storage-hierarchy'],
      ['network-protocol-engineering', 'concurrency-design'],
      ['runtime-performance-engineering', 'security-isolation-boundaries'],
    ],
  },
  {
    id: 'infrastructure-platforms-12w',
    title: '12-Week Infrastructure & Platforms',
    tracks: ['infrastructure-platforms'],
    goal: 'Design and operate a reproducible, observable, fault-tolerant platform for untrusted workloads.',
    groups: [
      ['cloud-infrastructure', 'containers-kubernetes', 'cicd-developer-environments'],
      ['platform-scheduling-orchestration', 'infrastructure-automation', 'background-jobs'],
      [
        'reliability-fault-tolerance',
        'retries-dlq',
        'monitoring-analytics',
        'opentelemetry-observability',
        'sandbox-execution-environments',
      ],
    ],
  },
  {
    id: 'distributed-systems-12w',
    title: '12-Week Distributed Systems',
    tracks: ['distributed-systems'],
    goal: 'Reason about coordination, data placement, logs, durable workflows, consistency, and recovery under partial failure.',
    groups: [
      ['consensus', 'replication', 'sharding', 'cap-theorem'],
      ['message-queues', 'event-streaming-kafka', 'caching', 'messaging-realtime'],
      ['distributed-infra', 'distributed-workflows-temporal', 'distributed-failure-recovery'],
    ],
  },
  {
    id: 'ai-models-training-12w',
    title: '12-Week AI Models & Training',
    tracks: ['ai-systems'],
    goal: 'Move from transformer foundations through pre-training, fine-tuning, post-training, compression, and evaluation.',
    groups: [
      [
        'ml-math',
        'ml-gradient-descent',
        'ml-backprop',
        'ml-softmax-xent',
        'ml-tokenization',
        'ml-language-modeling',
      ],
      [
        'ml-embeddings',
        'ml-self-attention',
        'ml-multi-head',
        'ml-transformer-block',
        'ml-adamw',
        'ml-pretraining',
        'ml-training',
        'ml-checkpointing',
      ],
      [
        'ml-lora',
        'ml-rl-alignment',
        'ml-data-engineering',
        'model-quantization',
        'open-weight-models',
        'multimodal-models',
        'vision-models',
        'voice-audio-systems',
        'ml-evaluation',
      ],
    ],
  },
  {
    id: 'inference-serving-12w',
    title: '12-Week Inference & Serving',
    tracks: ['inference-serving'],
    goal: 'Build a production mental model for inference engines, memory, kernels, routing, hardware, and serving economics.',
    groups: [
      // The first group carries this path's cross-track prerequisites. Without
      // them the roadmap dead-ends: the planner walks a path's own concepts
      // first, so a prereq living outside the path is never served.
      [
        'ml-sampling',
        'ml-data-engineering',
        'ml-lora',
        'model-quantization',
        'inference-engines',
        'kv-cache-paged-attention',
        'continuous-batching',
        'model-routing',
      ],
      ['flashattention-kernels', 'speculative-decoding', 'gpu-utilization', 'inference-hardware'],
      ['inference-cost-latency', 'local-on-device-inference', 'ml-browser-runtime', 'ml-webgpu'],
    ],
  },
  {
    id: 'agent-systems-12w',
    title: '12-Week Agent Systems',
    tracks: ['agent-systems'],
    goal: 'Engineer useful agents with bounded loops, tools, memory, protocols, durability, permissions, and long-running control.',
    groups: [
      ['tool-calling', 'agent-loops', 'agent-memory-context', 'mcp-integrations'],
      ['multi-agent-coordination', 'agent-communication-interfaces', 'browser-computer-use-agents'],
      ['durable-agent-execution', 'agent-permissions-sandboxing', 'long-running-scheduled-agents'],
    ],
  },
  {
    id: 'ai-reliability-12w',
    title: '12-Week Evaluation & AI Reliability',
    tracks: ['ai-reliability'],
    goal: 'Build an evidence-backed evaluation and observability system for models, tools, and agents.',
    groups: [
      ['llm-evals', 'ml-evaluation', 'coding-agent-benchmarks', 'tool-use-evaluations'],
      [
        'prompt-versioning',
        'ai-regression-testing',
        'hallucination-failure-detection',
        'quality-cost-latency-measurement',
      ],
      [
        'agent-observability',
        'tracing-replay',
        'evidence-backed-verification',
        'human-review-systems',
      ],
    ],
  },
  {
    id: 'developer-tools-12w',
    title: '12-Week Developer Tools & Code Intelligence',
    tracks: ['developer-tools'],
    goal: 'Build repository-aware tools that analyze, test, review, debug, and safely remediate code.',
    groups: [
      ['code-review-systems', 'static-dynamic-analysis', 'testing-infrastructure'],
      ['codebase-graphs', 'dependency-blast-radius', 'repository-intelligence', 'ide-cli-tooling'],
      ['coding-agent-systems', 'software-supply-chain-health', 'automated-debugging-remediation'],
    ],
  },
  {
    id: 'application-engineering-12w',
    title: '12-Week Application Engineering',
    tracks: ['application-engineering', 'backend', 'product'],
    goal: 'Turn backend, client, UX, real-time, interactive, analytics, and distribution skills into one complete product.',
    groups: [
      ['api-design', 'web-mobile-engineering', 'ux-interface-design'],
      [
        'real-time-application-engineering',
        'messaging-realtime',
        'game-design',
        'interactive-2d-3d-systems',
      ],
      ['product-analytics', 'positioning', 'landing-pages', 'seo'],
    ],
  },
  {
    id: 'multimodal-spatial-12w',
    title: '12-Week Multimodal & Spatial Computing',
    tracks: ['multimodal-spatial', 'inference-serving'],
    goal: 'Connect vision, audio, generation, on-device intelligence, robotics, spatial interfaces, and HCI.',
    groups: [
      [
        'ml-data-engineering',
        'ml-lora',
        'model-quantization',
        'multimodal-models',
        'vision-models',
        'voice-audio-systems',
      ],
      ['pose-motion-tracking', 'image-video-generation', 'local-on-device-inference'],
      ['robotics-systems', 'spatial-interfaces', 'human-computer-interaction', 'ml-webgpu'],
    ],
  },
];

const MILESTONE_TITLES = [
  'Weeks 1-4 — Foundations and mechanisms',
  'Weeks 5-8 — Production systems and trade-offs',
  'Weeks 9-12 — Reliability, verification, and synthesis',
];

const MILESTONE_GOALS = [
  'Build the domain vocabulary and explain the core mechanisms from first principles.',
  'Design the production path, including resource, scale, safety, and operability trade-offs.',
  'Test failure modes, measure outcomes, and ship the synthesis artifact.',
];

function topic(name, concepts) {
  return { name, concepts };
}

const COVERAGE = {
  version: 1,
  source: 'User-requested eleven-domain curriculum, 2026-07-25',
  categories: [
    {
      id: 'systems-foundations',
      title: 'Systems Foundations',
      topics: [
        topic('Operating systems', ['operating-system-mechanics']),
        topic('Networking', ['network-protocol-engineering', 'http-lifecycle']),
        topic('Concurrency and parallelism', ['concurrency-design']),
        topic('Memory, CPU, GPU and storage', [
          'compute-memory-storage-hierarchy',
          'ml-webgpu',
          'object-storage',
        ]),
        topic('Runtime and performance engineering', ['runtime-performance-engineering']),
        topic('Security and isolation', [
          'security-isolation-boundaries',
          'sandbox-execution-environments',
        ]),
      ],
    },
    {
      id: 'infrastructure-platforms',
      title: 'Infrastructure & Platforms',
      topics: [
        topic('Cloud infrastructure', ['cloud-infrastructure']),
        topic('Containers and Kubernetes', ['containers-kubernetes']),
        topic('CI/CD and developer environments', ['cicd-developer-environments']),
        topic('Scheduling and orchestration', [
          'platform-scheduling-orchestration',
          'background-jobs',
        ]),
        topic('Reliability and fault tolerance', ['reliability-fault-tolerance', 'retries-dlq']),
        topic('Observability and OpenTelemetry', [
          'opentelemetry-observability',
          'monitoring-analytics',
        ]),
        topic('Sandboxes and execution environments', ['sandbox-execution-environments']),
        topic('Infrastructure automation', ['infrastructure-automation']),
      ],
    },
    {
      id: 'distributed-systems',
      title: 'Distributed Systems',
      topics: [
        topic('Consensus and coordination', ['consensus', 'distributed-infra']),
        topic('Replication and partitioning', ['replication', 'sharding']),
        topic('Messaging, Kafka and event systems', [
          'message-queues',
          'event-streaming-kafka',
          'messaging-realtime',
        ]),
        topic('Caching', ['caching']),
        topic('Distributed workflows and Temporal', ['distributed-workflows-temporal']),
        topic('Consistency models', ['cap-theorem', 'transaction-processing']),
        topic('Resilience and failure recovery', ['distributed-failure-recovery', 'retries-dlq']),
      ],
    },
    {
      id: 'databases-data-systems',
      title: 'Databases & Data Systems',
      topics: [
        topic('Storage engines', ['storage-retrieval', 'b-tree', 'lsm-tree']),
        topic('Transactional databases', ['transaction-processing', 'wal']),
        topic('Analytical databases', ['columnar-storage', 'query-execution-optimization']),
        topic('Distributed databases', ['distributed-infra', 'replication', 'sharding']),
        topic('Streaming systems', ['event-streaming-kafka', 'message-queues']),
        topic('Search and vector databases', ['search-discovery', 'hnsw', 'brute-force-vector-db']),
        topic('Indexing and query execution', [
          'secondary-index',
          'inverted-index',
          'query-execution-optimization',
        ]),
        topic('Data warehouses and lakehouses', ['warehouses-lakehouses', 'columnar-storage']),
        topic('Memory-versus-disk architecture', [
          'compute-memory-storage-hierarchy',
          'storage-retrieval',
        ]),
      ],
    },
    {
      id: 'ai-models-training',
      title: 'AI Models & Training',
      topics: [
        topic('Model architectures', ['ml-transformer-block', 'multimodal-models']),
        topic('Transformers and tokenization', [
          'ml-tokenization',
          'ml-self-attention',
          'ml-multi-head',
        ]),
        topic('Pre-training', ['ml-pretraining', 'ml-training']),
        topic('Fine-tuning', ['ml-lora']),
        topic('Post-training', ['ml-rl-alignment']),
        topic('Reinforcement learning', ['ml-rl-alignment']),
        topic('Quantization', ['model-quantization']),
        topic('Open-weight models', ['open-weight-models']),
        topic('Multimodal models', ['multimodal-models']),
      ],
    },
    {
      id: 'inference-serving',
      title: 'Inference & Serving',
      topics: [
        topic('vLLM and inference engines', ['inference-engines']),
        topic('Continuous batching', ['continuous-batching']),
        topic('KV caching and PagedAttention', ['kv-cache-paged-attention']),
        topic('FlashAttention', ['flashattention-kernels']),
        topic('Speculative decoding', ['speculative-decoding']),
        topic('Model routing', ['model-routing']),
        topic('GPU utilization', ['gpu-utilization']),
        topic('Cost and latency optimization', ['inference-cost-latency']),
        topic('Local and on-device inference', ['local-on-device-inference', 'ml-browser-runtime']),
        topic('Inference hardware', ['inference-hardware']),
      ],
    },
    {
      id: 'agent-systems',
      title: 'Agent Systems',
      topics: [
        topic('Agent loops and harnesses', ['agent-loops']),
        topic('Tool use', ['tool-calling']),
        topic('Memory and context management', ['agent-memory-context', 'context-packing']),
        topic('MCP and integrations', ['mcp-integrations']),
        topic('Multi-agent coordination', ['multi-agent-coordination']),
        topic('Durable execution', ['durable-agent-execution']),
        topic('Permissions and sandboxing', ['agent-permissions-sandboxing']),
        topic('Browser and computer-use agents', ['browser-computer-use-agents']),
        topic('Agent communication and interfaces', ['agent-communication-interfaces']),
        topic('Long-running and scheduled agents', ['long-running-scheduled-agents']),
      ],
    },
    {
      id: 'ai-reliability',
      title: 'Evaluation, Verification & AI Reliability',
      topics: [
        topic('LLM evaluations', ['llm-evals', 'ml-evaluation']),
        topic('Coding-agent benchmarks', ['coding-agent-benchmarks']),
        topic('Tool-use evaluations', ['tool-use-evaluations']),
        topic('Regression testing', ['ai-regression-testing']),
        topic('Hallucination and failure detection', ['hallucination-failure-detection']),
        topic('Agent observability', ['agent-observability']),
        topic('Tracing and replay', ['tracing-replay']),
        topic('Evidence-backed verification', ['evidence-backed-verification']),
        topic('Human review systems', ['human-review-systems']),
        topic('Cost, latency and quality measurement', ['quality-cost-latency-measurement']),
      ],
    },
    {
      id: 'developer-tools',
      title: 'Developer Tools & Code Intelligence',
      topics: [
        topic('Code review', ['code-review-systems']),
        topic('Static and dynamic analysis', ['static-dynamic-analysis']),
        topic('Testing infrastructure', ['testing-infrastructure']),
        topic('Codebase graphs', ['codebase-graphs']),
        topic('Dependency and blast-radius analysis', ['dependency-blast-radius']),
        topic('IDE and CLI tooling', ['ide-cli-tooling']),
        topic('Coding agents', ['coding-agent-systems', 'agent-loops']),
        topic('Repository intelligence', ['repository-intelligence']),
        topic('Software supply-chain health', ['software-supply-chain-health']),
        topic('Automated debugging and remediation', ['automated-debugging-remediation']),
      ],
    },
    {
      id: 'application-engineering',
      title: 'Product & Application Engineering',
      topics: [
        topic('Backend and API architecture', ['api-design', 'http-lifecycle']),
        topic('Web and mobile engineering', ['web-mobile-engineering']),
        topic('Product analytics', ['product-analytics']),
        topic('UX and interface design', ['ux-interface-design']),
        topic('Real-time applications', [
          'real-time-application-engineering',
          'messaging-realtime',
        ]),
        topic('Voice interfaces', ['voice-audio-systems']),
        topic('Computer vision', ['vision-models']),
        topic('2D/3D interactive systems', ['interactive-2d-3d-systems', 'game-design']),
        topic('Product distribution and growth loops', [
          'positioning',
          'landing-pages',
          'seo',
          'product-analytics',
        ]),
      ],
    },
    {
      id: 'multimodal-spatial',
      title: 'Multimodal, Robotics & Spatial Computing',
      topics: [
        topic('Vision models', ['vision-models']),
        topic('Pose and motion tracking', ['pose-motion-tracking']),
        topic('Voice and audio systems', ['voice-audio-systems']),
        topic('Image and video generation', ['image-video-generation']),
        topic('On-device intelligence', ['local-on-device-inference', 'ml-webgpu']),
        topic('Robotics', ['robotics-systems']),
        topic('Spatial interfaces', ['spatial-interfaces']),
        topic('Human-computer interaction', ['human-computer-interaction']),
      ],
    },
  ],
};

const conceptsFile = read(paths.concepts);
const drillsFile = read(paths.drills);
const reviewsFile = read(paths.reviews);
const artifactsFile = read(paths.artifacts);
const roadmapsFile = read(paths.roadmaps);

COVERAGE.preservedConceptIds = conceptsFile.concepts
  .filter((concept) => concept.curriculumSource !== source)
  .map((concept) => concept.id);

/**
 * Fields a human may have rewritten after this script first created the record.
 * They are never overwritten by a re-run — the generator owns STRUCTURE (which
 * roadmap a concept belongs to, which drill/artifact ids hang off it), a human
 * owns PROSE.
 *
 * This used to be a wholesale `records[index] = record`, which meant re-running
 * the script silently reverted every hand-written mental model, mistake list,
 * hint, question, and answer back to its generated placeholder. The 2026-07-25
 * content pass rewrote ~70 concepts, 70 drills, and 153 review answers that
 * were all sitting on that trapdoor.
 */
const AUTHORED_FIELDS = new Set([
  'description',
  'mentalModel',
  'commonMistakes',
  'realWorldUsage',
  'resources',
  'prerequisites',
  'related',
  'difficulty',
  'priority',
  'prompt',
  'expectedOutput',
  'hints',
  'solutionNotes',
  'testCases',
  'question',
  'answer',
  'type',
  'successCriteria',
  'deliverables',
]);

function replaceGenerated(records, record, kind) {
  const index = records.findIndex((item) => item.id === record.id);
  if (index === -1) {
    records.push(record);
    return;
  }
  const existing = records[index];
  if (existing.curriculumSource !== source) {
    throw new Error(`${kind} id "${record.id}" already exists outside ${source}`);
  }
  const merged = { ...record };
  for (const field of AUTHORED_FIELDS) {
    if (field in existing) merged[field] = existing[field];
    else delete merged[field];
  }
  records[index] = merged;
}

function resourceType(url) {
  return /arxiv|\.pdf|rfc-editor/.test(url) ? 'paper' : 'doc';
}

const pathIdsByConcept = new Map();
const artifactIdsByConcept = new Map();
for (const path of ROADMAP_DEFINITIONS) {
  for (const id of path.groups.flat()) {
    const roadmaps = pathIdsByConcept.get(id) ?? [];
    if (!roadmaps.includes(path.id)) roadmaps.push(path.id);
    pathIdsByConcept.set(id, roadmaps);

    const artifacts = artifactIdsByConcept.get(id) ?? [];
    const artifactId = `synthesize-${path.id}`;
    if (!artifacts.includes(artifactId)) artifacts.push(artifactId);
    artifactIdsByConcept.set(id, artifacts);
  }
}

const newIds = new Set(DEFINITIONS.map(([id]) => id));

for (const [
  id,
  name,
  track,
  tag,
  description,
  mentalModel,
  resourceTitle,
  url,
  keys,
] of DEFINITIONS) {
  const concept = {
    id,
    name,
    tags: [track, tag],
    roadmaps: pathIdsByConcept.get(id) ?? [],
    difficulty: 'core',
    priority: 3,
    prerequisites: [],
    related: [],
    description,
    mentalModel,
    // No generated `commonMistakes` / `realWorldUsage`. They used to be a fixed
    // two-line rubric and a verbatim copy of `description` — noise that reads as
    // content. An absent field renders as an honest gap, which is what
    // docs/learning/index.md promises ("gaps are visible until curated").
    drills: [`practice-${id}`],
    reviewQuestions: [`rq-${id}`],
    resources: [{ title: resourceTitle, url, type: resourceType(url) }],
    artifacts: artifactIdsByConcept.get(id) ?? [],
    curriculumSource: source,
  };
  replaceGenerated(conceptsFile.concepts, concept, 'concept');

  const drill = {
    id: `practice-${id}`,
    title: `Design exercise: ${name}`,
    conceptId: id,
    type: 'system-design-prompt',
    difficulty: 'core',
    prompt: `${description} Implement designOutline() returning non-empty values for: ${keys.join(', ')}. Each value must name a concrete mechanism or decision.`,
    expectedOutput: `A design outline with ${keys.join(', ')} plus an explicit failure mode or trade-off.`,
    // `mentalModel` must NOT appear here: it is the answer, and solutionNotes
    // already carries it for the post-solve reveal. Printing it as hints[0]
    // handed the learner the answer before the attempt.
    hints: ['Name the failure mode before selecting the mechanism.'],
    solutionNotes: mentalModel,
    testCases: [
      {
        // Substantive-answer check. The original accepted any non-empty string,
        // so one character per key passed. This requires a real sentence per key
        // and rejects the same text pasted into every key.
        setup:
          "function validateOutline(o, keys) {\n  if (!o || typeof o !== 'object') return false;\n  const seen = new Set();\n  for (const key of keys) {\n    const value = o[key];\n    if (typeof value !== 'string') return false;\n    const text = value.trim();\n    if (text.length < 40 || text.split(/\\s+/).length < 6) return false;\n    if (seen.has(text.toLowerCase())) return false;\n    seen.add(text.toLowerCase());\n  }\n  return true;\n}",
        run: `console.log(validateOutline(designOutline(), ${JSON.stringify(keys)}));`,
        expect: 'true',
      },
    ],
    curriculumSource: source,
  };
  replaceGenerated(drillsFile.drills, drill, 'drill');

  // Placeholder only. A generated question cannot be specific, and its answer
  // is the mental model the learner just read on the concept page — so it tests
  // recognition, not recall. `isFormulaicReviewQuestion` in
  // src/lib/contentQuality.ts detects this stem by TEXT and keeps the card out
  // of FSRS scheduling until someone writes a real question. Do not "fix" this
  // by inventing a cleverer template; write the card by hand.
  const review = {
    id: `rq-${id}`,
    conceptId: id,
    type: 'design',
    difficulty: 'core',
    question: `What mechanism and trade-off should an engineer explain when designing ${name}?`,
    answer: mentalModel,
    source: 'editorial',
    curriculumSource: source,
  };
  replaceGenerated(reviewsFile.reviewQuestions, review, 'review question');
}

const conceptById = new Map(conceptsFile.concepts.map((concept) => [concept.id, concept]));

for (const [id, track] of Object.entries(RECLASSIFICATIONS)) {
  const concept = conceptById.get(id);
  if (!concept) throw new Error(`Cannot reclassify missing concept "${id}"`);
  concept.tags = [track, ...concept.tags.filter((tag) => tag !== track)];
}

for (const path of ROADMAP_DEFINITIONS) {
  const allConceptIds = path.groups.flat();
  const artifactId = `synthesize-${path.id}`;
  const artifact = {
    id: artifactId,
    title: `Synthesize: ${path.title.replace(/^12-Week /, '')}`,
    type: 'synthesis-project',
    difficulty: 'advanced',
    concepts: allConceptIds,
    projects: [],
    description: `${path.goal} Produce one working system, benchmark, or evidence-backed design that integrates the path.`,
    successCriteria: [
      'Implements or precisely models the core mechanisms from all three milestones',
      'Includes at least one injected failure or adversarial case and demonstrates recovery',
      'Reports quality, latency, resource, reliability, or usability measurements relevant to the domain',
      'Ships a concise architecture note explaining decisions, trade-offs, and remaining risks',
    ],
    deliverables: [
      'Runnable code, reproducible benchmark, or executable design harness',
      'Focused validation command with captured output',
      'Architecture diagram or typed interface map',
      'Short evidence-backed write-up',
    ],
    curriculumSource: source,
  };
  replaceGenerated(artifactsFile.artifacts, artifact, 'artifact');

  const roadmap = {
    id: path.id,
    title: path.title,
    horizon: '90d',
    goal: path.goal,
    description: `${path.goal} Three four-week milestones move from mechanisms to production trade-offs and a measured synthesis artifact.`,
    tracks: path.tracks,
    milestones: path.groups.map((conceptIds, index) => ({
      title: MILESTONE_TITLES[index] ?? `Milestone ${index + 1}`,
      goal: MILESTONE_GOALS[index] ?? path.goal,
      concepts: conceptIds,
      drills: conceptIds.map((id) => conceptById.get(id)?.drills?.[0]).filter(Boolean),
      artifacts: index === path.groups.length - 1 ? [artifactId] : [],
    })),
    curriculumSource: source,
  };
  replaceGenerated(roadmapsFile.roadmaps, roadmap, 'roadmap');

  for (const id of allConceptIds) {
    const concept = conceptById.get(id);
    if (!concept) throw new Error(`Roadmap "${path.id}" references missing concept "${id}"`);
    concept.roadmaps ??= [];
    if (!concept.roadmaps.includes(path.id)) concept.roadmaps.push(path.id);
    concept.artifacts ??= [];
    if (!concept.artifacts.includes(artifactId)) concept.artifacts.push(artifactId);
  }
}

// The database track already has a deep, disk-first roadmap. Extend that path
// instead of creating an overlapping eleventh roadmap, and connect its new
// concepts to the closest existing implementation artifacts.
const DATABASE_ATTACHMENTS = [
  {
    conceptId: 'transaction-processing',
    milestoneTitle: 'Phase 2 — Disk-oriented storage engines',
    artifactId: 'toy-wal',
  },
  {
    conceptId: 'query-execution-optimization',
    milestoneTitle: 'Phase 4-5 — Columnar execution + ClickHouse',
    artifactId: 'object-storage-index',
  },
  {
    conceptId: 'warehouses-lakehouses',
    milestoneTitle: 'Phase 6 — Cloud warehouses',
    artifactId: 'object-storage-index',
  },
];

const databaseRoadmap = roadmapsFile.roadmaps.find((roadmap) => roadmap.id === 'db-disk-first');
if (!databaseRoadmap) throw new Error('Cannot extend missing roadmap "db-disk-first"');

for (const attachment of DATABASE_ATTACHMENTS) {
  const concept = conceptById.get(attachment.conceptId);
  const milestone = databaseRoadmap.milestones.find(
    (candidate) => candidate.title === attachment.milestoneTitle
  );
  const artifact = artifactsFile.artifacts.find(
    (candidate) => candidate.id === attachment.artifactId
  );
  if (!concept || !milestone || !artifact) {
    throw new Error(`Cannot attach database concept "${attachment.conceptId}"`);
  }

  milestone.concepts ??= [];
  if (!milestone.concepts.includes(concept.id)) milestone.concepts.push(concept.id);
  milestone.drills ??= [];
  const drillId = concept.drills?.[0];
  if (drillId && !milestone.drills.includes(drillId)) milestone.drills.push(drillId);
  milestone.artifacts ??= [];
  if (!milestone.artifacts.includes(artifact.id)) milestone.artifacts.push(artifact.id);

  artifact.concepts ??= [];
  if (!artifact.concepts.includes(concept.id)) artifact.concepts.push(concept.id);
  concept.roadmaps ??= [];
  if (!concept.roadmaps.includes(databaseRoadmap.id)) concept.roadmaps.push(databaseRoadmap.id);
  concept.artifacts ??= [];
  if (!concept.artifacts.includes(artifact.id)) concept.artifacts.push(artifact.id);
}

// Seed "related" links from roadmap adjacency, and nothing else.
//
// This block used to also do `concept.prerequisites = [previous]`, i.e. treat a
// concept's POSITION in a flattened group list as a dependency edge. That is
// what produced chains like `pose-motion-tracking <- voice-audio-systems` (pose
// estimation does not depend on speech recognition) and
// `flashattention-kernels <- model-routing`. Worse, `newIds` is every id in
// DEFINITIONS rather than only ids created on this run, so it re-imposed the
// invented chain on every regeneration and silently reverted hand-authored
// graphs. Any roadmap whose prerequisites are wrong dead-ends the daily
// planner, which walks a path's own concepts first.
//
// A generator cannot know real dependencies. Leave `prerequisites` empty and
// let a human write them; an empty list is honest, an invented one is harmful.
// `related` is only a "see also", so adjacency is a defensible seed for it.
for (const path of ROADMAP_DEFINITIONS) {
  const sequence = path.groups.flat();
  for (let index = 0; index < sequence.length; index++) {
    const id = sequence[index];
    if (!newIds.has(id)) continue;
    const concept = conceptById.get(id);
    concept.prerequisites ??= [];
    if (!concept.related?.length) {
      concept.related = [sequence[index - 1], sequence[index + 1]].filter(Boolean);
    }
  }
}

// Reconcile the two sources of truth for roadmap membership.
//
// A concept belongs to a roadmap via `concept.roadmaps`, but the roadmap PAGE
// renders `roadmap.milestones[].concepts`. Those drift: `groups` above only
// covers concepts this script generates, so any hand-tagged concept (an
// existing concept a human added to a path) was tagged-but-invisible — 65 of
// them across 10 paths before this ran. A learner following the roadmap page
// would never be shown them, while the planner counted them as in-path.
//
// Anything tagged but ungrouped is, by construction, a supporting concept
// pulled in from another track, so it lands in the foundations milestone.
for (const roadmap of roadmapsFile.roadmaps) {
  if (!roadmap.milestones?.length) continue;
  const shown = new Set(roadmap.milestones.flatMap((m) => m.concepts ?? []));
  const tagged = conceptsFile.concepts
    .filter((concept) => (concept.roadmaps ?? []).includes(roadmap.id))
    .map((concept) => concept.id);
  const missing = tagged.filter((id) => !shown.has(id));
  if (!missing.length) continue;
  const first = roadmap.milestones[0];
  first.concepts = [...missing, ...(first.concepts ?? [])];
  first.drills = first.concepts.map((id) => conceptById.get(id)?.drills?.[0]).filter(Boolean);
}

for (const category of COVERAGE.categories) {
  if (!category.topics.length) throw new Error(`Coverage category "${category.id}" has no topics`);
  for (const entry of category.topics) {
    if (!entry.concepts.length) {
      throw new Error(`Coverage topic "${category.id}/${entry.name}" has no concepts`);
    }
    for (const id of entry.concepts) {
      if (!conceptById.has(id)) {
        throw new Error(`Coverage topic "${category.id}/${entry.name}" references missing "${id}"`);
      }
    }
  }
}

write(paths.concepts, conceptsFile);
write(paths.drills, drillsFile);
write(paths.reviews, reviewsFile);
write(paths.artifacts, artifactsFile);
write(paths.roadmaps, roadmapsFile);
write(paths.coverage, COVERAGE);

console.log('Expanded learning domains', {
  newConcepts: DEFINITIONS.length,
  reclassifiedConcepts: Object.keys(RECLASSIFICATIONS).length,
  newRoadmaps: ROADMAP_DEFINITIONS.length,
  coverageCategories: COVERAGE.categories.length,
  coverageTopics: COVERAGE.categories.reduce((sum, category) => sum + category.topics.length, 0),
});
