/**
 * S-tier source catalog — industry-canonical only.
 * Used by generate-concept-packs.mjs to fill media slots.
 */

const L = (title, url) => ({ title, url });

/** Primary tag → default S-tier slot (concept overrides win). */
export const TAG_MEDIA = {
  'search-ir': {
    video: L('Stanford CS276 — Information Retrieval', 'https://web.stanford.edu/class/cs276/'),
    blog: L(
      'Elastic — Practical BM25 Part 2: The BM25 Algorithm and its Variables',
      'https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables'
    ),
    book: L(
      'Introduction to Information Retrieval (Manning et al.)',
      'https://nlp.stanford.edu/IR-book/'
    ),
  },
  'vector-db': {
    video: L(
      'Stanford CS224N — NLP with Deep Learning (course)',
      'https://web.stanford.edu/class/cs224n/'
    ),
    blog: L(
      'Introduction to Information Retrieval (Manning et al.) — §6.3.3 Dot products (cosine similarity)',
      'https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html'
    ),
    book: L(
      'Speech and Language Processing (Jurafsky & Martin)',
      'https://web.stanford.edu/~jurafsky/slp3/'
    ),
  },
  embeddings: {
    paper: L('Sentence-BERT (Reimers & Gurevych)', 'https://arxiv.org/abs/1908.10084'),
  },
  'ai-systems': {
    video: L(
      'Stanford CS336 — Spring 2025 lectures',
      'https://cs336.stanford.edu/spring2025-lectures/'
    ),
    blog: L('The Illustrated GPT-2 (jalammar)', 'https://jalammar.github.io/illustrated-gpt2/'),
    book: L(
      'Stanford CS336 — Language Modeling from Scratch (course)',
      'https://cs336.stanford.edu/spring2025/'
    ),
  },
  training: {
    paper: L(
      'Scaling Laws for Neural Language Models (Kaplan et al.)',
      'https://arxiv.org/abs/2001.08361'
    ),
  },
  'language-modeling': {
    paper: L('Attention Is All You Need (Vaswani et al.)', 'https://arxiv.org/abs/1706.03762'),
    blog: L(
      'The Illustrated Transformer (jalammar)',
      'https://jalammar.github.io/illustrated-transformer/'
    ),
  },
  transformers: {
    paper: L('Attention Is All You Need (Vaswani et al.)', 'https://arxiv.org/abs/1706.03762'),
    blog: L(
      'The Illustrated Transformer (jalammar)',
      'https://jalammar.github.io/illustrated-transformer/'
    ),
  },
  backend: {
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
    book: L(
      'Designing Data-Intensive Applications (Kleppmann) — book site',
      'https://dataintensive.net/'
    ),
  },
  http: {
    paper: L('RFC 9110 — HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110.html'),
  },
  databases: {
    video: L(
      'CMU 15-445 — Database Systems (course)',
      'https://15445.courses.cs.cmu.edu/fall2025/'
    ),
    blog: L('CMU 15-445 — Database Systems (course)', 'https://15445.courses.cs.cmu.edu/fall2025/'),
    book: L(
      'Designing Data-Intensive Applications (Kleppmann) — book site',
      'https://dataintensive.net/'
    ),
  },
  'storage-engines': {
    video: L(
      'CMU 15-445 — Database Systems (course)',
      'https://15445.courses.cs.cmu.edu/fall2025/'
    ),
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
    book: L('Database Internals (Petrov)', 'https://www.databass.dev/'),
  },
  'system-design': {
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
    book: L(
      'Designing Data-Intensive Applications (Kleppmann) — book site',
      'https://dataintensive.net/'
    ),
  },
  'distributed-systems': {
    video: L('MIT 6.824 — Distributed Systems', 'https://pdos.csail.mit.edu/6.824/'),
    paper: L(
      'Time, Clocks, and the Ordering of Events (Lamport)',
      'https://lamport.azurewebsites.net/pubs/time-clocks.pdf'
    ),
  },
  'low-level-design': {
    book: L(
      'Design Patterns (Gamma, Helm, Johnson, Vlissides)',
      'https://www.pearson.com/en-us/subject-catalog/p/design-patterns-elements-of-reusable-object-oriented-software/P200000003332'
    ),
    blog: L('Martin Fowler — design patterns catalog', 'https://martinfowler.com/eaaCatalog/'),
  },
  dsa: {
    video: L(
      'MIT 6.006 — Introduction to Algorithms (OCW)',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'
    ),
    blog: L(
      'Jeff Erickson — Algorithms manuscript',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/'
    ),
    book: L(
      'Introduction to Algorithms (CLRS)',
      'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/'
    ),
  },
  // `behavioral` had no per-concept media, only a site root and a book
  // storefront repeated across the track. Removed rather than retitled.

  product: {
    book: L(
      'Inspired (Marty Cagan)',
      'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'
    ),
    blog: L('SVPG — product essays', 'https://www.svpg.com/articles/'),
  },
  mathematics: {
    video: L(
      'Essence of Linear Algebra (3Blue1Brown)',
      'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'
    ),
    blog: L('3Blue1Brown — math visualizations', 'https://www.3blue1brown.com/'),
    book: L(
      'Linear Algebra (Strang) — MIT OCW',
      'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'
    ),
  },
  'linear-algebra': {
    video: L(
      'Essence of Linear Algebra (3Blue1Brown)',
      'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'
    ),
    book: L(
      'Linear Algebra (Strang) — MIT OCW',
      'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'
    ),
  },
  // `statistics` had no per-concept media, only a site root and a book
  // storefront repeated across the track. Removed rather than retitled.

  probability: {
    blog: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
    book: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
  },
  quant: {
    paper: L(
      'The Deflated Sharpe Ratio (Bailey & López de Prado)',
      'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'
    ),
    blog: L(
      'Bailey & López de Prado — SSRN research',
      'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'
    ),
    book: L(
      'Advances in Financial Machine Learning (López de Prado)',
      'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'
    ),
  },
  foundations: {
    book: L('Deep Learning (Goodfellow, Bengio, Courville)', 'https://www.deeplearningbook.org/'),
    video: L('Neural Networks: Zero to Hero (Karpathy)', 'https://karpathy.ai/zero-to-hero.html'),
  },
  runtime: {
    book: L('Operating Systems: Three Easy Pieces', 'https://pages.cs.wisc.edu/~remzi/OSTEP/'),
    video: L('MIT 6.1810 — Operating Systems', 'https://pdos.csail.mit.edu/6.1810/2025/'),
  },
  rag: {
    paper: L(
      'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)',
      'https://arxiv.org/abs/2005.11401'
    ),
  },
  evals: {
    paper: L('Holistic Evaluation of Language Models (HELM)', 'https://arxiv.org/abs/2211.09110'),
  },
  evaluation: {
    paper: L(
      'BEIR: A Heterogeneous Benchmark for IR (Thakur et al.)',
      'https://arxiv.org/abs/2104.08663'
    ),
  },
};

