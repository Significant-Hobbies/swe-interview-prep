interface InferencePathNode {
  id: string;
  chapter: number;
  section: number;
  title: string;
  canonicalUrl: string;
  summary: string;
  estimatedMinutes: number;
  conceptIds: string[];
  retrievalPrompt: string;
}

export interface InferencePathChapter {
  id: string;
  number: number;
  title: string;
  purpose: string;
  nodes: InferencePathNode[];
}

const ROOT = 'https://learn-inference.com/chapters';

function pathNode(
  ...args: [number, number, string, string, string, string[], string, number?]
): InferencePathNode {
  const [chapter, section, slug, title, summary, conceptIds, retrievalPrompt, minutes] = args;
  const estimatedMinutes = minutes ?? 12;
  const chapterSlugs = [
    'inference',
    'prerequisites',
    'models',
    'hardware',
    'software',
    'techniques',
    'modalities',
    'production',
  ];
  return {
    id: `${chapter}-${section}-${slug}`,
    chapter,
    section,
    title,
    canonicalUrl: `${ROOT}/${chapterSlugs[chapter]}/${slug}`,
    summary,
    estimatedMinutes,
    conceptIds,
    retrievalPrompt,
  };
}

export const INFERENCE_PATH: InferencePathChapter[] = [
  {
    id: 'inference',
    number: 0,
    title: 'Inference',
    purpose: 'Build the operating map before optimizing any one layer.',
    nodes: [
      pathNode(
        0,
        1,
        'two-phases',
        'Two phases, two disciplines',
        'Separate prompt processing from token generation before reasoning about bottlenecks.',
        ['inference-engines', 'inference-cost-latency'],
        'Why can the same request be compute-bound first and bandwidth-bound later?'
      ),
      pathNode(
        0,
        2,
        'three-layers',
        'The three layers',
        'Place runtime, infrastructure, and tooling decisions at the layer that owns them.',
        ['inference-engines', 'cloud-infrastructure'],
        'Name one failure caused by optimizing the wrong layer.'
      ),
      pathNode(
        0,
        3,
        'runtime-techniques',
        'Six techniques that define the runtime',
        'Recognize the runtime mechanisms that change memory, scheduling, and token delivery.',
        ['continuous-batching', 'kv-cache-paged-attention', 'speculative-decoding'],
        'Which runtime technique changes capacity without changing model weights?'
      ),
      pathNode(
        0,
        4,
        'scale-changes-problem',
        'Scale changes the problem',
        'Explain why a working single-request demo is not yet a production serving system.',
        ['capacity-estimation', 'inference-cost-latency'],
        'What constraint appears only after concurrent production traffic arrives?'
      ),
      pathNode(
        0,
        5,
        'abstraction',
        'Where to put the abstraction',
        'Choose a boundary that keeps model, runtime, and platform responsibilities inspectable.',
        ['inference-engines', 'platform-scheduling-orchestration'],
        'Which concern belongs below the application API, and why?'
      ),
      pathNode(
        0,
        6,
        'map',
        'A map of what follows',
        'Connect model mechanics, hardware, software, optimization, modalities, and production.',
        ['inference-engines'],
        'Sketch the dependency chain from model shape to production SLO.'
      ),
    ],
  },
  {
    id: 'prerequisites',
    number: 1,
    title: 'Prerequisites',
    purpose: 'Define the workload and success criteria before choosing technology.',
    nodes: [
      pathNode(
        1,
        1,
        'scale-and-specialization',
        'Scale and specialization',
        'Relate workload scale to the point where dedicated inference engineering pays off.',
        ['capacity-estimation', 'inference-cost-latency'],
        'What scale signal would justify a specialized runtime?'
      ),
      pathNode(
        1,
        2,
        'about-your-app',
        'About your app',
        'Turn user experience requirements into workload, latency, quality, and cost constraints.',
        ['quality-cost-latency-measurement', 'capacity-estimation'],
        'Which application requirement is the hardest constraint, and how would you measure it?'
      ),
      pathNode(
        1,
        3,
        'model-selection',
        'Model selection',
        'Choose the smallest model that clears the declared quality and capability floor.',
        ['ml-evaluation', 'quality-cost-latency-measurement'],
        'What evidence would disqualify the cheapest model?'
      ),
      pathNode(
        1,
        4,
        'latency-throughput',
        'Measuring latency and throughput',
        'Keep latency distributions and throughput rates distinct when benchmarking.',
        ['inference-cost-latency', 'quality-cost-latency-measurement'],
        'Why can throughput improve while user-perceived latency gets worse?'
      ),
    ],
  },
  {
    id: 'models',
    number: 2,
    title: 'Models',
    purpose: 'Trace architecture choices into memory, compute, and serving constraints.',
    nodes: [
      pathNode(
        2,
        1,
        'neural-networks',
        'Neural networks',
        'Recover the forward-pass vocabulary needed to reason about inference.',
        ['ml-embeddings', 'ml-self-attention'],
        'Which tensors are fixed at inference time and which grow with the request?'
      ),
      pathNode(
        2,
        2,
        'llm-mechanics',
        'LLM inference mechanics',
        'Follow tokenization, prefill, decode, and sampling through one request.',
        ['inference-engines', 'ml-self-attention'],
        'Where is state reused between generated tokens?'
      ),
      pathNode(
        2,
        3,
        'image-mechanics',
        'Image generation inference mechanics',
        'Contrast iterative denoising workloads with autoregressive text generation.',
        ['vision-models', 'inference-hardware'],
        'Which serving assumption from text generation fails for diffusion?'
      ),
      pathNode(
        2,
        4,
        'bottlenecks',
        'Calculating inference bottlenecks',
        'Estimate weights, cache, bandwidth, and arithmetic intensity before benchmarking.',
        ['gpu-utilization', 'inference-hardware', 'kv-cache-paged-attention'],
        'Which declared term is the first constraint for your workload?'
      ),
      pathNode(
        2,
        5,
        'optimizing-attention',
        'Optimizing attention',
        'Connect attention shape, memory traffic, and kernel design.',
        ['flashattention-kernels', 'ml-self-attention'],
        'What is reduced by an IO-aware attention kernel even when arithmetic is unchanged?'
      ),
    ],
  },
  {
    id: 'hardware',
    number: 3,
    title: 'Hardware',
    purpose: 'Read accelerator limits as engineering constraints, not product names.',
    nodes: [
      pathNode(
        3,
        1,
        'gpu-architecture',
        'GPU architecture',
        'Relate compute units, memory hierarchy, and interconnects to inference behavior.',
        ['inference-hardware', 'compute-memory-storage-hierarchy'],
        'Which memory transfer dominates the phase you care about?'
      ),
      pathNode(
        3,
        2,
        'generations',
        'GPU architecture generations',
        'Compare accelerator generations by workload-relevant resources rather than headline FLOPS.',
        ['inference-hardware', 'gpu-utilization'],
        'Which generation change matters for your declared bottleneck?'
      ),
      pathNode(
        3,
        3,
        'instances',
        'Instances',
        'Translate chip resources into allocatable cloud capacity and failure domains.',
        ['cloud-infrastructure', 'inference-hardware'],
        'What resource is shared or hidden by the instance boundary?'
      ),
      pathNode(
        3,
        4,
        'other-accelerators',
        'Other datacenter accelerator options',
        'Evaluate non-GPU accelerators against model support, tooling, and operations.',
        ['inference-hardware', 'quality-cost-latency-measurement'],
        'Which compatibility cost could erase a lower hardware price?'
      ),
      pathNode(
        3,
        5,
        'local-inference',
        'Local inference',
        'Reason about device memory, thermals, packaging, and privacy at the edge.',
        ['local-on-device-inference', 'inference-hardware'],
        'Which production metric becomes a device constraint locally?'
      ),
    ],
  },
  {
    id: 'software',
    number: 4,
    title: 'Software',
    purpose: 'Understand how kernels, frameworks, engines, and benchmarks compose.',
    nodes: [
      pathNode(
        4,
        1,
        'cuda',
        'CUDA',
        'Locate kernels, streams, graphs, and synchronization in the execution path.',
        ['runtime-performance-engineering', 'gpu-utilization'],
        'Where could synchronization serialize otherwise parallel work?'
      ),
      pathNode(
        4,
        2,
        'frameworks',
        'Deep learning frameworks and libraries',
        'Separate model authoring abstractions from serving execution choices.',
        ['runtime-performance-engineering', 'inference-engines'],
        'Which framework convenience can become serving overhead?'
      ),
      pathNode(
        4,
        3,
        'engines',
        'Inference engines',
        'Compare scheduling, memory management, model support, and operational boundaries.',
        ['inference-engines', 'continuous-batching'],
        'Which engine mechanism directly affects your first constraint?'
      ),
      pathNode(
        4,
        4,
        'dynamo',
        'NVIDIA Dynamo',
        'Place distributed inference components into a production control and data path.',
        ['platform-scheduling-orchestration', 'inference-engines'],
        'Which component owns routing, scheduling, and worker lifecycle?'
      ),
      pathNode(
        4,
        5,
        'benchmarking',
        'Performance benchmarking and load testing',
        'Design a reproducible workload and report distributions, errors, cost, and throughput.',
        ['quality-cost-latency-measurement', 'capacity-estimation'],
        'What benchmark detail would make two results incomparable?'
      ),
    ],
  },
  {
    id: 'techniques',
    number: 5,
    title: 'Techniques',
    purpose: 'Apply optimizations only after naming the bottleneck they can change.',
    nodes: [
      pathNode(
        5,
        1,
        'quantization',
        'Quantization',
        'Trade numerical precision for memory, bandwidth, and compatible kernel gains.',
        ['model-quantization', 'gpu-utilization'],
        'Which measurement proves quantization preserved acceptable quality?'
      ),
      pathNode(
        5,
        2,
        'speculative-decoding',
        'Speculative decoding',
        'Use a draft model to reduce serial target-model decode steps.',
        ['speculative-decoding', 'inference-cost-latency'],
        'When does draft acceptance fail to repay its extra work?'
      ),
      pathNode(
        5,
        3,
        'caching',
        'Caching',
        'Distinguish KV reuse, prefix reuse, and application caching by invalidation boundary.',
        ['kv-cache-paged-attention', 'caching'],
        'What makes a cached prefix safely reusable?'
      ),
      pathNode(
        5,
        4,
        'parallelism',
        'Model parallelism',
        'Partition weights and execution while accounting for communication volume.',
        ['inference-hardware', 'gpu-utilization'],
        'Which collective appears at your chosen partition boundary?'
      ),
      pathNode(
        5,
        5,
        'disaggregation',
        'Disaggregation',
        'Separate prefill and decode resources when their hardware and scaling needs diverge.',
        ['inference-engines', 'platform-scheduling-orchestration'],
        'What queue or transfer becomes the new coupling point?'
      ),
    ],
  },
  {
    id: 'modalities',
    number: 6,
    title: 'Modalities',
    purpose:
      'Carry inference reasoning beyond autoregressive text without flattening workload differences.',
    nodes: [
      pathNode(
        6,
        1,
        'vlms',
        'Vision language models',
        'Account for image encoding, multimodal context, and variable request shapes.',
        ['vision-models', 'inference-engines'],
        'Which stage adds cost before text decoding begins?'
      ),
      pathNode(
        6,
        2,
        'embeddings',
        'Embedding models',
        'Optimize high-volume fixed-output inference for batching and retrieval quality.',
        ['ml-embeddings', 'rag'],
        'Which metric joins serving efficiency to retrieval quality?'
      ),
      pathNode(
        6,
        3,
        'asr',
        'ASR models',
        'Reason about streaming audio chunks, real-time factors, and partial outputs.',
        ['voice-audio-systems', 'inference-cost-latency'],
        'Which latency boundary matters before the utterance ends?'
      ),
      pathNode(
        6,
        4,
        'tts',
        'TTS models',
        'Separate time-to-first-audio from sustained generation and playback.',
        ['voice-audio-systems', 'inference-cost-latency'],
        'What metric captures whether synthesis keeps ahead of playback?'
      ),
      pathNode(
        6,
        5,
        'image-models',
        'Image generation models',
        'Model iterative denoising, memory residency, and resolution-sensitive work.',
        ['vision-models', 'gpu-utilization'],
        'Which input changes work quadratically or across every denoising step?'
      ),
      pathNode(
        6,
        6,
        'video-models',
        'Video generation models',
        'Add temporal extent, frame consistency, and much larger activation footprints.',
        ['vision-models', 'inference-hardware'],
        'Which resource grows first when duration or resolution rises?'
      ),
    ],
  },
  {
    id: 'production',
    number: 7,
    title: 'Production',
    purpose: 'Turn an optimized runtime into an observable, deployable service.',
    nodes: [
      pathNode(
        7,
        1,
        'containerization',
        'Containerization',
        'Package models, engines, drivers, and health behavior reproducibly.',
        ['containers-kubernetes', 'inference-engines'],
        'Which artifact must be pinned to reproduce a serving result?'
      ),
      pathNode(
        7,
        2,
        'autoscaling',
        'Autoscaling',
        'Scale on queue and workload signals while respecting warmup and model-loading time.',
        ['platform-scheduling-orchestration', 'capacity-estimation'],
        'Why can CPU utilization be the wrong scaling signal?'
      ),
      pathNode(
        7,
        3,
        'multi-cloud',
        'Multi-cloud capacity management',
        'Treat capacity pools, portability, and routing as explicit constraints.',
        ['cloud-infrastructure', 'capacity-estimation'],
        'What must be equivalent before traffic can move between pools?'
      ),
      pathNode(
        7,
        4,
        'testing-deployment',
        'Testing and deployment',
        'Use representative load, staged rollout, and rollback evidence for releases.',
        ['quality-cost-latency-measurement', 'monitoring-analytics'],
        'Which predeclared regression threshold stops the rollout?'
      ),
      pathNode(
        7,
        5,
        'client-code',
        'Client code',
        'Design timeouts, retries, streaming, backpressure, and cancellation at the caller.',
        ['inference-engines', 'reliability-fault-tolerance'],
        'Which retry could multiply overload instead of recovering?'
      ),
      pathNode(
        7,
        6,
        'closing',
        'Where this leaves you',
        'Synthesize a measurable inference system and its next bottleneck.',
        ['inference-engines', 'quality-cost-latency-measurement'],
        'What is the next experiment, and which result would change your decision?'
      ),
    ],
  },
];

