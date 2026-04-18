/**
 * Pure-logic alternatives to AI-driven endpoints. No network, no LLM.
 */

import { decayConfidence } from './fsrs.mjs';

const TASK_TYPES = ['build', 'review', 'read', 'explain'];

/**
 * Pick today's concept + task. Greedy: weakest decayed-confidence concept whose
 * prereqs are at acceptable mastery. Falls back to lowest-prereq untouched
 * concept if no weak ones exist.
 */
export function pickDailyConcept(concepts, masteryRows, dayOfYear = new Date()) {
  const now = new Date();
  const masteryMap = {};
  for (const m of masteryRows) {
    masteryMap[m.concept_id] = {
      ...m,
      confidence: decayConfidence(m, now),
    };
  }

  const prereqsMet = (c) =>
    (c.prereqs || []).every(p => {
      const m = masteryMap[p];
      // Prereq met if confidence >= 0.4 OR if prereq itself has no mastery yet
      // (don't gate behind untouched chains)
      return !m || m.confidence >= 0.4;
    });

  // Score each concept. Lower is "more urgent".
  const scored = concepts
    .filter(prereqsMet)
    .map(c => {
      const m = masteryMap[c.id];
      const conf = m?.confidence ?? null;
      // untouched = 0.5 (medium urgency); rotting = low confidence (high urgency)
      const urgency = conf === null ? 0.5 : conf;
      return { concept: c, conf, urgency };
    })
    .sort((a, b) => a.urgency - b.urgency);

  if (scored.length === 0) return null;

  const pick = scored[0];
  const c = pick.concept;
  const conf = pick.conf;
  const day = dayOfYear instanceof Date
    ? Math.floor((dayOfYear - new Date(dayOfYear.getFullYear(), 0, 0)) / 86400000)
    : dayOfYear;
  const taskType = TASK_TYPES[day % TASK_TYPES.length];

  const prompts = {
    build: `Implement ${c.name} from scratch. No reference. Aim for a tested, idiomatic solution.`,
    review: `Recall the key API/properties of ${c.name}. Rewrite a small example. Identify one edge case you've missed before.`,
    read: `Read the pinned library section on ${c.name}. Then write 3 questions a senior would ask in an interview.`,
    explain: `Open Companion. Have it grill you on ${c.name} — tradeoffs, complexity, when NOT to use it.`,
  };

  const headline = conf === null
    ? `Untouched: ${c.name}. Time to build a baseline.`
    : conf < 0.3
      ? `Rotting fast: ${c.name} (${Math.round(conf * 100)}%). Reset before it's gone.`
      : conf < 0.6
        ? `Refresh: ${c.name} (${Math.round(conf * 100)}%). One more rep keeps it sticky.`
        : `Push: ${c.name}. Already strong — go for the harder application.`;

  const minutes = taskType === 'build' ? 30 : taskType === 'read' ? 20 : 15;

  return {
    headline,
    concept_id: c.id,
    concept_name: c.name,
    task_type: taskType,
    task_prompt: prompts[taskType],
    minutes,
    rationale: conf === null
      ? `${c.category.toUpperCase()} concept, prereqs satisfied, no prior reps logged.`
      : `Decayed to ${Math.round(conf * 100)}% confidence — highest-leverage gap among ${concepts.length} tracked concepts.`,
    generator: 'heuristic',
  };
}

