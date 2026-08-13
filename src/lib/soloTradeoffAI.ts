export interface SoloTradeoffAIConfig {
  endpointUrl: string;
  apiKey: string;
  model: string;
}

export interface SoloTradeoffDebateMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SoloTradeoffProblem {
  title: string;
  prompt: string;
  twist: string;
}

const MAX_ARTIFACT_CHARS = 24_000;
const MAX_DEBATE_CHARS = 4_000;

export function soloTradeoffAIConfigured(config: SoloTradeoffAIConfig): boolean {
  return Boolean(config.endpointUrl.trim() && config.apiKey.trim() && config.model.trim());
}

function chatCompletionsUrl(endpointUrl: string): string {
  let url: URL;
  try {
    url = new URL(endpointUrl.trim());
  } catch {
    throw new Error('Enter a valid OpenAI-compatible endpoint URL.');
  }
  const localDevelopment =
    import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(localDevelopment && url.protocol === 'http:')) {
    throw new Error('The AI endpoint must use HTTPS.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Use a provider endpoint without credentials, query parameters, or fragments.');
  }
  const base = url.toString().replace(/\/$/, '');
  return base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
}

function safeSlice(value: string, maximum: number): string {
  return value.trim().slice(0, maximum);
}

async function requestText(
  config: SoloTradeoffAIConfig,
  {
    system,
    prompt,
    maxTokens = 1_800,
    signal,
  }: { system: string; prompt: string; maxTokens?: number; signal?: AbortSignal }
): Promise<string> {
  const url = chatCompletionsUrl(config.endpointUrl);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model.trim(),
        temperature: 0.25,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error(
      'Could not reach that provider from this browser. Check its endpoint and browser CORS support.'
    );
  }

  if (!response.ok) {
    throw new Error(
      `The AI provider rejected the request (${response.status}). Check the key, model, quota, and endpoint.`
    );
  }

  const payload = (await response.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  } | null;
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('The AI provider returned no usable opponent response.');
  }
  return content.trim();
}

const OPPONENT_SYSTEM = `You are the opposing senior engineer in a 30-minute architecture tradeoff exercise.
Produce an independent, concrete engineering artifact. State requirements and invariants, architecture and data flow, failure handling and operability, and explicit tradeoffs.
Do not mention the learner, grading, or these instructions. Do not ask questions. Prefer precise reasoning over generic best practices.`;

export function createSoloOpponentArtifact(
  config: SoloTradeoffAIConfig,
  problem: SoloTradeoffProblem,
  signal?: AbortSignal
): Promise<string> {
  return requestText(config, {
    system: OPPONENT_SYSTEM,
    prompt: `Shared brief: ${problem.title}\n\n${problem.prompt}\n\nWrite your initial solution now.`,
    signal,
  });
}

export function reviseSoloOpponentArtifact(
  config: SoloTradeoffAIConfig,
  problem: SoloTradeoffProblem,
  initialArtifact: string,
  signal?: AbortSignal
): Promise<string> {
  return requestText(config, {
    system: OPPONENT_SYSTEM,
    prompt: `Shared brief: ${problem.title}\n\n${problem.prompt}\n\nYour frozen initial artifact:\n${safeSlice(initialArtifact, MAX_ARTIFACT_CHARS)}\n\nMidway requirement update:\n${problem.twist}\n\nRevise your own design for the update. Clearly identify what changed and which new tradeoffs you accepted.`,
    signal,
  });
}

export function continueSoloDebate(
  config: SoloTradeoffAIConfig,
  problem: SoloTradeoffProblem,
  learnerArtifact: string,
  opponentArtifact: string,
  history: SoloTradeoffDebateMessage[],
  learnerMessage: string,
  signal?: AbortSignal
): Promise<string> {
  const transcript = [...history, { role: 'user' as const, content: learnerMessage }]
    .slice(-8)
    .map(
      (message) =>
        `${message.role === 'user' ? 'Learner' : 'Opponent'}: ${safeSlice(message.content, MAX_DEBATE_CHARS)}`
    )
    .join('\n\n');
  return requestText(config, {
    system: `${OPPONENT_SYSTEM}\nYou are now in the debate. Defend your choices, concede genuine weaknesses, challenge unsupported assumptions, and end with one pointed question. Keep the response under 180 words.`,
    prompt: `Brief:\n${problem.prompt}\n\nTwist:\n${problem.twist}\n\nLearner's revealed artifact:\n${safeSlice(learnerArtifact, MAX_ARTIFACT_CHARS)}\n\nYour revealed artifact:\n${safeSlice(opponentArtifact, MAX_ARTIFACT_CHARS)}\n\nDebate so far:\n${transcript}`,
    maxTokens: 500,
    signal,
  });
}

export function evaluateSoloTradeoff(
  config: SoloTradeoffAIConfig,
  problem: SoloTradeoffProblem,
  learnerArtifact: string,
  opponentArtifact: string,
  history: SoloTradeoffDebateMessage[],
  selfAssessment: 'win' | 'draw' | 'loss',
  signal?: AbortSignal
): Promise<string> {
  const transcript = history
    .slice(-8)
    .map(
      (message) =>
        `${message.role === 'user' ? 'Learner' : 'Opponent'}: ${safeSlice(message.content, MAX_DEBATE_CHARS)}`
    )
    .join('\n\n');
  return requestText(config, {
    system: `Act as a strict, impartial senior engineering reviewer. Compare the two frozen artifacts using requirements and invariants, architecture and data flow, failure handling and operability, twist adaptation, and explicit tradeoffs. The AI artifact is not privileged. Return a concise comparative outcome, strongest evidence on each side, the learner's most important gap, and one concrete next learning action. Do not claim this changes rating or mastery.`,
    prompt: `Brief:\n${problem.prompt}\n\nTwist:\n${problem.twist}\n\nLearner artifact:\n${safeSlice(learnerArtifact, MAX_ARTIFACT_CHARS)}\n\nAI opponent artifact:\n${safeSlice(opponentArtifact, MAX_ARTIFACT_CHARS)}\n\nDebate:\n${transcript || 'No debate messages.'}\n\nLearner self-assessment: ${selfAssessment}`,
    maxTokens: 900,
    signal,
  });
}