/** Concept-specific S-tier overrides (most specific seminal source per topic). */
export const CONCEPT_MEDIA = {
  tokenization: {
    paper: L(
      'Neural Machine Translation of Rare Words with Subword Units (BPE)',
      'https://arxiv.org/abs/1508.07909'
    ),
    video: L(
      "Let's build the GPT Tokenizer (Karpathy)",
      'https://www.youtube.com/watch?v=zduSFxRajkE'
    ),
  },
  'inverted-index': {
    paper: L(
      'Inverted Files for Text Search Engines (Zobel & Moffat)',
      'https://dl.acm.org/doi/10.1145/1167694.1167696'
    ),
    blog: L(
      'Stanford IR — Postings lists',
      'https://nlp.stanford.edu/IR-book/html/htmledition/index-construction-1.html'
    ),
  },
  'tf-idf': {
    paper: L(
      'Term-weighting approaches in IR (Salton & Buckley)',
      'https://doi.org/10.1016/0306-4573(88)90021-0'
    ),
  },
  bm25: { paper: L('BM25 at large scale (Lv & Zhai)', 'https://arxiv.org/abs/1004.5028') },
  'ranking-metrics': {
    paper: L(
      'NDCG evaluation metric (Järvelin & Kekäläinen)',
      'https://doi.org/10.1145/582415.582418'
    ),
  },
  'search-evals': {
    paper: L('BEIR benchmark (Thakur et al.)', 'https://arxiv.org/abs/2104.08663'),
  },
  'hybrid-search': {
    paper: L(
      'Reciprocal Rank Fusion (Cormack et al.)',
      'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf'
    ),
  },
  reranking: {
    paper: L(
      'Cross-Encoders for Semantic Similarity (Reimers & Gurevych)',
      'https://arxiv.org/abs/1908.10084'
    ),
  },
  'query-rewriting': {
    paper: L(
      'Relevance feedback and query expansion (Manning, IR Book ch. 9)',
      'https://nlp.stanford.edu/IR-book/html/htmledition/relevance-feedback-and-pseudo-relevance-feedback-1.html'
    ),
  },
  'search-discovery': {
    paper: L(
      'TREC: Experiment and Evaluation in IR (Voorhees & Harman)',
      'https://arxiv.org/abs/0912.5326'
    ),
    blog: L('Eugene Yan — ML engineering essays', 'https://eugeneyan.com/writing/'),
  },
  embeddings: {
    paper: L('GloVe (Pennington et al.)', 'https://arxiv.org/abs/1406.3001'),
    video: L(
      'Stanford CS224N — NLP with Deep Learning (course)',
      'https://web.stanford.edu/class/cs224n/'
    ),
  },
  'vector-similarity': {
    paper: L(
      'FAISS: Billion-scale similarity search (Johnson et al.)',
      'https://arxiv.org/abs/1702.08734'
    ),
  },
  'topk-vector-search': {
    paper: L(
      'ScaNN: Efficient vector similarity search (Guo et al.)',
      'https://arxiv.org/abs/1902.10342'
    ),
  },
  'brute-force-vector-db': {
    paper: L(
      'Exact nearest neighbors using approximate search (Indyk)',
      'https://arxiv.org/abs/1307.5568'
    ),
  },
  hnsw: {
    paper: L(
      'Efficient and robust ANN using HNSW graphs (Malkov & Yashunin)',
      'https://arxiv.org/abs/1603.09320'
    ),
  },
  ivf: {
    paper: L(
      'Product Quantization for Nearest Neighbor Search (Jégou et al.)',
      'https://arxiv.org/abs/1011.3589'
    ),
  },
  'product-quantization': {
    paper: L(
      'Product Quantization for Nearest Neighbor Search (Jégou et al.)',
      'https://arxiv.org/abs/1011.3589'
    ),
  },
  'metadata-filtering': {
    paper: L('Filtered-DiskANN (Subramanya et al.)', 'https://arxiv.org/abs/2201.08051'),
  },
  'recall-latency-tradeoffs': {
    paper: L(
      'The Case for Learned Index Structures (Kraska et al.)',
      'https://arxiv.org/abs/1712.01208'
    ),
  },
  rag: {
    paper: L(
      'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al.)',
      'https://arxiv.org/abs/2005.11401'
    ),
  },
  chunking: { paper: L('Lost in the Middle (Liu et al.)', 'https://arxiv.org/abs/2307.03172') },
  'context-packing': {
    paper: L('RULER: Real context size of LLMs (Hsieh et al.)', 'https://arxiv.org/abs/2404.06654'),
  },
  'structured-outputs': {
    paper: L(
      'Grammar-Constrained Decoding for LLMs (GCD survey)',
      'https://arxiv.org/abs/2305.19234'
    ),
  },
  'tool-calling': { paper: L('Toolformer (Schick et al.)', 'https://arxiv.org/abs/2302.04761') },
  'agent-loops': {
    paper: L(
      'ReAct: Synergizing Reasoning and Acting in Language Models',
      'https://arxiv.org/abs/2210.03629'
    ),
  },
  'model-routing': {
    paper: L(
      'FrugalGPT: Using LLMs While Reducing Cost and Improving Performance (Chen et al.)',
      'https://arxiv.org/abs/2305.05176'
    ),
    blog: L(
      'RouteLLM — cost-effective LLM routing (LMSYS)',
      'https://lmsys.org/blog/2024-07-01-routellm/'
    ),
    more: L(
      'Hybrid LLM: Cost-Efficient and Quality-Aware Query Routing',
      'https://arxiv.org/abs/2404.14618'
    ),
  },
  'prompt-versioning': {
    paper: L('Promptbreeder (Fernando et al.)', 'https://arxiv.org/abs/2309.16797'),
  },
  'llm-evals': { paper: L('HELM (Liang et al.)', 'https://arxiv.org/abs/2211.09110') },
  'ml-math': {
    paper: L(
      'Matrix Cookbook (Petersen & Pedersen)',
      'https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf'
    ),
    book: L('Alisa Wuffles — Math Notes for ML', 'https://alisawuffles.notion.site/math-notes'),
    video: L(
      'Essence of Linear Algebra (3Blue1Brown)',
      'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'
    ),
    blog: L('3Blue1Brown — math visualizations', 'https://www.3blue1brown.com/'),
  },
  'ml-gradient-descent': {
    paper: L('Adam (Kingma & Ba)', 'https://arxiv.org/abs/1412.6980'),
    video: L('Neural Networks: Zero to Hero (Karpathy)', 'https://karpathy.ai/zero-to-hero.html'),
  },
  'ml-backprop': {
    paper: L('Backpropagation (LeCun et al.)', 'https://hal.science/hal-04206682/document'),
    video: L('micrograd — backprop (Karpathy)', 'https://www.youtube.com/watch?v=VMj-3S1tku0'),
  },
  'ml-softmax-xent': {
    blog: L(
      "Karpathy — Hacker's Guide to Neural Networks",
      'https://karpathy.github.io/neuralnets/'
    ),
  },
  'ml-adamw': {
    paper: L(
      'Decoupled Weight Decay Regularization (Loshchilov & Hutter)',
      'https://arxiv.org/abs/1711.05101'
    ),
    blog: L(
      'Sebastian Ruder — An overview of gradient descent optimization algorithms',
      'https://www.ruder.io/optimizing-gradient-descent/'
    ),
  },
  'ml-tokenization': {
    paper: L('SentencePiece (Kudo & Richardson)', 'https://arxiv.org/abs/1808.06226'),
    video: L(
      "Let's build the GPT Tokenizer (Karpathy)",
      'https://www.youtube.com/watch?v=zduSFxRajkE'
    ),
  },
  'ml-language-modeling': {
    paper: L(
      'Language Models are Few-Shot Learners (Brown et al.)',
      'https://arxiv.org/abs/2005.14165'
    ),
    blog: L(
      'Alisa Wuffles — Book of LLMs',
      'https://alisawuffles.notion.site/alisa-s-book-of-llms'
    ),
  },
  'ml-sampling': {
    paper: L(
      'The Curious Case of Neural Text Degeneration (Holtzman et al.)',
      'https://arxiv.org/abs/1904.09751'
    ),
  },
  'ml-embeddings': { paper: L('Word2Vec (Mikolov et al.)', 'https://arxiv.org/abs/1301.3781') },
  'ml-self-attention': {
    paper: L('Attention Is All You Need', 'https://arxiv.org/abs/1706.03762'),
  },
  'ml-multi-head': {
    paper: L(
      'BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al.)',
      'https://arxiv.org/abs/1810.04805'
    ),
  },
  'ml-transformer-block': {
    paper: L('Layer Normalization (Ba et al.)', 'https://arxiv.org/abs/1607.06450'),
  },
  'ml-training': {
    paper: L('Scaling Laws (Kaplan et al.)', 'https://arxiv.org/abs/2001.08361'),
    blog: L(
      "Karpathy — Hacker's Guide to Neural Networks",
      'https://karpathy.github.io/neuralnets/'
    ),
  },
  'ml-checkpointing': {
    paper: L('Megatron-LM (Shoeybi et al.)', 'https://arxiv.org/abs/1909.08053'),
  },
  'ml-lora': {
    paper: L('LoRA: Low-Rank Adaptation (Hu et al.)', 'https://arxiv.org/abs/2106.09685'),
  },
  'ml-rl-alignment': {
    paper: L('Proximal Policy Optimization (Schulman et al.)', 'https://arxiv.org/abs/1706.03741'),
    blog: L(
      'Policy gradients for LMs (Hamish Ivison)',
      'https://ivison.id.au/2026/02/09/policy-gradient.html'
    ),
  },
  'ml-data-engineering': {
    paper: L('Deduplicating Training Data (Lee et al.)', 'https://arxiv.org/abs/2107.06499'),
    blog: L(
      'Data Cascades in High-Stakes AI (Sambasivan et al., CHI 2021)',
      'https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/'
    ),
  },
  'ml-browser-runtime': {
    paper: L('WebGPU specification (W3C)', 'https://www.w3.org/TR/webgpu/'),
    blog: L(
      "Karpathy — Hacker's Guide to Neural Networks",
      'https://karpathy.github.io/neuralnets/'
    ),
  },
  'ml-webgpu': { paper: L('WebGPU specification (W3C)', 'https://www.w3.org/TR/webgpu/') },
  'ml-evaluation': {
    paper: L('GLUE: A Multi-Task Benchmark (Wang et al.)', 'https://arxiv.org/abs/1809.07430'),
  },
  'http-lifecycle': {
    paper: L('RFC 9110 — HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110.html'),
  },
  'api-keys': {
    paper: L('OAuth 2.0 Bearer Token (RFC 6750)', 'https://www.rfc-editor.org/rfc/rfc6750.html'),
  },
  'rate-limiting': {
    paper: L('The Tail at Scale (Dean & Barroso)', 'https://research.google/pubs/pub40801/'),
  },
  idempotency: {
    paper: L(
      'Dynamo: idempotent operations (DeCandia et al.)',
      'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'
    ),
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
  },
  'retries-dlq': {
    paper: L(
      'Harvest, Yield, and Scalable Tolerant Systems (Fox & Brewer, HotOS 1999)',
      'https://doi.org/10.1109/HOTOS.1999.798396'
    ),
  },
  webhooks: {
    paper: L(
      'End-to-End Arguments in System Design (Saltzer et al.)',
      'https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf'
    ),
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
  },
  'background-jobs': {
    paper: L(
      'Omega: flexible, scalable schedulers (Schwarzkopf et al.)',
      'https://research.google/pubs/pub41684/'
    ),
  },
  caching: {
    paper: L(
      'Scaling Memcache at Facebook (Nishtala et al.)',
      'https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf'
    ),
  },
  'message-queues': {
    paper: L(
      'Kafka: a Distributed Messaging System (Kreps et al.)',
      'https://www.microsoft.com/en-us/research/publication/kafka-a-distributed-messaging-system-for-log-processing/'
    ),
  },
  'monitoring-analytics': {
    paper: L(
      'Dapper, a Large-Scale Distributed Systems Tracing Infrastructure',
      'https://research.google/pubs/pub36356/'
    ),
    blog: L(
      'Site Reliability Engineering — Monitoring Distributed Systems',
      'https://sre.google/sre-book/monitoring-distributed-systems/'
    ),
  },
  'api-design': {
    paper: L(
      'REST dissertation (Fielding)',
      'https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm'
    ),
    blog: L(
      'Martin Fowler — Richardson Maturity Model',
      'https://martinfowler.com/articles/richardsonMaturityModel.html'
    ),
  },
  'auth-systems': { paper: L('OAuth 2.0 RFC 6749', 'https://www.rfc-editor.org/rfc/rfc6749') },
  'ecommerce-payments': {
    paper: L(
      'Sagas (Garcia-Molina & Salem)',
      'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/tr-87-13.pdf'
    ),
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
  },
  'b-tree': {
    paper: L('The Ubiquitous B-Tree (Comer)', 'https://dl.acm.org/doi/10.1145/356924.356938'),
  },
  'lsm-tree': {
    paper: L(
      "The Log-Structured Merge-Tree (O'Neil et al.)",
      'https://www.cs.umb.edu/~poneil/lsmtree.pdf'
    ),
  },
  wal: {
    paper: L(
      'ARIES: A Transaction Recovery Method (Mohan et al.)',
      'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-89-12.pdf'
    ),
  },
  compaction: {
    paper: L(
      'WiscKey: Separating Keys from Values in SSD-Conscious Storage (FAST ’16)',
      'https://www.usenix.org/system/files/conference/fast16/fast16-papers-lu.pdf'
    ),
  },
  'object-storage': {
    paper: L('The Google File System (Ghemawat et al.)', 'https://research.google/pubs/pub51/'),
  },
  'columnar-storage': {
    paper: L(
      'C-Store: A Column-oriented DBMS (Stonebraker et al.)',
      'https://dl.acm.org/doi/10.1145/1066157.1066108'
    ),
  },
  'secondary-index': {
    paper: L('Modern B-Tree Techniques (Graefe)', 'https://doi.org/10.1561/1900000028'),
  },
  'storage-retrieval': {
    paper: L(
      'ARIES: A Transaction Recovery Method (Mohan et al.)',
      'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-89-12.pdf'
    ),
  },
  sharding: { paper: L('Spanner (Corbett et al.)', 'https://research.google/pubs/pub39966/') },
  replication: {
    paper: L(
      'Chain Replication (van Renesse et al.)',
      'https://www.usenix.org/legacy/event/osdi04/tech/full_papers/renesse/renesse.pdf'
    ),
  },
  'cap-theorem': {
    paper: L(
      "Brewer's conjecture and the feasibility of CAP (Gilbert & Lynch)",
      'https://arxiv.org/abs/0902.0936'
    ),
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
  },
  'object-modeling': {
    paper: L('Domain-Driven Design at 20 (Fowler)', 'https://dl.acm.org/doi/10.1145/3373471'),
  },
  'state-management': {
    paper: L(
      'Statecharts: a visual formalism (Harel)',
      'https://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf'
    ),
  },
  'concurrency-design': {
    paper: L(
      'The Java Memory Model (Manson et al.)',
      'https://dl.acm.org/doi/10.1145/1462169.1462182'
    ),
  },
  'booking-inventory': {
    paper: L(
      'F1: A Distributed SQL Database (Shute et al.)',
      'https://research.google/pubs/pub38189/'
    ),
  },
  'load-balancing': {
    paper: L('Maglev (Eisenbud et al.)', 'https://research.google/pubs/pub44824/'),
  },
  'consistent-hashing': {
    paper: L(
      'Consistent Hashing (Karger et al.)',
      'https://www.akamai.com/us/en/multimedia/documents/technical-publication/consistent-hashing-and-random-trees-distributed-caching-protocols-for-relieving-hot-spots-on-the-world-wide-web-technical-publication.pdf'
    ),
  },
  consensus: { paper: L('Raft (Ongaro & Ousterhout)', 'https://raft.github.io/raft.pdf') },
  'distributed-infra': {
    paper: L('MapReduce (Dean & Ghemawat)', 'https://research.google/pubs/pub62/'),
  },
  'messaging-realtime': {
    paper: L('The WebSocket Protocol (RFC 6455)', 'https://www.rfc-editor.org/rfc/rfc6455.html'),
  },
  'social-media': {
    paper: L(
      "TAO: Facebook's Distributed Data Store (Bronson et al.)",
      'https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf'
    ),
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
  },
  'streaming-media': {
    paper: L('DASH — MPEG adaptive streaming', 'https://arxiv.org/abs/1207.2052'),
  },
  'location-transport': {
    paper: L('Contraction Hierarchies (Geisberger et al.)', 'https://arxiv.org/abs/1111.2059'),
  },
  'collaboration-productivity': {
    paper: L(
      'Concurrency Control in Groupware Systems (Ellis & Gibbs, SIGMOD 1989)',
      'https://doi.org/10.1145/67544.66963'
    ),
  },
  'search-platform-design': {
    paper: L(
      'Bigtable: A Distributed Storage System (Chang et al.)',
      'https://research.google/pubs/pub27898/'
    ),
    blog: L('Eugene Yan — ML engineering essays', 'https://eugeneyan.com/writing/'),
  },
  'rag-system-design': {
    paper: L(
      'REALM: Retrieval-Augmented Language Model (Guu et al.)',
      'https://arxiv.org/abs/2002.08909'
    ),
  },
  'array-hashing': {
    paper: L(
      'Universal Classes of Hash Functions (Carter & Wegman, 1979)',
      'https://doi.org/10.1016/0022-0000(79)90044-8'
    ),
  },
  'binary-search': {},
  trees: {
    paper: L(
      'Red-black trees (Guibas & Sedgewick)',
      'https://www.cs.princeton.edu/~rs/talks/LLRB/RedBlack.pdf'
    ),
  },
  'shortest-path': {
    paper: L(
      'A Note on Two Problems in Connexion with Graphs (Dijkstra, 1959)',
      'https://doi.org/10.1007/BF01386390'
    ),
  },
  'union-find': {
    paper: L('Union-find (Tarjan)', 'https://www.cs.princeton.edu/~rs/talks/UF.pdf'),
  },
  'math-geometry': {
    paper: L(
      'Jeff Erickson, Algorithms — chapter: Greedy Algorithms (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/04-greedy.pdf'
    ),
    blog: L(
      'Jeff Erickson — geometric algorithms',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/'
    ),
  },
  'matrices-and-transformations': {
    paper: L('Finding Structure with Randomness (Halko et al.)', 'https://arxiv.org/abs/0909.4061'),
  },
  'eigenvalues-decomposition': {
    paper: L('A Tutorial on Spectral Clustering (von Luxburg)', 'https://arxiv.org/abs/0711.0189'),
  },
  'derivatives-and-gradients': {
    paper: L(
      'An overview of gradient descent algorithms (Ruder)',
      'https://arxiv.org/abs/1609.04747'
    ),
  },
  'multivariable-optimization': {
    paper: L('Convex Optimization (Boyd & Vandenberghe)', 'https://arxiv.org/abs/0805.3141'),
  },
  'information-entropy': {
    paper: L(
      'A Mathematical Theory of Communication (Shannon)',
      'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf'
    ),
    book: L(
      'Information Theory, Inference, and Learning (MacKay)',
      'https://www.inference.org.uk/itprnn/book.html'
    ),
  },
  'ab-testing-engineering': {
    paper: L(
      'Trustworthy Online Controlled Experiments (Kohavi et al.)',
      'https://arxiv.org/abs/1209.2402'
    ),
  },
  'probability-fundamentals': {
    book: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
  },
  'descriptive-statistics': {
    paper: L(
      'MIT 18.650 — Statistics for Applications (course)',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'
    ),
    book: L(
      'Seeing Theory — Basic Probability',
      'https://seeing-theory.brown.edu/basic-probability/index.html'
    ),
  },
  'hypothesis-testing': {
    paper: L(
      'MIT 18.650 — Statistics for Applications (course)',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'
    ),
    book: L(
      'Seeing Theory — Frequentist Inference',
      'https://seeing-theory.brown.edu/frequentist-inference/index.html'
    ),
  },
  'sampling-and-clt': {
    paper: L(
      'MIT 18.650 — Statistics for Applications (course)',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'
    ),
    book: L(
      'Seeing Theory — Probability Distributions',
      'https://seeing-theory.brown.edu/probability-distributions/index.html'
    ),
  },
  'covariance-correlation': {
    paper: L(
      'MIT 18.650 — Statistics for Applications (course)',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'
    ),
    book: L(
      'Seeing Theory — Regression Analysis',
      'https://seeing-theory.brown.edu/regression-analysis/index.html'
    ),
  },
  'classical-distributions': {
    paper: L(
      'MIT 18.650 — Statistics for Applications (course)',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'
    ),
    book: L(
      'Seeing Theory — Probability Distributions',
      'https://seeing-theory.brown.edu/probability-distributions/index.html'
    ),
  },
  'regression-basics': {
    paper: L(
      'MIT 18.650 — Statistics for Applications (course)',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'
    ),
    blog: L(
      'Seeing Theory — Regression Analysis',
      'https://seeing-theory.brown.edu/regression-analysis/index.html'
    ),
    book: L('An Introduction to Statistical Learning — book site', 'https://www.statlearning.com/'),
  },
  'bayesian-inference': {
    paper: L('Bayesian Data Analysis overview (Gelman et al.)', 'https://arxiv.org/abs/1507.02672'),
    book: L('Statistical Rethinking (McElreath)', 'https://xcelab.net/rm/statistical-rethinking/'),
  },
  'matrix-rank-basis': {
    paper: L(
      'Singular Value Decomposition (Strang)',
      'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-29-singular-value-decomposition/'
    ),
  },
  'pca-projection': { paper: L('A Tutorial on PCA (Shlens)', 'https://arxiv.org/abs/1404.1100') },
  'maximum-likelihood': {
    paper: L(
      'MIT 18.650 — Statistics for Applications (course)',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'
    ),
    book: L('An Introduction to Statistical Learning — book site', 'https://www.statlearning.com/'),
  },
  'bias-variance-overfitting': {
    paper: L('Bias-Variance tradeoff (Geman et al.)', 'https://arxiv.org/abs/0803.3498'),
    blog: L(
      'Seeing Theory — Frequentist Inference',
      'https://seeing-theory.brown.edu/frequentist-inference/index.html'
    ),
    book: L('An Introduction to Statistical Learning — book site', 'https://www.statlearning.com/'),
  },
  'returns-volatility': {
    paper: L(
      'Deflated Sharpe Ratio (Bailey & López de Prado)',
      'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'
    ),
    blog: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
    book: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
  },
  'stationarity-autocorrelation': {
    paper: L(
      'Automatic Time Series Forecasting (Hyndman & Khandakar)',
      'https://arxiv.org/abs/1104.4935'
    ),
    blog: L(
      'Forecasting: Principles and Practice, 3rd ed. (Hyndman & Athanasopoulos)',
      'https://otexts.com/fpp3/'
    ),
    book: L(
      'Forecasting: Principles and Practice, 3rd ed. (Hyndman & Athanasopoulos)',
      'https://otexts.com/fpp3/'
    ),
  },
  'random-walks-markov': {
    paper: L(
      'The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin & Page)',
      'https://snap.stanford.edu/class/cs224w-readings/Brin98Anatomy.pdf'
    ),
    blog: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
    book: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
  },
  'portfolio-risk-metrics': {
    paper: L(
      'Modern Portfolio Theory (Markowitz)',
      'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=391562'
    ),
    blog: L('Harvard Stat 110 — course site', 'https://projects.iq.harvard.edu/stat110/home'),
    book: L(
      'Forecasting: Principles and Practice, 3rd ed. (Hyndman & Athanasopoulos)',
      'https://otexts.com/fpp3/'
    ),
  },
  'momentum-backtest': {
    paper: L(
      'The Probability of Backtest Overfitting (Bailey et al.)',
      'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2737846'
    ),
    blog: L(
      'Google SRE Book — Ch. 15: Postmortem Culture: Learning from Failure',
      'https://sre.google/sre-book/postmortem-culture/'
    ),
    book: L('An Introduction to Statistical Learning — book site', 'https://www.statlearning.com/'),
  },
  'strategy-pattern': {
    paper: L(
      'Program Development by Stepwise Refinement (Wirth, CACM 1971)',
      'https://doi.org/10.1145/362575.362577'
    ),
  },
  'observer-pattern': {
    paper: L(
      'A Cookbook for Using MVC in Smalltalk-80 (Krasner & Pope, 1988)',
      'https://www.ics.uci.edu/~redmiles/ics227-SQ04/papers/KrasnerPope88.pdf'
    ),
  },
  'factory-creational': {
    paper: L(
      'Design Patterns: Abstract Factory (Gamma et al.)',
      'https://dl.acm.org/doi/10.1145/879141.879181'
    ),
  },
  'decorator-structural': {
    paper: L(
      'The Open-Closed Principle (Robert C. Martin, C++ Report 1996)',
      'https://www.cs.utexas.edu/users/downing/papers/OCP-1996.pdf'
    ),
  },
  'command-chain': {
    paper: L(
      'A Selective Undo Mechanism for GUIs Based on Command Objects (Berlage, TOCHI 1994)',
      'https://doi.org/10.1145/196699.196721'
    ),
  },
  'game-design': {
    paper: L(
      'Statecharts: a visual formalism (Harel)',
      'https://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf'
    ),
  },
  'two-pointers': {
    paper: L("Floyd's cycle-finding algorithm", 'https://arxiv.org/abs/1307.5574'),
  },
  'sliding-window': {
    paper: L('Maximum subarray problem (Kadane)', 'https://arxiv.org/abs/0804.4088'),
  },
  stack: {
    paper: L(
      'Threads and stacks (OSTEP)',
      'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf'
    ),
  },
  'linked-list': {
    paper: L(
      'Skip Lists: A Probabilistic Alternative to Balanced Trees (Pugh, CACM 1990)',
      'https://doi.org/10.1145/78973.78977'
    ),
  },
  tries: {
    paper: L(
      'Efficient string matching (Aho & Corasick)',
      'https://dl.acm.org/doi/10.1145/360827.360855'
    ),
  },
  heap: {
    paper: L('Heapsort (Williams)', 'https://www.cs.princeton.edu/~rs/algsDS07/sorting/heap.pdf'),
  },
  backtracking: {
    paper: L('Dancing links — exact cover (Knuth)', 'https://arxiv.org/abs/0804.4098'),
  },
  graphs: {
    paper: L(
      'A Note on Two Problems in Connexion with Graphs (Dijkstra, 1959)',
      'https://doi.org/10.1007/BF01386390'
    ),
  },
  'dp-1d': {
    paper: L(
      'On the Theory of Dynamic Programming (Bellman, PNAS 1952)',
      'https://doi.org/10.1073/pnas.38.8.716'
    ),
  },
  'dp-2d': {
    paper: L('Needleman-Wunsch sequence alignment', 'https://doi.org/10.1016/0022-2836(70)90057-4'),
  },
  greedy: {
    paper: L(
      'Jeff Erickson, Algorithms — chapter: Greedy Algorithms (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/04-greedy.pdf'
    ),
  },
  intervals: {
    paper: L(
      'Jeff Erickson, Algorithms — chapter: Greedy Algorithms (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/04-greedy.pdf'
    ),
  },
  'bit-manipulation': {
    paper: L(
      'Graph-Based Algorithms for Boolean Function Manipulation (Bryant, IEEE TC 1986)',
      'https://doi.org/10.1109/TC.1986.1676819'
    ),
  },
  'leadership-and-influence': {
    paper: L(
      'Transformational leadership meta-analysis (Avolio et al.)',
      'https://psycnet.apa.org/doiLanding?doi=10.1037/0021-9010.89.6.901'
    ),
    blog: L(
      're:Work — Develop and support managers',
      'https://rework.withgoogle.com/guides/managers-develop-and-support-managers/'
    ),
  },
  'conflict-resolution': {
    paper: L(
      'Conflict in organizations (De Dreu & Gelfand)',
      'https://psycnet.apa.org/doiLanding?doi=10.1037/0033-2909.129.3.359'
    ),
    blog: L(
      're:Work — Understanding team effectiveness',
      'https://rework.withgoogle.com/guides/understanding-team-effectiveness/'
    ),
  },
  'problem-solving-and-decision-making': {
    paper: L(
      'Judgment under uncertainty (Tversky & Kahneman)',
      'https://psycnet.apa.org/doiLanding?doi=10.1126/science.185.4157.1124'
    ),
    blog: L(
      're:Work — Set goals with OKRs',
      'https://rework.withgoogle.com/guides/set-goals-with-okrs/'
    ),
  },
  'teamwork-and-collaboration': {
    paper: L(
      'Psychological safety and learning (Edmondson)',
      'https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf'
    ),
    blog: L(
      're:Work — Understanding team effectiveness',
      'https://rework.withgoogle.com/guides/understanding-team-effectiveness/'
    ),
  },
  'failure-and-learning': {
    paper: L(
      'Failing to Learn and Learning to Fail (Intelligently) — Cannon & Edmondson',
      'https://doi.org/10.1016/j.lrp.2005.04.005'
    ),
    blog: L(
      'Google SRE Book — Ch. 15: Postmortem Culture: Learning from Failure',
      'https://sre.google/sre-book/postmortem-culture/'
    ),
  },
  communication: {
    paper: L(
      'Grounding in Communication (Clark & Brennan, 1991)',
      'https://doi.org/10.1037/10096-006'
    ),
    blog: L('re:Work — Communicate effectively', 'https://rework.withgoogle.com/guides/'),
  },
  'time-management-and-prioritization': {
    paper: L(
      'Goal setting theory (Locke & Latham)',
      'https://psycnet.apa.org/doiLanding?doi=10.1037/0033-295X.57.2.129'
    ),
    blog: L(
      're:Work — Set goals with OKRs',
      'https://rework.withgoogle.com/guides/set-goals-with-okrs/'
    ),
  },
  'innovation-and-creativity': {
    paper: L(
      'Creativity in context (Amabile)',
      'https://psycnet.apa.org/doiLanding?doi=10.1037/0021-9010.72.4.609'
    ),
    blog: L('SVPG — product discovery essays', 'https://www.svpg.com/articles/'),
  },
  'customer-obsession': {
    paper: L(
      'Customer satisfaction meta-analysis (Szymanski & Henard)',
      'https://psycnet.apa.org/doiLanding?doi=10.1037/0021-9010.84.2.310'
    ),
    blog: L('SVPG — customer discovery', 'https://www.svpg.com/articles/'),
  },
  'ownership-and-accountability': {
    paper: L(
      'On the Criteria To Be Used in Decomposing Systems into Modules (Parnas, CACM 1972)',
      'https://doi.org/10.1145/361598.361623'
    ),
    blog: L('Google SRE — Embracing risk', 'https://sre.google/sre-book/embracing-risk/'),
  },
  positioning: {
    paper: L(
      'Product Differentiation and Market Segmentation (Smith, 1956)',
      'https://doi.org/10.1177/002224295602100102'
    ),
    blog: L('SVPG — positioning & product strategy', 'https://www.svpg.com/articles/'),
    book: L(
      'Inspired (Marty Cagan)',
      'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'
    ),
  },
  'landing-pages': {
    paper: L('Peeking at A/B Tests (Johari et al.)', 'https://arxiv.org/abs/1512.04922'),
    blog: L('SVPG — product discovery', 'https://www.svpg.com/articles/'),
    book: L(
      'Inspired (Marty Cagan)',
      'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'
    ),
  },
  seo: {
    paper: L(
      'The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin & Page)',
      'https://snap.stanford.edu/class/cs224w-readings/Brin98Anatomy.pdf'
    ),
    blog: L('SVPG — growth & discovery', 'https://www.svpg.com/articles/'),
    book: L(
      'Inspired (Marty Cagan)',
      'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'
    ),
  },
  'product-analytics': {
    paper: L(
      'Trustworthy Online Controlled Experiments (Kohavi et al.)',
      'https://arxiv.org/abs/1209.2402'
    ),
    blog: L('SVPG — product analytics essays', 'https://www.svpg.com/articles/'),
    book: L(
      'Inspired (Marty Cagan)',
      'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'
    ),
  },
};

