import { ArrowLeft, ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { INFERENCE_PATH } from '../data/inference-path';
import { CONCEPT_BY_ID } from '../data/learning-os';
import { useLearningEvidence } from '../hooks/useLearningEvidence';
import { loadFocusedStudyDrafts } from '../lib/learningContinuity';

function ChapterIndex({ completedNodeIds }: { completedNodeIds: Set<string> }) {
  return (
    <nav
      className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.08] sm:grid-cols-4"
      aria-label="Inference chapters"
    >
      {INFERENCE_PATH.map((chapter) => {
        const completed = chapter.nodes.filter((node) => completedNodeIds.has(node.id)).length;
        return (
          <a
            key={chapter.id}
            href={`#chapter-${chapter.number}`}
            className="min-h-16 bg-black px-4 py-3 text-sm text-white/70 hover:bg-white/[0.03] hover:text-white"
          >
            <span className="block font-medium">
              {chapter.number}. {chapter.title}
            </span>
            <span className="mt-1 block text-xs text-white/60">
              {completed}/{chapter.nodes.length} complete
            </span>
          </a>
        );
      })}
    </nav>
  );
}

function ChapterSection({ chapter }: { chapter: (typeof INFERENCE_PATH)[number] }) {
  return (
    <section
      id={`chapter-${chapter.number}`}
      className="scroll-mt-24"
      aria-labelledby={`chapter-heading-${chapter.number}`}
    >
      <div className="border-b border-white/[0.1] pb-4 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">
            Chapter {chapter.number}
          </p>
          <h2
            id={`chapter-heading-${chapter.number}`}
            className="mt-2 text-2xl font-semibold text-white"
          >
            {chapter.title}
          </h2>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55 sm:mt-0 sm:text-right">
          {chapter.purpose}
        </p>
      </div>
      <ol className="divide-y divide-white/[0.08]">
        {chapter.nodes.map((node) => (
          <li
            key={node.id}
            className="grid gap-3 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-5"
          >
            <span className="font-mono text-xs text-white/60">
              {node.chapter}.{node.section}
            </span>
            <div>
              <h3 className="font-medium text-white">{node.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/55">{node.summary}</p>
              <p className="mt-3 text-xs leading-relaxed text-white/60">
                Retrieve: {node.retrievalPrompt}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {node.conceptIds.map((conceptId) => (
                  <Link
                    key={conceptId}
                    to={`/concepts/${conceptId}`}
                    className="inline-flex min-h-11 items-center text-xs text-white/60 hover:text-white"
                  >
                    {CONCEPT_BY_ID[conceptId]?.name ?? conceptId}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2 sm:justify-end">
              <a
                href={node.canonicalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 px-2 text-xs text-white/60 hover:text-white"
              >
                Read <BookOpen className="h-4 w-4" />
              </a>
              <Link
                to={`/study/inference-node/${node.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-3 text-xs text-white/70 hover:text-white"
              >
                Study <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function InferencePath() {
  const { accountScope } = useLearningEvidence();
  const completedNodeIds = new Set(
    loadFocusedStudyDrafts(accountScope)
      .filter((draft) => draft.focusKind === 'inference-node' && draft.completedAt)
      .map((draft) => draft.focusId)
  );
  const resumeNode = INFERENCE_PATH.flatMap((chapter) => chapter.nodes).find(
    (node) => !completedNodeIds.has(node.id)
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">
      <Link
        to="/learn"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>
      <header className="mt-5 max-w-3xl">
        <p className="text-sm text-white/55">Guided source path · 42 sections</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Learn inference, mechanism first.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
          A complete companion path through the open Learn Inference book. Read the canonical
          source, retrieve the mechanism, then connect it to this Learning OS.
        </p>
        <a
          href="https://learn-inference.com/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
        >
          Open the original book <ExternalLink className="h-4 w-4" />
        </a>
        {resumeNode && (
          <Link
            to={`/study/inference-node/${resumeNode.id}`}
            className="ml-4 mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black"
          >
            {completedNodeIds.size > 0 ? 'Resume path' : 'Start the path'}{' '}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </header>

      <ChapterIndex completedNodeIds={completedNodeIds} />

      <div className="mt-12 space-y-12">
        {INFERENCE_PATH.map((chapter) => (
          <ChapterSection key={chapter.id} chapter={chapter} />
        ))}
      </div>
    </div>
  );
}
