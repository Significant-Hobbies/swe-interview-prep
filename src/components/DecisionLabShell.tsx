import { ArrowLeft, CheckCircle2, Gauge, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useLearningEvidence } from '../hooks/useLearningEvidence';
import {
  appendDecisionReceipt,
  type DecisionLabId,
  type DecisionReceiptV1,
} from '../lib/learningEvidence';
import { createDecisionReceipt } from '../lib/decisionLabs';
import { isPassingFeynmanGrade } from '../lib/feynmanRating';
import {
  clearDecisionLabDraft,
  loadDecisionLabDraft,
  saveDecisionLabDraft,
} from '../lib/learningContinuity';
import FeynmanGate from './FeynmanGate';
import { FormulaExplainer } from './FormulaExplainer';
import { FORMULA_BY_ID } from '../data/formulas';

interface DecisionLabField {
  id: string;
  label: string;
  unit: string;
  initial: number;
  min?: number;
  step?: number;
  group: string;
}

export interface DecisionLabDefinition {
  id: DecisionLabId;
  version: number;
  title: string;
  summary: string;
  estimatedMinutes: number;
  conceptIds: string[];
  fields: DecisionLabField[];
  predictionPrompt: string;
  predictionExample: string;
  formulaIds: string[];
  presets?: Array<{
    id: string;
    label: string;
    description: string;
    values: Record<string, number>;
  }>;
  calculate: (values: Record<string, number>) => Record<string, number | string | boolean>;
}

