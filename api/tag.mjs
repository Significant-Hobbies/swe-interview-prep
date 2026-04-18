import { requireAuth } from './auth/verify.mjs';
import { initDatabase } from './db/schema.mjs';
import { generate, parseJSON } from './lib/ai.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const conceptsPath = join(__dirname, '..', 'src', 'data', 'concepts.json');
let CONCEPTS = null;
function loadConcepts() {
  if (!CONCEPTS) {
    try { CONCEPTS = JSON.parse(readFileSync(conceptsPath, 'utf8')).concepts; }
    catch { CONCEPTS = []; }
  }
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
  const conceptList = concepts.map(c => `${c.id}: ${c.name}`).join('\n');

  const prompt = `Concept catalog:
${conceptList}

Language: ${language || 'unknown'}
Problem: ${problem || '(freeform)'}

Code:
\`\`\`${language || ''}
${code.slice(0, 4000)}
\`\`\`

Tag now. JSON only.`;

  try {
    const text = await generate({ ...(aiConfig || {}), system: SYSTEM, prompt, maxTokens: 600 });
    const parsed = parseJSON(text);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: 'Tag failed: ' + e.message, concepts: [] });
  }
}