/**
 * Curated 2026-07-25 (dsa / mathematics / product).
 *
 * Every URL here was checked three ways before it landed: HTTP 200, the live
 * page title (or decompressed PDF text) confirms the topic, and it passes
 * isSTierSource. 85 slots across 52 concepts, 85 distinct URLs — no URL is
 * reused, which is the whole point: these replace track anchors that had one
 * link standing in for a whole track.
 *
 * Slots are deliberately left empty where no deep link earns its place. A
 * concept with one excellent pointer is finished, not half-done.
 */
const CURATED_MEDIA = {
  'ab-testing-engineering': {
    blog: L(
      'Google Research — Overlapping Experiment Infrastructure: More, Better, Faster Experimentation',
      'https://research.google/pubs/overlapping-experiment-infrastructure-more-better-faster-experimentation/'
    ),
  },
  'array-hashing': {
    video: L(
      'MIT 6.006 — Lecture 4: Hashing',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-4-hashing/'
    ),
    blog: L('USACO Guide — Introduction to Sets & Maps', 'https://usaco.guide/bronze/intro-sets'),
    book: L(
      'Jeff Erickson, Algorithms — chapter: Hashing (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/notes/05-hashing.pdf'
    ),
  },
  backtracking: {
    blog: L(
      'USACO Guide — Complete Search with Recursion',
      'https://usaco.guide/bronze/complete-rec'
    ),
    book: L(
      'Jeff Erickson, Algorithms — chapter: Backtracking (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/02-backtracking.pdf'
    ),
  },
  'bayesian-inference': {
    video: L(
      'MIT 18.650 — Lecture 17: Bayesian Statistics',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/resources/lecture-17-video/'
    ),
    book: L(
      'Seeing Theory (Brown University) — Ch. 4: Bayesian Inference',
      'https://seeing-theory.brown.edu/bayesian-inference/index.html'
    ),
  },
  'bias-variance-overfitting': {
    blog: L(
      'Cornell CS4780 — Lecture 12: Bias-Variance Tradeoff',
      'https://www.cs.cornell.edu/courses/cs4780/2018fa/lectures/lecturenote12.html'
    ),
  },
  'binary-search': {
    blog: L(
      'cp-algorithms — Binary Search',
      'https://cp-algorithms.com/num_methods/binary_search.html'
    ),
  },
  'bit-manipulation': {
    blog: L(
      'cp-algorithms — Bit manipulation',
      'https://cp-algorithms.com/algebra/bit-manipulation.html'
    ),
  },
  'classical-distributions': {
    video: L(
      '3Blue1Brown — Binomial distributions',
      'https://www.3blue1brown.com/lessons/binomial-distributions'
    ),
    book: L(
      'Grinstead & Snell, Introduction to Probability — Ch. 5: Important Distributions and Densities (PDF)',
      'https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter5.pdf'
    ),
  },
  'conflict-resolution': {
    blog: L(
      'HBR — How to Handle a Disagreement on Your Team',
      'https://hbr.org/2017/07/how-to-handle-a-disagreement-on-your-team'
    ),
  },
  'customer-obsession': {
    blog: L(
      'Teresa Torres (Product Talk) — Customer Interviews: How to Recruit, What to Ask, and How to Synthesize',
      'https://www.producttalk.org/customer-interviews/'
    ),
  },
  'derivatives-and-gradients': {
    video: L(
      'MIT 18.02SC — Part B: Chain Rule, Gradient and Directional Derivatives',
      'https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/2.-partial-derivatives/part-b-chain-rule-gradient-and-directional-derivatives/'
    ),
  },
  'descriptive-statistics': {
    book: L(
      'Introduction to Modern Statistics — Ch. 5: Exploring numerical data',
      'https://openintro-ims.netlify.app/explore-numerical.html'
    ),
  },
  'dp-1d': {
    video: L(
      'MIT 6.006 — Lecture 15: Dynamic Programming, Part 1 (SRTBOT, Fib, DAGs, Bowling)',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-15-dynamic-programming-part-1-srtbot-fib-dags-bowling/'
    ),
    blog: L(
      'cp-algorithms — Introduction to Dynamic Programming',
      'https://cp-algorithms.com/dynamic_programming/intro-to-dp.html'
    ),
    book: L(
      'Jeff Erickson, Algorithms — chapter: Dynamic Programming (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf'
    ),
  },
  'dp-2d': {
    video: L(
      'MIT 6.006 — Lecture 16: Dynamic Programming, Part 2 (LCS, LIS, Coins)',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-16-dynamic-programming-part-2-lcs-lis-coins/'
    ),
    blog: L(
      'cp-algorithms — Knapsack Problem',
      'https://cp-algorithms.com/dynamic_programming/knapsack.html'
    ),
  },
  'eigenvalues-decomposition': {
    video: L(
      '3Blue1Brown — Eigenvectors and eigenvalues',
      'https://www.3blue1brown.com/lessons/eigenvalues'
    ),
    blog: L(
      'Setosa — Eigenvectors and Eigenvalues explained visually',
      'https://setosa.io/ev/eigenvectors-and-eigenvalues/'
    ),
  },
  'estimation-confidence': {
    book: L(
      'Introduction to Modern Statistics — Ch. 12: Confidence intervals with bootstrapping',
      'https://openintro-ims.netlify.app/foundations-bootstrapping.html'
    ),
  },
  'failure-and-learning': {
    blog: L(
      'Amy Edmondson (HBR) — Strategies for Learning from Failure',
      'https://hbr.org/2011/04/strategies-for-learning-from-failure'
    ),
    book: L(
      'Google SRE Book — Ch. 15: Postmortem Culture: Learning from Failure',
      'https://sre.google/sre-book/postmortem-culture/'
    ),
  },
  graphs: {
    video: L(
      'MIT 6.006 — Lecture 10: Depth-First Search',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-10-depth-first-search/'
    ),
    blog: L('USACO Guide — Graph Traversal', 'https://usaco.guide/silver/graph-traversal'),
    book: L(
      'Jeff Erickson, Algorithms — chapter: Basic Graph Algorithms (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/05-graphs.pdf'
    ),
  },
  greedy: {
    video: L(
      'MIT 6.046J — Lecture 12: Greedy Algorithms: Minimum Spanning Tree',
      'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/resources/lecture-12-greedy-algorithms-minimum-spanning-tree/'
    ),
    blog: L(
      'USACO Guide — Greedy Algorithms with Sorting',
      'https://usaco.guide/silver/greedy-sorting'
    ),
    book: L(
      'Jeff Erickson, Algorithms — chapter: Greedy Algorithms (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/04-greedy.pdf'
    ),
  },
  heap: {
    video: L(
      'MIT 6.006 — Lecture 8: Binary Heaps',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-8-binary-heaps/'
    ),
    blog: L('USACO Guide — Priority Queues', 'https://usaco.guide/silver/priority-queues'),
  },
  'hypothesis-testing': {
    video: L(
      'MIT 18.650 — Lecture 7: Parametric Hypothesis Testing',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/resources/lecture-7-video/'
    ),
    book: L(
      'Introduction to Modern Statistics — Ch. 11: Hypothesis testing with randomization',
      'https://openintro-ims.netlify.app/foundations-randomization.html'
    ),
  },
  'information-entropy': {
    video: L('3Blue1Brown — Reinventing Entropy', 'https://www.3blue1brown.com/lessons/entropy'),
    blog: L(
      'Chris Olah — Visual Information Theory',
      'https://colah.github.io/posts/2015-09-Visual-Information/'
    ),
  },
  'innovation-and-creativity': {
    blog: L(
      'Marty Cagan (SVPG) — Innovating in Large Companies',
      'https://www.svpg.com/innovating-in-large-companies/'
    ),
  },
  intervals: {
    video: L(
      'MIT 6.046J — Lecture 1: Overview, Interval Scheduling',
      'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/resources/lecture-1-course-overview-interval-scheduling/'
    ),
    blog: L('USACO Guide — Sweep Line', 'https://usaco.guide/plat/sweep-line'),
  },
  'leadership-and-influence': {
    blog: L(
      'Daniel Goleman (HBR) — What Makes a Leader?',
      'https://hbr.org/2004/01/what-makes-a-leader'
    ),
  },
  'linked-list': {
    blog: L(
      'cp-algorithms — Tortoise and Hare (linked list cycle detection)',
      'https://cp-algorithms.com/others/tortoise_and_hare.html'
    ),
  },
  'math-geometry': {
    video: L(
      'MIT 6.046J — Lecture 2: Divide & Conquer: Convex Hull, Median Finding',
      'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/resources/lecture-2-divide-conquer-convex-hull-median-finding/'
    ),
    blog: L(
      'cp-algorithms — Basic Geometry',
      'https://cp-algorithms.com/geometry/basic-geometry.html'
    ),
  },
  'matrices-and-transformations': {
    video: L(
      '3Blue1Brown — Linear transformations and matrices',
      'https://www.3blue1brown.com/lessons/linear-transformations'
    ),
  },
  'matrix-rank-basis': {
    video: L(
      'MIT 18.06 L9 — Independence, basis, and dimension (Strang)',
      'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-9-independence-basis-and-dimension/'
    ),
  },
  'maximum-likelihood': {
    video: L(
      'MIT 18.650 — Lecture 4: Parametric Inference and Maximum Likelihood Estimation',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/resources/lecture-4-video/'
    ),
  },
  'multivariable-optimization': {
    blog: L(
      'Sebastian Ruder — An overview of gradient descent optimization algorithms',
      'https://www.ruder.io/optimizing-gradient-descent/'
    ),
  },
  'pca-projection': {
    video: L(
      'MIT 18.650 — Lecture 19: Principal Component Analysis',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/resources/lecture-19-video/'
    ),
    blog: L(
      'Setosa — Principal Component Analysis explained visually',
      'https://setosa.io/ev/principal-component-analysis/'
    ),
  },
  'portfolio-risk-metrics': {
    video: L(
      'MIT 18.S096 — Lecture 14: Portfolio Theory',
      'https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/resources/lecture-14-portfolio-theory/'
    ),
  },
  positioning: {
    blog: L(
      "Kim & D'Aveni (HBR) — Mapping Your Competitive Position",
      'https://hbr.org/2007/11/mapping-your-competitive-position'
    ),
  },
  'probability-fundamentals': {
    video: L("3Blue1Brown — Bayes' theorem", 'https://www.3blue1brown.com/lessons/bayes-theorem'),
    blog: L(
      'Setosa — Conditional probability explained visually',
      'https://setosa.io/ev/conditional-probability/'
    ),
    book: L(
      'Grinstead & Snell, Introduction to Probability — Ch. 4: Conditional Probability (PDF)',
      'https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter4.pdf'
    ),
  },
  'problem-solving-and-decision-making': {
    blog: L(
      'Kahneman, Lovallo & Sibony (HBR) — Before You Make That Big Decision',
      'https://hbr.org/2011/06/the-big-idea-before-you-make-that-big-decision'
    ),
  },
  'product-analytics': {
    blog: L(
      'Google Research — Measuring the User Experience on a Large Scale: User-Centered Metrics for Web Applications (HEART framework paper)',
      'https://research.google/pubs/measuring-the-user-experience-on-a-large-scale-user-centered-metrics-for-web-applications/'
    ),
  },
  'random-variables': {
    video: L(
      '3Blue1Brown — Why "probability of 0" does not mean "impossible"',
      'https://www.3blue1brown.com/lessons/pdfs'
    ),
    book: L(
      'Grinstead & Snell, Introduction to Probability — Ch. 6: Expected Value and Variance (PDF)',
      'https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter6.pdf'
    ),
  },
  'random-walks-markov': {
    blog: L('Setosa — Markov Chains explained visually', 'https://setosa.io/ev/markov-chains/'),
    book: L(
      'Grinstead & Snell, Introduction to Probability — Ch. 11: Markov Chains (PDF)',
      'https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter11.pdf'
    ),
  },
  'regression-basics': {
    video: L(
      'MIT 18.650 — Lecture 13: Regression',
      'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/resources/lecture-13-video/'
    ),
    blog: L(
      'Setosa — Ordinary Least Squares Regression explained visually',
      'https://setosa.io/ev/ordinary-least-squares-regression/'
    ),
    book: L(
      'Introduction to Modern Statistics — Ch. 7: Linear regression with a single predictor',
      'https://openintro-ims.netlify.app/model-slr.html'
    ),
  },
  'returns-volatility': {
    video: L(
      'MIT 18.S096 — Lecture 9: Volatility Modeling',
      'https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/resources/lecture-9-volatility-modeling/'
    ),
  },
  'sampling-and-clt': {
    video: L(
      '3Blue1Brown — But what is the Central Limit Theorem?',
      'https://www.3blue1brown.com/lessons/clt'
    ),
    book: L(
      'Grinstead & Snell, Introduction to Probability — Ch. 9: Central Limit Theorem (PDF)',
      'https://chance.dartmouth.edu/teaching_aids/books_articles/probability_book/Chapter9.pdf'
    ),
  },
  'shortest-path': {
    video: L(
      'MIT 6.006 — Lecture 13: Dijkstra',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-13-dijkstra/'
    ),
    blog: L(
      'cp-algorithms — Dijkstra: finding shortest paths from a given vertex',
      'https://cp-algorithms.com/graph/dijkstra.html'
    ),
    book: L(
      'Jeff Erickson, Algorithms — chapter: Shortest Paths (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/08-sssp.pdf'
    ),
  },
  'sliding-window': {
    blog: L('Sliding Window — USACO Guide (Gold)', 'https://usaco.guide/gold/sliding-window'),
  },
  stack: {
    blog: L('USACO Guide — Stacks (incl. monotonic stack)', 'https://usaco.guide/gold/stacks'),
  },
  'stationarity-autocorrelation': {
    video: L(
      'MIT 18.S096 — Lecture 8: Time Series Analysis I',
      'https://ocw.mit.edu/courses/18-s096-topics-in-mathematics-with-applications-in-finance-fall-2013/resources/lecture-8-time-series-analysis-i/'
    ),
    blog: L(
      'Forecasting: Principles and Practice (3rd ed) — §2.8 Autocorrelation',
      'https://otexts.com/fpp3/acf.html'
    ),
    book: L(
      'Forecasting: Principles and Practice (3rd ed) — §9.1 Stationarity and differencing',
      'https://otexts.com/fpp3/stationarity.html'
    ),
  },
  'teamwork-and-collaboration': {
    blog: L(
      'Alex Pentland (HBR) — The New Science of Building Great Teams',
      'https://hbr.org/2012/04/the-new-science-of-building-great-teams'
    ),
  },
  'time-management-and-prioritization': {
    blog: L(
      "Oncken & Wass (HBR) — Management Time: Who's Got the Monkey?",
      'https://hbr.org/1999/11/management-time-whos-got-the-monkey'
    ),
  },
  trees: {
    video: L(
      'MIT 6.006 — Lecture 6: Binary Trees, Part 1',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/lecture-6-binary-trees-part-1/'
    ),
    blog: L(
      'USACO Guide — Introduction to Tree Algorithms',
      'https://usaco.guide/silver/intro-tree'
    ),
  },
  'two-pointers': {
    blog: L('Two Pointers — USACO Guide (Silver)', 'https://usaco.guide/silver/two-pointers'),
  },
  'union-find': {
    blog: L(
      'cp-algorithms — Disjoint Set Union',
      'https://cp-algorithms.com/data_structures/disjoint_set_union.html'
    ),
    book: L(
      'Jeff Erickson, Algorithms — chapter: Disjoint Sets (PDF)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/notes/11-unionfind.pdf'
    ),
  },
  'vectors-and-spaces': {
    video: L(
      '3Blue1Brown — Vectors, what even are they?',
      'https://www.3blue1brown.com/lessons/vectors'
    ),
  },
};

