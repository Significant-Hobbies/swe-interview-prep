/**
 * Anki import — best-effort support for:
 *   • .apkg (zip + SQLite collection.anki21 / .anki2, zstd-wrapped variants)
 *   • plain-text export (.txt) — zero-dep fallback
 */
import { unzipSync } from 'fflate';
import { decompress as zstdDecompress } from 'fzstd';

const FIELD_SEP = '\x1f';
const MIN_ANSWER_CHARS = 20;
const ZSTD_MAGIC = new Uint8Array([0x28, 0xb5, 0x2f, 0xfd]);

export function stripHtml(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Remove Anki media tokens so cards read cleanly in review UI. */
export function stripAnkiMedia(text) {
  return String(text)
    .replace(/\[sound:[^\]]+\]/gi, ' ')
    .replace(/\[anki:[^\]]+\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ingestedAnkiId(deckSlug, noteKey) {
  const safe = `${deckSlug}-${noteKey}`.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 100);
  return `rq-anki-${safe}`;
}

function slugDeck(name) {
  return (name || 'deck')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
}

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function isSqlite(bytes) {
  if (!bytes || bytes.length < 16) return false;
  const head = String.fromCharCode(...bytes.slice(0, 16));
  return head.startsWith('SQLite format');
}

function isZstd(bytes) {
  if (!bytes || bytes.length < 4) return false;
  return (
    bytes[0] === ZSTD_MAGIC[0] &&
    bytes[1] === ZSTD_MAGIC[1] &&
    bytes[2] === ZSTD_MAGIC[2] &&
    bytes[3] === ZSTD_MAGIC[3]
  );
}

/** Decompress zstd-wrapped collection blobs (Anki 23.10+). */
export function decompressCollection(bytes) {
  if (isSqlite(bytes)) return bytes;
  if (isZstd(bytes)) {
    const out = zstdDecompress(bytes);
    if (isSqlite(out)) return out;
    throw new Error('Decompressed collection is not SQLite — update Anki or use plain-text export');
  }
  throw new Error(
    'Unknown collection format — try re-exporting the deck or use Notes in plain text (.txt)'
  );
}

function collectionEntry(zipEntries) {
  const names = Object.keys(zipEntries);
  const prefer = ['collection.anki21', 'collection.anki2', 'collection.anki21b'];
  for (const p of prefer) {
    const hit = names.find((n) => n.endsWith(p) || n === p);
    if (hit) return { name: hit, bytes: zipEntries[hit] };
  }
  return null;
}

function parseColJson(db) {
  let decks = {};
  let models = {};
  try {
    const row = db.exec('SELECT decks, models FROM col LIMIT 1');
    if (row[0]?.values[0]) {
      if (row[0].values[0][0]) decks = JSON.parse(row[0].values[0][0]);
      if (row[0].values[0][1]) models = JSON.parse(row[0].values[0][1]);
    }
  } catch {
    // optional metadata
  }
  return { decks, models };
}

function deckNameForId(decks, did) {
  const key = String(did);
  return decks[key]?.name || decks[did]?.name || null;
}

function modelForId(models, mid) {
  return models[String(mid)] || models[mid] || null;
}

function fieldsFromNote(flds, model) {
  const parts = String(flds || '').split(FIELD_SEP);
  const type = model?.type ?? 0;

  if (type === 1) {
    const raw = stripAnkiMedia(stripHtml(parts[0] || ''));
    if (!raw) return { front: '', back: '' };
    const front = raw.replace(/\{\{c\d+::([^}]+)\}\}/gi, '[…]');
    return { front, back: raw };
  }

  const front = stripAnkiMedia(stripHtml(parts[0] || ''));
  const back = stripAnkiMedia(stripHtml(parts[1] || parts[0] || ''));
  return { front, back };
}

function buildCard({ noteId, front, back, tagList, deckName, concepts, mapConcept }) {
  if (!front || back.length < MIN_ANSWER_CHARS) return null;

  const conceptId = mapConcept
    ? mapConcept(tagList, concepts, deckName)
    : mapConceptFromTags(tagList, concepts, deckName);

  const deckSlug = slugDeck(deckName);
  return {
    externalId: String(noteId),
    id: ingestedAnkiId(deckSlug, noteId),
    deckName,
    conceptId,
    type: 'recall',
    difficulty: 'core',
    question: front,
    answer: back.slice(0, 4000),
    tags: tagList,
    source: 'anki',
  };
}

/**
 * @param {Uint8Array} bytes — raw .apkg
 * @param {object} SQL — sql.js module
 */
