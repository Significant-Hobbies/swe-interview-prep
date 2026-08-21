interface FormulaSymbol {
  symbol: string;
  meaning: string;
  unit: string;
}

export interface FormulaDefinition {
  id: string;
  title: string;
  expression: string;
  symbols: FormulaSymbol[];
  assumptions: string[];
  scaling: string;
  kind: 'estimate' | 'bound' | 'identity' | 'interval';
  conceptIds: string[];
  source: { label: string; url: string };
  workedExample: { substitution: string; result: string };
}

export const FORMULAS: FormulaDefinition[] = [
  {
    id: 'kv-cache-bytes',
    title: 'KV-cache memory',
    expression: '2 × L × Hkv × Dh × T × B × e',
    symbols: [
      { symbol: 'L', meaning: 'transformer layers', unit: 'layers' },
      { symbol: 'Hkv', meaning: 'key/value heads', unit: 'heads' },
      { symbol: 'Dh', meaning: 'head dimension', unit: 'values/head' },
      { symbol: 'T', meaning: 'cached tokens per sequence', unit: 'tokens' },
      { symbol: 'B', meaning: 'active sequences', unit: 'sequences' },
      { symbol: 'e', meaning: 'bytes per cache value', unit: 'bytes/value' },
    ],
    assumptions: ['Keys and values have equal shape.', 'The estimate excludes allocator overhead.'],
    scaling: 'Linear in every declared term; halving cached tokens halves this estimate.',
    kind: 'estimate',
    conceptIds: ['kv-cache-paged-attention', 'inference-engines', 'gpu-utilization'],
    source: { label: 'vLLM PagedAttention paper', url: 'https://arxiv.org/abs/2309.06180' },
    workedExample: {
      substitution: '2 × 32 × 8 × 128 × 4096 × 16 × 2 bytes',
      result: '8 GiB',
    },
  },
  {
    id: 'model-weight-bytes',
    title: 'Model-weight memory',
    expression: 'P × e',
    symbols: [
      { symbol: 'P', meaning: 'parameter count', unit: 'parameters' },
      { symbol: 'e', meaning: 'bytes per parameter', unit: 'bytes/parameter' },
    ],
    assumptions: ['One stored value per parameter.', 'Runtime workspaces are excluded.'],
    scaling: 'Linear in parameter count and precision.',
    kind: 'estimate',
    conceptIds: ['inference-engines', 'inference-hardware'],
    source: {
      label: 'Hugging Face model memory anatomy',
      url: 'https://huggingface.co/docs/transformers/model_memory_anatomy',
    },
    workedExample: { substitution: '7B × 2 bytes', result: '13.04 GiB' },
  },
  {
    id: 'serving-latency',
    title: 'Serving latency decomposition',
    expression: 'Ltotal = Lqueue + Lprefill + Ldecode + Lnetwork',
    symbols: [
      { symbol: 'Lqueue', meaning: 'queue delay', unit: 'milliseconds' },
      { symbol: 'Lprefill', meaning: 'prompt processing', unit: 'milliseconds' },
      { symbol: 'Ldecode', meaning: 'token generation', unit: 'milliseconds' },
      { symbol: 'Lnetwork', meaning: 'transport overhead', unit: 'milliseconds' },
    ],
    assumptions: ['Components are measured over the same request boundary.'],
    scaling: 'The identity makes the largest measured component the first optimization target.',
    kind: 'identity',
    conceptIds: ['inference-cost-latency', 'quality-cost-latency-measurement'],
    source: {
      label: 'NVIDIA GenAI-Perf metrics',
      url: 'https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html',
    },
    workedExample: { substitution: '12 + 80 + 420 + 18 ms', result: '530 ms' },
  },
  {
    id: 'throughput',
    title: 'Throughput',
    expression: 'Q = work completed / elapsed time',
    symbols: [{ symbol: 'Q', meaning: 'throughput', unit: 'work units/second' }],
    assumptions: ['The work unit and measurement window are declared.'],
    scaling: 'A rate, not a latency prediction; batching may raise it while increasing delay.',
    kind: 'identity',
    conceptIds: ['capacity-estimation', 'inference-cost-latency'],
    source: { label: 'Google SRE workbook', url: 'https://sre.google/workbook/implementing-slos/' },
    workedExample: { substitution: '60,000 requests / 300 seconds', result: '200 requests/second' },
  },
  {
    id: 'roofline-bound',
    title: 'Roofline performance bound',
    expression: 'Performance ≤ min(peak compute, bandwidth × arithmetic intensity)',
    symbols: [
      { symbol: 'bandwidth', meaning: 'memory transfer rate', unit: 'bytes/second' },
      {
        symbol: 'arithmetic intensity',
        meaning: 'operations per transferred byte',
        unit: 'operations/byte',
      },
    ],
    assumptions: ['Peak values describe the selected hardware and precision.'],
    scaling: 'A ceiling: additional software overhead can only lower achieved performance.',
    kind: 'bound',
    conceptIds: ['gpu-utilization', 'inference-hardware'],
    source: { label: 'Roofline model paper', url: 'https://doi.org/10.1145/1498765.1498785' },
    workedExample: {
      substitution: 'min(100 TFLOP/s, 2 TB/s × 20 FLOP/byte)',
      result: '≤ 40 TFLOP/s',
    },
  },
  {
    id: 'wilson-interval',
    title: 'Wilson score interval',
    expression: '(p̂ + z²/2n ± z√((p̂(1−p̂)+z²/4n)/n)) / (1+z²/n)',
    symbols: [
      { symbol: 'p̂', meaning: 'observed pass rate', unit: 'proportion' },
      { symbol: 'n', meaning: 'sample count', unit: 'samples' },
      { symbol: 'z', meaning: 'normal critical value', unit: 'dimensionless' },
    ],
    assumptions: ['Binary independent observations.', 'The lab fixes z = 1.96 for 95% confidence.'],
    scaling: 'Interval width shrinks approximately with the square root of sample count.',
    kind: 'interval',
    conceptIds: ['llm-evals', 'ml-evaluation', 'search-evals'],
    source: {
      label: 'NIST binomial confidence intervals',
      url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm',
    },
    workedExample: { substitution: 'p̂ = 80/100, z = 1.96', result: 'approximately 0.71–0.87' },
  },
  {
    id: 'attention-shapes',
    title: 'Scaled dot-product attention shapes',
    expression: 'softmax(QKᵀ / √dₖ)V',
    symbols: [
      { symbol: 'Q', meaning: 'queries', unit: 'tokens × dₖ' },
      { symbol: 'K', meaning: 'keys', unit: 'tokens × dₖ' },
      { symbol: 'V', meaning: 'values', unit: 'tokens × dᵥ' },
      { symbol: 'dₖ', meaning: 'key dimension', unit: 'features' },
    ],
    assumptions: ['Q and K share the same feature dimension.'],
    scaling: 'The dense score matrix grows quadratically with sequence length.',
    kind: 'identity',
    conceptIds: ['ml-self-attention', 'flashattention-kernels'],
    source: { label: 'Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762' },
    workedExample: { substitution: '(128×64)(64×128) then × (128×64)', result: '128×64 output' },
  },
  {
    id: 'collective-volume',
    title: 'Ring all-reduce communication volume',
    expression: 'V ≈ 2 × (N−1)/N × S',
    symbols: [
      { symbol: 'N', meaning: 'workers', unit: 'workers' },
      { symbol: 'S', meaning: 'tensor size per worker', unit: 'bytes' },
    ],
    assumptions: ['Ring all-reduce with evenly partitioned chunks.'],
    scaling: 'Approaches twice the tensor size per worker as worker count grows.',
    kind: 'estimate',
    conceptIds: ['inference-hardware', 'gpu-utilization'],
    source: {
      label: 'NCCL collective operations',
      url: 'https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html',
    },
    workedExample: { substitution: '2 × 7/8 × 4 GiB', result: '7 GiB per worker' },
  },
];

export const FORMULA_BY_ID = Object.fromEntries(FORMULAS.map((formula) => [formula.id, formula]));

export function formulasForConcept(conceptId: string): FormulaDefinition[] {
  return FORMULAS.filter((formula) => formula.conceptIds.includes(conceptId));
}

export function validateFormulaRegistry(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const formula of FORMULAS) {
    if (ids.has(formula.id)) errors.push(`Duplicate formula id: ${formula.id}`);
    ids.add(formula.id);
    if (!formula.expression || !formula.symbols.length || !formula.assumptions.length) {
      errors.push(`Incomplete formula: ${formula.id}`);
    }
    if (!formula.source.url.startsWith('https://')) errors.push(`Invalid source: ${formula.id}`);
    if (!formula.conceptIds.length || !formula.workedExample.result) {
      errors.push(`Unlinked formula: ${formula.id}`);
    }
  }
  return errors;
}