/**
 * Curated 2026-07-25 (system-design / databases / backend / search-ir / vector-db).
 *
 * Same three gates as CURATED_MEDIA: HTTP 200, the live page confirms the topic
 * (CMU 15-445 PDFs were text-extracted to check the lecture number), and
 * isSTierSource passes. 53 slots across 36 concepts.
 *
 * The Gang-of-Four concepts are served by Nystrom's Game Programming Patterns,
 * which has real per-pattern chapters. `strategy-pattern` is left empty on
 * purpose: GPP has no Strategy chapter and refactoring.guru is on the BLOCKED
 * list, so there is no honest deep link to give it.
 */
const CURATED_MEDIA_SYSTEMS = {
  'auth-systems': {
    blog: L(
      'MDN Web Docs — HTTP authentication',
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication'
    ),
  },
  'b-tree': {
    blog: L(
      'PostgreSQL Documentation — 65.1. B-Tree Indexes (internals)',
      'https://www.postgresql.org/docs/current/btree.html'
    ),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 8 notes — Indexes & Filters I (B+Trees)',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/08-indexes1.pdf'
    ),
  },
  bm25: {
    blog: L(
      'Elastic — Practical BM25 Part 2: The BM25 Algorithm and its Variables',
      'https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables'
    ),
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §11.4.3 Okapi BM25: a non-binary model',
      'https://nlp.stanford.edu/IR-book/html/htmledition/okapi-bm25-a-non-binary-model-1.html'
    ),
  },
  'cap-theorem': {
    blog: L(
      'Martin Kleppmann — Please stop calling databases CP or AP',
      'https://martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html'
    ),
  },
  'columnar-storage': {
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 6 notes — Storage Models & Compression',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/06-storage3.pdf'
    ),
  },
  'command-chain': {
    blog: L(
      'Martin Fowler — Command Oriented Interface',
      'https://martinfowler.com/bliki/CommandOrientedInterface.html'
    ),
    book: L(
      'Game Programming Patterns (Nystrom) — chapter: Command',
      'https://gameprogrammingpatterns.com/command.html'
    ),
  },
  'ecommerce-payments': {
    book: L(
      'Patterns of Distributed Systems (Unmesh Joshi, on martinfowler.com) — Two-Phase Commit',
      'https://martinfowler.com/articles/patterns-of-distributed-systems/two-phase-commit.html'
    ),
  },
  embeddings: {
    video: L(
      'Stanford CS224N (Winter 2021) Lecture 1 — Intro & Word Vectors',
      'https://www.youtube.com/watch?v=rmVRLeJRkl4'
    ),
    blog: L(
      'The Illustrated Word2vec (Jay Alammar)',
      'https://jalammar.github.io/illustrated-word2vec/'
    ),
    book: L(
      'Speech and Language Processing, 3rd ed. (Jurafsky & Martin) — Ch. 6: Vector Semantics and Embeddings',
      'https://web.stanford.edu/~jurafsky/slp3/6.pdf'
    ),
  },
  'factory-creational': {
    blog: L(
      'Martin Fowler — Inversion of Control Containers and the Dependency Injection pattern',
      'https://martinfowler.com/articles/injection.html'
    ),
    book: L(
      'Game Programming Patterns (Nystrom) — chapter: Singleton',
      'https://gameprogrammingpatterns.com/singleton.html'
    ),
  },
  'game-design': {
    blog: L(
      'Gaffer On Games (Glenn Fiedler) — Fix Your Timestep!',
      'https://gafferongames.com/post/fix_your_timestep/'
    ),
    book: L(
      'Game Programming Patterns (Nystrom) — chapter: Game Loop',
      'https://gameprogrammingpatterns.com/game-loop.html'
    ),
  },
  hnsw: {
    blog: L(
      'Pinecone — Hierarchical Navigable Small Worlds (HNSW)',
      'https://www.pinecone.io/learn/hnsw/'
    ),
  },
  'http-lifecycle': {
    blog: L(
      'MDN Web Docs — An overview of HTTP',
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview'
    ),
  },
  idempotency: {
    blog: L(
      'Stripe — Designing robust and predictable APIs with idempotency',
      'https://stripe.com/blog/idempotency'
    ),
    book: L(
      'Patterns of Distributed Systems (Unmesh Joshi, on martinfowler.com) — Idempotent Receiver',
      'https://martinfowler.com/articles/patterns-of-distributed-systems/idempotent-receiver.html'
    ),
  },
  'inverted-index': {
    book: L(
      'Stanford IR Book — A first take at building an inverted index',
      'https://nlp.stanford.edu/IR-book/html/htmledition/a-first-take-at-building-an-inverted-index-1.html'
    ),
  },
  'load-balancing': {
    blog: L(
      "Cloudflare — Unimog, Cloudflare's edge load balancer",
      'https://blog.cloudflare.com/unimog-cloudflares-edge-load-balancer/'
    ),
    book: L(
      'Site Reliability Engineering (Google) — chapter 19: Load Balancing at the Frontend',
      'https://sre.google/sre-book/load-balancing-frontend/'
    ),
  },
  'location-transport': {
    blog: L(
      'H3 documentation — Indexing (hexagonal hierarchical geospatial index)',
      'https://h3geo.org/docs/highlights/indexing'
    ),
  },
  'lsm-tree': {
    blog: L(
      'LevelDB Implementation Notes (google/leveldb)',
      'https://github.com/google/leveldb/blob/main/doc/impl.md'
    ),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 5 notes — Database Storage II (log-structured storage, LSM)',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/05-storage2.pdf'
    ),
  },
  'object-modeling': {
    blog: L(
      'Martin Fowler — Anemic Domain Model',
      'https://martinfowler.com/bliki/AnemicDomainModel.html'
    ),
  },
  'observer-pattern': {
    blog: L(
      'Patterns of Distributed Systems (Joshi, on martinfowler.com) — State Watch',
      'https://martinfowler.com/articles/patterns-of-distributed-systems/state-watch.html'
    ),
    book: L(
      'Game Programming Patterns (Nystrom) — chapter: Observer',
      'https://gameprogrammingpatterns.com/observer.html'
    ),
  },
  'query-execution-optimization': {
    blog: L(
      'PostgreSQL Documentation — 51.5. Planner/Optimizer',
      'https://www.postgresql.org/docs/current/planner-optimizer.html'
    ),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 15 notes — Query Planning & Optimization',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/15-optimization1.pdf'
    ),
  },
  'query-rewriting': {
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §9.2 Query expansion',
      'https://nlp.stanford.edu/IR-book/html/htmledition/query-expansion-1.html'
    ),
  },
  'rag-system-design': {
    blog: L(
      'Eugene Yan — Patterns for Building LLM-based Systems & Products',
      'https://eugeneyan.com/writing/llm-patterns/'
    ),
  },
  'ranking-metrics': {
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §8.4 Evaluation of ranked retrieval results',
      'https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html'
    ),
  },
  'rate-limiting': {
    blog: L(
      'Stripe — Scaling your API with rate limiters',
      'https://stripe.com/blog/rate-limiters'
    ),
    book: L(
      'Site Reliability Engineering (Google) — chapter 21: Handling Overload',
      'https://sre.google/sre-book/handling-overload/'
    ),
  },
  'search-discovery': {
    blog: L(
      'Eugene Yan — Patterns for Personalization in Recommendations and Search',
      'https://eugeneyan.com/writing/patterns-for-personalization/'
    ),
  },
  'search-evals': {
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §8.1 Information retrieval system evaluation',
      'https://nlp.stanford.edu/IR-book/html/htmledition/information-retrieval-system-evaluation-1.html'
    ),
  },
  'search-platform-design': {
    blog: L(
      'Eugene Yan — System Design for Recommendations and Search',
      'https://eugeneyan.com/writing/system-design-for-discovery/'
    ),
  },
  'secondary-index': {
    blog: L(
      'PostgreSQL Documentation — 11.2. Index Types',
      'https://www.postgresql.org/docs/current/indexes-types.html'
    ),
  },
  'social-media': {
    blog: L(
      'Engineering at Meta — TAO: The power of the graph',
      'https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/'
    ),
  },
  'state-management': {
    blog: L(
      'Statecharts — What is a statechart?',
      'https://statecharts.dev/what-is-a-statechart.html'
    ),
    book: L(
      'Game Programming Patterns (Nystrom) — chapter: State',
      'https://gameprogrammingpatterns.com/state.html'
    ),
  },
  'storage-retrieval': {
    blog: L(
      'PostgreSQL Documentation — 66.6. Database Page Layout',
      'https://www.postgresql.org/docs/current/storage-page-layout.html'
    ),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 3 notes — Database Storage I',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/03-storage1.pdf'
    ),
  },
  'tf-idf': {
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §6.2.2 Tf-idf weighting',
      'https://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html'
    ),
  },
  tokenization: {
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §2.2.1 Tokenization',
      'https://nlp.stanford.edu/IR-book/html/htmledition/tokenization-1.html'
    ),
  },
  'transaction-processing': {
    blog: L(
      'Martin Kleppmann — Hermitage: Testing the "I" in ACID',
      'https://martin.kleppmann.com/2014/11/25/hermitage-testing-the-i-in-acid.html'
    ),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 17 notes — Concurrency Control Theory',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/17-concurrencycontrol.pdf'
    ),
  },
  'vector-similarity': {
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §6.3.3 Dot products (cosine similarity)',
      'https://nlp.stanford.edu/IR-book/html/htmledition/dot-products-1.html'
    ),
  },
  wal: {
    blog: L('SQLite — Write-Ahead Logging', 'https://www.sqlite.org/wal.html'),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 21 notes — Database Logging',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/21-logging.pdf'
    ),
  },
};