export function parseApkgBytes(bytes, SQL, opts = {}) {
  const zip = unzipSync(bytes);
  const entry = collectionEntry(zip);
  if (!entry) throw new Error('No collection.anki21/anki2 found in .apkg');

  const sqliteBytes = decompressCollection(entry.bytes);
  const db = new SQL.Database(sqliteBytes);
  const { decks, models } = parseColJson(db);
  const concepts = opts.concepts || [];

  const notesRes = db.exec(`
    SELECT n.id, n.mid, n.flds, n.tags,
      (SELECT c.did FROM cards c WHERE c.nid = n.id LIMIT 1) AS did
    FROM notes n
  `);

  const cards = [];
  const defaultDeck = opts.deckName || 'imported';

  if (notesRes.length) {
    for (const row of notesRes[0].values) {
      const [noteId, mid, flds, tags, did] = row;
      const model = modelForId(models, mid);
      const { front, back } = fieldsFromNote(flds, model);
      const tagList = String(tags || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const deckName = deckNameForId(decks, did) || defaultDeck;

      const card = buildCard({
        noteId,
        front,
        back,
        tagList,
        deckName,
        concepts,
        mapConcept: opts.mapConcept,
      });
      if (card) cards.push(card);
    }
  }

  db.close();

  const deckName = cards[0]?.deckName || defaultDeck;
  return {
    deckName,
    format: 'apkg',
    cards,
    stats: {
      totalNotes: notesRes[0]?.values.length ?? 0,
      importable: cards.length,
      unmapped: cards.filter((c) => !c.conceptId).length,
    },
  };
}

// --- Plain text export (Anki: File → Export → Notes in plain text) ------------

function separatorFor(directives) {
  const sep = directives.separator || 'tab';
  if (sep === 'tab') return '\t';
  if (sep === 'comma') return ',';
  if (sep === 'semicolon') return ';';
  if (sep === 'space') return ' ';
  return '\t';
}

export function parseAnkiHeader(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const directives = { html: true, tagsColumn: null, separator: 'tab' };
  let start = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#')) {
      start = i;
      break;
    }
    const body = line.slice(1).trim();
    if (body.startsWith('separator:')) {
      directives.separator = body.slice('separator:'.length).trim();
    } else if (body.startsWith('html:')) {
      directives.html = body.slice('html:'.length).trim() === 'true';
    } else if (/^tags column:/i.test(body)) {
      const n = parseInt(body.split(':')[1].trim(), 10);
      if (!Number.isNaN(n)) directives.tagsColumn = n;
    } else if (/^deck column:/i.test(body)) {
      const n = parseInt(body.split(':')[1].trim(), 10);
      if (!Number.isNaN(n)) directives.deckColumn = n;
    }
    start = i + 1;
  }

  return { directives, dataLines: lines.slice(start).filter((l) => l.trim()) };
}

export function parseAnkiExport(text, opts = {}) {
  const { directives, dataLines } = parseAnkiHeader(text);
  const sep = separatorFor(directives);
  const concepts = opts.concepts || [];
  let deckName = opts.deckName || 'imported';
  const cards = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const cols = line.split(sep);
    if (cols.length < 2) continue;

    let front = cols[0] || '';
    let back = cols[1] || '';
    let tagList = [];

    if (directives.deckColumn === 1 && cols[0]) {
      deckName = stripHtml(cols[0]) || deckName;
    }

    if (directives.tagsColumn != null && directives.tagsColumn > 0) {
      const tagCol = cols[directives.tagsColumn - 1];
      if (tagCol) tagList = tagCol.trim().split(/\s+/).filter(Boolean);
    } else if (cols.length >= 3) {
      tagList = (cols[cols.length - 1] || '').trim().split(/\s+/).filter(Boolean);
    }

    if (directives.html) {
      front = stripAnkiMedia(stripHtml(front));
      back = stripAnkiMedia(stripHtml(back));
    } else {
      front = stripAnkiMedia(front.trim());
      back = stripAnkiMedia(back.trim());
    }

    const noteKey = simpleHash(`${front}|${back}|${i}`);
    const card = buildCard({
      noteId: noteKey,
      front,
      back,
      tagList,
      deckName,
      concepts,
      mapConcept: opts.mapConcept,
    });
    if (card) cards.push(card);
  }

  return {
    deckName,
    format: 'text',
    cards,
    stats: {
      totalNotes: dataLines.length,
      importable: cards.length,
      unmapped: cards.filter((c) => !c.conceptId).length,
    },
  };
}

export function mapConceptFromTags(tagList, concepts, deckName = null) {
  for (const tag of tagList) {
    const lower = tag.toLowerCase();
    const hit = concepts.find(
      (c) => c.id === lower || c.id === tag || c.name.toLowerCase() === lower
    );
    if (hit) return hit.id;
  }
  for (const tag of tagList) {
    const lower = tag.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const hit = concepts.find((c) => lower.includes(c.id) || c.id.includes(lower));
    if (hit) return hit.id;
  }
  if (deckName) {
    const slug = slugDeck(deckName).replace(/-/g, ' ');
    const hit = concepts.find(
      (c) => slug.includes(c.id) || c.name.toLowerCase().includes(slug.slice(0, 12))
    );
    if (hit) return hit.id;
  }
  return null;
}

export function toReviewQuestions(parsed, { requireConcept = true } = {}) {
  return (parsed.cards || [])
    .filter((c) => !requireConcept || c.conceptId)
    .map((c) => ({
      id: c.id,
      conceptId: c.conceptId,
      type: c.type || 'recall',
      difficulty: c.difficulty || 'core',
      question: c.question,
      answer: c.answer,
      source: 'anki',
      ankiRef: { deckName: c.deckName, externalId: c.externalId, tags: c.tags },
    }));
}
