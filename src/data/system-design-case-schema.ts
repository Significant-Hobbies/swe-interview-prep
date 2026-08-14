export const SYSTEM_DESIGN_STAGE_IDS = [
  'scoping',
  'estimation',
  'high-level-design',
  'deep-dive',
  'failure',
  'review',
] as const;

export type SystemDesignStageId = (typeof SYSTEM_DESIGN_STAGE_IDS)[number];
type PublicationState = 'practice-only' | 'approved';

export const SYSTEM_DESIGN_CATEGORIES = [
  { id: 'ai-systems', label: 'AI systems' },
  { id: 'social-real-time', label: 'Social and real-time' },
  { id: 'media-collaboration', label: 'Media and collaboration' },
  { id: 'infrastructure-storage', label: 'Infrastructure and storage' },
  { id: 'commerce-marketplaces', label: 'Commerce and marketplaces' },
] as const;

export type SystemDesignCategoryId = (typeof SYSTEM_DESIGN_CATEGORIES)[number]['id'];

export interface SystemDesignStage {
  id: SystemDesignStageId;
  title: string;
  prompt: string;
  interviewerNote: string;
}

export interface CalculationAnchor {
  id: string;
  label: string;
  formula: string;
  unit: string;
  expectedTerms: string[];
}

export interface RubricAnchor {
  score: 0 | 1 | 2 | 3;
  description: string;
}

export interface RubricDimension {
  id: string;
  label: string;
  weight: number;
  stageIds: SystemDesignStageId[];
  evidenceSignals: string[];
  misconceptionSignals: string[];
  anchors: RubricAnchor[];
  conceptIds: string[];
  drillIds: string[];
}

export interface FollowUpBranch {
  id: string;
  stageId: 'deep-dive';
  matchAny: string[];
  prompt: string;
}

export interface FailureInjection {
  id: string;
  title: string;
  prompt: string;
  expectedSignals: string[];
}

export interface SystemDesignSource {
  title: string;
  url: string;
  kind: 'paper' | 'official-doc' | 'standard';
}

interface StudyGuideSection {
  heading: string;
  body: string;
}

export interface SystemDesignStudyGuide {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  sections: StudyGuideSection[];
  finalAnswer: string;
}

export interface SystemDesignCase {
  id: string;
  version: string;
  title: string;
  category: SystemDesignCategoryId;
  pattern: string;
  criticalPath: string;
  durationMinutes: number;
  prompt: string;
  difficulty: 'core' | 'advanced';
  hiddenAssumptions: string[];
  stages: SystemDesignStage[];
  calculationAnchors: CalculationAnchor[];
  rubricDimensions: RubricDimension[];
  followUps: FollowUpBranch[];
  failureInjections: FailureInjection[];
  conceptIds: string[];
  drillIds: string[];
  commonMistakes: string[];
  strongerAnswer: string;
  sources: SystemDesignSource[];
  publication: {
    state: PublicationState;
    guide?: SystemDesignStudyGuide;
  };
}

