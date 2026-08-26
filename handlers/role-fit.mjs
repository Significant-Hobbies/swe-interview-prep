import { readJsonBody } from '../shared/api/read-json.mjs';
import { AIConfigError, generate, parseJSON } from '../shared/lib/ai.mjs';
import {
  buildRoleFitPrompt,
  ROLE_FIT_SYSTEM,
  RoleFitValidationError,
  validateRoleFitAnalysis,
  validateRoleFitInput,
} from '../shared/lib/role-fit.mjs';

function explicitConfigState(aiConfig) {
  const values = [aiConfig?.endpointUrl, aiConfig?.apiKey, aiConfig?.model];
  const present = values.filter((value) => typeof value === 'string' && value.trim()).length;
  return present === 0 ? 'absent' : present === values.length ? 'complete' : 'partial';
}

export function roleFitProviderAccess(aiConfig, user) {
  const state = explicitConfigState(aiConfig);
  if (state === 'partial') {
    return { allowed: false, status: 400, reason: 'Complete all three AI provider fields.' };
  }
  if (state === 'complete') return { allowed: true, source: 'byok' };
  if (user?.isOwner === true) return { allowed: true, source: 'deployment' };
  return {
    allowed: false,
    status: 401,
    reason: 'Sign in as the owner or configure your own AI provider in Settings.',
  };
}

export default async function handler({ request, user, env, json }) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, { status: 405 });

  const body = await readJsonBody(request);
  let jobDescription;
  try {
    jobDescription = validateRoleFitInput(body.jobDescription);
  } catch (error) {
    const message =
      error instanceof RoleFitValidationError ? error.message : 'Job description is invalid.';
    return json({ error: message }, { status: 400 });
  }

  const access = roleFitProviderAccess(body.aiConfig, user);
  if (!access.allowed) return json({ error: access.reason }, { status: access.status });

  try {
    const text = await generate({
      ...(access.source === 'byok' ? body.aiConfig : {}),
      env: access.source === 'deployment' ? env : undefined,
      system: ROLE_FIT_SYSTEM,
      prompt: buildRoleFitPrompt({
        jobDescription,
        roleTitle: body.roleTitle,
        interviewHorizonDays: body.interviewHorizonDays,
      }),
      maxTokens: 3_200,
    });
    const analysis = validateRoleFitAnalysis(parseJSON(text), jobDescription);
    return json({ analysis });
  } catch (error) {
    if (error instanceof AIConfigError) {
      return json({ error: error.message }, { status: 503 });
    }
    if (error instanceof RoleFitValidationError || error instanceof SyntaxError) {
      return json(
        { error: 'The AI response could not be grounded in this job description. Try again.' },
        { status: 502 }
      );
    }
    return json(
      { error: 'Role analysis failed. Check the provider and try again.' },
      { status: 502 }
    );
  }
}
