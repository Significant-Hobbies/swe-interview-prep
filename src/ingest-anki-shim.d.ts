declare module '../../shared/lib/ingest-anki.mjs' {
  import type { ReviewQuestion } from './data/learning-os';

  export function parseAnkiExport(
    text: string,
    opts?: { deckName?: string; concepts?: { id: string; name: string }[] },
  ): {
    deckName: string;
    format: string;
    cards: unknown[];
    stats: { totalNotes: number; importable: number; unmapped: number };
  };

  export function parseApkgBytes(
    bytes: Uint8Array,
    SQL: unknown,
    opts?: { deckName?: string; concepts?: { id: string; name: string }[] },
  ): {
    deckName: string;
    format: string;
    cards: unknown[];
    stats: { totalNotes: number; importable: number; unmapped: number };
  };

  export function toReviewQuestions(
    parsed: { cards?: unknown[] },
    opts?: { requireConcept?: boolean },
  ): ReviewQuestion[];
}

declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const url: string;
  export default url;
}