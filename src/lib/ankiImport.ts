// Anki import — .apkg (full) or plain-text export (.txt fallback).
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

import type { ReviewQuestion } from '../data/learning-os';
import { CONCEPTS } from '../data/learning-os';

export interface AnkiUnmappedCard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  externalId: string;
  deckName: string;
}

export interface AnkiImportResult {
  deckName: string;
  format: 'apkg' | 'text';
  cards: ReviewQuestion[];
  unmappedCards: AnkiUnmappedCard[];
  skipped: number;
  stats: {
    totalNotes: number;
    importable: number;
    mapped: number;
    unmapped: number;
  };
}

/** Turn parser stubs into schedulable review questions after manual concept assignment. */
export function assignConceptToCards(
  unmapped: AnkiUnmappedCard[],
  conceptId: string
): ReviewQuestion[] {
  return unmapped.map((c) => ({
    id: c.id,
    conceptId,
    type: 'recall' as const,
    difficulty: 'core' as const,
    question: c.question,
    answer: c.answer,
    source: 'anki' as const,
    ankiRef: { deckName: c.deckName, externalId: c.externalId, tags: c.tags },
  }));
}

let sqlModule: Awaited<ReturnType<typeof loadSql>> | null = null;

async function loadSql() {
  const initSqlJs = (await import('sql.js')).default;
  return initSqlJs({ locateFile: () => sqlWasmUrl });
}

async function getSql() {
  if (!sqlModule) sqlModule = await loadSql();
  return sqlModule;
}

function isApkg(file: File) {
  return file.name.toLowerCase().endsWith('.apkg');
}

function isTextExport(file: File) {
  const n = file.name.toLowerCase();
  return n.endsWith('.txt') || n.endsWith('.csv');
}

interface ParsedAnkiCard {
  id: string;
  conceptId?: string | null;
  question: string;
  answer: string;
  tags?: string[];
  externalId: string;
  deckName: string;
}

interface ParsedAnki {
  cards?: ParsedAnkiCard[];
  stats?: AnkiImportResult['stats'];
  deckName: string;
  format?: AnkiImportResult['format'];
}

type AnkiParseOpts = { concepts?: unknown; deckName?: string };

// shared/lib/ingest-anki.mjs is an untyped JS module — declare the surface we use.
interface IngestAnkiModule {
  parseAnkiExport: (text: string, opts?: AnkiParseOpts) => ParsedAnki;
  parseApkgBytes: (bytes: Uint8Array, SQL: unknown, opts?: AnkiParseOpts) => ParsedAnki;
  toReviewQuestions: (parsed: ParsedAnki, opts?: { requireConcept?: boolean }) => ReviewQuestion[];
}

export async function parseAnkiImportFile(file: File): Promise<AnkiImportResult> {
  const { parseAnkiExport, parseApkgBytes, toReviewQuestions } = (await import(
    '../../shared/lib/ingest-anki.mjs'
  )) as unknown as IngestAnkiModule;

  const deckFallback = file.name.replace(/\.(apkg|txt|csv)$/i, '') || 'imported';
  const concepts = CONCEPTS;

  let parsed;
  if (isApkg(file)) {
    const SQL = await getSql();
    const bytes = new Uint8Array(await file.arrayBuffer());
    parsed = parseApkgBytes(bytes, SQL, { concepts, deckName: deckFallback });
  } else if (isTextExport(file)) {
    parsed = parseAnkiExport(await file.text(), { concepts, deckName: deckFallback });
  } else {
    throw new Error('Unsupported file — use .apkg or Anki plain-text export (.txt)');
  }

  const cards = toReviewQuestions(parsed, { requireConcept: true });
  const unmappedCards = (parsed.cards || [])
    .filter((c: { conceptId?: string | null }) => !c.conceptId)
    .map(
      (c: {
        id: string;
        question: string;
        answer: string;
        tags?: string[];
        externalId: string;
        deckName: string;
      }) => ({
        id: c.id,
        question: c.question,
        answer: c.answer,
        tags: c.tags || [],
        externalId: c.externalId,
        deckName: c.deckName,
      })
    );
  const stats = parsed.stats ?? {
    totalNotes: parsed.cards?.length ?? 0,
    importable: parsed.cards?.length ?? 0,
    unmapped: unmappedCards.length,
  };

  return {
    deckName: parsed.deckName,
    format: parsed.format ?? (isApkg(file) ? 'apkg' : 'text'),
    cards,
    unmappedCards,
    skipped: (stats.importable ?? 0) - cards.length - unmappedCards.length,
    stats: {
      totalNotes: stats.totalNotes ?? 0,
      importable: stats.importable ?? 0,
      mapped: cards.length,
      unmapped: unmappedCards.length,
    },
  };
}
