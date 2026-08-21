import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import FeynmanGate from '../components/FeynmanGate';
import { INFERENCE_PATH_NODE_BY_ID } from '../data/inference-path';
import { CONCEPT_BY_ID } from '../data/learning-os';
import { PAPER_CONTRACTS } from '../data/paper-contracts';
import { useLearningEvidence } from '../hooks/useLearningEvidence';
import {
  loadFocusedStudyDraft,
  saveFocusedStudyDraft,
  type StudyFocusKind,
  type StudyStage,
} from '../lib/learningContinuity';
import { isPassingFeynmanGrade } from '../lib/feynmanRating';

interface StudyFocus {
  kind: StudyFocusKind;
  id: string;
  title: string;
  summary: string;
  retrievalPrompt: string;
  conceptIds: string[];
  sourceHref: string;
  sourceExternal: boolean;
  backHref: string;
}

const STAGES: Array<{ id: StudyStage; label: string }> = [
  { id: 'learn', label: 'Learn' },
  { id: 'retrieve', label: 'Retrieve' },
  { id: 'apply', label: 'Apply' },
  { id: 'explain', label: 'Explain' },
];

function resolveFocus(kind: string | undefined, id: string | undefined): StudyFocus | null {
  if (!id) return null;
  if (kind === 'concept') {
    const concept = CONCEPT_BY_ID[id];
    return concept
      ? {
          kind,
          id,
          title: concept.name,
          summary: concept.mentalModel ?? concept.description,
          retrievalPrompt: `Explain the causal mechanism behind ${concept.name} without notes.`,
          conceptIds: [id],
          sourceHref: `/concepts/${id}`,
          sourceExternal: false,
          backHref: `/concepts/${id}`,
        }
      : null;
  }
  if (kind === 'inference-node') {
    const node = INFERENCE_PATH_NODE_BY_ID[id];
    return node
      ? {
          kind,
          id,
          title: node.title,
          summary: node.summary,
          retrievalPrompt: node.retrievalPrompt,
          conceptIds: node.conceptIds,
          sourceHref: node.canonicalUrl,
          sourceExternal: true,
          backHref: '/learn/inference',
        }
      : null;
  }
  if (kind === 'paper') {
    const paper = PAPER_CONTRACTS.find((candidate) => candidate.id === id);
    return paper
      ? {
          kind,
          id,
          title: paper.title,
          summary: paper.whyItMatters,
          retrievalPrompt: paper.retrievalQuestion,
          conceptIds: paper.conceptIds,
          sourceHref: paper.canonicalUrl,
          sourceExternal: true,
          backHref: '/learn/papers',
        }
      : null;
  }
  return null;
}

export default function FocusedStudy() {
  const { focusKind, focusId } = useParams();
  const focus = resolveFocus(focusKind, focusId);
  return focus ? (
    <FocusedStudySession focus={focus} />
  ) : (
    <div className="mx-auto max-w-4xl px-6 py-16 text-sm text-white/55">Study focus not found.</div>
  );
}

