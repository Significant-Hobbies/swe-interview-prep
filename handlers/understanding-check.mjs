// Understanding check — AI-graded comprehension probe at the bottom of a doc.
//
// Three ops:
//   - quiz                → AI returns 5 open-ended questions about the doc
//   - grade-quiz          → AI grades the user's answers
//   - grade-explanation   → AI grades a free-form explain-back of the doc
//
// No auth, no DB. Auth-gated activity logging can be added later. Local dev
// path uses generate() which falls back to env vars; production CF Pages
// mirrors this in functions/api/[[path]].js with BYOK only.

import { generate, parseJSON } from '../shared/lib/ai.mjs';

const QUIZ_SYSTEM = `You write open-ended comprehension questions that test whether a reader has internalised a learning doc.

Return STRICT JSON, no prose, no markdown:
{
  "questions": [
    { "q": "the question", "hint": "one-line concrete grounding from the doc — name a paper, blog, or specific claim the answer should reference" }
  ]
}

Rules:
- Exactly 5 questions.
- Each question targets a different section / phase / topic of the doc — no two questions on the same idea.
- Questions are open-ended ("explain", "compare", "why", "what tradeoff") — not yes/no, not multiple-choice.
- A good answer should require 2-5 sentences. Don't ask for code.
- "hint" cites a specific source mentioned in the doc, so the reader knows where to look if stuck.`;

const GRADE_QUIZ_SYSTEM = `You grade a reader's quiz answers against a learning doc.

Return STRICT JSON, no prose, no markdown:
{
  "overall": 0-100,
  "perQuestion": [
    { "q": "...", "a": "...", "grade": 0-100, "feedback": "one paragraph, blunt and specific" }
  ],
  "summary": "one paragraph: what they understood, what they didn't",
  "gaps": ["concrete topic or claim they missed", "..."]
}

Rules:
- Grade on substance, not wording. Reward correct reasoning even if the prose is informal.
- 90-100: precise, correct, references the right source.
- 70-89: mostly right, minor handwaving.
- 50-69: gist correct but missed a key invariant or named the wrong source.
- 0-49: superficial, wrong, or empty.
- gaps: 0-5 items, each one a specific thing they should re-read.`;

const GRADE_EXPLANATION_SYSTEM = `You grade a free-form explain-back of a learning doc. The reader is trying to teach the doc's thesis to a smart peer in their own words.

Return STRICT JSON, no prose, no markdown:
{
  "grade": 0-100,
  "feedback": "one paragraph, blunt and specific",
  "gaps": ["concrete topic or claim they missed", "..."],
  "missedSources": ["specific paper/blog/talk from the doc they should have mentioned but didn't", "..."]
}

Rules:
- Grade on substance, not wording.
- 90-100: precise, complete, references the right sources, identifies the doc's actual thesis.
- 70-89: gets the thesis but skips one major mechanism or source.
- 50-69: gist correct but bluffs on a key invariant.
- 0-49: superficial, wrong, or recites buzzwords.
- gaps: 0-5 items. missedSources: 0-3 items.`;

function truncate(s, n) {
  s = String(s || '');
  return s.length > n ? `${s.slice(0, n)}\n…[truncated]` : s;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { op, docTitle, docContent, questions, answers, explanation, aiConfig } = req.body || {};
  if (!op)
    return res.status(400).json({ error: 'op required: quiz | grade-quiz | grade-explanation' });
  if (!docContent) return res.status(400).json({ error: 'docContent required' });

  const docExcerpt = truncate(docContent, 8000);
  const title = docTitle || '(untitled doc)';

  try {
    let system, prompt, maxTokens;

    if (op === 'quiz') {
      system = QUIZ_SYSTEM;
      prompt = `Doc title: ${title}\n\nDoc content:\n"""\n${docExcerpt}\n"""\n\nWrite 5 questions. JSON only.`;
      maxTokens = 900;
    } else if (op === 'grade-quiz') {
      if (!Array.isArray(questions) || !Array.isArray(answers)) {
        return res
          .status(400)
          .json({ error: 'questions and answers arrays required for grade-quiz' });
      }
      const qa = questions
        .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${truncate(answers[i] || '(blank)', 1500)}`)
        .join('\n\n');
      system = GRADE_QUIZ_SYSTEM;
      prompt = `Doc title: ${title}\n\nDoc content:\n"""\n${docExcerpt}\n"""\n\nQuiz transcript:\n${qa}\n\nGrade now. JSON only.`;
      maxTokens = 1800;
    } else if (op === 'grade-explanation') {
      if (!explanation || explanation.trim().length < 30) {
        return res.status(400).json({ error: 'explanation required (at least 30 chars)' });
      }
      system = GRADE_EXPLANATION_SYSTEM;
      prompt = `Doc title: ${title}\n\nDoc content:\n"""\n${docExcerpt}\n"""\n\nReader's explanation:\n"""\n${truncate(explanation, 4000)}\n"""\n\nGrade now. JSON only.`;
      maxTokens = 1200;
    } else {
      return res.status(400).json({ error: `unknown op: ${op}` });
    }

    const text = await generate({ ...(aiConfig || {}), system, prompt, maxTokens });
    const parsed = parseJSON(text);
    if (!parsed || typeof parsed !== 'object') {
      return res.status(502).json({ error: 'AI returned non-object' });
    }
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: `AI call failed: ${e.message}` });
  }
}
