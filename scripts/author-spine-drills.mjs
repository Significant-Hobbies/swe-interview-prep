#!/usr/bin/env node
/**
 * Hand-author editorial drills for ml-*, DSA gaps, and add testCases to gate drills.
 * Run: node scripts/author-spine-drills.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const drillsPath = resolve(root, 'src/data/drills.json');
const conceptsPath = resolve(root, 'src/data/concepts.json');

const NEW_DRILLS = [
  // --- ML spine (19) ---
  {
    id: 'ml-dot-matmul-shapes',
    title: 'Dot product and matmul shapes',
    conceptId: 'ml-math',
    type: 'coding-problem',
    difficulty: 'intro',
    prompt: 'Vectors a=[1,2,3], b=[4,5,6]. Compute dot(a,b). Matrices A (2×3) and B (3×2): is A·B valid? What is the output shape?',
    expectedOutput: 'dot=32; A·B is 2×2.',
    hints: ['Dot = sum of elementwise products.', 'Inner dimensions must match for matmul.'],
    solutionNotes: 'Shape errors are the #1 silent bug in ML code.',
    testCases: [{
      setup: 'function dot(a,b){return a.reduce((s,x,i)=>s+x*b[i],0);} function matmulShape(a,b){return [a.length,b[0].length];}',
      run: 'console.log(dot([1,2,3],[4,5,6]), JSON.stringify(matmulShape([[1,2,3],[4,5,6]],[[1,2],[3,4],[5,6]])));',
      expect: ['32', '[2,2]'],
    }],
  },
  {
    id: 'ml-sgd-step-quadratic',
    title: 'One SGD step on a quadratic',
    conceptId: 'ml-gradient-descent',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Loss L(w)=(w−3)². At w=0 with lr=0.1, compute gradient and one gradient-descent update.',
    expectedOutput: '∇L=−6, w₁=0.6.',
    hints: ['d/dw (w−3)² = 2(w−3).', 'w ← w − lr·∇L.'],
    solutionNotes: 'Quadratic is the sanity check for any optimizer.',
    testCases: [{
      setup: 'function step(w,lr){const g=2*(w-3);return w-lr*g;}',
      run: 'console.log(step(0,0.1).toFixed(1));',
      expect: ['0.6'],
    }],
  },
  {
    id: 'ml-chain-rule-gate',
    title: 'Chain rule on a tiny graph',
    conceptId: 'ml-backprop',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'y = (2x+1)³. Compute dy/dx at x=1 via chain rule (u=2x+1, y=u³).',
    expectedOutput: 'dy/dx = 6(2x+1)² → 54 at x=1.',
    hints: ['dy/dx = dy/du · du/dx.', 'du/dx = 2.'],
    solutionNotes: 'Backprop is automated chain rule on the compute graph.',
    testCases: [{
      setup: 'function dydx(x){const u=2*x+1;return 3*u*u*2;}',
      run: 'console.log(dydx(1));',
      expect: ['54'],
    }],
  },
  {
    id: 'ml-softmax-cross-entropy',
    title: 'Softmax and cross-entropy loss',
    conceptId: 'ml-softmax-xent',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Logits [2,1,0.1], true class index 0. Compute softmax probabilities and −log p(true).',
    expectedOutput: 'p≈[0.659,0.242,0.099], loss≈0.417.',
    hints: ['Subtract max logit before exp for stability.', 'Loss = −log p(correct).'],
    solutionNotes: 'Log-sum-exp trick prevents overflow.',
    testCases: [{
      setup: `function softmax(xs){const m=Math.max(...xs);const ex=xs.map(x=>Math.exp(x-m));const s=ex.reduce((a,b)=>a+b,0);return ex.map(e=>e/s);}
function xent(logits,y){const p=softmax(logits);return -Math.log(p[y]);}`,
      run: 'const p=softmax([2,1,0.1]);console.log(p[0].toFixed(3),xent([2,1,0.1],0).toFixed(3));',
      expect: ['0.659', '0.417'],
    }],
  },
  {
    id: 'ml-adamw-weight-decay',
    title: 'AdamW vs L2-on-gradient',
    conceptId: 'ml-adamw',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Weight w=2, grad=0.5, lr=0.1, decay=0.01. Compare one step: (a) L2 in gradient w−lr·(grad+decay·w) vs (b) AdamW-style w−lr·grad then w·(1−lr·decay).',
    expectedOutput: 'L2→1.33; decoupled→1.33 then shrink (slightly different effective decay).',
    hints: ['Coupled L2 adds decay·w to the gradient.', 'AdamW applies decay directly on weights.'],
    solutionNotes: 'Decoupled decay is the default in modern LM training.',
    testCases: [{
      setup: 'function l2Step(w,g,lr,d){return w-lr*(g+d*w);} function adamwStep(w,g,lr,d){return (w-lr*g)*(1-lr*d);}',
      run: 'console.log(l2Step(2,0.5,0.1,0.01).toFixed(2), adamwStep(2,0.5,0.1,0.01).toFixed(2));',
      expect: ['1.95', '1.95'],
    }],
  },
  {
    id: 'ml-bpe-merge-step',
    title: 'One BPE merge step',
    conceptId: 'ml-tokenization',
    type: 'coding-problem',
    difficulty: 'intro',
    prompt: 'Corpus tokenized as [l,o,w,e,r,l,o,w,e,s,t]. Count adjacent pairs; merge the most frequent pair once. What is the new sequence?',
    expectedOutput: 'lo appears twice → merge lo → [lo,w,e,r,lo,w,e,s,t].',
    hints: ['Count bigram frequencies.', 'Merge highest-count pair into one token.'],
    solutionNotes: 'BPE grows vocab by merging, not splitting.',
  },
  {
    id: 'ml-perplexity-from-nll',
    title: 'Perplexity from average NLL',
    conceptId: 'ml-language-modeling',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Average negative log-likelihood per token = 2.3 nats. Compute perplexity = exp(NLL).',
    expectedOutput: 'PPX ≈ e^2.3 ≈ 9.97.',
    hints: ['Perplexity is exp of average NLL.', 'Lower is better.'],
    solutionNotes: 'PPX 10 ≈ uniform over ~10 tokens on average.',
    testCases: [{
      setup: 'function perplexity(avgNll){return Math.exp(avgNll);}',
      run: 'console.log(perplexity(2.3).toFixed(2));',
      expect: ['9.97'],
    }],
  },
  {
    id: 'ml-temperature-sampling',
    title: 'Temperature scaling logits',
    conceptId: 'ml-sampling',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Logits [2,1,0]. Apply temperature T=2 and T=0.5 before softmax. Which T makes the distribution sharper?',
    expectedOutput: 'T<1 sharpens (more greedy); T>1 flattens.',
    hints: ['Divide logits by T before softmax.', 'T→0 approaches argmax.'],
    solutionNotes: 'Temperature trades diversity vs determinism.',
    testCases: [{
      setup: `function softmax(xs){const m=Math.max(...xs);const ex=xs.map(x=>Math.exp(x-m));const s=ex.reduce((a,b)=>a+b,0);return ex.map(e=>e/s);}
function scaled(T,xs){return softmax(xs.map(x=>x/T));}`,
      run: 'const hot=scaled(0.5,[2,1,0]);console.log(hot[0].toFixed(2));',
      expect: ['0.76'],
    }],
  },
  {
    id: 'ml-sinusoidal-position',
    title: 'Sinusoidal position encoding',
    conceptId: 'ml-embeddings',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'pos=1, i=0, d=4: PE(pos,2i)=sin(pos/10000^(2i/d)). Compute the first two dims for pos=1.',
    expectedOutput: 'sin(1), cos(1) pattern for even/odd dims.',
    hints: ['Even dims sin, odd dims cos in original paper.', 'Wavelength grows with dimension index.'],
    solutionNotes: 'Positions are added to token embeddings before attention.',
    testCases: [{
      setup: 'function pe(pos,i,d){return Math.sin(pos/Math.pow(10000,2*i/d));}',
      run: 'console.log(pe(1,0,4).toFixed(3));',
      expect: ['0.841'],
    }],
  },
  {
    id: 'ml-scaled-dot-attention',
    title: 'Scaled dot-product attention weights',
    conceptId: 'ml-self-attention',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt: 'Q=K=[[1,0],[0,1]], V=[[1,2],[3,4]], d_k=2. Compute softmax(QKᵀ/√d_k)·V for one query row.',
    expectedOutput: 'Uniform weights 0.5/0.5 → output [2,3].',
    hints: ['Scale before softmax.', 'Apply weights to values.'],
    solutionNotes: 'Scaling stops dot products from saturating softmax.',
    testCases: [{
      setup: `function attnRow(q,k,v,dk){const scores=k.map(ki=>q.reduce((s,qj,j)=>s+qj*ki[j],0)/Math.sqrt(dk));const m=Math.max(...scores);const ex=scores.map(s=>Math.exp(s-m));const w=ex.map(e=>e/ex.reduce((a,b)=>a+b,0));return w.map((wi,i)=>wi*v[i].reduce((s,vj,j)=>s+wj*vj,0));}`,
      run: 'const o=attnRow([1,0],[[1,0],[0,1]],[[1,2],[3,4]],2);console.log(o[0].toFixed(1),o[1].toFixed(1));',
      expect: ['2.0', '3.0'],
    }],
  },
  {
    id: 'ml-multi-head-split',
    title: 'Split embedding across heads',
    conceptId: 'ml-multi-head',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt: 'd_model=512, h=8. What is head_dim? If you project Q to 512 dims total, how many dims per head?',
    expectedOutput: 'head_dim = 512/8 = 64.',
    hints: ['head_dim = d_model / num_heads.', 'Each head runs attention in its own subspace.'],
    solutionNotes: 'Multi-head = parallel attention at smaller width.',
    testCases: [{
      setup: 'function headDim(d,h){return d/h;}',
      run: 'console.log(headDim(512,8));',
      expect: ['64'],
    }],
  },
  {
    id: 'ml-pre-norm-residual',
    title: 'Pre-LayerNorm residual block',
    conceptId: 'ml-transformer-block',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt: 'x=[1,2], sublayer(x)=x+[0.1,−0.1]. Write pre-norm update: x + sublayer(LayerNorm(x)). If LayerNorm is identity here, new x?',
    expectedOutput: '[1.1,1.9] — residual preserves a gradient highway.',
    hints: ['Pre-norm: normalize before sublayer.', 'Output = x + f(norm(x)).'],
    solutionNotes: 'Pre-LN trains deeper stacks more reliably than post-LN.',
    testCases: [{
      setup: 'function preNorm(x,delta){return x.map((xi,i)=>xi+delta[i]);}',
      run: 'console.log(JSON.stringify(preNorm([1,2],[0.1,-0.1])));',
      expect: ['[1.1,1.9]'],
    }],
  },
  {
    id: 'ml-overfit-sanity-check',
    title: 'Overfit a single batch sanity check',
    conceptId: 'ml-training',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt: 'Training loss stuck high on 1 batch of 8 examples. Name two data bugs to check before changing the architecture.',
    expectedOutput: 'Wrong labels/shapes, train-eval leakage, broken tokenizer, masked tokens all padding, etc.',
    hints: ['Karpathy recipe: overfit one batch first.', 'If you cannot overfit one batch, data or loss is wrong.'],
    solutionNotes: 'Architecture debugging comes after the dataloader is trusted.',
  },
  {
    id: 'ml-checkpoint-resume',
    title: 'Checkpoint must include optimizer state',
    conceptId: 'ml-checkpointing',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'You save weights only (no optimizer state) at step 10k, resume training. What goes wrong with Adam momentum estimates?',
    expectedOutput: 'Optimizer moments reset — loss spike / different trajectory; effective warmup replay.',
    hints: ['Adam stores m and v per parameter.', 'Resume needs weights + optimizer + step + RNG if exact replay.'],
    solutionNotes: 'Production checkpoints are more than model.state_dict().',
  },
  {
    id: 'ml-lora-param-count',
    title: 'LoRA parameter count',
    conceptId: 'ml-lora',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'W is 4096×4096 (frozen). LoRA rank r=8. How many trainable params in A (4096×r) and B (r×4096)?',
    expectedOutput: '4096·8 + 8·4096 = 65,536 trainable vs 16M full matrix.',
    hints: ['Train A and B only; W stays fixed.', 'Params = d·r + r·d.'],
    solutionNotes: 'LoRA trades expressivity for a tiny trainable footprint.',
    testCases: [{
      setup: 'function loraParams(d,r){return 2*d*r;}',
      run: 'console.log(loraParams(4096,8));',
      expect: ['65536'],
    }],
  },
  {
    id: 'ml-token-budget-estimate',
    title: 'Estimate training token budget',
    conceptId: 'ml-data-engineering',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Corpus: 1M docs × 800 tokens each. 3 epochs. Total tokens seen? If Chinchilla says ~20 tokens/param for 1B model, rough token budget?',
    expectedOutput: '2.4B tokens for corpus; 20B tokens suggested for 1B params.',
    hints: ['tokens = docs × tokens/doc × epochs.', 'Scale data with model size for compute-optimal training.'],
    solutionNotes: 'Data engineering is capacity planning, not just ETL.',
    testCases: [{
      setup: 'function corpusTokens(docs,tok,ep){return docs*tok*ep;}',
      run: 'console.log(corpusTokens(1e6,800,3));',
      expect: ['2400000000'],
    }],
  },
  {
    id: 'ml-wasm-linear-memory',
    title: 'WASM linear memory growth',
    conceptId: 'ml-browser-runtime',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Page limit ~2–4GB WASM memory. Model weights 1.5B params float16 ≈ 3GB. Can you load weights + activations in one page tab without sharding?',
    expectedOutput: 'No headroom — need quantization, offloading, or worker sharding.',
    hints: ['2 bytes/param for fp16.', 'Activations and KV cache add on top.'],
    solutionNotes: 'Browser inference is a memory-budget puzzle first.',
  },
  {
    id: 'ml-webgpu-buffer-alignment',
    title: 'WebGPU buffer upload size',
    conceptId: 'ml-webgpu',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Tensor 1024×1024 float32. Byte size? If maxStorageBufferBindingSize is 128MB, does one buffer hold the tensor?',
    expectedOutput: '4MB — fits easily; watch alignment and copy queue staging.',
    hints: ['4 bytes per f32.', 'Check device limits for large models.'],
    solutionNotes: 'GPU inference fails on limits, not just FLOPs.',
    testCases: [{
      setup: 'function bytes(rows,cols){return rows*cols*4;}',
      run: 'console.log(bytes(1024,1024));',
      expect: ['4194304'],
    }],
  },
  {
    id: 'ml-eval-perplexity-vs-acc',
    title: 'Perplexity vs classification accuracy',
    conceptId: 'ml-evaluation',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'LM benchmark: PPX dropped 5% but exact-match QA accuracy flat. What does that imply about the eval?',
    expectedOutput: 'LM loss improved token distribution but task metric insensitive or needs few-shot/prompt — check task-specific eval.',
    hints: ['PPX measures generative calibration.', 'Downstream tasks need their own harness.'],
    solutionNotes: 'One number rarely captures LM quality.',
  },

  // --- DSA spine (11) ---
  {
    id: 'valid-parentheses-stack',
    title: 'Valid parentheses with a stack',
    conceptId: 'stack',
    type: 'coding-problem',
    difficulty: 'intro',
    prompt: 'Implement isValid(s) for brackets ()[]{} using a stack.',
    expectedOutput: 'isValid("()[]{}") true; isValid("(]") false.',
    hints: ['Push opens; pop must match close.', 'Stack empty at end.'],
    solutionNotes: 'Classic LIFO — O(n) time.',
    testCases: [{
      setup: `function isValid(s){const st=[];const m={')':'(','}':'{',']':'['};for(const c of s){if('({['.includes(c))st.push(c);else{if(st.pop()!==m[c])return false;}}return st.length===0;}`,
      run: 'console.log(isValid("()[]{}"), isValid("(]"));',
      expect: ['true', 'false'],
    }],
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse a linked list in place',
    conceptId: 'linked-list',
    type: 'coding-problem',
    difficulty: 'intro',
    prompt: 'Reverse singly linked list 1→2→3→null iteratively. Return new head.',
    expectedOutput: '3→2→1→null.',
    hints: ['Keep prev, curr, next pointers.', 'Dummy head simplifies inserts elsewhere.'],
    solutionNotes: 'In-place reversal is a fast/slow-list interview staple.',
    testCases: [{
      setup: `function toArr(head){const a=[];while(head){a.push(head.v);head=head.n;}return a;}
function fromArr(a){let h=null;for(let i=a.length-1;i>=0;i--)h={v:a[i],n:h};return h;}
function reverse(head){let p=null,c=head;while(c){const n=c.n;c.n=p;p=c;c=n;}return p;}`,
      run: 'console.log(JSON.stringify(toArr(reverse(fromArr([1,2,3])))));',
      expect: ['[3,2,1]'],
    }],
  },
  {
    id: 'trie-prefix-search',
    title: 'Trie prefix membership',
    conceptId: 'tries',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Insert ["app","apt","bat"]. Implement startsWith("ap") and search("apt").',
    expectedOutput: 'startsWith true; search true; search("ba") true prefix but search("ban") false.',
    hints: ['Each node maps char → child.', 'End-of-word flag for complete keys.'],
    solutionNotes: 'Prefix queries are why tries beat hash maps.',
    testCases: [{
      setup: `function make(){const r={};return{ins(w){let n=r;for(const c of w){n[c]=n[c]||{};n=n[c];}n.$=1;},sw(p){let n=r;for(const c of p){if(!n[c])return false;n=n[c];}return true;},sr(w){let n=r;for(const c of w){if(!n[c])return false;n=n[c];}return !!n.$;}};}`,
      run: 'const t=make();["app","apt","bat"].forEach(w=>t.ins(w));console.log(t.sw("ap"),t.sr("apt"),t.sr("ban"));',
      expect: ['true', 'true', 'false'],
    }],
  },
  {
    id: 'subsets-backtracking',
    title: 'Generate all subsets',
    conceptId: 'backtracking',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Return all subsets of [1,2]. Use backtracking with include/exclude choice per index.',
    expectedOutput: '[[],[1],[2],[1,2]] (order may vary).',
    hints: ['Push current path at each leaf.', 'Undo (pop) after exploring.'],
    solutionNotes: 'Subset template generalizes to combinations/permutations.',
    testCases: [{
      setup: `function subsets(nums){const out=[],path=[];function dfs(i){if(i===nums.length){out.push([...path]);return;}dfs(i+1);path.push(nums[i]);dfs(i+1);path.pop();}dfs(0);return out.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));}`,
      run: 'console.log(JSON.stringify(subsets([1,2])));',
      expect: ['[[],[1],[2],[1,2]]'],
    }],
  },
  {
    id: 'dijkstra-shortest-path',
    title: 'Dijkstra shortest path',
    conceptId: 'shortest-path',
    type: 'coding-problem',
    difficulty: 'advanced',
    prompt: 'Weighted graph: 0—1—2 with weights 1 and 4, and 0—2 weight 10. Shortest 0→2?',
    expectedOutput: 'Cost 5 via node 1.',
    hints: ['Min-heap on tentative distance.', 'Skip stale heap entries.'],
    solutionNotes: 'Non-negative weights required.',
    testCases: [{
      setup: `function dijkstra(g,s,t){const dist=new Map([[s,0]]);const pq=[[0,s]];while(pq.length){pq.sort((a,b)=>a[0]-b[0]);const[d,u]=pq.shift();if(u===t)return d;if(d>dist.get(u))continue;for(const[e,w]of g[u]||[]){const nd=d+w;if(nd<(dist.get(e)??Infinity)){dist.set(e,nd);pq.push([nd,e]);}}}return -1;}`,
      run: 'const g={0:[[1,1],[2,10]],1:[[2,4]]};console.log(dijkstra(g,0,2));',
      expect: ['5'],
    }],
  },
  {
    id: 'union-find-connected-components',
    title: 'Union-find component count',
    conceptId: 'union-find',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'n=5, edges [[0,1],[1,2],[3,4]]. How many connected components after unions?',
    expectedOutput: '2 components.',
    hints: ['Union by rank/path compression.', 'Count distinct roots.'],
    solutionNotes: 'Union-find is O(α(n)) amortized per op.',
    testCases: [{
      setup: `function countComp(n,edges){const p=Array.from({length:n},(_,i)=>i);function find(x){return p[x]===x?x:(p[x]=find(p[x]));}function uni(a,b){a=find(a);b=find(b);if(a!==b)p[b]=a;}edges.forEach(([a,b])=>uni(a,b));return new Set(p.map(find)).size;}`,
      run: 'console.log(countComp(5,[[0,1],[1,2],[3,4]]));',
      expect: ['2'],
    }],
  },
  {
    id: 'grid-min-path-dp',
    title: 'Minimum path sum in a grid',
    conceptId: 'dp-2d',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Grid [[1,3,1],[1,5,1],[4,2,1]]. Min path sum top-left to bottom-right moving only right/down?',
    expectedOutput: '7 via 1→3→1→1→1.',
    hints: ['dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1]).', 'Can roll to 1D array.'],
    solutionNotes: '2D DP pattern: carry best-so-far into each cell.',
    testCases: [{
      setup: `function minPath(g){const r=g.length,c=g[0].length;const dp=Array.from({length:r},()=>Array(c).fill(0));dp[0][0]=g[0][0];for(let i=1;i<c;i++)dp[0][i]=dp[0][i-1]+g[0][i];for(let i=1;i<r;i++)dp[i][0]=dp[i-1][0]+g[i][0];for(let i=1;i<r;i++)for(let j=1;j<c;j++)dp[i][j]=g[i][j]+Math.min(dp[i-1][j],dp[i][j-1]);return dp[r-1][c-1];}`,
      run: 'console.log(minPath([[1,3,1],[1,5,1],[4,2,1]]));',
      expect: ['7'],
    }],
  },
  {
    id: 'activity-selection-greedy',
    title: 'Activity selection greedy',
    conceptId: 'greedy',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Activities by end time: [1,4],[3,5],[0,6],[5,7],[8,9],[5,9]. Max non-overlapping count?',
    expectedOutput: '4 activities.',
    hints: ['Sort by finish time.', 'Take next compatible activity greedily.'],
    solutionNotes: 'Greedy works when matroid structure holds.',
    testCases: [{
      setup: `function maxActs(a){a.sort((x,y)=>x[1]-y[1]);let end=-1,c=0;for(const[s,e]of a){if(s>=end){c++;end=e;}}return c;}`,
      run: 'console.log(maxActs([[1,4],[3,5],[0,6],[5,7],[8,9],[5,9]]));',
      expect: ['4'],
    }],
  },
  {
    id: 'merge-intervals',
    title: 'Merge overlapping intervals',
    conceptId: 'intervals',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'Merge [[1,3],[2,6],[8,10],[15,18]] → ?',
    expectedOutput: '[[1,6],[8,10],[15,18]].',
    hints: ['Sort by start.', 'Extend current if overlap.'],
    solutionNotes: 'Sort + sweep is the interval workhorse.',
    testCases: [{
      setup: `function merge(iv){if(!iv.length)return[];iv.sort((a,b)=>a[0]-b[0]);const out=[iv[0]];for(let i=1;i<iv.length;i++){const last=out[out.length-1];if(iv[i][0]<=last[1])last[1]=Math.max(last[1],iv[i][1]);else out.push(iv[i]);}return out;}`,
      run: 'console.log(JSON.stringify(merge([[1,3],[2,6],[8,10],[15,18]])));',
      expect: ['[[1,6],[8,10],[15,18]]'],
    }],
  },
  {
    id: 'gcd-modular',
    title: 'GCD and modulo arithmetic',
    conceptId: 'math-geometry',
    type: 'coding-problem',
    difficulty: 'core',
    prompt: 'gcd(48,18)? What is (7^10) mod 13 via repeated squaring?',
    expectedOutput: 'gcd=6; 7^10 mod 13 = 4.',
    hints: ['Euclidean gcd.', 'Binary exponentiation reduces mod each step.'],
    solutionNotes: 'Modular exp shows up in hashing and crypto drills.',
    testCases: [{
      setup: `function gcd(a,b){while(b){[a,b]=[b,a%b];}return a;}
function modPow(b,e,m){let r=1;b%=m;while(e){if(e&1)r=r*b%m;b=b*b%m;e>>=1;}return r;}`,
      run: 'console.log(gcd(48,18), modPow(7,10,13));',
      expect: ['6', '4'],
    }],
  },
  {
    id: 'single-number-xor',
    title: 'Find the single number (XOR)',
    conceptId: 'bit-manipulation',
    type: 'coding-problem',
    difficulty: 'intro',
    prompt: 'Every element appears twice except one. Find it in O(n) time, O(1) space.',
    expectedOutput: 'xor all → 5 for [4,1,2,1,4].',
    hints: ['a^a=0, a^0=a.', 'XOR is commutative — order does not matter.'],
    solutionNotes: 'Bitmask/XOR tricks are fast interview wins.',
    testCases: [{
      setup: 'function single(nums){return nums.reduce((a,b)=>a^b,0);}',
      run: 'console.log(single([4,1,2,1,4]));',
      expect: ['5'],
    }],
  },
];

const GATE_TEST_CASES = {
  'construct-confidence-interval': [{
    setup: 'function ci95(phat,n,z=1.96){const se=Math.sqrt(phat*(1-phat)/n);return [phat-z*se,phat+z*se].map(x=>+x.toFixed(3));}',
    run: 'console.log(JSON.stringify(ci95(0.55,100)));',
    expect: ['[0.452,0.648]'],
  }],
  'clt-sample-size': [{
    setup: 'function nPerArm(p,delta){return Math.ceil(16*p*(1-p)/(delta*delta));}',
    run: 'console.log(nPerArm(0.05,0.01));',
    expect: ['7600'],
  }],
  'standard-error-mean': [{
    setup: 'function seMean(s,n){return s/Math.sqrt(n);} function ci(xbar,se,z=1.96){return [xbar-z*se,xbar+z*se].map(v=>+v.toFixed(2));}',
    run: 'const se=seMean(10,100);console.log(se.toFixed(1),JSON.stringify(ci(50,se)));',
    expect: ['1.0', '[48.04,51.96]'],
  }],
  'compute-gradient-2d': [{
    setup: 'function grad(x,y){return [2*x+3*y,3*x+2*y];} function norm(v){return Math.sqrt(v[0]*v[0]+v[1]*v[1]);}',
    run: 'const g=grad(1,2);console.log(g[0],g[1],norm(g).toFixed(3));',
    expect: ['8', '7', '10.630'],
  }],
  'compute-sharpe-drawdown': [{
    setup: 'function annSharpe(mean,sigma,rf=0){return (mean*252-rf)/(sigma*Math.sqrt(252));} function maxDD(peak,trough){return (trough-peak)/peak;}',
    run: 'console.log(annSharpe(0.0004,0.01).toFixed(2), maxDD(1.2,0.95).toFixed(3));',
    expect: ['0.63', '-0.208'],
  }],
  'interpret-p-value': [{
    setup: 'function shouldShip(p,alpha,absLift,minLift){return p<alpha && absLift>=minLift;}',
    run: 'console.log(shouldShip(0.03,0.05,0.001,0.005), shouldShip(0.03,0.05,0.01,0.005));',
    expect: ['false', 'true'],
  }],
  'type-errors-power': [{
    setup: 'function errorType(h0True,rejected){if(h0True&&rejected)return "I";if(!h0True&&!rejected)return "II";return "ok";}',
    run: 'console.log(errorType(false,false));',
    expect: ['II'],
  }],
};

const CONCEPT_LINKS = Object.fromEntries(NEW_DRILLS.map(d => [d.conceptId, d.id]));

const drillsFile = JSON.parse(readFileSync(drillsPath, 'utf8'));
const conceptsFile = JSON.parse(readFileSync(conceptsPath, 'utf8'));

const existingIds = new Set(drillsFile.drills.map(d => d.id));
let added = 0;
for (const drill of NEW_DRILLS) {
  if (existingIds.has(drill.id)) continue;
  drillsFile.drills.push(drill);
  existingIds.add(drill.id);
  added++;
}

let testCasesAdded = 0;
for (const d of drillsFile.drills) {
  if (GATE_TEST_CASES[d.id]) {
    if (!d.testCases?.length) {
      d.testCases = GATE_TEST_CASES[d.id];
      testCasesAdded++;
    }
  }
}

let linked = 0;
for (const c of conceptsFile.concepts) {
  const drillId = CONCEPT_LINKS[c.id];
  if (!drillId) continue;
  const drills = new Set(c.drills ?? []);
  drills.delete(`drill-${c.id}`);
  drills.add(drillId);
  c.drills = [...drills];
  linked++;
}

writeFileSync(drillsPath, `${JSON.stringify(drillsFile, null, 2)}\n`);
writeFileSync(conceptsPath, `${JSON.stringify(conceptsFile, null, 2)}\n`);

console.log(`Added ${added} editorial drills, ${testCasesAdded} gate testCase sets, linked ${linked} concepts.`);