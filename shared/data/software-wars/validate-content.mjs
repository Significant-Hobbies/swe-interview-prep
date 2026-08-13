import {
  BLITZ_TOPICS,
  CONTENT_DIFFICULTIES,
  CONTENT_LIFECYCLE,
  RANKED_LAUNCH_MINIMUMS,
} from './authoring-schema.mjs';

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function duplicateValues(values) {
  const seen = new Set();
  return values.filter((value) => {
    if (seen.has(value)) return true;
    seen.add(value);
    return false;
  });
}

function normalizeText(value) {
  return String(value ?? '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function tokenSet(value) {
  return new Set(
    normalizeText(value)
      .split(' ')
      .filter((token) => token.length > 2)
  );
}

function jaccardSimilarity(left, right) {
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return intersection / (left.size + right.size - intersection || 1);
}

function detectQuestionCollisions(questions, errors) {
  const normalizedStems = new Map();
  const normalizedOptionSets = new Map();
  const tokenized = [];

  for (const question of questions) {
    const normalizedStem = normalizeText(question.stem);
    const previousStem = normalizedStems.get(normalizedStem);
    if (previousStem) errors.push(`Duplicate normalized stem ${previousStem} and ${question.id}`);
    else normalizedStems.set(normalizedStem, question.id);

    const optionSet = question.options
      ?.map(({ label }) => normalizeText(label))
      .sort()
      .join('|');
    const previousOptions = normalizedOptionSets.get(optionSet);
    if (optionSet && previousOptions && previousOptions.contentKey !== question.contentKey) {
      errors.push(`Duplicate option set ${previousOptions.id} and ${question.id}`);
    } else if (optionSet) {
      normalizedOptionSets.set(optionSet, { id: question.id, contentKey: question.contentKey });
    }

    tokenized.push({ id: question.id, tokens: tokenSet(question.stem) });
  }

  for (let leftIndex = 0; leftIndex < tokenized.length; leftIndex += 1) {
    const left = tokenized[leftIndex];
    if (left.tokens.size < 8) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < tokenized.length; rightIndex += 1) {
      const right = tokenized[rightIndex];
      if (right.tokens.size < 8) continue;
      const lengthRatio =
        Math.min(left.tokens.size, right.tokens.size) /
        Math.max(left.tokens.size, right.tokens.size);
      if (lengthRatio < 0.85) continue;
      if (jaccardSimilarity(left.tokens, right.tokens) >= 0.92) {
        errors.push(`Near-duplicate stems ${left.id} and ${right.id}`);
      }
    }
  }
}

function detectEditorialReuse(questions, errors) {
  const explanationOwners = new Map();
  for (const question of questions) {
    for (const option of question.options ?? []) {
      const normalized = normalizeText(option.explanation);
      if (normalized.length < 30) continue;
      const previous = explanationOwners.get(normalized);
      if (
        previous &&
        previous.questionId !== question.id &&
        previous.contentKey !== question.contentKey
      ) {
        errors.push(
          `Repeated option explanation ${previous.questionId}:${previous.optionId} and ${question.id}:${option.id}`
        );
      } else {
        explanationOwners.set(normalized, {
          questionId: question.id,
          optionId: option.id,
          contentKey: question.contentKey,
        });
      }
    }
  }
}

