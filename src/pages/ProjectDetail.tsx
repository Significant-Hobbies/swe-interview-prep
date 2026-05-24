import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, PageShell, SectionTitle } from '../components/ui';
import {
  artifactsForProject,
  conceptsForProject,
  PROJECT_BY_ID,
  type ProjectStatus,
  TRACK_BY_ID,
} from '../data/learning-os';
import { useConceptMastery } from '../hooks/useConcepts';
import { useProjectStore } from '../hooks/useUserStore';
import { deriveConceptStatus } from '../lib/conceptState';

const STATUS_OPTIONS: ProjectStatus[] = ['planned', 'active', 'paused', 'done'];

export default function ProjectDetail() {
  const { id } = useParams();
  const project = id ? PROJECT_BY_ID[id] : undefined;
  const { getProject, setProject } = useProjectStore();
  const { mastery } = useConceptMastery();

  if (!project) {
    return (
      <PageShell>
        <Card className="p-8 text-center">
          <p className="text-sm text-gray-400">Project not found.</p>
          <Link to="/progress" className="mt-2 inline-block text-sm text-purple-400">← Back to projects</Link>
        </Card>
      </PageShell>
    );
  }

  const state = getProject(project.id) || {
    status: project.status,
    nextAction: project.nextAction,
    milestones: {},
  };
  const concepts = conceptsForProject(project.id);
  const artifacts = artifactsForProject(project.id);

  function update(patch: Partial<typeof state>) {
    setProject(project!.id, { ...state, ...patch });
  }

  function toggleMilestone(m: string) {
    update({ milestones: { ...state.milestones, [m]: !state.milestones[m] } });
  }

  const doneCount = project.milestones.filter(m => state.milestones[m]).length;

  return (
    <PageShell>
      <Link to="/progress" className="mb-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300">
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </Link>

      <div className="mb-6">
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge tone="purple">{project.lane}</Badge>
          {project.tracks.map(t => (
            <Badge key={t} tone={TRACK_BY_ID[t]?.color}>{TRACK_BY_ID[t]?.title}</Badge>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{project.name}</h1>
        <p className="mt-1 text-sm text-gray-400">{project.purpose}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <SectionTitle>Milestones ({doneCount}/{project.milestones.length})</SectionTitle>
            <div className="space-y-2">
              {project.milestones.map(m => (
                <Card key={m} as="button" onClick={() => toggleMilestone(m)} className="flex w-full items-center gap-3 p-3">
                  {state.milestones[m]
                    ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    : <Circle className="h-5 w-5 shrink-0 text-gray-600" />}
                  <span className={`text-sm ${state.milestones[m] ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{m}</span>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle>Mapped artifacts</SectionTitle>
            {artifacts.length ? (
              <div className="space-y-2">
                {artifacts.map(a => (
                  <Card key={a.id} as="link" to="/playground" className="p-3">
                    <div className="text-sm font-medium text-white">{a.title}</div>
                    <div className="text-xs text-gray-500">{a.type} · {a.successCriteria.length} success criteria</div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No artifacts mapped yet.</p>
            )}
          </section>

          <section>
            <SectionTitle>Mapped concepts</SectionTitle>
            {concepts.length ? (
              <div className="flex flex-wrap gap-1.5">
                {concepts.map(c => {
                  const status = deriveConceptStatus(mastery[c.id]);
                  return (
                    <Link
                      key={c.id}
                      to={`/concepts/${c.id}`}
                      className="rounded-md border border-gray-800 bg-gray-900/40 px-2 py-1 text-xs text-gray-300 hover:border-gray-700 hover:text-white"
                    >
                      {c.name}
                      {status === 'mastered' && <span className="ml-1 text-emerald-400">✓</span>}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No concepts mapped yet.</p>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <SectionTitle>Status</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <Button key={s} tone={state.status === s ? 'primary' : 'ghost'} onClick={() => update({ status: s })}>
                  {s}
                </Button>
              ))}
            </div>
          </section>
          <section>
            <SectionTitle>Next action</SectionTitle>
            <Card className="p-3">
              <textarea
                value={state.nextAction}
                onChange={e => update({ nextAction: e.target.value })}
                rows={3}
                className="w-full resize-y rounded-md border border-gray-800 bg-gray-950 p-2 text-sm text-gray-100 focus:border-purple-500/50 focus:outline-none"
              />
            </Card>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
