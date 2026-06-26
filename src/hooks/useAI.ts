import { useCallback, useEffect, useRef, useState } from 'react';

import { getAuthToken, useAuth } from '../contexts/AuthContext';
import { API_URL } from '../lib/api-url';

export interface AIConfig {
  endpointUrl: string;
  apiKey: string;
  model: string;
}

// Local AI providers that don't need API keys (dev only)
export const LOCAL_PROVIDERS = new Set(['claude-code', 'codex', 'gemini-cli']);
export const IS_LOCAL = import.meta.env.DEV;

const STORAGE_KEY = 'dsa-prep-ai-config';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

function readConfig(): AIConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { endpointUrl: '', apiKey: '', model: '' };
    const parsed = JSON.parse(raw);
    return {
      endpointUrl: parsed.endpointUrl || '',
      apiKey: parsed.apiKey || '',
      model: parsed.model || '',
    };
  } catch {
    return { endpointUrl: '', apiKey: '', model: '' };
  }
}

export function loadAIConfig(): AIConfig {
  const config = readConfig();
  // If dev mode and config is empty, default to local
  if (IS_LOCAL && !config.endpointUrl && !config.apiKey && !config.model) {
    return { endpointUrl: '', apiKey: '', model: 'claude-code-local' };
  }
  return config;
}

export function saveAIConfig(config: AIConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

const SYSTEM_PROMPT = `You are a DSA (Data Structures & Algorithms) coding tutor embedded in a practice tool. The student is working on a coding problem and needs guidance.

RULES:
- NEVER give the full solution or complete code
- Give small, focused hints that guide thinking
- Ask Socratic questions to help them discover the approach
- If they're stuck, suggest the pattern or data structure to consider
- Point out edge cases they might be missing
- If their code has a bug, hint at WHERE the issue is, not HOW to fix it
- Keep responses concise (2-4 sentences max)
- Use code snippets only for tiny illustrations (1-2 lines max, pseudocode preferred)
- If they explicitly ask for the solution, politely decline and offer a stronger hint instead

You have context about the problem they're solving and their current code.`;

// Maps frontend local provider names to server-side tool names
const LOCAL_TOOL_MAP: Record<string, string> = {
  'claude-code': 'claude',
  codex: 'codex',
  'gemini-cli': 'gemini',
};

async function streamLocalAI(
  _config: AIConfig,
  messages: AIMessage[],
  systemContext: string,
  onChunk: (text: string) => void,
  signal: AbortSignal
) {
  const tool = LOCAL_TOOL_MAP[_config.model] || LOCAL_TOOL_MAP['claude-code'] || 'claude';
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      systemPrompt: `${SYSTEM_PROMPT}\n\n${systemContext}`,
      tool,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Local AI server error: ${res.status} - ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('AI response had no readable body');
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

async function streamRemoteAI(
  config: AIConfig,
  messages: AIMessage[],
  systemContext: string,
  onChunk: (text: string) => void,
  signal: AbortSignal
) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpointUrl: config.endpointUrl,
      apiKey: config.apiKey,
      model: config.model,
      messages,
      systemPrompt: `${SYSTEM_PROMPT}\n\n${systemContext}`,
    }),
    signal,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI API error: ${res.status} - ${err}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('AI response had no readable body');
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

const LOCAL_CHATS_KEY = 'dsa-prep-chats';

function loadLocalChats(): Record<string, AIMessage[]> {
  try {
    const raw = localStorage.getItem(LOCAL_CHATS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalChats(all: Record<string, AIMessage[]>) {
  localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(all));
}

export function useAI(problemId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load chat history when problem changes
  useEffect(() => {
    if (!problemId) return;
    setMessages([]);
    setError(null);

    if (user) {
      // Signed in: load from backend API
      const token = getAuthToken();
      if (!token) return;

      fetch(`${API_URL}/api/chats?problemId=${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages as AIMessage[]);
          }
          return undefined;
        })
        .catch((err) => console.error('Failed to load chats:', err));
    } else {
      // Guest: load from localStorage
      const all = loadLocalChats();
      if (all[problemId]) {
        setMessages(all[problemId]);
      }
    }
  }, [user, problemId]);

  const persistMessages = useCallback(
    (msgs: AIMessage[]) => {
      if (!problemId) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (user) {
          // Signed in: save to backend API
          const token = getAuthToken();
          if (!token) return;

          fetch(`${API_URL}/api/chats`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ problemId, messages: msgs }),
          }).catch((err) => console.error('Failed to save chats:', err));
        } else {
          // Guest: save to localStorage
          const all = loadLocalChats();
          all[problemId] = msgs;
          saveLocalChats(all);
        }
      }, 300);
    },
    [user, problemId]
  );

  const ask = useCallback(
    async (userMessage: string, config: AIConfig, systemContext: string, signal?: AbortSignal) => {
      setError(null);
      const newMessages: AIMessage[] = [...messages, { role: 'user', content: userMessage }];
      setMessages(newMessages);
      setIsStreaming(true);

      let fullResponse = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const onChunk = (text: string) => {
        fullResponse += text;
        setMessages((prev) => [...prev.slice(0, -1), { role: 'assistant', content: fullResponse }]);
      };

      try {
        const isLocal = IS_LOCAL && LOCAL_PROVIDERS.has(config.model);
        const streamFn = isLocal ? streamLocalAI : streamRemoteAI;

        await streamFn(
          config,
          newMessages,
          systemContext,
          onChunk,
          signal || new AbortController().signal
        );

        // Persist after streaming completes
        const finalMessages: AIMessage[] = [
          ...newMessages,
          { role: 'assistant', content: fullResponse },
        ];
        persistMessages(finalMessages);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setError(e.message);
        }
        // Still persist the user message + partial response
        if (fullResponse) {
          persistMessages([...newMessages, { role: 'assistant', content: fullResponse }]);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, persistMessages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    if (!problemId) return;
    if (user) {
      const token = getAuthToken();
      if (!token) return;

      fetch(`${API_URL}/api/chats?problemId=${problemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => console.error('Failed to delete chats:', err));
    } else {
      const all = loadLocalChats();
      delete all[problemId];
      saveLocalChats(all);
    }
  }, [user, problemId]);

  return { messages, isStreaming, error, ask, clearMessages };
}
