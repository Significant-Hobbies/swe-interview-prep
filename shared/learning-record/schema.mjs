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

/** 32-bit FNV-1a, hex. Deterministic and synchronous for short identity suffixes. */
function fnv1a(value) {
  let hash = 0x811c9dc5;
  for (const char of value) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Stable key for a free-text topic: a readable slug ("C++" reads c-plus-plus)
 * plus a hash of the normalized text. Case and spacing do not matter.
 */
export function topicKey(topic) {
  const normalized = String(topic ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/gu, ' ');
  let text = normalized;
  for (const [symbol, word] of TOPIC_SYMBOLS) text = text.split(symbol).join(word);
  const slug = slugify(text).slice(0, 80);
  if (!slug) throw invalid(`Topic "${topic}" must contain letters or digits.`);
  // The readable slug can collapse punctuation or truncate; the hash of the
  // full normalized text keeps every distinct topic distinct.
  return `topic:${slug}~${fnv1a(normalized)}`;
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
