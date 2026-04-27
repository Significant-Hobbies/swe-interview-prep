import { useCallback, useRef,useState } from 'react';

import { getAuthToken } from '../contexts/AuthContext';
import { type AIConfig, IS_LOCAL, LOCAL_PROVIDERS } from './useAI';

export interface CompanionMessage {
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

export interface CompanionContext {
  code: string;
  language: string;
  problem: string;
}

const SYSTEM = `You are a Socratic programming companion sitting next to a senior engineer in their code playground.

RULES:
- NEVER write a complete solution
- Ask probing questions about WHY they made a choice
- Surface tradeoffs they're ignoring (perf, memory, edge cases, concurrency, scale)
- Challenge naming, abstraction boundaries, hidden assumptions
- When stuck, hint at the relevant concept, NOT the code
- Reference complexity classes, design patterns, distributed-systems primitives by name
- Max 4 sentences per reply. Be terse. They're busy.
- If their code is good, say so in one line and ask the harder follow-up
- Detect when they're flailing — suggest stepping back and explaining the goal first

You see their current code, language, and (optional) problem statement on every turn.`;

const LOCAL_TOOL_MAP: Record<string, string> = {
  'claude-code': 'claude',
  'codex': 'codex',
  'gemini-cli': 'gemini',
};

async function streamLocal(config: AIConfig, messages: CompanionMessage[], systemContext: string, onChunk: (t: string) => void, signal: AbortSignal) {
  const tool = LOCAL_TOOL_MAP[config.model] || 'claude';
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      systemPrompt: SYSTEM + '\n\n' + systemContext,
      tool,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`Local AI: ${res.status}`);
  await pumpSSE(res, onChunk);
}

async function streamRemote(config: AIConfig, messages: CompanionMessage[], systemContext: string, onChunk: (t: string) => void, signal: AbortSignal) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpointUrl: config.endpointUrl,
      apiKey: config.apiKey,
      model: config.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      systemPrompt: SYSTEM + '\n\n' + systemContext,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`AI: ${res.status}`);
  await pumpSSE(res, onChunk);
}

async function pumpSSE(res: Response, onChunk: (t: string) => void) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.text) onChunk(json.text);
          if (json.error) throw new Error(json.error);
        } catch (e: any) {
          if (e.message && !e.message.includes('JSON')) throw e;
        }
      }
    }
  }
}

const STORAGE_KEY = 'companion-thread';

function loadThread(): CompanionMessage[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}

export function useCompanion() {
  const [messages, setMessages] = useState<CompanionMessage[]>(loadThread);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const persist = useCallback((next: CompanionMessage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(-40)));
  }, []);

  const ask = useCallback(async (userMessage: string, config: AIConfig, ctx: CompanionContext) => {
    setError(null);
    const userMsg: CompanionMessage = { role: 'user', content: userMessage, ts: Date.now() };
    const next = [...messages, userMsg, { role: 'assistant' as const, content: '', ts: Date.now() }];
    setMessages(next);
    setIsStreaming(true);

    let buf = '';
    const onChunk = (t: string) => {
      buf += t;
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: buf, ts: Date.now() }]);
    };

    abortRef.current = new AbortController();
    const systemContext = `Current language: ${ctx.language}
Current problem (may be empty):
${ctx.problem || '(none)'}

Current code:
\`\`\`${ctx.language}
${ctx.code.slice(0, 6000)}
\`\`\``;

    try {
      const isLocal = IS_LOCAL && LOCAL_PROVIDERS.has(config.model);
      const fn = isLocal ? streamLocal : streamRemote;
      await fn(config, [...messages, userMsg], systemContext, onChunk, abortRef.current.signal);
      const finalMsgs: CompanionMessage[] = [...messages, userMsg, { role: 'assistant', content: buf, ts: Date.now() }];
      persist(finalMsgs);

      // Fire-and-forget activity log
      const token = getAuthToken();
      if (token) {
        fetch('/api/learning?action=activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            kind: 'companion_turn',
            payload: { language: ctx.language, codeLen: ctx.code.length, replyLen: buf.length },
          }),
        }).catch(() => {});
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, persist]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, isStreaming, error, ask, stop, clear };
}
