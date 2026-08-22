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
        <label htmlFor={`concept-note-${conceptId}`} className="mb-2 block text-xs text-white/60">
          Note in your own words
        </label>
        <textarea
          id={`concept-note-${conceptId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a note in your own words — recall, a gotcha, a link to your code…"
          rows={3}
          className="w-full resize-y rounded-md border border-white/20 bg-black p-3 text-sm text-white outline-none placeholder:text-white/40 focus-visible:border-sky-300 focus-visible:ring-2 focus-visible:ring-sky-300/50"
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
            <p className="whitespace-pre-wrap text-sm text-white/75">{n.body}</p>
            <div className="mt-1 text-xs text-white/60">
              {new Date(n.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <button
            onClick={() => deleteNote(n.id)}
            aria-label="Delete note"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-white/60 hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </Card>
      ))}
    </div>
  );
}