function FocusedStudySession({ focus }: { focus: StudyFocus }) {
  const { accountScope } = useLearningEvidence();
  const saved = useMemo(
    () => loadFocusedStudyDraft(accountScope, focus.kind, focus.id),
    [accountScope, focus.id, focus.kind]
  );
  const [stage, setStage] = useState<StudyStage>(saved?.stage ?? 'learn');
  const [retrieval, setRetrieval] = useState(saved?.retrieval ?? '');
  const [application, setApplication] = useState(saved?.application ?? '');
  const [explanation, setExplanation] = useState(saved?.explanation ?? '');
  const [completedAt, setCompletedAt] = useState<string | null>(saved?.completedAt ?? null);
  const [feynmanOpen, setFeynmanOpen] = useState(false);
  const [verifiedGrade, setVerifiedGrade] = useState<number | null>(null);
  const [lastGrade, setLastGrade] = useState<number | null>(null);

  useEffect(() => {
    saveFocusedStudyDraft(accountScope, {
      schemaVersion: 1,
      focusKind: focus.kind,
      focusId: focus.id,
      stage,
      retrieval,
      application,
      explanation,
      completedAt,
      updatedAt: new Date().toISOString(),
    });
  }, [accountScope, application, completedAt, explanation, focus.id, focus.kind, retrieval, stage]);

  const complete =
    retrieval.trim().length >= 30 &&
    application.trim().length >= 30 &&
    explanation.trim().length >= 30;
  const stageIndex = STAGES.findIndex((candidate) => candidate.id === stage);
  const stageEvidence: Partial<Record<StudyStage, boolean>> = {
    retrieve: retrieval.trim().length >= 30,
    apply: application.trim().length >= 30,
    explain: Boolean(completedAt),
  };
  const requirements = [
    { stage: 'retrieve' as const, label: 'Retrieval response', ready: stageEvidence.retrieve },
    { stage: 'apply' as const, label: 'Concrete application', ready: stageEvidence.apply },
    {
      stage: 'explain' as const,
      label: 'Causal explain-back',
      ready: explanation.trim().length >= 30,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 lg:py-14">
      <Link
        to={focus.backHref}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Exit study
      </Link>
      <header className="mt-5 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
          <span>Focused study</span>
          <span aria-hidden="true">·</span>
          <span>Auto-saved locally</span>
          {saved && (
            <>
              <span aria-hidden="true">·</span>
              <span>Resumed</span>
            </>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {focus.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">{focus.summary}</p>
      </header>

      <nav className="mt-9 grid grid-cols-4 border-y border-white/[0.1]" aria-label="Study stages">
        {STAGES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setStage(item.id)}
            className={`min-h-14 border-r border-white/[0.08] px-2 text-xs last:border-r-0 sm:text-sm ${stage === item.id ? 'bg-white/[0.06] text-white' : stageEvidence[item.id] ? 'text-emerald-200/70' : 'text-white/60'}`}
            aria-label={`${item.label}${stageEvidence[item.id] ? ', evidence complete' : ''}`}
            aria-current={stage === item.id ? 'step' : undefined}
          >
            {index + 1}. {item.label}
            {stageEvidence[item.id] ? ' ✓' : ''}
          </button>
        ))}
      </nav>

      <div className="mt-8 min-h-[24rem]">
        {stage === 'learn' && (
          <StudyPanel
            title="Inspect the source boundary"
            description="Read enough to identify the mechanism and its declared limits. Do not copy the source into the answer fields."
          >
            <p className="rounded-xl border border-white/[0.08] p-5 text-sm leading-relaxed text-white/65">
              {focus.summary}
            </p>
            {focus.sourceExternal ? (
              <a
                href={focus.sourceHref}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-sky-300"
              >
                Open canonical source <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <Link
                to={focus.sourceHref}
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-sky-300"
              >
                Open concept <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </StudyPanel>
        )}
        {stage === 'retrieve' && (
          <StudyPanel title="Retrieve without notes" description={focus.retrievalPrompt}>
            <StudyTextarea
              label="Your retrieval"
              value={retrieval}
              onChange={setRetrieval}
              placeholder="State the mechanism, the binding constraint, and one boundary from memory."
            />
          </StudyPanel>
        )}
        {stage === 'apply' && (
          <StudyPanel
            title="Apply it to a concrete system"
            description="Choose a system you know. State the decision this mechanism changes and the measurement that would test your claim."
          >
            <StudyTextarea
              label="Application"
              value={application}
              onChange={setApplication}
              placeholder="In system X, I would change Y because… I would verify it with…"
            />
          </StudyPanel>
        )}
        {stage === 'explain' && (
          <StudyPanel
            title="Explain causally"
            description="Write for another engineer: cause → mechanism → effect → failure boundary."
          >
            <StudyTextarea
              label="Explain-back draft"
              value={explanation}
              onChange={setExplanation}
              placeholder="The effect occurs because… This stops being true when…"
            />
            {!completedAt ? (
              <div className="mt-5 rounded-xl border border-white/[0.08] p-5">
                <h3 className="text-sm font-medium text-white">Evidence required</h3>
                <ul className="mt-3 space-y-2">
                  {requirements.map((requirement) => (
                    <li
                      key={requirement.stage}
                      className="flex min-h-11 items-center justify-between gap-3 text-sm"
                    >
                      <span className={requirement.ready ? 'text-emerald-200' : 'text-white/60'}>
                        {requirement.ready ? '✓ ' : ''}
                        {requirement.label}
                      </span>
                      {!requirement.ready && (
                        <button
                          type="button"
                          onClick={() => setStage(requirement.stage)}
                          className="min-h-11 px-2 text-xs text-sky-300 hover:text-sky-200"
                        >
                          Add evidence
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={!complete}
                  onClick={() => setCompletedAt(new Date().toISOString())}
                  className="mt-4 min-h-11 rounded-md bg-white px-4 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Complete study evidence
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-200" />
                  <div>
                    <h3 className="font-medium text-white">Session complete; mastery pending</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">
                      The draft is durable evidence, not a mastery claim. Use the Feynman gate for a
                      causal check.
                    </p>
                    <button
                      type="button"
                      onClick={() => setFeynmanOpen(true)}
                      className="mt-4 min-h-11 rounded-md bg-white px-4 text-sm font-medium text-black"
                    >
                      Open Feynman gate
                    </button>
                    {verifiedGrade !== null && (
                      <p className="mt-3 text-xs text-emerald-200">
                        Explain-back accepted at grade {verifiedGrade}.
                      </p>
                    )}
                    {lastGrade !== null && verifiedGrade === null && (
                      <p className="mt-3 text-xs text-amber-200">
                        Explain-back scored {lastGrade}; mastery is still pending. Review the
                        feedback and try again.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </StudyPanel>
        )}
      </div>

      <div className="mt-8 flex justify-between border-t border-white/[0.08] pt-5">
        <button
          type="button"
          disabled={stageIndex === 0}
          onClick={() => setStage(STAGES[stageIndex - 1].id)}
          className="min-h-11 px-2 text-sm text-white/55 disabled:opacity-30"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={stageIndex === STAGES.length - 1}
          onClick={() => setStage(STAGES[stageIndex + 1].id)}
          className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-white/75 disabled:opacity-30"
        >
          Next <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <FeynmanGate
        open={feynmanOpen}
        onClose={() => setFeynmanOpen(false)}
        problem={focus.retrievalPrompt}
        problemId={`focused-study:${focus.kind}:${focus.id}`}
        conceptIds={focus.conceptIds}
        artifact={{
          type: 'focused-study',
          title: focus.title,
          context: `${retrieval}\n\n${application}\n\n${explanation}`,
        }}
        onGraded={(grade) => {
          setLastGrade(grade);
          if (isPassingFeynmanGrade(grade)) {
            setVerifiedGrade(grade);
            setFeynmanOpen(false);
          }
        }}
      />
    </div>
  );
}

function StudyPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StudyTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-xs font-medium text-white/60">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={9}
        placeholder={placeholder}
        className="mt-2 w-full resize-y rounded-md border border-white/20 bg-black px-3 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/35 focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/50"
      />
      <span className="mt-2 block text-xs text-white/60">
        {value.trim().length} characters · 30 minimum for completed evidence
      </span>
    </label>
  );
}
