type PaperDifficulty = 'core' | 'advanced';

export interface PaperLearningContract {
  id: string;
  definitionVersion: number;
  title: string;
  authors: string;
  venue: string;
  sourceType: 'paper' | 'book';
  canonicalUrl: string;
  difficulty: PaperDifficulty;
  estimatedMinutes: number;
  conceptIds: string[];
  whyItMatters: string;
  retrievalQuestion: string;
  followUp: { label: string; href: string };
  availability: 'available' | 'unavailable';
  checkedAt: string;
}

export const PAPER_CONTRACTS: PaperLearningContract[] = [
  {
    id: 'attention-is-all-you-need',
    definitionVersion: 1,
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    venue: 'NeurIPS 2017',
    sourceType: 'paper',
    canonicalUrl: 'https://arxiv.org/abs/1706.03762',
    difficulty: 'core',
    estimatedMinutes: 25,
    conceptIds: ['ml-self-attention', 'ml-multi-head', 'inference-engines'],
    whyItMatters:
      'Establishes the attention computation whose shapes, cache growth, and parallelism govern modern inference.',
    retrievalQuestion:
      'Which operations can run in parallel during training, and which dependency remains during autoregressive decoding?',
    followUp: { label: 'Inspect attention shapes', href: '/concepts/ml-self-attention' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
  {
    id: 'pagedattention-vllm',
    definitionVersion: 1,
    title: 'Efficient Memory Management for Large Language Model Serving with PagedAttention',
    authors: 'Kwon et al.',
    venue: 'SOSP 2023',
    sourceType: 'paper',
    canonicalUrl: 'https://arxiv.org/abs/2309.06180',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    conceptIds: ['inference-engines', 'kv-cache-paged-attention', 'gpu-utilization'],
    whyItMatters: 'Connects KV-cache allocation mechanics to batching capacity and memory waste.',
    retrievalQuestion:
      'What fragmentation does paging remove, and what overhead does it not remove?',
    followUp: { label: 'Model the memory decision', href: '/labs/decision/inference-capacity' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
  {
    id: 'flashattention',
    definitionVersion: 1,
    title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
    authors: 'Dao et al.',
    venue: 'NeurIPS 2022',
    sourceType: 'paper',
    canonicalUrl: 'https://arxiv.org/abs/2205.14135',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    conceptIds: ['flashattention-kernels', 'ml-self-attention', 'gpu-utilization'],
    whyItMatters: 'Shows why reducing memory traffic can matter more than reducing arithmetic.',
    retrievalQuestion: 'Which memory hierarchy movement changes, and why does exactness remain?',
    followUp: { label: 'Inspect attention shapes', href: '/concepts/flashattention-kernels' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
  {
    id: 'learn-inference-book',
    definitionVersion: 1,
    title: 'Learn Inference',
    authors: 'Learn Inference contributors',
    venue: 'Open online book',
    sourceType: 'book',
    canonicalUrl: 'https://learn-inference.com/',
    difficulty: 'core',
    estimatedMinutes: 20,
    conceptIds: ['inference-engines', 'inference-cost-latency', 'inference-hardware'],
    whyItMatters: 'Provides a mechanism-first path from model execution to serving trade-offs.',
    retrievalQuestion:
      'Which resource becomes binding first for the workload you care about, and why?',
    followUp: { label: 'Create a capacity receipt', href: '/labs/decision/inference-capacity' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
  {
    id: 'orca-iteration-level-scheduling',
    definitionVersion: 1,
    title: 'Orca: A Distributed Serving System for Transformer-Based Generative Models',
    authors: 'Yu et al.',
    venue: 'OSDI 2022',
    sourceType: 'paper',
    canonicalUrl: 'https://www.usenix.org/conference/osdi22/presentation/yu',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    conceptIds: ['continuous-batching', 'inference-engines', 'platform-scheduling-orchestration'],
    whyItMatters:
      'Makes iteration-level scheduling concrete and shows why request-level batching wastes serving capacity.',
    retrievalQuestion:
      'What scheduling boundary changes in Orca, and which new coordination cost does that boundary introduce?',
    followUp: { label: 'Model routing pressure', href: '/labs/decision/model-routing' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
  {
    id: 'roofline-model',
    definitionVersion: 1,
    title: 'Roofline: An Insightful Visual Performance Model for Multicore Architectures',
    authors: 'Williams, Waterman, and Patterson',
    venue: 'Communications of the ACM 2009',
    sourceType: 'paper',
    canonicalUrl: 'https://doi.org/10.1145/1498765.1498785',
    difficulty: 'advanced',
    estimatedMinutes: 20,
    conceptIds: ['inference-hardware', 'gpu-utilization', 'compute-memory-storage-hierarchy'],
    whyItMatters:
      'Provides the simplest defensible test for whether more compute or more memory bandwidth can improve a workload.',
    retrievalQuestion:
      'Where is the ridge point, and what evidence would show that an optimization moved the workload across it?',
    followUp: { label: 'Benchmark the bottleneck', href: '/labs/decision/inference-benchmarking' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
  {
    id: 'sglang',
    definitionVersion: 1,
    title: 'SGLang: Efficient Execution of Structured Language Model Programs',
    authors: 'Zheng et al.',
    venue: 'arXiv 2023',
    sourceType: 'paper',
    canonicalUrl: 'https://arxiv.org/abs/2312.07104',
    difficulty: 'advanced',
    estimatedMinutes: 25,
    conceptIds: ['inference-engines', 'caching', 'runtime-performance-engineering'],
    whyItMatters:
      'Connects structured generation programs to runtime scheduling and reusable prefix state.',
    retrievalQuestion:
      'Which repeated work does RadixAttention make reusable, and when would reuse fail to improve latency?',
    followUp: { label: 'Benchmark the runtime', href: '/labs/decision/inference-benchmarking' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
  {
    id: 'sre-overload',
    definitionVersion: 1,
    title: 'Handling Overload',
    authors: 'Google SRE authors',
    venue: 'Site Reliability Engineering',
    sourceType: 'book',
    canonicalUrl: 'https://sre.google/sre-book/handling-overload/',
    difficulty: 'core',
    estimatedMinutes: 20,
    conceptIds: ['capacity-estimation', 'reliability-fault-tolerance'],
    whyItMatters:
      'Turns capacity estimates into explicit overload policy and graceful-degradation choices.',
    retrievalQuestion:
      'Which request should the system reject first, and what signal proves overload?',
    followUp: { label: 'Write the capacity decision', href: '/labs/decision/capacity-planning' },
    availability: 'available',
    checkedAt: '2026-08-20',
  },
];

export function papersForConcept(conceptId: string): PaperLearningContract[] {
  return PAPER_CONTRACTS.filter((paper) => paper.conceptIds.includes(conceptId));
}

export function validatePaperContracts(knownConceptIds: Set<string>): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const paper of PAPER_CONTRACTS) {
    if (ids.has(paper.id)) errors.push(`Duplicate paper id: ${paper.id}`);
    ids.add(paper.id);
    if (!paper.canonicalUrl.startsWith('https://') || !paper.checkedAt) {
      errors.push(`Invalid source contract: ${paper.id}`);
    }
    if (
      !paper.whyItMatters ||
      !paper.retrievalQuestion ||
      !paper.followUp.href ||
      paper.estimatedMinutes <= 0
    ) {
      errors.push(`Incomplete paper contract: ${paper.id}`);
    }
    for (const conceptId of paper.conceptIds) {
      if (!knownConceptIds.has(conceptId)) errors.push(`Unknown concept ${conceptId}: ${paper.id}`);
    }
  }
  return errors;
}
