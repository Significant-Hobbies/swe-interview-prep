export interface NotationDefinition {
  id: string;
  symbol: string;
  name: string;
  pronunciation: string;
  meaning: string;
  scope: string;
  unit: string;
  conceptIds: string[];
  tags: string[];
  formulaIds?: string[];
}

export const NOTATION: NotationDefinition[] = [
  {
    id: 'parameter-count',
    symbol: 'P',
    name: 'Parameter count',
    pronunciation: 'capital P',
    meaning: 'The number of learned scalar parameters stored by a model.',
    scope: 'Model-weight memory and model-size comparisons.',
    unit: 'parameters',
    conceptIds: ['inference-engines', 'inference-hardware'],
    tags: ['weights', 'memory', 'model'],
    formulaIds: ['model-weight-bytes'],
  },
  {
    id: 'bytes-per-element',
    symbol: 'e',
    name: 'Bytes per element',
    pronunciation: 'lowercase e',
    meaning: 'The storage width of one parameter, activation, or cache value.',
    scope: 'Declare the represented value before substituting it.',
    unit: 'bytes/value',
    conceptIds: ['model-quantization', 'inference-hardware'],
    tags: ['precision', 'quantization', 'memory'],
    formulaIds: ['model-weight-bytes', 'kv-cache-bytes'],
  },
  {
    id: 'layer-count',
    symbol: 'L',
    name: 'Layer count',
    pronunciation: 'capital L',
    meaning: 'The number of repeated transformer blocks.',
    scope: 'KV-cache estimates and model-depth reasoning.',
    unit: 'layers',
    conceptIds: ['kv-cache-paged-attention', 'ml-self-attention'],
    tags: ['transformer', 'cache'],
    formulaIds: ['kv-cache-bytes'],
  },
  {
    id: 'kv-heads',
    symbol: 'Hkv',
    name: 'KV head count',
    pronunciation: 'H sub K V',
    meaning: 'The number of key/value heads stored per transformer layer.',
    scope: 'Distinguish KV heads from query heads under MQA or GQA.',
    unit: 'heads',
    conceptIds: ['kv-cache-paged-attention', 'ml-multi-head'],
    tags: ['attention', 'gqa', 'mqa'],
    formulaIds: ['kv-cache-bytes'],
  },
  {
    id: 'head-dimension',
    symbol: 'Dh',
    name: 'Head dimension',
    pronunciation: 'D sub h',
    meaning: 'The feature width of one attention head.',
    scope: 'Attention shapes and per-token KV storage.',
    unit: 'values/head',
    conceptIds: ['ml-multi-head', 'kv-cache-paged-attention'],
    tags: ['attention', 'shape'],
    formulaIds: ['kv-cache-bytes'],
  },
  {
    id: 'sequence-length',
    symbol: 'T',
    name: 'Sequence length',
    pronunciation: 'capital T',
    meaning: 'The number of tokens participating in the declared operation.',
    scope: 'State whether this is prompt, cached, or generated length.',
    unit: 'tokens',
    conceptIds: ['ml-self-attention', 'kv-cache-paged-attention'],
    tags: ['tokens', 'context'],
    formulaIds: ['kv-cache-bytes'],
  },
  {
    id: 'batch-size',
    symbol: 'B',
    name: 'Batch size',
    pronunciation: 'capital B',
    meaning: 'The number of sequences processed together.',
    scope: 'Static batches, dynamic batches, and active decode sequences are different boundaries.',
    unit: 'sequences',
    conceptIds: ['continuous-batching', 'kv-cache-paged-attention'],
    tags: ['batching', 'throughput'],
    formulaIds: ['kv-cache-bytes'],
  },
  {
    id: 'queries',
    symbol: 'Q',
    name: 'Query matrix',
    pronunciation: 'capital Q',
    meaning: 'Projected token representations that ask which information is relevant.',
    scope: 'Scaled dot-product attention.',
    unit: 'tokens × key features',
    conceptIds: ['ml-self-attention', 'ml-multi-head'],
    tags: ['attention', 'matrix'],
    formulaIds: ['attention-shapes'],
  },
  {
    id: 'keys',
    symbol: 'K',
    name: 'Key matrix',
    pronunciation: 'capital K',
    meaning: 'Projected token representations compared with queries.',
    scope: 'Scaled dot-product attention; not a cache by itself.',
    unit: 'tokens × key features',
    conceptIds: ['ml-self-attention', 'ml-multi-head'],
    tags: ['attention', 'matrix'],
    formulaIds: ['attention-shapes'],
  },
  {
    id: 'values',
    symbol: 'V',
    name: 'Value matrix',
    pronunciation: 'capital V',
    meaning: 'Projected token information mixed by attention weights.',
    scope: 'Scaled dot-product attention.',
    unit: 'tokens × value features',
    conceptIds: ['ml-self-attention', 'ml-multi-head'],
    tags: ['attention', 'matrix'],
    formulaIds: ['attention-shapes'],
  },
  {
    id: 'key-dimension',
    symbol: 'dₖ',
    name: 'Key dimension',
    pronunciation: 'd sub k',
    meaning: 'The feature width used to scale query-key dot products.',
    scope: 'The square-root scale stabilizes attention logits.',
    unit: 'features',
    conceptIds: ['ml-self-attention'],
    tags: ['attention', 'scaling'],
    formulaIds: ['attention-shapes'],
  },
  {
    id: 'softmax',
    symbol: 'softmax(x)',
    name: 'Softmax',
    pronunciation: 'soft max of x',
    meaning: 'Normalizes logits into non-negative weights that sum to one.',
    scope: 'The axis must be declared; attention normally normalizes across keys.',
    unit: 'dimensionless',
    conceptIds: ['ml-self-attention'],
    tags: ['probability', 'attention', 'normalization'],
    formulaIds: ['attention-shapes'],
  },
  {
    id: 'observed-rate',
    symbol: 'p̂',
    name: 'Observed proportion',
    pronunciation: 'p hat',
    meaning: 'The sample pass rate used to estimate an unknown population rate.',
    scope: 'Binary outcomes with an explicit sample boundary.',
    unit: 'proportion',
    conceptIds: ['ml-evaluation', 'llm-evals'],
    tags: ['statistics', 'evaluation'],
    formulaIds: ['wilson-interval'],
  },
  {
    id: 'sample-count',
    symbol: 'n',
    name: 'Sample count',
    pronunciation: 'lowercase n',
    meaning: 'The number of independent observations in an estimate.',
    scope: 'Dependence or repeated observations reduce effective evidence.',
    unit: 'samples',
    conceptIds: ['ml-evaluation', 'sampling-and-clt'],
    tags: ['statistics', 'evaluation'],
    formulaIds: ['wilson-interval'],
  },
  {
    id: 'critical-value',
    symbol: 'z',
    name: 'Normal critical value',
    pronunciation: 'lowercase z',
    meaning: 'The standard-normal multiplier associated with a confidence level.',
    scope: 'The Wilson lab fixes z to 1.96 for a 95% interval.',
    unit: 'dimensionless',
    conceptIds: ['ml-evaluation', 'sampling-and-clt'],
    tags: ['statistics', 'confidence'],
    formulaIds: ['wilson-interval'],
  },
  {
    id: 'expectation',
    symbol: '𝔼[X]',
    name: 'Expectation',
    pronunciation: 'expected value of X',
    meaning: 'The probability-weighted average of a random variable.',
    scope: 'A population quantity, not necessarily an observed sample mean.',
    unit: 'same as X',
    conceptIds: ['sampling-and-clt', 'bayesian-inference'],
    tags: ['probability', 'statistics'],
  },
  {
    id: 'variance',
    symbol: 'Var(X)',
    name: 'Variance',
    pronunciation: 'variance of X',
    meaning: 'Expected squared deviation from the mean.',
    scope: 'Compare variances only after checking units and population boundaries.',
    unit: 'units of X squared',
    conceptIds: ['sampling-and-clt'],
    tags: ['probability', 'uncertainty'],
  },
  {
    id: 'gradient',
    symbol: '∇f',
    name: 'Gradient',
    pronunciation: 'gradient of f',
    meaning: 'The vector of partial derivatives of a scalar function.',
    scope: 'Its coordinate system and parameter vector must be declared.',
    unit: 'output unit per input unit',
    conceptIds: ['runtime-performance-engineering'],
    tags: ['calculus', 'optimization'],
  },
  {
    id: 'partial-derivative',
    symbol: '∂f/∂x',
    name: 'Partial derivative',
    pronunciation: 'partial f with respect to x',
    meaning: 'The local rate of change in one input while others are held fixed.',
    scope: 'A local sensitivity, not a causal effect by itself.',
    unit: 'f units per x unit',
    conceptIds: ['runtime-performance-engineering'],
    tags: ['calculus', 'sensitivity'],
  },
  {
    id: 'big-o',
    symbol: 'O(g(n))',
    name: 'Asymptotic upper order',
    pronunciation: 'big O of g of n',
    meaning: 'An eventual upper growth class up to a constant factor.',
    scope: 'State the growing variable and operation being counted.',
    unit: 'operation-dependent',
    conceptIds: ['runtime-performance-engineering'],
    tags: ['complexity', 'scaling'],
  },
  {
    id: 'argmax',
    symbol: 'arg maxₓ f(x)',
    name: 'Argument of the maximum',
    pronunciation: 'arg max over x of f of x',
    meaning: 'The input value that maximizes an objective.',
    scope: 'Returns an argument, unlike max, which returns the objective value.',
    unit: 'same as x',
    conceptIds: ['ml-evaluation'],
    tags: ['optimization', 'selection'],
  },
  {
    id: 'throughput',
    symbol: 'Q',
    name: 'Throughput',
    pronunciation: 'capital Q',
    meaning: 'Completed work divided by elapsed time.',
    scope: 'Declare the work unit, concurrency, and measurement window.',
    unit: 'work units/second',
    conceptIds: ['capacity-estimation', 'inference-cost-latency'],
    tags: ['performance', 'rate'],
    formulaIds: ['throughput'],
  },
  {
    id: 'ttft',
    symbol: 'TTFT',
    name: 'Time to first token',
    pronunciation: 'T T F T',
    meaning: 'Elapsed time from request start until the first generated token arrives.',
    scope: 'Includes queueing and prefill under the declared client boundary.',
    unit: 'milliseconds',
    conceptIds: ['inference-cost-latency', 'quality-cost-latency-measurement'],
    tags: ['latency', 'prefill'],
    formulaIds: ['serving-latency'],
  },
  {
    id: 'tpot',
    symbol: 'TPOT',
    name: 'Time per output token',
    pronunciation: 'T P O T',
    meaning: 'Average or percentile spacing between generated output tokens.',
    scope: 'State aggregation and exclude or include the first token explicitly.',
    unit: 'milliseconds/token',
    conceptIds: ['inference-cost-latency', 'quality-cost-latency-measurement'],
    tags: ['latency', 'decode'],
    formulaIds: ['serving-latency'],
  },
  {
    id: 'arithmetic-intensity',
    symbol: 'I',
    name: 'Arithmetic intensity',
    pronunciation: 'capital I',
    meaning: 'Useful operations performed per byte moved from the limiting memory level.',
    scope: 'The memory boundary must match the bandwidth in the roofline comparison.',
    unit: 'operations/byte',
    conceptIds: ['gpu-utilization', 'inference-hardware'],
    tags: ['roofline', 'bandwidth'],
    formulaIds: ['roofline-bound'],
  },
  {
    id: 'bandwidth',
    symbol: 'β',
    name: 'Memory bandwidth',
    pronunciation: 'beta',
    meaning: 'Bytes transferred per unit time across a declared memory boundary.',
    scope: 'Peak bandwidth is a ceiling; achieved bandwidth depends on access behavior.',
    unit: 'bytes/second',
    conceptIds: ['gpu-utilization', 'compute-memory-storage-hierarchy'],
    tags: ['roofline', 'memory'],
    formulaIds: ['roofline-bound'],
  },
  {
    id: 'worker-count',
    symbol: 'N',
    name: 'Worker count',
    pronunciation: 'capital N',
    meaning: 'The number of participants in a collective operation.',
    scope: 'Declare whether workers are devices, processes, or hosts.',
    unit: 'workers',
    conceptIds: ['inference-hardware', 'gpu-utilization'],
    tags: ['distributed', 'collective'],
    formulaIds: ['collective-volume'],
  },
  {
    id: 'tensor-size',
    symbol: 'S',
    name: 'Tensor size',
    pronunciation: 'capital S',
    meaning: 'The payload size contributed by one worker to a collective.',
    scope: 'Compression, sharding, and data type change the represented size.',
    unit: 'bytes',
    conceptIds: ['inference-hardware', 'gpu-utilization'],
    tags: ['distributed', 'collective'],
    formulaIds: ['collective-volume'],
  },
];

export function searchNotation(query: string): NotationDefinition[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return NOTATION;
  return NOTATION.filter((item) =>
    [item.symbol, item.name, item.pronunciation, item.meaning, item.scope, item.unit, ...item.tags]
      .join(' ')
      .toLowerCase()
      .includes(needle)
  );
}

export function validateNotation(
  validConceptIds: Set<string>,
  validFormulaIds: Set<string>
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of NOTATION) {
    if (ids.has(item.id)) errors.push(`Duplicate notation id: ${item.id}`);
    ids.add(item.id);
    if (!item.symbol || !item.meaning || !item.pronunciation || !item.scope || !item.unit) {
      errors.push(`Incomplete notation: ${item.id}`);
    }
    for (const conceptId of item.conceptIds) {
      if (!validConceptIds.has(conceptId)) errors.push(`Unknown concept ${conceptId}: ${item.id}`);
    }
    for (const formulaId of item.formulaIds ?? []) {
      if (!validFormulaIds.has(formulaId)) errors.push(`Unknown formula ${formulaId}: ${item.id}`);
    }
  }
  return errors;
}