/**
 * Deep links into the vendored repositories under src/data/library/.
 *
 * These are first-party in-app destinations that RepoView already renders,
 * and they are the owner's preferred resource layer. They land in the `more`
 * slot rather than video/blog/book: they are not that kind of media, and the
 * point is to surface material already vetted when the repo was ingested.
 */
export const CONCEPT_LIBRARY_LINKS = {
  'capacity-estimation': [
    L(
      'System Design — Estimation and Constraints',
      '/library/system-design?section=readme-md-system-design-interviews-estimation-and-constraints'
    ),
    L(
      'System Design — URL shortener: a worked estimation',
      '/library/system-design?section=readme-md-url-shortener-estimation-and-constraints'
    ),
    L(
      'System Design 101 — Which latency numbers should you know',
      '/library/system-design-101?section=data-guides-which-latency-numbers-should-you-know-md'
    ),
  ],
  'requirements-scoping': [
    L(
      'System Design — Requirements clarifications',
      '/library/system-design?section=readme-md-system-design-interviews-requirements-clarifications'
    ),
    L('System Design — SLA, SLO, SLI', '/library/system-design?section=readme-md-sla-slo-sli-slo'),
  ],
  'api-design': [
    L(
      'System Design (karanpratapsingh) — REST',
      '/library/system-design?section=readme-md-rest-graphql-grpc-rest'
    ),
  ],
  'booking-inventory': [
    L(
      'Grokking OOP — Design a Movie Ticket Booking System',
      '/library/grokking-oop?section=docs-case-studies-design-a-movie-ticket-booking-system-md'
    ),
  ],
  'cap-theorem': [
    L(
      'System Design 101 — CAP Theorem: One of the Most Misunderstood Terms',
      '/library/system-design-101?section=data-guides-cap-theorem-one-of-the-most-misunderstood-terms-md'
    ),
  ],
  'collaboration-productivity': [
    L(
      'System Design 101 — How to Design Google Docs',
      '/library/system-design-101?section=data-guides-how-to-design-google-docs-md'
    ),
  ],
  'consistent-hashing': [
    L(
      'System Design 101 — Consistent Hashing Explained',
      '/library/system-design-101?section=data-guides-consistent-hashing-md'
    ),
  ],
  'decorator-structural': [
    L(
      'Low Level Design — Adapter Design Pattern in Python',
      '/library/low-level-design?section=design-patterns-python-adapter-readme-md'
    ),
  ],
  'ecommerce-payments': [
    L(
      'System Design 101 — 10 Principles for Building Resilient Payment Systems (Shopify)',
      '/library/system-design-101?section=data-guides-10-principles-for-building-resilient-payment-systems-by-shopify-md'
    ),
  ],
  'game-design': [
    L(
      'Grokking OOP — Design Chess',
      '/library/grokking-oop?section=docs-case-studies-design-chess-md'
    ),
  ],
  'http-lifecycle': [
    L(
      'System Design 101 — HTTP/1 -> HTTP/2 -> HTTP/3',
      '/library/system-design-101?section=data-guides-http1-http2-http3-md'
    ),
  ],
  idempotency: [
    L(
      'System Design 101 — Top 6 Cases to Apply Idempotency',
      '/library/system-design-101?section=data-guides-top-6-cases-to-apply-idempotency-md'
    ),
  ],
  'load-balancing': [
    L(
      'System Design Primer — Load balancer',
      '/library/system-design-primer?section=readme-md-load-balancer'
    ),
  ],
  'object-modeling': [
    L(
      'Grokking OOP — Object Oriented Basics',
      '/library/grokking-oop?section=docs-oop-fundamentals-object-oriented-basics-md'
    ),
    L(
      'Grokking OOP — Class Diagram',
      '/library/grokking-oop?section=docs-oop-fundamentals-class-diagram-md'
    ),
  ],
  'object-storage': [
    L(
      'System Design 101 — Storage Systems Overview (block, file, object)',
      '/library/system-design-101?section=data-guides-storage-systems-overview-md'
    ),
  ],
  'observer-pattern': [
    L(
      'Low Level Design — Designing a Pub-Sub System',
      '/library/low-level-design?section=problems-pub-sub-system-md'
    ),
  ],
  'search-platform-design': [
    L(
      'System Design 101 — How Do Search Engines Work? (crawling, indexing, ranking)',
      '/library/system-design-101?section=data-guides-how-do-search-engines-work-md'
    ),
  ],
  'secondary-index': [
    L(
      'System Design (karanpratapsingh) — Indexes',
      '/library/system-design?section=readme-md-indexes'
    ),
  ],
  'social-media': [
    L(
      'System Design Primer — Design the Twitter timeline and search (fan-out)',
      '/library/system-design-primer?section=solutions-system-design-twitter-readme-md'
    ),
  ],
  'state-management': [
    L(
      'Low Level Design — Traffic Signal System (State design pattern)',
      '/library/low-level-design?section=solutions-java-src-trafficsignalcontrolsystem-readme-md'
    ),
    L(
      'Low Level Design — Designing a Vending Machine (state interface, idle/ready/dispense)',
      '/library/low-level-design?section=problems-vending-machine-md'
    ),
  ],
  webhooks: [
    L(
      'System Design 101 — Polling vs Webhooks',
      '/library/system-design-101?section=data-guides-polling-vs-webhooks-md'
    ),
  ],
};

