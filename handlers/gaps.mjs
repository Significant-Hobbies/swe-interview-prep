// AI Gap Analyzer — given the learner's mastery profile, suggest weak areas,
// the next concepts to study, and an artifact to build. BYOK only (the client
// must pass a complete aiConfig); no server-key fallback, so no auth needed.
import { generate, parseJSON } from '../shared/lib/ai.mjs';

const SYSTEM = `You are a learning coach for an engineer building toward AI search/infrastructure depth.

Given the learner's mastery profile, return STRICT JSON:
{
  "summary": "2-3 sentence read on where they stand",
  "weakAreas": ["short phrase", ...],
  "nextConcepts": [ { "conceptId": "...", "why": "one line" } ],
  "recommendedArtifact": { "artifactId": "...", "why": "one line" }
}

Rules:
- Only use conceptId / artifactId values from the provided catalog.
- nextConcepts: 3-5 items, ordered by what to do first.
- Be concrete and direct. No filler.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { aiConfig, profile, catalog } = req.body || {};
  const hasAI = aiConfig && aiConfig.endpointUrl && aiConfig.apiKey && aiConfig.model;
  if (!hasAI) {
    return res.status(400).json({ error: 'Configure an AI provider in Settings to use the Gap Analyzer.' });
  }

  const prompt = `Concept catalog (id: name [track]):
${(catalog?.concepts || []).map(c => `${c.id}: ${c.name} [${c.track}]`).join('\n')}

Artifact catalog (id: title):
${(catalog?.artifacts || []).map(a => `${a.id}: ${a.title}`).join('\n')}

Learner profile:
${JSON.stringify(profile || {}, null, 2)}

Analyze now. JSON only.`;

  try {
    const text = await generate({
      endpointUrl: aiConfig.endpointUrl,
      apiKey: aiConfig.apiKey,
      model: aiConfig.model,
      system: SYSTEM,
      prompt,
      maxTokens: 900,
    });
    return res.status(200).json(parseJSON(text));
  } catch (err) {
    return res.status(502).json({ error: `AI request failed: ${err.message || 'unknown error'}` });
  }
}
