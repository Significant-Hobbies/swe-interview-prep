import { ArrowRight, BookOpen, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { PaperLearningContract } from '../data/paper-contracts';
import { useLearningEvidence } from '../hooks/useLearningEvidence';
import { appendPaperAttempt, type PaperLearningAttemptV1 } from '../lib/learningEvidence';
import { isPassingFeynmanGrade } from '../lib/feynmanRating';
import FeynmanGate from './FeynmanGate';

export function PaperLearningCard({ paper }: { paper: PaperLearningContract }) {
  const { accountScope, paperAttempts } = useLearningEvidence();
  const [response, setResponse] = useState('');
  const [saved, setSaved] = useState(false);
  const [feynmanOpen, setFeynmanOpen] = useState(false);
  const latest = useMemo(
    () => paperAttempts.find((attempt) => attempt.paperId === paper.id),
    [paper.id, paperAttempts]
  );

  function recordOpened() {
    if (latest) return;
    appendPaperAttempt({
      schemaVersion: 1,
      id: `${paper.id}:opened:${new Date().toISOString()}`,
      accountScope,
      paperId: paper.id,
      definitionVersion: paper.definitionVersion,
      conceptIds: paper.conceptIds,
      retrievalResponse: '',
      followUpEvidence: '',
      evidenceState: 'opened',
      masteryStatus: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  function saveRetrieval() {
    if (response.trim().length < 30) return;
    const now = new Date().toISOString();
    appendPaperAttempt({
      schemaVersion: 1,
      id: `${paper.id}:retrieved:${now}`,
      accountScope,
      paperId: paper.id,
      definitionVersion: paper.definitionVersion,
      conceptIds: paper.conceptIds,
      retrievalResponse: response.trim(),
      followUpEvidence: paper.followUp.href,
      evidenceState: 'explanation-pending',
      masteryStatus: 'pending',
      createdAt: now,
    });
    setSaved(true);
  }

  function markVerified(grade: number) {
    if (!isPassingFeynmanGrade(grade)) return;
    const now = new Date().toISOString();
    const verified: PaperLearningAttemptV1 = {
      schemaVersion: 1,
      id: `${paper.id}:verified:${now}`,
      accountScope,
      paperId: paper.id,
      definitionVersion: paper.definitionVersion,
      conceptIds: paper.conceptIds,
      retrievalResponse: response.trim(),
      followUpEvidence: `${paper.followUp.href}; Feynman grade ${grade}`,
      evidenceState: 'verified',
      masteryStatus: 'applied',
      createdAt: now,
    };
    appendPaperAttempt(verified);
    setFeynmanOpen(false);
  }

  return (
    <article
      className="border-t border-white/[0.08] px-4 py-5 first:border-t-0"
      id={`paper-${paper.id}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
        <BookOpen className="h-4 w-4" aria-hidden="true" />
        <span>{paper.venue}</span>
        <span aria-hidden="true">·</span>
        <span>{paper.difficulty}</span>
        <span aria-hidden="true">·</span>
        <span>{paper.estimatedMinutes} min</span>
        {latest && (
          <span className="text-amber-200">· {latest.evidenceState.replace('-', ' ')}</span>
        )}
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug text-white">{paper.title}</h3>
      <p className="mt-1 text-xs text-white/60">{paper.authors}</p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">{paper.whyItMatters}</p>
      <a
        href={paper.canonicalUrl}
        target="_blank"
        rel="noreferrer"
        onClick={recordOpened}
        className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-sky-300 hover:text-sky-200"
      >
        Open original source <ExternalLink className="h-4 w-4" />
      </a>
      <label
        className="mt-4 block text-xs font-medium text-white/60"
        htmlFor={`retrieval-${paper.id}`}
      >
        Retrieve before reviewing notes: {paper.retrievalQuestion}
      </label>
      <textarea
        id={`retrieval-${paper.id}`}
        value={response}
        onChange={(event) => {
          setResponse(event.target.value);
          setSaved(false);
        }}
        rows={3}
        className="mt-2 w-full resize-y rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/50"
        placeholder="Answer from memory in at least 30 characters."
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveRetrieval}
          disabled={response.trim().length < 30 || saved}
          className="min-h-11 rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saved ? 'Retrieval saved' : 'Save retrieval'}
        </button>
        <Link
          to={paper.followUp.href}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white"
        >
          {paper.followUp.label} <ArrowRight className="h-4 w-4" />
        </Link>
        {(saved || latest?.evidenceState === 'explanation-pending') && (
          <button
            type="button"
            onClick={() => setFeynmanOpen(true)}
            className="min-h-11 rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white"
          >
            Explain for mastery
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-white/60">
        Opening or retrieving is evidence, not mastery. Only an accepted explain-back can update
        FSRS.
      </p>

      <FeynmanGate
        open={feynmanOpen}
        onClose={() => setFeynmanOpen(false)}
        problem={paper.retrievalQuestion}
        problemId={`paper:${paper.id}:v${paper.definitionVersion}`}
        conceptIds={paper.conceptIds}
        artifact={{
          type: 'paper-attempt',
          title: paper.title,
          context: response,
        }}
        onGraded={markVerified}
      />
    </article>
  );
}