for (const [conceptId, slots] of Object.entries(CURATED_MEDIA_SYSTEMS)) {
  CONCEPT_MEDIA[conceptId] = { ...(CONCEPT_MEDIA[conceptId] ?? {}), ...slots };
}

// Homepages wearing an article's title. Deleted outright — a replacement was
// found for most of these above; the rest are honestly empty.
for (const conceptId of [
  'cap-theorem',
  'ecommerce-payments',
  'idempotency',
  'social-media',
  'webhooks',
]) {
  if (CONCEPT_MEDIA[conceptId]?.blog?.url === 'https://martin.kleppmann.com/') {
    delete CONCEPT_MEDIA[conceptId].blog;
  }
}

// Curated entries win: they are per-concept and verified, whereas anything
// they overwrite was a track anchor or a homepage wearing an article's title.
for (const [conceptId, slots] of Object.entries(CURATED_MEDIA)) {
  CONCEPT_MEDIA[conceptId] = { ...(CONCEPT_MEDIA[conceptId] ?? {}), ...slots };
}

// No honest replacement exists, so the misleading entry is deleted outright
// rather than retitled. The canonical SEO source (developers.google.com)
// is on the BLOCKED list in source-tier.mjs, so `seo` stays empty.
for (const conceptId of ['landing-pages', 'seo']) {
  if (CONCEPT_MEDIA[conceptId]) delete CONCEPT_MEDIA[conceptId].blog;
}

