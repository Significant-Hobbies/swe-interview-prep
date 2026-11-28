import { describe, expect, it } from 'vitest';

import { profileRows } from './learningRecordTypes';

describe('profileRows', () => {
  it('shows profile fields beyond the plain text lists', () => {
    const rows = profileRows({
      skills: [{ name: 'Rust', level: 'intermediate', notes: 'Side projects' }],
      experience: [{ role: 'Intern', organization: 'Acme', years: 0, summary: 'Search team' }],
      desiredDepth: [{ domain: 'Databases', targetLevel: 'advanced', why: 'Interviews' }],
      availableTime: { minutesPerDay: 30, minutesPerSession: 55, notes: 'Weekends' },
      timezone: 'Asia/Dubai',
    });
    expect(rows.map((row) => [row.label, row.value])).toEqual([
      ['Experience', 'Intern at Acme · 0 yrs — Search team'],
      ['Skills', 'Rust (intermediate, self-reported) — Side projects'],
      ['Desired depth', 'Databases: advanced — Interviews'],
      ['Available time', '30 min a day · 55 min a session · Weekends'],
      ['Timezone', 'Asia/Dubai'],
    ]);
  });
});