function validateCommon(item, conceptIds, errors) {
  if (!hasText(item.id)) errors.push('Content item is missing an id');
  if (!hasText(item.contentKey)) errors.push(`${item.id ?? 'unknown'} is missing contentKey`);
  if (!Number.isInteger(item.version) || item.version < 1)
    errors.push(`${item.id} has an invalid version`);
  if (!CONTENT_LIFECYCLE.includes(item.status))
    errors.push(`${item.id} has an invalid lifecycle status`);
  if (!CONTENT_DIFFICULTIES.includes(item.difficulty))
    errors.push(`${item.id} has an invalid difficulty`);
  if (!Array.isArray(item.conceptIds) || item.conceptIds.length === 0) {
    errors.push(`${item.id} must map to at least one concept`);
  } else {
    for (const conceptId of item.conceptIds) {
      if (!conceptIds.has(conceptId))
        errors.push(`${item.id} maps to unknown concept ${conceptId}`);
    }
  }
  if (!Array.isArray(item.sources) || item.sources.length === 0) {
    errors.push(`${item.id} needs an authoritative source`);
  } else {
    for (const source of item.sources) {
      if (!hasText(source.title) || source.kind !== 'authoritative' || !isHttpsUrl(source.url)) {
        errors.push(`${item.id} has an invalid authoritative source`);
      }
    }
  }
  if (
    item.status === 'active' &&
    (!hasText(item.review?.reviewedBy) || !hasText(item.review?.reviewedAt))
  ) {
    errors.push(`${item.id} is active without review evidence`);
  }
}