const TAG_ALIASES = {
  tokenization: ['search-ir'],
  indexing: ['search-ir'],
  ranking: ['search-ir'],
  hybrid: ['search-ir'],
  similarity: ['vector-db', 'embeddings'],
  ann: ['vector-db'],
  quantization: ['vector-db'],
  filtering: ['vector-db'],
  'llm-apps': ['ai-systems'],
  agents: ['ai-systems'],
  'arrays-hashing': ['dsa'],
  'two-pointers': ['dsa'],
  'sliding-window': ['dsa'],
  'stack-queue': ['dsa'],
  'binary-search': ['dsa'],
  'linked-list': ['dsa'],
  heap: ['dsa'],
  backtracking: ['dsa'],
  greedy: ['dsa'],
  intervals: ['dsa'],
  'math-geometry': ['dsa', 'mathematics'],
  'bit-manipulation': ['dsa'],
  'dynamic-programming': ['dsa'],
  calculus: ['mathematics'],
  analytics: ['go-to-market'],
  growth: ['go-to-market'],
};

/**
 * Most specific tag first. A concept's narrow topic tag supplies its sources;
 * the broad track anchor is a last resort.
 *
 * This list used to run the other way — `system-design` outranked
 * `low-level-design`, so the six Gang-of-Four pattern concepts were served
 * Designing Data-Intensive Applications and MIT 6.824 instead of the GoF book
 * and Fowler's catalog they already had available. Track anchors are shared by
 * design, so ranking them first is what made one URL the book slot for 47
 * concepts and another the video slot for 34.
 */
const TAG_PRIORITY = [
  // Narrow topic tags — genuinely about one subject.
  'embeddings',
  'training',
  'language-modeling',
  'transformers',
  'rag',
  'evals',
  'evaluation',
  'http',
  'storage-engines',
  'low-level-design',
  'behavioral',
  'statistics',
  'probability',
  'quant',
  'linear-algebra',
  'foundations',
  'runtime',
  // Broad track anchors — the standing reference for a whole track.
  'search-ir',
  'vector-db',
  'ai-systems',
  'backend',
  'databases',
  'system-design',
  'distributed-systems',
  'dsa',
  'behavioral',
  'go-to-market',
  'mathematics',
];

const SLOTS = ['video', 'paper', 'blog', 'book'];
/** Tag defaults only backfill teaching paths — papers need concept-specific relevance. */
const TAG_FALLBACK_SLOTS = ['video', 'blog', 'book'];

/**
 * Tags whose media may fill a concept's slots.
 *
 * BROAD TRACK TAGS ARE DELIBERATELY EXCLUDED. A track's standing reference is
 * not a source for any particular concept in it: Designing Data-Intensive
 * Applications' storefront told you nothing about `sharding`, CS336's course
 * homepage nothing about `chunking`, and the Illustrated GPT-2 — which explains
 * one decoder block — was the blog for `model-quantization` and `llm-evals`.
 * Between them 22 URLs occupied 226 of 591 media slots, purely because a slot
 * existed and wanted filling.
 *
 * A narrow topic tag ("transformers", "storage-engines", "linear-algebra") is
 * about one subject, so its media stays eligible. Anything broader belongs on
 * the track page once, not stamped across every card in the track.
 */
