import { createHash } from 'node:crypto';

export const DEFAULT_HIGH_SIGNAL_FEED_URL =
  'https://high-signal-api.sarthakagrawal927.workers.dev/learning/daily';

const SOURCE_ID = 'high-signal';

function fingerprint(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function source(itemCount, syncStatus) {
  return {
    id: SOURCE_ID,
    kind: 'briefing',
    label: 'High Signal: Daily Brief',
    description: 'Source-backed technology, startup, market, and product briefing.',
    canonicalUrl: 'https://highsignal.app/brief',
    itemCount,
    syncStatus,
  };
}

export function mapHighSignalFeed(feed) {
  if (
    !feed ||
    feed.schema !== 'high-signal.learning-brief.v1' ||
    !Array.isArray(feed.items) ||
    typeof feed.generatedAt !== 'string'
  ) {
    throw new Error('Unsupported High Signal learning feed');
  }

  const items = feed.items.map((item) => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.summary !== 'string' ||
      typeof item.canonicalUrl !== 'string' ||
      !item.canonicalUrl.startsWith('https://') ||
      !Array.isArray(item.tracks)
    ) {
      throw new Error('Invalid High Signal learning item');
    }
    const citations = Array.isArray(item.citations)
      ? item.citations
          .filter((citation) => citation?.url?.startsWith('https://'))
          .map((citation) => ({
            title: citation.source || 'Source',
            url: citation.url,
            type: 'source',
          }))
      : [];
    return {
      id: `briefing:high-signal:${item.id}`,
      sourceId: SOURCE_ID,
      sourceKind: 'briefing',
      title: item.title,
      summary: item.summary,
      canonicalUrl: item.canonicalUrl,
      tracks: [...new Set(item.tracks.filter((track) => typeof track === 'string' && track))],
      resources: citations,
      format: 'daily-brief',
      estimatedMinutes: 5,
      publishedAt: item.publishedAt || feed.generatedAt,
      fingerprint: fingerprint(JSON.stringify(item)),
    };
  });

  return { source: source(items.length, 'fresh'), items };
}

export async function syncHighSignalFeed({ fetchImpl, url, previousSnapshot }) {
  try {
    const response = await fetchImpl(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`High Signal feed returned ${response.status}`);
    return mapHighSignalFeed(await response.json());
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
