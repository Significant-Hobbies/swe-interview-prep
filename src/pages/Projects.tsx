import { ArrowRight } from 'lucide-react';

import { Badge, Card, PageHeader, PageShell } from '../components/ui';
import { conceptsForProject, PROJECTS, TRACK_BY_ID } from '../data/learning-os';
import { useProjectStore } from '../hooks/useUserStore';

const LANE_TONE: Record<string, string> = {
  main: 'purple',
  workshop: 'emerald',
  marketing: 'amber',
  fun: 'fuchsia',
  personal: 'cyan',
  experiment: 'blue',
};

const STATUS_TONE: Record<string, string> = {
  active: 'emerald',
  planned: 'gray',
  guided: 'blue',
  'AI-managed': 'fuchsia',
  paused: 'amber',
  done: 'emerald',
  archived: 'gray',
};

export default function Projects() {
  const { getProject } = useProjectStore();

  const lanes = [...new Set(PROJECTS.map(p => p.lane))];

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Projects"
        title="Projects"
        subtitle="Where learning becomes real work. Every artifact ships into one of these — HighSignal is the search lab, Codevetter the code-intelligence lab."
      />
      <div className="space-y-8">
        {lanes.map(lane => (
          <section key={lane}>
            <div className="mb-3 flex items-center gap-2">
              <Badge tone={LANE_TONE[lane]}>{lane}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECTS.filter(p => p.lane === lane).map(p => {
                const userState = getProject(p.id);
                const status = userState?.status || p.status;
                const nextAction = userState?.nextAction || p.nextAction;
                const conceptCount = conceptsForProject(p.id).length;
                return (
                  <Card key={p.id} as="link" to={`/projects/${p.id}`} className="flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                      <Badge tone={STATUS_TONE[status]}>{status}</Badge>
                    </div>
                    <p className="line-clamp-2 text-xs text-gray-400">{p.purpose}</p>
                    <div className="flex flex-wrap gap-1">
                      {p.tracks.slice(0, 3).map(t => (
                        <Badge key={t} tone={TRACK_BY_ID[t]?.color}>{TRACK_BY_ID[t]?.short}</Badge>
                      ))}
                    </div>
                    <div className="mt-auto border-t border-gray-800 pt-2">
                      <div className="flex items-start gap-1.5 text-xs text-gray-400">
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-400" />
                        <span className="line-clamp-1">{nextAction}</span>
                      </div>
                      {conceptCount > 0 && (
                        <div className="mt-1 text-[11px] text-gray-600">{conceptCount} mapped concepts</div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
