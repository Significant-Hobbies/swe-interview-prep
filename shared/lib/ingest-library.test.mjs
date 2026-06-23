import { describe, expect, it } from 'vitest';
import {
  buildIngestedReviewQuestions,
  extractAnswerSnippet,
  ingestedReviewId,
  stripHtml,
} from './ingest-library.mjs';

describe('ingest-library', () => {
  it('stripHtml removes tags and collapses whitespace', () => {
    expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('extractAnswerSnippet requires minimum length', () => {
    expect(extractAnswerSnippet('Too short.')).toBe('');
    const long =
      'Load balancing spreads traffic across backends. It improves availability and throughput. ' +
      'Health checks remove bad nodes from rotation.';
    expect(extractAnswerSnippet(long).length).toBeGreaterThanOrEqual(80);
  });

  it('buildIngestedReviewQuestions dedupes and maps concepts', () => {
    const conceptIndex = {
      'load-balancing': [
        {
          repoId: 'system-design',
          repoName: 'System Design',
          sectionId: 'lb-1',
          title: 'Load Balancing',
        },
      ],
    };
    const repoContent = {
      'system-design': {
        sections: [
          {
            id: 'lb-1',
            title: 'Load Balancing',
            content:
              'A load balancer distributes incoming requests across multiple servers. ' +
              'This prevents any single machine from becoming a bottleneck and improves fault tolerance.',
          },
        ],
      },
    };
    const out = buildIngestedReviewQuestions({ conceptIndex, repoContent });
    expect(out).toHaveLength(1);
    expect(out[0].conceptId).toBe('load-balancing');
    expect(out[0].source).toBe('library');
    expect(out[0].id).toBe(ingestedReviewId('system-design', 'lb-1'));
  });
});
