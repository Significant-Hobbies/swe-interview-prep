function parseJson(value, fallback) {
  if (value == null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function hash(value) {
  let first = 2166136261;
  let second = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    first = Math.imul(first ^ value.charCodeAt(index), 16777619);
    second = Math.imul(second ^ value.charCodeAt(index), 2246822519);
  }
  return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0).toString(16).padStart(8, '0')}`;
}

const SOURCE_ID = 'reader';

function source(itemCount, syncStatus) {
  return {
    id: SOURCE_ID,
    kind: 'reader',
    label: 'Reader',
    description: 'Private saved blogs and articles.',
    canonicalUrl: 'https://read.significanthobbies.com',
    itemCount,
    syncStatus,
  };
}

function assertReaderExport(payload) {
  if (
    !payload ||
    payload.format !== 'reader-export' ||
    payload.formatVersion !== 1 ||
    typeof payload.exportedAt !== 'string' ||
    !Array.isArray(payload?.tables?.articles)
  ) {
    throw new Error('Unsupported Reader export');
  }
}

export function buildReaderLearningSnapshot(payload) {
  const articles = Array.isArray(payload?.tables?.articles) ? payload.tables.articles : [];
  const rawItems = articles.flatMap((article) => {
    if (!article?.id || !article?.title || !article?.url) return [];
    const tags = parseJson(article.tags, []);
    const summaryData = parseJson(article.summary, {});
    const keyPoints = parseJson(article.keyPoints ?? article.key_points, []);
    const summary =
      summaryData?.short ||
      summaryData?.medium ||
      `${article.siteName || article.site_name || 'Saved article'}${article.byline ? ` by ${article.byline}` : ''}`;
    const answer = keyPoints?.[0] || summaryData?.short || '';
    const fingerprint = hash(
      JSON.stringify({
        id: article.id,
        url: article.url,
        title: article.title,
        summary,
        tags,
        keyPoints,
        updatedAt: article.updatedAt ?? article.updated_at,
      })
    );
    return [
      {
        id: `reader:${article.id}`,
        sourceId: 'reader',
        sourceKind: 'reader',
        title: article.title,
        summary,
        canonicalUrl: article.url,
        tracks: Array.isArray(tags) ? tags : [],
        format: article.type || 'article',
        estimatedMinutes: article.readingTimeMinutes ?? article.reading_time_minutes ?? 15,
        publishedAt: article.updatedAt ?? article.updated_at ?? undefined,
        fingerprint,
        answer,
        explanation: summaryData?.short || answer,
      },
    ];
  });

  const items = rawItems.map((item, index) => {
    const peers = rawItems.filter((candidate) => candidate.id !== item.id && candidate.answer);
    const distractors = [];
    for (let offset = 0; offset < peers.length && distractors.length < 3; offset += 1) {
      const answer = peers[(index + offset) % peers.length].answer;
      if (answer !== item.answer && !distractors.includes(answer)) distractors.push(answer);
    }
    const { answer, explanation, ...clean } = item;
    if (!answer || distractors.length < 2) return clean;
    const options = [answer, ...distractors].slice(0, 4);
    const rotation = Number.parseInt(item.fingerprint.slice(0, 2), 16) % options.length;
    const rotated = [...options.slice(rotation), ...options.slice(0, rotation)];
    return {
      ...clean,
      assessments: [
        {
          id: `${item.id}:mcq:1`,
          type: 'mcq',
          question: `Which takeaway belongs to the saved article “${item.title}”?`,
          options: rotated,
          correctIndex: rotated.indexOf(answer),
          explanation: explanation || answer,
          sourceFingerprint: item.fingerprint,
          generator: 'reader-export-v1',
        },
      ],
    };
  });

  return {
    source: source(items.length, 'fresh'),
    items,
  };
}

export async function syncReaderLearningFeed({
  fetchImpl,
  url,
  token,
  previousSnapshot,
  signal = AbortSignal.timeout(10_000),
}) {
  try {
    if (!token) throw new Error('Reader learning source is not configured');
    const response = await fetchImpl(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal,
    });
    if (!response.ok) throw new Error(`Reader export returned ${response.status}`);
    const payload = await response.json();
    assertReaderExport(payload);
    return buildReaderLearningSnapshot(payload);
  } catch (error) {
    const previousItems = (previousSnapshot?.items || []).filter(
      (item) => item.sourceId === SOURCE_ID
    );
    return {
      source: source(previousItems.length, 'stale'),
      items: previousItems,
      warning: error instanceof Error ? error.message : String(error),
    };
  }
}
