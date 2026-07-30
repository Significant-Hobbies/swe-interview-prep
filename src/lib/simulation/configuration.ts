import type {
  ConfigurationChallenge,
  ConfigurationCheckResult,
  ConfigurationSlotDefinition,
} from './types';

export type ConfigurationFiles = Record<string, string>;

function nextConfigurationLine(content: string, slot: ConfigurationSlotDefinition): string | null {
  const lines = content.split(/\r?\n/);
  const markerIndex = lines.findIndex((line) => line.trim() === slot.marker);
  if (markerIndex === -1) return null;
  for (let index = markerIndex + 1; index < lines.length; index += 1) {
    const candidate = lines[index].trim();
    if (candidate.length > 0) return candidate;
  }
  return null;
}

export function initialConfigurationFiles(challenge: ConfigurationChallenge): ConfigurationFiles {
  return Object.fromEntries(challenge.files.map((file) => [file.id, file.starter]));
}

export function validateConfiguration(
  challenge: ConfigurationChallenge,
  files: ConfigurationFiles
): ConfigurationCheckResult[] {
  return challenge.slots.map((slot) => {
    const actualLine = nextConfigurationLine(files[slot.fileId] ?? '', slot);
    return {
      id: slot.id,
      label: slot.label,
      passed: actualLine === slot.expectedLine.trim(),
      hint: slot.hint,
      evidence: slot.evidence,
      actualLine,
    };
  });
}

export function configurationPassed(results: ConfigurationCheckResult[]): boolean {
  return results.length > 0 && results.every((result) => result.passed);
}
