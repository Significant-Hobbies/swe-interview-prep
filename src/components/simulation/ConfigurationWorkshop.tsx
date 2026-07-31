import { CheckCircle2, CircleAlert, RotateCcw, Wrench } from 'lucide-react';
import { useState } from 'react';

import {
  configurationPassed,
  initialConfigurationFiles,
  validateConfiguration,
} from '../../lib/simulation/configuration';
import type { ConfigurationChallenge, ConfigurationCheckResult } from '../../lib/simulation/types';
import { Badge, Button, Card } from '../ui';

export default function ConfigurationWorkshop({
  challenge,
  passed,
  initialFiles,
  onValidationChange,
}: {
  challenge: ConfigurationChallenge;
  passed: boolean;
  initialFiles: Record<string, string>;
  onValidationChange: (
    passed: boolean,
    evidenceIds: string[],
    files: Record<string, string>
  ) => void;
}) {
  const [files, setFiles] = useState(() => {
    const expectedIds = challenge.files.map((file) => file.id);
    return expectedIds.every((id) => typeof initialFiles[id] === 'string')
      ? { ...initialFiles }
      : initialConfigurationFiles(challenge);
  });
  const [activeFileId, setActiveFileId] = useState(challenge.files[0].id);
  const [results, setResults] = useState<ConfigurationCheckResult[] | null>(null);
  const activeFile = challenge.files.find((file) => file.id === activeFileId)!;

  function updateActiveFile(content: string) {
    const nextFiles = { ...files, [activeFileId]: content };
    setFiles(nextFiles);
    setResults(null);
    if (passed) onValidationChange(false, [], nextFiles);
  }

  function validate() {
    const nextResults = validateConfiguration(challenge, files);
    const nextPassed = configurationPassed(nextResults);
    setResults(nextResults);
    onValidationChange(nextPassed, nextPassed ? nextResults.map((result) => result.id) : [], files);
  }

  function reset() {
    const starterFiles = initialConfigurationFiles(challenge);
    setFiles(starterFiles);
    setActiveFileId(challenge.files[0].id);
    setResults(null);
    onValidationChange(false, [], starterFiles);
  }

  const passedCount = results?.filter((result) => result.passed).length ?? 0;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/[0.08] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Wrench className="h-4 w-4 text-white/45" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-white">{challenge.title}</h3>
              {passed && <Badge tone="emerald">configuration verified</Badge>}
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-white/50">
              {challenge.summary}
            </p>
          </div>
          <div className="font-mono text-[10px] text-white/50">
            {challenge.slots.length} setup checks
          </div>
        </div>
        <p className="mt-3 rounded-md border border-white/10 bg-black px-3 py-2 text-xs leading-relaxed text-white/60">
          {challenge.objective}
        </p>
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
            Delivery brief
          </div>
          <ul className="mt-2 space-y-1.5">
            {challenge.requirements.map((requirement) => (
              <li key={requirement} className="flex gap-2 text-xs leading-relaxed text-white/50">
                <span className="text-white/25" aria-hidden="true">
                  —
                </span>
                {requirement}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="min-w-0 border-b border-white/[0.08] lg:border-r lg:border-b-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-2">
            <div className="flex flex-wrap gap-1">
              {challenge.files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setActiveFileId(file.id)}
                  aria-pressed={file.id === activeFileId}
                  className={`min-h-11 rounded-md px-2.5 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 ${
                    file.id === activeFileId
                      ? 'bg-white/[0.08] text-white'
                      : 'text-white/55 hover:text-white/70'
                  }`}
                >
                  {file.label}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10px] text-white/50">{activeFile.path}</span>
          </div>
          <label htmlFor={`configuration-${challenge.id}-${activeFile.id}`} className="sr-only">
            Edit {activeFile.path}
          </label>
          <textarea
            id={`configuration-${challenge.id}-${activeFile.id}`}
            value={files[activeFile.id]}
            onChange={(event) => updateActiveFile(event.target.value)}
            spellCheck={false}
            className="block h-[30rem] w-full resize-y bg-black p-4 font-mono text-xs leading-relaxed text-white/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-sky-400"
          />
          <div className="flex flex-wrap gap-2 border-t border-white/[0.08] p-3">
            <Button onClick={validate} className="min-h-11 rounded-md">
              <CheckCircle2 className="h-4 w-4" /> Validate build
            </Button>
            <Button tone="ghost" onClick={reset} className="min-h-11 rounded-md">
              <RotateCcw className="h-4 w-4" /> Reset files
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-medium text-white">Configuration checks</h4>
            {results && (
              <span className="font-mono text-[10px] text-white/50">
                {passedCount}/{results.length} pass
              </span>
            )}
          </div>
          {!results ? (
            <p className="mt-3 text-xs leading-relaxed text-white/55">
              Repair the marked setup decisions, then validate. Failures identify the broken
              contract without supplying the replacement line.
            </p>
          ) : (
            <ul className="mt-3 space-y-3" aria-live="polite">
              {results.map((result) => (
                <li key={result.id} className="flex gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-white">{result.label}</div>
                    <p className="mt-1 text-xs leading-relaxed text-white/55">
                      {result.passed ? result.evidence : result.hint}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {results && configurationPassed(results) && (
            <div className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-400/[0.06] px-3 py-2 text-xs leading-relaxed text-emerald-100">
              The configuration satisfies every deterministic setup contract. You still need to run
              the model and explain why it works.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
