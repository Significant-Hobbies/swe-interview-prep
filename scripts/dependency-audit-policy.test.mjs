import assert from 'node:assert/strict';
import test from 'node:test';
import { isTemporarilyAcceptedBracesAdvisory } from './dependency-audit-policy.mjs';

const knownFinding = {
  github_advisory_id: 'GHSA-vfj7-8cjw-p6xm',
  module_name: 'braces',
  severity: 'high',
  vulnerable_versions: '<=3.0.3',
  patched_versions: '<0.0.0',
  findings: [
    {
      version: '3.0.3',
      paths: ['.>@vercel/node>ts-morph>@ts-morph/common>fast-glob>micromatch>braces'],
    },
  ],
};

test('temporarily accepts only the known braces advisory finding before expiry', () => {
  assert.equal(
    isTemporarilyAcceptedBracesAdvisory(knownFinding, new Date('2026-10-17T23:59:59Z')),
    true
  );
});

test('rejects the advisory at expiry', () => {
  assert.equal(
    isTemporarilyAcceptedBracesAdvisory(knownFinding, new Date('2026-10-18T00:00:00Z')),
    false
  );
});

test('rejects changed versions, paths, and additional findings', () => {
  assert.equal(
    isTemporarilyAcceptedBracesAdvisory(
      { ...knownFinding, findings: [{ ...knownFinding.findings[0], version: '3.0.2' }] },
      new Date('2026-10-04T00:00:00Z')
    ),
    false
  );
  assert.equal(
    isTemporarilyAcceptedBracesAdvisory(
      { ...knownFinding, findings: [{ ...knownFinding.findings[0], paths: ['.>unexpected>braces'] }] },
      new Date('2026-10-04T00:00:00Z')
    ),
    false
  );
  assert.equal(
    isTemporarilyAcceptedBracesAdvisory(
      { ...knownFinding, findings: [...knownFinding.findings, ...knownFinding.findings] },
      new Date('2026-10-04T00:00:00Z')
    ),
    false
  );
  assert.equal(
    isTemporarilyAcceptedBracesAdvisory(
      { ...knownFinding, github_advisory_id: 'GHSA-other' },
      new Date('2026-10-04T00:00:00Z')
    ),
    false
  );
});
