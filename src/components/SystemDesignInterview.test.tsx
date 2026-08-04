import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { SYSTEM_DESIGN_CASES } from '../data/system-design-cases';
import { resolveCaseId, SystemDesignCaseSelector } from './SystemDesignInterview';

describe('system-design case selector', () => {
  it('groups all twenty cases and exposes guide availability', () => {
    const html = renderToStaticMarkup(
      <SystemDesignCaseSelector activeCaseId="llm-inference-10k-rps" onSelect={vi.fn()} />
    );

    for (const label of [
      'AI systems',
      'Social and real-time',
      'Media and collaboration',
      'Infrastructure and storage',
      'Commerce and marketplaces',
    ]) {
      expect(html).toContain(label);
    }
    for (const caseDefinition of SYSTEM_DESIGN_CASES) expect(html).toContain(caseDefinition.title);
    expect(html.match(/Guide \+ practice/g)).toHaveLength(7);
    expect(html.match(/Practice only/g)).toHaveLength(13);
  });

  it('preserves direct prompt IDs and legacy mock aliases', () => {
    expect(resolveCaseId('video-streaming-platform')).toBe('video-streaming-platform');
    expect(resolveCaseId('mock-url-shortener')).toBe('url-shortener');
    expect(resolveCaseId('unknown-case')).toBe('llm-inference-10k-rps');
  });
});