export interface CaseValidationReferences {
  conceptIds?: ReadonlySet<string>;
  drillIds?: ReadonlySet<string>;
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_GUIDE_HEADINGS = [
  'Clarify the contract',
  'Capacity math',
  'Architecture',
  'Deep dive',
  'Failure handling',
  'Observability and cost',
  'Common mistakes',
  'Harder follow-ups',
];

function nonEmpty(values: readonly string[]) {
  return values.length > 0 && values.every((value) => value.trim().length > 0);
}

export function validateSystemDesignCase(
  caseDefinition: SystemDesignCase,
  references: CaseValidationReferences = {}
): string[] {
  const errors: string[] = [];
  const prefix = caseDefinition.id || '<missing-id>';
  const add = (message: string) => errors.push(`${prefix}: ${message}`);

  if (!ID_PATTERN.test(caseDefinition.id)) add('id must be kebab-case');
  if (!SEMVER_PATTERN.test(caseDefinition.version)) add('version must be semantic x.y.z');
  if (!caseDefinition.title.trim()) add('title is required');
  if (!SYSTEM_DESIGN_CATEGORIES.some((category) => category.id === caseDefinition.category)) {
    add('category must be recognized');
  }
  if (!caseDefinition.pattern?.trim()) add('reusable pattern is required');
  if (!caseDefinition.criticalPath?.trim()) add('critical path is required');
  if (!caseDefinition.prompt.trim()) add('prompt is required');
  if (caseDefinition.durationMinutes < 30) add('duration must be at least 30 minutes');
  if (!nonEmpty(caseDefinition.hiddenAssumptions)) add('hidden assumptions are required');
  if (!nonEmpty(caseDefinition.conceptIds)) add('concept mappings are required');
  if (!nonEmpty(caseDefinition.drillIds)) add('drill mappings are required');
  if (!nonEmpty(caseDefinition.commonMistakes)) add('common mistakes are required');
  if (!caseDefinition.strongerAnswer.trim()) add('stronger answer is required');

  const stageIds = caseDefinition.stages.map((stage) => stage.id);
  if (JSON.stringify(stageIds) !== JSON.stringify(SYSTEM_DESIGN_STAGE_IDS)) {
    add(`stages must be ordered ${SYSTEM_DESIGN_STAGE_IDS.join(' -> ')}`);
  }
  for (const stage of caseDefinition.stages) {
    if (!stage.title.trim() || !stage.prompt.trim() || !stage.interviewerNote.trim()) {
      add(`stage ${stage.id} is incomplete`);
    }
  }

  if (caseDefinition.calculationAnchors.length === 0) add('calculation anchors are required');
  for (const anchor of caseDefinition.calculationAnchors) {
    if (!ID_PATTERN.test(anchor.id)) add(`calculation anchor ${anchor.id} has an invalid id`);
    if (!anchor.label.trim() || !anchor.formula.trim() || !anchor.unit.trim()) {
      add(`calculation anchor ${anchor.id} is incomplete`);
    }
    if (!nonEmpty(anchor.expectedTerms)) add(`calculation anchor ${anchor.id} needs terms`);
  }

  const dimensionIds = new Set<string>();
  let weight = 0;
  for (const dimension of caseDefinition.rubricDimensions) {
    if (dimensionIds.has(dimension.id)) add(`duplicate rubric dimension ${dimension.id}`);
    dimensionIds.add(dimension.id);
    weight += dimension.weight;
    if (!nonEmpty(dimension.stageIds)) add(`dimension ${dimension.id} needs stages`);
    if (!nonEmpty(dimension.evidenceSignals))
      add(`dimension ${dimension.id} needs evidence signals`);
    if (!nonEmpty(dimension.conceptIds)) add(`dimension ${dimension.id} needs concept mappings`);
    if (!nonEmpty(dimension.drillIds)) add(`dimension ${dimension.id} needs drill mappings`);
    if (dimension.anchors.map((anchor) => anchor.score).join(',') !== '0,1,2,3') {
      add(`dimension ${dimension.id} must define score anchors 0,1,2,3`);
    }
  }
  if (caseDefinition.rubricDimensions.length < 4)
    add('at least four rubric dimensions are required');
  if (Math.abs(weight - 1) > 0.0001) add('rubric weights must sum to 1');

  const branchIds = new Set<string>();
  for (const branch of caseDefinition.followUps) {
    if (branchIds.has(branch.id)) add(`duplicate follow-up ${branch.id}`);
    branchIds.add(branch.id);
    if (branch.stageId !== 'deep-dive') add(`follow-up ${branch.id} must target deep-dive`);
    if (!nonEmpty(branch.matchAny) || !branch.prompt.trim())
      add(`follow-up ${branch.id} is incomplete`);
  }
  if (caseDefinition.followUps.length === 0)
    add('at least one deterministic follow-up is required');

  if (caseDefinition.failureInjections.length === 0) add('failure injection is required');
  for (const failure of caseDefinition.failureInjections) {
    if (!failure.prompt.trim() || !nonEmpty(failure.expectedSignals)) {
      add(`failure injection ${failure.id} is incomplete`);
    }
  }

  if (caseDefinition.sources.length < 2)
    add('at least two primary or official sources are required');
  for (const source of caseDefinition.sources) {
    if (!source.title.trim() || !source.url.startsWith('https://'))
      add('sources must have titles and HTTPS URLs');
  }

  const allConceptIds = new Set([
    ...caseDefinition.conceptIds,
    ...caseDefinition.rubricDimensions.flatMap((dimension) => dimension.conceptIds),
  ]);
  const allDrillIds = new Set([
    ...caseDefinition.drillIds,
    ...caseDefinition.rubricDimensions.flatMap((dimension) => dimension.drillIds),
  ]);
  if (references.conceptIds) {
    for (const id of allConceptIds)
      if (!references.conceptIds.has(id)) add(`unknown concept ${id}`);
  }
  if (references.drillIds) {
    for (const id of allDrillIds) if (!references.drillIds.has(id)) add(`unknown drill ${id}`);
  }

  if (caseDefinition.publication.state === 'approved') {
    const guide = caseDefinition.publication.guide;
    if (!guide) {
      add('approved publication requires a guide');
    } else {
      if (!ID_PATTERN.test(guide.slug)) add('guide slug must be kebab-case');
      if (!guide.title.trim() || !guide.description.trim()) add('guide metadata is required');
      if (!DATE_PATTERN.test(guide.publishedAt) || !DATE_PATTERN.test(guide.updatedAt)) {
        add('guide dates must be YYYY-MM-DD');
      }
      if (!guide.finalAnswer.trim()) add('guide final answer is required');
      const headings = new Set(guide.sections.map((section) => section.heading));
      for (const heading of REQUIRED_GUIDE_HEADINGS) {
        if (!headings.has(heading)) add(`guide is missing section ${heading}`);
      }
      const wordCount = guide.sections
        .map((section) => section.body)
        .join(' ')
        .split(/\s+/)
        .filter(Boolean).length;
      if (wordCount < 1200) add('approved guide must contain at least 1200 section words');
    }
  } else if (caseDefinition.publication.guide) {
    add('practice-only case cannot expose a guide');
  }

  return errors;
}

export function validateSystemDesignCatalog(
  cases: readonly SystemDesignCase[],
  references: CaseValidationReferences = {}
): string[] {
  const errors = cases.flatMap((caseDefinition) =>
    validateSystemDesignCase(caseDefinition, references)
  );
  const ids = new Set<string>();
  const patterns = new Set<string>();
  for (const caseDefinition of cases) {
    if (ids.has(caseDefinition.id)) errors.push(`catalog: duplicate case id ${caseDefinition.id}`);
    ids.add(caseDefinition.id);
    const normalizedPattern = caseDefinition.pattern?.trim().toLocaleLowerCase() ?? '';
    if (patterns.has(normalizedPattern)) {
      errors.push(`catalog: duplicate reusable pattern ${caseDefinition.pattern}`);
    }
    patterns.add(normalizedPattern);
  }
  return errors;
}
