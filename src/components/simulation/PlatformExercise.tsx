import { Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { platformLessons } from '../../data/platform-lessons';

export default function PlatformExercise({ labId }: { labId: string }) {
  const lesson = platformLessons[labId];
  if (!lesson) return null;
  return (
    <details className="group/platform mb-8 rounded-lg border border-white/10 bg-white/[0.02]">
      <summary className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg px-5 py-4 text-sm text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400">
        <Terminal className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
        <span>
          Local setup guide{' '}
          <span className="ml-2 text-xs text-white/50">Requires platform-lab</span>
        </span>
        <span
          className="ml-auto text-white/45 transition-transform group-open/platform:rotate-45"
          aria-hidden="true"
        >
          ＋
        </span>
      </summary>
      <div className="border-t border-white/10 p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-white">{lesson.name}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
          This exercise uses real controllers in the existing local platform-lab checkout. It
          requires Docker, kubectl, Helm, Git, Go, jq, curl, Make, and the matching vault-common
          sibling chart. That private chart is not included in SWE; there is no standalone lab
          download yet.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/65">
          In your platform-lab directory, start with{' '}
          <code className="text-sky-200">make doctor</code>. Once the lab is set up, run the
          commands below in your terminal. They use the isolated kind-vault-lab context. SWE does
          not execute them, inspect your cluster, or award mastery for reading this guide.
        </p>
        <p className="mt-3 max-w-3xl text-xs leading-relaxed text-white/50">
          The local lab uses synthetic data and a fake secret provider. It does not reproduce GKE,
          cloud identity, provider quotas, or managed telemetry ingestion.
        </p>
        <div className="prose prose-invert mt-8 max-w-3xl prose-headings:font-semibold prose-p:text-white/70 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-white/10 prose-pre:bg-black prose-code:text-sky-200">
          <ReactMarkdown
            components={{
              h1: ({ children }) => <h3>{children}</h3>,
              h2: ({ children }) => <h4>{children}</h4>,
            }}
          >
            {lesson.content}
          </ReactMarkdown>
        </div>
      </div>
    </details>
  );
}
