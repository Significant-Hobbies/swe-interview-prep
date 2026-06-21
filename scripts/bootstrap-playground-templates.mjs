#!/usr/bin/env node
/** Append generic playground scaffolds for artifacts missing templates. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tplPath = path.join(__dirname, '../src/data/playground-templates.ts');
const artifacts = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/artifacts.json'), 'utf8'),
).artifacts;

const existing = new Set([...fs.readFileSync(tplPath, 'utf8').matchAll(/artifactId: '([^']+)'/g)].map(m => m[1]));
const missing = artifacts.filter(a => !existing.has(a.id));

if (!missing.length) {
  console.log('All artifacts already have templates.');
  process.exit(0);
}

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

const blocks = missing.map(a => {
  const criteria = a.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const isDesign = a.type === 'design-doc';
  const code = isDesign
    ? `// Design doc artifact — use the Problem panel + Draw panel for architecture.

/*
Deliverables:
${a.deliverables.map(d => `- ${d}`).join('\n')}
*/

const checklist = ${JSON.stringify(a.successCriteria, null, 2)};

console.log('Success criteria:', checklist.length);
console.log('Mark each criterion in Build Lab when done.');
`
    : `// Scaffold for: ${a.title}
// ${a.description}

function main() {
  // TODO: implement core mechanism
  console.log('${a.id}: replace with real implementation');
}

main();
`;
  return `  {
    artifactId: '${a.id}',
    title: '${esc(a.title)}',
    language: 'typescript',
    problem: \`# ${esc(a.title)}

${esc(a.description)}

## Success criteria
${esc(criteria)}

## Deliverables
${esc(a.deliverables.map(d => `- ${d}`).join('\\n'))}

**Gym rules:** Run code, change parameters, ship when criteria are met.\`,
    code: \`${esc(code)}\`,
  }`;
});

const insertMarker = '];\n\nconst BY_ID';
const content = fs.readFileSync(tplPath, 'utf8');
const idx = content.indexOf(insertMarker);
if (idx === -1) throw new Error('Could not find TEMPLATES array end');

// Insert before the closing `];` — prior entry already ends with `},`
const updated =
  content.slice(0, idx) +
  '\n' +
  blocks.join(',\n') +
  '\n' +
  content.slice(idx);

fs.writeFileSync(tplPath, updated);
console.log(`Added ${missing.length} playground templates:`, missing.map(a => a.id).join(', '));