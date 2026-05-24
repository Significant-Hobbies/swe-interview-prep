import { Hammer, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, color, EmptyState, PageHeader, PageShell, ProgressBar, SectionTitle, StatTile, TabButton, TabGroup } from '../components/ui';
import {
  ARTIFACTS,
  CONCEPT_BY_ID,
  conceptsByTrack,
  DRILLS,
  PROJECT_BY_ID,
  ROADMAP_BY_ID,
  sortedTracks,
} from '../data/learning-os';
import { ALL_CONCEPTS, useConceptMastery } from '../hooks/useConcepts';
import { type LearningNote, useArtifactStore, useDrillStore, useLearningNotes } from '../hooks/useUserStore';
import { rollupMastery } from '../lib/conceptState';

type Section = 'overview' | 'notes';

export default function Progress() {
  const [section, setSection] = useState<Section>('overview');

  return (
    <PageShell wide>
      <PageHeader
        title="Progress"
        subtitle="Mastery rollups, artifact pipeline, and learning notes."
        actions={
          <TabGroup>
            <TabButton active={section === 'overview'} onClick={() => setSection('overview')} label="Overview" />
            <TabButton active={section === 'notes'} onClick={() => setSection('notes')} label="Notes" />
          </TabGroup>
        }
      />

      {section === 'overview' ? <Overview /> : <NotesPanel />}
    </PageShell>
  );
}

function Overview() {
  const { mastery } = useConceptMastery();
  const { artifacts } = useArtifactStore();
  const { drills } = useDrillStore();

  const overall = rollupMastery(ALL_CONCEPTS.map(c => c.id), mastery);
  const started = overall.total - overall.untouched;
  const shipped = Object.values(artifacts).filter(a => a.status === 'shipped').length;
  const building = Object.values(artifacts).filter(a => a.status === 'building').length;
  const drillsSolved = Object.values(drills).filter(d => d.status === 'solved').length;

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label="Started" value={started} hint={`of ${overall.total}`} tone="blue" />
        <StatTile label="Mastered" value={overall.mastered} tone="emerald" />
        <StatTile label="Drills solved" value={drillsSolved} hint={`of ${DRILLS.length}`} tone="amber" />
        <StatTile label="Shipped" value={shipped} hint={`${building} building`} tone="purple" />
      </div>

      <section className="mb-8">
        <SectionTitle>Mastery by track</SectionTitle>
        <div className="space-y-2">
          {sortedTracks().map(t => {
            const ids = conceptsByTrack(t.id).map(c => c.id);
            const roll = rollupMastery(ids, mastery);
            const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;
            return (
              <div key={t.id} className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${color(t.color).solid}`} />
                    <span className="text-sm font-medium text-gray-200">{t.title}</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {roll.mastered} / {ids.length}
                  </span>
                </div>
                <ProgressBar value={pct} tone={t.color} />
              </div>
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
              <Card key={status} className="p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold capitalize text-gray-300">
                  <Hammer className="h-3.5 w-3.5 text-purple-400" /> {status}
                  <span className="ml-auto text-gray-500">{items.length}</span>
                </div>
                <div className="space-y-0.5">
                  {items.slice(0, 5).map(a => (
                    <div key={a.id} className="truncate text-[11px] text-gray-500">{a.title}</div>
                  ))}
                  {items.length > 5 && <div className="text-[11px] text-gray-600">+{items.length - 5} more</div>}
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}

// --- Notes ------------------------------------------------------------------

function NotesPanel() {
  const { notes, saveNote, deleteNote } = useLearningNotes();
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function create() {
    if (!body.trim()) return;
    saveNote({ scope: 'free', title: title.trim(), body: body.trim() });
    setTitle('');
    setBody('');
    setComposing(false);
  }

  const sorted = useMemo(
    () => [...notes].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')),
    [notes],
  );

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setComposing(c => !c)}><Plus className="h-4 w-4" /> New note</Button>
      </div>

      {composing && (
        <Card className="mb-4 p-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="mb-2 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write…"
            rows={4}
            className="w-full resize-y rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button tone="ghost" onClick={() => setComposing(false)}>Cancel</Button>
            <Button onClick={create} disabled={!body.trim()}>Save</Button>
          </div>
        </Card>
      )}

      {sorted.length === 0 ? (
        <EmptyState title="No notes yet" hint="Notes written on concepts also show up here." />
      ) : (
        <div className="space-y-2">
          {sorted.map(n => (
            <NoteRow key={n.id} note={n} onDelete={() => deleteNote(n.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteRow({ note, onDelete }: { note: LearningNote; onDelete: () => void }) {
  const link = scopeLink(note);
  return (
    <Card className="flex items-start justify-between gap-3 p-3">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <Badge tone={note.scope === 'free' ? 'gray' : 'purple'}>{note.scope}</Badge>
          {link && (
            <Link to={link.to} className="text-xs text-purple-400 hover:underline">{link.label}</Link>
          )}
          <span className="text-[11px] text-gray-600">{new Date(note.updatedAt).toLocaleDateString()}</span>
        </div>
        {note.title && <div className="text-sm font-semibold text-white">{note.title}</div>}
        <p className="whitespace-pre-wrap text-sm text-gray-300">{note.body}</p>
      </div>
      <button onClick={onDelete} aria-label="Delete note" className="shrink-0 text-gray-600 hover:text-rose-400">
        <Trash2 className="h-4 w-4" />
      </button>
    </Card>
  );
}

function scopeLink(note: LearningNote): { label: string; to: string } | null {
  if (note.scope === 'concept') {
    const c = CONCEPT_BY_ID[note.refId];
    return c ? { label: c.name, to: `/concepts/${c.id}` } : null;
  }
  if (note.scope === 'roadmap') {
    const r = ROADMAP_BY_ID[note.refId];
    return r ? { label: r.title, to: `/roadmaps/${r.id}` } : null;
  }
  if (note.scope === 'project') {
    const p = PROJECT_BY_ID[note.refId];
    return p ? { label: p.name, to: `/projects/${p.id}` } : null;
  }
  return null;
}
