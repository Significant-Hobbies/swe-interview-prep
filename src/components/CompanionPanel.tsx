import { Loader2,Send, Sparkles, Square, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { loadAIConfig } from '../hooks/useAI';
import { type CompanionContext,useCompanion } from '../hooks/useCompanion';
import MarkdownViewer from './MarkdownViewer';

interface Props {
  context: CompanionContext;
}

export default function CompanionPanel({ context }: Props) {
  const { messages, isStreaming, error, ask, stop, clear } = useCompanion();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    const config = loadAIConfig();
    if (!config.model) {
      alert('Configure AI in settings first.');
      return;
    }
    ask(input.trim(), config, context);
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div className="flex h-9 items-center justify-between border-b border-slate-800 px-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <Sparkles className="h-3 w-3 text-sky-400" />
          Companion
        </div>
        {messages.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-500 px-4">
            <Sparkles className="h-6 w-6 mb-2 text-slate-600" />
            <p className="leading-relaxed">
              Socratic partner. Sees your code. Asks tough questions, never writes solutions.
            </p>
            <p className="mt-3 text-slate-600">
              Try: <span className="text-slate-500">"why mutex here?"</span> or <span className="text-slate-500">"tradeoffs of this approach?"</span>
            </p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-slate-800 text-slate-100 ml-4'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-200 mr-4'
              }`}
            >
              {m.role === 'assistant' ? (
                <MarkdownViewer content={m.content || (isStreaming && i === messages.length - 1 ? '...' : '')} />
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
              )}
            </div>
          ))
        )}
        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 p-2">
        <div className="relative">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything… (⌘↵ send)"
            rows={2}
            className="w-full resize-none rounded-md bg-slate-900 px-3 py-2 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
          />
          <button
            onClick={isStreaming ? stop : handleSend}
            disabled={!input.trim() && !isStreaming}
            className="absolute bottom-2 right-2 rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-sky-400 disabled:opacity-30"
          >
            {isStreaming ? <Square className="h-4 w-4" /> : input ? <Send className="h-4 w-4" /> : <Loader2 className={`h-4 w-4 ${isStreaming ? 'animate-spin' : ''}`} />}
          </button>
        </div>
      </div>
    </div>
  );
}
