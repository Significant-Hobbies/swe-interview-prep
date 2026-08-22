import { ArrowLeft, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { FormulaExplainer } from '../components/FormulaExplainer';
import { FORMULAS } from '../data/formulas';
import { CONCEPT_BY_ID } from '../data/learning-os';
import { searchNotation } from '../data/notation';

export default function NotationReference() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchNotation(query), [query]);
  const formulaResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return FORMULAS;
    return FORMULAS.filter((formula) =>
      [
        formula.title,
        formula.expression,
        formula.scaling,
        formula.kind,
        ...formula.assumptions,
        ...formula.symbols.flatMap((symbol) => [symbol.symbol, symbol.meaning, symbol.unit]),
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">
      <Link
        to="/learn"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Learn
      </Link>
      <header className="mt-5 max-w-3xl">
        <p className="text-sm text-white/55">Notation reference</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Read the symbols, then reason.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
          Search the high-value notation used across inference, evaluation, probability, and
          performance work. Every symbol includes its boundary and units.
        </p>
      </header>

      <label className="mt-9 flex min-h-14 items-center gap-3 rounded-lg border border-white/15 px-4 focus-within:border-white/30">
        <Search className="h-4 w-4 text-white/45" />
        <span className="sr-only">Search notation</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search symbol, name, unit, or topic"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/40"
        />
      </label>

      <p className="mt-3 text-xs text-white/60" role="status" aria-live="polite">
        {formulaResults.length} formulas · {results.length} symbol definitions
      </p>
      {formulaResults.length > 0 && (
        <section className="mt-6" aria-labelledby="formula-results">
          <h2 id="formula-results" className="text-lg font-semibold text-white">
            Formulas and bounds
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.08]">
            {formulaResults.map((formula) => (
              <FormulaExplainer key={formula.id} formula={formula} />
            ))}
          </div>
        </section>
      )}
      <h2 className="mt-10 text-lg font-semibold text-white">Symbols and notation</h2>
      <dl className="mt-4 divide-y divide-white/[0.08] border-y border-white/[0.08]">
        {results.map((item) => (
          <div key={item.id} className="grid gap-4 py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-7">
            <div>
              <dt className="font-mono text-2xl text-white">{item.symbol}</dt>
              <dd className="mt-1 text-xs text-white/60">{item.pronunciation}</dd>
            </div>
            <div>
              <h2 className="font-semibold text-white">{item.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.meaning}</p>
              <p className="mt-2 text-xs leading-relaxed text-amber-100/70">
                Boundary: {item.scope}
              </p>
              <p className="mt-1 font-mono text-xs text-white/60">Unit: {item.unit}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {item.conceptIds.map((conceptId) => (
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
          </div>
        ))}
      </dl>
      {results.length === 0 && formulaResults.length === 0 && (
        <p className="py-12 text-sm text-white/50">No formula or notation matches that query.</p>
      )}
    </div>
  );
}
