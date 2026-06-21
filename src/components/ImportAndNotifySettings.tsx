import { FileUp, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { CONCEPTS } from '../data/learning-os';
import { useAuth } from '../contexts/AuthContext';
import { useImportedReviews } from '../hooks/useImportedReviews';
import {
  assignConceptToCards,
  parseAnkiImportFile,
  type AnkiImportResult,
} from '../lib/ankiImport';

export function ImportAndNotifySettings() {
  const { isGuest } = useAuth();
  const { reviews, importDeck, refresh } = useImportedReviews();
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [pendingImport, setPendingImport] = useState<AnkiImportResult | null>(null);
  const [bulkConceptId, setBulkConceptId] = useState('');

  async function finishImport(parsed: AnkiImportResult, extraCards = parsed.cards) {
    const allCards = [...parsed.cards, ...extraCards];
    if (!allCards.length) {
      setImportMsg(
        `Parsed ${parsed.stats.totalNotes} notes (${parsed.format}) — none ready to import. ` +
          'Tag notes in Anki (e.g. bm25) or assign a concept below.',
      );
      return;
    }
    const result = await importDeck(parsed.deckName, allCards);
    setImportMsg(
      `Imported ${result.imported} cards from “${parsed.deckName}” (${parsed.format})` +
        ` · ${parsed.stats.mapped + extraCards.length} scheduled` +
        (parsed.stats.unmapped > extraCards.length
          ? ` · ${parsed.stats.unmapped - extraCards.length} still unassigned`
          : '') +
        (parsed.skipped || result.skipped ? ` · ${(parsed.skipped || 0) + (result.skipped || 0)} skipped` : ''),
    );
    setPendingImport(null);
    setBulkConceptId('');
    await refresh();
  }

  async function onAnkiFile(file: File | null) {
    if (!file) return;
    setImporting(true);
    setImportMsg('');
    setPendingImport(null);
    try {
      const parsed = await parseAnkiImportFile(file);
      if (parsed.unmappedCards.length > 0) {
        setPendingImport(parsed);
        if (parsed.cards.length) {
          setImportMsg(
            `${parsed.stats.mapped} cards matched concepts · ${parsed.unmappedCards.length} need assignment before import.`,
          );
        } else {
          setImportMsg(
            `${parsed.unmappedCards.length} cards parsed (${parsed.format}) — pick a concept to import them.`,
          );
        }
        return;
      }
      await finishImport(parsed);
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  async function importWithBulkAssign(mode: 'all' | 'mapped-only') {
    if (!pendingImport) return;
    setImporting(true);
    try {
      const assigned =
        mode === 'all' && bulkConceptId
          ? assignConceptToCards(pendingImport.unmappedCards, bulkConceptId)
          : [];
      if (mode === 'all' && pendingImport.unmappedCards.length && !bulkConceptId) {
        setImportMsg('Choose a concept for unmapped cards, or import mapped only.');
        return;
      }
      await finishImport(pendingImport, assigned);
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  const deckCount = new Set(reviews.map(r => r.ankiRef?.deckName || 'imported')).size;

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
          <FileUp className="h-3.5 w-3.5" /> Anki import
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Upload a full <code className="text-slate-400">.apkg</code> deck or a plain-text export (.txt).
          Tag notes with concept ids (e.g. <code className="text-slate-400">bm25</code>) in Anki so cards
          map into your FSRS queue.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:border-slate-700">
          {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
          {importing ? 'Parsing deck…' : 'Choose .apkg or .txt'}
          <input
            type="file"
            accept=".apkg,.txt,.csv,application/octet-stream,text/plain"
            className="hidden"
            disabled={importing}
            onChange={e => void onAnkiFile(e.target.files?.[0] ?? null)}
          />
        </label>
        {isGuest && (
          <p className="mt-2 text-[11px] text-amber-400/90">Guest: cards stay on this device. Sign in to sync.</p>
        )}
        {reviews.length > 0 && (
          <p className="mt-2 text-[11px] text-slate-500">
            {reviews.length} imported cards across {deckCount} deck{deckCount > 1 ? 's' : ''}
          </p>
        )}
        {pendingImport && pendingImport.unmappedCards.length > 0 && (
          <div className="mt-3 rounded-md border border-amber-900/50 bg-amber-950/20 p-3 space-y-2">
            <p className="text-[11px] text-amber-200/90">
              {pendingImport.unmappedCards.length} card{pendingImport.unmappedCards.length > 1 ? 's' : ''}{' '}
              without concept tags — assign one concept to import them all:
            </p>
            <ul className="text-[10px] text-slate-500 space-y-0.5 max-h-24 overflow-y-auto">
              {pendingImport.unmappedCards.slice(0, 5).map(c => (
                <li key={c.id} className="truncate">
                  {c.question.slice(0, 80)}
                  {c.question.length > 80 ? '…' : ''}
                </li>
              ))}
              {pendingImport.unmappedCards.length > 5 && (
                <li>…and {pendingImport.unmappedCards.length - 5} more</li>
              )}
            </ul>
            <select
              value={bulkConceptId}
              onChange={e => setBulkConceptId(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-300"
            >
              <option value="">Select concept…</option>
              {CONCEPTS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={importing || !bulkConceptId}
                onClick={() => void importWithBulkAssign('all')}
                className="rounded border border-sky-800 bg-sky-950/40 px-2 py-1 text-[11px] text-sky-300 hover:border-sky-700 disabled:opacity-40"
              >
                Import all with concept
              </button>
              {pendingImport.cards.length > 0 && (
                <button
                  type="button"
                  disabled={importing}
                  onClick={() => void importWithBulkAssign('mapped-only')}
                  className="rounded border border-slate-700 px-2 py-1 text-[11px] text-slate-400 hover:border-slate-600"
                >
                  Import mapped only ({pendingImport.cards.length})
                </button>
              )}
              <button
                type="button"
                disabled={importing}
                onClick={() => setPendingImport(null)}
                className="rounded px-2 py-1 text-[11px] text-slate-500 hover:text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {importMsg && (
        <p className="text-xs text-slate-400 border-t border-slate-800 pt-3">{importMsg}</p>
      )}
    </div>
  );
}