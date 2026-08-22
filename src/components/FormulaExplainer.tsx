import { ChevronDown, ExternalLink, Sigma } from 'lucide-react';

import type { FormulaDefinition } from '../data/formulas';

export function FormulaExplainer({ formula }: { formula: FormulaDefinition }) {
  return (
    <details className="group border-t border-white/[0.08] first:border-t-0">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/60">
        <span className="flex min-w-0 items-center gap-3">
          <Sigma className="h-4 w-4 shrink-0 text-sky-300" aria-hidden="true" />
          <span className="font-medium text-white/85">{formula.title}</span>
        </span>
        <span className="flex min-w-0 items-center gap-3">
          <code className="hidden min-w-0 overflow-x-auto text-xs text-white/50 sm:block">
            {formula.expression}
          </code>
          <ChevronDown className="h-4 w-4 shrink-0 text-white/45 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="border-t border-white/[0.08] px-4 py-5">
        <code className="block overflow-x-auto text-sm text-white sm:hidden">
          {formula.expression}
        </code>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-medium text-white/50">Symbols and units</h4>
            <dl className="mt-3 space-y-2">
              {formula.symbols.map((symbol) => (
                <div key={symbol.symbol} className="grid grid-cols-[4rem_1fr] gap-3 text-xs">
                  <dt className="font-mono text-white">{symbol.symbol}</dt>
                  <dd className="text-white/60">
                    {symbol.meaning} <span className="text-white/60">· {symbol.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h4 className="text-xs font-medium text-white/50">Worked substitution</h4>
            <p className="mt-3 font-mono text-xs leading-relaxed text-white/70">
              {formula.workedExample.substitution} ={' '}
              <span className="text-white">{formula.workedExample.result}</span>
            </p>
            <p className="mt-3 text-xs leading-relaxed text-white/55">{formula.scaling}</p>
          </div>
        </div>
        <div className="mt-5 border-t border-white/[0.08] pt-4">
          <p className="text-xs leading-relaxed text-white/55">
            <span className="text-white/80">
              {formula.kind === 'bound' ? 'Bound' : 'Assumptions'}:
            </span>{' '}
            {formula.assumptions.join(' ')}
          </p>
          <a
            href={formula.source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-2 text-xs text-sky-300 hover:text-sky-200"
          >
            {formula.source.label} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </details>
  );
}
