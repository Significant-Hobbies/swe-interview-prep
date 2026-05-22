import { ArrowRight } from 'lucide-react';

import { Badge, Card, PageHeader, PageShell, ProgressBar } from '../components/ui';
import { roadmapConceptIds, ROADMAPS, TRACK_BY_ID } from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { rollupMastery } from '../lib/conceptState';

const HORIZON_LABEL: Record<string, string> = {
  '9d': '9 days',
  '30d': '30 days',
  '90d': '90 days',
  '12mo': '12 months',
};

export default function Roadmaps() {
  const { mastery } = useConceptMastery();

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Roadmaps"
        title="Learning Roadmaps"
        subtitle="Structured paths from a 9-day reset to a 12-month run at AI infrastructure depth. Progress is measured by mastered concepts, not pages read."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {ROADMAPS.map(r => {
          const ids = roadmapConceptIds(r);
          const roll = rollupMastery(ids, mastery);
          const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;
          return (
            <Card key={r.id} as="link" to={`/roadmaps/${r.id}`} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <Badge tone="purple">{HORIZON_LABEL[r.horizon]}</Badge>
                    {r.tracks.slice(0, 3).map(t => (
                      <Badge key={t} tone={TRACK_BY_ID[t]?.color}>{TRACK_BY_ID[t]?.short}</Badge>
                    ))}
                  </div>
                  <h2 className="text-lg font-bold text-white">{r.title}</h2>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-gray-600" />
              </div>
              <p className="text-sm text-gray-400">{r.goal}</p>
              <div className="mt-auto space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{r.milestones.length} milestones · {ids.length} concepts</span>
                  <span>{roll.mastered}/{ids.length} mastered</span>
                </div>
                <ProgressBar value={pct} />
              </div>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
