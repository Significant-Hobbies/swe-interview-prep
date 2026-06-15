import { ArrowLeft, BookOpen, CheckCircle2, Circle, Dumbbell, Hammer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Card, PageShell, ProgressBar, SectionTitle } from '../components/ui';
import {
  ARTIFACT_BY_ID,
  CONCEPT_BY_ID,
  DRILL_BY_ID,
  type Milestone,
  ROADMAP_BY_ID,
  roadmapConceptIds,
  TRACK_BY_ID,
} from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { deriveConceptStatus, rollupMastery } from '../lib/conceptState';

// Roadmaps that have a companion markdown doc under /learning/:slug.
const ROADMAP_DEEP_DIVE: Record<string, string> = {
  'db-disk-first': 'db-roadmap',
  'runtime': 'runtime-roadmap',
  'swe-landscape': 'swe-landscape',
};

export default function RoadmapDetail() {
  const { id } = useParams();
  const roadmap = id ? ROADMAP_BY_ID[id] : undefined;
  const { mastery } = useConceptMastery();

  if (!roadmap) {
    return (
      <PageShell>
        <Card className="p-8 text-center">
          <p className="text-sm text-gray-400">Roadmap not found.</p>
          <Link to="/learn" className="mt-2 inline-block text-sm text-purple-400">← Back to roadmaps</Link>
        </Card>
      </PageShell>
    );
  }

  const ids = roadmapConceptIds(roadmap);
  const roll = rollupMastery(ids, mastery);
  const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;

  return (
    <PageShell>
      <Link to="/learn" className="mb-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Roadmaps
      </Link>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {roadmap.tracks.map(t => (
            <Badge key={t} tone={TRACK_BY_ID[t]?.color}>{TRACK_BY_ID[t]?.title}</Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{roadmap.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{roadmap.description}</p>
      </div>

      <Card className="mb-6 p-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-200">Overall progress</span>
          <span className="text-gray-500">{roll.mastered}/{ids.length} concepts mastered</span>
        </div>
        <ProgressBar value={pct} />
        <p className="mt-2 text-xs text-gray-500">Goal: {roadmap.goal}</p>
      </Card>

      {ROADMAP_DEEP_DIVE[roadmap.id] && (
        <Link
          to={`/learning/${ROADMAP_DEEP_DIVE[roadmap.id]}`}
          className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3 transition-colors hover:border-purple-500/40 hover:bg-purple-500/10"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 shrink-0 text-purple-400" />
            <div>
              <div className="text-sm font-semibold text-white">Read the deep-dive doc</div>
              <div className="text-xs text-gray-500">
                Full mechanism-first writeup with every external source — papers, blog series, talks.
              </div>
            </div>
          </div>
          <span className="shrink-0 text-xs font-medium text-purple-300">Open →</span>
        </Link>
      )}

      <div className="space-y-5">
        {roadmap.milestones.map((m, i) => (
          <MilestoneBlock key={i} milestone={m} index={i} mastery={mastery} />
        ))}
      </div>
    </PageShell>
  );
}

function MilestoneBlock({
  milestone,
  index,
  mastery,
}: {
  milestone: Milestone;
  index: number;
  mastery: Record<string, MasteryEntry>;
}) {
  const roll = rollupMastery(milestone.concepts, mastery);
  const pct = milestone.concepts.length ? (roll.mastered / milestone.concepts.length) * 100 : 0;

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-purple-400">Milestone {index + 1}</div>
          <h2 className="text-lg font-bold text-white">{milestone.title}</h2>
          <p className="mt-0.5 text-sm text-gray-400">{milestone.goal}</p>
        </div>
        <div className="w-24 shrink-0">
          <ProgressBar value={pct} />
          <div className="mt-1 text-right text-[11px] text-gray-500">{Math.round(pct)}%</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <SectionTitle>Concepts</SectionTitle>
          <div className="space-y-1.5">
            {milestone.concepts.map(cid => {
              const c = CONCEPT_BY_ID[cid];
              if (!c) return null;
              const status = deriveConceptStatus(mastery[cid]);
              const done = status === 'mastered';
              return (
                <Link key={cid} to={`/concepts/${cid}`} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                  {done
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    : <Circle className="h-4 w-4 shrink-0 text-gray-600" />}
                  <span className="truncate">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <SectionTitle>Drills</SectionTitle>
          {milestone.drills.length ? (
            <div className="space-y-1.5">
              {milestone.drills.map(did => {
                const d = DRILL_BY_ID[did];
                if (!d) return null;
                return (
                  <Link key={did} to={`/drills/${did}`} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <Dumbbell className="h-4 w-4 shrink-0 text-amber-400" />
                    <span className="truncate">{d.title}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-600">—</p>
          )}
        </div>

        <div>
          <SectionTitle>Artifacts</SectionTitle>
          {milestone.artifacts.length ? (
            <div className="space-y-1.5">
              {milestone.artifacts.map(aid => {
                const a = ARTIFACT_BY_ID[aid];
                if (!a) return null;
                return (
                  <Link key={aid} to="/playground" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
                    <Hammer className="h-4 w-4 shrink-0 text-purple-400" />
                    <span className="truncate">{a.title}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-600">—</p>
          )}
        </div>
      </div>
    </Card>
  );
}
