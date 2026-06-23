import { ArrowLeft, BookOpen, CheckCircle2, Circle, Dumbbell, Hammer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { FurtherReading } from '../components/FurtherReading';
import { RoadmapGraph } from '../components/RoadmapGraph';
import { Card, color, PageShell, ProgressBar, SectionTitle } from '../components/ui';
import {
  ARTIFACT_BY_ID,
  CONCEPT_BY_ID,
  DRILL_BY_ID,
  groupForTag,
  type Milestone,
  ROADMAP_BY_ID,
  roadmapConceptIds,
} from '../data/learning-os';
import { type MasteryEntry, useConceptMastery } from '../hooks/useConcepts';
import { deriveConceptStatus, rollupMastery } from '../lib/conceptState';
import { playgroundArtifactUrl } from '../lib/gates';

// Roadmaps that have a companion markdown doc under /learning/:slug.
const ROADMAP_DEEP_DIVE: Record<string, string> = {
  'db-disk-first': 'db-roadmap',
  runtime: 'runtime-roadmap',
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
          <p className="text-sm text-white/50">Roadmap not found.</p>
          <Link to="/learn" className="mt-2 inline-block text-sm text-white">
            ← Back to roadmaps
          </Link>
        </Card>
      </PageShell>
    );
  }

  const ids = roadmapConceptIds(roadmap);
  const roll = rollupMastery(ids, mastery);
  const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;

  return (
    <PageShell>
      <Link
        to="/learn"
        className="mb-4 inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Roadmaps
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{roadmap.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/50">
          {roadmap.tracks.map((t, i) => {
            const trk = groupForTag(t);
            if (!trk) return null;
            return (
              <span key={t} className="inline-flex items-center gap-1.5">
                {i > 0 && <span className="text-white/30">·</span>}
                <span className={`h-1.5 w-1.5 rounded-full ${color(trk.color).solid}`} />
                {trk.title}
              </span>
            );
          })}
        </div>
        <p className="mt-3 max-w-2xl text-sm text-white/70">{roadmap.description}</p>
      </div>

      <Card className="mb-6 p-4">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium text-white/80">Overall progress</span>
          <span className="text-white/40">
            {roll.mastered}/{ids.length} concepts mastered
          </span>
        </div>
        <ProgressBar value={pct} />
        <p className="mt-2 text-xs text-white/40">Goal: {roadmap.goal}</p>
        <a
          href={`/share/roadmaps/${roadmap.id}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs text-sky-400 hover:text-sky-300"
        >
          Share public roadmap →
        </a>
      </Card>

      <div className="mb-6">
        <RoadmapGraph roadmap={roadmap} mastery={mastery} />
      </div>

      {ROADMAP_DEEP_DIVE[roadmap.id] && (
        <Link
          to={`/learning/${ROADMAP_DEEP_DIVE[roadmap.id]}`}
          className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-4 w-4 shrink-0 text-white" />
            <div>
              <div className="text-sm font-semibold text-white">Read the deep-dive doc</div>
              <div className="text-xs text-white/40">
                Full mechanism-first writeup with every external source — papers, blog series,
                talks.
              </div>
            </div>
          </div>
          <span className="shrink-0 text-xs font-medium text-white">Open →</span>
        </Link>
      )}

      <div className="space-y-5">
        {roadmap.milestones.map((m, i) => (
          <MilestoneBlock key={i} milestone={m} index={i} mastery={mastery} />
        ))}
      </div>

      <FurtherReading tags={roadmap.tracks} limit={15} />
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
          <div className="text-xs font-medium text-white">Milestone {index + 1}</div>
          <h2 className="text-lg font-bold text-white">{milestone.title}</h2>
          <p className="mt-0.5 text-sm text-white/50">{milestone.goal}</p>
        </div>
        <div className="w-24 shrink-0">
          <ProgressBar value={pct} />
          <div className="mt-1 text-right text-[11px] text-white/40">{Math.round(pct)}%</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <SectionTitle>Concepts</SectionTitle>
          <div className="space-y-1.5">
            {milestone.concepts.map((cid) => {
              const c = CONCEPT_BY_ID[cid];
              if (!c) return null;
              const status = deriveConceptStatus(mastery[cid]);
              const done = status === 'mastered';
              return (
                <Link
                  key={cid}
                  to={`/concepts/${cid}`}
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-white/40" />
                  )}
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
              {milestone.drills.map((did) => {
                const d = DRILL_BY_ID[did];
                if (!d) return null;
                return (
                  <Link
                    key={did}
                    to={`/drills/${did}`}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                  >
                    <Dumbbell className="h-4 w-4 shrink-0 text-amber-400" />
                    <span className="truncate">{d.title}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-white/40">—</p>
          )}
        </div>

        <div>
          <SectionTitle>Artifacts</SectionTitle>
          {milestone.artifacts.length ? (
            <div className="space-y-1.5">
              {milestone.artifacts.map((aid) => {
                const a = ARTIFACT_BY_ID[aid];
                if (!a) return null;
                return (
                  <Link
                    key={aid}
                    to={playgroundArtifactUrl(aid)}
                    className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
                  >
                    <Hammer className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate">{a.title}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-white/40">—</p>
          )}
        </div>
      </div>
    </Card>
  );
}
