/** Node mirror of src/lib/sourceTier.ts for pack generation scripts. */

const BLOCKED = [
  /wikipedia\.org/i,
  /refactoring\.guru/i,
  /amazon\.com/i,
  /medium\.com/i,
  /leetcode\.com/i,
  /promptingguide\.ai/i,
  /hookdeck\.com/i,
  /amplitude\.com/i,
  /ahrefs\.com/i,
  /cp-algorithms\.com/i,
  /json-schema\.org/i,
  /ann-benchmarks\.com/i,
  /blogspot\.com/i,
  /tablegroup\.com/i,
  /gettingthingsdone\.com/i,
  /theleanstartup\.com/i,
  /heathbrothers\.com/i,
  /pramp\.com/i,
  /interviewbit\.com/i,
  /archive\.is/i,
  /star-history\.com/i,
  /weaviate\.io\/blog/i,
  /netflixtechblog\.com\/?$/i,
  /uber\.com\/blog\/engineering\/?$/i,
  /erlang-solutions\.com\/blog/i,
  /infoq\.com\/presentations/i,
  /developers\.google\.com\/search/i,
  /elastic\.co\/guide/i,
  /stripe\.com\/docs/i,
  /cloud\.google\.com\/apis\/design/i,
  /pytorch\.org\/tutorials/i,
  /github\.com\/google\/leveldb\/blob/i,
  /github\.com\/facebookresearch\/faiss\/wiki/i,
  /aprildunford\.com/i,
  /oreilly\.com\/library\/view\/head-first/i,
  /opensource\.zalando\.com/i,
];

const S_TIER_PUBLISHER =
  /arxiv\.org|stanford\.edu|mit\.edu|cmu\.edu|berkeley\.edu|harvard\.edu|princeton\.edu|washington\.edu|cornell\.edu|yale\.edu|caltech\.edu|ox\.ac\.uk|cam\.ac\.uk|ethz\.ch|epfl\.ch|inria\.fr|w3\.org/i;

const S_TIER_RESEARCH =
  /research\.google|usenix\.org|acm\.org|sigmod\.org|openreview\.net|doi\.org|lamport\.azurewebsites\.net|rfc-editor\.org|microsoft\.com\/en-us\/research|allthingsdistributed\.com|pdos\.csail\.mit\.edu|plg\.uwaterloo\.ca|cs\.utexas\.edu|cs\.princeton\.edu|cs\.umb\.edu|hal\.science|dl\.acm\.org|papers\.ssrn\.com|static\.aminer\.org/i;

const S_TIER_CANON_BOOK =
  /nlp\.stanford\.edu\/IR-book|dataintensive\.net|databass\.dev|deeplearningbook\.org|jeffe\.cs\.illinois\.edu|mitpress\.mit\.edu|ocw\.mit\.edu|statlearning\.com|web\.stanford\.edu\/~boyd\/cvxbook|inference\.org\.uk\/itprnn|projects\.iq\.harvard\.edu\/stat110|cs336\.stanford\.edu|cs231n\.github\.io|karpathy\.ai|web\.stanford\.edu\/~jurafsky\/slp3|pages\.cs\.wisc\.edu\/~remzi\/OSTEP|sre\.google\/sre-book|craftinginterpreters\.com|svpg\.com|rework\.withgoogle\.com|domainlanguage\.com|jcip\.net|seeing-theory\.brown\.edu|otexts\.com|xcelab\.net|algorithm-design-manual\.com|pearson\.com|alisawuffles\.notion\.site|15445\.courses\.cs\.cmu\.edu|web\.stanford\.edu\/class|pdos\.csail\.mit\.edu/i;

/** Canonical educational / research destinations valid for any slot. */
const S_TIER_CANON_ANY =
  /rework\.withgoogle\.com|psycnet\.apa\.org|eugeneyan\.com|sre\.google|statlearning\.com|cs231n\.github\.io|15445\.courses\.cs\.cmu\.edu|web\.stanford\.edu\/class|pdos\.csail\.mit\.edu|ocw\.mit\.edu|projects\.iq\.harvard\.edu|mitpress\.mit\.edu|infoq\.com\/articles|neil\.fraser\.name\/writing\/ot|db\.csail\.mit\.edu|ics\.uci\.edu\/~fielding|math\.uwaterloo\.ca\/~hwolkowi|3blue1brown\.com|algorithm-design-manual\.com|pearson\.com|jeffe\.cs\.illinois\.edu|svpg\.com|inference\.org\.uk|domainlanguage\.com|jcip\.net|dataintensive\.net|otexts\.com|xcelab\.net/i;

const S_TIER_CANON_BLOG =
  /karpathy\.github\.io|jalammar\.github\.io|eugeneyan\.com|martin\.kleppmann\.com|martinfowler\.com|danluu\.com|aphyr\.com|fgiesen\.com|blog\.cloudflare\.com|engineering\.fb\.com|openai\.com\/research|anthropic\.com\/research|lilianweng\.github\.io|colah\.github\.io|distill\.pub|infoq\.com\/articles\/cap-twelve-years|gitlostmurali\.com|ivison\.id\.au|nlp\.stanford\.edu\/IR-book\/html|elastic\.co\/blog\/practical-bm25|stripe\.com\/blog|neil\.fraser\.name\/writing\/ot/i;

const S_TIER_CANON_VIDEO =
  /youtube\.com\/(watch|playlist).*(3blue1brown|stanfordonline|MITOpenCourseWare|harvard|Karpathy|StatQuest|lexfridman)|3blue1brown\.com|cs336\.stanford\.edu.*lecture|ocw\.mit\.edu|karpathy\.ai/i;

const S_TIER_CANON_PAPER_EXT =
  /\.pdf(\?|#|$)|d4mucfpksywv\.cloudfront\.net|wisdom\.weizmann\.ac\.il|akamai\.com\/.*\.pdf|raft\.github\.io/i;

const S_TIER_YOUTUBE =
  /(3blue1brown|stanfordonline|MITOpenCourseWare|AndrejKarpathy|Karpathy|statquest|harvard|LexFridman|Stanford|CS224N|MartyCagan|svpg)/i;

const S_TIER_PINECONE = /pinecone\.io\/learn\/hnsw/i;

export function isSTierSource(title, url, slot) {
  const hay = `${title} ${url}`;
  if (BLOCKED.some((re) => re.test(url) || re.test(title))) return false;
  if (S_TIER_PINECONE.test(url)) return true;

  if (slot === 'paper' || !slot) {
    if (S_TIER_RESEARCH.test(url)) return true;
    if (S_TIER_CANON_PAPER_EXT.test(url)) return true;
    if (/^https:\/\/arxiv\.org\//i.test(url)) return true;
  }
  if (slot === 'book' || !slot) {
    if (S_TIER_CANON_BOOK.test(url)) return true;
  }
  if (slot === 'blog' || !slot) {
    if (S_TIER_CANON_BLOG.test(url)) return true;
  }
  if (slot === 'video' || !slot) {
    if (S_TIER_CANON_VIDEO.test(url)) return true;
    if (/youtube\.com|youtu\.be/i.test(url) && S_TIER_YOUTUBE.test(hay)) return true;
  }
  if (S_TIER_CANON_ANY.test(url)) return true;
  if (S_TIER_PUBLISHER.test(url)) return true;
  return false;
}
