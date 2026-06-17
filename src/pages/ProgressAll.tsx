import { ArrowLeft, Hammer, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Badge, Button, Card, color, EmptyState, PageHeader, PageShell, ProgressBar, SectionTitle, TabButton, TabGroup } from '../components/ui';
import {
  ARTIFACTS,
  CONCEPT_BY_ID,
  conceptsByTag,
  conceptsInRoadmap,
  DRILLS,
  PROJECT_BY_ID,
  ROADMAP_BY_ID,
  ROADMAPS,
  sortedTracks,
} from '../data/learning-os';
import { ALL_CONCEPTS, useConceptMastery } from '../hooks/useConcepts';
import { type LearningNote, useArtifactStore, useDrillStore, useFocusMode, useLearningNotes, useUserElo } from '../hooks/useUserStore';
import { rollupMastery } from '../lib/conceptState';

type Section = 'overview' | 'notes';

export default function Progress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section: Section = searchParams.get('tab') === 'notes' ? 'notes' : 'overview';

  function setSection(next: Section) {
    if (next === 'overview') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', next);
    }
    setSearchParams(searchParams, { replace: true });
  }

  return (
    <PageShell wide>
      <Link
        to="/progress"
        className="mb-4 inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Progress
      </Link>
      <PageHeader
        title="All progress & notes"
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
  const { sessionsThisWeek } = useFocusMode();
  const focusSessions = sessionsThisWeek();
  const { getElo } = useUserElo();

  const overall = rollupMastery(ALL_CONCEPTS.map(c => c.id), mastery);
  const started = overall.total - overall.untouched;
  const shipped = Object.values(artifacts).filter(a => a.status === 'shipped').length;
  const building = Object.values(artifacts).filter(a => a.status === 'building').length;
  const drillsSolved = Object.values(drills).filter(d => d.status === 'solved').length;

  return (
    <>
      {/* Single stat row — no colored tiles */}
      <div className="mb-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          <ProgressStat label="Started" value={started} sub={`of ${overall.total}`} />
          <ProgressStat label="Mastered" value={overall.mastered} sub={`of ${overall.total}`} />
          <ProgressStat label="Drills" value={drillsSolved} sub={`of ${DRILLS.length}`} />
          <ProgressStat label="Shipped" value={shipped} sub={`${building} building`} />
          <ProgressStat label="Focus sessions" value={focusSessions} sub="last 7 days" />
        </div>
      </div>

      <section className="mb-10">
        <SectionTitle>Mastery by group</SectionTitle>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.08]">
          {sortedTracks().map(t => {
            const ids = conceptsByTag(t.id).map(c => c.id);
            const roll = rollupMastery(ids, mastery);
            const pct = ids.length ? (roll.mastered / ids.length) * 100 : 0;
            return (
              <div key={t.id} className="flex items-center gap-4 px-4 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${color(t.color).solid}`} />
                <span className="min-w-[10rem] text-sm font-medium text-white/80">{t.title}</span>
                <div className="flex-1">
                  <ProgressBar value={pct} tone={t.color} />
                </div>
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-white/50">
                  {roll.mastered}/{ids.length}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-10">
        <SectionTitle>ELO by roadmap</SectionTitle>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] divide-y divide-white/[0.08]">
          {ROADMAPS.map(r => {
            const ids = conceptsInRoadmap(r.id).map(c => c.id);
            if (!ids.length) return null;
            const roll = rollupMastery(ids, mastery);
            const elo = getElo(r.id);
            return (
              <div key={r.id} className="flex items-center gap-4 px-4 py-3">
                <span className="min-w-[14rem] text-sm font-medium text-white/80">{r.title}</span>
                <span className="text-xs text-white/40">{r.horizon}</span>
                <span className="flex-1" />
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-white/50">
                  {roll.mastered}/{ids.length}
                </span>
                <span className="w-16 shrink-0 text-right font-mono text-xs text-white/40" title="Adaptive ELO for drills solved within this roadmap">
                  {elo}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle>Artifact pipeline</SectionTitle>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
          {(['shipped', 'building', 'todo'] as const).map(status => {
            const items = ARTIFACTS.filter(a => (artifacts[a.id]?.status || 'todo') === status);
            if (!items.length) return null;
            const dot = status === 'shipped' ? 'bg-emerald-300' : status === 'building' ? 'bg-amber-300' : 'bg-white/30';
            return (
              <div key={status} className="border-b border-white/[0.08] last:border-b-0 px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium capitalize text-white/70">
                  <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                  {status}
                  <span className="text-white/40">· {items.length}</span>
                </div>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(a => (
                    <li key={a.id} className="truncate text-sm text-white/50">
                      <Hammer className="mr-1.5 inline h-3 w-3 text-white/30" />
                      {a.title}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function ProgressStat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div>
      <div className="text-xs font-medium text-white/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
    </div>
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
            className="mb-2 w-full rounded-md border border-white/[0.08] bg-black px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
          />
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write…"
            rows={4}
            className="w-full resize-y rounded-md border border-white/[0.08] bg-black px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
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
          <Badge tone={note.scope === 'free' ? 'default' : 'info'}>{note.scope}</Badge>
          {link && (
            <Link to={link.to} className="text-xs text-white hover:underline">{link.label}</Link>
          )}
          <span className="text-[11px] text-white/40">{new Date(note.updatedAt).toLocaleDateString()}</span>
        </div>
        {note.title && <div className="text-sm font-semibold text-white">{note.title}</div>}
        <p className="whitespace-pre-wrap text-sm text-white/70">{note.body}</p>
      </div>
      <button onClick={onDelete} aria-label="Delete note" className="shrink-0 text-white/40 hover:text-rose-400">
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
