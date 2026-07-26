import { ArrowLeft, Gauge, Layers, Undo2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  Badge,
  Button,
  Card,
  DIFFICULTY_COLOR,
  EmptyState,
  PageHeader,
  PageShell,
  ProgressBar,
  SectionTitle,
  SessionStatBar,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { CONCEPTS, REVIEW_QUESTIONS, type Concept } from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { useProfile } from '../hooks/useProfile';
import { useReviewMastery } from '../hooks/useReviewMastery';
import { rankDomains } from '../lib/roi';
import { recordSessionActivity } from '../lib/session';
import {
  buildSweepQueue,
  isThinConcept,
  loadSweep,
  recordSweepRating,
  saveSweep,
  SWEEP_RATINGS,
  type SweepRating,
  type SweepState,
  sweepCoverage,
  sweepWrites,
} from '../lib/sweep';

const ALL_DOMAINS = 'all';

/** Tone classes for the three rating buttons, matching the app's quiet palette. */
const RATING_CLASS: Record<SweepRating, string> = {
  known: 'border-emerald-200/25 text-emerald-200 hover:bg-emerald-200/10',
  fuzzy: 'border-amber-200/25 text-amber-200 hover:bg-amber-200/10',
  new: 'border-rose-200/25 text-rose-200 hover:bg-rose-200/10',
};

function DomainPicker() {
  const { profile, saveProfile } = useProfile();
  const { user } = useAuth();
  const [sweep] = useState<SweepState>(() => loadSweep(user?.id));
  const muted = useMemo(() => profile.mutedTags ?? [], [profile.mutedTags]);
  const overall = useMemo(() => sweepCoverage(CONCEPTS, sweep.rated), [sweep.rated]);
  const ranked = useMemo(
    () => rankDomains(CONCEPTS, { rated: sweep.rated, muted }),
    [sweep.rated, muted]
  );
  const top = ranked[0];

  function toggleMute(tag: string) {
    const next = muted.includes(tag) ? muted.filter((t) => t !== tag) : [...muted, tag];
    void saveProfile({ mutedTags: next });
  }

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Sweep"
        title="Cover the map, then keep only the gaps"
        subtitle="Read each concept's mental model and say whether you know it. Known concepts are recorded and left alone — only Fuzzy and New are seeded into your review queue, so the daily cost stays small."
      />

      <div className="mb-8">
        <SessionStatBar
          items={[
            { label: 'Concepts', value: overall.total },
            { label: 'Triaged', value: `${overall.percent}%`, hint: `${overall.rated} rated` },
            { label: 'Known', value: overall.known },
            { label: 'Fuzzy', value: overall.fuzzy },
            { label: 'New', value: overall.new },
          ]}
        />
      </div>

      {top && (
        <Card className="mb-8 p-5">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            {/* The caveat is about THIS domain, not the app as a whole — having
                swept elsewhere says nothing about how much of this one you know. */}
            {top.swept ? 'Highest ROI' : 'Highest ROI · untriaged, so this is an upper bound'}
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-xl font-semibold text-white">{top.tag}</span>
            <span className="text-sm text-white/50">
              {top.unknown} unknown
              {top.thin > 0 && ` · ${top.thin} too thin to learn from here`}
            </span>
          </div>
          <p className="mt-3 text-sm text-white/60">
            {top.hub ? (
              <>
                <a
                  href={top.hub.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white underline-offset-4 hover:underline"
                >
                  {top.hub.label} ↗
                </a>{' '}
                covers {top.hub.covers} of them — likely a better use of an hour than more cards.
              </>
            ) : (
              'No single outside source in the catalog covers enough of this domain to recommend. Sweeping it will at least tell you which gaps matter.'
            )}
          </p>
          <div className="mt-4">
            <Link to={`/sweep?domain=${top.tag}`}>
              <Button>Sweep {top.tag}</Button>
            </Link>
          </div>
        </Card>
      )}

      <SectionTitle
        action={
          <Link
            to={`/sweep?domain=${ALL_DOMAINS}`}
            className="text-xs text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            Sweep everything →
          </Link>
        }
      >
        Domains by payoff
      </SectionTitle>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((domain) => (
          <Card key={domain.tag} className="p-4">
            <div className="flex items-baseline justify-between gap-2">
              <Link
                to={`/sweep?domain=${domain.tag}`}
                className="font-medium text-white underline-offset-4 hover:underline"
              >
                {domain.tag}
              </Link>
              <span className="font-mono text-[10px] text-white/40">{domain.total}</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={domain.percent}
                tone={domain.percent === 100 ? 'emerald' : 'sky'}
              />
            </div>
            <div className="mt-2 font-mono text-[10px] text-white/40">
              {domain.unknown} unknown
              {domain.hub ? ` · ${domain.hub.label} covers ${domain.hub.covers}` : ' · no hub'}
            </div>
            <button
              type="button"
              onClick={() => toggleMute(domain.tag)}
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-white/30 hover:text-white/70"
            >
              <VolumeX className="h-3 w-3" />
              Not interested
            </button>
          </Card>
        ))}
      </div>

      {muted.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Muted
          </span>
          {muted.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleMute(tag)}
              className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] text-white/50 hover:border-white/30 hover:text-white"
            >
              {tag} ×
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function ConceptCard({ concept }: { concept: Concept }) {
  const thin = isThinConcept(concept);
  const primary = concept.resources?.[0];

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Badge tone={DIFFICULTY_COLOR[concept.difficulty] ?? 'slate'}>{concept.difficulty}</Badge>
        {(concept.tags ?? []).slice(0, 3).map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
        {thin && <Badge tone="amber">thin — needs a better mental model</Badge>}
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-white">{concept.name}</h2>

      <p className="mt-4 text-[15px] leading-relaxed text-white/80">
        {concept.mentalModel || concept.description}
      </p>

      {concept.commonMistakes?.length ? (
        <div className="mt-6">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Where people get it wrong
          </div>
          <ul className="space-y-1.5">
            {concept.commonMistakes.map((mistake) => (
              <li key={mistake} className="flex gap-2 text-sm text-white/60">
                <span className="text-white/25">—</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/[0.08] pt-4 text-xs">
        <Link
          to={`/concepts/${concept.id}`}
          className="text-white/60 underline-offset-4 hover:text-white hover:underline"
        >
          Full concept →
        </Link>
        {primary?.url && (
          <a
            href={primary.url}
            target="_blank"
            rel="noreferrer"
            className="text-white/60 underline-offset-4 hover:text-white hover:underline"
          >
            {primary.title} ↗
          </a>
        )}
      </div>
    </Card>
  );
}

/**
 * Route split. The runner owns the queue and the global key listener, so both
 * must be unreachable from the picker.
 *
 * This was a real bug, not a precaution: the listener used to be registered by
 * a `useEffect` above an `if (!domainParam) return <DomainPicker/>` early
 * return. Hooks run before the return, so on `/sweep` the effect mounted, the
 * queue was built over the whole catalog, and `current` was a live concept.
 * Pressing `1` on the picker silently graded `array-hashing` as Known —
 * writing FSRS mastery and dequeuing a concept that was never on screen.
 * Splitting the components is what actually prevents it; a `domainParam` guard
 * inside the effect would leave the queue and the coverage scan running.
 */
export default function Sweep() {
  const [params] = useSearchParams();
  const domainParam = params.get('domain');
  if (!domainParam) return <DomainPicker />;
  return <SweepRunner domainParam={domainParam} />;
}

function SweepRunner({ domainParam }: { domainParam: string }) {
  const domain = domainParam === ALL_DOMAINS ? undefined : domainParam;

  const { user } = useAuth();
  const [sweep, setSweep] = useState<SweepState>(() => loadSweep(user?.id));
  const [lastRated, setLastRated] = useState<{ id: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const { review: reviewConceptMastery } = useConceptMastery();
  const { mastery: rqMastery, review: reviewRq } = useReviewMastery();

  const scope = useMemo(
    () => (domain ? CONCEPTS.filter((c) => (c.tags ?? []).includes(domain)) : CONCEPTS),
    [domain]
  );
  const queue = useMemo(
    () => buildSweepQueue(CONCEPTS, { tag: domain, rated: sweep.rated }),
    [domain, sweep.rated]
  );
  const coverage = useMemo(() => sweepCoverage(scope, sweep.rated), [scope, sweep.rated]);
  const current = queue[0];

  /**
   * Commit a rating only once the writes it implies have actually landed.
   *
   * Marking `rated` is what removes a concept from the queue forever, so doing
   * it before confirming the FSRS write meant an expired session produced
   * "250 triaged" with zero cards seeded and no way to get those concepts back.
   *
   * `saving` also serialises the fast path this page is built for: without it,
   * two keypresses landing between renders both see the same `current` and
   * double-rate one concept while skipping the next.
   */
  const rate = useCallback(
    async (rating: SweepRating) => {
      if (!current || saving) return;
      setSaving(true);
      setSaveError('');
      const writes = sweepWrites(current.id, rating, REVIEW_QUESTIONS, rqMastery);
      const results = await Promise.all([
        reviewConceptMastery(writes.conceptId, writes.conceptRating),
        ...writes.reviewSeeds.map((seed) => reviewRq(seed.questionId, seed.rating)),
      ]);
      setSaving(false);
      if (results.some((ok) => ok === false)) {
        setSaveError('Could not save that rating — you may need to sign in again.');
        return;
      }
      recordSessionActivity('sweep');
      setSweep((prev) => {
        const next = recordSweepRating(prev, current.id, rating);
        saveSweep(next, user?.id);
        return next;
      });
      setLastRated({ id: current.id, name: current.name });
    },
    [current, saving, rqMastery, reviewConceptMastery, reviewRq, user?.id]
  );

  /**
   * Undo returns the concept to the front of the queue. It cannot unwind the
   * FSRS write that already happened — re-rating simply grades the card again,
   * which is exactly what FSRS is built to absorb.
   */
  const undo = useCallback(() => {
    if (!lastRated) return;
    setSweep((prev) => {
      const rated = { ...prev.rated };
      delete rated[lastRated.id];
      const next = { rated, updatedAt: new Date().toISOString() };
      saveSweep(next, user?.id);
      return next;
    });
    setLastRated(null);
  }, [lastRated, user?.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      // Auto-repeat fires ~30/s while a key is held. Without this, resting a
      // finger on `1` grades fifty concepts Known in two seconds, and undo is
      // single-level, so forty-nine of them are unrecoverable.
      if (event.repeat) return;
      const active = document.activeElement as HTMLElement | null;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        active?.isContentEditable
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const hit = SWEEP_RATINGS.find((r) => r.key === event.key);
      if (hit) {
        event.preventDefault();
        void rate(hit.id);
        return;
      }
      if (event.key.toLowerCase() === 'u') {
        event.preventDefault();
        undo();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rate, undo]);

  return (
    <PageShell>
      <PageHeader
        eyebrow={domain ? `Sweep · ${domain}` : 'Sweep · everything'}
        title={current ? current.name : 'Domain swept'}
        subtitle={
          current
            ? 'Do you already know this? Press 1 Known · 2 Fuzzy · 3 New. Known is recorded and left out of your review queue.'
            : undefined
        }
        actions={
          <Link
            to="/sweep"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Domains
          </Link>
        }
      />

      <div className="mb-6">
        <SessionStatBar
          items={[
            { label: 'Remaining', value: queue.length, hint: `of ${coverage.total}` },
            { label: 'Triaged', value: `${coverage.percent}%` },
            { label: 'Known', value: coverage.known, hint: 'not reviewed' },
            { label: 'To review', value: coverage.fuzzy + coverage.new, hint: 'fuzzy + new' },
          ]}
        />
      </div>

      <div className="mb-6">
        <ProgressBar value={coverage.percent} tone={coverage.percent === 100 ? 'emerald' : 'sky'} />
      </div>

      {saveError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200/25 bg-rose-200/5 px-4 py-3 text-sm text-rose-200"
        >
          {saveError} This concept stays in the queue — nothing was recorded.
        </div>
      )}

      {current ? (
        <>
          {/* The heading is stable while its content swaps, so without a live
              region a screen-reader user gets no signal that the rating
              registered or that a different concept is now on screen. */}
          <div aria-live="polite" aria-atomic="true">
            <ConceptCard concept={current} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            {SWEEP_RATINGS.map((rating) => (
              <button
                key={rating.id}
                type="button"
                onClick={() => void rate(rating.id)}
                aria-keyshortcuts={rating.key}
                disabled={saving}
                className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors duration-150 disabled:opacity-50 ${RATING_CLASS[rating.id]}`}
              >
                <span className="mr-2 font-mono text-[10px] text-white/40">{rating.key}</span>
                {rating.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs">
            {/* Was text-white/40 — roughly 3.5:1 on this background, under the
                4.5:1 WCAG 1.4.3 needs at 10px, and it is the only place the
                shortcuts are documented. */}
            <span className="font-mono text-[10px] text-white/70">
              1 known · 2 fuzzy · 3 new · u undo
            </span>
            {lastRated && (
              <button
                type="button"
                onClick={undo}
                aria-keyshortcuts="u"
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo {lastRated.name}
              </button>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<Gauge className="h-6 w-6" />}
          title={`${coverage.total} concepts triaged`}
          hint={`${coverage.known} known and left alone · ${coverage.fuzzy + coverage.new} seeded into review. Ten minutes a day from here keeps the gaps alive.`}
        />
      )}

      {!current && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/practice/all?tab=reviews">
            <Button>Start reviewing the gaps</Button>
          </Link>
          <Link to="/sweep">
            <Button tone="ghost">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Sweep another domain
              </span>
            </Button>
          </Link>
        </div>
      )}
    </PageShell>
  );
}
