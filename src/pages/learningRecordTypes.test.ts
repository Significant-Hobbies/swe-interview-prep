import { describe, expect, it } from 'vitest';

import { profileRows } from './learningRecordTypes';

describe('profileRows', () => {
  it('shows profile fields beyond the plain text lists', () => {
    const rows = profileRows({
      skills: [{ name: 'Rust', level: 'intermediate' }],
      experience: [{ role: 'Engineer', organization: 'Acme', years: 3 }],
      desiredDepth: [{ domain: 'Databases', targetLevel: 'advanced' }],
      timezone: 'Asia/Dubai',
    });
    expect(rows.map((row) => [row.label, row.value])).toEqual([
      ['Experience', 'Engineer at Acme · 3 yrs'],
      ['Skills', 'Rust (intermediate, self-reported)'],
      ['Desired depth', 'Databases: advanced'],
      ['Timezone', 'Asia/Dubai'],
    ]);
  });
});
