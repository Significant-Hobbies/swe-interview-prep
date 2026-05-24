import { ArrowRight, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, color, DIFFICULTY_COLOR, EmptyState, PageShell } from '../components/ui';
import {
  CONCEPT_BY_ID,
  DRILLS,
  REVIEW_QUESTIONS,
  type ReviewQuestion,
  sortedTracks,
  TRACK_BY_ID,
  type TrackId,
} from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { useDrillStore } from '../hooks/useUserStore';
import { aiConfigured, type Critique, critiqueAnswer } from '../lib/aiClient';
import { isDue } from '../lib/conceptState';

type Tab = 'drills' | 'reviews';

const DRILL_STATUS_TONE: Record<string, string> = {
  unsolved: 'gray',
  attempted: 'amber',
  solved: 'emerald',
};

export default function Practice() {
  const [tab, setTab] = useState<Tab>('drills');

  return (
    <PageShell wide>
      <header className="mb-5 flex items-end justify-between gap-3">
        <h1 className="text-xl font-bold text-white sm:text-2xl">Practice</h1>
        <div className="flex rounded-lg border border-gray-800 p-0.5">
          <TabButton active={tab === 'drills'} onClick={() => setTab('drills')}>Drills</TabButton>
          <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')}>Reviews</TabButton>
        </div>
      </header>

      {tab === 'drills' ? <DrillList /> : <ReviewSession />}
    </PageShell>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

// --- Drills tab -------------------------------------------------------------

function DrillList() {
  const { getDrill } = useDrillStore();
  const [track, setTrack] = useState<TrackId | 'all'>('all');

  const withTrack = useMemo(
    () => DRILLS.map(d => ({ drill: d, track: CONCEPT_BY_ID[d.conceptId]?.track })),
    [],
  );
  const filtered = track === 'all' ? withTrack : withTrack.filter(x => x.track === track);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Pill active={track === 'all'} onClick={() => setTrack('all')}>All ({DRILLS.length})</Pill>
        {sortedTracks().map(t => {
          const n = withTrack.filter(x => x.track === t.id).length;
          if (!n) return null;
          return (
            <Pill key={t.id} active={track === t.id} tone={t.color} onClick={() => setTrack(t.id)}>
              {t.title} ({n})
            </Pill>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No drills in this track yet" />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ drill: d, track: tid }) => {
            const st = getDrill(d.id);
            return (
              <Link
                key={d.id}
                to={`/drills/${d.id}`}
                className="group flex flex-col gap-1 rounded-lg border border-gray-800 bg-gray-900/40 p-3 transition-colors hover:border-gray-700 hover:bg-gray-900/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-gray-100 group-hover:text-white">{d.title}</h3>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-700 group-hover:text-gray-400" />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {tid && <Badge tone={TRACK_BY_ID[tid]?.color}>{TRACK_BY_ID[tid]?.short}</Badge>}
                  <Badge tone={DIFFICULTY_COLOR[d.difficulty]}>{d.difficulty}</Badge>
                  <Badge tone={DRILL_STATUS_TONE[st.status]}>{st.status}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Reviews tab ------------------------------------------------------------

const RATINGS: { id: 'again' | 'hard' | 'good' | 'easy'; label: string; tone: string }[] = [
  { id: 'again', label: 'Again', tone: 'rose' },
  { id: 'hard', label: 'Hard', tone: 'amber' },
  { id: 'good', label: 'Good', tone: 'blue' },
  { id: 'easy', label: 'Easy', tone: 'emerald' },
];

function ReviewSession() {
  const { mastery, review } = useConceptMastery();
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [done, setDone] = useState<Set<string>>(new Set());
  const [critique, setCritique] = useState<Critique | null>(null);
  const [critiquing, setCritiquing] = useState(false);
  const [critiqueError, setCritiqueError] = useState('');

  const { queue, mode } = useMemo(() => {
    const due = REVIEW_QUESTIONS.filter(q => isDue(mastery[q.conceptId]) && !done.has(q.id));
    if (due.length) return { queue: due, mode: 'due' as const };
    const practice = REVIEW_QUESTIONS.filter(q => mastery[q.conceptId] && !done.has(q.id));
    return { queue: practice, mode: 'practice' as const };
  }, [mastery, done]);

  const current: ReviewQuestion | undefined = queue[0];

  function next(rating: 'again' | 'hard' | 'good' | 'easy') {
    if (!current) return;
    void review(current.conceptId, rating);
    setDone(prev => new Set(prev).add(current.id));
    setRevealed(false);
    setAnswer('');
    setCritique(null);
    setCritiqueError('');
  }

  async function runCritique() {
    if (!current) return;
    setCritiquing(true);
    setCritiqueError('');
    try {
      setCritique(await critiqueAnswer(current.question, answer, current.answer));
    } catch (e) {
      setCritiqueError(e instanceof Error ? e.message : 'Critique failed.');
    } finally {
      setCritiquing(false);
    }
  }

  if (!current) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-8 w-8 text-emerald-400" />}
        title={done.size > 0 ? 'All caught up.' : 'No reviews yet'}
        hint="Reviews appear as you rate concepts, solve drills, and ship artifacts."
      />
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge tone="cyan">{current.type}</Badge>
          {mode === 'practice' && <Badge tone="gray">practice</Badge>}
        </div>
        <Link to={`/concepts/${current.conceptId}`} className="text-xs text-gray-500 hover:text-gray-300">
          {CONCEPT_BY_ID[current.conceptId]?.name}
        </Link>
      </div>
      <h2 className="text-lg font-semibold text-white">{current.question}</h2>

      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Write your answer from memory…"
        rows={4}
        disabled={revealed}
        className="mt-3 w-full resize-y rounded-md border border-gray-800 bg-gray-950 p-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none disabled:opacity-70"
      />

      {!revealed ? (
        <div className="mt-3">
          <Button onClick={() => setRevealed(true)}>
            <RotateCcw className="h-4 w-4" /> Reveal answer
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Reference answer</div>
            <p className="text-sm leading-relaxed text-gray-300">{current.answer}</p>
          </div>

          {answer.trim() && (
            <div>
              {!critique && (
                <Button tone="ghost" onClick={() => void runCritique()} disabled={critiquing}>
                  <Sparkles className="h-3.5 w-3.5" /> {critiquing ? 'Grading…' : 'AI critique my answer'}
                </Button>
              )}
              {!aiConfigured() && !critique && (
                <p className="mt-1.5 text-xs text-gray-600">
                  Add an AI provider in Settings to enable the critic.
                </p>
              )}
              {critiqueError && <p className="mt-1.5 text-xs text-rose-400">{critiqueError}</p>}
              {critique && <CritiquePanel critique={critique} />}
            </div>
          )}

          <div>
            <div className="mb-2 text-xs text-gray-500">How well did you recall it?</div>
            <div className="flex flex-wrap gap-2">
              {RATINGS.map(r => (
                <button
                  key={r.id}
                  onClick={() => next(r.id)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${color(r.tone).bg} ${color(r.tone).border} ${color(r.tone).text}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {queue.length > 1 && (
        <p className="mt-4 text-center text-xs text-gray-600">{queue.length - 1} more in the queue</p>
      )}
    </Card>
  );
}

function CritiquePanel({ critique }: { critique: Critique }) {
  const tone = critique.score >= 80 ? 'emerald' : critique.score >= 55 ? 'amber' : 'rose';
  return (
    <div className="mt-3 space-y-3 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
      <div className="flex items-center gap-3">
        <span className={`text-2xl font-bold ${color(tone).text}`}>{critique.score}</span>
        <span className="text-sm text-gray-300">{critique.verdict}</span>
      </div>
      {critique.missing && critique.missing.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">What you missed</div>
          <ul className="mt-1 space-y-1">
            {critique.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" /> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
      {critique.strongerAnswer && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Stronger answer</div>
          <p className="mt-1 text-xs leading-relaxed text-gray-300">{critique.strongerAnswer}</p>
        </div>
      )}
      {critique.followUps && critique.followUps.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Follow-ups</div>
          <ul className="mt-1 space-y-1">
            {critique.followUps.map((f, i) => (
              <li key={i} className="text-xs text-gray-400">{f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Pill({
  children,
  active,
  tone = 'purple',
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  tone?: string;
  onClick: () => void;
}) {
  const c = color(tone);
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
        active ? `${c.bg} ${c.border} ${c.text}` : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
