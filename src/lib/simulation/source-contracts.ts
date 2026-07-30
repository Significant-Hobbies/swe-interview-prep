import { createSimulation, reduceSimulation } from './engine';
import type {
  ScalarValue,
  SourceContractFixture,
  SourceContractMismatch,
  SystemsLabDefinition,
} from './types';

function readPath(value: unknown, path: string): ScalarValue | undefined {
  let current = value;
  for (const segment of path.split('.')) {
    if (!current || typeof current !== 'object' || !(segment in current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current === null || ['string', 'number', 'boolean'].includes(typeof current)
    ? (current as ScalarValue)
    : undefined;
}

export function verifySourceContract(
  lab: SystemsLabDefinition,
  fixture: SourceContractFixture
): SourceContractMismatch[] {
  if (fixture.labId !== lab.id) {
    throw new Error(`Source contract "${fixture.id}" does not belong to lab "${lab.id}".`);
  }
  if (!lab.provenance.some((record) => record.id === fixture.provenanceId)) {
    throw new Error(
      `Source contract "${fixture.id}" references unknown provenance "${fixture.provenanceId}".`
    );
  }

  const snapshot = reduceSimulation(lab, createSimulation(lab, fixture.scenarioId), {
    type: 'finish',
  });
  return fixture.assertions.flatMap((assertion) => {
    const actual = readPath(snapshot, assertion.path);
    return actual === assertion.expected
      ? []
      : [
          {
            fixtureId: fixture.id,
            path: assertion.path,
            expected: assertion.expected,
            actual,
          },
        ];
  });
}
