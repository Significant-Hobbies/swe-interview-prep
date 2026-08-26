import { describe, expect, it } from 'vitest';

import {
  buildRoleFitPrompt,
  fingerprintRoleFitSource,
  RoleFitValidationError,
  validateRoleFitAnalysis,
  validateRoleFitInput,
} from './role-fit.mjs';

const jobDescription = `We are hiring a Senior Backend Engineer.
You will design reliable APIs and build idempotent distributed workflows.
Kubernetes experience is required. Experience with payroll compliance is preferred.`;

function validAnalysis() {
  return {
    roleTitle: 'Senior Backend Engineer',
    summary: 'A backend role centered on reliable service design and production operation.',
    requirements: [
      {
        label: 'Reliable API design',
        importance: 'must',
        sourcePhrase: 'design reliable APIs',
        conceptIds: ['api-design', 'idempotency'],
        confidence: 0.95,
        rationale: 'The catalog directly covers API contracts and replay-safe request handling.',
      },
    ],
    unsupported: [
      {
        label: 'Payroll compliance',
        importance: 'preferred',
        sourcePhrase: 'payroll compliance',
        rationale: 'The curriculum does not cover payroll regulation.',
      },
    ],
  };
}

describe('role-fit grounded response validation', () => {
  it('keeps exact source evidence and canonical ids', () => {
    const result = validateRoleFitAnalysis(validAnalysis(), jobDescription);
    expect(result.requirements[0]).toMatchObject({
      id: 'requirement-1',
      sourcePhrase: 'design reliable APIs',
      conceptIds: ['api-design', 'idempotency'],
    });
    expect(result.unsupported[0].label).toBe('Payroll compliance');
  });

  it('removes unknown ids and honestly moves an empty mapping to unsupported', () => {
    const raw = validAnalysis();
    raw.requirements[0].conceptIds = ['invented-framework'];
    const result = validateRoleFitAnalysis(raw, jobDescription);
    expect(result.requirements).toEqual([]);
    expect(result.unsupported.map((item) => item.label)).toEqual([
      'Reliable API design',
      'Payroll compliance',
    ]);
  });

  it('rejects fabricated source phrases instead of presenting them as grounded', () => {
    const raw = validAnalysis();
    raw.requirements[0].sourcePhrase = 'seven years of Rust';
    raw.unsupported = [];
    expect(() => validateRoleFitAnalysis(raw, jobDescription)).toThrow(RoleFitValidationError);
  });

  it('deduplicates repeated mappings and clamps confidence', () => {
    const raw = validAnalysis();
    raw.requirements[0].conceptIds = ['api-design', 'api-design'];
    raw.requirements[0].confidence = 4;
    const result = validateRoleFitAnalysis(raw, jobDescription);
    expect(result.requirements[0].conceptIds).toEqual(['api-design']);
    expect(result.requirements[0].confidence).toBe(1);
  });
});

describe('role-fit input and prompt boundary', () => {
  it('rejects empty and oversized input before provider work', () => {
    expect(() => validateRoleFitInput('short')).toThrow(/at least 40/i);
    expect(() => validateRoleFitInput('x'.repeat(20_001))).toThrow(/20,000/i);
  });

  it('builds a prompt from the canonical catalog', () => {
    const prompt = buildRoleFitPrompt({ jobDescription, roleTitle: 'Backend Engineer' });
    expect(prompt).toContain('api-design | API Design');
    expect(prompt).toContain(jobDescription);
  });

  it('fingerprints normalized source text without storing it', () => {
    expect(fingerprintRoleFitSource(jobDescription)).toBe(
      fingerprintRoleFitSource(`  ${jobDescription.replaceAll('\n', '   ')}  `)
    );
    expect(fingerprintRoleFitSource(jobDescription)).toMatch(/^rf-[a-f0-9]{8}$/);
  });
});
