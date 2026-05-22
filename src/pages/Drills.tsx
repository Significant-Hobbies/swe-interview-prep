import { ArrowRight, Timer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Card, color, DIFFICULTY_COLOR, EmptyState, PageHeader, PageShell } from '../components/ui';
import { CONCEPT_BY_ID, DRILLS, sortedTracks, TRACK_BY_ID, type TrackId } from '../data/learning-os';
import { useDrillStore } from '../hooks/useUserStore';

const DRILL_STATUS_TONE: Record<string, string> = {
  unsolved: 'gray',
  attempted: 'amber',
  solved: 'emerald',
};

export default function Drills() {
  const { drills: drillState, getDrill } = useDrillStore();
  const [track, setTrack] = useState<TrackId | 'all'>('all');

  const withTrack = useMemo(
    () => DRILLS.map(d => ({ drill: d, track: CONCEPT_BY_ID[d.conceptId]?.track })),
    [],
  );
  const filtered = track === 'all' ? withTrack : withTrack.filter(x => x.track === track);

  const solved = Object.values(drillState).filter(d => d.status === 'solved').length;

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Drills"
        title="Drill Bank"
        subtitle="Focused exercises that turn a concept into implementation reps. Open one to solve it in the Build Lab."
        actions={<Link to="/mock" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"><Timer className="h-4 w-4" /> DSA Mock</Link>}
      />

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
        <span className="ml-auto text-xs text-gray-500">{solved} solved</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No drills in this track yet" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ drill: d, track: tid }) => {
            const st = getDrill(d.id);
            const concept = CONCEPT_BY_ID[d.conceptId];
            return (
              <Card key={d.id} as="link" to={`/drills/${d.id}`} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">{d.title}</h3>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-600" />
                </div>
                <p className="line-clamp-2 text-xs text-gray-400">{d.prompt}</p>
                <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
                  {tid && <Badge tone={TRACK_BY_ID[tid]?.color}>{TRACK_BY_ID[tid]?.short}</Badge>}
                  <Badge tone={DIFFICULTY_COLOR[d.difficulty]}>{d.difficulty}</Badge>
                  <Badge tone={DRILL_STATUS_TONE[st.status]}>{st.status}</Badge>
                  {concept && <span className="text-[11px] text-gray-500">· {concept.name}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active ? `${c.bg} ${c.border} ${c.text}` : 'border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}
