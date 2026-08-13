import { ArrowRight, Clock3, ShieldCheck, Swords } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { PageShell } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import {
  getLeaderboard,
  getRatings,
  getWarHistory,
  getWarsStatus,
  type LeaderboardEntry,
  type WarHistoryEntry,
  type WarRating,
  type WarsStatus,
} from '../lib/softwareWars';

function RatingBlock({ rating, label }: { rating?: WarRating; label: string }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-white">
          {rating?.rating ?? '—'}
        </span>
        <span className="font-mono text-[10px] text-white/50">
          {rating ? `${rating.rankedMatches}/10 placement` : 'sign in for rating'}
        </span>
      </div>
    </div>
  );
}

export default function SoftwareWars() {
  const { user } = useAuth();
  const [status, setStatus] = useState<WarsStatus>();
  const [ratings, setRatings] = useState<{ blitz: WarRating; tradeoff: WarRating }>();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<WarHistoryEntry[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let live = true;
    setLoadingProfile(true);
    setLoadError('');
    void Promise.all([
      getWarsStatus(),
      getLeaderboard('blitz'),
      user ? getRatings().catch(() => undefined) : Promise.resolve(undefined),
      user ? getWarHistory().catch(() => []) : Promise.resolve([]),
    ])
      .then(([nextStatus, nextLeaders, nextRatings, nextHistory]) => {
        if (!live) return;
        setStatus(nextStatus);
        setLeaders(nextLeaders);
        setRatings(nextRatings);
        setHistory(nextHistory);
        setLoadingProfile(false);
      })
      .catch(() => {
        if (!live) return;
        setLoadingProfile(false);
        setLoadError('Competitive profile is unavailable right now.');
      });
    return () => {
      live = false;
    };
  }, [reloadKey, user]);

  return (
    <PageShell>
      <div className="text-sm text-white/55">Software Wars</div>
      <Swords className="mt-7 h-7 w-7 text-sky-300" />
      <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        Choose your clock.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">
        Test recall in one minute or defend an engineering decision in thirty.
      </p>
      <p className="mt-3 font-mono text-[11px] text-emerald-300/80">
        No signup required for unranked play.
      </p>

      <section
        className="mt-10 grid gap-px overflow-hidden rounded-xl bg-white/[0.1] md:grid-cols-2"
        aria-label="Battle modes"
      >
        <article className="flex min-h-72 flex-col bg-black p-6">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <Clock3 className="h-4 w-4" /> One minute
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">MCQ battle</h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Seven source-backed questions against a human ghost or AI. Accuracy wins; response time
            breaks ties.
          </p>
          <Link
            to="/wars/blitz"
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Start one-minute battle <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
        <article className="flex min-h-72 flex-col bg-black p-6">
          <div className="flex items-center gap-2 text-sm text-white/55">
            <Clock3 className="h-4 w-4" /> Thirty minutes
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
            Engineering match
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Go solo with your own AI key or match with another engineer. Solve the same open-ended
            problem, handle a requirement twist, and defend the tradeoffs.
          </p>
          <Link
            to="/wars/tradeoff"
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/15 px-5 text-sm font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.04]"
          >
            Start thirty-minute session <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      <details className="group mt-8 border-t border-white/[0.08] pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm text-white/55 hover:text-white">
          Ratings and leaderboard
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="pb-5 pt-3">
          {loadingProfile ? (
            <p className="text-sm text-white/50" role="status">
              Loading competitive profile…
            </p>
          ) : loadError ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/60"
            >
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="inline-flex min-h-11 items-center px-2 text-white hover:text-white/80"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6">
                <RatingBlock rating={ratings?.blitz} label="Blitz Elo" />
                <RatingBlock rating={ratings?.tradeoff} label="Tradeoff Elo" />
              </div>
              {!user && (
                <p className="mt-4 text-xs text-white/50">
                  Play first. Sign in only to keep ratings and history across devices.
                </p>
              )}
              <ol className="mt-6 border-t border-white/[0.06]">
                {leaders.map((entry) => (
                  <li
                    key={`${entry.rank}-${entry.displayName}`}
                    className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-white/[0.06] py-3"
                  >
                    <span className="font-mono text-xs text-white/50">
                      {String(entry.rank).padStart(2, '0')}
                    </span>
                    <span className="truncate text-sm text-white/75">{entry.displayName}</span>
                    <span className="font-mono text-sm text-white/70">{entry.rating}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </details>

      {user && (
        <details className="group mt-4 border-t border-white/[0.08] pt-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm text-white/55 hover:text-white">
            Recent battles
            <span aria-hidden="true" className="transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <ul className="pb-4">
            {history.length ? (
              history.map((match) => (
                <li
                  key={match.id}
                  className="flex items-center justify-between gap-4 border-t border-white/[0.06] py-3 text-sm"
                >
                  <span className="truncate text-white/70">
                    {match.mode === 'blitz' ? 'Blitz' : 'Tradeoff'} vs {match.opponent.displayName}
                  </span>
                  <span className="font-mono text-xs uppercase text-white/50">
                    {match.outcome ?? match.status}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3 text-sm text-white/50">No completed battles yet.</li>
            )}
          </ul>
        </details>
      )}

      <details className="group mt-4 border-t border-white/[0.08] pt-2">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm text-white/55 hover:text-white">
          How ranked Wars work
          <span aria-hidden="true" className="transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="pb-5 pt-3 text-sm leading-6 text-white/50">
          <p className="flex gap-3">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0" /> Answers, deadlines, ratings, phases,
            and adjudication stay server-owned.
          </p>
          <p className="mt-4 font-mono text-[11px] text-white/50">
            {status?.content.authoredCandidateBlitzQuestions ?? '—'} authored candidates ·{' '}
            {status?.content.distinctAuthoredBlitzQuestions ?? '—'} ranked-ready ·{' '}
            {status?.content.activeTradeoffProblems ?? '—'} Tradeoff briefs · media{' '}
            {status?.mediaConfigured ? 'configured' : 'disabled locally'}
          </p>
        </div>
      </details>
    </PageShell>
  );
}