export function DecisionLabShell({ definition }: { definition: DecisionLabDefinition }) {
  const { accountScope, decisionReceipts } = useLearningEvidence();
  const savedDraft = useMemo(
    () => loadDecisionLabDraft(accountScope, definition.id, definition.version),
    [accountScope, definition.id, definition.version]
  );
  const [values, setValues] = useState<Record<string, number>>(
    () =>
      savedDraft?.values ??
      Object.fromEntries(definition.fields.map((field) => [field.id, field.initial]))
  );
  const [prediction, setPrediction] = useState(savedDraft?.prediction ?? '');
  const [derived, setDerived] = useState<Record<string, number | string | boolean> | null>(
    savedDraft?.derived ?? null
  );
  const [conclusion, setConclusion] = useState(savedDraft?.conclusion ?? '');
  const [mitigation, setMitigation] = useState(savedDraft?.mitigation ?? '');
  const [counterfactual, setCounterfactual] = useState(savedDraft?.counterfactual ?? '');
  const [verificationMetric, setVerificationMetric] = useState(
    savedDraft?.verificationMetric ?? ''
  );
  const [receipt, setReceipt] = useState<DecisionReceiptV1 | null>(null);
  const [error, setError] = useState('');
  const [feynmanOpen, setFeynmanOpen] = useState(false);

  const priorReceipts = useMemo(
    () => decisionReceipts.filter((candidate) => candidate.labId === definition.id),
    [decisionReceipts, definition.id]
  );

  useEffect(() => {
    if (receipt) {
      clearDecisionLabDraft(accountScope, definition.id);
      return;
    }
    saveDecisionLabDraft(accountScope, {
      schemaVersion: 1,
      labId: definition.id,
      definitionVersion: definition.version,
      values,
      prediction,
      derived,
      conclusion,
      mitigation,
      counterfactual,
      verificationMetric,
      updatedAt: new Date().toISOString(),
    });
  }, [
    accountScope,
    conclusion,
    counterfactual,
    definition.id,
    definition.version,
    derived,
    mitigation,
    prediction,
    receipt,
    values,
    verificationMetric,
  ]);

  function resetAttempt(nextValues = values) {
    setValues(nextValues);
    setPrediction('');
    setDerived(null);
    setConclusion('');
    setMitigation('');
    setCounterfactual('');
    setVerificationMetric('');
    setReceipt(null);
    setError('');
  }

  function changeValue(fieldId: string, raw: string) {
    const next = { ...values, [fieldId]: Number(raw) };
    if (derived || receipt) resetAttempt(next);
    else setValues(next);
  }

  function reveal() {
    if (prediction.trim().length < 10) {
      setError('Write a concrete prediction before revealing the calculation.');
      return;
    }
    try {
      setDerived(definition.calculate(values));
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The declared inputs are invalid.');
    }
  }

  function saveReceipt() {
    if (!derived) return;
    try {
      const next = createDecisionReceipt({
        accountScope,
        labId: definition.id,
        definitionVersion: definition.version,
        conceptIds: definition.conceptIds,
        inputs: values,
        derived,
        prediction,
        conclusion,
        mitigation,
        counterfactual,
        verificationMetric,
      });
      appendDecisionReceipt(next);
      setReceipt(next);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The decision receipt is incomplete.');
    }
  }

  function markVerified(grade: number) {
    if (!receipt || !isPassingFeynmanGrade(grade)) return;
    const createdAt = new Date().toISOString();
    appendDecisionReceipt({
      ...receipt,
      id: `${receipt.id}:verified:${createdAt}`,
      evidenceState: 'verified',
      masteryStatus: 'applied',
      conclusion: `${receipt.conclusion} Feynman grade: ${grade}.`,
      createdAt,
    });
    setFeynmanOpen(false);
  }

  const receiptReady =
    derived &&
    conclusion.trim() &&
    mitigation.trim() &&
    counterfactual.trim() &&
    verificationMetric.trim();
  const fieldGroups = useMemo(
    () =>
      Array.from(new Set(definition.fields.map((field) => field.group))).map((group) => ({
        group,
        fields: definition.fields.filter((field) => field.group === group),
      })),
    [definition.fields]
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 lg:py-14">
      <Link
        to="/labs"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Labs
      </Link>

      <header className="mt-5 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
          <span>Decision lab</span>
          <span aria-hidden="true">·</span>
          <span>v{definition.version}</span>
          <span aria-hidden="true">·</span>
          <span>{definition.estimatedMinutes} min</span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {definition.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{definition.summary}</p>
      </header>

      <ol className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.08] text-xs lg:hidden [&>li]:bg-black [&>li]:p-3">
        <LadderStep done={Boolean(derived)} label="Prediction" />
        <LadderStep done={Boolean(derived)} label="Calculation" />
        <LadderStep done={Boolean(receipt)} label="Receipt" />
        <LadderStep
          done={priorReceipts.some((item) => item.evidenceState === 'verified')}
          label="Explanation"
        />
      </ol>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <div>
          <section aria-labelledby="declared-inputs">
            <div className="flex items-center justify-between gap-4">
              <h2 id="declared-inputs" className="text-lg font-semibold text-white">
                Declared inputs
              </h2>
              <span className="text-xs text-white/60">
                {savedDraft ? 'Draft restored · ' : ''}Inputs lock after reveal
              </span>
            </div>
            {definition.presets && definition.presets.length > 0 && (
              <label className="mt-4 block max-w-sm text-xs text-white/60">
                Start from a declared scenario
                <select
                  defaultValue=""
                  disabled={Boolean(derived)}
                  onChange={(event) => {
                    const preset = definition.presets?.find(
                      (candidate) => candidate.id === event.target.value
                    );
                    if (preset) resetAttempt({ ...preset.values });
                  }}
                  className="mt-2 h-11 w-full rounded-md border border-white/20 bg-black px-3 text-sm text-white outline-none focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/50"
                >
                  <option value="">Current values</option>
                  {definition.presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label} — {preset.description}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="mt-4 space-y-5">
              {fieldGroups.map(({ group, fields }) => (
                <fieldset key={group}>
                  <legend className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-white/60">
                    {group}
                  </legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {fields.map((field) => (
                      <label
                        key={field.id}
                        className="rounded-xl border border-white/[0.08] bg-black p-4 text-xs text-white/60"
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span>{field.label}</span>
                          <span className="font-mono text-white/60">{field.unit}</span>
                        </span>
                        <input
                          type="number"
                          value={values[field.id]}
                          min={field.min ?? 0}
                          step={field.step ?? 1}
                          onChange={(event) => changeValue(field.id, event.target.value)}
                          disabled={Boolean(derived)}
                          className="mt-2 h-11 w-full rounded-md border border-white/20 bg-black px-3 font-mono text-sm text-white outline-none focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/50 disabled:cursor-not-allowed disabled:text-white/60"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <section
            className="mt-8 border-t border-white/[0.08] pt-7"
            aria-labelledby="decision-aids"
          >
            <h2 id="decision-aids" className="text-lg font-semibold text-white">
              Decision aids
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Keep the governing relationship and its exclusions visible before you predict.
            </p>
            <div className="mt-4 rounded-xl border border-white/[0.08]">
              {definition.formulaIds.map((formulaId) => (
                <FormulaExplainer key={formulaId} formula={FORMULA_BY_ID[formulaId]} />
              ))}
            </div>
          </section>

          <section className="mt-8 border-t border-white/[0.08] pt-7" aria-labelledby="prediction">
            <h2 id="prediction" className="text-lg font-semibold text-white">
              Freeze your prediction
            </h2>
            <p id="prediction-prompt" className="mt-2 text-sm leading-relaxed text-white/60">
              {definition.predictionPrompt}
            </p>
            <textarea
              aria-labelledby="prediction"
              aria-describedby="prediction-prompt"
              value={prediction}
              onChange={(event) => setPrediction(event.target.value)}
              disabled={Boolean(derived)}
              rows={3}
              className="mt-4 w-full resize-y rounded-md border border-white/20 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/50 disabled:text-white/60"
              placeholder={definition.predictionExample}
            />
            <button
              type="button"
              onClick={reveal}
              disabled={Boolean(derived)}
              className="mt-3 min-h-11 rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {derived ? 'Prediction frozen' : 'Freeze and reveal'}
            </button>
          </section>

          {derived && (
            <section
              className="mt-8 border-t border-white/[0.08] pt-7"
              aria-labelledby="calculation"
            >
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-sky-300" />
                <h2 id="calculation" className="text-lg font-semibold text-white">
                  Calculated evidence
                </h2>
              </div>
              <button
                type="button"
                onClick={() => resetAttempt(values)}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                <RotateCcw className="h-4 w-4" /> Change inputs · new attempt
              </button>
              <dl className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">
                {Object.entries(derived).map(([key, value]) => (
                  <div
                    key={key}
                    className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6"
                  >
                    <dt className="text-sm text-white/50">{humanize(key)}</dt>
                    <dd className="font-mono text-sm text-white sm:text-right">
                      {formatValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-white/60">
                This is deterministic arithmetic over declared inputs—not a latency forecast or a
                live system measurement.
              </p>
            </section>
          )}

          {derived && (
            <section className="mt-8 border-t border-white/[0.08] pt-7" aria-labelledby="decision">
              <h2 id="decision" className="text-lg font-semibold text-white">
                Turn the result into a decision
              </h2>
              <p id="receipt-requirements" className="mt-2 text-xs leading-relaxed text-white/60">
                All four fields are required. State claims in terms another engineer could inspect.
              </p>
              <div className="mt-4 space-y-4">
                <DecisionField label="Conclusion" value={conclusion} onChange={setConclusion} />
                <DecisionField label="Mitigation" value={mitigation} onChange={setMitigation} />
                <DecisionField
                  label="Counterfactual"
                  value={counterfactual}
                  onChange={setCounterfactual}
                />
                <DecisionField
                  label="Verification metric"
                  value={verificationMetric}
                  onChange={setVerificationMetric}
                />
              </div>
              <button
                type="button"
                onClick={saveReceipt}
                disabled={!receiptReady || Boolean(receipt)}
                aria-describedby="receipt-requirements"
                className="mt-5 min-h-11 rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                {receipt ? 'Receipt saved' : 'Save immutable receipt'}
              </button>
            </section>
          )}

          {error && (
            <p className="mt-5 text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}

          {receipt && (
            <section
              className="mt-8 rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-5"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                <div>
                  <h2 className="font-semibold text-white">
                    Evidence saved; mastery still pending
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    The calculation and receipt are preserved locally. Only an accepted causal
                    explain-back can update linked FSRS records.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setFeynmanOpen(true)}
                      className="min-h-11 rounded-md bg-white px-4 py-2 text-sm font-medium text-black"
                    >
                      Explain for mastery
                    </button>
                    <button
                      type="button"
                      onClick={() => resetAttempt()}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4" /> New attempt
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:border-l lg:border-white/[0.08] lg:pl-8">
          <div className="sticky top-24">
            <h2 className="text-sm font-semibold text-white">Evidence ladder</h2>
            <ol className="mt-4 space-y-3 text-xs leading-relaxed text-white/50">
              <LadderStep done={Boolean(derived)} label="Prediction frozen" />
              <LadderStep done={Boolean(derived)} label="Calculation inspected" />
              <LadderStep done={Boolean(receipt)} label="Decision receipt complete" />
              <LadderStep
                done={priorReceipts.some((item) => item.evidenceState === 'verified')}
                label="Causal explanation verified"
              />
            </ol>
            <p className="mt-5 text-xs leading-relaxed text-white/60">
              These states stay separate. A green calculator never becomes fabricated mastery.
            </p>

            {priorReceipts.length > 0 && (
              <div className="mt-8 border-t border-white/[0.08] pt-6">
                <h2 className="text-sm font-semibold text-white">Versioned receipts</h2>
                <ul className="mt-3 space-y-3">
                  {priorReceipts.slice(0, 4).map((item) => (
                    <li key={item.id} className="text-xs text-white/50">
                      <div className="font-mono text-white/70">v{item.definitionVersion}</div>
                      <div className="mt-1">{item.evidenceState.replace('-', ' ')}</div>
                      <time className="mt-1 block text-white/60">
                        {new Date(item.createdAt).toLocaleString()}
                      </time>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>

      <FeynmanGate
        open={feynmanOpen}
        onClose={() => setFeynmanOpen(false)}
        problem={definition.predictionPrompt}
        problemId={`decision-lab:${definition.id}:v${definition.version}`}
        conceptIds={definition.conceptIds}
        artifact={{
          type: 'decision-receipt',
          title: definition.title,
          context: receipt ? JSON.stringify(receipt, null, 2) : '',
        }}
        onGraded={markVerified}
      />
    </div>
  );
}

function DecisionField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `decision-${label.toLowerCase().replaceAll(' ', '-')}`;
  return (
    <label className="block text-xs font-medium text-white/60" htmlFor={id}>
      {label} <span className="text-white/60">(required)</span>
      <textarea
        id={id}
        required
        aria-describedby="receipt-requirements"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="mt-2 w-full resize-y rounded-md border border-white/20 bg-black px-3 py-2 text-sm font-normal text-white outline-none placeholder:text-white/50 focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/50"
        placeholder={`State the ${label.toLowerCase()} in inspectable terms.`}
      />
    </label>
  );
}

function LadderStep({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" />
      )}
      <span className={done ? 'text-white/80' : undefined}>{label}</span>
    </li>
  );
}

function humanize(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replaceAll('-', ' ')
    .toLowerCase();
}

function formatValue(value: number | string | boolean): string {
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return String(value).replaceAll('-', ' ');
}
