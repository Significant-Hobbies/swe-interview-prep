import type {
  RubricAnchor,
  RubricDimension,
  SystemDesignCase,
  SystemDesignStage,
  SystemDesignStageId,
} from './system-design-case-schema';
import { SYSTEM_DESIGN_CATEGORIES } from './system-design-case-schema';
import { POPULAR_SYSTEM_DESIGN_CASES } from './system-design-popular-cases';

const SCORE_ANCHORS: RubricAnchor[] = [
  { score: 0, description: 'No relevant evidence or a fundamental misconception.' },
  { score: 1, description: 'Names part of the concern without a usable mechanism or trade-off.' },
  {
    score: 2,
    description: 'Provides a workable mechanism with assumptions and one relevant trade-off.',
  },
  {
    score: 3,
    description: 'Connects assumptions, mechanism, trade-offs, failure behavior, and evidence.',
  },
];

function stages(values: Record<SystemDesignStageId, [string, string]>): SystemDesignStage[] {
  return (Object.entries(values) as [SystemDesignStageId, [string, string]][]).map(
    ([id, [prompt, interviewerNote]]) => ({
      id,
      title: {
        scoping: 'Scope the problem',
        estimation: 'Estimate capacity',
        'high-level-design': 'High-level design',
        'deep-dive': 'Defend the critical path',
        failure: 'Failure injection',
        review: 'Review and improve',
      }[id],
      prompt,
      interviewerNote,
    })
  );
}

function dimension(
  id: string,
  label: string,
  weight: number,
  stageIds: SystemDesignStageId[],
  evidenceSignals: string[],
  conceptIds: string[],
  drillIds: string[],
  misconceptionSignals: string[] = []
): RubricDimension {
  return {
    id,
    label,
    weight,
    stageIds,
    evidenceSignals,
    misconceptionSignals,
    anchors: SCORE_ANCHORS,
    conceptIds,
    drillIds,
  };
}

