import conceptsData from '../../src/data/concepts.json' with { type: 'json' };

export const ROLE_FIT_MIN_JOB_DESCRIPTION_CHARS = 40;
export const ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS = 20_000;
const ROLE_FIT_IMPORTANCE = Object.freeze(['must', 'preferred', 'context']);

const CONCEPTS = Object.freeze(conceptsData.concepts);
const CONCEPT_IDS = new Set(CONCEPTS.map((concept) => concept.id));

const ROLE_FIT_CONCEPT_CATALOG = Object.freeze(
  CONCEPTS.map((concept) => ({
    id: concept.id,
    name: concept.name,
    tags: Object.freeze((concept.tags ?? []).slice(0, 5)),
    description: concept.description,
  }))
);

export const ROLE_FIT_SYSTEM = `You map a software-engineering job description onto an existing learning catalog.

Return STRICT JSON with this shape:
{
  "roleTitle": "short role title",
  "summary": "two direct sentences about the role's learning emphasis",
  "requirements": [
    {
      "label": "normalized requirement",
      "importance": "must | preferred | context",
      "sourcePhrase": "an exact short phrase copied from the job description",
      "conceptIds": ["catalog-id"],
      "confidence": 0.0,
      "rationale": "why these catalog concepts match"
    }
  ],
  "unsupported": [
    {
      "label": "material requirement not covered by the catalog",
      "importance": "must | preferred | context",
      "sourcePhrase": "an exact short phrase copied from the job description",
      "rationale": "why it is not safely covered"
    }
  ]
}

Rules:
- Copy every sourcePhrase exactly from the supplied job description.
- Use only conceptIds present in the supplied catalog.
- Prefer 6-15 material requirements. Ignore generic company benefits and recruiting boilerplate.
- A requirement with no honest catalog match belongs in unsupported.
- Do not invent technologies, requirements, candidate experience, or learning content.
- Do not give interview answers or implementation solutions.
- JSON only.`;

function cleanText(value, maximum = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maximum);
}

function normalizeRoleFitSourceText(value) {
  return cleanText(String(value ?? ''), ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS)
    .normalize('NFKC')
    .toLocaleLowerCase('en-US');
}

function exactSourcePhrase(value, jobDescription) {
  const phrase = cleanText(value, 240);
  if (phrase.length < 3) return '';
  return normalizeRoleFitSourceText(jobDescription).includes(normalizeRoleFitSourceText(phrase))
    ? phrase
    : '';
}

function importance(value) {
  return ROLE_FIT_IMPORTANCE.includes(value) ? value : null;
}

function confidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(1, number));
}

function conceptIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && CONCEPT_IDS.has(id)))];
}

function sanitizeUnsupported(entry, jobDescription) {
  if (!entry || typeof entry !== 'object') return null;
  const label = cleanText(entry.label, 120);
  const sourcePhrase = exactSourcePhrase(entry.sourcePhrase, jobDescription);
  const level = importance(entry.importance);
  const rationale = cleanText(entry.rationale, 280);
  if (!label || !sourcePhrase || !level || !rationale) return null;
  return { label, importance: level, sourcePhrase, rationale };
}

function sanitizeRequirement(entry, jobDescription) {
  if (!entry || typeof entry !== 'object') return null;
  const label = cleanText(entry.label, 120);
  const sourcePhrase = exactSourcePhrase(entry.sourcePhrase, jobDescription);
  const level = importance(entry.importance);
  const score = confidence(entry.confidence);
  const rationale = cleanText(entry.rationale, 280);
  if (!label || !sourcePhrase || !level || score == null || !rationale) return null;
  return {
    key: `${normalizeRoleFitSourceText(label)}:${normalizeRoleFitSourceText(sourcePhrase)}`,
    label,
    importance: level,
    sourcePhrase,
    conceptIds: conceptIds(entry.conceptIds),
    confidence: score,
    rationale,
  };
}