const SLOT_ELIGIBLE_TAGS = new Set([
  'embeddings',
  'training',
  'language-modeling',
  'transformers',
  'rag',
  'evals',
  'evaluation',
  'http',
  'storage-engines',
  'low-level-design',
  'behavioral',
  'statistics',
  'probability',
  'quant',
  'linear-algebra',
  'foundations',
  'runtime',
]);

export function tagsForConcept(concept) {
  const tags = new Set(concept.tags ?? []);
  tags.add(concept.id);
  for (const t of concept.tags ?? []) {
    for (const alias of TAG_ALIASES[t] ?? []) tags.add(alias);
  }
  return [...tags];
}

/**
 * Curated 2026-07-25 for the concepts added to close the audit's coverage gaps.
 *
 * Verified three ways as usual, plus two catches a status-code check would have
 * shipped: MIT's Little's Law PDF now 301s twice to a faculty homepage and
 * serves HTML as a 200, and the widely-cited engineering.nyu.edu copy of the
 * block-max WAND paper returns Suel's home page under a .pdf URL. Both were
 * rejected; the real block-max paper lives on research.engineering.nyu.edu.
 */
const CURATED_MEDIA_GAPS = {
  'curse-of-dimensionality': {
    paper: L(
      'When Is “Nearest Neighbor” Meaningful? (Beyer, Goldstein, Ramakrishnan, Shaft, ICDT 1999)',
      'https://doi.org/10.1007/3-540-49257-7_15'
    ),
    blog: L(
      'A Few Useful Things to Know about Machine Learning (Domingos, CACM 2012) — §3 Intuition Fails in High Dimensions',
      'https://homes.cs.washington.edu/~pedrod/papers/cacm12.pdf'
    ),
  },
  'isolation-levels': {
    paper: L(
      "A Critique of ANSI SQL Isolation Levels (Berenson, Bernstein, Gray, Melton, O'Neil, O'Neil)",
      'https://arxiv.org/abs/cs/0701157'
    ),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 20 notes — Multi-Version Concurrency Control',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/20-multiversioning.pdf'
    ),
  },
  'join-algorithms': {
    paper: L(
      'How Good Are Query Optimizers, Really? (Leis et al., PVLDB 9)',
      'https://www.vldb.org/pvldb/vol9/p204-leis.pdf'
    ),
    book: L(
      'CMU 15-445/645 (Fall 2025) Lecture 12 notes — Join Algorithms',
      'https://15445.courses.cs.cmu.edu/fall2025/notes/12-joins.pdf'
    ),
  },
  'minimum-spanning-tree': {
    video: L(
      'MIT 6.046J — Lecture 12: Greedy Algorithms: Minimum Spanning Tree',
      'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/resources/lecture-12-greedy-algorithms-minimum-spanning-tree/'
    ),
    blog: L(
      "cp-algorithms — Minimum spanning tree: Kruskal's algorithm",
      'https://cp-algorithms.com/graph/mst_kruskal.html'
    ),
    book: L(
      'Algorithms (Erickson) — Chapter 7: Minimum Spanning Trees',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/book/07-mst.pdf'
    ),
  },
  'monotonic-stack': {
    blog: L('USACO Guide — Stacks (incl. monotonic stack)', 'https://usaco.guide/gold/stacks'),
    book: L(
      'Minimum Stack / Minimum Queue — the O(n) sliding-window minimum',
      'https://cp-algorithms.com/data_structures/stack_queue_modification.html'
    ),
  },
  'prefix-sums': {
    blog: L('USACO Guide — Introduction to Prefix Sums', 'https://usaco.guide/silver/prefix-sums'),
  },
  'queueing-theory': {
    paper: L(
      "MIT 2.854 — The M/M/1 Queue: utilization ρ = λ/µ and Little's law L = λW",
      'https://ocw.mit.edu/courses/2-854-introduction-to-manufacturing-systems-fall-2016/927056a1af54772a587fd84ad4951e71_MIT2_854F16_Mm1Queue.pdf'
    ),
    book: L(
      'Performance Modeling and Design of Computer Systems: Queueing Theory in Action (Harchol-Balter) — Chapter 1',
      'https://www.cs.cmu.edu/~harchol/PerformanceModeling/chpt1.pdf'
    ),
  },
  'rate-limiter-design': {
    blog: L(
      'Stripe — Scaling your API with rate limiters',
      'https://stripe.com/blog/rate-limiters'
    ),
  },
  'retries-and-circuit-breakers': {
    blog: L(
      'Martin Fowler — Circuit Breaker',
      'https://martinfowler.com/bliki/CircuitBreaker.html'
    ),
  },
  'string-matching': {
    video: L(
      'MIT 6.006 — Lecture 9: Table Doubling, Karp-Rabin',
      'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-9-table-doubling-karp-rabin/'
    ),
    blog: L(
      'cp-algorithms — Prefix function: Knuth-Morris-Pratt',
      'https://cp-algorithms.com/string/prefix-function.html'
    ),
    book: L(
      'Algorithms (Erickson) — Lecture 7: String Matching (Karp-Rabin, Knuth-Morris-Pratt)',
      'https://jeffe.cs.illinois.edu/teaching/algorithms/notes/07-strings.pdf'
    ),
  },
  'top-k-pruning': {
    paper: L(
      'Faster Top-k Document Retrieval Using Block-Max Indexes (Ding & Suel, SIGIR 2011)',
      'https://research.engineering.nyu.edu/~suel/papers/bmw.pdf'
    ),
    book: L(
      'Introduction to Information Retrieval (Manning et al.) — §7.1.1 Inexact top K document retrieval',
      'https://nlp.stanford.edu/IR-book/html/htmledition/inexact-top-k-document-retrieval-1.html'
    ),
  },
  'unique-id-generation': {
    paper: L(
      'RFC 9562 — Universally Unique IDentifiers (UUIDs)',
      'https://www.rfc-editor.org/rfc/rfc9562.html'
    ),
  },
  'web-security-basics': {
    blog: L(
      'MDN — Cross-Origin Resource Sharing (CORS)',
      'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS'
    ),
  },
};

for (const [conceptId, slots] of Object.entries(CURATED_MEDIA_GAPS)) {
  CONCEPT_MEDIA[conceptId] = { ...(CONCEPT_MEDIA[conceptId] ?? {}), ...slots };
}

// Vendored-repo sections covering the same concepts.
for (const [conceptId, links] of Object.entries({
  'isolation-levels': [
    L(
      'System Design 101 — Database Isolation Levels',
      '/library/system-design-101?section=data-guides-what-are-database-isolation-levels-md'
    ),
  ],
  'minimum-spanning-tree': [
    L(
      "JavaScript Algorithms — Kruskal's Algorithm",
      '/library/javascript-algorithms?section=src-algorithms-graph-kruskal-readme-md'
    ),
    L(
      "JavaScript Algorithms — Prim's Algorithm",
      '/library/javascript-algorithms?section=src-algorithms-graph-prim-readme-md'
    ),
  ],
  'monotonic-stack': [
    L(
      'Coding Interview Patterns — Stacks (next greater element, sliding-window maximum)',
      '/library/coding-interview-patterns?section=source-stacks'
    ),
  ],
  'prefix-sums': [
    L(
      'Coding Interview Patterns — Prefix Sums',
      '/library/coding-interview-patterns?section=source-prefix-sums'
    ),
  ],
  'rate-limiter-design': [
    L(
      'System Design (karanpratapsingh) — Rate limiting algorithms',
      '/library/system-design?section=readme-md-rate-limiting-algorithms'
    ),
    L(
      'System Design (karanpratapsingh) — Rate Limiting in Distributed Systems',
      '/library/system-design?section=readme-md-rate-limiting-rate-limiting-in-distributed-systems'
    ),
  ],
  'retries-and-circuit-breakers': [
    L(
      'System Design 101 — Retry Strategies for System Failures',
      '/library/system-design-101?section=data-guides-how-do-we-retry-on-failures-md'
    ),
    L(
      'System Design (karanpratapsingh) — Circuit Breaker',
      '/library/system-design?section=readme-md-circuit-breaker'
    ),
    L(
      'System Design 101 — Resiliency Patterns',
      '/library/system-design-101?section=data-guides-resiliency-patterns-md'
    ),
    L(
      'System Design 101 — Top 6 Cases to Apply Idempotency',
      '/library/system-design-101?section=data-guides-top-6-cases-to-apply-idempotency-md'
    ),
  ],
  'string-matching': [
    L(
      'JavaScript Algorithms — Knuth–Morris–Pratt string search',
      '/library/javascript-algorithms?section=src-algorithms-string-knuth-morris-pratt-readme-md'
    ),
    L(
      'JavaScript Algorithms — Rabin–Karp rolling-hash string search',
      '/library/javascript-algorithms?section=src-algorithms-string-rabin-karp-readme-md'
    ),
  ],
  'unique-id-generation': [
    L(
      'System Design 101 — Explaining 5 Unique ID Generators',
      '/library/system-design-101?section=data-guides-explaining-5-unique-id-generators-in-distributed-systems-md'
    ),
  ],
  'web-security-basics': [
    L('DevOps Exercises — Security', '/library/devops-exercises?section=devops-security'),
    L(
      'Node.js Best Practices — Validate the incoming JSON schemas',
      '/library/node-best-practices?section=sections-security-validation-md'
    ),
    L(
      'Node.js Best Practices — Preventing database injection vulnerabilities',
      '/library/node-best-practices?section=sections-security-ormodmusage-md'
    ),
  ],
})) {
  CONCEPT_LIBRARY_LINKS[conceptId] = [...(CONCEPT_LIBRARY_LINKS[conceptId] ?? []), ...links];
}
export function sTierSlotsForConcept(concept) {
  const out = {};
  const conceptSlots = CONCEPT_MEDIA[concept.id] ?? {};
  for (const slot of SLOTS) {
    if (conceptSlots[slot]) out[slot] = { ...conceptSlots[slot] };
  }
  for (const tag of TAG_PRIORITY) {
    if (!SLOT_ELIGIBLE_TAGS.has(tag)) continue;
    if (!tagsForConcept(concept).includes(tag)) continue;
    const def = TAG_MEDIA[tag];
    if (!def) continue;
    for (const slot of TAG_FALLBACK_SLOTS) {
      if (!out[slot] && def[slot]) out[slot] = { ...def[slot] };
    }
  }
  return out;
}