const llmInferenceCase: SystemDesignCase = {
  id: 'llm-inference-10k-rps',
  version: '1.0.0',
  title: 'Design LLM inference at 10K RPS',
  category: 'ai-systems',
  pattern: 'token-aware accelerator scheduling',
  criticalPath: 'admission through continuous batching to streamed decode',
  durationMinutes: 45,
  prompt:
    'Design a production LLM inference service that sustains 10,000 requests per second. Explain how you turn that headline into capacity, architecture, overload, and reliability decisions.',
  difficulty: 'advanced',
  hiddenAssumptions: [
    'One fixed model is served initially; quality permits an explicitly degraded smaller fallback.',
    'Average requests contain 1,000 input tokens and 200 output tokens; p95 lengths are materially higher.',
    'Traffic is 10,000 sustained RPS with a 15,000 RPS short peak and streamed responses.',
    'The target is sub-second p99 time to first token with about 50 generated tokens/s per active stream.',
    'The service must survive loss of one availability zone and enforce per-tenant quotas.',
  ],
  stages: stages({
    scoping: [
      'What must you learn before 10K RPS becomes a useful requirement? Ask the interviewer your questions, then state any assumptions you need.',
      'Look for model size, token distributions, context, streaming, TTFT and output-speed SLOs, traffic shape, quality, regions, availability, tenancy, and cost.',
    ],
    estimation: [
      'Convert the workload into input tokens/s, output tokens/s, concurrent sequences, and a fleet-sizing method. Show units and headroom.',
      'A strong answer uses Little’s Law, distinguishes prefill from decode, and sizes from measured replica capacity rather than naming a universal GPU count.',
    ],
    'high-level-design': [
      'Describe the request path and the separate control plane. Explain routing, admission, queueing, batching, streaming, model placement, and autoscaling.',
      'Probe bounded queues, token-aware quotas, context or priority pools, warm capacity, cancellation, and control-plane isolation.',
    ],
    'deep-dive': [
      'Choose the most important serving bottleneck and defend its design. Include the competing latency, throughput, memory, fairness, and cost pressures.',
      'Accept a deep dive on batching, KV cache, prefill/decode separation, prefix caching, routing, or admission control if it contains measurable trade-offs.',
    ],
    failure: [
      'Traffic doubles from 10K to 20K RPS in thirty seconds while a zone loses half its serving workers. Walk through detection, mitigation, degradation, and recovery.',
      'Look for pre-overload queue signals, warm headroom, early shedding, retry control, fallback tiers, zone-aware routing, and safe recovery.',
    ],
    review: [
      'Summarize the design in two minutes. Name the weakest assumption and the first benchmark or load test you would run.',
      'The answer may now be compared with the reference and calculation anchors.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'token-throughput',
      label: 'Token throughput',
      formula: 'request rate × tokens per request',
      unit: 'input tokens/s and output tokens/s',
      expectedTerms: ['request', 'input', 'output', 'token', 'second'],
    },
    {
      id: 'active-sequences',
      label: 'Concurrent generation',
      formula: 'arrival rate × average time in system',
      unit: 'active sequences',
      expectedTerms: ['concurrency', 'arrival', 'latency', 'Little'],
    },
    {
      id: 'replica-capacity',
      label: 'Fleet size from benchmark',
      formula: 'ceil(peak load / (measured capacity per replica × target utilization))',
      unit: 'serving replicas',
      expectedTerms: ['benchmark', 'peak', 'replica', 'utilization', 'headroom'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Requirements and workload',
      0.18,
      ['scoping'],
      ['model size', 'input tokens', 'output tokens', 'streaming', 'TTFT', 'peak', 'availability'],
      ['inference-engines', 'inference-cost-latency'],
      ['practice-inference-engines'],
      ['10K RPS is enough to choose hardware']
    ),
    dimension(
      'capacity',
      'Capacity reasoning',
      0.22,
      ['estimation'],
      ['input tokens/s', 'output tokens/s', 'concurrency', 'benchmark', 'headroom', 'KV cache'],
      ['capacity-estimation', 'queueing-theory', 'inference-hardware'],
      ['practice-inference-hardware'],
      ['fixed GPU count without workload measurement']
    ),
    dimension(
      'architecture',
      'Request and control planes',
      0.2,
      ['high-level-design'],
      ['admission', 'router', 'bounded queue', 'scheduler', 'streaming', 'model registry'],
      ['load-balancing', 'rate-limiting', 'inference-engines'],
      ['design-load-balancer', 'design-rate-limiter']
    ),
    dimension(
      'serving-mechanics',
      'Serving mechanics and trade-offs',
      0.22,
      ['deep-dive'],
      ['continuous batching', 'prefill', 'decode', 'KV cache', 'deadline', 'fairness'],
      ['continuous-batching', 'kv-cache-paged-attention', 'inference-cost-latency'],
      ['practice-continuous-batching', 'practice-kv-cache-paged-attention']
    ),
    dimension(
      'reliability',
      'Overload and reliability',
      0.18,
      ['failure', 'review'],
      ['load shed', 'warm capacity', 'retry budget', 'fallback model', 'zone', 'queue age'],
      ['monitoring-analytics', 'capacity-estimation', 'rate-limiting'],
      ['queue-backpressure', 'practice-opentelemetry-observability'],
      ['unbounded queue', 'autoscale on CPU only']
    ),
  ],
  followUps: [
    {
      id: 'disaggregated-serving',
      stageId: 'deep-dive',
      matchAny: ['prefill', 'decode', 'disaggregate'],
      prompt:
        'When would you separate prefill and decode pools, and which network and scheduling costs does that introduce?',
    },
    {
      id: 'shared-prefixes',
      stageId: 'deep-dive',
      matchAny: ['prefix', 'cache', 'system prompt'],
      prompt:
        'How do you key, invalidate, measure, and isolate prefix-cache entries across models, adapters, and tenants?',
    },
  ],
  failureInjections: [
    {
      id: 'burst-and-zone-loss',
      title: 'Burst during zone loss',
      prompt: 'Traffic doubles within thirty seconds while one zone loses half its GPU workers.',
      expectedSignals: [
        'queue age',
        'admission',
        'warm capacity',
        'load shed',
        'retry budget',
        'fallback',
        'recovery',
      ],
    },
  ],
  conceptIds: [
    'inference-engines',
    'continuous-batching',
    'kv-cache-paged-attention',
    'inference-cost-latency',
    'inference-hardware',
    'capacity-estimation',
    'queueing-theory',
    'load-balancing',
    'rate-limiting',
    'monitoring-analytics',
  ],
  drillIds: [
    'practice-inference-engines',
    'practice-continuous-batching',
    'practice-kv-cache-paged-attention',
    'practice-inference-hardware',
    'queue-backpressure',
  ],
  commonMistakes: [
    'Treating requests per second as the only load unit.',
    'Naming a GPU count without a model, token distribution, benchmark, or SLO.',
    'Using an unbounded FIFO queue and calling it backpressure.',
    'Autoscaling only on CPU or average GPU utilization.',
    'Ignoring cancellation, retry amplification, and disconnected streaming clients.',
  ],
  strongerAnswer:
    'Turn RPS into prompt tokens, generated tokens, concurrent sequences, and a tail-latency target. Route authenticated requests through token-aware admission into bounded priority queues, then use continuous batching and managed KV-cache memory on warm multi-zone workers. Size each pool from workload-replay benchmarks at the target p99 with failure headroom, and shed or degrade low-priority work before queues collapse. Operate on TTFT, inter-token latency, queue age, token throughput, KV pressure, rejection rate, and cost per token.',
  sources: [
    {
      title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention',
      url: 'https://arxiv.org/abs/2309.06180',
      kind: 'paper',
    },
    {
      title: 'NVIDIA Triton Inference Server dynamic batching',
      url: 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html',
      kind: 'official-doc',
    },
    {
      title: 'vLLM production metrics',
      url: 'https://docs.vllm.ai/en/stable/design/metrics/',
      kind: 'official-doc',
    },
    {
      title: 'Kubernetes horizontal pod autoscaling',
      url: 'https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/',
      kind: 'official-doc',
    },
    {
      title: 'NVIDIA LLM inference benchmarking fundamentals',
      url: 'https://developer.nvidia.com/blog/llm-benchmarking-fundamental-concepts/',
      kind: 'official-doc',
    },
  ],
  publication: {
    state: 'approved',
    guide: {
      slug: 'llm-inference-10k-rps',
      title: 'Design LLM Inference at 10K RPS | Interview Guide',
      description:
        'Work through requirements, token math, batching, GPU fleet sizing, reliability, and follow-ups for a 10,000 RPS LLM inference interview.',
      publishedAt: '2026-08-04',
      updatedAt: '2026-08-04',
      sections: [
        {
          heading: 'Clarify the contract',
          body: `“Design LLM inference for 10,000 requests per second” sounds like a throughput question, but 10K RPS alone cannot size an autoregressive serving system. One request might classify ten tokens; another might retain a large KV cache while streaming a 2,000-token answer. The strongest opening is to turn the headline into a measurable workload and a latency, quality, availability, and cost contract.

Ask which model or model family is served and whether quality permits quantization or a smaller fallback. Ask for p50, p95, and p99 input and output token lengths, the maximum context, streaming behavior, time-to-first-token and output-speed targets, traffic peaks, regions, availability, tenant priorities, and cost constraints. Prompt repetition determines whether prefix caching matters; sampling and authorization determine whether complete-response caching is safe.

For a concrete calculation, state assumptions after asking. Suppose one fixed model streams responses, sustained traffic is 10K RPS with a 15K short peak, an average request has 1,000 input and 200 output tokens, p99 TTFT must remain below one second, output runs near 50 tokens per second, and the service must survive one zone. These are illustrative inputs, not universal facts. Making them explicit allows every later box and number to be challenged.`,
        },
        {
          heading: 'Capacity math',
          body: `Convert request traffic into the work the GPUs see. Steady prefill traffic is 10,000 requests/s × 1,000 input tokens/request = 10,000,000 input tokens/s. Decode traffic is 10,000 × 200 = 2,000,000 output tokens/s. At 50 generated tokens/s, a 200-token completion remains active for roughly four seconds. Little’s Law gives about 10,000 × 4 = 40,000 concurrent generations.

Repeat the math for the peak and tail token lengths. Capacity must satisfy prefill throughput, decode throughput, active-sequence and KV-cache capacity, and the latency SLO. The constraint that saturates first determines usable fleet capacity.

Do not guess a GPU count. Replay the representative prompt and output distribution against one candidate replica, sweep concurrency and batching, and find the highest sustainable throughput that still meets p99. If a measured replica sustains C requests/s, an initial estimate is ceil(peak RPS / (C × target utilization)). Cross-check with ceil(peak input tokens/s / measured prefill tokens/s per replica / utilization) and the equivalent decode equation. A 70% target utilization leaves explicit burst and failure headroom.

For combined workers, benchmark the mixed workload instead of adding independent prefill and decode counts. If long prompts demonstrably block decode and damage output cadence, consider chunked prefill or separate pools. PagedAttention explains why KV-cache management changes throughput, but a published benchmark never replaces measurement of this model, hardware, distribution, and SLO.`,
        },
        {
          heading: 'Architecture',
          body: `The request path is client → global load balancer → API gateway → admission and quota service → model router → bounded priority queue and batch scheduler → inference worker → streaming gateway → client.

The global layer routes to a healthy region. The gateway authenticates the tenant, validates request size, assigns a deadline and request ID, enforces token-aware quotas, and propagates cancellation when the client disconnects. The model router selects a compatible pool by model, adapter, context bucket, tenant tier, and region. Long batch prompts should not share an undifferentiated queue with latency-sensitive chat.

Each serving replica holds model weights and managed KV-cache memory. The scheduler continuously forms batches from ready prefill and decode work. Finished sequences leave and new work enters instead of making a static batch wait for the longest generation. A streaming gateway forwards tokens with backpressure and must not buffer the whole answer before delivery.

A separate control plane owns the model registry, signed artifacts, rollout configuration, placement, autoscaling targets, and health. Model loading is slow and memory-heavy, so the data plane maintains warm capacity. Health distinguishes an alive process from a loaded model capable of a small inference probe.`,
        },
        {
          heading: 'Deep dive',
          body: `Batching is a latency-throughput negotiation. Waiting briefly can create a more efficient batch, but waiting consumes the TTFT budget. The scheduler therefore needs per-class queue deadlines, maximum delay, and fairness. It should observe token work rather than treating every request equally: a tenant sending huge contexts can consume far more prefill and KV capacity than one sending short prompts.

Continuous batching handles unequal completion lengths. KV-cache blocks must be allocated and reclaimed predictably, with cancellation freeing memory promptly. Prefix caching can avoid repeated prefill for shared system prompts, but the key includes the exact model, tokenizer, adapter, and prefix. Isolation rules must prevent one tenant’s private prompt state from becoming another tenant’s cache hit.

Prefill and decode contend differently for compute and memory bandwidth. Start with a simpler combined pool. Disaggregate only when profiling shows better SLO or fleet efficiency after accounting for KV transfer, network bandwidth, routing, and extra failure modes. Likewise, quantization, speculative decoding, parallelism, and cache policies are benchmark hypotheses—not unconditional wins.`,
        },
        {
          heading: 'Failure handling',
          body: `Unbounded queues turn a spike into a latency outage. Give every request a deadline and every queue a maximum depth and age. Admission estimates whether the selected pool can finish work before the deadline. When capacity is exhausted, reject lower-priority work early, enforce tenant token budgets, cap output for an explicit degraded tier, route eligible traffic to a smaller model, preserve reserved critical capacity, and cancel work after disconnect or deadline expiry.

Retries need budgets and jitter because blind retries amplify overload. Generation replay semantics must be explicit: a stochastic retry may not reproduce the same tokens.

Run pools across at least three failure domains and reserve enough capacity that losing one does not overload the others. On worker failure, stop routing, terminate or retry streams according to contract, and replace from a nearby artifact or node cache. On regional loss, route new requests to another warm region. Active streams may restart because transferring a live KV cache across regions is usually more complex than replaying the prompt.

If traffic doubles in thirty seconds during a zone loss, cold GPU autoscaling will be too slow. Respond with warm headroom, predictive scaling for known events, an adjustable admission limit, priority shedding, retry control, and the smaller fallback. Trigger overload policy on queue age and SLO burn before p99 collapses.`,
        },
        {
          heading: 'Observability and cost',
          body: `Measure the user experience with TTFT, inter-token latency or time per output token, end-to-end completion time, success, cancellation, and rejection rates by tenant and model. Measure saturation with running and waiting requests, queue age, prompt and generation tokens/s, batch composition, KV-cache usage and eviction, prefix-cache hit rate, GPU memory, model-load time, and preemption or recomputation.

These signals are better scaling inputs than CPU. vLLM exposes running and waiting work, cache usage, and token rates; Triton exposes queue and batch behavior. Scaling policy should combine demand, saturation, readiness delay, and a stabilization window so slow model startup does not cause oscillation.

Report cost per successful request and per million input and output tokens, split by model and tenant. Include warm idle capacity, failed or cancelled work, cross-region traffic, and fallback usage. Optimize cost while holding quality and latency constant. A cheaper quantized result is not a win if it silently violates the product’s quality contract.`,
        },
        {
          heading: 'Common mistakes',
          body: `Common weak answers treat RPS as the only load unit, name a GPU count without a workload benchmark, or draw an unbounded FIFO queue. They scale on CPU, ignore cancellation and retry amplification, mix long batch prompts with interactive traffic, assume prefix caching always helps, or promise regional failover without enough warm capacity to absorb it.

Another mistake is optimizing one average. Production decisions live in distributions: p99 prompt length, p99 TTFT, burst duration, queue age, and tenant skew. State which tail matters and how the system behaves when it cannot meet it.`,
        },
        {
          heading: 'Harder follow-ups',
          body: `How does the design change for several models and thousands of tenant-specific LoRA adapters? When does prefill/decode disaggregation win, and which network bottleneck appears? How do you preserve fairness when one tenant sends very long contexts? What do you inspect when TTFT is healthy but inter-token latency degrades? How do you roll out a quantized model and prove that savings do not hide a quality regression?

Practice answering each by returning to requirements, measurements, and failure behavior. The goal is not to memorize one diagram; it is to rebuild a defensible design when the interviewer changes a constraint.`,
        },
      ],
      finalAnswer:
        'Turn 10K RPS into prompt tokens, generated tokens, concurrent sequences, and a tail-latency target. Route authenticated work through token-aware admission into bounded priority queues, then use continuous batching and managed KV-cache memory on warm multi-zone workers. Size pools from workload-replay benchmarks at the target p99 with failure headroom, and shed or degrade low-priority work before queues collapse. Operate on TTFT, inter-token latency, queue age, token throughput, KV pressure, rejection rate, and cost per token.',
    },
  },
};

const productionRagCase: SystemDesignCase = {
  id: 'production-rag',
  version: '1.0.0',
  title: 'Design production RAG',
  category: 'ai-systems',
  pattern: 'fresh permission-aware retrieval augmentation',
  criticalPath: 'authorized hybrid retrieval through grounded generation',
  durationMinutes: 45,
  prompt:
    'Design retrieval-augmented generation over a large, frequently changing document corpus with permissions and citations.',
  difficulty: 'advanced',
  hiddenAssumptions: [
    'The corpus contains 100 million documents and changes continuously.',
    'Users may retrieve only documents they are authorized to read.',
    'Answers must cite source spans and expose retrieval confidence.',
    'Freshness under five minutes is required for critical document classes.',
  ],
  stages: stages({
    scoping: [
      'Clarify corpus, query, freshness, permission, answer, and evaluation requirements.',
      'Probe document types, update rates, ACL cardinality, latency, languages, citations, deletion, and quality SLOs.',
    ],
    estimation: [
      'Estimate ingestion, index, query, and model-serving load with explicit units.',
      'Look for document/chunk counts, embedding storage, update throughput, query fan-out, and latency budget.',
    ],
    'high-level-design': [
      'Separate offline ingestion from the online retrieve-rank-generate path.',
      'Require versioned parsing, chunk identity, ACL enforcement, hybrid retrieval, reranking, citations, and observability.',
    ],
    'deep-dive': [
      'Defend freshness, permission filtering, or retrieval evaluation in depth.',
      'Look for atomic version transitions, delete propagation, filter strategy, golden queries, and failure attribution.',
    ],
    failure: [
      'An embedding rollout cuts recall for newly updated documents while the old index is still serving. Diagnose and recover.',
      'Expect version metrics, shadow evaluation, rollback, dual-read or alias switch, and replay of missed updates.',
    ],
    review: [
      'Summarize the two pipelines and the quality contract in two minutes.',
      'Compare with the reference only after submission.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'chunk-storage',
      label: 'Embedding storage',
      formula: 'chunks × dimensions × bytes per dimension × index overhead',
      unit: 'bytes',
      expectedTerms: ['chunks', 'dimensions', 'bytes', 'overhead'],
    },
    {
      id: 'query-budget',
      label: 'Online latency budget',
      formula: 'retrieve + rerank + prompt assembly + generation',
      unit: 'milliseconds',
      expectedTerms: ['retrieve', 'rerank', 'generation', 'latency'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Corpus and answer contract',
      0.2,
      ['scoping'],
      ['freshness', 'permissions', 'citations', 'deletion', 'latency'],
      ['rag-system-design', 'rag'],
      ['design-rag-system']
    ),
    dimension(
      'capacity',
      'Corpus and query estimation',
      0.2,
      ['estimation'],
      ['chunks', 'embedding bytes', 'updates/s', 'QPS', 'fan-out'],
      ['capacity-estimation', 'embeddings'],
      ['design-rag-system']
    ),
    dimension(
      'pipelines',
      'Offline and online pipelines',
      0.2,
      ['high-level-design'],
      ['ingestion', 'chunk identity', 'hybrid', 'rerank', 'context', 'citation'],
      ['rag-system-design', 'reranking'],
      ['build-rag-pipeline']
    ),
    dimension(
      'quality',
      'Retrieval quality and permissions',
      0.2,
      ['deep-dive'],
      ['golden set', 'recall@k', 'ACL', 'version', 'grounding'],
      ['ranking-metrics', 'cap-theorem'],
      ['design-rag-system']
    ),
    dimension(
      'reliability',
      'Freshness and rollback',
      0.2,
      ['failure', 'review'],
      ['shadow', 'rollback', 'dual index', 'replay', 'alert'],
      ['replication', 'monitoring-analytics'],
      ['replication-lag-read']
    ),
  ],
  followUps: [
    {
      id: 'acl-filtering',
      stageId: 'deep-dive',
      matchAny: ['permission', 'ACL', 'tenant'],
      prompt: 'How do you prevent unauthorized candidates without destroying recall or latency?',
    },
    {
      id: 'hybrid-retrieval',
      stageId: 'deep-dive',
      matchAny: ['hybrid', 'BM25', 'vector'],
      prompt: 'How do you fuse lexical and dense rankings and evaluate the fusion?',
    },
  ],
  failureInjections: [
    {
      id: 'bad-embedding-rollout',
      title: 'Embedding regression',
      prompt: 'A new embedding version silently reduces recall for fresh documents.',
      expectedSignals: ['version', 'shadow', 'golden set', 'rollback', 'reindex', 'replay'],
    },
  ],
  conceptIds: [
    'rag-system-design',
    'rag',
    'embeddings',
    'reranking',
    'ranking-metrics',
    'cap-theorem',
    'replication',
    'monitoring-analytics',
    'capacity-estimation',
  ],
  drillIds: ['design-rag-system', 'build-rag-pipeline', 'replication-lag-read'],
  commonMistakes: [
    'Treating ingestion and querying as one synchronous pipeline.',
    'Filtering permissions after retrieval.',
    'Measuring answer style without isolating retrieval recall.',
  ],
  strongerAnswer:
    'Version the offline parse, chunk, embed, and index pipeline separately from the online authorize, retrieve, rerank, assemble, and generate path. Preserve stable chunk identity, enforce permissions before evidence reaches the model, measure retrieval independently, and switch index versions atomically with rollback and replay.',
  sources: [
    {
      title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      url: 'https://arxiv.org/abs/2005.11401',
      kind: 'paper',
    },
    {
      title: 'Elasticsearch hybrid search',
      url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/retriever.html',
      kind: 'official-doc',
    },
  ],
  publication: { state: 'practice-only' },
};

const llmGatewayCase: SystemDesignCase = {
  id: 'multi-tenant-llm-gateway',
  version: '1.0.0',
  title: 'Design a multi-tenant LLM gateway',
  category: 'ai-systems',
  pattern: 'budgeted multi-provider model routing',
  criticalPath: 'tenant admission through provider streaming and accounting',
  durationMinutes: 45,
  prompt:
    'Design an API gateway in front of multiple LLM models and providers for thousands of tenants.',
  difficulty: 'advanced',
  hiddenAssumptions: [
    'Requests and responses may stream.',
    'Tenants have separate budgets, quotas, priorities, and data policies.',
    'Providers expose different limits and error semantics.',
    'The gateway must support safe retries and provider failover.',
  ],
  stages: stages({
    scoping: [
      'Clarify API compatibility, tenants, budgets, privacy, streaming, routing, and reliability.',
      'Probe token-based quotas, provider diversity, regional policy, retry semantics, and cost visibility.',
    ],
    estimation: [
      'Estimate request, token, connection, and provider-quota pressure.',
      'Look for RPS, input/output tokens, concurrent streams, retry amplification, and budget units.',
    ],
    'high-level-design': [
      'Design the authentication, policy, routing, provider-adapter, streaming, and accounting path.',
      'Require an immutable request identity, normalized errors, token estimates, quotas, and audit trail.',
    ],
    'deep-dive': [
      'Defend fairness, failover, or streaming backpressure.',
      'Look for tenant isolation, retry budgets, circuit breakers, cancellation, and provider capability matching.',
    ],
    failure: [
      'One provider latency triples and begins returning intermittent 429s. Protect other tenants and recover.',
      'Expect circuit state, hedging limits, provider quota awareness, fallback policy, and cost controls.',
    ],
    review: [
      'Summarize how policy remains consistent across providers.',
      'Reveal the reference only now.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'token-budget',
      label: 'Tenant budget',
      formula: 'input tokens × input price + output tokens × output price',
      unit: 'currency',
      expectedTerms: ['input', 'output', 'token', 'price'],
    },
    {
      id: 'stream-concurrency',
      label: 'Concurrent streams',
      formula: 'arrival rate × stream duration',
      unit: 'connections',
      expectedTerms: ['arrival', 'duration', 'concurrency'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Tenant and provider contract',
      0.2,
      ['scoping'],
      ['tenant', 'budget', 'privacy', 'streaming', 'provider'],
      ['api-design', 'auth-systems'],
      ['design-rate-limiter']
    ),
    dimension(
      'capacity',
      'Token and connection estimation',
      0.2,
      ['estimation'],
      ['tokens', 'concurrent streams', 'quota', 'retry'],
      ['capacity-estimation', 'queueing-theory'],
      ['queue-backpressure']
    ),
    dimension(
      'architecture',
      'Policy and adapter architecture',
      0.2,
      ['high-level-design'],
      ['authentication', 'policy', 'router', 'adapter', 'accounting'],
      ['api-design', 'strategy-pattern'],
      ['design-pricing-strategies']
    ),
    dimension(
      'fairness',
      'Fairness and streaming semantics',
      0.2,
      ['deep-dive'],
      ['token bucket', 'priority', 'backpressure', 'cancellation', 'idempotency'],
      ['rate-limiter-design', 'idempotency'],
      ['token-bucket-limiter']
    ),
    dimension(
      'reliability',
      'Provider failure isolation',
      0.2,
      ['failure', 'review'],
      ['circuit breaker', 'retry budget', 'fallback', '429', 'observability'],
      ['monitoring-analytics', 'rate-limiting'],
      ['practice-opentelemetry-observability']
    ),
  ],
  followUps: [
    {
      id: 'streaming-retry',
      stageId: 'deep-dive',
      matchAny: ['stream', 'SSE', 'WebSocket'],
      prompt:
        'What can be retried after the first token has been delivered, and how is partial billing represented?',
    },
    {
      id: 'tenant-fairness',
      stageId: 'deep-dive',
      matchAny: ['quota', 'fair', 'priority'],
      prompt: 'How do you prevent one long-context tenant from consuming every provider slot?',
    },
  ],
  failureInjections: [
    {
      id: 'provider-throttle',
      title: 'Provider throttling',
      prompt: 'A primary provider triples latency and returns intermittent 429s.',
      expectedSignals: [
        'circuit breaker',
        'retry budget',
        'fallback',
        'tenant isolation',
        'backoff',
        'cost',
      ],
    },
  ],
  conceptIds: [
    'api-design',
    'auth-systems',
    'capacity-estimation',
    'queueing-theory',
    'strategy-pattern',
    'rate-limiter-design',
    'idempotency',
    'monitoring-analytics',
    'rate-limiting',
  ],
  drillIds: [
    'design-rate-limiter',
    'queue-backpressure',
    'design-pricing-strategies',
    'token-bucket-limiter',
  ],
  commonMistakes: [
    'Rate-limiting only by requests rather than tokens.',
    'Retrying a partially streamed generation as though it were idempotent.',
    'Hiding provider-specific failures without a normalized contract.',
  ],
  strongerAnswer:
    'Authenticate once, evaluate tenant policy and token budgets, route by capability and health, normalize provider streaming and errors, and account from an immutable request record. Use token-aware fairness, bounded retries, circuit breakers, cancellation, and explicit degraded-provider policies.',
  sources: [
    {
      title: 'RateLimit Fields for HTTP',
      url: 'https://www.rfc-editor.org/rfc/rfc9331',
      kind: 'standard',
    },
    {
      title: 'OpenTelemetry HTTP semantic conventions',
      url: 'https://opentelemetry.io/docs/specs/semconv/http/',
      kind: 'official-doc',
    },
  ],
  publication: { state: 'practice-only' },
};

const recommendationCase: SystemDesignCase = {
  id: 'real-time-recommendations',
  version: '1.0.0',
  title: 'Design real-time recommendations',
  category: 'ai-systems',
  pattern: 'online candidate retrieval and ranking',
  criticalPath: 'fresh features through retrieve-rank-serve',
  durationMinutes: 45,
  prompt: 'Design a real-time recommendation service for a large consumer application.',
  difficulty: 'advanced',
  hiddenAssumptions: [
    'The service handles 50K recommendation QPS.',
    'Fresh user actions should affect recommendations within one minute.',
    'The response must meet a 150 ms p99 budget.',
    'The product needs exploration, diversity, and safe model rollback.',
  ],
  stages: stages({
    scoping: [
      'Clarify users, items, objective, freshness, latency, policy, and evaluation.',
      'Probe candidate universe, feedback events, cold start, diversity, safety, and business objective.',
    ],
    estimation: [
      'Estimate event, feature, candidate, inference, and response load.',
      'Look for QPS, events/s, feature bytes, candidate counts, model calls, and latency budget.',
    ],
    'high-level-design': [
      'Design offline training and the online retrieve-rank-filter-serve path.',
      'Require feature definitions, event ingestion, candidate sources, ranking, policy filters, cache, and logging.',
    ],
    'deep-dive': [
      'Defend feature freshness, candidate generation, or experimentation.',
      'Look for point-in-time correctness, online/offline parity, exploration, and counterfactual bias.',
    ],
    failure: [
      'The online feature store is stale for ten minutes while the ranker remains healthy.',
      'Expect freshness signals, fallback features or model, degraded labels, isolation, and replay.',
    ],
    review: [
      'Summarize how the system learns without creating an uncontrolled feedback loop.',
      'Compare only after submission.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'latency-budget',
      label: 'Serving latency budget',
      formula: 'retrieve + feature fetch + rank + filter + network',
      unit: 'milliseconds',
      expectedTerms: ['retrieve', 'feature', 'rank', 'filter'],
    },
    {
      id: 'feature-throughput',
      label: 'Feature update throughput',
      formula: 'events/s × features updated per event',
      unit: 'feature writes/s',
      expectedTerms: ['events', 'features', 'writes'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Objective and freshness contract',
      0.2,
      ['scoping'],
      ['objective', 'freshness', 'latency', 'diversity', 'cold start'],
      ['ranking-metrics', 'social-media'],
      ['design-news-feed']
    ),
    dimension(
      'capacity',
      'Online and event estimation',
      0.2,
      ['estimation'],
      ['QPS', 'events/s', 'candidates', 'feature bytes', 'latency budget'],
      ['capacity-estimation', 'queueing-theory'],
      ['queue-backpressure']
    ),
    dimension(
      'architecture',
      'Retrieve-rank-serve architecture',
      0.2,
      ['high-level-design'],
      ['event log', 'feature store', 'candidate generation', 'ranker', 'filter'],
      ['embeddings', 'topk-vector-search'],
      ['design-news-feed']
    ),
    dimension(
      'evaluation',
      'Features and evaluation',
      0.2,
      ['deep-dive'],
      ['point-in-time', 'offline/online parity', 'exploration', 'A/B', 'guardrail'],
      ['ranking-metrics', 'monitoring-analytics'],
      ['practice-opentelemetry-observability']
    ),
    dimension(
      'reliability',
      'Staleness and fallback',
      0.2,
      ['failure', 'review'],
      ['freshness metric', 'fallback', 'last-known', 'degrade', 'replay'],
      ['replication', 'monitoring-analytics'],
      ['replication-lag-read']
    ),
  ],
  followUps: [
    {
      id: 'feature-parity',
      stageId: 'deep-dive',
      matchAny: ['feature', 'parity', 'point-in-time'],
      prompt: 'How do you prevent training-serving skew and future leakage?',
    },
    {
      id: 'exploration',
      stageId: 'deep-dive',
      matchAny: ['explore', 'bandit', 'A/B'],
      prompt: 'How do you explore without degrading guardrail metrics or reinforcing popularity?',
    },
  ],
  failureInjections: [
    {
      id: 'stale-features',
      title: 'Stale online features',
      prompt: 'The feature store serves ten-minute-old values while the ranker stays healthy.',
      expectedSignals: ['freshness', 'fallback', 'last-known', 'alert', 'degraded', 'replay'],
    },
  ],
  conceptIds: [
    'ranking-metrics',
    'social-media',
    'capacity-estimation',
    'queueing-theory',
    'embeddings',
    'topk-vector-search',
    'monitoring-analytics',
    'replication',
  ],
  drillIds: [
    'design-news-feed',
    'queue-backpressure',
    'practice-opentelemetry-observability',
    'replication-lag-read',
  ],
  commonMistakes: [
    'Starting with a model before defining the product objective.',
    'Using offline accuracy as the only launch gate.',
    'Ignoring feature freshness and feedback-loop bias.',
  ],
  strongerAnswer:
    'Separate the event and training pipelines from the online retrieve-rank-filter path, define features once with point-in-time correctness, and budget every online hop. Measure relevance plus guardrails, reserve exploration, and degrade to safe cached or popularity candidates when fresh features fail.',
  sources: [
    {
      title: 'Deep Neural Networks for YouTube Recommendations',
      url: 'https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/',
      kind: 'paper',
    },
    {
      title: 'Rules of Machine Learning',
      url: 'https://developers.google.com/machine-learning/guides/rules-of-ml',
      kind: 'official-doc',
    },
  ],
  publication: { state: 'practice-only' },
};

const urlShortenerCase: SystemDesignCase = {
  id: 'url-shortener',
  version: '1.0.0',
  title: 'Design a URL shortener',
  category: 'infrastructure-storage',
  pattern: 'compact identifier allocation for read-heavy redirects',
  criticalPath: 'short-code lookup to low-latency redirect',
  durationMinutes: 45,
  prompt:
    'Design a global URL-shortening service with custom aliases, analytics, expiration, and abuse controls.',
  difficulty: 'core',
  hiddenAssumptions: [
    'The system creates 10 million links per day.',
    'Redirects outnumber creates by 100 to 1.',
    'Most links are cold, but a small number become globally hot.',
    'Custom aliases must be unique and malicious destinations must be containable.',
  ],
  stages: stages({
    scoping: [
      'Clarify redirects, aliases, expiration, analytics, abuse, and consistency.',
      'Probe redirect code, custom names, edit semantics, availability, malicious content, and regions.',
    ],
    estimation: [
      'Estimate write QPS, redirect QPS, ID space, storage, and cache pressure.',
      'Look for peak factor, retention, bytes per record, base encoding, and hot-key skew.',
    ],
    'high-level-design': [
      'Design create and redirect APIs, ID generation, storage, cache, analytics, and abuse path.',
      'Require collision or coordination semantics, immutable redirects, cache policy, and asynchronous analytics.',
    ],
    'deep-dive': [
      'Defend ID generation or hot-link handling.',
      'Look for uniqueness domain, base encoding, cache/CDN behavior, invalidation, and regional writes.',
    ],
    failure: [
      'A newly posted link becomes a global hot key while its destination is flagged as malicious.',
      'Expect edge caching, purge or denylist propagation, origin protection, audit, and recovery.',
    ],
    review: [
      'Summarize the redirect critical path and its consistency contract.',
      'Reveal reference after submission.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'id-space',
      label: 'Identifier space',
      formula: 'alphabet size ^ code length',
      unit: 'unique codes',
      expectedTerms: ['alphabet', 'length', 'codes'],
    },
    {
      id: 'retained-storage',
      label: 'Stored link data',
      formula: 'writes/day × retention days × bytes/record',
      unit: 'bytes',
      expectedTerms: ['writes', 'retention', 'bytes'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Redirect and alias contract',
      0.2,
      ['scoping'],
      ['redirect', 'alias', 'expiration', 'abuse', 'analytics'],
      ['api-design', 'caching'],
      ['cache-key-and-ttl']
    ),
    dimension(
      'capacity',
      'Traffic and ID estimation',
      0.2,
      ['estimation'],
      ['write QPS', 'read QPS', 'ID space', 'storage', 'peak'],
      ['capacity-estimation', 'math-geometry'],
      ['design-consistent-hashing']
    ),
    dimension(
      'architecture',
      'Create and redirect paths',
      0.2,
      ['high-level-design'],
      ['create API', 'redirect API', 'database', 'cache', 'analytics'],
      ['storage-retrieval', 'caching'],
      ['storage-vs-retrieval']
    ),
    dimension(
      'identity',
      'ID and hot-key design',
      0.2,
      ['deep-dive'],
      ['collision', 'base62', 'counter', 'cache', 'CDN'],
      ['consistent-hashing', 'sharding'],
      ['design-consistent-hashing']
    ),
    dimension(
      'reliability',
      'Abuse and hot-link response',
      0.2,
      ['failure', 'review'],
      ['purge', 'denylist', 'origin protection', 'rate limit', 'audit'],
      ['rate-limiting', 'monitoring-analytics'],
      ['design-rate-limiter']
    ),
  ],
  followUps: [
    {
      id: 'counter-ids',
      stageId: 'deep-dive',
      matchAny: ['counter', 'sequence', 'snowflake'],
      prompt:
        'How is uniqueness preserved across regions without making every write globally synchronous?',
    },
    {
      id: 'hash-ids',
      stageId: 'deep-dive',
      matchAny: ['hash', 'collision'],
      prompt: 'How are collisions detected, retried, and kept from changing an existing redirect?',
    },
  ],
  failureInjections: [
    {
      id: 'hot-malicious-link',
      title: 'Hot malicious link',
      prompt: 'A link becomes globally hot just as abuse systems flag its destination.',
      expectedSignals: ['edge cache', 'purge', 'denylist', 'rate limit', 'audit', 'origin'],
    },
  ],
  conceptIds: [
    'api-design',
    'caching',
    'capacity-estimation',
    'math-geometry',
    'storage-retrieval',
    'consistent-hashing',
    'sharding',
    'rate-limiting',
    'monitoring-analytics',
  ],
  drillIds: [
    'cache-key-and-ttl',
    'design-consistent-hashing',
    'storage-vs-retrieval',
    'design-rate-limiter',
  ],
  commonMistakes: [
    'Assuming a hash can never collide.',
    'Putting synchronous analytics on the redirect path.',
    'Ignoring abuse removal from caches and edge nodes.',
  ],
  strongerAnswer:
    'Keep create and redirect paths separate, choose an explicit uniqueness strategy, store immutable mappings, and serve redirects from bounded caches or edges while analytics flows asynchronously. Capacity the ID space and retained records, and make abuse purge a first-class globally propagated operation.',
  sources: [
    {
      title: 'URI Generic Syntax',
      url: 'https://www.rfc-editor.org/rfc/rfc3986',
      kind: 'standard',
    },
    {
      title: 'Twitter Snowflake',
      url: 'https://github.com/twitter-archive/snowflake',
      kind: 'official-doc',
    },
  ],
  publication: { state: 'practice-only' },
};

const rateLimiterCase: SystemDesignCase = {
  id: 'distributed-rate-limiter',
  version: '1.0.0',
  title: 'Design a distributed rate limiter',
  category: 'infrastructure-storage',
  pattern: 'distributed quota enforcement under clock and region skew',
  criticalPath: 'atomic allowance decision before protected work',
  durationMinutes: 40,
  prompt:
    'Design a global, multi-tenant rate limiter for an API gateway with burst allowances and regional enforcement.',
  difficulty: 'core',
  hiddenAssumptions: [
    'Limits apply by tenant, user, and endpoint.',
    'A small amount of regional over-admission is acceptable for normal tiers.',
    'Critical abuse limits fail closed; ordinary product limits may fail open briefly.',
    'The decision path must remain below 5 ms p99.',
  ],
  stages: stages({
    scoping: [
      'Clarify identities, algorithms, burst semantics, precision, failure policy, and response contract.',
      'Probe multi-key limits, regional error budget, fail-open/closed classes, headers, and configuration changes.',
    ],
    estimation: [
      'Estimate decision QPS, key cardinality, state size, and write amplification.',
      'Look for peak decisions, active keys, bucket bytes, TTL, and regional fan-out.',
    ],
    'high-level-design': [
      'Design config distribution, local decision, shared state, and response paths.',
      'Require atomic update semantics, cached configuration, observability, and bounded dependency cost.',
    ],
    'deep-dive': [
      'Compare token bucket, fixed window, and sliding window for this contract.',
      'Look for burst behavior, precision, memory, atomicity, clock effects, and regional approximation.',
    ],
    failure: [
      'The shared rate-limit store becomes slow in one region during an abuse spike.',
      'Expect policy-specific fail-open/closed, local emergency limits, circuit breaking, and recovery.',
    ],
    review: [
      'Summarize the consistency and availability trade-off.',
      'Reference appears only after submission.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'state-size',
      label: 'Limiter state',
      formula: 'active keys × bytes per key × windows retained',
      unit: 'bytes',
      expectedTerms: ['keys', 'bytes', 'window'],
    },
    {
      id: 'decision-load',
      label: 'Decision traffic',
      formula: 'API request rate × number of enforced limit keys',
      unit: 'decisions/s',
      expectedTerms: ['request', 'keys', 'decision'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Limit and failure contract',
      0.2,
      ['scoping'],
      ['tenant', 'burst', 'precision', 'fail open', 'fail closed'],
      ['rate-limiter-design', 'api-design'],
      ['design-rate-limiter']
    ),
    dimension(
      'capacity',
      'State and decision estimation',
      0.2,
      ['estimation'],
      ['decisions/s', 'cardinality', 'bytes/key', 'TTL', 'peak'],
      ['capacity-estimation', 'queueing-theory'],
      ['token-bucket-limiter']
    ),
    dimension(
      'architecture',
      'Configuration and decision path',
      0.2,
      ['high-level-design'],
      ['config', 'local cache', 'atomic', 'shared store', '429'],
      ['rate-limiting', 'storage-retrieval'],
      ['design-rate-limiter']
    ),
    dimension(
      'algorithm',
      'Algorithm and regional trade-offs',
      0.2,
      ['deep-dive'],
      ['token bucket', 'sliding window', 'burst', 'clock', 'regional'],
      ['rate-limiter-design', 'cap-theorem'],
      ['implement-token-bucket']
    ),
    dimension(
      'reliability',
      'Dependency failure behavior',
      0.2,
      ['failure', 'review'],
      ['circuit breaker', 'emergency limit', 'fail open', 'fail closed', 'reconcile'],
      ['monitoring-analytics', 'replication'],
      ['practice-opentelemetry-observability']
    ),
  ],
  followUps: [
    {
      id: 'strict-global',
      stageId: 'deep-dive',
      matchAny: ['global', 'strict', 'consistent'],
      prompt:
        'What latency and availability cost appears if a limit must never be exceeded globally?',
    },
    {
      id: 'token-bucket',
      stageId: 'deep-dive',
      matchAny: ['token bucket', 'burst'],
      prompt: 'How are refill, clock skew, and atomic consumption implemented?',
    },
  ],
  failureInjections: [
    {
      id: 'store-slowdown',
      title: 'Shared store slowdown',
      prompt: 'The regional state store slows during an abuse spike.',
      expectedSignals: [
        'circuit breaker',
        'local limit',
        'fail open',
        'fail closed',
        'alert',
        'recover',
      ],
    },
  ],
  conceptIds: [
    'rate-limiter-design',
    'api-design',
    'capacity-estimation',
    'queueing-theory',
    'rate-limiting',
    'storage-retrieval',
    'cap-theorem',
    'monitoring-analytics',
    'replication',
  ],
  drillIds: [
    'design-rate-limiter',
    'token-bucket-limiter',
    'implement-token-bucket',
    'practice-opentelemetry-observability',
  ],
  commonMistakes: [
    'Choosing an algorithm before defining burst and precision semantics.',
    'Making every regional decision globally synchronous.',
    'Having one fail-open policy for both product quotas and abuse protection.',
  ],
  strongerAnswer:
    'Define the key, window, burst, precision, and failure contract first. Cache versioned policy locally, make the common decision atomic and bounded, accept declared regional error for available tiers, and split fail-open product limits from fail-closed security limits with emergency local protection.',
  sources: [
    {
      title: 'RateLimit Fields for HTTP',
      url: 'https://www.rfc-editor.org/rfc/rfc9331',
      kind: 'standard',
    },
    {
      title: 'Redis rate limiting patterns',
      url: 'https://redis.io/learn/howtos/ratelimiting',
      kind: 'official-doc',
    },
  ],
  publication: { state: 'practice-only' },
};

const chatCase: SystemDesignCase = {
  id: 'real-time-chat',
  version: '1.0.0',
  title: 'Design real-time chat',
  category: 'social-real-time',
  pattern: 'durable ordered messaging over long-lived connections',
  criticalPath: 'connected send through durable fan-out and acknowledgement',
  durationMinutes: 45,
  prompt: 'Design real-time one-to-one and group chat for 50 million daily active users.',
  difficulty: 'advanced',
  hiddenAssumptions: [
    'Messages are durable and support multiple devices.',
    'Ordering is required within a conversation, not globally.',
    'Users reconnect and need gap recovery.',
    'Large groups may contain 100,000 members.',
  ],
  stages: stages({
    scoping: [
      'Clarify message, ordering, delivery, device, group, presence, and privacy semantics.',
      'Probe guarantees, attachments, edits, retention, receipts, offline delivery, and group size.',
    ],
    estimation: [
      'Estimate connected sockets, messages/s, fan-out, storage, and bandwidth.',
      'Look for DAU to concurrent connections, message size, peak factor, group skew, and retention.',
    ],
    'high-level-design': [
      'Design connection ownership, message acceptance, durable log, fan-out, inbox, and push paths.',
      'Require IDs, acknowledgements, per-conversation ordering, offline sync, and multi-device delivery.',
    ],
    'deep-dive': [
      'Defend ordering, idempotency, or large-group fan-out.',
      'Look for sequence scope, dedupe, retries, partition keys, and fan-out trade-offs.',
    ],
    failure: [
      'A connection gateway loses a shard while clients reconnect and resend unacknowledged messages.',
      'Expect leases, idempotency, replay cursor, backpressure, and receipt reconciliation.',
    ],
    review: [
      'Summarize the path from send to durable acknowledgement and recipient delivery.',
      'Compare after submission.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'connections',
      label: 'Concurrent connections',
      formula: 'DAU × concurrent-online fraction × devices/user',
      unit: 'connections',
      expectedTerms: ['DAU', 'online', 'devices', 'connections'],
    },
    {
      id: 'fanout',
      label: 'Delivery operations',
      formula: 'messages/s × average recipients per message',
      unit: 'deliveries/s',
      expectedTerms: ['messages', 'recipients', 'deliveries'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Delivery and ordering contract',
      0.2,
      ['scoping'],
      ['durable', 'ordering', 'multi-device', 'offline', 'group'],
      ['messaging-realtime', 'api-design'],
      ['design-chat-system']
    ),
    dimension(
      'capacity',
      'Connection and fan-out estimation',
      0.2,
      ['estimation'],
      ['connections', 'messages/s', 'recipients', 'bytes', 'peak'],
      ['capacity-estimation', 'queueing-theory'],
      ['queue-backpressure']
    ),
    dimension(
      'architecture',
      'Connection and message paths',
      0.2,
      ['high-level-design'],
      ['gateway', 'message log', 'inbox', 'push', 'ack'],
      ['message-queues', 'messaging-realtime'],
      ['design-chat-system']
    ),
    dimension(
      'semantics',
      'Ordering and idempotency',
      0.2,
      ['deep-dive'],
      ['conversation sequence', 'idempotency key', 'dedupe', 'partition', 'cursor'],
      ['idempotency', 'sharding'],
      ['shard-key-choice']
    ),
    dimension(
      'reliability',
      'Reconnect and replay',
      0.2,
      ['failure', 'review'],
      ['reconnect', 'resend', 'dedupe', 'cursor', 'backpressure'],
      ['replication', 'monitoring-analytics'],
      ['replication-lag-read']
    ),
  ],
  followUps: [
    {
      id: 'large-groups',
      stageId: 'deep-dive',
      matchAny: ['group', 'fan-out'],
      prompt: 'How does delivery change for a group with 100,000 members and a celebrity sender?',
    },
    {
      id: 'ordering',
      stageId: 'deep-dive',
      matchAny: ['order', 'sequence', 'partition'],
      prompt:
        'Which component assigns conversation sequence and what happens during leader failover?',
    },
  ],
  failureInjections: [
    {
      id: 'gateway-shard-loss',
      title: 'Connection shard loss',
      prompt: 'A gateway shard dies while clients reconnect and resend.',
      expectedSignals: ['lease', 'reconnect', 'idempotency', 'cursor', 'replay', 'backpressure'],
    },
  ],
  conceptIds: [
    'messaging-realtime',
    'api-design',
    'capacity-estimation',
    'queueing-theory',
    'message-queues',
    'idempotency',
    'sharding',
    'replication',
    'monitoring-analytics',
  ],
  drillIds: [
    'design-chat-system',
    'queue-backpressure',
    'shard-key-choice',
    'replication-lag-read',
  ],
  commonMistakes: [
    'Promising global message ordering.',
    'Acknowledging before durable acceptance without saying so.',
    'Treating presence as strongly consistent durable state.',
  ],
  strongerAnswer:
    'Own sockets on disposable gateways, durably accept messages with client idempotency IDs, order within each conversation partition, and fan out to device inboxes asynchronously. Reconnect from a durable cursor, dedupe resends, and use a different delivery strategy for enormous groups.',
  sources: [
    {
      title: 'The WebSocket Protocol',
      url: 'https://www.rfc-editor.org/rfc/rfc6455',
      kind: 'standard',
    },
    {
      title: 'Apache Kafka design',
      url: 'https://kafka.apache.org/documentation/#design',
      kind: 'official-doc',
    },
  ],
  publication: { state: 'practice-only' },
};

const newsFeedCase: SystemDesignCase = {
  id: 'ranked-news-feed',
  version: '1.0.0',
  title: 'Design a ranked news feed',
  category: 'social-real-time',
  pattern: 'hybrid social fan-out with policy-aware ranking',
  criticalPath: 'candidate assembly through filtering ranking and cursor delivery',
  durationMinutes: 45,
  prompt:
    'Design a ranked home feed for 100 million users with celebrity accounts, freshness, and moderation.',
  difficulty: 'advanced',
  hiddenAssumptions: [
    'The feed mixes followed accounts and recommendations.',
    'Most users are inactive while a small number have millions of followers.',
    'Feed reads require 200 ms p99.',
    'Deleted or moderated posts must disappear quickly.',
  ],
  stages: stages({
    scoping: [
      'Clarify content, graph, ranking, freshness, privacy, moderation, and pagination.',
      'Probe follow model, recommendations, deletes, blocks, ads, read latency, and consistency.',
    ],
    estimation: [
      'Estimate posts/s, feed reads/s, fan-out writes, storage, and cache.',
      'Look for active users, follow skew, peak reads, timeline length, and write amplification.',
    ],
    'high-level-design': [
      'Design post ingestion, graph access, fan-out, candidate retrieval, ranking, filtering, and pagination.',
      'Require hybrid fan-out, celebrity path, cache keys, cursor semantics, and policy filters.',
    ],
    'deep-dive': [
      'Defend fan-out choice or ranking fallback.',
      'Look for write/read amplification, hot partitions, freshness, cache invalidation, and feature availability.',
    ],
    failure: [
      'The ranker times out and a high-profile post is deleted during a traffic spike.',
      'Expect fallback ordering, deletion tombstones, cache purge, safety filtering, and recovery.',
    ],
    review: [
      'Summarize the candidate-to-ranked-feed critical path.',
      'Reveal reference after submission.',
    ],
  }),
  calculationAnchors: [
    {
      id: 'fanout-write',
      label: 'Fan-out operations',
      formula: 'posts/s × average active followers',
      unit: 'timeline writes/s',
      expectedTerms: ['posts', 'followers', 'writes'],
    },
    {
      id: 'feed-cache',
      label: 'Cached feed footprint',
      formula: 'active users × cached entries/user × bytes/entry',
      unit: 'bytes',
      expectedTerms: ['users', 'entries', 'bytes'],
    },
  ],
  rubricDimensions: [
    dimension(
      'requirements',
      'Feed and policy contract',
      0.2,
      ['scoping'],
      ['follow', 'recommendation', 'freshness', 'delete', 'pagination'],
      ['social-media', 'api-design'],
      ['design-news-feed']
    ),
    dimension(
      'capacity',
      'Fan-out and cache estimation',
      0.2,
      ['estimation'],
      ['posts/s', 'reads/s', 'followers', 'write amplification', 'cache'],
      ['capacity-estimation', 'queueing-theory'],
      ['queue-backpressure']
    ),
    dimension(
      'architecture',
      'Candidate and ranking path',
      0.2,
      ['high-level-design'],
      ['post log', 'graph', 'fan-out', 'candidate', 'rank', 'filter'],
      ['social-media', 'ranking-metrics'],
      ['design-news-feed']
    ),
    dimension(
      'fanout',
      'Hybrid fan-out trade-offs',
      0.2,
      ['deep-dive'],
      ['fan-out on write', 'fan-out on read', 'celebrity', 'hot partition', 'cursor'],
      ['caching', 'sharding'],
      ['shard-key-choice']
    ),
    dimension(
      'reliability',
      'Fallback and deletion',
      0.2,
      ['failure', 'review'],
      ['fallback', 'chronological', 'tombstone', 'purge', 'moderation'],
      ['monitoring-analytics', 'replication'],
      ['practice-opentelemetry-observability']
    ),
  ],
  followUps: [
    {
      id: 'celebrity-path',
      stageId: 'deep-dive',
      matchAny: ['celebrity', 'fan-out on read'],
      prompt: 'How are celebrity posts merged without writing to millions of timelines?',
    },
    {
      id: 'ranker-fallback',
      stageId: 'deep-dive',
      matchAny: ['rank', 'model', 'feature'],
      prompt:
        'Which deterministic fallback preserves freshness and safety when features or the ranker fail?',
    },
  ],
  failureInjections: [
    {
      id: 'ranker-and-delete',
      title: 'Ranker timeout and urgent delete',
      prompt: 'The ranker times out while a high-profile post must be removed.',
      expectedSignals: ['fallback', 'tombstone', 'purge', 'filter', 'alert', 'recover'],
    },
  ],
  conceptIds: [
    'social-media',
    'api-design',
    'capacity-estimation',
    'queueing-theory',
    'ranking-metrics',
    'caching',
    'sharding',
    'monitoring-analytics',
    'replication',
  ],
  drillIds: [
    'design-news-feed',
    'queue-backpressure',
    'shard-key-choice',
    'practice-opentelemetry-observability',
  ],
  commonMistakes: [
    'Using fan-out on write for celebrity accounts without qualification.',
    'Ranking before applying privacy and moderation constraints.',
    'Offset pagination over a changing feed.',
  ],
  strongerAnswer:
    'Log posts once, use hybrid fan-out for ordinary and celebrity accounts, retrieve candidates from graph and recommendation sources, apply policy filters, rank within a strict budget, and paginate with stable cursors. Keep delete tombstones and a safe chronological fallback outside the ranker.',
  sources: [
    {
      title: 'Twitter recommendation algorithm',
      url: 'https://github.com/twitter/the-algorithm',
      kind: 'official-doc',
    },
    {
      title: 'Deep Neural Networks for YouTube Recommendations',
      url: 'https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/',
      kind: 'paper',
    },
  ],
  publication: { state: 'practice-only' },
};

export const SYSTEM_DESIGN_CASES: SystemDesignCase[] = [
  llmInferenceCase,
  productionRagCase,
  llmGatewayCase,
  recommendationCase,
  urlShortenerCase,
  rateLimiterCase,
  chatCase,
  newsFeedCase,
  ...POPULAR_SYSTEM_DESIGN_CASES,
];

export const SYSTEM_DESIGN_CASE_BY_ID = Object.fromEntries(
  SYSTEM_DESIGN_CASES.map((caseDefinition) => [caseDefinition.id, caseDefinition])
) as Record<string, SystemDesignCase>;

export const SYSTEM_DESIGN_CASE_GROUPS = SYSTEM_DESIGN_CATEGORIES.map((category) => ({
  ...category,
  cases: SYSTEM_DESIGN_CASES.filter((caseDefinition) => caseDefinition.category === category.id),
}));
