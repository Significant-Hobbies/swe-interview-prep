import { readFileSync } from 'node:fs';
import { loadSoftwareWarsContent } from '../shared/data/software-wars/index.mjs';
import { assertValidSoftwareWarsContent } from '../shared/data/software-wars/validate-content.mjs';

const conceptsDocument = JSON.parse(
  readFileSync(new URL('../src/data/concepts.json', import.meta.url), 'utf8')
);
const knownConceptIds = conceptsDocument.concepts.map(({ id }) => id);
const enforceLaunchThresholds = !process.argv.includes('--preview');
const report = assertValidSoftwareWarsContent(loadSoftwareWarsContent(), {
  knownConceptIds,
  enforceLaunchThresholds,
});

console.log(
  JSON.stringify({ mode: enforceLaunchThresholds ? 'ranked' : 'preview', ...report }, null, 2)
);
