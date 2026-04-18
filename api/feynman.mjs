import { getDb } from './db/client.mjs';
import { initDatabase } from './db/schema.mjs';
import { requireAuth } from './auth/verify.mjs';
import { generate, parseJSON } from './lib/ai.mjs';
import { randomBytes } from 'crypto';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

const SYSTEM = `You grade a software engineer's plain-English explanation of code they just wrote.

Return STRICT JSON, no prose, no markdown:
{
  "grade": 0-100,
  "feedback": "one paragraph, blunt and specific",
  "gaps": [{"concept_id": "...", "weakness": "..."}],
  "ratings": [{"concept_id": "...", "rating": "again|hard|good|easy"}]
}

Grading rubric:
- 90-100: precise, complete, correctly identifies tradeoffs and complexity
- 70-89: mostly right, minor handwaving on edge cases or complexity
- 50-69: gist correct but missed key invariants or stated wrong complexity
- 0-49: superficial, wrong claims, unable to defend

Use "again" rating for concepts they butchered, "hard" for shaky, "good" for solid, "easy" for nailed.
Only emit ratings/gaps for concept_ids in the provided concept list.`;

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { explanation, code, language, problem, problemId, conceptIds, aiConfig } = req.body || {};
  if (!explanation) return res.status(400).json({ error: 'explanation required' });

  const conceptList = (conceptIds || []).join(', ') || '(none tagged — infer from code)';

  const prompt = `Concepts touched: ${conceptList}
Language: ${language || 'unknown'}
Problem: ${problem || '(freeform playground)'}

Code:
\`\`\`${language || ''}
${(code || '').slice(0, 4000)}
\`\`\`

Engineer's explanation:
"""
${explanation.slice(0, 3000)}
"""

Grade now. Return JSON only.`;

  let parsed;
  try {
    const text = await generate({ ...(aiConfig || {}), system: SYSTEM, prompt, maxTokens: 1500 });
    parsed = parseJSON(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('AI returned non-object');
    }
    if (parsed.grade != null) parsed.grade = Number(parsed.grade);
  } catch (e) {
    return res.status(500).json({ error: 'AI grading failed: ' + e.message });
  }

  const id = randomBytes(16).toString('hex');
  await db.execute({
    sql: `INSERT INTO feynman_logs (id, user_id, problem_id, concept_ids, explanation, grade, gaps_json, feedback)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, user.id, problemId || null,
      conceptIds ? JSON.stringify(conceptIds) : null,
      explanation,
      parsed.grade ?? null,
      parsed.gaps ? JSON.stringify(parsed.gaps) : null,
      parsed.feedback || null,
    ],
  });

  return res.status(200).json({ id, ...parsed });
}
