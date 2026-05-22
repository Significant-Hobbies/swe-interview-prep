import { Hammer } from 'lucide-react';

import { Card, color, PageHeader, PageShell, ProgressBar, SectionTitle, StatTile } from '../components/ui';
import { ARTIFACTS, conceptsByTrack, DRILLS, sortedTracks } from '../data/learning-os';
import { ALL_CONCEPTS, useConceptMastery } from '../hooks/useConcepts';
import { useArtifactStore, useDrillStore } from '../hooks/useUserStore';
import { rollupMastery } from '../lib/conceptState';

export default function Progress() {
  const { mastery } = useConceptMastery();
  const { artifacts } = useArtifactStore();
  const { drills } = useDrillStore();

  const overall = rollupMastery(ALL_CONCEPTS.map(c => c.id), mastery);
  const started = overall.total - overall.untouched;
  const shipped = Object.values(artifacts).filter(a => a.status === 'shipped').length;
  const building = Object.values(artifacts).filter(a => a.status === 'building').length;
  const drillsSolved = Object.values(drills).filter(d => d.status === 'solved').length;

  // Build/study ratio — artifacts touched vs concepts touched.
  const artifactsTouched = Object.keys(artifacts).length;
  const buildShare = started + artifactsTouched > 0
    ? Math.round((artifactsTouched / (started + artifactsTouched)) * 100)
    : 0;

  return (
    <PageShell wide>
      <PageHeader
        eyebrow="Progress"
        title="Progress"
        subtitle="Artifact count matters more than concept count. This page tracks whether learning is compounding into output."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Concepts started" value={started} hint={`of ${overall.total}`} tone="blue" />
        <StatTile label="Mastered" value={overall.mastered} tone="emerald" />
        <StatTile label="Due reviews" value={overall.due} tone={overall.due ? 'amber' : 'gray'} />
        <StatTile label="Artifacts shipped" value={shipped} hint={`${building} building`} tone="purple" />
        <StatTile label="Drills solved" value={drillsSolved} hint={`of ${DRILLS.length}`} tone="amber" />
        <StatTile label="Build share" value={`${buildShare}%`} hint="aim ~50%" tone="fuchsia" />
      </div>

      <section className="mb-8">
        <SectionTitle>Mastery by track</SectionTitle>
        <div className="space-y-3">
          {sortedTracks().map(t => {
            const ids = conceptsByTrack(t.id).map(c => c.id);
            const roll = rollupMastery(ids, mastery);
            const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;
            const startedPct = ids.length ? ((ids.length - roll.untouched) / ids.length) * 100 : 0;
            return (
              <Card key={t.id} className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${color(t.color).solid}`} />
                    <span className="text-sm font-medium text-gray-200">{t.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {roll.mastered} mastered · {ids.length - roll.untouched} started · {ids.length} total
                  </span>
                </div>
                <ProgressBar value={pct} tone={t.color} />
                <div className="mt-1 text-[11px] text-gray-600">{Math.round(startedPct)}% started</div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle>Artifact pipeline</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['todo', 'building', 'shipped'] as const).map(status => {
            const items = ARTIFACTS.filter(a => (artifacts[a.id]?.status || 'todo') === status);
            return (
              <Card key={status} className="p-4">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold capitalize text-gray-200">
                  <Hammer className="h-4 w-4 text-purple-400" /> {status}
                  <span className="ml-auto text-gray-500">{items.length}</span>
                </div>
                <div className="space-y-1">
                  {items.slice(0, 6).map(a => (
                    <div key={a.id} className="truncate text-xs text-gray-400">{a.title}</div>
                  ))}
                  {items.length > 6 && <div className="text-xs text-gray-600">+{items.length - 6} more</div>}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
