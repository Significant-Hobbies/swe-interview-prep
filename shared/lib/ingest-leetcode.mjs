/**
 * LeetCode metadata → drill stubs (editorial, not auto-scheduled).
 * Maps topic tags via the same priority rules as src/lib/leetcode.ts.
 */

const TAG_TO_PATTERN = {
  array: 'array-hashing',
  'hash-table': 'array-hashing',
  string: 'array-hashing',
  'two-pointers': 'two-pointers',
  'three-sum': 'two-pointers',
  'sliding-window': 'sliding-window',
  stack: 'stack',
  'monotonic-stack': 'stack',
  'binary-search': 'binary-search',
  'linked-list': 'linked-list',
  tree: 'trees',
  'binary-tree': 'trees',
  'binary-search-tree': 'trees',
  'depth-first-search': 'trees',
  'breadth-first-search': 'trees',
  trie: 'tries',
  'heap-priority-queue': 'heap',
  backtracking: 'backtracking',
  graph: 'graphs',
  'topological-sort': 'graphs',
  'shortest-path': 'graphs',
  'union-find': 'graphs',
  'dynamic-programming': 'dp-1d',
  greedy: 'greedy',
  interval: 'intervals',
  'merge-intervals': 'intervals',
  'line-sweep': 'intervals',
  math: 'math-geometry',
  geometry: 'math-geometry',
  matrix: 'math-geometry',
  'bit-manipulation': 'bit-manipulation',
};

const TAG_PRIORITY = [
  'trie',
  'heap-priority-queue',
  'backtracking',
  'graph',
  'topological-sort',
  'union-find',
  'sliding-window',
  'binary-search',
  'linked-list',
  'tree',
  'binary-tree',
  'binary-search-tree',
  'dynamic-programming',
  'stack',
  'monotonic-stack',
  'two-pointers',
  'greedy',
  'bit-manipulation',
  'interval',
  'merge-intervals',
  'math',
  'geometry',
  'hash-table',
  'array',
  'string',
];

export function detectConceptId(tags) {
  if (!tags?.length) return 'array-hashing';
  for (const tag of TAG_PRIORITY) {
    if (tags.includes(tag) && TAG_TO_PATTERN[tag]) return TAG_TO_PATTERN[tag];
  }
  return 'array-hashing';
}

function difficultyToDrill(difficulty) {
  const d = String(difficulty || '').toLowerCase();
  if (d === 'easy') return 'intro';
  if (d === 'hard') return 'advanced';
  return 'core';
}

export function slugToDrillId(slug) {
  return `lc-${slug
    .replace(/[^a-z0-9-]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)}`;
}

export function buildDrillStub(question, slug) {
  const tags = question.topicTags?.map((t) => t.slug) || [];
  const conceptId = detectConceptId(tags);
  const title = question.title || slug;
  const difficulty = difficultyToDrill(question.difficulty);
  const leetcodeUrl = `https://leetcode.com/problems/${slug}/`;
  const leetcodeNumber = parseInt(question.questionId, 10) || 0;

  return {
    id: slugToDrillId(slug),
    title,
    conceptId,
    type: 'coding-problem',
    difficulty,
    prompt: `LeetCode #${leetcodeNumber || '?'} — ${title}. Solve on LeetCode, then implement here if you want it in your drill queue.\n\n${leetcodeUrl}`,
    expectedOutput: 'Pass all LeetCode test cases for this problem.',
    hints: [
      `Pattern hint: ${conceptId.replace(/-/g, ' ')}.`,
      'Start with brute force, then optimize time/space.',
      'Write down invariants before coding.',
    ],
    solutionNotes: `Imported from LeetCode metadata (${tags.join(', ') || 'untagged'}). Editorial solution not included — solve on site first.`,
    externalUrl: leetcodeUrl,
    leetcodeNumber,
    source: 'leetcode-metadata',
    testCases: [],
  };
}

export async function fetchLeetCodeQuestion(slug) {
  const query = {
    query: `query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        difficulty
        topicTags { slug }
        isPaidOnly
      }
    }`,
    variables: { titleSlug: slug },
  };

  const res = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  if (!res.ok) throw new Error(`LeetCode HTTP ${res.status}`);
  const data = await res.json();
  const q = data?.data?.question;
  if (!q) throw new Error(`Problem not found: ${slug}`);
  if (q.isPaidOnly) throw new Error(`Paid-only problem: ${slug}`);
  return q;
}

export function mergeDrillStubs(existingDrills, stubs, { dryRun = false } = {}) {
  const byId = new Map(existingDrills.map((d) => [d.id, d]));
  let added = 0;
  let skipped = 0;

  for (const stub of stubs) {
    if (byId.has(stub.id)) {
      skipped++;
      continue;
    }
    if (!dryRun) byId.set(stub.id, stub);
    added++;
  }

  return {
    drills: dryRun ? existingDrills : [...byId.values()],
    added,
    skipped,
  };
}
