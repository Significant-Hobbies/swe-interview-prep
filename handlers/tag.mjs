import { requireAuth } from '../api/auth/verify.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { generate, parseJSON } from '../shared/lib/ai.mjs';
import { tagConcepts } from '../shared/lib/heuristics.mjs';
import conceptsData from '../src/data/concepts.json' with { type: 'json' };

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

const CONCEPTS = conceptsData.concepts ?? [];
function loadConcepts() {
  return CONCEPTS;
}

const SYSTEM = `You analyze code and identify which concepts the engineer is practicing.

Given a list of concept ids and a code snippet, return STRICT JSON:
{
  "concepts": [
    { "concept_id": "...", "evidence": "1-line evidence", "depth": "surface|working|deep" }
  ]
}

Rules:
- Only emit concept_ids that appear in the provided list
- Max 5 concepts (most prominent only)
- "surface" = mentioned/imported, "working" = used correctly, "deep" = non-trivial application
- Empty array if no concept clearly used`;

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code, language, problem, aiConfig } = req.body || {};
  if (!code || code.length < 30) return res.status(200).json({ concepts: [] });

  const concepts = loadConcepts();
  const conceptList = concepts.map((c) => `${c.id}: ${c.name}`).join('\n');

  const prompt = `Concept catalog:
${conceptList}

Language: ${language || 'unknown'}
Problem: ${problem || '(freeform)'}

Code:
\`\`\`${language || ''}
${code.slice(0, 4000)}
\`\`\`

Tag now. JSON only.`;

  const useAI = aiConfig?.endpointUrl && aiConfig.apiKey && aiConfig.model;
  if (useAI) {
    try {
      const text = await generate({ ...aiConfig, system: SYSTEM, prompt, maxTokens: 600 });
      const parsed = parseJSON(text);
      return res.status(200).json({ ...parsed, generator: 'ai' });
    } catch {
      // Fall through to heuristic
    }
  }
  return res.status(200).json({ concepts: tagConcepts(code, language), generator: 'heuristic' });
}
