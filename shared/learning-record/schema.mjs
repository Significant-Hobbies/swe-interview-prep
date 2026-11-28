/**
 * Shared vocabulary, validation and normalization for the adaptive learning
 * record. Tool input schemas are JSON Schema; `validate` checks the subset we
 * use so the advertised schema and the enforced schema cannot drift.
 */

const LEVELS = ['unassessed', 'beginner', 'intermediate', 'advanced', 'expert'];
export const ASSESSED_LEVELS = LEVELS.slice(1);
export const LEVEL_RANK = Object.fromEntries(LEVELS.map((level, index) => [level, index]));
export const INTERESTS = ['avoid', 'low', 'medium', 'high'];
export const INTEREST_RANK = { avoid: -1, low: 0, medium: 1, high: 2 };
export const OUTCOMES = ['previously-known', 'newly-learned', 'needs-depth', 'needs-revision'];
export const ASSESSMENT_METHODS = [
  'self-assessment',
  'socratic',
  'explain-back',
  'exercise',
  'implementation',
  'debugging',
  'tradeoff-analysis',
  'recall-check',
];
export const COURSE_STATUSES = ['draft', 'active', 'paused', 'completed', 'archived'];
export const LESSON_STATUSES = ['planned', 'active', 'completed', 'skipped'];
export const SESSION_KINDS = [
  'course-lesson',
  'reading',
  'discussion',
  'exploration',
  'practice',
  'review',
  'project',
];
export const RESOURCE_KINDS = [
  'article',
  'paper',
  'video',
  'documentation',
  'repository',
  'book',
  'podcast',
  'course',
  'other',
];
export const RESOURCE_STATUSES = ['recommended', 'saved', 'reading', 'discussed', 'completed'];
export const RESOURCE_STATUS_RANK = Object.fromEntries(
  RESOURCE_STATUSES.map((status, index) => [status, index])
);
export const GAP_KINDS = ['missing', 'insufficient'];
export const GAP_STATUSES = ['open', 'proposed', 'pr-opened', 'resolved', 'dismissed'];

export class LearningRecordError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function invalid(message, details) {
  return new LearningRecordError('invalid_input', message, details);
}

export function notFound(message, details) {
  return new LearningRecordError('not_found', message, details);
}

// --- JSON Schema subset -------------------------------------------------------

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
}

function matchesType(value, type) {
  const actual = typeOf(value);
  if (Array.isArray(type)) return type.some((candidate) => matchesType(value, candidate));
  if (type === 'number') return actual === 'number' || actual === 'integer';
  return actual === type;
}

/** Dates in learning records stay between 2000 and 2100. */
function plausibleDate(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) && time >= Date.UTC(2000, 0, 1) && time < Date.UTC(2100, 0, 1);
}

const STRING_RULES = [
  [
    (schema, value) => schema.minLength !== undefined && value.trim().length < schema.minLength,
    () => 'must not be empty',
  ],
  [
    (schema, value) => schema.maxLength !== undefined && value.length > schema.maxLength,
    (schema) => `must be at most ${schema.maxLength} characters`,
  ],
  [
    (schema, value) => schema.pattern && !new RegExp(schema.pattern, 'u').test(value),
    () => 'has an invalid format',
  ],
  [
    (schema, value) => schema.format === 'uri' && !httpUrl(value),
    () => 'must be an absolute http(s) URL',
  ],
  [
    (schema, value) => schema.format === 'date-time' && !plausibleDate(value),
    () => 'must be an ISO 8601 date-time between 2000 and 2100',
  ],
];
const NUMBER_RULES = [
  [
    (schema, value) => schema.minimum !== undefined && value < schema.minimum,
    (schema) => `must be >= ${schema.minimum}`,
  ],
  [
    (schema, value) => schema.maximum !== undefined && value > schema.maximum,
    (schema) => `must be <= ${schema.maximum}`,
  ],
];

