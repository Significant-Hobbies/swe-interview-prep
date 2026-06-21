import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import { buildMinimalApkg } from './ingest-anki-fixture.mjs';
import {
  decompressCollection,
  ingestedAnkiId,
  mapConceptFromTags,
  parseAnkiExport,
  parseAnkiHeader,
  parseApkgBytes,
  stripAnkiMedia,
  stripHtml,
  toReviewQuestions,
} from './ingest-anki.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SAMPLE_TEXT = `#separator:tab
#html:true
#tags column:3
What is BM25?	BM25 is a lexical ranking function.	bm25 search-ir
How does HNSW work?	HNSW is a graph-based ANN index.	hnsw vector-db
`;

const concepts = [
  { id: 'bm25', name: 'BM25' },
  { id: 'hnsw', name: 'HNSW' },
];

describe('ingest-anki', () => {
  it('stripHtml and stripAnkiMedia clean card text', () => {
    expect(stripHtml('<b>Hi</b>')).toBe('Hi');
    expect(stripAnkiMedia('Hello [sound:foo.mp3] world')).toBe('Hello world');
  });

  it('parseAnkiHeader reads directives', () => {
    const { directives, dataLines } = parseAnkiHeader(SAMPLE_TEXT);
    expect(directives.tagsColumn).toBe(3);
    expect(dataLines).toHaveLength(2);
  });

  it('parseAnkiExport produces schedulable cards', () => {
    const parsed = parseAnkiExport(SAMPLE_TEXT, { concepts, deckName: 'test-deck' });
    expect(parsed.cards.length).toBe(2);
    const rqs = toReviewQuestions(parsed);
    expect(rqs).toHaveLength(2);
    expect(rqs[0].source).toBe('anki');
  });

  it('mapConceptFromTags matches concept id tags', () => {
    expect(mapConceptFromTags(['bm25'], concepts)).toBe('bm25');
  });

  it('parseApkgBytes reads generated minimal .apkg', async () => {
    const SQL = await initSqlJs();
    const apkg = await buildMinimalApkg();
    const parsed = parseApkgBytes(apkg, SQL, { concepts });
    expect(parsed.format).toBe('apkg');
    expect(parsed.deckName).toBe('Search Deck');
    expect(parsed.stats.totalNotes).toBe(2);
    const rqs = toReviewQuestions(parsed);
    expect(rqs).toHaveLength(1);
    expect(rqs[0].conceptId).toBe('bm25');
    expect(rqs[0].id).toBe(ingestedAnkiId('search-deck', '1706642722424'));
  });

  it('parses a real .apkg when ANKI_FIXTURE_PATH is set', async () => {
    const fixture = process.env.ANKI_FIXTURE_PATH;
    if (!fixture || !existsSync(fixture)) return;
    const SQL = await initSqlJs();
    const bytes = new Uint8Array(readFileSync(fixture));
    const parsed = parseApkgBytes(bytes, SQL, { concepts });
    expect(parsed.cards.length).toBeGreaterThan(0);
    expect(toReviewQuestions(parsed).length).toBeGreaterThan(0);
  });

  it('decompressCollection accepts raw sqlite', () => {
    const sqlite = new TextEncoder().encode('SQLite format 3\x00');
    expect(decompressCollection(sqlite)).toBe(sqlite);
  });
});