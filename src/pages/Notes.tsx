import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Button, Card, EmptyState, PageHeader, PageShell } from '../components/ui';
import { CONCEPT_BY_ID, PROJECT_BY_ID, ROADMAP_BY_ID } from '../data/learning-os';
import { type LearningNote, useLearningNotes } from '../hooks/useUserStore';

type ScopeFilter = 'all' | 'concept' | 'roadmap' | 'project' | 'free';

export default function Notes() {
  const { notes, saveNote, deleteNote } = useLearningNotes();
  const [scope, setScope] = useState<ScopeFilter>('all');
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const filtered = useMemo(
    () => (scope === 'all' ? notes : notes.filter(n => n.scope === scope)),
    [notes, scope],
  );

  function create() {
    if (!body.trim()) return;
    saveNote({ scope: 'free', title: title.trim(), body: body.trim() });
    setTitle('');
    setBody('');
    setComposing(false);
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Notes"
        title="Notes"
        subtitle="Your own words are proof of learning. Capture recall, decisions, and failure postmortems here."
        actions={<Button onClick={() => setComposing(c => !c)}><Plus className="h-4 w-4" /> New note</Button>}
      />

      {composing && (
        <Card className="mb-5 p-4">
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
            rows={5}
            className="w-full resize-y rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button tone="ghost" onClick={() => setComposing(false)}>Cancel</Button>
            <Button onClick={create} disabled={!body.trim()}>Save</Button>
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['all', 'concept', 'roadmap', 'project', 'free'] as ScopeFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              scope === s
                ? 'border-purple-500/30 bg-purple-500/10 text-purple-300'
                : 'border-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s[0].toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No notes yet" hint="Notes you write on concepts also show up here." />
      ) : (
        <div className="space-y-3">
          {filtered.map(n => (
            <NoteRow key={n.id} note={n} onDelete={() => deleteNote(n.id)} />
          ))}
        </div>
      )}
    </PageShell>
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

function NoteRow({ note, onDelete }: { note: LearningNote; onDelete: () => void }) {
  const link = scopeLink(note);
  return (
    <Card className="flex items-start justify-between gap-3 p-4">
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
