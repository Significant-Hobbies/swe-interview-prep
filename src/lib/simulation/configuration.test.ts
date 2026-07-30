import { describe, expect, it } from 'vitest';

import { systemsLabs } from '../../data/systems-labs';
import {
  configurationPassed,
  initialConfigurationFiles,
  validateConfiguration,
} from './configuration';
import type { ConfigurationChallenge } from './types';

function completedFiles(challenge: ConfigurationChallenge): Record<string, string> {
  const files = initialConfigurationFiles(challenge);
  for (const slot of challenge.slots) {
    const lines = files[slot.fileId].split(/\r?\n/);
    const markerIndex = lines.findIndex((line) => line.trim() === slot.marker);
    let valueIndex = markerIndex + 1;
    while (valueIndex < lines.length && lines[valueIndex].trim().length === 0) {
      valueIndex += 1;
    }
    lines[valueIndex] = `${lines[valueIndex].match(/^\s*/)?.[0] ?? ''}${slot.expectedLine}`;
    files[slot.fileId] = lines.join('\n');
  }
  return files;
}

describe('systems lab configuration challenges', () => {
  it('starts every workshop in a meaningfully broken state', () => {
    for (const lab of systemsLabs) {
      const results = validateConfiguration(
        lab.configurationChallenge,
        initialConfigurationFiles(lab.configurationChallenge)
      );
      expect(configurationPassed(results), lab.id).toBe(false);
      expect(
        results.some((result) => !result.passed),
        lab.id
      ).toBe(true);
    }
  });

  it('accepts a repaired configuration for all three infrastructure fields', () => {
    for (const lab of systemsLabs) {
      const results = validateConfiguration(
        lab.configurationChallenge,
        completedFiles(lab.configurationChallenge)
      );
      expect(
        results.filter((result) => !result.passed),
        lab.id
      ).toEqual([]);
      expect(configurationPassed(results), lab.id).toBe(true);
    }
  });

  it('fails the exact contract when one repaired line is mutated', () => {
    for (const lab of systemsLabs) {
      const files = completedFiles(lab.configurationChallenge);
      const mutation = lab.configurationChallenge.slots[0];
      files[mutation.fileId] = files[mutation.fileId].replace(
        mutation.expectedLine,
        'mutated: incorrect'
      );
      const results = validateConfiguration(lab.configurationChallenge, files);

      expect(results.find((result) => result.id === mutation.id)).toMatchObject({
        passed: false,
        actualLine: 'mutated: incorrect',
      });
      expect(configurationPassed(results)).toBe(false);
    }
  });
});
