import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, Card } from '../../components/ui';
import { useLearningNotes } from '../../hooks/useUserStore';

/** Inline note editor scoped to a single concept. */
export function ConceptNotes({ conceptId }: { conceptId: string }) {
  const { notes, saveNote, deleteNote } = useLearningNotes();
  const [draft, setDraft] = useState('');

  const conceptNotes = useMemo(
    () => notes.filter((n) => n.scope === 'concept' && n.refId === conceptId),
    [notes, conceptId]
  );

  function add() {
    const body = draft.trim();
    if (!body) return;
    saveNote({ scope: 'concept', refId: conceptId, body });
    setDraft('');
  }

  return (
    <div className="space-y-3">
      <Card className="p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note in your own words — recall, a gotcha, a link to your code…"
          rows={3}
          className="w-full resize-y rounded-md border border-slate-800 bg-slate-950 p-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-500/50 focus:outline-none"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={add} disabled={!draft.trim()}>
            Save note
          </Button>
        </div>
      </Card>
      {conceptNotes.map((n) => (
        <Card key={n.id} className="flex items-start justify-between gap-3 p-3">
          <div className="min-w-0">
            <p className="whitespace-pre-wrap text-sm text-slate-300">{n.body}</p>
            <div className="mt-1 text-[11px] text-slate-500">
              {new Date(n.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={() => deleteNote(n.id)}
            aria-label="Delete note"
            className="shrink-0 text-slate-500 hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Card>
      ))}
    </div>
  );
}
