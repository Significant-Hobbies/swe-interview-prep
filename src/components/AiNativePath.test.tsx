import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ROADMAP_BY_ID } from '../data/learning-os';
import { AI_NATIVE_PATH_STAGES } from '../data/ai-native-path';
import AiNativePath from './AiNativePath';

describe('AI-native path orientation', () => {
  it('links four ordered stages to existing learning and practice surfaces', () => {
    expect(AI_NATIVE_PATH_STAGES.map((stage) => stage.id)).toEqual([
      'foundations',
      'dsa',
      'ai-engineering',
      'system-design',
    ]);
    expect(AI_NATIVE_PATH_STAGES.map((stage) => stage.kind)).toEqual([
      'foundation',
      'parallel',
      'parallel',
      'synthesis',
    ]);
    for (const stage of AI_NATIVE_PATH_STAGES) {
      expect(ROADMAP_BY_ID[stage.roadmapId], stage.roadmapId).toBeTruthy();
    }
  });

  it('renders parallel semantics and makes evaluation judgment explicit', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <AiNativePath />
      </MemoryRouter>
    );

    expect(html).toContain('aria-label="Parallel tracks: study both"');
    expect(html).toContain('data-emphasis="evaluation-judgment"');
    expect(html).toContain('Evaluation judgment:');
    expect(html).toContain('accept, reject, or escalate model output');
    expect(html).toContain('href="/roadmaps/systems-foundations-12w"');
    expect(html).toContain('href="/roadmaps/dsa-practice"');
    expect(html).toContain('href="/roadmaps/ai-infra-12-month"');
    expect(html).toContain('href="/roadmaps/hld-practice"');
    expect(html).toContain('href="/roadmaps/ai-reliability-12w"');
    expect(html).toContain('href="/mock?kind=system-design"');
  });
});
