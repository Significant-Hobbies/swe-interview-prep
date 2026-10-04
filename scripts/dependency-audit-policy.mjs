const temporaryBracesAdvisory = {
  expiresAt: Date.UTC(2026, 9, 18),
  id: 'GHSA-vfj7-8cjw-p6xm',
  moduleName: 'braces',
  patchedVersions: '<0.0.0',
  path: '.>@vercel/node>ts-morph>@ts-morph/common>fast-glob>micromatch>braces',
  version: '3.0.3',
  vulnerableVersions: '<=3.0.3',
};

export function isTemporarilyAcceptedBracesAdvisory(advisory, now = new Date()) {
  if (now.getTime() >= temporaryBracesAdvisory.expiresAt) return false;
  if (
    advisory.github_advisory_id !== temporaryBracesAdvisory.id ||
    advisory.module_name !== temporaryBracesAdvisory.moduleName ||
    advisory.severity !== 'high' ||
    advisory.vulnerable_versions !== temporaryBracesAdvisory.vulnerableVersions ||
    advisory.patched_versions !== temporaryBracesAdvisory.patchedVersions ||
    advisory.findings?.length !== 1
  ) {
    return false;
  }

  const [finding] = advisory.findings;
  return (
    finding.version === temporaryBracesAdvisory.version &&
    finding.paths?.length === 1 &&
    finding.paths[0] === temporaryBracesAdvisory.path
  );
}