function validateBlitzQuestion(question, conceptIds, errors) {
  validateCommon(question, conceptIds, errors);
  if (!BLITZ_TOPICS.includes(question.topic))
    errors.push(`${question.id} has an unsupported topic`);
  if (!hasText(question.stem)) errors.push(`${question.id} has no stem`);
  if (!hasText(question.primaryConceptId) || !conceptIds.has(question.primaryConceptId)) {
    errors.push(`${question.id} has no canonical primary concept`);
  } else if (!question.conceptIds.includes(question.primaryConceptId)) {
    errors.push(`${question.id} primary concept must appear in conceptIds`);
  }
  if (!hasText(question.explanation)) errors.push(`${question.id} has no authored explanation`);
  const normalizedStem = normalizeText(question.stem);
  if (
    normalizedStem.startsWith('an incident review requires') ||
    normalizedStem.startsWith('a production system requires')
  ) {
    errors.push(`${question.id} uses a rejected Cartesian question template`);
  }
  if (!Array.isArray(question.options) || question.options.length < 3) {
    errors.push(`${question.id} needs at least three options`);
    return;
  }
  const optionIds = question.options.map(({ id }) => id);
  const labels = question.options.map(({ label }) => label.trim().toLocaleLowerCase());
  if (duplicateValues(optionIds).length > 0 || duplicateValues(labels).length > 0) {
    errors.push(`${question.id} has duplicate options`);
  }
  if (!optionIds.includes(question.correctOptionId))
    errors.push(`${question.id} has no defensible option key`);
  const normalizedExplanations = [];
  for (const option of question.options) {
    if (/```|\r|\n/.test(option.label) || option.label.length > 180) {
      errors.push(`${question.id}:${option.id ?? 'unknown'} uses a code block as an answer option`);
    }
    const explanation = normalizeText(option.explanation);
    normalizedExplanations.push(explanation);
    if (!hasText(option.explanation) || explanation.length < 30) {
      errors.push(`${question.id}:${option.id ?? 'unknown'} has no authored option explanation`);
    }
    if (/^(this|it|that) (is|was) (incorrect|wrong|correct|right)$/.test(explanation)) {
      errors.push(`${question.id}:${option.id ?? 'unknown'} has a generic option explanation`);
    }
    if (
      explanation.includes('the direct mechanism for the stated production requirement') ||
      explanation.includes('this choice concerns another mechanism and does not establish')
    ) {
      errors.push(`${question.id}:${option.id ?? 'unknown'} uses rejected templated reasoning`);
    }
  }
  if (duplicateValues(normalizedExplanations).length > 0) {
    errors.push(`${question.id} repeats an option explanation`);
  }
  if (question.variantKey !== undefined && question.variantKey !== null) {
    if (!hasText(question.generator?.id) || !Number.isInteger(question.generator?.seed)) {
      errors.push(`${question.id} has invalid deterministic variant metadata`);
    }
    if (!hasText(question.generator?.verification)) {
      errors.push(`${question.id} has no mechanical variant verification`);
    }
  }
}

function validateTradeoffProblem(problem, conceptIds, errors) {
  validateCommon(problem, conceptIds, errors);
  if (!hasText(problem.prompt) || !hasText(problem.hiddenTwist)) {
    errors.push(`${problem.id} needs both a prompt and hidden twist`);
  }
  if (!Array.isArray(problem.allowedArtifacts) || problem.allowedArtifacts.length === 0) {
    errors.push(`${problem.id} needs allowed artifact types`);
  }
  if (!Array.isArray(problem.rubric) || problem.rubric.length < 3) {
    errors.push(`${problem.id} needs at least three rubric criteria`);
  } else {
    for (const criterion of problem.rubric) {
      if (!hasText(criterion.id) || !hasText(criterion.label) || !hasText(criterion.evidence)) {
        errors.push(`${problem.id} has an incomplete rubric criterion`);
      }
    }
  }
}

export function validateSoftwareWarsContent(
  { blitzQuestions, tradeoffProblems, aiOpponents, aiAnswers },
  { knownConceptIds = [], enforceLaunchThresholds = false } = {}
) {
  const errors = [];
  const conceptIds = new Set(knownConceptIds);
  const allItems = [...blitzQuestions, ...tradeoffProblems];
  const duplicateIds = duplicateValues(allItems.map(({ id }) => id));
  for (const id of duplicateIds) errors.push(`Duplicate content id ${id}`);

  for (const question of blitzQuestions) validateBlitzQuestion(question, conceptIds, errors);
  for (const problem of tradeoffProblems) validateTradeoffProblem(problem, conceptIds, errors);

  const activeQuestions = blitzQuestions.filter(({ status }) => status === 'active');
  const activeProblems = tradeoffProblems.filter(({ status }) => status === 'active');
  const activeOpponents = aiOpponents.filter(({ status }) => status === 'active');
  const opponentIds = new Set(aiOpponents.map(({ id }) => id));
  const questionIds = new Set(activeQuestions.map(({ id }) => id));
  const answerKeys = new Set();

  detectQuestionCollisions(activeQuestions, errors);
  detectEditorialReuse(activeQuestions, errors);

  for (const opponent of aiOpponents) {
    if (!hasText(opponent.id) || !hasText(opponent.modelName) || !hasText(opponent.modelSnapshot)) {
      errors.push('AI opponent has incomplete version identity');
    }
    if (!Number.isInteger(opponent.publishedRating) || opponent.publishedRating <= 0) {
      errors.push(`${opponent.id} has an invalid fixed rating`);
    }
  }

  for (const answer of aiAnswers) {
    const key = `${answer.aiOpponentId}:${answer.questionId}`;
    if (answerKeys.has(key)) errors.push(`Duplicate AI answer ${key}`);
    answerKeys.add(key);
    if (!opponentIds.has(answer.aiOpponentId))
      errors.push(`AI answer references unknown opponent ${answer.aiOpponentId}`);
    if (!questionIds.has(answer.questionId))
      errors.push(`AI answer references inactive question ${answer.questionId}`);
    const question = activeQuestions.find(({ id }) => id === answer.questionId);
    if (question && !question.options.some(({ id }) => id === answer.selectedOptionId)) {
      errors.push(`AI answer ${key} selects an unknown option`);
    }
    if (!hasText(answer.explanation)) errors.push(`AI answer ${key} needs a stored explanation`);
  }

  for (const opponent of activeOpponents) {
    for (const question of activeQuestions) {
      if (!answerKeys.has(`${opponent.id}:${question.id}`)) {
        errors.push(`Missing AI coverage for ${opponent.id}:${question.id}`);
      }
    }
  }

  if (activeQuestions.length > 0 && activeOpponents.length === 0) {
    errors.push('Active Blitz content requires at least one active precomputed AI opponent');
  }

  if (enforceLaunchThresholds) {
    const distinctContentKeys = new Set(activeQuestions.map(({ contentKey }) => contentKey));
    if (distinctContentKeys.size < RANKED_LAUNCH_MINIMUMS.distinctBlitzQuestions) {
      errors.push(
        `Ranked Blitz requires ${RANKED_LAUNCH_MINIMUMS.distinctBlitzQuestions} distinct active questions; found ${distinctContentKeys.size}`
      );
    }
    for (const topic of BLITZ_TOPICS) {
      const topicQuestions = activeQuestions.filter((question) => question.topic === topic);
      const topicContentKeys = new Set(topicQuestions.map(({ contentKey }) => contentKey));
      if (topicContentKeys.size < RANKED_LAUNCH_MINIMUMS.blitzQuestionsPerTopic) {
        errors.push(
          `Ranked Blitz topic ${topic} requires ${RANKED_LAUNCH_MINIMUMS.blitzQuestionsPerTopic} distinct questions; found ${topicContentKeys.size}`
        );
      }
      const sourceUrls = new Set(
        topicQuestions.flatMap(({ sources }) => sources.map(({ url }) => url))
      );
      if (sourceUrls.size < 8) {
        errors.push(
          `Ranked Blitz topic ${topic} requires at least 8 precise source URLs; found ${sourceUrls.size}`
        );
      }
      const answerPositions = Object.fromEntries(
        ['a', 'b', 'c', 'd'].map((optionId) => [
          optionId,
          topicQuestions.filter(({ correctOptionId }) => correctOptionId === optionId).length,
        ])
      );
      if (Object.values(answerPositions).some((count) => count < 20 || count > 30)) {
        errors.push(
          `Ranked Blitz topic ${topic} has imbalanced answer positions ${JSON.stringify(answerPositions)}`
        );
      }
      for (const difficulty of CONTENT_DIFFICULTIES) {
        const requiredCount =
          RANKED_LAUNCH_MINIMUMS.blitzQuestionsPerDifficultyPerTopic[difficulty];
        const count = new Set(
          topicQuestions
            .filter((question) => question.difficulty === difficulty)
            .map(({ contentKey }) => contentKey)
        ).size;
        if (count !== requiredCount) {
          errors.push(
            `Ranked Blitz topic ${topic}/${difficulty} requires exactly ${requiredCount} distinct questions; found ${count}`
          );
        }
      }
    }
    if (activeProblems.length < RANKED_LAUNCH_MINIMUMS.tradeoffProblems) {
      errors.push(
        `Ranked Tradeoff requires ${RANKED_LAUNCH_MINIMUMS.tradeoffProblems} active problems; found ${activeProblems.length}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    report: {
      authoredCandidateBlitzQuestions: new Set(blitzQuestions.map(({ contentKey }) => contentKey))
        .size,
      activeBlitzQuestions: activeQuestions.length,
      distinctAuthoredBlitzQuestions: new Set(activeQuestions.map(({ contentKey }) => contentKey))
        .size,
      generatedBlitzVariants: activeQuestions.filter(
        ({ variantKey }) => variantKey !== undefined && variantKey !== null
      ).length,
      optionsWithExplanations: activeQuestions
        .flatMap(({ options }) => options)
        .filter(({ explanation }) => hasText(explanation)).length,
      candidateOptionsWithExplanations: blitzQuestions
        .flatMap(({ options }) => options)
        .filter(({ explanation }) => hasText(explanation)).length,
      activeTradeoffProblems: activeProblems.length,
      activeAiOpponents: activeOpponents.length,
      conceptsCovered: new Set(allItems.flatMap(({ conceptIds: ids }) => ids)).size,
      topicsCovered: new Set(activeQuestions.map(({ topic }) => topic)).size,
      difficultiesCovered: new Set(
        activeQuestions.map(({ difficulty }) => difficulty).filter(Boolean)
      ).size,
      questionsByTopic: Object.fromEntries(
        BLITZ_TOPICS.map((topic) => [
          topic,
          new Set(
            activeQuestions
              .filter((question) => question.topic === topic)
              .map(({ contentKey }) => contentKey)
          ).size,
        ])
      ),
      aiAnswers: aiAnswers.length,
    },
  };
}

export function assertValidSoftwareWarsContent(content, options) {
  const result = validateSoftwareWarsContent(content, options);
  if (!result.valid) {
    throw new Error(`Software Wars content validation failed:\n- ${result.errors.join('\n- ')}`);
  }
  return result.report;
}
