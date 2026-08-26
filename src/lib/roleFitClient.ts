import type { RoleFitAnalysis } from '../../shared/lib/role-fit.mjs';
import {
  buildRoleFitPrompt,
  parseRoleFitModelText,
  ROLE_FIT_SYSTEM,
  validateRoleFitAnalysis,
} from '../../shared/lib/role-fit.mjs';
import type { AIConfig } from '../hooks/useAI';
import { IS_LOCAL, LOCAL_PROVIDERS } from '../hooks/useAI';
import { learningFetch } from './learningApi';

const LOCAL_TOOL: Record<string, string> = {
  'claude-code': 'claude',
  codex: 'codex',
  'gemini-cli': 'gemini',
};

export interface AnalyzeRoleFitInput {
  jobDescription: string;
  roleTitle?: string;
  interviewHorizonDays?: number | null;
  aiConfig: AIConfig;
  signal?: AbortSignal;
}

export async function readRoleFitSse(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The local AI response had no readable body.');
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === '[DONE]') continue;
      const frame = JSON.parse(payload) as { text?: string; error?: string };
      if (frame.error) throw new Error(frame.error);
      if (frame.text) text += frame.text;
    }
  }
  return text;
}

async function analyzeWithLocalProvider(input: AnalyzeRoleFitInput): Promise<RoleFitAnalysis> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: input.signal,
    body: JSON.stringify({
      tool: LOCAL_TOOL[input.aiConfig.model] ?? 'codex',
      systemPrompt: ROLE_FIT_SYSTEM,
      messages: [
        {
          role: 'user',
          content: buildRoleFitPrompt(input),
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Local AI failed (${response.status}).`);
  const text = await readRoleFitSse(response);
  return validateRoleFitAnalysis(parseRoleFitModelText(text), input.jobDescription);
}

export async function analyzeRoleFit(input: AnalyzeRoleFitInput): Promise<RoleFitAnalysis> {
  if (IS_LOCAL && LOCAL_PROVIDERS.has(input.aiConfig.model)) {
    return analyzeWithLocalProvider(input);
  }

  const response = await learningFetch('role-fit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: input.signal,
    body: JSON.stringify({
      jobDescription: input.jobDescription,
      roleTitle: input.roleTitle,
      interviewHorizonDays: input.interviewHorizonDays,
      aiConfig: input.aiConfig,
    }),
  });
  if (!response) throw new Error('Role analysis requires an available learning API.');
  const body = (await response.json()) as { analysis?: RoleFitAnalysis; error?: string };
  if (!response.ok || !body.analysis) {
    throw new Error(body.error || `Role analysis failed (${response.status}).`);
  }
  return body.analysis;
}
