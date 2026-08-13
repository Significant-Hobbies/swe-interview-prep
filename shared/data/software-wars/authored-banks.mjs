import batchA from './banks/batch-a.json' with { type: 'json' };
import batchB from './banks/batch-b.json' with { type: 'json' };
import batchC from './banks/batch-c.json' with { type: 'json' };
import { compileAuthoredBank } from './authored-question.mjs';

export const blitzQuestions = Object.freeze([
  ...compileAuthoredBank([...batchA, ...batchB, ...batchC], {
    status: 'active',
    reviewedBy: 'software-wars-independent-editorial-audit-v3',
  }),
]);
