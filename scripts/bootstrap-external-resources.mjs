#!/usr/bin/env node
/** Top up thin external-resource tags from concept curated links. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../src/data');
const extPath = path.join(dataDir, 'external-resources.json');
const concepts = JSON.parse(fs.readFileSync(path.join(dataDir, 'concepts.json'), 'utf8')).concepts;
const ext = JSON.parse(fs.readFileSync(extPath, 'utf8'));

const TARGET = 20;
const PRIORITY_TAGS = [
  'mathematics',
  'probability',
  'statistics',
  'quant',
  'search-ir',
  'vector-db',
];

function urlKey(r) {
  return r.url;
}

for (const tag of PRIORITY_TAGS) {
  ext.byTag[tag] ??= [];
  const seen = new Set(ext.byTag[tag].map(urlKey));

  for (const c of concepts) {
    if (!c.tags.includes(tag) && c.tags[0] !== tag) continue;
    for (const r of c.resources || []) {
      if (seen.has(r.url)) continue;
      ext.byTag[tag].push({
        title: r.title,
        url: r.url,
        type: r.type || 'article',
        source: 'concept-curated',
      });
      seen.add(r.url);
      if (ext.byTag[tag].length >= TARGET) break;
    }
    if (ext.byTag[tag].length >= TARGET) break;
  }

  // Pad with high-signal defaults if still thin
  const PAD = {
    mathematics: [
      {
        title: '3Blue1Brown — Essence of linear algebra',
        url: 'https://www.3blue1brown.com/topics/linear-algebra',
        type: 'video',
      },
      {
        title: 'Khan Academy — Linear algebra',
        url: 'https://www.khanacademy.org/math/linear-algebra',
        type: 'course',
      },
      {
        title: 'MIT OCW 18.06 Linear Algebra',
        url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
        type: 'course',
      },
      {
        title: 'Immersive Math — Linear algebra',
        url: 'http://immersivemath.com/ila/index.html',
        type: 'interactive',
      },
      {
        title: "Paul's Online Math Notes — Calculus",
        url: 'https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx',
        type: 'course',
      },
    ],
    statistics: [
      {
        title: 'Seeing Theory — Inference',
        url: 'https://seeing-theory.brown.edu/frequentist-inference/index.html',
        type: 'interactive',
      },
      {
        title: 'StatQuest — Statistics fundamentals',
        url: 'https://www.youtube.com/playlist?list=PLblh5Foop5femMEqsJO_hMLUvxjQmDtYr',
        type: 'video',
      },
      { title: 'OpenIntro Statistics', url: 'https://www.openintro.org/book/os/', type: 'book' },
    ],
    quant: [
      {
        title: 'QuantStart — Beginners',
        url: 'https://www.quantstart.com/articles/',
        type: 'article',
      },
      {
        title: 'Ernest Chan — Algorithmic Trading overview',
        url: 'https://www.amazon.com/Algorithmic-Trading-Winning-Strategies-Rationale/dp/1118460146',
        type: 'book',
      },
      {
        title: 'QuantConnect Learn',
        url: 'https://www.quantconnect.com/learning/',
        type: 'course',
      },
      {
        title: 'CFA Institute — Quantitative methods',
        url: 'https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/quantitative-methods',
        type: 'article',
      },
      {
        title: 'Python for Finance (Yves Hilpisch)',
        url: 'https://www.oreilly.com/library/view/python-for-finance/9781492024330/',
        type: 'book',
      },
      {
        title: 'Epchan — Quantitative Trading blog',
        url: 'https://epchan.blogspot.com/',
        type: 'article',
      },
      {
        title: 'Alpha Architect — Research posts',
        url: 'https://alphaarchitect.com/blog/',
        type: 'article',
      },
      {
        title: 'SSRN — Quantitative finance papers',
        url: 'https://www.ssrn.com/index.cfm/en/janda/',
        type: 'article',
      },
      {
        title: 'NBER — Asset pricing',
        url: 'https://www.nber.org/research/data/asset-pricing',
        type: 'article',
      },
      { title: 'Portfolio Visualizer', url: 'https://www.portfoliovisualizer.com/', type: 'tool' },
      { title: 'Quantpedia — Strategy summaries', url: 'https://quantpedia.com/', type: 'article' },
    ],
    probability: [
      {
        title: 'Seeing Theory — Probability',
        url: 'https://seeing-theory.brown.edu/',
        type: 'interactive',
      },
      {
        title: 'Blitzstein — Introduction to Probability (Harvard)',
        url: 'https://projects.iq.harvard.edu/stat110/home',
        type: 'course',
      },
      {
        title: 'MIT 6.041 Probabilistic Systems Analysis',
        url: 'https://ocw.mit.edu/courses/6-041-probabilistic-systems-analysis-and-applied-probability-fall-2010/',
        type: 'course',
      },
      {
        title: 'Khan Academy — Probability',
        url: 'https://www.khanacademy.org/math/statistics-probability/probability-library',
        type: 'course',
      },
      {
        title: 'Pishro-Nik — Introduction to Probability',
        url: 'https://www.probabilitycourse.com/',
        type: 'book',
      },
      {
        title: 'Harvard Stat 110 lectures (YouTube)',
        url: 'https://www.youtube.com/playlist?list=PL2SOU6wwxB0v4vJLp4i3MtA7WFTObS8Jg',
        type: 'video',
      },
      {
        title: 'Random variables — MIT OCW',
        url: 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/',
        type: 'course',
      },
      {
        title: 'Conditional probability interactive',
        url: 'https://setosa.io/ev/conditional-probability/',
        type: 'interactive',
      },
    ],
    'search-ir': [
      {
        title: 'Introduction to Information Retrieval (Manning et al.)',
        url: 'https://nlp.stanford.edu/IR-book/',
        type: 'book',
      },
      {
        title: 'Pinecone — Learn vector search',
        url: 'https://www.pinecone.io/learn/',
        type: 'article',
      },
      {
        title: 'Elastic — BM25 similarity',
        url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-similarity.html',
        type: 'docs',
      },
      {
        title: 'Lucene scoring',
        url: 'https://lucene.apache.org/core/core_9_0_0/core/org/apache/lucene/search/similarities/BM25Similarity.html',
        type: 'docs',
      },
      { title: 'BEIR benchmark', url: 'https://github.com/beir-cellar/beir', type: 'benchmark' },
      { title: 'Pyserini', url: 'https://github.com/castorini/pyserini', type: 'tool' },
      {
        title: 'Tantivy — Rust search',
        url: 'https://github.com/quickwit-oss/tantivy',
        type: 'tool',
      },
      {
        title: 'OpenSearch k-NN',
        url: 'https://opensearch.org/docs/latest/search-plugins/knn/index/',
        type: 'docs',
      },
    ],
    'vector-db': [
      { title: 'ANN Benchmarks', url: 'https://ann-benchmarks.com/', type: 'benchmark' },
      { title: 'Faiss wiki', url: 'https://github.com/facebookresearch/faiss/wiki', type: 'docs' },
      {
        title: 'HNSW paper (Malkov & Yashunin)',
        url: 'https://arxiv.org/abs/1603.09320',
        type: 'paper',
      },
      {
        title: 'Product quantization paper',
        url: 'https://arxiv.org/abs/1011.3589',
        type: 'paper',
      },
      { title: 'Milvus docs', url: 'https://milvus.io/docs', type: 'docs' },
      {
        title: 'Weaviate vector index guide',
        url: 'https://weaviate.io/developers/weaviate/concepts/vector-index',
        type: 'docs',
      },
      {
        title: 'Qdrant — HNSW configuration',
        url: 'https://qdrant.tech/documentation/concepts/indexing/',
        type: 'docs',
      },
      { title: 'Chroma docs', url: 'https://docs.trychroma.com/', type: 'docs' },
      { title: 'pgvector', url: 'https://github.com/pgvector/pgvector', type: 'tool' },
    ],
  };

  for (const r of PAD[tag] || []) {
    if (ext.byTag[tag].length >= TARGET) break;
    if (seen.has(r.url)) continue;
    ext.byTag[tag].push({ ...r, source: 'curated-pad' });
    seen.add(r.url);
  }
}

fs.writeFileSync(extPath, `${JSON.stringify(ext, null, 2)}\n`);
const counts = Object.fromEntries(PRIORITY_TAGS.map((t) => [t, ext.byTag[t]?.length ?? 0]));
console.log('External resource counts:', counts);
