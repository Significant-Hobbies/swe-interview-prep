// Ambient types for the untyped JS Anki ingest helper.
// Returns are intentionally `unknown`; consumers refine via local casts.
export function stripHtml(raw: string): string;
export function stripAnkiMedia(text: string): string;
export function ingestedAnkiId(deckSlug: string, noteKey: string): string;
export function decompressCollection(bytes: Uint8Array): Uint8Array;
export function parseApkgBytes(bytes: Uint8Array, SQL: unknown, opts?: Record<string, unknown>): unknown;
export function parseAnkiHeader(text: string): unknown;
export function parseAnkiExport(text: string, opts?: Record<string, unknown>): unknown;
export function mapConceptFromTags(
  tagList: string[],
  concepts: unknown,
  deckName?: string | null
): unknown;
export function toReviewQuestions(parsed: unknown, opts?: { requireConcept?: boolean }): unknown;