const CONCEPT_KEYWORDS = {
  'array-hashing': [/\b(map|hashmap|hashtable|set|hashset|frequency|counter)\b/i, /\bnew\s+(map|set)\b/i],
  'two-pointers': [/\b(left|right)\s*=/i, /two[\s-]?pointer/i],
  'sliding-window': [/sliding[\s-]?window/i, /\bwindow\b/i],
  'stack': [/\bstack\b/i, /\.push\(.*\)\s*\.pop/i, /monotonic/i],
  'binary-search': [/binary[\s-]?search/i, /\b(low|high)\s*=/i, /\bmid\s*=/i],
  'linked-list': [/linkedlist/i, /\.next\b/i, /listnode/i],
  'trees': [/\btree\b/i, /\b(left|right)\s*:/i, /treenode/i, /\bdfs\b/i, /\bbfs\b/i],
  'tries': [/\btrie\b/i, /prefix[\s-]?tree/i],
  'heap': [/\bheap\b/i, /priorityqueue/i, /minheap|maxheap/i],
  'backtracking': [/backtrack/i, /\brecurse\b/i],
  'graphs': [/\bgraph\b/i, /adjacency/i, /\bedges?\b/i, /\bnodes?\b/i],
  'dp-1d': [/dp\[/i, /memo\[/i, /memoiz/i, /dynamic programming/i],
  'dp-2d': [/dp\[\w+\]\[\w+\]/i, /grid.*dp/i],
  'greedy': [/\bgreedy\b/i],
  'intervals': [/intervals?/i, /merge.*interval/i, /sweep/i],
  'bit-manipulation': [/\bbitwise\b/i, /\b(<<|>>|\^|&|\|)\b/, /bitcount/i],
  'concurrency-design': [/\b(mutex|lock|semaphore|thread|goroutine|sync\.)\b/i, /\bawait\b/i, /\bchannel\b/i],
  'caching': [/\bcache\b/i, /\bttl\b/i, /lru/i, /lfu/i],
  'rate-limiting': [/rate[\s-]?limit/i, /token[\s-]?bucket/i, /leaky[\s-]?bucket/i],
  'state-management': [/state[\s-]?machine/i, /\b(transition|state)\s*:/i],
  'observer-pattern': [/\b(observer|subscribe|publish|emit|on\(|off\()\b/i, /pub[\s-]?sub/i],
  'strategy-pattern': [/\bstrategy\b/i, /interface\s+\w+Strategy/i],
  'factory-creational': [/\bfactory\b/i, /\bbuilder\b/i, /singleton/i],
  'auth-systems': [/\b(jwt|oauth|bearer|session|rbac)\b/i, /authentication|authorization/i],
  'api-design': [/\b(rest|grpc|endpoint|route)\b/i, /pagination/i],
  'message-queues': [/\b(kafka|rabbitmq|sqs|queue)\b/i, /pub[\s-]?sub/i],
};

/**
 * Tag concepts in code via regex match. Returns array of {concept_id, evidence, depth}.
 * "depth" inferred from match count: 1=surface, 2-3=working, 4+=deep.
 */
export function tagConcepts(code, language = '', maxResults = 5) {
  if (!code || code.length < 30) return [];
  const hits = [];
  for (const [conceptId, patterns] of Object.entries(CONCEPT_KEYWORDS)) {
    let count = 0;
    let evidence = '';
    for (const re of patterns) {
      const matches = code.match(new RegExp(re.source, re.flags + (re.flags.includes('g') ? '' : 'g'))) || [];
      if (matches.length > 0 && !evidence) evidence = matches[0].slice(0, 60);
      count += matches.length;
    }
    if (count > 0) {
      const depth = count >= 4 ? 'deep' : count >= 2 ? 'working' : 'surface';
      hits.push({ concept_id: conceptId, evidence, depth, count });
    }
  }
  return hits.sort((a, b) => b.count - a.count).slice(0, maxResults).map(({ count, ...h }) => h);
}

/**
 * Build a weekly review from raw activity + mastery data. No AI.
 */
export function buildWeeklyReport({ activity, mastery, feynman, concepts }) {
  const now = new Date();
  const minutes = Math.round(activity.reduce((s, a) => s + (a.duration_ms || 0), 0) / 60000);
  const sessions = activity.length;
  const grades = feynman.map(f => f.grade).filter(g => g != null);
  const avgGrade = grades.length ? Math.round(grades.reduce((a, b) => a + b, 0) / grades.length) : null;

  const conceptIndex = Object.fromEntries(concepts.map(c => [c.id, c]));
  const masteryEnriched = mastery.map(m => ({
    ...m,
    confidence: decayConfidence(m, now),
    name: conceptIndex[m.concept_id]?.name || m.concept_id,
    category: conceptIndex[m.concept_id]?.category || '?',
  }));

  const rotting = masteryEnriched
    .filter(m => m.confidence > 0 && m.confidence < 0.5)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5);

  const strong = masteryEnriched
    .filter(m => m.confidence >= 0.85)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  const touchedThisWeek = new Set();
  for (const a of activity) {
    if (a.concept_ids) {
      for (const cid of a.concept_ids) touchedThisWeek.add(cid);
    }
  }

  const categoryCount = {};
  for (const cid of touchedThisWeek) {
    const cat = conceptIndex[cid]?.category;
    if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }
  const avoided = ['dsa', 'lld', 'hld', 'behavioral'].filter(c => !categoryCount[c]);

  const lines = [];
  lines.push('## Reality Check');
  lines.push(`- ${sessions} sessions · ${minutes} active minutes · ${feynman.length} explain-backs (avg ${avgGrade ?? '—'}/100)`);
  lines.push(`- Touched ${touchedThisWeek.size} concepts across ${Object.keys(categoryCount).length} categories`);
  lines.push('');
  lines.push("## What's Rotting");
  if (rotting.length === 0) {
    lines.push('- Nothing actively rotting. Either you reviewed well or you barely touched anything.');
  } else {
    for (const r of rotting) {
      lines.push(`- **${r.name}** (${r.category}) — ${Math.round(r.confidence * 100)}% confidence, ${r.lapses} lapses`);
    }
  }
  lines.push('');
  lines.push('## What You Avoided');
  if (avoided.length === 0) {
    lines.push('- All four categories saw activity this week.');
  } else {
    lines.push(`- Zero activity in: ${avoided.join(', ').toUpperCase()}.`);
  }
  lines.push('');
  lines.push('## Wins');
  if (strong.length === 0) {
    lines.push('- Nothing at strong confidence yet. Keep building reps.');
  } else {
    for (const s of strong) {
      lines.push(`- **${s.name}** at ${Math.round(s.confidence * 100)}% (${s.reps} reps)`);
    }
  }
  lines.push('');
  lines.push("## Next Week's Bet");
  if (rotting.length > 0) {
    lines.push(`- Rescue the top decayer: **${rotting[0].name}**. One Feynman explain-back will reset its FSRS state.`);
  } else if (avoided.length > 0) {
    lines.push(`- Break the silence on ${avoided[0].toUpperCase()}. Generate today's plan to seed activity.`);
  } else {
    lines.push('- You\'re balanced. Push for a deep concept (heap, dp-2d, consensus) instead of surface reps.');
  }
  lines.push('');
  lines.push('_Generated heuristically (no AI). Configure AI in Settings for deeper synthesis._');

  return {
    reportMd: lines.join('\n'),
    stats: { activityCount: sessions, totalMinutes: minutes, avgGrade, feynmanCount: feynman.length },
  };
}