function applyRules(rules, schema, value, path, errors) {
  for (const [fails, message] of rules) {
    if (fails(schema, value)) errors.push(`${path} ${message(schema)}`);
  }
}

function checkArray(schema, value, path, errors) {
  if (schema.maxItems !== undefined && value.length > schema.maxItems) {
    errors.push(`${path} must have at most ${schema.maxItems} items`);
  }
  if (!schema.items) return;
  value.forEach((item, index) => check(schema.items, item, `${path}[${index}]`, errors));
}

function checkProperty(schema, key, item, path, errors) {
  const child = schema.properties?.[key];
  const childPath = path ? `${path}.${key}` : key;
  if (child) {
    if (item !== undefined) check(child, item, childPath, errors);
    return;
  }
  if (schema.additionalProperties === false) errors.push(`${childPath} is not supported`);
  else if (typeof schema.additionalProperties === 'object') {
    check(schema.additionalProperties, item, childPath, errors);
  }
}

function checkObject(schema, value, path, errors) {
  for (const key of schema.required ?? []) {
    if (value[key] === undefined) errors.push(`${path ? `${path}.` : ''}${key} is required`);
  }
  for (const [key, item] of Object.entries(value)) checkProperty(schema, key, item, path, errors);
}

function check(schema, value, path, errors) {
  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${path || 'input'} must be ${[schema.type].flat().join(' or ')}`);
    return;
  }
  if (value === null) return;
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path} must be one of: ${schema.enum.join(', ')}`);
    return;
  }
  const kind = typeOf(value);
  if (kind === 'string') applyRules(STRING_RULES, schema, value, path, errors);
  else if (kind === 'number' || kind === 'integer')
    applyRules(NUMBER_RULES, schema, value, path, errors);
  else if (kind === 'array') checkArray(schema, value, path, errors);
  else if (kind === 'object') checkObject(schema, value, path, errors);
}

export function validate(schema, value) {
  const errors = [];
  check(schema, value ?? {}, '', errors);
  if (errors.length) {
    throw invalid(`Invalid arguments: ${errors.slice(0, 8).join('; ')}`, { errors });
  }
  return value ?? {};
}

// --- Schema builders ------------------------------------------------------------

export const s = {
  text: (maxLength = 2_000, extra = {}) => ({ type: 'string', minLength: 1, maxLength, ...extra }),
  id: (description) => ({
    type: 'string',
    minLength: 1,
    maxLength: 200,
    pattern: '^[A-Za-z0-9._:@/-]+$',
    ...(description ? { description } : {}),
  }),
  enumOf: (values, description) => ({
    type: 'string',
    enum: values,
    ...(description ? { description } : {}),
  }),
  list: (items, maxItems = 50, description = '') => ({
    type: 'array',
    items,
    maxItems,
    ...(description ? { description } : {}),
  }),
  object: (properties, required = [], description = '') => ({
    type: 'object',
    properties,
    required,
    additionalProperties: false,
    ...(description ? { description } : {}),
  }),
  int: (minimum, maximum, description) => ({
    type: 'integer',
    minimum,
    maximum,
    ...(description ? { description } : {}),
  }),
  url: (description) => ({
    type: 'string',
    format: 'uri',
    maxLength: 2_000,
    ...(description ? { description } : {}),
  }),
  dateTime: (description) => ({
    type: 'string',
    format: 'date-time',
    maxLength: 40,
    ...(description ? { description } : {}),
  }),
};

// --- Normalization ----------------------------------------------------------------

export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
    .slice(0, 120);
}

const TOPIC_SYMBOLS = [
  ['+', ' plus '],
  ['#', ' sharp '],
  ['.', ' dot '],
  ['&', ' and '],
  ['@', ' at '],
  ['*', ' star '],
];

function spellSymbols(value) {
  let text = value;
  for (const [symbol, word] of TOPIC_SYMBOLS) text = text.split(symbol).join(word);
  return text;
}

