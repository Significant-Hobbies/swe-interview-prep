// Phrase-overlap critique for review answers — no LLM required.

export interface Critique {
  score: number;
  verdict: string;
  missing: string[];
  strongerAnswer: string;
  followUps: string[];
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );
}

function keyPhrases(expected: string): string[] {
  const sentences = expected
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const phrases: string[] = [];
  for (const sent of sentences) {
    const words = sent.split(/\s+/).filter((w) => w.length > 3);
    if (words.length >= 3) phrases.push(words.slice(0, 6).join(' ').toLowerCase());
    const nums = sent.match(/\b\d+[%ms]?\b/g);
    if (nums) phrases.push(...nums.map((n) => n.toLowerCase()));
  }
  return [...new Set(phrases)].slice(0, 12);
}

export function critiqueAnswerHeuristic(
  question: string,
  answer: string,
  expected: string
): Critique {
  const a = answer.trim();
  if (a.length < 12) {
    return {
      score: 15,
      verdict: 'Too thin — expand with mechanisms and tradeoffs.',
      missing: ['Substantive explanation from memory'],
      strongerAnswer: expected.slice(0, 400),
      followUps: [`What would you add to fully answer: ${question.slice(0, 80)}?`],
    };
  }

  const answerTokens = tokenize(a);
  const expectedTokens = tokenize(expected);
  const phrases = keyPhrases(expected);

  let phraseHits = 0;
  const missing: string[] = [];
  for (const p of phrases) {
    const pTokens = p.split(/\s+/);
    const hit = pTokens.every((t) => answerTokens.has(t) || a.toLowerCase().includes(t));
    if (hit) phraseHits++;
    else if (missing.length < 4) missing.push(p.slice(0, 80));
  }

  let overlap = 0;
  for (const t of expectedTokens) {
    if (answerTokens.has(t)) overlap++;
  }
  const overlapRatio = expectedTokens.size ? overlap / expectedTokens.size : 0;
  const phraseRatio = phrases.length ? phraseHits / phrases.length : overlapRatio;

  const score = Math.round(Math.min(100, Math.max(10, phraseRatio * 55 + overlapRatio * 45)));

  let verdict: string;
  if (score >= 85) verdict = 'Strong recall — you hit the core model.';
  else if (score >= 65) verdict = 'Mostly right — a few key points missing.';
  else if (score >= 45) verdict = 'Gist OK — missing specifics that matter in interviews.';
  else verdict = 'Weak — re-read the reference and drill the concept.';

  const followUps: string[] = [];
  if (score < 80 && question.includes('why')) {
    followUps.push('What breaks if you ignore this constraint in production?');
  } else if (score < 80) {
    followUps.push('How would you explain this to a junior in one minute?');
  }

  return {
    score,
    verdict,
    missing,
    strongerAnswer: expected.length > 500 ? `${expected.slice(0, 480)}…` : expected,
    followUps,
  };
}
