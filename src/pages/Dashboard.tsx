import { ArrowRight, Dumbbell, Hammer, Network, RotateCcw, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge, Card, color, PageShell, ProgressBar, SectionTitle, StatTile } from '../components/ui';
import { ROADMAP_BY_ID, roadmapConceptIds, TRACK_BY_ID } from '../data/learning-os';
import { ALL_CONCEPTS, useConceptMastery } from '../hooks/useConcepts';
import { useArtifactStore } from '../hooks/useUserStore';
import { confidencePct, rollupMastery } from '../lib/conceptState';
import { dueReviewQuestions, pickDrillForConcept, pickNextConcept, weakConcepts } from '../lib/recommend';

const FEATURED_ROADMAP = 'ai-search-infra-90-day';

export default function Dashboard() {
  const { mastery } = useConceptMastery();
  const { artifacts } = useArtifactStore();

  const nextConcept = pickNextConcept(mastery);
  const nextDrill = nextConcept ? pickDrillForConcept(nextConcept.id) : null;
  const dueReviews = dueReviewQuestions(mastery);
  const weak = weakConcepts(mastery);
  const overall = rollupMastery(ALL_CONCEPTS.map(c => c.id), mastery);
  const shipped = Object.values(artifacts).filter(a => a.status === 'shipped').length;

  const roadmap = ROADMAP_BY_ID[FEATURED_ROADMAP];
  const rmIds = roadmap ? roadmapConceptIds(roadmap) : [];
  const rmRoll = rollupMastery(rmIds, mastery);
  const rmPct = rmIds.length ? (rmRoll.mastered / rmIds.length) * 100 : 0;

  return (
    <PageShell wide>
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-purple-400">Dashboard</div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">What should I do next?</h1>
      </div>

      {/* Today's loop */}
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-gray-800 bg-gradient-to-r from-purple-500/10 to-transparent px-5 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-200">
            <Target className="h-4 w-4" /> Today's learning loop
          </div>
        </div>
        <div className="grid gap-px bg-gray-800 sm:grid-cols-3">
          <LoopCell
            icon={<Network className="h-4 w-4" />}
            label="Learn a concept"
            title={nextConcept?.name || 'All caught up'}
            sub={nextConcept ? nextConcept.description : 'Every concept is in good shape.'}
            to={nextConcept ? `/concepts/${nextConcept.id}` : '/concepts'}
            cta="Open concept"
            tone={nextConcept ? TRACK_BY_ID[nextConcept.track]?.color : 'gray'}
          />
          <LoopCell
            icon={<Dumbbell className="h-4 w-4" />}
            label="Solve a drill"
            title={nextDrill?.title || 'Pick a drill'}
            sub={nextDrill ? `${nextDrill.type} · ${nextDrill.difficulty}` : 'Browse the drill bank.'}
            to={nextDrill ? `/drills/${nextDrill.id}` : '/drills'}
            cta="Start drill"
            tone="amber"
          />
          <LoopCell
            icon={<RotateCcw className="h-4 w-4" />}
            label="Review"
            title={dueReviews.length ? `${dueReviews.length} questions due` : 'Nothing due'}
            sub={dueReviews.length ? 'Recall before you reread.' : 'Reviews appear as concepts age.'}
            to="/reviews"
            cta="Open reviews"
            tone={dueReviews.length ? 'cyan' : 'gray'}
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Concepts started" value={overall.total - overall.untouched} hint={`of ${overall.total}`} tone="blue" />
        <StatTile label="Mastered" value={overall.mastered} tone="emerald" />
        <StatTile label="Due reviews" value={overall.due} tone={overall.due ? 'amber' : 'gray'} />
        <StatTile label="Artifacts shipped" value={shipped} tone="purple" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Featured roadmap */}
        <div className="lg:col-span-2">
          <SectionTitle action={<Link to="/roadmaps" className="text-xs text-purple-400">All roadmaps</Link>}>
            Active roadmap
          </SectionTitle>
          {roadmap && (
            <Card as="link" to={`/roadmaps/${roadmap.id}`} className="p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">{roadmap.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-400">{roadmap.goal}</p>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-gray-600" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{rmRoll.mastered}/{rmIds.length} concepts mastered</span>
                  <span>{Math.round(rmPct)}%</span>
                </div>
                <ProgressBar value={rmPct} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {roadmap.milestones.map((m, i) => (
                  <Badge key={i} tone="gray">{m.title}</Badge>
                ))}
              </div>
            </Card>
          )}

          <div className="mt-6">
            <SectionTitle action={<Link to="/build" className="text-xs text-purple-400">Build Lab</Link>}>
              The principle
            </SectionTitle>
            <Card className="flex items-center gap-3 p-4">
              <Hammer className="h-5 w-5 shrink-0 text-purple-400" />
              <p className="text-sm text-gray-300">
                No learning without an artifact. A concept isn't <em>learned</em> until it maps to something you built —
                code, a benchmark, a design doc, or a writeup.
              </p>
            </Card>
          </div>
        </div>

        {/* Weak concepts */}
        <div>
          <SectionTitle action={<Link to="/concepts" className="text-xs text-purple-400">All</Link>}>
            Weak concepts
          </SectionTitle>
          {weak.length ? (
            <div className="space-y-2">
              {weak.map(c => (
                <Card key={c.id} as="link" to={`/concepts/${c.id}`} className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-white">{c.name}</div>
                    <div className="text-[11px] text-gray-500">{TRACK_BY_ID[c.track]?.title}</div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold ${color('rose').text}`}>
                    {confidencePct(mastery[c.id])}%
                  </span>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4">
              <p className="text-sm text-gray-400">
                No weak spots logged yet. As you rate concepts, the shakiest ones surface here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </PageShell>
  );
}

function LoopCell({
  icon,
  label,
  title,
  sub,
  to,
  cta,
  tone = 'purple',
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  sub: string;
  to: string;
  cta: string;
  tone?: string;
}) {
  const c = color(tone);
  return (
    <Link to={to} className="group flex flex-col gap-2 bg-gray-900/40 p-5 transition-colors hover:bg-gray-900/80">
      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${c.text}`}>
        {icon} {label}
      </div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <p className="line-clamp-2 text-xs text-gray-400">{sub}</p>
      <div className="mt-auto flex items-center gap-1 pt-1 text-xs font-medium text-purple-400 group-hover:gap-2">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