export const INFERENCE_PATH_NODES = INFERENCE_PATH.flatMap((chapter) => chapter.nodes);
export const INFERENCE_PATH_NODE_BY_ID = Object.fromEntries(
  INFERENCE_PATH_NODES.map((node) => [node.id, node])
);

export function validateInferencePath(validConceptIds: Set<string>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  if (INFERENCE_PATH.length !== 8) errors.push('Inference path must contain chapters 0 through 7.');
  for (const [chapterIndex, chapter] of INFERENCE_PATH.entries()) {
    if (chapter.number !== chapterIndex) errors.push(`Unexpected chapter order: ${chapter.id}`);
    for (const [nodeIndex, node] of chapter.nodes.entries()) {
      if (ids.has(node.id)) errors.push(`Duplicate inference node: ${node.id}`);
      ids.add(node.id);
      if (node.section !== nodeIndex + 1) errors.push(`Unexpected section order: ${node.id}`);
      if (!node.canonicalUrl.startsWith('https://learn-inference.com/chapters/')) {
        errors.push(`Non-canonical inference URL: ${node.id}`);
      }
      if (!node.conceptIds.length || !node.retrievalPrompt || node.estimatedMinutes <= 0) {
        errors.push(`Incomplete inference node: ${node.id}`);
      }
      for (const conceptId of node.conceptIds) {
        if (!validConceptIds.has(conceptId))
          errors.push(`Unknown concept ${conceptId}: ${node.id}`);
      }
    }
  }
  return errors;
}