function collectRequirements(entries, jobDescription, seen) {
  const requirements = [];
  const unsupported = [];
  for (const entry of entries) {
    const sanitized = sanitizeRequirement(entry, jobDescription);
    if (!sanitized || seen.has(sanitized.key)) continue;
    seen.add(sanitized.key);
    if (!sanitized.conceptIds.length) {
      unsupported.push({
        label: sanitized.label,
        importance: sanitized.importance,
        sourcePhrase: sanitized.sourcePhrase,
        rationale: sanitized.rationale,
      });
      continue;
    }
    requirements.push({
      id: `requirement-${requirements.length + 1}`,
      label: sanitized.label,
      importance: sanitized.importance,
      sourcePhrase: sanitized.sourcePhrase,
      conceptIds: sanitized.conceptIds,
      confidence: sanitized.confidence,
      rationale: sanitized.rationale,
    });
  }
  return { requirements, unsupported };
}

function appendUnsupported(target, entries, jobDescription, seen) {
  for (const entry of entries) {
    const sanitized = sanitizeUnsupported(entry, jobDescription);
    if (!sanitized) continue;
    const key = `${normalizeRoleFitSourceText(sanitized.label)}:${normalizeRoleFitSourceText(sanitized.sourcePhrase)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    target.push(sanitized);
  }
}

export class RoleFitValidationError extends Error {
  constructor(message = 'Role-fit response did not satisfy the grounded contract') {
    super(message);
    this.name = 'RoleFitValidationError';
  }
}

/**
 * Validate provider output against the submitted source and canonical catalog.
 * Unknown ids are removed; fabricated evidence removes the entire entry.
 */
export function validateRoleFitAnalysis(raw, jobDescription) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new RoleFitValidationError();
  }
  const roleTitle = cleanText(raw.roleTitle, 120) || 'Target software engineering role';
  const summary = cleanText(raw.summary, 500);
  const seen = new Set();
  const entries = Array.isArray(raw.requirements) ? raw.requirements.slice(0, 24) : [];
  const { requirements, unsupported } = collectRequirements(entries, jobDescription, seen);
  const unmapped = Array.isArray(raw.unsupported) ? raw.unsupported.slice(0, 16) : [];
  appendUnsupported(unsupported, unmapped, jobDescription, seen);

  if (!summary || (!requirements.length && !unsupported.length)) {
    throw new RoleFitValidationError();
  }
  return { roleTitle, summary, requirements, unsupported };
}

export function validateRoleFitInput(jobDescription) {
  const text = typeof jobDescription === 'string' ? jobDescription.trim() : '';
  if (text.length < ROLE_FIT_MIN_JOB_DESCRIPTION_CHARS) {
    throw new RoleFitValidationError(
      `Paste at least ${ROLE_FIT_MIN_JOB_DESCRIPTION_CHARS} characters from the job description.`
    );
  }
  if (text.length > ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS) {
    throw new RoleFitValidationError(
      `Job description must be ${ROLE_FIT_MAX_JOB_DESCRIPTION_CHARS.toLocaleString('en-US')} characters or fewer.`
    );
  }
  return text;
}

export function buildRoleFitPrompt({
  jobDescription,
  roleTitle = '',
  interviewHorizonDays = null,
}) {
  const text = validateRoleFitInput(jobDescription);
  const title = cleanText(roleTitle, 120);
  const catalog = ROLE_FIT_CONCEPT_CATALOG.map(
    (concept) =>
      `${concept.id} | ${concept.name} | ${concept.tags.join(', ')} | ${concept.description}`
  ).join('\n');
  return `Requested role title: ${title || 'Infer it from the job description'}
Target interview horizon: ${Number.isFinite(interviewHorizonDays) ? `${Math.max(1, Math.round(interviewHorizonDays))} days` : 'Not supplied'}

Canonical concept catalog (id | name | tags | description):
${catalog}

Job description:
---
${text}
---

Map the material requirements now. JSON only.`;
}

/** Stable non-cryptographic source id; it is not used for security. */
export function fingerprintRoleFitSource(jobDescription) {
  const text = normalizeRoleFitSourceText(jobDescription);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `rf-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function parseRoleFitModelText(text) {
  let value = String(text ?? '').trim();
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) value = fenced[1].trim();
  return JSON.parse(value);
}
