/** Build a minimal valid .apkg for tests (sql.js + fflate). */
import { zipSync } from 'fflate';
import initSqlJs from 'sql.js';

export async function buildMinimalApkg() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  db.run(`
    CREATE TABLE col (id INTEGER PRIMARY KEY, decks TEXT, models TEXT);
    INSERT INTO col VALUES (
      1,
      '{"1706642737485":{"name":"Search Deck","desc":""}}',
      '{"1":{"name":"Basic","type":0,"flds":[{"name":"Front","ord":0},{"name":"Back","ord":1}]}}'
    );
    CREATE TABLE notes (id INTEGER PRIMARY KEY, mid INTEGER, flds TEXT, tags TEXT);
    INSERT INTO notes VALUES (
      1706642722424, 1,
      'What is BM25?\x1fBM25 is a probabilistic lexical ranking function used in search engines.',
      'bm25 search-ir'
    );
    INSERT INTO notes VALUES (
      1706642722425, 1,
      'Unmapped note\x1fThis note has no concept tag and should be skipped when requireConcept.',
      'random-tag'
    );
    CREATE TABLE cards (id INTEGER PRIMARY KEY, nid INTEGER, did INTEGER);
    INSERT INTO cards VALUES (1706642722425, 1706642722424, 1706642737485);
    INSERT INTO cards VALUES (1706642722426, 1706642722425, 1706642737485);
  `);

  const sqliteBytes = db.export();
  db.close();

  return zipSync({
    'collection.anki21': sqliteBytes,
    meta: new Uint8Array([2, 8]),
  });
}