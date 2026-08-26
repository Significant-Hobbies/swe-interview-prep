import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  LoaderCircle,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { type FormEvent, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import type {
  RoleFitAnalysis,
  RoleFitImportance,
  RoleFitRequirement,
} from '../../shared/lib/role-fit.mjs';
import {
  fingerprintRoleFitSource,
  ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS,
  ROLE_FIT_MIN_JOB_DESCRIPTION_CHARS,
} from '../../shared/lib/role-fit.mjs';
import { Badge, Button, PageHeader, PageShell } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { CONCEPT_BY_ID } from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { loadAIConfig } from '../hooks/useAI';
import { useProfile } from '../hooks/useProfile';
import { analyzeRoleFit } from '../lib/roleFitClient';
import {
  buildActiveRolePlan,
  buildRoleFitPlan,
  buildRoleFocus,
  roleFocusMatchesPlan,
  type RoleFitPlan,
  type RoleFitPlanItem,
} from '../lib/roleFit';
import type { RoleFocus } from '../lib/profile';
import { loadSweep } from '../lib/sweep';

const HORIZONS = [
  { value: '', label: 'No fixed interview date' },
  { value: '14', label: 'Within 2 weeks' },
  { value: '30', label: 'Within 30 days' },
  { value: '60', label: 'Within 60 days' },
  { value: '90', label: 'Within 90 days' },
] as const;

const IMPORTANCE_TONE: Record<RoleFitImportance, string> = {
  must: 'amber',
  preferred: 'slate',
  context: 'slate',
};

export function roleFitInputReady(jobDescription: string): boolean {
  const length = jobDescription.trim().length;
  return (
    length >= ROLE_FIT_MIN_JOB_DESCRIPTION_CHARS && length <= ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS
  );
}

function RequirementRow({ requirement }: { requirement: RoleFitRequirement }) {
  const concepts = requirement.conceptIds
    .map((id) => CONCEPT_BY_ID[id])
    .filter((concept) => Boolean(concept));
  return (
    <div className="grid gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:gap-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-white">{requirement.label}</h3>
          <Badge tone={IMPORTANCE_TONE[requirement.importance]}>{requirement.importance}</Badge>
          <span className="font-mono text-[10px] text-white/60">
            {Math.round(requirement.confidence * 100)}% mapping confidence
          </span>
        </div>
        <blockquote className="mt-2 text-sm leading-relaxed text-white/55">
          “{requirement.sourcePhrase}”
        </blockquote>
      </div>
      <div>
        <p className="text-sm leading-relaxed text-white/60">{requirement.rationale}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {concepts.map((concept) => (
            <Link
              key={concept.id}
              to={`/concepts/${concept.id}`}
              className="inline-flex min-h-11 items-center gap-1 text-sm text-white/80 hover:text-white"
            >
              {concept.name} <ArrowRight className="h-3 w-3" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanRow({ item }: { item: RoleFitPlanItem }) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/concepts/${item.conceptId}`}
            className="font-medium text-white hover:text-white/75"
          >
            {item.concept.name}
          </Link>
          <Badge>
            {item.source === 'active-role'
              ? item.direct
                ? 'role match'
                : 'prerequisite'
              : item.direct
                ? item.importance
                : 'prerequisite'}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-white/50">{item.reason}</p>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {item.drillId && (
          <Link
            to={`/drills/${item.drillId}`}
            className="inline-flex min-h-11 items-center text-white/65 hover:text-white"
          >
            Open drill
          </Link>
        )}
        {item.artifactId && (
          <Link
            to={`/playground?artifact=${item.artifactId}`}
            className="inline-flex min-h-11 items-center text-white/65 hover:text-white"
          >
            Build proof
          </Link>
        )}
        <Link
          to={`/concepts/${item.conceptId}`}
          aria-label={`Open ${item.concept.name}`}
          className="inline-flex h-11 w-11 items-center justify-center text-white/65 hover:text-white"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PlanSection({
  id,
  title,
  detail,
  items,
  tone,
}: {
  id: string;
  title: string;
  detail: string;
  items: RoleFitPlanItem[];
  tone: 'emerald' | 'amber' | 'sky';
}) {
  if (!items.length) return null;
  const labelTone =
    tone === 'emerald' ? 'text-emerald-200' : tone === 'amber' ? 'text-amber-200' : 'text-sky-200';
  return (
    <section className="border-t border-white/[0.08] pt-7" aria-labelledby={id}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={id} className={`text-xl font-semibold ${labelTone}`}>
            {title}
          </h2>
          <p className="mt-1 text-sm text-white/50">{detail}</p>
        </div>
        <span className="font-mono text-xs text-white/60">{items.length} concepts</span>
      </div>
      <div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {items.map((item) => (
          <PlanRow key={item.conceptId} item={item} />
        ))}
      </div>
    </section>
  );
}

function ActiveRole({
  roleTitle,
  targetCount,
  supportingCount,
  deactivating,
  onChangeTarget,
  onDeactivate,
}: {
  roleTitle: string;
  targetCount: number;
  supportingCount: number;
  deactivating: boolean;
  onChangeTarget: () => void;
  onDeactivate: () => void;
}) {
  return (
    <section className="mb-10 border-y border-white/[0.1] py-5" aria-label="Active role target">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <CheckCircle2 className="h-4 w-4" /> Active role target
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">{roleTitle}</h2>
          <p className="mt-1 text-sm text-white/50">
            {targetCount} direct matches · {supportingCount} prerequisites
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/sweep?focus=role"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-white/90"
          >
            Sweep role concepts <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onChangeTarget}
            className="inline-flex min-h-11 items-center text-sm text-white/65 hover:text-white"
          >
            Change target
          </button>
          <button
            type="button"
            onClick={onDeactivate}
            disabled={deactivating}
            className="inline-flex min-h-11 items-center text-sm text-white/65 hover:text-white disabled:opacity-50"
          >
            {deactivating ? 'Deactivating…' : 'Deactivate'}
          </button>
        </div>
      </div>
    </section>
  );
}

function RoleFitResult({
  analysis,
  plan,
  active,
  activating,
  onActivate,
}: {
  analysis: RoleFitAnalysis;
  plan: RoleFitPlan;
  active: boolean;
  activating: boolean;
  onActivate: () => void;
}) {
  return (
    <div className="mt-14">
      <p className="sr-only" role="status" aria-live="polite">
        Role map ready for {analysis.roleTitle}.
      </p>
      <section className="border-t border-white/[0.1] pt-8" aria-labelledby="role-result">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="max-w-2xl">
            <p className="text-sm text-white/50">Grounded role map</p>
            <h2
              id="role-result"
              tabIndex={-1}
              className="mt-2 text-3xl font-semibold tracking-tight text-white"
            >
              {analysis.roleTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{analysis.summary}</p>
          </div>
          <div className="grid grid-cols-3 gap-5 border-y border-white/[0.08] py-3 text-center sm:border-y-0 sm:py-0">
            <div>
              <p className="text-xl font-semibold text-white">{plan.targetConceptIds.length}</p>
              <p className="mt-1 text-xs text-white/60">direct</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{plan.supportingConceptIds.length}</p>
              <p className="mt-1 text-xs text-white/60">foundations</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{analysis.unsupported.length}</p>
              <p className="mt-1 text-xs text-white/60">uncovered</p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          {active && (
            <>
              <Badge tone="emerald">Active target</Badge>
              <Link
                to="/sweep?focus=role"
                className="inline-flex min-h-11 items-center gap-2 text-sm text-white/65 hover:text-white"
              >
                Start role Sweep <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
          <span className="text-xs text-white/60">
            {active
              ? 'Activation stores IDs and weights—not this job description.'
              : 'Review the grounded plan first. Activation is available at the end and stores no raw job text.'}
          </span>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="role-evidence">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="role-evidence" className="text-xl font-semibold text-white">
              Why these concepts matched
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Each mapping keeps the exact phrase that grounded it.
            </p>
          </div>
          <span className="font-mono text-xs text-white/60">
            {analysis.requirements.length} requirements
          </span>
        </div>
        <div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {analysis.requirements.map((requirement) => (
            <RequirementRow key={requirement.id} requirement={requirement} />
          ))}
        </div>
      </section>

      <div className="mt-12 space-y-10">
        <PlanSection
          id="role-learn-next"
          title="Learn next"
          detail="Existing evidence says these concepts are weak, overdue, fuzzy, or new."
          items={plan.learn}
          tone="amber"
        />
        <PlanSection
          id="role-verify"
          title="Needs verification"
          detail="There is not enough evidence to call these strengths or gaps yet."
          items={plan.verify}
          tone="sky"
        />
        <PlanSection
          id="role-demonstrated"
          title="Already demonstrated"
          detail="Current FSRS evidence meets the existing mastered threshold."
          items={plan.demonstrated}
          tone="emerald"
        />
      </div>

      {analysis.unsupported.length > 0 && (
        <section
          className="mt-10 border-t border-white/[0.08] pt-7"
          aria-labelledby="role-uncovered"
        >
          <h2 id="role-uncovered" className="text-xl font-semibold text-rose-200">
            Not covered here
          </h2>
          <p className="mt-1 text-sm text-white/50">
            These requirements need a source outside the current curriculum.
          </p>
          <div className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {analysis.unsupported.map((item) => (
              <div key={`${item.label}-${item.sourcePhrase}`} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-white">{item.label}</h3>
                  <Badge tone={IMPORTANCE_TONE[item.importance]}>{item.importance}</Badge>
                </div>
                <p className="mt-2 text-sm text-white/55">“{item.sourcePhrase}”</p>
                <p className="mt-1 text-sm text-white/60">{item.rationale}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12 border-y border-white/[0.1] py-7" aria-label="Role plan next step">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Turn the map into evidence.</h2>
            <p className="mt-1 text-sm text-white/55">
              Sweep the role concepts first, then use the resulting gaps to choose drills and
              builds.
            </p>
          </div>
          {active ? (
            <Link
              to="/sweep?focus=role"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-white/90"
            >
              Start role Sweep <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Button onClick={onActivate} disabled={activating}>
              {activating ? 'Activating…' : 'Use this as my target'}
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}

function SavedRolePlan({ roleTitle, plan }: { roleTitle: string; plan: RoleFitPlan }) {
  return (
    <section id="active-role-plan" className="mt-12" aria-labelledby="saved-role-plan-title">
      <div className="border-t border-white/[0.1] pt-8">
        <p className="text-sm text-white/55">Saved learning target</p>
        <h2
          id="saved-role-plan-title"
          className="mt-2 text-3xl font-semibold tracking-tight text-white"
        >
          {roleTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
          Rebuilt from the canonical concept IDs in your profile and classified against your current
          mastery and Sweep evidence. The original job description was not retained.
        </p>
      </div>
      <div className="mt-10 space-y-10">
        <PlanSection
          id="saved-role-learn"
          title="Learn next"
          detail="Current evidence marks these concepts weak, fuzzy, new, or due."
          items={plan.learn}
          tone="amber"
        />
        <PlanSection
          id="saved-role-verify"
          title="Needs verification"
          detail="These role concepts do not have enough evidence yet."
          items={plan.verify}
          tone="sky"
        />
        <PlanSection
          id="saved-role-demonstrated"
          title="Already demonstrated"
          detail="Current FSRS evidence meets the mastered threshold."
          items={plan.demonstrated}
          tone="emerald"
        />
      </div>
      <div className="mt-10 border-y border-white/[0.1] py-6">
        <Link
          to="/sweep?focus=role"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black hover:bg-white/90"
        >
          Sweep role concepts <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export default function RoleFit() {
  const { user } = useAuth();
  const { profile, saveProfile } = useProfile();
  const { mastery } = useConceptMastery();
  const sweep = useMemo(() => loadSweep(user?.id), [user?.id]);
  const [roleTitle, setRoleTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [horizon, setHorizon] = useState(() =>
    profile.interviewHorizonDays ? String(profile.interviewHorizonDays) : ''
  );
  const [analysis, setAnalysis] = useState<RoleFitAnalysis | null>(null);
  const [submittedSource, setSubmittedSource] = useState<{
    jobDescription: string;
    sourceFingerprint: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [lastDeactivated, setLastDeactivated] = useState<RoleFocus | null>(null);
  const [showMapperOverride, setShowMapperOverride] = useState<boolean | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const plan = useMemo(
    () => (analysis ? buildRoleFitPlan(analysis, mastery, sweep.rated) : null),
    [analysis, mastery, sweep.rated]
  );
  const activePlan = useMemo(
    () => (profile.roleFocus ? buildActiveRolePlan(profile.roleFocus, mastery, sweep.rated) : null),
    [profile.roleFocus, mastery, sweep.rated]
  );
  const showMapper = showMapperOverride ?? !profile.roleFocus;
  const resultIsActive = Boolean(
    plan &&
      submittedSource &&
      roleFocusMatchesPlan(profile.roleFocus, plan, submittedSource.sourceFingerprint)
  );

  function invalidateAnalysis() {
    abortRef.current?.abort();
    setAnalyzing(false);
    setAnalysis(null);
    setSubmittedSource(null);
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!roleFitInputReady(jobDescription)) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const sourceSnapshot = jobDescription;
    const titleSnapshot = roleTitle;
    const horizonSnapshot = horizon;
    setAnalyzing(true);
    setError('');
    setAnalysis(null);
    try {
      const result = await analyzeRoleFit({
        jobDescription: sourceSnapshot,
        roleTitle: titleSnapshot,
        interviewHorizonDays: horizonSnapshot ? Number(horizonSnapshot) : null,
        aiConfig: loadAIConfig(),
        signal: controller.signal,
      });
      setAnalysis(result);
      setSubmittedSource({
        jobDescription: sourceSnapshot,
        sourceFingerprint: fingerprintRoleFitSource(sourceSnapshot),
      });
      setShowMapperOverride(false);
      requestAnimationFrame(() => document.getElementById('role-result')?.focus());
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      setError(caught instanceof Error ? caught.message : 'Role analysis failed. Try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function activate() {
    if (!analysis || !plan || !submittedSource) return;
    setActivating(true);
    setActionError('');
    setActionNotice('');
    try {
      const roleFocus = buildRoleFocus(
        analysis,
        plan,
        submittedSource.jobDescription,
        profile.roleFocus,
        new Date()
      );
      const saved = await saveProfile({
        roleFocus,
        roadmapWeights:
          Object.keys(plan.roadmapWeights).length > 0
            ? plan.roadmapWeights
            : profile.roadmapWeights,
        trackIds: plan.trackIds.length > 0 ? plan.trackIds : profile.trackIds,
        interviewHorizonDays: horizon ? Number(horizon) : null,
      });
      setLastDeactivated(null);
      if (user && saved.persistence === 'local') {
        setActionNotice(
          'The target is active on this device, but account sync was unavailable. It may not appear on another device yet.'
        );
      }
    } catch {
      setActionError('The role target could not be saved. Your analysis is still here; try again.');
    } finally {
      setActivating(false);
    }
  }

  async function deactivate() {
    if (!profile.roleFocus) return;
    setDeactivating(true);
    setActionError('');
    setActionNotice('');
    const previous = profile.roleFocus;
    try {
      const saved = await saveProfile({ roleFocus: undefined });
      setLastDeactivated(previous);
      setShowMapperOverride(true);
      if (user && saved.persistence === 'local') {
        setActionNotice(
          'The target was deactivated on this device, but account sync was unavailable.'
        );
      }
    } catch {
      setActionError('The role target could not be deactivated. Try again.');
    } finally {
      setDeactivating(false);
    }
  }

  async function undoDeactivate() {
    if (!lastDeactivated) return;
    setActionError('');
    setActionNotice('');
    try {
      const saved = await saveProfile({ roleFocus: lastDeactivated });
      setLastDeactivated(null);
      setShowMapperOverride(false);
      if (user && saved.persistence === 'local') {
        setActionNotice(
          'The target was restored on this device, but account sync was unavailable.'
        );
      }
    } catch {
      setActionError('The role target could not be restored. Try again.');
    }
  }

  return (
    <PageShell>
      <Link
        to="/learn"
        className="mb-7 inline-flex min-h-11 items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>
      <PageHeader
        eyebrow="Role fit"
        title="Turn the role into a learning target."
        subtitle="Paste the job description. The app grounds each requirement in the existing curriculum, compares it with your evidence, and says what to verify or learn next."
      />

      {profile.roleFocus && (
        <ActiveRole
          roleTitle={profile.roleFocus.roleTitle}
          targetCount={profile.roleFocus.targetConceptIds.length}
          supportingCount={profile.roleFocus.supportingConceptIds.length}
          deactivating={deactivating}
          onChangeTarget={() => setShowMapperOverride(true)}
          onDeactivate={() => void deactivate()}
        />
      )}

      {actionError && (
        <div
          role="alert"
          className="mb-6 flex gap-3 rounded-lg border border-rose-200/25 bg-rose-200/5 px-4 py-3 text-sm text-rose-100"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionNotice && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-amber-200/25 bg-amber-200/5 px-4 py-3 text-sm text-amber-100"
        >
          {actionNotice}
        </div>
      )}

      {lastDeactivated && !profile.roleFocus && (
        <div
          role="status"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.1] py-4 text-sm text-white/70"
        >
          <span>{lastDeactivated.roleTitle} was deactivated.</span>
          <button
            type="button"
            onClick={() => void undoDeactivate()}
            className="inline-flex min-h-11 items-center font-medium text-white hover:text-white/75"
          >
            Undo
          </button>
        </div>
      )}

      {!showMapper && (
        <section className="border-y border-white/[0.08] py-4" aria-label="Job description input">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-white/60">
              {analysis
                ? 'Mapping complete. The pasted description remains only in this page session.'
                : 'Your active plan is available below. The original description was not saved.'}
            </p>
            <button
              type="button"
              onClick={() => setShowMapperOverride(true)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-white hover:text-white/75"
            >
              {analysis ? 'Edit input' : 'Map another role'}
            </button>
          </div>
        </section>
      )}

      {showMapper && (
        <form id="role-fit-mapper" onSubmit={(event) => void submit(event)} aria-busy={analyzing}>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
            <div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-white">Role title</span>
                  <span className="mt-1 block text-xs text-white/60">
                    Optional; the model can infer it.
                  </span>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(event) => {
                      invalidateAnalysis();
                      setRoleTitle(event.target.value);
                    }}
                    maxLength={120}
                    placeholder="Senior Backend Engineer"
                    className="mt-2 min-h-12 w-full rounded-md border border-white/15 bg-white/[0.025] px-3 text-sm text-white outline-none placeholder:text-white/35 focus-visible:border-white/60 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-white">Interview horizon</span>
                  <span className="mt-1 block text-xs text-white/60">
                    Shapes the activated profile.
                  </span>
                  <select
                    value={horizon}
                    onChange={(event) => {
                      invalidateAnalysis();
                      setHorizon(event.target.value);
                    }}
                    className="mt-2 min-h-12 w-full rounded-md border border-white/15 bg-black px-3 text-sm text-white outline-none focus-visible:border-white/60 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    {HORIZONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-6 block" htmlFor="job-description">
                <span className="text-sm font-medium text-white">Job description</span>
                <span id="job-description-help" className="mt-1 block text-xs text-white/60">
                  Paste the responsibilities and requirements—not your resume.
                </span>
              </label>
              <textarea
                id="job-description"
                aria-describedby="job-description-help job-description-count"
                value={jobDescription}
                onChange={(event) => {
                  invalidateAnalysis();
                  setJobDescription(event.target.value);
                }}
                maxLength={ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS}
                rows={13}
                placeholder="Paste the complete job description here…"
                className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-white/[0.025] px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-white/35 focus-visible:border-white/60 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-white/60">
                  Minimum {ROLE_FIT_MIN_JOB_DESCRIPTION_CHARS} characters
                </span>
                <span id="job-description-count" className="font-mono text-[10px] text-white/60">
                  {jobDescription.length.toLocaleString()} /{' '}
                  {ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS.toLocaleString()}
                </span>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mt-5 flex gap-3 rounded-lg border border-rose-200/25 bg-rose-200/5 px-4 py-3 text-sm text-rose-100"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <p className="mt-5 text-xs leading-relaxed text-white/65 lg:hidden">
                The description is sent once to the configured AI provider and is not saved by this
                app.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button type="submit" disabled={!roleFitInputReady(jobDescription) || analyzing}>
                  {analyzing ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" />{' '}
                      Mapping the role…
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" /> Map role to curriculum
                    </>
                  )}
                </Button>
                <span className="text-xs text-white/60">
                  {user
                    ? 'Owner deployment AI or your configured provider.'
                    : 'Guest mode uses your configured provider.'}
                </span>
              </div>
            </div>

            <aside className="border-t border-white/[0.08] pt-6 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-200" /> Private by default
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                The description is sent once to the configured AI provider. This app does not save
                the raw text or provider response.
              </p>

              <div className="mt-7 flex items-center gap-2 text-sm font-medium text-white">
                <ClipboardPaste className="h-4 w-4 text-sky-200" /> What comes back
              </div>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-white/50">
                <li>Exact requirement phrases and validated concept links.</li>
                <li>Existing strengths, unverified claims, and actual gaps kept separate.</li>
                <li>Unsupported requirements named honestly.</li>
              </ul>
            </aside>
          </div>
        </form>
      )}

      {analysis && plan && (
        <RoleFitResult
          analysis={analysis}
          plan={plan}
          active={resultIsActive}
          activating={activating}
          onActivate={() => void activate()}
        />
      )}

      {!analysis && !showMapper && profile.roleFocus && activePlan && (
        <SavedRolePlan roleTitle={profile.roleFocus.roleTitle} plan={activePlan} />
      )}
    </PageShell>
  );
}