/** Readable slug for a topic ("C++" reads c-plus-plus); empty for untransliterable scripts. */
export function topicSlug(topic) {
  return slugify(spellSymbols(String(topic ?? '').toLowerCase()));
}

const SHA256_K = Uint32Array.from([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const rotr = (value, bits) => (value >>> bits) | (value << (32 - bits));

/** Pad a UTF-8 message to whole 512-bit blocks, as SHA-256 specifies. */
function sha256Blocks(text) {
  const bytes = new TextEncoder().encode(text);
  const length = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(length);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(length - 8, Math.floor((bytes.length * 8) / 2 ** 32));
  view.setUint32(length - 4, (bytes.length * 8) >>> 0);
  return view;
}

/** One 64-byte block of the SHA-256 compression function. */
function sha256Block(state, view, offset) {
  const w = new Uint32Array(64);
  for (let i = 0; i !== 16; i += 1) w[i] = view.getUint32(offset + i * 4);
  for (let i = 16; i !== 64; i += 1) {
    const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
    const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
    w[i] = w[i - 16] + s0 + w[i - 7] + s1;
  }
  const v = Array.from(state);
  for (let i = 0; i !== 64; i += 1) {
    const s1 = rotr(v[4], 6) ^ rotr(v[4], 11) ^ rotr(v[4], 25);
    const choice = (v[4] & v[5]) ^ (~v[4] & v[6]);
    const t1 = (v[7] + s1 + choice + SHA256_K[i] + w[i]) >>> 0;
    const s0 = rotr(v[0], 2) ^ rotr(v[0], 13) ^ rotr(v[0], 22);
    const majority = (v[0] & v[1]) ^ (v[0] & v[2]) ^ (v[1] & v[2]);
    v.splice(
      0,
      8,
      (t1 + s0 + majority) >>> 0,
      v[0],
      v[1],
      v[2],
      (v[3] + t1) >>> 0,
      v[4],
      v[5],
      v[6]
    );
  }
  for (let i = 0; i !== 8; i += 1) state[i] = (state[i] + v[i]) >>> 0;
}

/**
 * Synchronous SHA-256 (hex) for identity keys. Web Crypto is async only, and
 * topic keys are computed in synchronous validation paths.
 */
function sha256HexSync(text) {
  const state = Uint32Array.from([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const view = sha256Blocks(text);
  for (let offset = 0; offset !== view.byteLength; offset += 64) sha256Block(state, view, offset);
  return Array.from(state, (word) => word.toString(16).padStart(8, '0')).join('');
}

/** 64-bit identity suffix: the leading bits of SHA-256 of the normalized text. */
function identityHash(value) {
  return sha256HexSync(value).slice(0, 16);
}

/**
 * Stable key for a free-text topic: a readable slug ("C++" reads c-plus-plus)
 * plus a 64-bit hash of the normalized text. Case and spacing do not matter.
 * Topics in scripts the slug cannot transliterate keep a generic slug; the
 * hash still identifies them, and the learner's label is stored separately.
 */
export function topicKey(topic) {
  const raw = String(topic ?? '');
  // Lone surrogates would all encode to U+FFFD and merge distinct topics.
  if (/[\uD800-\uDFFF]/u.test(raw)) throw invalid(`Topic "${topic}" is not valid Unicode text.`);
  const normalized = raw
    .normalize('NFC')
    .toLowerCase()
    .replace(/ς/gu, 'σ')
    .trim()
    .replace(/\s+/gu, ' ');
  const text = spellSymbols(normalized);
  if (!/[\p{L}\p{N}]/u.test(text)) {
    throw invalid(`Topic "${topic}" must contain letters or digits.`);
  }
  const slug = slugify(text).slice(0, 80) || 'topic';
  // The readable slug can collapse punctuation, scripts or length; the hash of
  // the full normalized text keeps distinct topics distinct.
  return `topic:${slug}~${identityHash(normalized)}`;
}

function httpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

const TRACKING_PARAMS =
  /^(utm_[a-z_]+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|ref_src|ref_url|igshid|_hsenc|_hsmi)$/iu;

/**
 * Canonical identity for an external resource so the same article shared twice
 * (with tracking parameters, a fragment, `www.`, http/https, a trailing slash,
 * a versioned arXiv PDF link or a youtu.be short link) is one record.
 */
export function canonicalUrl(value) {
  const url = httpUrl(String(value ?? '').trim());
  if (!url) throw invalid('Resource url must be an absolute http(s) URL.');
  url.protocol = 'https:';
  url.hash = '';
  url.username = '';
  url.password = '';
  let host = url.hostname.toLowerCase().replace(/^(www|m|mobile)\./u, '');
  if (url.port === '443' || url.port === '80') url.port = '';
  let pathname = url.pathname.replace(/\/{2,}/gu, '/');

  if (host === 'youtu.be') {
    const videoId = pathname.split('/').find(Boolean);
    host = 'youtube.com';
    pathname = '/watch';
    url.search = videoId ? `?v=${videoId}` : '';
  }
  if (host === 'youtube.com' && pathname === '/watch') {
    const videoId = url.searchParams.get('v');
    url.search = videoId ? `?v=${videoId}` : '';
  }
  if (host === 'arxiv.org') {
    const match =
      /^\/(?:abs|pdf)\/([0-9]{4}\.[0-9]{4,5}|[a-z-]+\/[0-9]{7})(?:v[0-9]+)?(?:\.pdf)?$/u.exec(
        pathname
      );
    if (match) pathname = `/abs/${match[1]}`;
  }
  if (host === 'github.com') pathname = pathname.replace(/\.git$/u, '');

  const params = [...url.searchParams.entries()]
    .filter(([key]) => !TRACKING_PARAMS.test(key))
    .sort(([a], [b]) => a.localeCompare(b));
  const search = new URLSearchParams(params).toString();
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/u, '');
  if (host === 'github.com') {
    // Owner and repository names are case-insensitive; refs and file paths are not.
    const [, owner = '', repo = '', ...rest] = pathname.split('/');
    pathname =
      ['', owner.toLowerCase(), repo.toLowerCase(), ...rest].join('/').replace(/\/+$/u, '') || '/';
  }
  const port = url.port ? `:${url.port}` : '';
  return `https://${host}${port}${pathname || '/'}${search ? `?${search}` : ''}`;
}

export function uniqueStrings(values, limit = 200) {
  const seen = new Set();
  const output = [];
  for (const value of values ?? []) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(trimmed);
    if (output.length >= limit) break;
  }
  return output;
}

export function parseJson(value, fallback) {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** JSON with sorted object keys so equal requests hash equally. */
export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

export function encodeCursor(offset) {
  return offset > 0 ? btoa(`o:${offset}`) : null;
}

export function decodeCursor(cursor) {
  if (!cursor) return 0;
  try {
    const match = /^o:(\d{1,7})$/u.exec(atob(cursor));
    if (match) return Number(match[1]);
  } catch {
    // fall through
  }
  throw invalid('cursor is invalid; pass the nextCursor value from the previous page.');
}

/** Keyset cursor: the sort values of the last row, so new rows never shift pages. */
export function encodeKeyset(values) {
  return btoa(`k:${JSON.stringify(values)}`);
}

export function decodeKeyset(cursor, length = 2) {
  if (!cursor) return null;
  try {
    const text = atob(cursor);
    if (text.startsWith('k:')) {
      const values = JSON.parse(text.slice(2));
      if (
        Array.isArray(values) &&
        values.length === length &&
        values.every((value) => typeof value === 'string' || typeof value === 'number')
      ) {
        return values;
      }
    }
  } catch {
    // fall through
  }
  throw invalid('cursor is invalid; pass the nextCursor value from the previous page.');
}
