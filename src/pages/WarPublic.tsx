import { ArrowRight, Clock3, ShieldCheck, Swords, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Badge, Card, PageShell } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../lib/analytics';
import { acceptWarChallenge, getChallengePreview, getPublicWarResult } from '../lib/softwareWars';

export function WarChallenge() {
  const { token = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Awaited<ReturnType<typeof getChallengePreview>>>();
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  async function accept() {
    if (!user || accepting) return;
    setAccepting(true);
    setError('');
    try {
      const match = (await acceptWarChallenge(token)) as any;
      trackEvent('software_wars', { action: 'challenge_accept', mode: challenge?.mode ?? 'blitz' });
      navigate(`/wars/${challenge?.mode === 'tradeoff' ? 'tradeoff' : 'blitz'}/${match.matchId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not accept challenge');
      setAccepting(false);
    }
  }

  useEffect(() => {
    void getChallengePreview(token)
      .then(setChallenge)
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Challenge unavailable');
      });
  }, [token]);

  return (
    <PageShell>
      <Link to="/wars" className="font-mono text-xs text-white/45 hover:text-white">
        Software Wars
      </Link>
      <Card className="mt-8 overflow-hidden">
        <div className="border-b border-white/[0.08] p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <Badge tone="sky">Challenge link</Badge>
            <Swords className="h-5 w-5 text-sky-300" />
          </div>
          {challenge ? (
            <>
              <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white">
                {challenge.challenger.displayName} challenged you.
              </h1>
              <p className="mt-3 text-sm text-white/50">
                {challenge.mode === 'blitz'
                  ? 'Same timing policy. Fresh immutable questions. No spoilers in this link.'
                  : 'Thirty minutes. One shared brief. One hidden requirement twist.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-5 font-mono text-[11px] text-white/40">
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5" /> Expires{' '}
                  {new Date(challenge.expiresAt).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> {challenge.status}
                </span>
              </div>
            </>
          ) : error ? (
            <p role="alert" className="mt-8 text-sm text-rose-300">
              {error}
            </p>
          ) : (
            <p className="mt-8 text-sm text-white/40">Checking challenge…</p>
          )}
        </div>
        {challenge && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 md:px-8">
            <p className="text-xs text-white/40">
              {user
                ? 'Challenge matches use the original immutable question versions and are unranked.'
                : 'Human challenge identity is durable. You can still play the same mode unranked without signup.'}
            </p>
            {user ? (
              <button
                type="button"
                onClick={() => void accept()}
                disabled={accepting}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black disabled:opacity-50"
              >
                {accepting ? 'Accepting…' : 'Accept challenge'} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Link
                to={challenge.mode === 'blitz' ? '/wars/blitz' : '/wars/tradeoff'}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-black"
              >
                Play unranked <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </Card>
    </PageShell>
  );
}

export function WarResult() {
  const { slug = '' } = useParams();
  const [result, setResult] = useState<Awaited<ReturnType<typeof getPublicWarResult>>>();
  const [error, setError] = useState('');

  useEffect(() => {
    void getPublicWarResult(slug)
      .then(setResult)
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Result unavailable');
      });
  }, [slug]);

  return (
    <PageShell>
      <Link to="/wars" className="font-mono text-xs text-white/45 hover:text-white">
        Software Wars
      </Link>
      {result ? (
        <div className="mt-8">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-sky-300">
            <Trophy className="h-4 w-4" /> Shared result
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            {result.mode === 'blitz' ? 'Blitz complete.' : 'Tradeoff decided.'}
          </h1>
          <p className="mt-3 text-sm text-white/45">
            {result.ranked ? 'Ranked' : 'Unranked'} ·{' '}
            {new Date(result.finalizedAt).toLocaleDateString()}
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {result.participants.map((participant) => (
              <Card
                key={participant.side}
                className={`p-6 ${result.result === participant.side ? 'border-sky-300/35' : ''}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Users className="h-5 w-5 text-white/40" />
                  {result.result === participant.side && <Badge tone="sky">Winner</Badge>}
                </div>
                <h2 className="mt-6 text-xl font-medium text-white">{participant.displayName}</h2>
                <p className="mt-2 font-mono text-xs text-white/40">
                  {result.mode === 'blitz'
                    ? `${participant.correct ?? 0}/${result.questionCount} correct`
                    : `${participant.score ?? '—'} rubric score`}
                </p>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 border-t border-white/[0.08] pt-6 text-xs leading-5 text-white/40">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Ranked question stems, options,
            answers, explanations, private drafts, and transcripts are intentionally excluded from
            public results.
          </div>
        </div>
      ) : (
        <Card className="mt-8 p-8 text-sm text-white/45">
          {error || 'Loading sanitized result…'}
        </Card>
      )}
    </PageShell>
  );
}
