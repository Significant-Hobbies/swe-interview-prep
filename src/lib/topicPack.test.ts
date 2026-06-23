import { describe, expect, it } from 'vitest';

import conceptsData from '../data/concepts.json';
import conceptPacksData from '../data/concept-packs.json';
import { CONCEPT_BY_ID, type Concept } from '../data/learning-os';
import type { TopicPack } from './topicPack';
import {
  buildTopicPack,
  classifyResource,
  packCompleteness,
  packHasCategory,
  writePromptForConcept,
} from './topicPack';

const concepts = (conceptsData as { concepts: Concept[] }).concepts;

describe('topicPack', () => {
  it('classifies resource types into media categories', () => {
    expect(
      classifyResource({
        title: 'x',
        url: 'https://arxiv.org/abs/123',
        type: 'paper',
      })
    ).toBe('paper');
    expect(
      classifyResource({
        title: 'x',
        url: 'https://www.youtube.com/watch?v=abc',
        type: 'video',
      })
    ).toBe('video');
    expect(
      classifyResource({
        title: 'x',
        url: 'https://nlp.stanford.edu/IR-book/html/htmledition/tokenization-1.html',
        type: 'doc',
      })
    ).toBe('book');
  });

  it('overflows duplicate media categories into more', () => {
    const pack = buildTopicPack({
      id: 'test',
      name: 'Test',
      tags: [],
      difficulty: 'intro',
      priority: 1,
      prerequisites: [],
      related: [],
      description: 'x',
      resources: [
        { title: 'Blog A', url: 'https://example.com/a', type: 'article' },
        { title: 'Blog B', url: 'https://example.com/b', type: 'article' },
      ],
    } as Concept);
    expect(packHasCategory(pack, 'blog')).toBe(true);
    expect(pack.items.filter((i) => i.category === 'more').map((i) => i.url)).toContain(
      'https://example.com/b'
    );
  });

  it('builds items with category, title, and url', () => {
    const pack = buildTopicPack(CONCEPT_BY_ID['probability-fundamentals']);
    expect(pack.items.length).toBeGreaterThan(0);
    for (const item of pack.items) {
      expect(item.category).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(typeof item.url).toBe('string');
    }
    expect(pack.items.some((i) => i.category === 'write' && i.body)).toBe(true);
  });

  it('builds write prompt from mental model', () => {
    const c = CONCEPT_BY_ID['ml-self-attention'];
    const prompt = writePromptForConcept(c);
    expect(prompt).toContain('Self-Attention');
    expect(prompt.length).toBeGreaterThan(40);
  });

  it('every concept has a generated pack with items array', () => {
    const packs = (conceptPacksData as { packs: Record<string, TopicPack> }).packs;
    for (const c of concepts) {
      const pack = packs[c.id];
      expect(Array.isArray(pack?.items), c.id).toBe(true);
    }
  });

  it('majority of concepts have at least four primary categories', () => {
    const packs = (conceptPacksData as { packs: Record<string, TopicPack> }).packs;
    let ok = 0;
    for (const c of concepts) {
      const { filled } = packCompleteness(packs[c.id]);
      if (filled >= 4) ok++;
    }
    expect(ok / concepts.length).toBeGreaterThan(0.7);
  });
});
