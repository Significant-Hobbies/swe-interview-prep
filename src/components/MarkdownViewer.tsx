import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface MarkdownViewerProps {
  content: string;
  sourceBaseUrl?: string;
}

function resolveImg(src: string | undefined, base?: string): string | undefined {
  if (!src) return src;
  if (/^(https?:|data:)/i.test(src)) return src;
  if (!base) return undefined; // drop known-broken relative refs
  const clean = src.replace(/^\.\//, '').replace(/^\/+/, '');
  return `${base.replace(/\/$/, '')}/${clean}`;
}

function extractText(node: React.ReactNode): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(' ');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return '';
}

function getCalloutStyle(rawText: string): string {
  const text = rawText.toLowerCase();
  if (text.includes('[!warning]') || text.includes('[!caution]')) {
    return 'border-amber-500/50 bg-amber-500/10 text-amber-100';
  }
  if (text.includes('[!important]')) {
    return 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-100';
  }
  if (text.includes('[!tip]')) {
    return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-100';
  }
  if (text.includes('[!note]')) {
    return 'border-sky-500/50 bg-sky-500/10 text-sky-100';
  }
  return 'border-gray-700 bg-gray-900/40 text-gray-300';
}

export default function MarkdownViewer({ content, sourceBaseUrl }: MarkdownViewerProps) {
  return (
    <div
      className="prose prose-invert prose-base max-w-none
      prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-100
      prose-h1:text-3xl prose-h1:mb-5 prose-h1:mt-2 prose-h1:border-b prose-h1:border-gray-800 prose-h1:pb-3
      prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-800/60 prose-h2:pb-2
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
      prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-2 prose-h4:text-gray-200
      prose-p:text-gray-300 prose-p:leading-7 prose-p:my-4
      prose-a:text-sky-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-gray-100 prose-strong:font-semibold
      prose-code:text-emerald-300 prose-code:bg-gray-900 prose-code:border prose-code:border-gray-800
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.9em]
      prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl prose-pre:shadow-lg
      prose-pre:px-4 prose-pre:py-4 prose-pre:my-6
      prose-ul:text-gray-300 prose-ul:my-4 prose-ul:pl-6
      prose-ol:text-gray-300 prose-ol:my-4 prose-ol:pl-6
      prose-li:my-1.5
      prose-hr:border-gray-800 prose-hr:my-8
      prose-img:rounded-xl prose-img:border prose-img:border-gray-800 prose-img:shadow-lg"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-gray-800">
              <table className="!my-0 min-w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-900">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-gray-700 px-4 py-3 text-left text-gray-200">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-800 px-4 py-3 text-gray-300">{children}</td>
          ),
          blockquote: ({ children }) => {
            const raw = extractText(children);
            return (
              <blockquote
                className={`my-6 rounded-r-xl border-l-4 px-4 py-3 not-italic ${getCalloutStyle(raw)}`}
              >
                {children}
              </blockquote>
            );
          },
          details: ({ children }) => (
            <details className="my-4 rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3">
              {children}
            </details>
          ),
          summary: ({ children }) => (
            <summary className="cursor-pointer list-none font-medium text-gray-200 marker:content-none">
              {children}
            </summary>
          ),
          img: ({ src, alt, ...props }) => {
            const resolved = resolveImg(typeof src === 'string' ? src : undefined, sourceBaseUrl);
            if (!resolved) return null;
            return <img {...props} src={resolved} alt={alt || ''} loading="lazy" />;
          },
          h2: ({ children, ...props }) => (
            <h2 {...props} className="scroll-mt-20">
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="scroll-mt-20">
              {children}
            </h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
