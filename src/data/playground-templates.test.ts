import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

import artifactsData from './artifacts.json';
import { getPlaygroundTemplate, listMathPlaygroundTemplates } from './playground-templates';

const artifacts = (artifactsData as { artifacts: { id: string }[] }).artifacts;

describe('playground templates', () => {
  it('covers every artifact with a template', () => {
    const missing = artifacts.filter(a => !getPlaygroundTemplate(a.id));
    expect(missing.map(a => a.id)).toEqual([]);
  });

  it('returns null for unknown artifact ids', () => {
    expect(getPlaygroundTemplate('not-real')).toBeNull();
    expect(getPlaygroundTemplate(null)).toBeNull();
  });

  it('templates have code and problem text', () => {
    const tpl = getPlaygroundTemplate('simulate-random-processes');
    expect(tpl?.code.length).toBeGreaterThan(20);
    expect(tpl?.problem.length).toBeGreaterThan(20);
    expect(tpl?.language).toBe('typescript');
  });

  it('lists math templates as a non-empty subset', () => {
    const math = listMathPlaygroundTemplates();
    expect(math.length).toBeGreaterThan(0);
    expect(math.every(t => t.artifactId && t.title)).toBe(true);
  });

  it('artifact ids in templates are unique', () => {
    const src = readFileSync(resolve(__dirname, 'playground-templates.ts'), 'utf8');
    const ids = [...src.matchAll(/artifactId: '([^']+)'/g)].map(m => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});