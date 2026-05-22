// AI Review Critic — grades the learner's recall/explanation answer against a
// reference answer. BYOK only (no server-key fallback, so no auth needed).
import { generate, parseJSON } from '../shared/lib/ai.mjs';

const SYSTEM = `You grade an engineer's recall answer against a reference answer.

Return STRICT JSON:
{
  "score": 0-100,
  "verdict": "one short sentence",
  "missing": ["point they missed or got wrong", ...],
  "strongerAnswer": "a tight model answer (3-5 sentences)",
  "followUps": ["a harder follow-up question", ...]
}

Rules:
- Grade on substance, not wording. Reward correct mental models.
- "missing": 0-4 items. Empty if the answer is excellent.
- "followUps": 1-2 items that probe one level deeper.
- Be honest and direct.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { aiConfig, question, answer, expected } = req.body || {};
  const hasAI = aiConfig && aiConfig.endpointUrl && aiConfig.apiKey && aiConfig.model;
  if (!hasAI) {
    return res.status(400).json({ error: 'Configure an AI provider in Settings to use the Review Critic.' });
  }
  if (!question || !answer) {
    return res.status(400).json({ error: 'question and answer are required' });
  }

  const prompt = `Question:
${question}

Reference answer:
${expected || '(none provided)'}

Learner's answer:
${answer}

Grade now. JSON only.`;

  try {
    const text = await generate({
      endpointUrl: aiConfig.endpointUrl,
      apiKey: aiConfig.apiKey,
      model: aiConfig.model,
      system: SYSTEM,
      prompt,
      maxTokens: 800,
    });
    return res.status(200).json(parseJSON(text));
  } catch (err) {
    return res.status(502).json({ error: `AI request failed: ${err.message || 'unknown error'}` });
  }
}
