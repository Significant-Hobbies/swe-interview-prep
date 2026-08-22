import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { CONCEPT_BY_ID, CONCEPTS } from '../data/learning-os';

function ConceptList({ ids, empty }: { ids: string[]; empty: string }) {
  if (ids.length === 0) return <p className="py-4 text-sm text-white/60">{empty}</p>;
  return (
    <ul className="divide-y divide-white/[0.08]">
      {ids.map((id) => {
        const concept = CONCEPT_BY_ID[id];
        if (!concept) return null;
        return (
          <li key={id}>
            <Link
              to={`/learn/map/${id}`}
              className="flex min-h-16 items-center justify-between gap-4 py-3 text-sm text-white/70 hover:text-white"
            >
              <span>{concept.name}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-white/35" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function KnowledgeMap() {
  const { conceptId } = useParams();
  const concept = CONCEPT_BY_ID[conceptId ?? ''];
  if (!concept)
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-sm text-white/55">
        Concept map not found.
      </div>
    );
  const unlocks = CONCEPTS.filter((candidate) => candidate.prerequisites.includes(concept.id)).map(
    (candidate) => candidate.id
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 lg:py-16">
      <Link
        to={`/concepts/${concept.id}`}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Concept
      </Link>
      <header className="mt-5 max-w-3xl">
        <p className="text-sm text-white/55">Knowledge topography</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {concept.name}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
          {concept.description}
        </p>
        <Link
          to={`/study/concept/${concept.id}`}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black"
        >
          Start focused study <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <section>
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">Build first</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Prerequisites</h2>
          <ConceptList ids={concept.prerequisites} empty="No declared prerequisites." />
        </section>
        <section className="rounded-xl border border-sky-300/20 bg-sky-300/[0.035] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-sky-200/70">Current node</p>
          <h2 className="mt-2 text-lg font-semibold text-white">{concept.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            {concept.mentalModel ?? concept.description}
          </p>
          <Link
            to={`/concepts/${concept.id}`}
            className="mt-4 inline-flex min-h-11 items-center text-sm text-sky-300"
          >
            Open full concept
          </Link>
        </section>
        <section>
          <p className="text-xs uppercase tracking-[0.14em] text-white/60">Explore sideways</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Related concepts</h2>
          <ConceptList ids={concept.related} empty="No declared related concepts." />
        </section>
      </div>

      <section className="mt-10 border-t border-white/[0.08] pt-7">
        <p className="text-xs uppercase tracking-[0.14em] text-white/60">What this unlocks</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Downstream concepts</h2>
        <ConceptList ids={unlocks} empty="No downstream prerequisite edges are declared yet." />
      </section>
    </div>
  );
}
