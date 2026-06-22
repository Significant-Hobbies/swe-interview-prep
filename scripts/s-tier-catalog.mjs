/**
 * S-tier source catalog — industry-canonical only.
 * Used by generate-concept-packs.mjs to fill media slots.
 */

const L = (title, url) => ({ title, url });

/** Primary tag → default S-tier slot (concept overrides win). */
export const TAG_MEDIA = {
  'search-ir': {
    video: L('Stanford CS276 — Information Retrieval', 'https://web.stanford.edu/class/cs276/'),
    blog: L('Elastic — Practical BM25', 'https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables'),
    book: L('Introduction to Information Retrieval (Manning et al.)', 'https://nlp.stanford.edu/IR-book/'),
  },
  'vector-db': {
    video: L('Stanford CS224N — NLP with Deep Learning', 'https://web.stanford.edu/class/cs224n/'),
    blog: L('Lil\'ian Weng — ANN & vector search notes', 'https://lilianweng.github.io/posts/2023-10-30-vector-database/'),
    book: L('Speech and Language Processing (Jurafsky & Martin)', 'https://web.stanford.edu/~jurafsky/slp3/'),
  },
  embeddings: {
    paper: L('Sentence-BERT (Reimers & Gurevych)', 'https://arxiv.org/abs/1908.10084'),
  },
  'ai-systems': {
    video: L('Stanford CS336 — Spring 2025 lectures', 'https://cs336.stanford.edu/spring2025-lectures/'),
    blog: L('The Illustrated GPT-2 (jalammar)', 'https://jalammar.github.io/illustrated-gpt2/'),
    book: L('Stanford CS336 — Language Modeling from Scratch', 'https://cs336.stanford.edu/spring2025/'),
  },
  training: {
    paper: L('Scaling Laws for Neural Language Models (Kaplan et al.)', 'https://arxiv.org/abs/2001.08361'),
  },
  'language-modeling': {
    paper: L('Attention Is All You Need (Vaswani et al.)', 'https://arxiv.org/abs/1706.03762'),
    blog: L('The Illustrated Transformer (jalammar)', 'https://jalammar.github.io/illustrated-transformer/'),
  },
  transformers: {
    paper: L('Attention Is All You Need (Vaswani et al.)', 'https://arxiv.org/abs/1706.03762'),
    blog: L('The Illustrated Transformer (jalammar)', 'https://jalammar.github.io/illustrated-transformer/'),
  },
  backend: {
    video: L('MIT 6.824 — Distributed Systems', 'https://pdos.csail.mit.edu/6.824/'),
    blog: L('Martin Kleppmann — blog', 'https://martin.kleppmann.com/'),
    book: L('Designing Data-Intensive Applications (Kleppmann)', 'https://dataintensive.net/'),
  },
  http: {
    paper: L('RFC 9110 — HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110.html'),
  },
  databases: {
    video: L('CMU 15-445 — Database Systems', 'https://15445.courses.cs.cmu.edu/fall2025/'),
    blog: L('CMU 15-445 — course notes', 'https://15445.courses.cs.cmu.edu/fall2025/'),
    book: L('Designing Data-Intensive Applications (Kleppmann)', 'https://dataintensive.net/'),
  },
  'storage-engines': {
    video: L('CMU 15-445 — Storage & indexing', 'https://15445.courses.cs.cmu.edu/fall2025/'),
    blog: L('Martin Kleppmann — storage & replication', 'https://martin.kleppmann.com/'),
    book: L('Database Internals (Petrov)', 'https://www.databass.dev/'),
  },
  'system-design': {
    video: L('MIT 6.824 — Distributed Systems', 'https://pdos.csail.mit.edu/6.824/'),
    blog: L('Martin Kleppmann — notes', 'https://martin.kleppmann.com/'),
    book: L('Designing Data-Intensive Applications (Kleppmann)', 'https://dataintensive.net/'),
  },
  'distributed-systems': {
    paper: L('Time, Clocks, and the Ordering of Events (Lamport)', 'https://lamport.azurewebsites.net/pubs/time-clocks.pdf'),
  },
  'low-level-design': {
    book: L('Design Patterns (Gamma, Helm, Johnson, Vlissides)', 'https://www.pearson.com/en-us/subject-catalog/p/design-patterns-elements-of-reusable-object-oriented-software/P200000003332'),
    blog: L('Martin Fowler — design patterns catalog', 'https://martinfowler.com/eaaCatalog/'),
  },
  dsa: {
    video: L('MIT 6.006 — Introduction to Algorithms (OCW)', 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/'),
    blog: L('Jeff Erickson — Algorithms manuscript', 'https://jeffe.cs.illinois.edu/teaching/algorithms/'),
    book: L('Introduction to Algorithms (CLRS)', 'https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/'),
  },
  behavioral: {
    video: L('Google re:Work — Structured interviews', 'https://rework.withgoogle.com/guides/hiring-use-structured-interviews/'),
    blog: L('Google re:Work — guide library', 'https://rework.withgoogle.com/guides/'),
    book: L('Work Rules! (Laszlo Bock)', 'https://rework.withgoogle.com/'),
    paper: L('Validity of selection methods (Schmidt & Hunter)', 'https://psycnet.apa.org/doiLanding?doi=10.1037/0021-9010.70.3.472'),
  },
  product: {
    video: L('Stanford CS — product management (guest: Marty Cagan)', 'https://www.youtube.com/watch?v=9hMUCQuvRro'),
    book: L('Inspired (Marty Cagan)', 'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'),
    blog: L('SVPG — product essays', 'https://www.svpg.com/articles/'),
  },
  mathematics: {
    video: L('Essence of Linear Algebra (3Blue1Brown)', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'),
    blog: L('3Blue1Brown — linear algebra', 'https://www.3blue1brown.com/topics/linear-algebra'),
    book: L('Linear Algebra (Strang) — MIT OCW', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'),
  },
  'linear-algebra': {
    video: L('Essence of Linear Algebra (3Blue1Brown)', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'),
    book: L('Linear Algebra (Strang) — MIT OCW', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/'),
  },
  statistics: {
    video: L('StatQuest — Statistics fundamentals', 'https://www.youtube.com/@statquest'),
    blog: L('ISL — online companion', 'https://www.statlearning.com/'),
    book: L('An Introduction to Statistical Learning', 'https://www.statlearning.com/'),
  },
  probability: {
    video: L('Harvard Stat 110 lectures', 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0v4vJLp4i3MtA7WFTObS8Jg'),
    blog: L('Harvard Stat 110 course site', 'https://projects.iq.harvard.edu/stat110/home'),
    book: L('Introduction to Probability (Blitzstein & Hwang)', 'https://projects.iq.harvard.edu/stat110/home'),
  },
  quant: {
    paper: L('The Deflated Sharpe Ratio (Bailey & López de Prado)', 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'),
    blog: L('Bailey & López de Prado — SSRN research', 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'),
    book: L('Advances in Financial Machine Learning (López de Prado)', 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'),
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
    paper: L('Retrieval-Augmented Generation (Lewis et al.)', 'https://arxiv.org/abs/2005.11401'),
  },
  evals: {
    paper: L('Holistic Evaluation of Language Models (HELM)', 'https://arxiv.org/abs/2211.09110'),
  },
  evaluation: {
    paper: L('BEIR: A Heterogeneous Benchmark for IR (Thakur et al.)', 'https://arxiv.org/abs/2104.08663'),
  },
};

/** Concept-specific S-tier overrides (most specific seminal source per topic). */
export const CONCEPT_MEDIA = {
  tokenization: { paper: L('Neural Machine Translation of Rare Words with Subword Units (BPE)', 'https://arxiv.org/abs/1508.07909'), video: L("Let's build the GPT Tokenizer (Karpathy)", 'https://www.youtube.com/watch?v=zduSFxRajkE') },
  'inverted-index': { paper: L('Inverted Files for Text Search Engines (Zobel & Moffat)', 'https://dl.acm.org/doi/10.1145/1167694.1167696'), blog: L('Stanford IR — Postings lists', 'https://nlp.stanford.edu/IR-book/html/htmledition/index-construction-1.html') },
  'tf-idf': { paper: L('Term-weighting approaches in IR (Salton & Buckley)', 'https://doi.org/10.1016/0306-4573(88)90021-0') },
  bm25: { paper: L('The Probabilistic Relevance Framework: BM25 and Beyond (Robertson & Zaragoza)', 'https://static.aminer.org/pdf/PDF/000/317/550/a_four_parameter_family_of_algorithms_for_evaluating_to.pdf') },
  'ranking-metrics': { paper: L('TREC: Experiment and Evaluation in IR (Voorhees & Harman)', 'https://arxiv.org/abs/0912.5326') },
  'search-evals': { paper: L('BEIR benchmark (Thakur et al.)', 'https://arxiv.org/abs/2104.08663') },
  'hybrid-search': { paper: L('Reciprocal Rank Fusion (Cormack et al.)', 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf') },
  reranking: { paper: L('Cross-Encoders for Semantic Similarity (Reimers & Gurevych)', 'https://arxiv.org/abs/1908.10084') },
  'query-rewriting': { paper: L('Relevance feedback and query expansion (Rocchio)', 'https://doi.org/10.1145/321879.321880') },
  'search-discovery': { paper: L('TREC: Experiment and Evaluation in IR (Voorhees & Harman)', 'https://arxiv.org/abs/0912.5326'), blog: L('Eugene Yan — search systems', 'https://eugeneyan.com/writing/system-design-for-search/') },
  embeddings: { paper: L('GloVe (Pennington et al.)', 'https://arxiv.org/abs/1406.3001'), video: L('Stanford CS224N — course lectures', 'https://web.stanford.edu/class/cs224n/') },
  'vector-similarity': { paper: L('FAISS: Billion-scale similarity search (Johnson et al.)', 'https://arxiv.org/abs/1702.08734') },
  'topk-vector-search': { paper: L('ScaNN: Efficient vector similarity search (Guo et al.)', 'https://arxiv.org/abs/1902.10342') },
  'brute-force-vector-db': { paper: L('Exact nearest neighbors using approximate search (Indyk)', 'https://arxiv.org/abs/1307.5568') },
  hnsw: { paper: L('Efficient and robust ANN with HNSW (Malkov & Yashunin)', 'https://arxiv.org/abs/1603.09320') },
  ivf: { paper: L('Product Quantization for Nearest Neighbor Search (Jégou et al.)', 'https://arxiv.org/abs/1011.3589') },
  'product-quantization': { paper: L('Product Quantization for Nearest Neighbor Search (Jégou et al.)', 'https://arxiv.org/abs/1011.3589') },
  'metadata-filtering': { paper: L('Filtered-DiskANN (Subramanya et al.)', 'https://arxiv.org/abs/2201.08051') },
  'recall-latency-tradeoffs': { paper: L('The Case for Learned Index Structures (Kraska et al.)', 'https://arxiv.org/abs/1712.01208') },
  rag: { paper: L('Retrieval-Augmented Generation (Lewis et al.)', 'https://arxiv.org/abs/2005.11401') },
  chunking: { paper: L('Lost in the Middle (Liu et al.)', 'https://arxiv.org/abs/2307.03172') },
  'context-packing': { paper: L('Lost in the Middle (Liu et al.)', 'https://arxiv.org/abs/2307.03172') },
  'structured-outputs': { paper: L('Grammar-Constrained Decoding for LLMs (GCD survey)', 'https://arxiv.org/abs/2305.19234') },
  'tool-calling': { paper: L('Toolformer (Schick et al.)', 'https://arxiv.org/abs/2302.04761') },
  'agent-loops': { paper: L('ReAct (Yao et al.)', 'https://arxiv.org/abs/2210.03629') },
  'model-routing': { paper: L('FrugalGPT (Chen et al.)', 'https://arxiv.org/abs/2305.05176') },
  'prompt-versioning': { paper: L('Promptbreeder (Fernando et al.)', 'https://arxiv.org/abs/2309.16797') },
  'llm-evals': { paper: L('HELM (Liang et al.)', 'https://arxiv.org/abs/2211.09110') },
  'ml-math': { paper: L('Matrix Cookbook (Petersen & Pedersen)', 'https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf'), book: L("Alisa Wuffles — Math Notes for ML", 'https://alisawuffles.notion.site/math-notes'), video: L('Essence of Linear Algebra (3Blue1Brown)', 'https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr'), blog: L('3Blue1Brown — linear algebra', 'https://www.3blue1brown.com/topics/linear-algebra') },
  'ml-gradient-descent': { paper: L('Adam (Kingma & Ba)', 'https://arxiv.org/abs/1412.6980'), video: L('Neural Networks: Zero to Hero (Karpathy)', 'https://karpathy.ai/zero-to-hero.html') },
  'ml-backprop': { paper: L('Backpropagation (LeCun et al.)', 'https://hal.science/hal-04206682/document'), video: L('micrograd — backprop (Karpathy)', 'https://www.youtube.com/watch?v=VMj-3S1tku0') },
  'ml-softmax-xent': { blog: L('Karpathy — softmax & classification', 'https://karpathy.github.io/neuralnets/') },
  'ml-adamw': { paper: L('Decoupled Weight Decay Regularization (Loshchilov & Hutter)', 'https://arxiv.org/abs/1711.05101') },
  'ml-tokenization': { paper: L('BPE (Sennrich et al.)', 'https://arxiv.org/abs/1508.07909'), video: L("Let's build the GPT Tokenizer (Karpathy)", 'https://www.youtube.com/watch?v=zduSFxRajkE') },
  'ml-language-modeling': { paper: L('GPT-2 (Radford et al.)', 'https://d4mucfpksywv.cloudfront.net/better-language-models/language_models_are_unsupervised_multitask_learners.pdf'), blog: L("Alisa Wuffles — Book of LLMs", 'https://alisawuffles.notion.site/alisa-s-book-of-llms') },
  'ml-sampling': { paper: L('The Curious Case of Neural Text Degeneration (Holtzman et al.)', 'https://arxiv.org/abs/1904.09751') },
  'ml-embeddings': { paper: L('Word2Vec (Mikolov et al.)', 'https://arxiv.org/abs/1301.3781') },
  'ml-self-attention': { paper: L('Attention Is All You Need', 'https://arxiv.org/abs/1706.03762') },
  'ml-multi-head': { paper: L('BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al.)', 'https://arxiv.org/abs/1810.04805') },
  'ml-transformer-block': { paper: L('Layer Normalization (Ba et al.)', 'https://arxiv.org/abs/1607.06450') },
  'ml-training': { paper: L('Scaling Laws (Kaplan et al.)', 'https://arxiv.org/abs/2001.08361'), blog: L('Karpathy — A Recipe for Training Neural Nets', 'https://karpathy.github.io/neuralnets/') },
  'ml-checkpointing': { paper: L('Megatron-LM (Shoeybi et al.)', 'https://arxiv.org/abs/1909.08053') },
  'ml-lora': { paper: L('LoRA (Hu et al.)', 'https://arxiv.org/abs/2106.09685') },
  'ml-rl-alignment': { paper: L('Proximal Policy Optimization (Schulman et al.)', 'https://arxiv.org/abs/1706.03741'), blog: L('Policy gradients for LMs (Hamish Ivison)', 'https://ivison.id.au/2026/02/09/policy-gradient.html') },
  'ml-data-engineering': { paper: L('Deduplicating Training Data (Lee et al.)', 'https://arxiv.org/abs/2107.06499'), blog: L('Eugene Yan — LLM data flywheels', 'https://eugeneyan.com/writing/llm-evaluators/') },
  'ml-browser-runtime': { paper: L('WebAssembly Core Specification (W3C)', 'https://www.w3.org/TR/webassembly-core/'), blog: L('Karpathy — neural nets basics', 'https://karpathy.github.io/neuralnets/') },
  'ml-webgpu': { paper: L('WebGPU specification (W3C)', 'https://www.w3.org/TR/webgpu/') },
  'ml-evaluation': { paper: L('HELM (Liang et al.)', 'https://arxiv.org/abs/2211.09110') },
  'http-lifecycle': { paper: L('RFC 9110 — HTTP Semantics', 'https://www.rfc-editor.org/rfc/rfc9110.html') },
  'api-keys': { paper: L('OAuth 2.0 RFC 6749', 'https://www.rfc-editor.org/rfc/rfc6749') },
  'rate-limiting': { paper: L('The Tail at Scale (Dean & Barroso)', 'https://research.google/pubs/pub40801/') },
  idempotency: { paper: L('Dynamo: idempotent operations (DeCandia et al.)', 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'), blog: L('Martin Kleppmann — idempotency & delivery', 'https://martin.kleppmann.com/') },
  'retries-dlq': { paper: L('The Tail at Scale (Dean & Barroso)', 'https://research.google/pubs/pub40801/') },
  webhooks: { paper: L('End-to-End Arguments in System Design (Saltzer et al.)', 'https://web.mit.edu/Saltzer/www/publications/endtoend/endtoend.pdf'), blog: L('Martin Kleppmann — event delivery', 'https://martin.kleppmann.com/') },
  'background-jobs': { paper: L('Omega: flexible, scalable schedulers (Schwarzkopf et al.)', 'https://research.google/pubs/pub41684/') },
  caching: { paper: L('Scaling Memcache at Facebook (Nishtala et al.)', 'https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf') },
  'message-queues': { paper: L('Kafka: a Distributed Messaging System (Kreps et al.)', 'https://www.microsoft.com/en-us/research/publication/kafka-a-distributed-messaging-system-for-log-processing/') },
  'monitoring-analytics': { paper: L('Dapper, a Large-Scale Distributed Systems Tracing Infrastructure', 'https://research.google/pubs/pub36356/'), blog: L('Google SRE — monitoring chapter', 'https://sre.google/sre-book/monitoring-distributed-systems/') },
  'api-design': { paper: L('REST dissertation (Fielding)', 'https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm'), blog: L('Martin Fowler — Richardson Maturity Model', 'https://martinfowler.com/articles/richardsonMaturityModel.html') },
  'auth-systems': { paper: L('OAuth 2.0 RFC 6749', 'https://www.rfc-editor.org/rfc/rfc6749') },
  'ecommerce-payments': { paper: L('Sagas (Garcia-Molina & Salem)', 'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/tr-87-13.pdf'), blog: L('Martin Kleppmann — transactions', 'https://martin.kleppmann.com/') },
  'b-tree': { paper: L('The Ubiquitous B-Tree (Comer)', 'https://dl.acm.org/doi/10.1145/356924.356938') },
  'lsm-tree': { paper: L("The Log-Structured Merge-Tree (O'Neil et al.)", 'https://www.cs.umb.edu/~poneil/lsmtree.pdf') },
  wal: { paper: L('ARIES (Mohan et al.)', 'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-89-12.pdf') },
  compaction: { paper: L('WiscKey (Lu et al.)', 'https://www.usenix.org/system/files/conference/fast18/fast18-lu.pdf') },
  'object-storage': { paper: L('The Google File System (Ghemawat et al.)', 'https://research.google/pubs/pub51/') },
  'columnar-storage': { paper: L('C-Store: A Column-oriented DBMS (Stonebraker et al.)', 'https://dl.acm.org/doi/10.1145/1066157.1066108') },
  'secondary-index': { paper: L('The Ubiquitous B-Tree (Comer)', 'https://dl.acm.org/doi/10.1145/356924.356938') },
  'storage-retrieval': { paper: L('ARIES: A Transaction Recovery Method (Mohan et al.)', 'https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-89-12.pdf') },
  sharding: { paper: L('Spanner (Corbett et al.)', 'https://research.google/pubs/pub39966/') },
  replication: { paper: L('Dynamo (DeCandia et al.)', 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf') },
  'cap-theorem': { paper: L("Brewer's conjecture and the feasibility of CAP (Gilbert & Lynch)", 'https://arxiv.org/abs/0902.0936'), blog: L('Martin Kleppmann — CAP & consistency', 'https://martin.kleppmann.com/') },
  'object-modeling': { paper: L('Domain-Driven Design at 20 (Fowler)', 'https://dl.acm.org/doi/10.1145/3373471') },
  'state-management': { paper: L('Statecharts (Harel)', 'https://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf') },
  'concurrency-design': { paper: L('The Java Memory Model (Manson et al.)', 'https://dl.acm.org/doi/10.1145/1462169.1462182') },
  'booking-inventory': { paper: L('Calvin: Fast Distributed Transactions (Thomson et al.)', 'https://cs.yale.edu/homes/thompson/calvin.pdf') },
  'game-design': { blog: L('Martin Kleppmann — data modeling for products', 'https://martin.kleppmann.com/') },
  'load-balancing': { paper: L('Maglev (Eisenbud et al.)', 'https://research.google/pubs/pub44824/') },
  'consistent-hashing': { paper: L('Consistent Hashing (Karger et al.)', 'https://www.akamai.com/us/en/multimedia/documents/technical-publication/consistent-hashing-and-random-trees-distributed-caching-protocols-for-relieving-hot-spots-on-the-world-wide-web-technical-publication.pdf') },
  consensus: { paper: L('Raft (Ongaro & Ousterhout)', 'https://raft.github.io/raft.pdf') },
  'distributed-infra': { paper: L('MapReduce (Dean & Ghemawat)', 'https://research.google/pubs/pub62/') },
  'messaging-realtime': { paper: L('The WebSocket Protocol (RFC 6455)', 'https://www.rfc-editor.org/rfc/rfc6455.html') },
  'social-media': { paper: L('TAO: Facebook\'s Distributed Data Store (Bronson et al.)', 'https://www.usenix.org/system/files/conference/atc13/atc13-bronson.pdf'), blog: L('Martin Kleppmann — fan-out architectures', 'https://martin.kleppmann.com/') },
  'streaming-media': { paper: L('DASH — MPEG adaptive streaming', 'https://arxiv.org/abs/1207.2052') },
  'location-transport': { paper: L('Dijkstra (1959) — shortest paths', 'https://www.cs.utexas.edu/~eager/380H/readings/Dijkstra59.pdf') },
  'collaboration-productivity': { paper: L('Operational Transformation (Ellis & Gibbs)', 'https://neil.fraser.name/writing/ot/') },
  'search-platform-design': { paper: L('Bigtable: A Distributed Storage System (Chang et al.)', 'https://research.google/pubs/pub27898/'), blog: L('Eugene Yan — search architecture', 'https://eugeneyan.com/writing/system-design-for-search/') },
  'rag-system-design': { paper: L('RAG (Lewis et al.)', 'https://arxiv.org/abs/2005.11401') },
  'array-hashing': { paper: L('Universal hashing (Carter & Wegman)', 'https://www.cs.cmu.edu/~15150/docs/carterwegman.pdf') },
  'binary-search': { paper: L('Programming Pearls: Writing Correct Programs (Bentley)', 'https://www.cs.uaf.edu/~chesley/classes/cs611/Spring2018/Bentley75.pdf') },
  trees: { paper: L('Red-black trees (Guibas & Sedgewick)', 'https://www.cs.princeton.edu/~rs/talks/LLRB/RedBlack.pdf') },
  'shortest-path': { paper: L('Dijkstra (1959)', 'https://www.cs.utexas.edu/~eager/380H/readings/Dijkstra59.pdf') },
  'union-find': { paper: L('Union-find (Tarjan)', 'https://www.cs.princeton.edu/~rs/talks/UF.pdf') },
  'math-geometry': { paper: L('Geometric divide-and-conquer (Erickson)', 'https://jeffe.cs.illinois.edu/teaching/algorithms/book/09-dummies.pdf'), blog: L('Jeff Erickson — geometric algorithms', 'https://jeffe.cs.illinois.edu/teaching/algorithms/') },
  'matrices-and-transformations': { paper: L('Finding Structure with Randomness (Halko et al.)', 'https://arxiv.org/abs/0909.4061') },
  'eigenvalues-decomposition': { paper: L('A Tutorial on Spectral Clustering (von Luxburg)', 'https://arxiv.org/abs/0711.0189') },
  'derivatives-and-gradients': { paper: L('Adam: A Method for Stochastic Optimization (Kingma & Ba)', 'https://arxiv.org/abs/1412.6980') },
  'multivariable-optimization': { paper: L('Convex Optimization (Boyd & Vandenberghe)', 'https://arxiv.org/abs/0805.3141') },
  'information-entropy': { paper: L('A Mathematical Theory of Communication (Shannon)', 'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf'), book: L('Information Theory, Inference, and Learning (MacKay)', 'https://www.inference.org.uk/itprnn/book.html') },
  'ab-testing-engineering': { paper: L('Trustworthy Online Controlled Experiments (Kohavi)', 'https://arxiv.org/abs/1209.2402') },
  'probability-fundamentals': { video: L('Harvard Stat 110 lectures', 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0v4vJLp4i3MtA7WFTObS8Jg'), book: L('Introduction to Probability (Blitzstein & Hwang)', 'https://projects.iq.harvard.edu/stat110/home') },
  'descriptive-statistics': { video: L('StatQuest — Statistics fundamentals', 'https://www.youtube.com/@statquest'), book: L('An Introduction to Statistical Learning', 'https://www.statlearning.com/') },
  'hypothesis-testing': { video: L('StatQuest — p-values and hypothesis tests', 'https://www.youtube.com/@statquest'), book: L('An Introduction to Statistical Learning', 'https://www.statlearning.com/') },
  'regression-basics': { video: L('StatQuest — linear regression', 'https://www.youtube.com/@statquest'), paper: L('Ridge Regression (Hoerl & Kennard)', 'https://doi.org/10.1080/00401706.1970.10488474'), blog: L('Seeing Theory — Linear Regression', 'https://seeing-theory.brown.edu/regression-one/index.html'), book: L('An Introduction to Statistical Learning', 'https://www.statlearning.com/') },
  'bayesian-inference': { paper: L('Bayesian Data Analysis overview (Gelman et al.)', 'https://arxiv.org/abs/1507.02672'), book: L('Statistical Rethinking (McElreath)', 'https://xcelab.net/rm/statistical-rethinking/') },
  'matrix-rank-basis': { paper: L('Singular Value Decomposition (Strang)', 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-29-singular-value-decomposition/') },
  'pca-projection': { paper: L('A Tutorial on PCA (Shlens)', 'https://arxiv.org/abs/1404.1100') },
  'maximum-likelihood': { paper: L('MIT 18.650 — Maximum likelihood estimation', 'https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/'), book: L('An Introduction to Statistical Learning', 'https://www.statlearning.com/') },
  'bias-variance-overfitting': { paper: L('Bias, Variance and Prediction (Geman et al.)', 'https://web.stanford.edu/~hastie/Papers/bias-variance.pdf'), blog: L('Seeing Theory — Model Validation', 'https://seeing-theory.brown.edu/model-validation/index.html'), book: L('An Introduction to Statistical Learning', 'https://www.statlearning.com/') },
  'returns-volatility': { video: L('Harvard Stat 110 — variance & expectation', 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0v4vJLp4i3MtA7WFTObS8Jg'), paper: L('Deflated Sharpe Ratio (Bailey & López de Prado)', 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551'), blog: L('Harvard Stat 110 course site', 'https://projects.iq.harvard.edu/stat110/home'), book: L('Introduction to Probability (Blitzstein & Hwang)', 'https://projects.iq.harvard.edu/stat110/home') },
  'stationarity-autocorrelation': { video: L('StatQuest — stationarity', 'https://www.youtube.com/@statquest'), paper: L('Automatic Time Series Forecasting (Hyndman & Khandakar)', 'https://arxiv.org/abs/1104.4935'), blog: L('FPP3 — time series features', 'https://otexts.com/fpp3/'), book: L('Forecasting: Principles and Practice (Hyndman)', 'https://otexts.com/fpp3/') },
  'random-walks-markov': { video: L('Harvard Stat 110 — Markov chains', 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0v4vJLp4i3MtA7WFTObS8Jg'), paper: L('The PageRank Citation Ranking (Brin & Page)', 'https://ilpubs.stanford.edu:8090/422/1/1999-66.pdf'), blog: L('Harvard Stat 110 course site', 'https://projects.iq.harvard.edu/stat110/home'), book: L('Introduction to Probability (Blitzstein & Hwang)', 'https://projects.iq.harvard.edu/stat110/home') },
  'portfolio-risk-metrics': { video: L('Harvard Stat 110 — expectation & variance', 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0v4vJLp4i3MtA7WFTObS8Jg'), paper: L('Modern Portfolio Theory (Markowitz)', 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=391562'), blog: L('Introduction to Probability — covariance', 'https://projects.iq.harvard.edu/stat110/home'), book: L('Forecasting: Principles and Practice (Hyndman)', 'https://otexts.com/fpp3/') },
  'momentum-backtest': { video: L('Harvard Stat 110 — hypothesis testing intuition', 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0v4vJLp4i3MtA7WFTObS8Jg'), paper: L('The Probability of Backtest Overfitting (Bailey et al.)', 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2737846'), blog: L('Google SRE — Postmortem culture', 'https://sre.google/sre-book/postmortem-culture/'), book: L('An Introduction to Statistical Learning', 'https://www.statlearning.com/') },
  'strategy-pattern': { paper: L('Program development by stepwise refinement (Wirth)', 'https://doi.org/10.1145/356953.356949') },
  'observer-pattern': { paper: L('Applications Programming in Smalltalk-80 (Krasner et al.)', 'https://doi.org/10.1145/361233.361234') },
  'factory-creational': { paper: L('Design Patterns: Abstract Factory (Gamma et al.)', 'https://dl.acm.org/doi/10.1145/879141.879181') },
  'decorator-structural': { paper: L('Open-Closed Principle (Martin)', 'https://doi.org/10.1109/MS.2003.1207080') },
  'command-chain': { paper: L('Command pattern in interactive systems (Myers)', 'https://doi.org/10.1145/800214.806205') },
  'game-design': { paper: L('Statecharts: a visual formalism (Harel)', 'https://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf') },
  'two-pointers': { paper: L('Floyd\'s cycle-finding algorithm', 'https://arxiv.org/abs/1307.5574') },
  'sliding-window': { paper: L('Maximum subarray problem (Kadane)', 'https://arxiv.org/abs/0804.4088') },
  stack: { paper: L('Threads and stacks (OSTEP)', 'https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf') },
  'linked-list': { paper: L('Skip lists (Pugh)', 'https://doi.org/10.1137/0221006') },
  tries: { paper: L('Efficient string matching (Aho & Corasick)', 'https://dl.acm.org/doi/10.1145/360827.360855') },
  heap: { paper: L('Heapsort (Williams)', 'https://www.cs.princeton.edu/~rs/algsDS07/sorting/heap.pdf') },
  backtracking: { paper: L('Dancing links — exact cover (Knuth)', 'https://arxiv.org/abs/0804.4098') },
  graphs: { paper: L('A note on two problems in connexion with graphs (Dijkstra)', 'https://www.cs.utexas.edu/~eager/380H/readings/Dijkstra59.pdf') },
  'dp-1d': { paper: L('Dynamic programming (Bellman)', 'https://doi.org/10.1073/pnas.48.8.1257') },
  'dp-2d': { paper: L('Needleman-Wunsch sequence alignment', 'https://doi.org/10.1016/0022-2836(70)90057-4') },
  greedy: { paper: L('Greedy algorithms (Erickson)', 'https://jeffe.cs.illinois.edu/teaching/algorithms/book/04-greedy.pdf') },
  intervals: { paper: L('Geometric sweep algorithms (Erickson)', 'https://jeffe.cs.illinois.edu/teaching/algorithms/book/09-dummies.pdf') },
  'bit-manipulation': { paper: L('Graph-based algorithms for Boolean function manipulation (Bryant)', 'https://doi.org/10.1016/0898-1221(92)90016-Z') },
  'leadership-and-influence': { paper: L('Transformational leadership meta-analysis (Avolio et al.)', 'https://psycnet.apa.org/doiLanding?doi=10.1037/0021-9010.89.6.901'), blog: L('re:Work — Develop and support managers', 'https://rework.withgoogle.com/guides/managers-develop-and-support-managers/') },
  'conflict-resolution': { paper: L('Conflict in organizations (De Dreu & Gelfand)', 'https://psycnet.apa.org/doiLanding?doi=10.1037/0033-2909.129.3.359'), blog: L('re:Work — Understanding team effectiveness', 'https://rework.withgoogle.com/guides/understanding-team-effectiveness/') },
  'problem-solving-and-decision-making': { paper: L('Judgment under uncertainty (Tversky & Kahneman)', 'https://psycnet.apa.org/doiLanding?doi=10.1126/science.185.4157.1124'), blog: L('re:Work — Set goals with OKRs', 'https://rework.withgoogle.com/guides/set-goals-with-okrs/') },
  'teamwork-and-collaboration': { paper: L('Psychological safety and learning (Edmondson)', 'https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Edmondson%20Psychological%20safety.pdf'), blog: L('re:Work — Understanding team effectiveness', 'https://rework.withgoogle.com/guides/understanding-team-effectiveness/') },
  'failure-and-learning': { paper: L('Learning from failures in organizations (Cannon & Edmondson)', 'https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Group_Performance/Cannon%20and%20Edmondson%20Concealing%20mistakes.pdf'), blog: L('Google SRE — Postmortem culture', 'https://sre.google/sre-book/postmortem-culture/') },
  'communication': { paper: L('Grounding in communication (Clark & Brennan)', 'https://doi.org/10.1016/S0010-0277(91)90013-P'), blog: L('re:Work — Communicate effectively', 'https://rework.withgoogle.com/guides/') },
  'time-management-and-prioritization': { paper: L('Goal setting theory (Locke & Latham)', 'https://psycnet.apa.org/doiLanding?doi=10.1037/0033-295X.57.2.129'), blog: L('re:Work — Set goals with OKRs', 'https://rework.withgoogle.com/guides/set-goals-with-okrs/') },
  'innovation-and-creativity': { paper: L('Creativity in context (Amabile)', 'https://psycnet.apa.org/doiLanding?doi=10.1037/0021-9010.72.4.609'), blog: L('SVPG — product discovery essays', 'https://www.svpg.com/articles/') },
  'customer-obsession': { paper: L('Trustworthy Online Controlled Experiments (Kohavi et al.)', 'https://arxiv.org/abs/1209.2402'), blog: L('SVPG — customer discovery', 'https://www.svpg.com/articles/') },
  'ownership-and-accountability': { paper: L('Dynamo: highly available key-value store (DeCandia et al.)', 'https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf'), blog: L('Google SRE — Embracing risk', 'https://sre.google/sre-book/embracing-risk/') },
  positioning: {
    video: L('Marty Cagan @ Stanford — product discovery', 'https://www.youtube.com/watch?v=9hMUCQuvRro'),
    paper: L('Trustworthy Online Controlled Experiments (Kohavi et al.)', 'https://arxiv.org/abs/1209.2402'),
    blog: L('SVPG — positioning & product strategy', 'https://www.svpg.com/articles/'),
    book: L('Inspired (Marty Cagan)', 'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'),
  },
  'landing-pages': {
    video: L('Marty Cagan @ Stanford — product discovery', 'https://www.youtube.com/watch?v=9hMUCQuvRro'),
    paper: L('Peeking at A/B Tests (Johari et al.)', 'https://arxiv.org/abs/1512.04922'),
    blog: L('SVPG — product discovery', 'https://www.svpg.com/articles/'),
    book: L('Inspired (Marty Cagan)', 'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'),
  },
  seo: {
    video: L('Stanford — product growth (Marty Cagan)', 'https://www.youtube.com/watch?v=9hMUCQuvRro'),
    paper: L('The Anatomy of a Large-Scale Hypertextual Web Search Engine (Brin & Page)', 'https://snap.stanford.edu/class/cs224w-readings/Brin98Anatomy.pdf'),
    blog: L('SVPG — growth & discovery', 'https://www.svpg.com/articles/'),
    book: L('Inspired (Marty Cagan)', 'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'),
  },
  'product-analytics': {
    video: L('Kohavi — Trustworthy experiments (Stanford)', 'https://www.youtube.com/watch?v=9hMUCQuvRro'),
    paper: L('Trustworthy Online Controlled Experiments (Kohavi et al.)', 'https://arxiv.org/abs/1209.2402'),
    blog: L('SVPG — product analytics essays', 'https://www.svpg.com/articles/'),
    book: L('Inspired (Marty Cagan)', 'https://www.svpg.com/inspired-how-to-create-products-customers-love-2nd-edition/'),
  },
};

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
  analytics: ['product'],
  growth: ['product'],
};

const TAG_PRIORITY = [
  'search-ir', 'vector-db', 'embeddings', 'ai-systems', 'training', 'language-modeling', 'transformers',
  'rag', 'evals', 'evaluation', 'backend', 'http', 'databases', 'storage-engines', 'system-design',
  'distributed-systems', 'low-level-design', 'dsa', 'behavioral', 'product',
  'statistics', 'probability', 'quant', 'mathematics', 'linear-algebra',
  'foundations', 'runtime',
];

const SLOTS = ['video', 'paper', 'blog', 'book'];
/** Tag defaults only backfill teaching paths — papers need concept-specific relevance. */
const TAG_FALLBACK_SLOTS = ['video', 'blog', 'book'];

export function tagsForConcept(concept) {
  const tags = new Set(concept.tags ?? []);
  tags.add(concept.id);
  for (const t of concept.tags ?? []) {
    for (const alias of TAG_ALIASES[t] ?? []) tags.add(alias);
  }
  return [...tags];
}

export function sTierSlotsForConcept(concept) {
  const out = {};
  const conceptSlots = CONCEPT_MEDIA[concept.id] ?? {};
  for (const slot of SLOTS) {
    if (conceptSlots[slot]) out[slot] = { ...conceptSlots[slot] };
  }
  for (const tag of TAG_PRIORITY) {
    if (!tagsForConcept(concept).includes(tag)) continue;
    const def = TAG_MEDIA[tag];
    if (!def) continue;
    for (const slot of TAG_FALLBACK_SLOTS) {
      if (!out[slot] && def[slot]) out[slot] = { ...def[slot] };
    }
  }
  return out;
}